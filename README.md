# SCC FC26 Virtual League

Pagina web estatica para administrar y mostrar una liga SCC de FC26 con:

- Admin principal: `SLYINTHEBLOCK`
- Bloque de moderadores
- Calendario automatico de 21 fechas de ida y 21 de vuelta
- Tabla oficial de clubes
- Estadisticas globales
- Ranking individual de jugadores
- Cobertura para participantes de distintos paises

## Archivos

- `index.html`: estructura principal del sitio
- `styles.css`: identidad visual y responsive
- `app.js`: render, filtros y gestion local de moderadores
- `league-data.json`: fuente principal de datos del torneo
- `league-data.js`: respaldo local generado para abrir la pagina sin servidor
- `abrir-app.bat`: actualiza `league-data.js` desde el JSON y abre la web

## Como actualizar datos

1. Edita `league-data.json`
2. Cambia admin, moderadores, clubes o jugadores
3. Ejecuta `abrir-app.bat`

## Como editar jugadores manualmente

Todos los jugadores viven dentro del arreglo `players` en `league-data.json`.

Cada jugador usa este formato:

```json
{
  "id": "player-la-teja-fc-01",
  "name": "LAG_Ledes69",
  "country": "Argentina",
  "clubId": "club-la-teja-fc",
  "position": "POR DEFINIR",
  "overall": 0,
  "matches": 0,
  "goals": 0,
  "assists": 0,
  "mvps": 0,
  "cleanSheets": 0,
  "rating": 0
}
```

Reglas rapidas:

- `clubId` debe coincidir exactamente con el `id` del club
- `name` es el ID o nombre del jugador como quieres mostrarlo
- `position` la puedes cambiar luego por `POR`, `DFC`, `MC`, `EI`, `DC` o la que uses
- `overall`, `matches`, `goals`, `assists`, `mvps`, `cleanSheets` y `rating` se pueden ir actualizando cuando empiece la liga

## Como editar resultados y tabla manualmente

Cada club vive dentro del arreglo `clubs` en `league-data.json`.

Estos campos controlan la tabla:

- `played`
- `wins`
- `draws`
- `losses`
- `goalsFor`
- `goalsAgainst`

Cuando cambias esos valores, la tabla se reordena sola en la web.

## Calendario

- Los partidos se generan automaticamente desde el arreglo `clubs`
- Con 22 equipos, la web crea 21 fechas base de ida y 21 de vuelta
- No necesitas escribir los cruces manualmente

## Subirlo a GitHub Pages sin git

En este equipo no esta instalado `git`, asi que la forma mas simple es hacerlo desde la web de GitHub:

1. Crea un repositorio nuevo en GitHub
2. Sube estos archivos:
   `index.html`
   `styles.css`
   `app.js`
   `league-data.json`
   `league-data.js`
   `README.md`
3. En GitHub entra a `Settings > Pages`
4. En `Build and deployment`, elige `Deploy from a branch`
5. Selecciona la rama `main` y la carpeta `/root`
6. Guarda los cambios y espera unos minutos

La pagina quedara en una URL parecida a:

`https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`

## Como editar despues desde GitHub

Si ya la publicaste en GitHub Pages, puedes editarla sin instalar nada:

1. Abre el repositorio en GitHub
2. Entra a `league-data.json`
3. Pulsa el icono del lapiz para editar
4. Cambia clubes, jugadores o resultados
5. Guarda con `Commit changes`

Si editas `league-data.json`, recuerda actualizar tambien `league-data.js` si vas a abrir la pagina localmente fuera de GitHub.

## Admin fijo

- El sitio muestra solo a `SLYINTHEBLOCK` como admin principal
- Aunque cambies el campo `meta.admin` en el JSON, la interfaz mantiene ese admin fijo
- Los moderadores no pueden guardarse con rol `Admin` o `Administrador` desde el formulario

## Como agregar equipos

Cada equipo va dentro del arreglo `clubs` en `league-data.json`.

Ejemplo:

```json
{
  "id": "club-nuevo",
  "name": "Nuevo Club",
  "country": "Colombia",
  "contact": "+57 300 0000000",
  "stadium": "Nombre del estadio",
  "color": "#00d084",
  "played": 0,
  "wins": 0,
  "draws": 0,
  "losses": 0,
  "goalsFor": 0,
  "goalsAgainst": 0
}
```

## Como agregar jugadores

Cada jugador va dentro del arreglo `players` y debe apuntar al equipo con `clubId`.

Ejemplo:

```json
{
  "id": "player-nuevo",
  "name": "Jugador Nuevo",
  "country": "Colombia",
  "clubId": "club-nuevo",
  "position": "DC",
  "overall": 85,
  "matches": 0,
  "goals": 0,
  "assists": 0,
  "mvps": 0,
  "cleanSheets": 0,
  "rating": 0
}
```

## Moderadores

- Los moderadores incluidos en `league-data.json` son la base oficial
- Los moderadores agregados desde la web se guardan en el navegador
- Puedes quitarlos desde el mismo panel si fueron creados localmente

## Publicacion

Si publicas la carpeta en GitHub Pages, Netlify o Vercel, la web intentara leer `league-data.json` directamente.
