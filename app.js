import {
  createTransferRequest,
  getFirebaseSetup,
  initFirebase,
  isEditor,
  saveLeagueData,
  signInWithGoogle,
  signOutUser,
  subscribeTransferRequests,
} from "./firebase-service.js";

const DATA_PATH = "league-data.json";
const FIXED_ADMIN = "SLYINTHEBLOCK";

const emptyStateTemplate = document.getElementById("emptyStateTemplate");
const summaryGrid = document.getElementById("summaryGrid");
const commandList = document.getElementById("commandList");
const spotlightList = document.getElementById("spotlightList");
const clubStandingsBody = document.getElementById("clubStandingsBody");
const leaderboards = document.getElementById("leaderboards");
const fixturesGrid = document.getElementById("fixturesGrid");
const fixtureRoundFilter = document.getElementById("fixtureRoundFilter");
const fixturesSummary = document.getElementById("fixturesSummary");
const scheduleWindowTitle = document.getElementById("scheduleWindowTitle");
const scheduleWindowText = document.getElementById("scheduleWindowText");
const scheduleTimeGrid = document.getElementById("scheduleTimeGrid");
const clubCards = document.getElementById("clubCards");
const playersTableBody = document.getElementById("playersTableBody");
const playerSearch = document.getElementById("playerSearch");
const playerClubFilter = document.getElementById("playerClubFilter");
const playerPositionFilter = document.getElementById("playerPositionFilter");
const seasonBadge = document.getElementById("seasonBadge");
const brandName = document.getElementById("brandName");
const brandRegion = document.getElementById("brandRegion");
const heroTitle = document.getElementById("heroTitle");
const heroDescription = document.getElementById("heroDescription");
const heroBadges = document.getElementById("heroBadges");
const adminName = document.getElementById("adminName");
const heroAdmin = document.getElementById("heroAdmin");
const heroClubCount = document.getElementById("heroClubCount");
const heroPlayerCount = document.getElementById("heroPlayerCount");
const heroMatchCount = document.getElementById("heroMatchCount");
const heroCountryCount = document.getElementById("heroCountryCount");
const updatedAt = document.getElementById("updatedAt");
const formatLabel = document.getElementById("formatLabel");
const gameLabel = document.getElementById("gameLabel");
const modeLabel = document.getElementById("modeLabel");
const globalSummary = document.getElementById("globalSummary");
const footerBrand = document.getElementById("footerBrand");
const footerRegion = document.getElementById("footerRegion");
const footerUpdate = document.getElementById("footerUpdate");
const signInButton = document.getElementById("signInButton");
const signOutButton = document.getElementById("signOutButton");
const authStatus = document.getElementById("authStatus");
const authHelp = document.getElementById("authHelp");
const authUser = document.getElementById("authUser");
const editorBadge = document.getElementById("editorBadge");
const dataSourceLabel = document.getElementById("dataSourceLabel");
const configStatus = document.getElementById("configStatus");
const editorCountLabel = document.getElementById("editorCountLabel");
const editorPanel = document.getElementById("editorPanel");
const editorPanelNote = document.getElementById("editorPanelNote");
const clubEditorForm = document.getElementById("clubEditorForm");
const clubEditorSelect = document.getElementById("clubEditorSelect");
const clubPlayedInput = document.getElementById("clubPlayedInput");
const clubWinsInput = document.getElementById("clubWinsInput");
const clubDrawsInput = document.getElementById("clubDrawsInput");
const clubLossesInput = document.getElementById("clubLossesInput");
const clubGoalsForInput = document.getElementById("clubGoalsForInput");
const clubGoalsAgainstInput = document.getElementById("clubGoalsAgainstInput");
const playerEditorForm = document.getElementById("playerEditorForm");
const playerEditorSelect = document.getElementById("playerEditorSelect");
const playerPositionInput = document.getElementById("playerPositionInput");
const playerOverallInput = document.getElementById("playerOverallInput");
const playerMatchesInput = document.getElementById("playerMatchesInput");
const playerGoalsInput = document.getElementById("playerGoalsInput");
const playerAssistsInput = document.getElementById("playerAssistsInput");
const playerMvpsInput = document.getElementById("playerMvpsInput");
const playerCleanSheetsInput = document.getElementById("playerCleanSheetsInput");
const playerSavesInput = document.getElementById("playerSavesInput");
const playerRatingInput = document.getElementById("playerRatingInput");
const matchEditorForm = document.getElementById("matchEditorForm");
const matchRoundSelect = document.getElementById("matchRoundSelect");
const matchLegSelect = document.getElementById("matchLegSelect");
const matchFixtureSelect = document.getElementById("matchFixtureSelect");
const matchHomeTeamInput = document.getElementById("matchHomeTeamInput");
const matchAwayTeamInput = document.getElementById("matchAwayTeamInput");
const matchStatusSelect = document.getElementById("matchStatusSelect");
const matchHomeGoalsInput = document.getElementById("matchHomeGoalsInput");
const matchAwayGoalsInput = document.getElementById("matchAwayGoalsInput");
const matchGoalsDetailsInput = document.getElementById("matchGoalsDetailsInput");
const matchAssistsDetailsInput = document.getElementById("matchAssistsDetailsInput");
const marketSettingsForm = document.getElementById("marketSettingsForm");
const marketModeSelect = document.getElementById("marketModeSelect");
const marketManualStatusSelect = document.getElementById("marketManualStatusSelect");
const transferRequestsCount = document.getElementById("transferRequestsCount");
const transferRequestsList = document.getElementById("transferRequestsList");
const transferMarketSummary = document.getElementById("transferMarketSummary");
const marketStatusLabel = document.getElementById("marketStatusLabel");
const marketModeLabel = document.getElementById("marketModeLabel");
const marketChileTimeLabel = document.getElementById("marketChileTimeLabel");
const marketWindowLabel = document.getElementById("marketWindowLabel");
const marketHelpText = document.getElementById("marketHelpText");
const transferMarketForm = document.getElementById("transferMarketForm");
const transferPlayerIdInput = document.getElementById("transferPlayerIdInput");
const transferPositionInput = document.getElementById("transferPositionInput");
const transferPhoneInput = document.getElementById("transferPhoneInput");
const transferSubmitButton = document.getElementById("transferSubmitButton");
const transferSubmitStatus = document.getElementById("transferSubmitStatus");
const downloadJsonButton = document.getElementById("downloadJsonButton");
const saveStatus = document.getElementById("saveStatus");

const state = {
  rawData: null,
  meta: {},
  clubs: [],
  players: [],
  matches: [],
  schedule: [],
  transferRequests: [],
  user: null,
  canEdit: false,
  sourceLabel: "JSON publico",
  firebaseStatus: "disabled",
  firebaseSetup: getFirebaseSetup(),
  revealObserver: null,
  transferRequestsUnsubscribe: null,
  marketClock: null,
};

const LIVE_SCHEDULE_ZONES = [
  { label: "Colombia", timeZone: "America/Bogota", isOfficial: false },
  { label: "Honduras", timeZone: "America/Tegucigalpa", isOfficial: false },
  { label: "Mexico", timeZone: "America/Mexico_City", isOfficial: false },
  { label: "Peru", timeZone: "America/Lima", isOfficial: false },
  { label: "Chile", timeZone: "America/Santiago", isOfficial: true },
  { label: "Argentina", timeZone: "America/Argentina/Buenos_Aires", isOfficial: true },
  { label: "Uruguay", timeZone: "America/Montevideo", isOfficial: true },
];

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function todayIsoLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) {
    return "Pendiente";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatDateTime(value) {
  if (!value) {
    return "Pendiente";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function getTransferMarketConfig() {
  const market = state.meta.transferMarket || {};
  return {
    mode: market.mode === "manual" ? "manual" : "automatic",
    manualStatus: market.manualStatus === "open" ? "open" : "closed",
    timezone: market.timezone || "America/Santiago",
    automaticWindowLabel: market.automaticWindowLabel || "Sabado desde las 00:00 hora Chile",
  };
}

function getChileNowParts() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: getTransferMarketConfig().timezone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date())
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    weekday: parts.weekday || "Mon",
    year: parts.year || "0000",
    month: parts.month || "00",
    day: parts.day || "00",
    hour: parts.hour || "00",
    minute: parts.minute || "00",
    second: parts.second || "00",
  };
}

function getTransferMarketState() {
  const config = getTransferMarketConfig();
  const chileNow = getChileNowParts();
  const currentTime = `${chileNow.hour}:${chileNow.minute}`;
  const automaticOpen = chileNow.weekday === "Sat";
  const isOpen = config.mode === "manual" ? config.manualStatus === "open" : automaticOpen;

  return {
    ...config,
    isOpen,
    currentTime,
    currentWeekday: chileNow.weekday,
    statusLabel: isOpen ? "Mercado abierto" : "Mercado cerrado",
    modeLabel: config.mode === "manual" ? "Manual" : "Automatico",
    helpText:
      config.mode === "manual"
        ? `Modo manual activo. El mercado esta ${config.manualStatus === "open" ? "abierto" : "cerrado"} por decision administrativa.`
        : "Modo automatico activo. Se habilita cada sabado a las 00:00 hora Chile y permanece abierto durante el sabado.",
  };
}

function getScheduleWindowInfo() {
  const scheduleWindow = state.meta.scheduleWindow || {};
  const start = String(scheduleWindow.start || "18:00");
  const end = String(scheduleWindow.end || "23:30");
  const zones = Array.isArray(scheduleWindow.zones) && scheduleWindow.zones.length
    ? scheduleWindow.zones
    : ["Argentina", "Chile", "Uruguay"];

  return {
    start,
    end,
    zones,
    zoneLabel: zones.join(", "),
    shortLabel: `${start} a ${end}`,
    title: `Rango oficial de inicio: ${start} a ${end}`,
    text: `Partidos habilitados entre ${start} y ${end} para ${zones.join(", ")}.`,
  };
}

function getTimeZoneParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function getTimeZoneOffsetMinutes(date, timeZone) {
  const parts = getTimeZoneParts(date, timeZone);
  const utcTimestamp = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return (utcTimestamp - date.getTime()) / 60000;
}

function zonedDateToUtc(parts, timeZone) {
  const baseUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0);
  const probe = new Date(baseUtc);
  const offsetMinutes = getTimeZoneOffsetMinutes(probe, timeZone);
  return new Date(baseUtc - offsetMinutes * 60000);
}

function formatTimeInZone(date, timeZone) {
  return new Intl.DateTimeFormat("es-419", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function getLiveScheduleEntries() {
  const scheduleWindow = getScheduleWindowInfo();
  const officialZone = "America/Santiago";
  const now = new Date();
  const officialToday = getTimeZoneParts(now, officialZone);
  const [startHour, startMinute] = scheduleWindow.start.split(":").map(Number);
  const [endHour, endMinute] = scheduleWindow.end.split(":").map(Number);

  const startUtc = zonedDateToUtc(
    {
      year: officialToday.year,
      month: officialToday.month,
      day: officialToday.day,
      hour: startHour,
      minute: startMinute,
    },
    officialZone
  );

  const endUtc = zonedDateToUtc(
    {
      year: officialToday.year,
      month: officialToday.month,
      day: officialToday.day,
      hour: endHour,
      minute: endMinute,
    },
    officialZone
  );

  return LIVE_SCHEDULE_ZONES.map((zone) => ({
    ...zone,
    currentTime: formatTimeInZone(now, zone.timeZone),
    window: `${formatTimeInZone(startUtc, zone.timeZone)} - ${formatTimeInZone(endUtc, zone.timeZone)}`,
  }));
}

function renderLiveScheduleClocks() {
  if (!scheduleTimeGrid) {
    return;
  }

  const entries = getLiveScheduleEntries();
  scheduleTimeGrid.innerHTML = entries
    .map(
      (entry) => `
        <article class="schedule-time-card${entry.isOfficial ? " official" : ""}">
          <span>${entry.label}</span>
          <strong>${entry.currentTime}</strong>
          <small>Rango guia: ${entry.window}</small>
        </article>
      `
    )
    .join("");
}

function normalizeClub(club = {}) {
  return {
    ...club,
    played: numberValue(club.played),
    wins: numberValue(club.wins),
    draws: numberValue(club.draws),
    losses: numberValue(club.losses),
    goalsFor: numberValue(club.goalsFor),
    goalsAgainst: numberValue(club.goalsAgainst),
  };
}

function normalizePlayer(player = {}) {
  return {
    ...player,
    position: player.position || "POR DEFINIR",
    overall: numberValue(player.overall),
    matches: numberValue(player.matches),
    goals: numberValue(player.goals),
    assists: numberValue(player.assists),
    mvps: numberValue(player.mvps),
    cleanSheets: numberValue(player.cleanSheets),
    saves: numberValue(player.saves),
    rating: numberValue(player.rating),
  };
}

function dedupePlayers(players = []) {
  const byName = new Map();

  players.forEach((player) => {
    const key = String(player.name || "").trim().toLowerCase();
    if (!key) {
      return;
    }

    // Keep the most recent occurrence so stale duplicates from older payloads do not survive.
    byName.set(key, player);
  });

  return [...byName.values()];
}

function normalizeMatch(match = {}) {
  return {
    ...match,
    round: numberValue(match.round),
    matchIndex: numberValue(match.matchIndex),
    homeGoals: numberValue(match.homeGoals),
    awayGoals: numberValue(match.awayGoals),
    status: match.status || "Pendiente",
    scorers: Array.isArray(match.scorers) ? match.scorers : [],
    assists: Array.isArray(match.assists) ? match.assists : [],
    highlights: Array.isArray(match.highlights) ? match.highlights : [],
  };
}

function normalizeLeagueData(data = {}) {
  const normalized = deepClone(data || {});

  normalized.meta = {
    leagueName: "SCC FC26 Virtual League",
    shortName: "SCC",
    admin: FIXED_ADMIN,
    season: "Season 01",
    updatedAt: todayIsoLocal(),
    region: "Global",
    game: "EA SPORTS FC 26",
    mode: "Clubs Pro",
    format: "Liga internacional",
    countries: [],
    transferMarket: {
      mode: "automatic",
      manualStatus: "closed",
      timezone: "America/Santiago",
      automaticWindowLabel: "Sabado desde las 00:00 hora Chile",
    },
    ...(normalized.meta || {}),
    admin: FIXED_ADMIN,
  };

  normalized.moderators = Array.isArray(normalized.moderators) ? normalized.moderators : [];
  normalized.clubs = Array.isArray(normalized.clubs) ? normalized.clubs.map(normalizeClub) : [];
  normalized.players = Array.isArray(normalized.players)
    ? dedupePlayers(normalized.players.map(normalizePlayer))
    : [];
  normalized.matches = Array.isArray(normalized.matches) ? normalized.matches.map(normalizeMatch) : [];

  return normalized;
}

function buildLeagueDataForSave() {
  return {
    ...(state.rawData || {}),
    meta: {
      ...(state.meta || {}),
      admin: FIXED_ADMIN,
      updatedAt: todayIsoLocal(),
    },
    clubs: state.clubs.map((club) => ({ ...club })),
    players: state.players.map((player) => ({ ...player })),
    matches: state.matches.map((match) => ({ ...match })),
  };
}

function applyLeagueData(data, options = {}) {
  const normalized = normalizeLeagueData(data);
  state.rawData = normalized;
  state.meta = normalized.meta;
  state.clubs = normalized.clubs;
  state.players = normalized.players;
  state.matches = normalized.matches;
  state.schedule = generateRoundRobinSchedule(state.clubs);

  if (options.sourceLabel) {
    state.sourceLabel = options.sourceLabel;
  }
}

function pointsFor(club) {
  return numberValue(club.wins) * 3 + numberValue(club.draws);
}

function goalDifference(club) {
  return numberValue(club.goalsFor) - numberValue(club.goalsAgainst);
}

function sortClubs(clubs) {
  return [...clubs].sort((a, b) =>
    pointsFor(b) - pointsFor(a) ||
    goalDifference(b) - goalDifference(a) ||
    numberValue(b.goalsFor) - numberValue(a.goalsFor) ||
    String(a.name || "").localeCompare(String(b.name || ""))
  );
}

function sortPlayers(players, field) {
  return [...players].sort((a, b) =>
    numberValue(b[field]) - numberValue(a[field]) ||
    numberValue(b.rating) - numberValue(a.rating) ||
    String(a.name || "").localeCompare(String(b.name || ""))
  );
}

function getClubById(clubId) {
  return state.clubs.find((club) => club.id === clubId) || null;
}

function getClubName(clubId) {
  return getClubById(clubId)?.name || "Sin club";
}

function getCountryCount() {
  const countries = new Set();
  (state.meta.countries || []).forEach((country) => countries.add(country));
  state.clubs.forEach((club) => club.country && countries.add(club.country));
  state.players.forEach((player) => player.country && countries.add(player.country));
  return countries.size;
}

function getScheduledMatchCount() {
  return state.schedule.reduce((sum, round) => sum + round.ida.length + round.vuelta.length, 0);
}

function getCompletedMatchCount() {
  return state.matches.filter((match) => String(match.status || "").toLowerCase() === "final").length;
}

function createEmptyRow(colspan) {
  return `<tr><td colspan="${colspan}">${emptyStateTemplate.innerHTML}</td></tr>`;
}

function generateRoundRobinSchedule(clubs) {
  if (clubs.length < 2) {
    return [];
  }

  const teams = clubs.map((club) => ({ id: club.id }));
  if (teams.length % 2 !== 0) {
    teams.push({ id: "bye" });
  }

  const rotation = [...teams];
  const rounds = [];

  for (let roundIndex = 0; roundIndex < rotation.length - 1; roundIndex += 1) {
    const matches = [];

    for (let index = 0; index < rotation.length / 2; index += 1) {
      const first = rotation[index];
      const second = rotation[rotation.length - 1 - index];

      if (first.id === "bye" || second.id === "bye") {
        continue;
      }

      const flip = roundIndex % 2 === 1;
      matches.push({
        homeId: flip ? second.id : first.id,
        awayId: flip ? first.id : second.id,
      });
    }

    rounds.push({
      fecha: roundIndex + 1,
      ida: matches,
      vuelta: matches.map((match) => ({
        homeId: match.awayId,
        awayId: match.homeId,
      })),
    });

    rotation.splice(1, 0, rotation.pop());
  }

  return rounds;
}
function renderMeta() {
  const leagueName = state.meta.leagueName || "SCC FC26 Virtual League";
  const shortBrand = state.meta.shortName ? `LIGA ${state.meta.shortName}` : "LIGA SCC";
  const region = state.meta.region || "Global";
  const game = state.meta.game || "EA SPORTS FC 26";
  const mode = state.meta.mode || "Clubs Pro";
  const scheduleWindow = getScheduleWindowInfo();

  brandName.textContent = shortBrand;
  brandRegion.textContent = `${region} - ${game}`;
  seasonBadge.textContent = state.meta.season || "Season 01";

  heroTitle.innerHTML =
    '<span class="hero-title-line hero-title-line-top">𝗟𝗜𝗚𝗔 𝗦𝗖𝗖 |</span>' +
    '<span class="hero-title-line">𝗖𝗼𝗺𝗽𝗲𝘁𝗶𝘁𝗶𝘃𝗶𝗱𝗮𝗱</span>' +
    '<span class="hero-title-line">𝗮𝗹 𝗺á𝘅𝗶𝗺𝗼</span>';
  heroDescription.textContent =
    `${state.meta.format || "Liga internacional"} de ${game} en ${mode} con resultados, ` +
    "estadisticas y mercado de fichajes dentro de una experiencia negra, elegante y pensada para web y app.";
  heroBadges.innerHTML = [region, game, mode]
    .map((label) => `<span class="signal-pill">${escapeHtml(label)}</span>`)
    .join("");

  adminName.textContent = FIXED_ADMIN;
  heroAdmin.textContent = FIXED_ADMIN;
  heroClubCount.textContent = `${state.clubs.length}`;
  heroPlayerCount.textContent = `${state.players.length}`;
  heroMatchCount.textContent = `${getCompletedMatchCount()}`;
  heroCountryCount.textContent = `${getCountryCount()}`;
  updatedAt.textContent = formatDate(state.meta.updatedAt);

  formatLabel.textContent = state.meta.format || "Liga internacional";
  gameLabel.textContent = game;
  modeLabel.textContent = mode;
  scheduleWindowTitle.textContent = scheduleWindow.title;
  scheduleWindowText.textContent = scheduleWindow.text;
  renderLiveScheduleClocks();

  footerBrand.textContent = shortBrand;
  footerRegion.textContent = `${region} - ${mode} - ${game}`;
  footerUpdate.textContent = `Ultima actualizacion: ${formatDate(state.meta.updatedAt)}`;
}

function renderSummary() {
  const leaderClub = sortClubs(state.clubs)[0];
  const topScorer = sortPlayers(state.players, "goals")[0];

  const cards = [
    { label: "Clubes inscritos", value: state.clubs.length },
    { label: "Jugadores registrados", value: state.players.length },
    { label: "Fechas base", value: state.schedule.length },
    { label: "Partidos programados", value: getScheduledMatchCount() },
    { label: "Partidos jugados", value: getCompletedMatchCount() },
    { label: "Paises activos", value: getCountryCount() },
    { label: "Lider actual", value: leaderClub ? leaderClub.name : "Sin datos" },
    {
      label: "Maximo goleador",
      value: topScorer ? `${topScorer.name} - ${numberValue(topScorer.goals)}` : "Sin datos",
    },
  ];

  summaryGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card">
          <span>${escapeHtml(card.label)}</span>
          <strong>${escapeHtml(card.value)}</strong>
        </article>
      `
    )
    .join("");
}

function renderCommandCenter() {
  const scheduleWindow = getScheduleWindowInfo();
  const transferMarket = getTransferMarketState();
  const items = [
    { label: "Cobertura", value: `${getCountryCount()} paises listados` },
    { label: "Temporada", value: state.meta.season || "Season 01" },
    { label: "Calendario", value: `${state.schedule.length} fechas ida y ${state.schedule.length} vuelta` },
    { label: "Horario oficial", value: `${scheduleWindow.shortLabel} (${scheduleWindow.zoneLabel})` },
    { label: "Mercado", value: `${transferMarket.statusLabel} - ${transferMarket.modeLabel}` },
    { label: "Fuente", value: state.sourceLabel },
  ];

  commandList.innerHTML = items
    .map(
      (item) => `
        <article>
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </article>
      `
    )
    .join("");

  spotlightList.innerHTML = [
    {
      title: "Acceso con Google",
      text: "Los correos autorizados pueden iniciar sesion y editar la liga si Firebase esta activo.",
    },
    {
      title: "Estadisticas de portero",
      text: "La tabla y el panel de edicion ahora incluyen la columna de atajadas.",
    },
    {
      title: "Publicacion simple",
      text: "La web sigue funcionando con JSON publico y puede pasar a modo en vivo con Firestore.",
    },
  ]
    .map(
      (item) => `
        <li>
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.text)}</span>
        </li>
      `
    )
    .join("");

  globalSummary.textContent =
    `${state.meta.leagueName || "SCC"} reune ${state.clubs.length} clubes, ${state.players.length} jugadores, ` +
    `${getScheduledMatchCount()} partidos programados, ${getCompletedMatchCount()} ya jugados y ` +
    `${state.firebaseSetup.editorEmails.length} correos listos para edicion compartida.`;
}

function renderTransferMarket() {
  const market = getTransferMarketState();
  const formEnabled = state.firebaseSetup.enabled && market.isOpen;

  marketStatusLabel.textContent = market.statusLabel;
  marketModeLabel.textContent = market.modeLabel;
  marketChileTimeLabel.textContent = `${market.currentTime} (${market.currentWeekday})`;
  marketWindowLabel.textContent = market.automaticWindowLabel;
  marketHelpText.textContent = market.helpText;
  transferMarketSummary.textContent =
    "Los administradores pueden abrir o cerrar el mercado manualmente, o dejarlo automatico cada sabado a las 00:00 hora Chile.";

  transferPlayerIdInput.disabled = !formEnabled;
  transferPositionInput.disabled = !formEnabled;
  transferPhoneInput.disabled = !formEnabled;
  transferSubmitButton.disabled = !formEnabled;

  if (!state.firebaseSetup.enabled) {
    transferSubmitStatus.textContent = "Firebase no esta disponible para recibir inscripciones.";
    transferSubmitStatus.className = "save-status warning";
  } else if (market.isOpen) {
    transferSubmitStatus.textContent = "Mercado habilitado. Puedes enviar tu inscripcion.";
    transferSubmitStatus.className = "save-status success";
  } else {
    transferSubmitStatus.textContent = "Mercado cerrado por ahora. Espera la apertura o un cambio de los administradores.";
    transferSubmitStatus.className = "save-status warning";
  }
}

function renderTransferRequests() {
  const count = state.transferRequests.length;
  transferRequestsCount.textContent = `${count} inscripciones registradas.`;

  if (!count) {
    transferRequestsList.innerHTML = '<p class="panel-copy">Todavia no hay solicitudes de fichajes.</p>';
    return;
  }

  transferRequestsList.innerHTML = state.transferRequests
    .map(
      (request) => `
        <article class="transfer-request-item">
          <div>
            <strong>${escapeHtml(request.playerId || "Sin ID")}</strong>
            <p>Posicion: ${escapeHtml(request.position || "Por definir")}</p>
            <p>Telefono: ${escapeHtml(request.phone || "Sin telefono")}</p>
          </div>
          <div class="transfer-request-meta">
            <span class="access-badge neutral">${escapeHtml(request.status || "Pendiente")}</span>
            <small>${escapeHtml(formatDateTime(request.submittedAt))}</small>
          </div>
        </article>
      `
    )
    .join("");
}

function renderStandings() {
  if (!state.clubs.length) {
    clubStandingsBody.innerHTML = createEmptyRow(10);
    return;
  }

  clubStandingsBody.innerHTML = sortClubs(state.clubs)
    .map(
      (club, index) => `
        <tr>
          <td><span class="rank-badge">${index + 1}</span></td>
          <td>${escapeHtml(club.name)}</td>
          <td>${numberValue(club.played)}</td>
          <td>${numberValue(club.wins)}</td>
          <td>${numberValue(club.draws)}</td>
          <td>${numberValue(club.losses)}</td>
          <td>${numberValue(club.goalsFor)}</td>
          <td>${numberValue(club.goalsAgainst)}</td>
          <td>${goalDifference(club)}</td>
          <td><span class="points-badge">${pointsFor(club)}</span></td>
        </tr>
      `
    )
    .join("");
}

function getTopPlayerForClub(clubId) {
  return sortPlayers(
    state.players.filter((player) => player.clubId === clubId),
    "rating"
  )[0];
}

function renderClubCards() {
  if (!state.clubs.length) {
    clubCards.innerHTML = emptyStateTemplate.innerHTML;
    return;
  }

  clubCards.innerHTML = sortClubs(state.clubs)
    .map((club) => {
      const rosterCount = state.players.filter((player) => player.clubId === club.id).length;
      const starPlayer = getTopPlayerForClub(club.id);

      return `
        <article class="club-card" data-reveal>
          <div class="club-card-head">
            <span class="club-dot" style="background:${escapeHtml(club.color || "#77f2ad")}"></span>
            <div>
              <h4>${escapeHtml(club.name)}</h4>
              <span class="club-meta">${escapeHtml(club.country || "Global")} - Contacto: ${escapeHtml(club.contact || "Por asignar")}</span>
              <span class="club-meta">${escapeHtml(club.stadium || "Sin estadio asignado")}</span>
            </div>
          </div>

          <p class="club-meta">
            Referente: ${starPlayer ? `${escapeHtml(starPlayer.name)} (${numberValue(starPlayer.rating).toFixed(1)})` : "Por definir"}
          </p>

          <div class="club-stats">
            <div class="club-stat">
              <span>Puntos</span>
              <strong class="club-points">${pointsFor(club)}</strong>
            </div>
            <div class="club-stat">
              <span>DG</span>
              <strong class="club-points">${goalDifference(club)}</strong>
            </div>
            <div class="club-stat">
              <span>Plantel</span>
              <strong class="club-points">${rosterCount}</strong>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function populateFixtureFilter() {
  const selectedRound = fixtureRoundFilter.value;
  fixtureRoundFilter.innerHTML = [
    '<option value="">Todas las fechas</option>',
    ...state.schedule.map((round) => `<option value="${round.fecha}">Fecha ${round.fecha}</option>`),
  ].join("");

  if (selectedRound && state.schedule.some((round) => String(round.fecha) === selectedRound)) {
    fixtureRoundFilter.value = selectedRound;
  }
}

function getMatchResult(roundNumber, leg, homeId, awayId) {
  return state.matches.find((match) =>
    numberValue(match.round) === numberValue(roundNumber) &&
    String(match.leg || "").toLowerCase() === String(leg || "").toLowerCase() &&
    match.homeId === homeId &&
    match.awayId === awayId
  );
}

function parseDetailLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function composeMatchHighlights(scorers, assists) {
  return [
    ...scorers.map((item) => `Gol: ${item}`),
    ...assists.map((item) => `Asistencia: ${item}`),
  ];
}

function getScheduledMatches(roundNumber, leg) {
  const round = state.schedule.find((item) => item.fecha === numberValue(roundNumber));
  if (!round) {
    return [];
  }

  return String(leg).toLowerCase() === "vuelta" ? round.vuelta : round.ida;
}

function getSelectedScheduleMatch() {
  const roundNumber = numberValue(matchRoundSelect.value);
  const leg = String(matchLegSelect.value || "ida").toLowerCase();
  const matchIndex = numberValue(matchFixtureSelect.value);
  const matches = getScheduledMatches(roundNumber, leg);
  return {
    roundNumber,
    leg,
    matchIndex,
    match: matches[matchIndex] || null,
  };
}

function getStatusLabel(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "final") {
    return "Final";
  }
  if (normalized === "aplazado") {
    return "Aplazado";
  }
  return "Pendiente";
}

function getStatusValue(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "aplazado") {
    return "aplazado";
  }
  if (normalized === "final") {
    return "final";
  }
  return "pendiente";
}

function renderFixtureDetailGroup(title, items) {
  if (!items.length) {
    return "";
  }

  return `
    <div class="fixture-detail-group">
      <span>${escapeHtml(title)}</span>
      <ul class="fixture-detail-list">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderFixtureList(matches, roundNumber, leg) {
  return matches
    .map((match, index) => {
      const homeClub = getClubById(match.homeId);
      const awayClub = getClubById(match.awayId);
      const result = getMatchResult(roundNumber, leg, match.homeId, match.awayId);
      const scorers = Array.isArray(result?.scorers) ? result.scorers : [];
      const assists = Array.isArray(result?.assists) ? result.assists : [];
      const highlights = Array.isArray(result?.highlights)
        ? result.highlights.filter((item) => !/^Gol: |^Asistencia: /i.test(String(item)))
        : [];

      return `
        <li class="fixture-item">
          <span class="fixture-matchday">Partido ${index + 1}</span>
          <strong>${escapeHtml(homeClub?.name || "Por definir")} vs ${escapeHtml(awayClub?.name || "Por definir")}</strong>
          <small>${escapeHtml(homeClub?.country || "Global")} vs ${escapeHtml(awayClub?.country || "Global")}</small>
          ${
            result
              ? `
                <div class="fixture-result">
                  <span class="fixture-score">${numberValue(result.homeGoals)} - ${numberValue(result.awayGoals)}</span>
                  <span class="fixture-status">${escapeHtml(result.status || "Final")}</span>
                </div>
                ${renderFixtureDetailGroup("Goles", scorers)}
                ${renderFixtureDetailGroup("Asistencias", assists)}
                ${
                  highlights.length
                    ? `<ul class="fixture-highlights">${highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
                    : ""
                }
              `
              : '<span class="fixture-status pending">Pendiente</span>'
          }
        </li>
      `;
    })
    .join("");
}

function renderFixtures() {
  if (!state.schedule.length) {
    fixturesGrid.innerHTML = emptyStateTemplate.innerHTML;
    return;
  }

  const scheduleWindow = getScheduleWindowInfo();
  const selectedRound = numberValue(fixtureRoundFilter.value);
  const roundsToRender = selectedRound
    ? state.schedule.filter((round) => round.fecha === selectedRound)
    : state.schedule;

  fixturesSummary.textContent =
    `${state.schedule.length} fechas base, ${state.schedule.length * 2} jornadas totales y ` +
    `${getScheduledMatchCount()} partidos programados. Horario oficial: ${scheduleWindow.shortLabel} (${scheduleWindow.zoneLabel}).`;

  if (!roundsToRender.length) {
    fixturesGrid.innerHTML = emptyStateTemplate.innerHTML;
    return;
  }

  fixturesGrid.innerHTML = roundsToRender
    .map(
      (round) => `
        <article class="fixture-round" data-reveal>
          <div class="fixture-round-head">
            <p class="section-tag">Fecha ${round.fecha}</p>
            <h4>Serie de ida y vuelta</h4>
          </div>

          <div class="fixture-columns">
            <section class="fixture-column">
              <div class="fixture-column-head">
                <span>Ida</span>
                <strong>Jornada ${round.fecha}</strong>
              </div>
              <ul class="fixture-list">${renderFixtureList(round.ida, round.fecha, "ida")}</ul>
            </section>

            <section class="fixture-column">
              <div class="fixture-column-head">
                <span>Vuelta</span>
                <strong>Jornada ${round.fecha + state.schedule.length}</strong>
              </div>
              <ul class="fixture-list">${renderFixtureList(round.vuelta, round.fecha, "vuelta")}</ul>
            </section>
          </div>
        </article>
      `
    )
    .join("");

  observeRevealTargets();
}
function populatePlayerFilters() {
  const selectedClub = playerClubFilter.value;
  const selectedPosition = playerPositionFilter.value;

  playerClubFilter.innerHTML = [
    '<option value="">Todos los clubes</option>',
    ...state.clubs.map((club) => `<option value="${escapeHtml(club.id)}">${escapeHtml(club.name)}</option>`),
  ].join("");

  const positions = [...new Set(state.players.map((player) => player.position).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

  playerPositionFilter.innerHTML = [
    '<option value="">Todas las posiciones</option>',
    ...positions.map((position) => `<option value="${escapeHtml(position)}">${escapeHtml(position)}</option>`),
  ].join("");

  if (selectedClub) {
    playerClubFilter.value = selectedClub;
  }
  if (selectedPosition) {
    playerPositionFilter.value = selectedPosition;
  }
}

function getFilteredPlayers() {
  const searchValue = playerSearch.value.trim().toLowerCase();
  const clubValue = playerClubFilter.value;
  const positionValue = playerPositionFilter.value;

  return sortPlayers(state.players, "rating").filter((player) => {
    const clubName = getClubName(player.clubId).toLowerCase();
    const country = String(player.country || "").toLowerCase();

    const matchesSearch =
      !searchValue ||
      String(player.name || "").toLowerCase().includes(searchValue) ||
      clubName.includes(searchValue) ||
      country.includes(searchValue);

    return matchesSearch &&
      (!clubValue || player.clubId === clubValue) &&
      (!positionValue || player.position === positionValue);
  });
}

function renderPlayers() {
  const players = getFilteredPlayers();

  if (!players.length) {
    playersTableBody.innerHTML = createEmptyRow(12);
    return;
  }

  playersTableBody.innerHTML = players
    .map(
      (player) => `
        <tr>
          <td>${escapeHtml(player.name)}</td>
          <td>${escapeHtml(player.country || "Global")}</td>
          <td>${escapeHtml(getClubName(player.clubId))}</td>
          <td>${escapeHtml(player.position)}</td>
          <td>${numberValue(player.overall)}</td>
          <td>${numberValue(player.matches)}</td>
          <td>${numberValue(player.goals)}</td>
          <td>${numberValue(player.assists)}</td>
          <td>${numberValue(player.mvps)}</td>
          <td>${numberValue(player.cleanSheets)}</td>
          <td>${numberValue(player.saves)}</td>
          <td>${numberValue(player.rating).toFixed(1)}</td>
        </tr>
      `
    )
    .join("");

  observeRevealTargets();
}

function renderLeaderboards() {
  if (!state.players.length) {
    leaderboards.innerHTML = emptyStateTemplate.innerHTML;
    return;
  }

  const categories = [
    { title: "Goleadores", field: "goals", suffix: "goles" },
    { title: "Asistidores", field: "assists", suffix: "asistencias" },
    { title: "MVP", field: "mvps", suffix: "MVP" },
    { title: "Porterias a cero", field: "cleanSheets", suffix: "CS" },
    { title: "Atajadas", field: "saves", suffix: "atajadas" },
    { title: "Mejor media", field: "rating", suffix: "de nota" },
  ];

  leaderboards.innerHTML = categories
    .map((category) => {
      const items = sortPlayers(state.players, category.field)
        .slice(0, 4)
        .map((player) => {
          const value =
            category.field === "rating"
              ? numberValue(player[category.field]).toFixed(1)
              : numberValue(player[category.field]);

          return `
            <div class="leader-item">
              <div>
                <strong>${escapeHtml(player.name)}</strong>
                <small>${escapeHtml(getClubName(player.clubId))} - ${escapeHtml(player.position)} - ${escapeHtml(player.country || "Global")}</small>
              </div>
              <strong>${escapeHtml(value)} ${escapeHtml(category.suffix)}</strong>
            </div>
          `;
        })
        .join("");

      return `
        <section class="leader-section">
          <h4>${escapeHtml(category.title)}</h4>
          ${items}
        </section>
      `;
    })
    .join("");
}

function fillClubForm() {
  const club = getClubById(clubEditorSelect.value) || state.clubs[0];
  if (!club) {
    return;
  }

  clubEditorSelect.value = club.id;
  clubPlayedInput.value = numberValue(club.played);
  clubWinsInput.value = numberValue(club.wins);
  clubDrawsInput.value = numberValue(club.draws);
  clubLossesInput.value = numberValue(club.losses);
  clubGoalsForInput.value = numberValue(club.goalsFor);
  clubGoalsAgainstInput.value = numberValue(club.goalsAgainst);
}

function fillPlayerForm() {
  const player = state.players.find((item) => item.id === playerEditorSelect.value) || state.players[0];
  if (!player) {
    return;
  }

  playerEditorSelect.value = player.id;
  playerPositionInput.value = player.position || "POR DEFINIR";
  playerOverallInput.value = numberValue(player.overall);
  playerMatchesInput.value = numberValue(player.matches);
  playerGoalsInput.value = numberValue(player.goals);
  playerAssistsInput.value = numberValue(player.assists);
  playerMvpsInput.value = numberValue(player.mvps);
  playerCleanSheetsInput.value = numberValue(player.cleanSheets);
  playerSavesInput.value = numberValue(player.saves);
  playerRatingInput.value = numberValue(player.rating).toFixed(1);
}

function fillMatchForm() {
  const { roundNumber, leg, matchIndex, match } = getSelectedScheduleMatch();
  if (!match) {
    matchFixtureSelect.innerHTML = '<option value="">Sin partidos</option>';
    matchHomeTeamInput.value = "";
    matchAwayTeamInput.value = "";
    matchStatusSelect.value = "pendiente";
    matchHomeGoalsInput.value = 0;
    matchAwayGoalsInput.value = 0;
    matchGoalsDetailsInput.value = "";
    matchAssistsDetailsInput.value = "";
    return;
  }

  const result = getMatchResult(roundNumber, leg, match.homeId, match.awayId);
  const homeClub = getClubById(match.homeId);
  const awayClub = getClubById(match.awayId);

  matchFixtureSelect.value = `${matchIndex}`;
  matchHomeTeamInput.value = homeClub?.name || "Por definir";
  matchAwayTeamInput.value = awayClub?.name || "Por definir";
  matchStatusSelect.value = getStatusValue(result?.status);
  matchHomeGoalsInput.value = result ? numberValue(result.homeGoals) : 0;
  matchAwayGoalsInput.value = result ? numberValue(result.awayGoals) : 0;
  matchGoalsDetailsInput.value = Array.isArray(result?.scorers) ? result.scorers.join("\n") : "";
  matchAssistsDetailsInput.value = Array.isArray(result?.assists) ? result.assists.join("\n") : "";
}

function populateMatchEditor() {
  const selectedRound = matchRoundSelect.value;
  const selectedLeg = matchLegSelect.value || "ida";
  const selectedMatch = matchFixtureSelect.value;

  matchRoundSelect.innerHTML = state.schedule
    .map((round) => `<option value="${round.fecha}">Fecha ${round.fecha}</option>`)
    .join("");

  if (selectedRound && state.schedule.some((round) => String(round.fecha) === selectedRound)) {
    matchRoundSelect.value = selectedRound;
  } else if (state.schedule[0]) {
    matchRoundSelect.value = `${state.schedule[0].fecha}`;
  }

  matchLegSelect.value = selectedLeg;

  const matches = getScheduledMatches(matchRoundSelect.value, matchLegSelect.value);
  matchFixtureSelect.innerHTML = matches.length
    ? matches
        .map((match, index) => {
          const homeClub = getClubById(match.homeId);
          const awayClub = getClubById(match.awayId);
          return `<option value="${index}">${escapeHtml(homeClub?.name || "Por definir")} vs ${escapeHtml(awayClub?.name || "Por definir")}</option>`;
        })
        .join("")
    : '<option value="">Sin partidos</option>';

  if (selectedMatch && matches[Number(selectedMatch)]) {
    matchFixtureSelect.value = selectedMatch;
  } else if (matches.length) {
    matchFixtureSelect.value = "0";
  }

  fillMatchForm();
}

function fillMarketSettingsForm() {
  const market = getTransferMarketConfig();
  marketModeSelect.value = market.mode;
  marketManualStatusSelect.value = market.manualStatus;
  marketManualStatusSelect.disabled = market.mode !== "manual";
}

function syncMarketModeControls() {
  marketManualStatusSelect.disabled = marketModeSelect.value !== "manual";
}

function populateEditorSelects() {
  const selectedClub = clubEditorSelect.value;
  const selectedPlayer = playerEditorSelect.value;

  clubEditorSelect.innerHTML = state.clubs
    .map((club) => `<option value="${escapeHtml(club.id)}">${escapeHtml(club.name)}</option>`)
    .join("");

  playerEditorSelect.innerHTML = sortPlayers(state.players, "rating")
    .map((player) => `<option value="${escapeHtml(player.id)}">${escapeHtml(player.name)} - ${escapeHtml(getClubName(player.clubId))}</option>`)
    .join("");

  if (selectedClub && state.clubs.some((club) => club.id === selectedClub)) {
    clubEditorSelect.value = selectedClub;
  }
  if (selectedPlayer && state.players.some((player) => player.id === selectedPlayer)) {
    playerEditorSelect.value = selectedPlayer;
  }

  fillClubForm();
  fillPlayerForm();
  populateMatchEditor();
  fillMarketSettingsForm();
}

function setSaveStatus(message, tone = "neutral") {
  saveStatus.textContent = message;
  saveStatus.className = `save-status ${tone}`;
}

function setEditorState() {
  const signedIn = Boolean(state.user);
  signInButton.classList.toggle("hidden", signedIn);
  signOutButton.classList.toggle("hidden", !signedIn);

  authUser.textContent = state.user?.email || "No has iniciado sesion";
  editorCountLabel.textContent = `${state.firebaseSetup.editorEmails.length} correos`;
  dataSourceLabel.textContent = state.sourceLabel;

  if (!state.firebaseSetup.enabled) {
    authStatus.textContent = "Modo publico";
    authHelp.textContent =
      "La web sigue funcionando con JSON publico. Para login con Google debes completar firebase-config.js.";
    configStatus.textContent =
      "Firebase aun no esta configurado. Cuando lo actives, podras invitar correos para editar.";
    editorBadge.textContent = "Sin permisos de edicion";
    editorBadge.className = "access-badge neutral";
    editorPanel.classList.add("hidden");
    return;
  }

  if (state.user && state.canEdit) {
    authStatus.textContent = "Editor conectado";
    authHelp.textContent = "Tu correo esta autorizado. Ya puedes editar clubes, jugadores, partidos y mercado de fichajes desde esta web.";
    editorBadge.textContent = "Permiso de edicion activo";
    editorBadge.className = "access-badge success";
    editorPanel.classList.remove("hidden");
  } else if (state.user) {
    authStatus.textContent = "Sesion iniciada sin permisos";
    authHelp.textContent =
      "Tu correo entro con Google, pero todavia no esta incluido en editorEmails o en las reglas de Firestore.";
    editorBadge.textContent = "Solo lectura";
    editorBadge.className = "access-badge warning";
    editorPanel.classList.add("hidden");
  } else {
    authStatus.textContent = "Listo para iniciar sesion";
    authHelp.textContent =
      "Entra con Google. Si tu correo esta autorizado, se abrira el panel de edicion automaticamente.";
    editorBadge.textContent = "Esperando login";
    editorBadge.className = "access-badge neutral";
    editorPanel.classList.add("hidden");
  }

  if (state.sourceLabel === "Firestore en vivo") {
    configStatus.textContent = "La liga se esta leyendo desde Firestore y la web/app vera los cambios en vivo.";
  } else if (state.firebaseStatus === "ready") {
    configStatus.textContent =
      "Firebase esta listo. Si guardas por primera vez, se creara el documento de la liga en Firestore.";
  } else if (state.firebaseStatus === "error") {
    configStatus.textContent =
      "Firebase no pudo inicializarse. Revisa firebase-config.js, dominios autorizados y reglas.";
  } else {
    configStatus.textContent = "Firebase esta activo, pero la web sigue usando el JSON publico como respaldo.";
  }

  editorPanelNote.textContent =
    "Los cambios se guardan en Firestore para que la web y la APK conectada lean resultados, goles, asistencias y mercado al abrirse.";
}

function renderAll() {
  renderMeta();
  renderSummary();
  renderCommandCenter();
  renderTransferMarket();
  renderTransferRequests();
  renderStandings();
  populateFixtureFilter();
  renderFixtures();
  renderClubCards();
  populatePlayerFilters();
  renderPlayers();
  renderLeaderboards();
  populateEditorSelects();
  setEditorState();
  observeRevealTargets();
}
function setupRevealObserver() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll("[data-reveal]").forEach((item) => item.classList.add("is-visible"));
    return;
  }

  state.revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          state.revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );
}

function observeRevealTargets() {
  const targets = document.querySelectorAll("[data-reveal]:not(.is-visible)");
  if (!state.revealObserver) {
    targets.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  targets.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 40, 180)}ms`;
    state.revealObserver.observe(item);
  });
}

async function fetchRemoteData() {
  if (!["http:", "https:"].includes(window.location.protocol)) {
    return null;
  }

  try {
    const response = await fetch(DATA_PATH, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const text = await response.text();
    const cleanText = text.replace(/^\uFEFF/, "");
    return JSON.parse(cleanText);
  } catch (error) {
    console.warn("No se pudieron cargar datos remotos, usando respaldo local.", error);
    return null;
  }
}

async function loadBaseData() {
  const remoteData = await fetchRemoteData();
  const localSeed = window.LEAGUE_DATA ? deepClone(window.LEAGUE_DATA) : null;
  const data = remoteData || localSeed;

  if (!data) {
    throw new Error("No se encontraron datos del torneo.");
  }

  applyLeagueData(data, {
    sourceLabel: remoteData ? "JSON publico" : "Respaldo local",
  });
}

async function saveCurrentLeague(changeLabel) {
  if (!state.firebaseSetup.enabled) {
    setSaveStatus("Activa Firebase para guardar cambios compartidos desde la web.", "warning");
    return;
  }

  if (!state.user || !isEditor(state.user)) {
    setSaveStatus("Tu correo no tiene permiso de edicion.", "warning");
    return;
  }

  const payload = buildLeagueDataForSave();
  applyLeagueData(payload, { sourceLabel: "Firestore en vivo" });
  renderAll();

  setSaveStatus("Guardando cambios en la nube...", "pending");

  try {
    await saveLeagueData(payload, state.user);
    state.firebaseStatus = "live";
    state.sourceLabel = "Firestore en vivo";
    setSaveStatus(`${changeLabel} guardado correctamente.`, "success");
    setEditorState();
  } catch (error) {
    console.error(error);
    setSaveStatus("No se pudo guardar en Firestore. Revisa la configuracion y las reglas.", "error");
  }
}

async function handleClubSubmit(event) {
  event.preventDefault();

  const club = getClubById(clubEditorSelect.value);
  if (!club) {
    return;
  }

  club.played = numberValue(clubPlayedInput.value);
  club.wins = numberValue(clubWinsInput.value);
  club.draws = numberValue(clubDrawsInput.value);
  club.losses = numberValue(clubLossesInput.value);
  club.goalsFor = numberValue(clubGoalsForInput.value);
  club.goalsAgainst = numberValue(clubGoalsAgainstInput.value);
  state.meta.updatedAt = todayIsoLocal();

  renderAll();
  await saveCurrentLeague(`Club ${club.name}`);
}

async function handlePlayerSubmit(event) {
  event.preventDefault();

  const player = state.players.find((item) => item.id === playerEditorSelect.value);
  if (!player) {
    return;
  }

  player.position = playerPositionInput.value.trim() || "POR DEFINIR";
  player.overall = numberValue(playerOverallInput.value);
  player.matches = numberValue(playerMatchesInput.value);
  player.goals = numberValue(playerGoalsInput.value);
  player.assists = numberValue(playerAssistsInput.value);
  player.mvps = numberValue(playerMvpsInput.value);
  player.cleanSheets = numberValue(playerCleanSheetsInput.value);
  player.saves = numberValue(playerSavesInput.value);
  player.rating = numberValue(playerRatingInput.value);
  state.meta.updatedAt = todayIsoLocal();

  renderAll();
  await saveCurrentLeague(`Jugador ${player.name}`);
}

async function handleMatchSubmit(event) {
  event.preventDefault();

  const { roundNumber, leg, matchIndex, match } = getSelectedScheduleMatch();
  if (!match) {
    setSaveStatus("No hay un partido valido seleccionado para guardar.", "warning");
    return;
  }

  const homeClub = getClubById(match.homeId);
  const awayClub = getClubById(match.awayId);
  const scorers = parseDetailLines(matchGoalsDetailsInput.value);
  const assists = parseDetailLines(matchAssistsDetailsInput.value);
  const status = getStatusLabel(matchStatusSelect.value);
  const homeGoals = numberValue(matchHomeGoalsInput.value);
  const awayGoals = numberValue(matchAwayGoalsInput.value);
  const existingIndex = state.matches.findIndex((item) =>
    numberValue(item.round) === roundNumber &&
    String(item.leg || "").toLowerCase() === leg &&
    item.homeId === match.homeId &&
    item.awayId === match.awayId
  );

  const shouldClear =
    status === "Pendiente" &&
    homeGoals === 0 &&
    awayGoals === 0 &&
    !scorers.length &&
    !assists.length;

  if (shouldClear) {
    if (existingIndex >= 0) {
      state.matches.splice(existingIndex, 1);
    }
  } else {
    const payload = normalizeMatch({
      round: roundNumber,
      leg,
      matchIndex,
      homeId: match.homeId,
      awayId: match.awayId,
      homeGoals,
      awayGoals,
      status,
      scorers,
      assists,
      highlights: composeMatchHighlights(scorers, assists),
    });

    if (existingIndex >= 0) {
      state.matches.splice(existingIndex, 1, payload);
    } else {
      state.matches.push(payload);
    }
  }

  state.meta.updatedAt = todayIsoLocal();
  renderAll();
  await saveCurrentLeague(`Partido ${homeClub?.name || "Local"} vs ${awayClub?.name || "Visitante"}`);
}

function setTransferSubmitStatus(message, tone = "neutral") {
  transferSubmitStatus.textContent = message;
  transferSubmitStatus.className = `save-status ${tone}`;
}

async function handleMarketSettingsSubmit(event) {
  event.preventDefault();

  state.meta.transferMarket = {
    ...getTransferMarketConfig(),
    mode: marketModeSelect.value === "manual" ? "manual" : "automatic",
    manualStatus: marketManualStatusSelect.value === "open" ? "open" : "closed",
    timezone: "America/Santiago",
    automaticWindowLabel: "Sabado desde las 00:00 hora Chile",
  };
  state.meta.updatedAt = todayIsoLocal();

  renderAll();
  await saveCurrentLeague("Mercado de fichajes");
}

async function handleTransferRequestSubmit(event) {
  event.preventDefault();

  const market = getTransferMarketState();
  if (!state.firebaseSetup.enabled) {
    setTransferSubmitStatus("Firebase no esta disponible para enviar inscripciones.", "error");
    return;
  }

  if (!market.isOpen) {
    setTransferSubmitStatus("El mercado esta cerrado. No se pueden enviar inscripciones por ahora.", "warning");
    return;
  }

  const playerId = transferPlayerIdInput.value.trim();
  const position = transferPositionInput.value.trim();
  const phone = transferPhoneInput.value.trim();

  if (!playerId || !position || !phone) {
    setTransferSubmitStatus("Completa ID, posicion y numero de telefono para enviar la inscripcion.", "warning");
    return;
  }

  setTransferSubmitStatus("Enviando inscripcion al mercado...", "pending");

  try {
    await createTransferRequest({ playerId, position, phone });
    transferMarketForm.reset();
    setTransferSubmitStatus("Inscripcion enviada correctamente. Los administradores ya pueden verla.", "success");
  } catch (error) {
    console.error(error);
    setTransferSubmitStatus("No se pudo enviar la inscripcion. Intenta de nuevo en unos segundos.", "error");
  }
}

function handleDownloadJson() {
  const payload = buildLeagueDataForSave();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `scc-league-backup-${todayIsoLocal()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  setSaveStatus("Respaldo JSON descargado.", "success");
}

function setupFilters() {
  playerSearch.addEventListener("input", renderPlayers);
  playerClubFilter.addEventListener("change", renderPlayers);
  playerPositionFilter.addEventListener("change", renderPlayers);
  fixtureRoundFilter.addEventListener("change", renderFixtures);
}

function setupEditors() {
  clubEditorSelect.addEventListener("change", fillClubForm);
  playerEditorSelect.addEventListener("change", fillPlayerForm);
  matchRoundSelect.addEventListener("change", populateMatchEditor);
  matchLegSelect.addEventListener("change", populateMatchEditor);
  matchFixtureSelect.addEventListener("change", fillMatchForm);
  marketModeSelect.addEventListener("change", syncMarketModeControls);
  clubEditorForm.addEventListener("submit", handleClubSubmit);
  playerEditorForm.addEventListener("submit", handlePlayerSubmit);
  matchEditorForm.addEventListener("submit", handleMatchSubmit);
  marketSettingsForm.addEventListener("submit", handleMarketSettingsSubmit);
  transferMarketForm.addEventListener("submit", handleTransferRequestSubmit);
  downloadJsonButton.addEventListener("click", handleDownloadJson);
}

function stopTransferRequestsSubscription() {
  if (typeof state.transferRequestsUnsubscribe === "function") {
    state.transferRequestsUnsubscribe();
  }
  state.transferRequestsUnsubscribe = null;
}

function startTransferRequestsSubscription() {
  stopTransferRequestsSubscription();

  if (!state.firebaseSetup.enabled || !state.canEdit) {
    state.transferRequests = [];
    renderTransferRequests();
    return;
  }

  state.transferRequestsUnsubscribe = subscribeTransferRequests(
    (items) => {
      state.transferRequests = items;
      renderTransferRequests();
    },
    (error) => {
      console.error(error);
      transferRequestsList.innerHTML = '<p class="panel-copy">No se pudieron cargar las solicitudes del mercado.</p>';
    }
  );
}

function setupMarketClock() {
  if (state.marketClock) {
    window.clearInterval(state.marketClock);
  }

  state.marketClock = window.setInterval(() => {
    renderTransferMarket();
    renderCommandCenter();
    renderLiveScheduleClocks();
  }, 60000);
}

function setupAuthButtons() {
  signInButton.addEventListener("click", async () => {
    if (!state.firebaseSetup.enabled) {
      window.alert("Primero configura firebase-config.js para activar el login con Google.");
      return;
    }

    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
      window.alert("No se pudo iniciar sesion con Google. Revisa Firebase Auth y los dominios autorizados.");
    }
  });

  signOutButton.addEventListener("click", async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error(error);
      window.alert("No se pudo cerrar la sesion.");
    }
  });
}

async function setupFirebaseIntegration() {
  state.firebaseSetup = getFirebaseSetup();
  setEditorState();

  await initFirebase({
    onStatusChange: (status) => {
      state.firebaseStatus = status.type;
      if (status.sourceLabel && state.sourceLabel !== "Firestore en vivo") {
        state.sourceLabel = status.sourceLabel;
      }
      setEditorState();
    },
    onUserChange: ({ user, canEdit }) => {
      state.user = user || null;
      state.canEdit = Boolean(canEdit);
      startTransferRequestsSubscription();
      setEditorState();
    },
    onLeagueData: ({ data, sourceLabel }) => {
      applyLeagueData(data, { sourceLabel: sourceLabel || "Firestore en vivo" });
      renderAll();
      setSaveStatus("La liga se sincronizo con Firestore.", "success");
    },
  });
}

function showFatalError(error) {
  console.error(error);
  summaryGrid.innerHTML = emptyStateTemplate.innerHTML;
  clubStandingsBody.innerHTML = createEmptyRow(10);
  fixturesGrid.innerHTML = emptyStateTemplate.innerHTML;
  clubCards.innerHTML = emptyStateTemplate.innerHTML;
  playersTableBody.innerHTML = createEmptyRow(12);
  leaderboards.innerHTML = emptyStateTemplate.innerHTML;
  transferRequestsList.innerHTML = emptyStateTemplate.innerHTML;
  footerUpdate.textContent = "No fue posible cargar la informacion del torneo";
  setSaveStatus("No fue posible cargar la informacion del torneo.", "error");
}

async function init() {
  try {
    setupRevealObserver();
    setupMarketClock();
    await loadBaseData();
    renderAll();
    setupFilters();
    setupEditors();
    setupAuthButtons();
    await setupFirebaseIntegration();
  } catch (error) {
    showFatalError(error);
  }
}

init();
