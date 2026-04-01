# SCC FC26 Virtual League

Web estatica para mostrar y administrar la liga SCC de FC26.

## Lo principal

- Admin fijo: `SLYINTHEBLOCK`
- Tabla normal de clubes
- Calendario ida y vuelta
- Estadisticas de jugadores
- Columna de `atajadas` para porteros
- Login con Google listo para Firebase
- Modo publico de respaldo con `league-data.json`

## Archivos importantes

- `index.html`: estructura del sitio
- `styles.css`: estilos
- `app.js`: render, filtros y panel de edicion
- `firebase-config.js`: activacion y credenciales de Firebase
- `firebase-service.js`: login con Google y guardado en Firestore
- `league-data.json`: base principal del torneo
- `league-data.js`: respaldo local para abrir sin servidor
- `abrir-app.bat`: regenera `league-data.js` y abre la web
- `sync-android-assets.bat`: copia la web a la app Android

## Edicion manual rapida

1. Abre `league-data.json`.
2. Edita `clubs` para la tabla.
3. Edita `players` para estadisticas individuales.
4. Usa `saves` para las atajadas del portero.
5. Guarda.
6. Ejecuta `abrir-app.bat`.

Ejemplo de jugador:

```json
{
  "id": "player-mc-originals-01",
  "name": "Fran-kim25",
  "country": "Chile",
  "clubId": "club-mc-originals",
  "position": "POR",
  "overall": 85,
  "matches": 2,
  "goals": 0,
  "assists": 0,
  "mvps": 0,
  "cleanSheets": 1,
  "saves": 0,
  "rating": 8.1
}
```

## Login con Google y edicion compartida

La web ya trae el panel, pero para que funcione de verdad debes configurar Firebase.

### 1. Crear proyecto Firebase

Necesitas:

- Firebase Authentication
- Google como proveedor de login
- Firestore Database

### 2. Editar `firebase-config.js`

Cambia este archivo:

```js
window.SCC_FIREBASE_CONFIG = {
  enabled: true,
  leagueDocumentPath: "leagues/scc-main",
  editorEmails: [
    "tu-correo@gmail.com",
    "moderador1@gmail.com"
  ],
  firebaseConfig: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  }
};
```

### 3. Autorizar el dominio

En Firebase Auth agrega como dominio autorizado:

- `lordpingostin.github.io`

Si vas a probar localmente, agrega tambien:

- `localhost`

### 4. Reglas base de Firestore

Ejemplo simple:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leagues/{leagueId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email in [
          "tu-correo@gmail.com",
          "moderador1@gmail.com"
        ];
    }
  }
}
```

Cuando eso este listo:

- cualquier persona vera la liga
- los correos autorizados podran entrar con Google
- solo esos correos podran editar desde la web
- la APK conectada tambien leera los cambios al abrirse con internet

## GitHub Pages

El sitio publico vive en:

`https://lordpingostin.github.io/LIGA-SCC/`

Si cambias archivos y quieres subirlos:

1. Guarda tus cambios.
2. Haz `Commit` en GitHub Desktop.
3. Haz `Push origin`.
4. Espera 1 a 5 minutos.

## App Android

Proyecto en:

`android-app/`

La app intenta abrir primero:

`https://lordpingostin.github.io/LIGA-SCC/`

Si no hay internet, usa el respaldo local de `assets`.

Cuando cambies la web local:

1. Ejecuta `sync-android-assets.bat`
2. Abre `android-app` en Android Studio
3. Compila de nuevo el APK

## TWA y Chrome

La app Android ya quedo preparada para abrir la web con Chrome usando Trusted Web Activity / Custom Tabs.

Archivos clave:

- `android-app/app/src/main/AndroidManifest.xml`
- `android-app/app/build.gradle`
- `.well-known/assetlinks.json`
- `.nojekyll`

Importante:

- Con el hosting actual en `https://lordpingostin.github.io/LIGA-SCC/`, Chrome abrira la web como Custom Tab, porque la verificacion TWA completa necesita `/.well-known/assetlinks.json` en la raiz del dominio.
- Para full screen real sin barra, lo ideal es mover la web a Firebase Hosting o a un dominio propio apuntando a esta carpeta.
