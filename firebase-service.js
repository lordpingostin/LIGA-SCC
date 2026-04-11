const FIREBASE_APP_URL = "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
const FIREBASE_AUTH_URL = "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
const FIREBASE_STORE_URL = "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
const ROSTER_OWNER_EMAIL = "assencarlos2007@gmail.com";

let serviceState = {
  config: null,
  enabled: false,
  auth: null,
  db: null,
  provider: null,
  docRef: null,
  transferRequestsRef: null,
  communityMessagesRef: null,
  modules: null,
};

let firebaseInitPromise = null;
let resolveFirebaseInit = null;
let rejectFirebaseInit = null;

let nativeBridgeState = {
  authModule: null,
  pendingPromise: null,
  pendingToken: null,
};

let authRequestInFlight = false;

function createFirebaseInitPromise() {
  firebaseInitPromise = new Promise((resolve, reject) => {
    resolveFirebaseInit = resolve;
    rejectFirebaseInit = reject;
  });
}

function completeFirebaseInit() {
  resolveFirebaseInit?.(true);
  resolveFirebaseInit = null;
  rejectFirebaseInit = null;
}

function failFirebaseInit(error) {
  rejectFirebaseInit?.(error);
  resolveFirebaseInit = null;
  rejectFirebaseInit = null;
}

async function waitForFirebaseAuthReady(timeoutMs = 6000) {
  if (serviceState.auth && serviceState.provider && serviceState.modules) {
    return true;
  }

  if (!firebaseInitPromise) {
    return false;
  }

  return await Promise.race([
    firebaseInitPromise.then(() => true).catch(() => false),
    new Promise((resolve) => window.setTimeout(() => resolve(false), timeoutMs)),
  ]);
}

function hasNativeAndroidBridge() {
  return typeof window !== "undefined" &&
    window.SCCAndroidAuth &&
    typeof window.SCCAndroidAuth.requestGoogleSignIn === "function";
}

function shouldPreferRedirectAuth() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  if (hasNativeAndroidBridge()) {
    return false;
  }

  const userAgent = String(navigator.userAgent || "");
  const isMobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  const coarsePointer = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
  return isMobileUa || coarsePointer;
}

async function applyNativeGoogleToken(idToken, email = "") {
  if (!serviceState.auth || !serviceState.modules) {
    throw new Error("Firebase Auth aun no esta listo en la web.");
  }

  const credential = serviceState.modules.GoogleAuthProvider.credential(String(idToken || "").trim());
  const result = await serviceState.modules.signInWithCredential(serviceState.auth, credential);
  return {
    user: result?.user || null,
    email: String(email || result?.user?.email || "").trim(),
  };
}

function rejectNativePromise(message) {
  if (!nativeBridgeState.pendingPromise) {
    return;
  }

  nativeBridgeState.pendingPromise.reject(new Error(String(message || "No se pudo iniciar sesion en Android.")));
  nativeBridgeState.pendingPromise = null;
}

async function resolveNativePromise(idToken, email) {
  const activePromise = nativeBridgeState.pendingPromise;

  try {
    const result = await applyNativeGoogleToken(idToken, email);
    nativeBridgeState.pendingPromise = null;
    activePromise?.resolve(result);
  } catch (error) {
    nativeBridgeState.pendingPromise = null;
    activePromise?.reject(error);
    throw error;
  }
}

function notifyNativePageReady() {
  if (!hasNativeAndroidBridge() || typeof window.SCCAndroidAuth.notifyPageReady !== "function") {
    return;
  }

  try {
    window.SCCAndroidAuth.notifyPageReady();
  } catch (error) {
    console.warn("No se pudo avisar a Android que la web esta lista.", error);
  }
}

function setupNativeAuthBridge() {
  if (typeof window === "undefined") {
    return;
  }

  window.SCCNativeAuthBridge = {
    async receiveGoogleToken(idToken, email = "") {
      nativeBridgeState.pendingToken = {
        idToken: String(idToken || "").trim(),
        email: String(email || "").trim(),
      };

      if (!nativeBridgeState.pendingPromise) {
        try {
          await applyNativeGoogleToken(nativeBridgeState.pendingToken.idToken, nativeBridgeState.pendingToken.email);
          nativeBridgeState.pendingToken = null;
        } catch (error) {
          console.error(error);
        }
        return;
      }

      try {
        await resolveNativePromise(nativeBridgeState.pendingToken.idToken, nativeBridgeState.pendingToken.email);
        nativeBridgeState.pendingToken = null;
      } catch (error) {
        nativeBridgeState.pendingToken = null;
        console.error(error);
      }
    },
    receiveGoogleError(message = "") {
      rejectNativePromise(message || "No se pudo iniciar sesion con Google desde Android.");
    },
  };
}

async function requestNativeGoogleSignIn() {
  if (!hasNativeAndroidBridge()) {
    throw new Error("No existe un puente nativo de Android disponible.");
  }

  if (nativeBridgeState.pendingPromise) {
    throw new Error("Ya hay un inicio de sesion en progreso.");
  }

  return new Promise((resolve, reject) => {
    nativeBridgeState.pendingPromise = { resolve, reject };

    try {
      window.SCCAndroidAuth.requestGoogleSignIn();
    } catch (error) {
      nativeBridgeState.pendingPromise = null;
      reject(error);
    }
  });
}

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

function getLeagueBackupCollectionRef() {
  if (!serviceState.db || !serviceState.modules || !serviceState.config?.leagueDocumentPath) {
    throw new Error("Firebase no esta listo para crear respaldos.");
  }

  return serviceState.modules.collection(
    serviceState.db,
    ...getDocPathSegments(serviceState.config.leagueDocumentPath),
    "backups"
  );
}

function getLeagueSnapshotStats(leagueData) {
  return {
    clubCount: Array.isArray(leagueData?.clubs) ? leagueData.clubs.length : 0,
    playerCount: Array.isArray(leagueData?.players) ? leagueData.players.length : 0,
    matchCount: Array.isArray(leagueData?.matches) ? leagueData.matches.length : 0,
  };
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
  createFirebaseInitPromise();
  serviceState.config = getFirebaseSetup();
  serviceState.enabled = serviceState.config.enabled;
  setupNativeAuthBridge();

  if (!serviceState.enabled) {
    callbacks.onStatusChange?.({ type: "disabled", sourceLabel: "JSON publico" });
    callbacks.onUserChange?.({ user: null, canEdit: false });
    completeFirebaseInit();
    return { enabled: false, config: serviceState.config };
  }

  if (!hasFirebaseConfig(serviceState.config)) {
    callbacks.onStatusChange?.({ type: "error", sourceLabel: "JSON publico" });
    callbacks.onUserChange?.({ user: null, canEdit: false });
    const error = new Error("Completa firebase-config.js con las credenciales de tu proyecto Firebase.");
    failFirebaseInit(error);
    throw error;
  }
  callbacks.onStatusChange?.({ type: "connecting", sourceLabel: "JSON publico" });

  try {
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
    serviceState.communityMessagesRef = firestoreModule.collection(db, "communityMessages");
    serviceState.modules = {
      ...authModule,
      ...firestoreModule,
    };
    completeFirebaseInit();
    callbacks.onAuthReady?.();

    authModule.onAuthStateChanged(auth, (user) => {
      callbacks.onUserChange?.({ user, canEdit: isEditor(user) });
    });

    if (nativeBridgeState.pendingToken?.idToken) {
      try {
        await applyNativeGoogleToken(nativeBridgeState.pendingToken.idToken, nativeBridgeState.pendingToken.email);
        nativeBridgeState.pendingToken = null;
      } catch (error) {
        console.error("No se pudo restaurar la sesion nativa de Android.", error);
      }
    }

    notifyNativePageReady();

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
  } catch (error) {
    failFirebaseInit(error);
    throw error;
  }
}

export async function signInWithGoogle() {
  if (!serviceState.auth || !serviceState.provider || !serviceState.modules) {
    const ready = await waitForFirebaseAuthReady();
    if (!ready || !serviceState.auth || !serviceState.provider || !serviceState.modules) {
      throw new Error("Firebase se esta iniciando todavia. Espera un momento e intenta de nuevo.");
    }
  }

  if (authRequestInFlight) {
    throw new Error("Ya hay un inicio de sesion en curso. Espera un momento e intenta de nuevo.");
  }

  if (hasNativeAndroidBridge()) {
    authRequestInFlight = true;
    try {
      return await requestNativeGoogleSignIn();
    } finally {
      authRequestInFlight = false;
    }
  }

  if (shouldPreferRedirectAuth()) {
    authRequestInFlight = true;
    await serviceState.modules.signInWithRedirect(serviceState.auth, serviceState.provider);
    return null;
  }

  try {
    authRequestInFlight = true;
    return await serviceState.modules.signInWithPopup(serviceState.auth, serviceState.provider);
  } catch (error) {
    const code = String(error?.code || "");
    if (
      code.includes("popup-blocked") ||
      code.includes("popup-closed-by-user") ||
      code.includes("cancelled-popup-request") ||
      code.includes("web-storage-unsupported")
    ) {
      await serviceState.modules.signInWithRedirect(serviceState.auth, serviceState.provider);
      return null;
    }

    throw error;
  } finally {
    authRequestInFlight = false;
  }
}

export async function signOutUser() {
  if (!serviceState.auth || !serviceState.modules) {
    return;
  }

  await serviceState.modules.signOut(serviceState.auth);

  if (hasNativeAndroidBridge() && typeof window.SCCAndroidAuth.signOutGoogle === "function") {
    try {
      window.SCCAndroidAuth.signOutGoogle();
    } catch (error) {
      console.warn("No se pudo cerrar la sesion nativa de Android.", error);
    }
  }
}

export async function saveLeagueData(data, user, options = {}) {
  if (!serviceState.enabled || !serviceState.docRef || !serviceState.modules) {
    throw new Error("Firebase no esta configurado para guardar.");
  }

  if (!isEditor(user)) {
    throw new Error("El correo actual no tiene permiso de edicion.");
  }

  const saveLabel = String(options.changeLabel || "Actualizacion manual").trim() || "Actualizacion manual";
  const editorEmail = String(user?.email || "").trim();

  if (options.requiresRosterOwner && editorEmail.toLowerCase() !== ROSTER_OWNER_EMAIL) {
    throw new Error("Solo el correo propietario puede editar nombres o agregar jugadores a la plantilla.");
  }
  const currentSnapshot = await serviceState.modules.getDoc(serviceState.docRef);
  const currentLeagueData = currentSnapshot.data()?.leagueData || null;
  const backupLeagueData = currentLeagueData || data;
  const backupKind = currentLeagueData ? "before-save" : "initial-save";
  const backupStats = getLeagueSnapshotStats(backupLeagueData);
  const backupsRef = getLeagueBackupCollectionRef();
  const backupDocRef = serviceState.modules.doc(backupsRef);
  const batch = serviceState.modules.writeBatch(serviceState.db);

  batch.set(backupDocRef, {
    leagueData: backupLeagueData,
    sourceLeagueDocumentPath: serviceState.config.leagueDocumentPath,
    backupKind,
    triggerLabel: saveLabel,
    createdBy: editorEmail,
    createdAt: serviceState.modules.serverTimestamp(),
    snapshotUpdatedAt: String(backupLeagueData?.meta?.updatedAt || "").trim(),
    ...backupStats,
  });

  batch.set(
    serviceState.docRef,
    {
      leagueData: data,
      lastSavedBy: editorEmail,
      lastSavedAt: serviceState.modules.serverTimestamp(),
    },
    { merge: false }
  );

  await batch.commit();

  return {
    backupId: backupDocRef.id,
    backupKind,
  };
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

export function subscribeCommunityMessages(onData, onError) {
  if (!serviceState.enabled || !serviceState.communityMessagesRef || !serviceState.modules) {
    return () => {};
  }

  const messageQuery = serviceState.modules.query(
    serviceState.communityMessagesRef,
    serviceState.modules.orderBy("createdAt", "desc")
  );

  return serviceState.modules.onSnapshot(
    messageQuery,
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
    targetClubId: String(payload.targetClubId || "").trim(),
    targetClubName: String(payload.targetClubName || "").trim(),
    status: "Pendiente",
    isPublic: false,
    submittedAt: new Date().toISOString(),
    createdAt: serviceState.modules.serverTimestamp(),
  });
}

export async function updateTransferRequest(docId, payload, user) {
  if (!serviceState.enabled || !serviceState.transferRequestsRef || !serviceState.modules) {
    throw new Error("Firebase no esta configurado para actualizar solicitudes.");
  }

  if (!isEditor(user)) {
    throw new Error("El correo actual no tiene permiso de edicion.");
  }

  const ref = serviceState.modules.doc(serviceState.db, "transferRequests", String(docId || "").trim());
  await serviceState.modules.updateDoc(ref, payload);
}

export async function createCommunityMessage(payload) {
  if (!serviceState.enabled || !serviceState.communityMessagesRef || !serviceState.modules) {
    throw new Error("Firebase no esta configurado para la comunidad.");
  }

  await serviceState.modules.addDoc(serviceState.communityMessagesRef, {
    name: String(payload.name || "").trim(),
    message: String(payload.message || "").trim(),
    submittedAt: new Date().toISOString(),
    createdAt: serviceState.modules.serverTimestamp(),
  });
}
