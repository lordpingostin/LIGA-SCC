const FIREBASE_APP_URL = "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
const FIREBASE_AUTH_URL = "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
const FIREBASE_STORE_URL = "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

let serviceState = {
  config: null,
  enabled: false,
  auth: null,
  db: null,
  provider: null,
  docRef: null,
  transferRequestsRef: null,
  modules: null,
};

function normalizeConfig(raw = {}) {
  return {
    enabled: Boolean(raw.enabled),
    leagueDocumentPath: raw.leagueDocumentPath || "leagues/scc-main",
    editorEmails: Array.isArray(raw.editorEmails)
      ? raw.editorEmails.map((email) => String(email || "").trim().toLowerCase()).filter(Boolean)
      : [],
    firebaseConfig: raw.firebaseConfig || {},
  };
}

function getDocPathSegments(path) {
  const segments = String(path || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (segments.length < 2 || segments.length % 2 !== 0) {
    throw new Error("leagueDocumentPath debe tener formato coleccion/documento, por ejemplo leagues/scc-main.");
  }

  return segments;
}

function hasFirebaseConfig(config) {
  const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];
  return requiredKeys.every((key) => String(config.firebaseConfig?.[key] || "").trim());
}

export function getFirebaseSetup() {
  return normalizeConfig(window.SCC_FIREBASE_CONFIG || {});
}

export function isEditor(user) {
  const email = String(user?.email || "").trim().toLowerCase();
  return Boolean(email) && serviceState.config?.editorEmails?.includes(email);
}

export async function initFirebase(callbacks = {}) {
  serviceState.config = getFirebaseSetup();
  serviceState.enabled = serviceState.config.enabled;

  if (!serviceState.enabled) {
    callbacks.onStatusChange?.({ type: "disabled", sourceLabel: "JSON publico" });
    callbacks.onUserChange?.({ user: null, canEdit: false });
    return { enabled: false, config: serviceState.config };
  }

  if (!hasFirebaseConfig(serviceState.config)) {
    callbacks.onStatusChange?.({ type: "error", sourceLabel: "JSON publico" });
    callbacks.onUserChange?.({ user: null, canEdit: false });
    throw new Error("Completa firebase-config.js con las credenciales de tu proyecto Firebase.");
  }

  callbacks.onStatusChange?.({ type: "connecting", sourceLabel: "JSON publico" });

  const [{ initializeApp }, authModule, firestoreModule] = await Promise.all([
    import(FIREBASE_APP_URL),
    import(FIREBASE_AUTH_URL),
    import(FIREBASE_STORE_URL),
  ]);

  const app = initializeApp(serviceState.config.firebaseConfig);
  const auth = authModule.getAuth(app);
  const db = firestoreModule.getFirestore(app);
  const provider = new authModule.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    await authModule.setPersistence(auth, authModule.browserLocalPersistence);
  } catch (error) {
    console.warn("No se pudo fijar la persistencia local de Firebase Auth.", error);
  }

  try {
    await authModule.getRedirectResult(auth);
  } catch (error) {
    console.warn("No se pudo recuperar el redirect de Firebase Auth.", error);
  }

  const docRef = firestoreModule.doc(db, ...getDocPathSegments(serviceState.config.leagueDocumentPath));

  serviceState.auth = auth;
  serviceState.db = db;
  serviceState.provider = provider;
  serviceState.docRef = docRef;
  serviceState.transferRequestsRef = firestoreModule.collection(db, "transferRequests");
  serviceState.modules = {
    ...authModule,
    ...firestoreModule,
  };

  authModule.onAuthStateChanged(auth, (user) => {
    callbacks.onUserChange?.({ user, canEdit: isEditor(user) });
  });

  firestoreModule.onSnapshot(
    docRef,
    (snapshot) => {
      const payload = snapshot.data()?.leagueData;
      if (payload) {
        callbacks.onLeagueData?.({ data: payload, sourceLabel: "Firestore en vivo" });
        callbacks.onStatusChange?.({ type: "live", sourceLabel: "Firestore en vivo" });
        return;
      }

      callbacks.onStatusChange?.({ type: "ready", sourceLabel: "JSON publico" });
    },
    (error) => {
      console.error(error);
      callbacks.onStatusChange?.({ type: "error", sourceLabel: "JSON publico" });
    }
  );

  callbacks.onStatusChange?.({ type: "ready", sourceLabel: "JSON publico" });
  return { enabled: true, config: serviceState.config };
}

export async function signInWithGoogle() {
  if (!serviceState.auth || !serviceState.provider || !serviceState.modules) {
    throw new Error("Firebase no esta listo.");
  }

  try {
    return await serviceState.modules.signInWithPopup(serviceState.auth, serviceState.provider);
  } catch (error) {
    const code = String(error?.code || "");
    if (code.includes("popup-blocked") || code.includes("popup-closed-by-user") || code.includes("web-storage-unsupported")) {
      await serviceState.modules.signInWithRedirect(serviceState.auth, serviceState.provider);
      return null;
    }

    throw error;
  }
}

export async function signOutUser() {
  if (!serviceState.auth || !serviceState.modules) {
    return;
  }

  await serviceState.modules.signOut(serviceState.auth);
}

export async function saveLeagueData(data, user) {
  if (!serviceState.enabled || !serviceState.docRef || !serviceState.modules) {
    throw new Error("Firebase no esta configurado para guardar.");
  }

  if (!isEditor(user)) {
    throw new Error("El correo actual no tiene permiso de edicion.");
  }

  await serviceState.modules.setDoc(
    serviceState.docRef,
    {
      leagueData: data,
      lastSavedBy: String(user?.email || "").trim(),
      lastSavedAt: serviceState.modules.serverTimestamp(),
    },
    { merge: false }
  );
}

export function subscribeTransferRequests(onData, onError) {
  if (!serviceState.enabled || !serviceState.transferRequestsRef || !serviceState.modules) {
    return () => {};
  }

  const requestQuery = serviceState.modules.query(
    serviceState.transferRequestsRef,
    serviceState.modules.orderBy("createdAt", "desc")
  );

  return serviceState.modules.onSnapshot(
    requestQuery,
    (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => ({
        docId: docSnapshot.id,
        ...docSnapshot.data(),
      }));
      onData?.(items);
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function createTransferRequest(payload) {
  if (!serviceState.enabled || !serviceState.transferRequestsRef || !serviceState.modules) {
    throw new Error("Firebase no esta configurado para recibir inscripciones.");
  }

  await serviceState.modules.addDoc(serviceState.transferRequestsRef, {
    playerId: String(payload.playerId || "").trim(),
    position: String(payload.position || "").trim(),
    phone: String(payload.phone || "").trim(),
    status: "Pendiente",
    submittedAt: new Date().toISOString(),
    createdAt: serviceState.modules.serverTimestamp(),
  });
}
