# Publicar COPA SCC en Play Store

## Archivos listos

- Bundle para Play Store:
  `android-app/app/build/outputs/bundle/release/app-release.aab`
- APK local de prueba:
  `android-app/app/build/outputs/apk/debug/COPA-SCC.apk`
- Keystore de subida:
  `android-app/keystore/copa-scc-upload.jks`
- Configuracion local de firma:
  `android-app/keystore.properties`

## Pasos en Play Console

1. Entrar a Google Play Console.
2. Crear la app `COPA SCC`.
3. En `Panel principal > Configura tu app`, completar:
   - nombre
   - descripcion corta
   - descripcion completa
   - categoria
   - correo de soporte
   - politica de privacidad
4. En `Versiones > Produccion`, crear una version nueva.
5. Subir `app-release.aab`.
6. Revisar advertencias y guardar borrador.
7. Completar `Contenido de la app`:
   - acceso a la app
   - anuncios
   - clasificacion de contenido
   - seguridad de los datos
   - publico objetivo
8. Subir icono, capturas y grafico destacado.
9. Enviar a revision.

## Importante para TWA

Despues de subir la app y activar `Play App Signing`:

1. Ir a `Play Console > Integridad de la app`.
2. Copiar el `SHA-256` del certificado de firma de la app.
3. Agregar ese SHA-256 en:
   `.well-known/assetlinks.json`
4. Volver a publicar Hosting en Firebase.

Sin ese paso, la app puede abrirse, pero la experiencia TWA completa puede no validarse correctamente en todos los dispositivos.
