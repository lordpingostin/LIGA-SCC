import {
  createCommunityMessage,
  createTransferRequest,
  getFirebaseSetup,
  initFirebase,
  isEditor,
  saveLeagueData,
  signInWithGoogle,
  signOutUser,
  subscribeCommunityMessages,
  subscribeTransferRequests,
  updateTransferRequest,
} from "./firebase-service.js?v=20260411a";

const DATA_PATH = "league-data.json";
const FIXED_ADMIN = "SLYINTHEBLOCK";
const ROSTER_OWNER_EMAIL = "assencarlos2007@gmail.com";
const DEFAULT_NEWS_ITEMS = [];
const DEFAULT_COMMUNITY_ITEMS = [];
const LEGACY_PRIVATE_NEWS_TITLES = new Set([
  "panel admin renovado",
  "respaldo automatico",
  "liga en vivo",
]);
const LEGACY_PRIVATE_COMMUNITY_TITLES = new Set([
  "mercado y contacto",
  "calendario semanal",
  "gestion compartida",
]);

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
const heroSection = document.querySelector(".hero-section");
const heroContent = document.querySelector(".hero-content");
const heroStage = document.querySelector(".hero-stage");
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
const newsFeed = document.getElementById("newsFeed");
const communityGrid = document.getElementById("communityGrid");
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
const mainSections = [...document.querySelectorAll(".app-shell > section")];
const topbarViewLinks = [...document.querySelectorAll("[data-view-link]")];
const staticViewLinks = [...document.querySelectorAll("[data-app-view]")];
const clubEditorForm = document.getElementById("clubEditorForm");
const clubEditorSelect = document.getElementById("clubEditorSelect");
const clubPlayedInput = document.getElementById("clubPlayedInput");
const clubWinsInput = document.getElementById("clubWinsInput");
const clubDrawsInput = document.getElementById("clubDrawsInput");
const clubLossesInput = document.getElementById("clubLossesInput");
const clubGoalsForInput = document.getElementById("clubGoalsForInput");
const clubGoalsAgainstInput = document.getElementById("clubGoalsAgainstInput");
const playerEditorForm = document.getElementById("playerEditorForm");
const playerEditorClubSelect = document.getElementById("playerEditorClubSelect");
const playerEditorClubSummary = document.getElementById("playerEditorClubSummary");
const openClubPerformanceEditorButton = document.getElementById("openClubPerformanceEditorButton");
const openRosterManagerButton = document.getElementById("openRosterManagerButton");
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
const publicFreeAgentsCount = document.getElementById("publicFreeAgentsCount");
const publicFreeAgentsList = document.getElementById("publicFreeAgentsList");
const transferMarketSummary = document.getElementById("transferMarketSummary");
const marketStatusLabel = document.getElementById("marketStatusLabel");
const marketModeLabel = document.getElementById("marketModeLabel");
const marketChileTimeLabel = document.getElementById("marketChileTimeLabel");
const marketWindowLabel = document.getElementById("marketWindowLabel");
const marketHelpText = document.getElementById("marketHelpText");
const transferMarketForm = document.getElementById("transferMarketForm");
const transferPlayerIdInput = document.getElementById("transferPlayerIdInput");
const transferPositionInput = document.getElementById("transferPositionInput");
const transferModeSelect = document.getElementById("transferModeSelect");
const transferTargetClubField = document.getElementById("transferTargetClubField");
const transferTargetClubSelect = document.getElementById("transferTargetClubSelect");
const transferPhoneInput = document.getElementById("transferPhoneInput");
const transferSubmitButton = document.getElementById("transferSubmitButton");
const transferSubmitStatus = document.getElementById("transferSubmitStatus");
const newsEditorForm = document.getElementById("newsEditorForm");
const communityEditorForm = document.getElementById("communityEditorForm");
const newsEntriesInput = document.getElementById("newsEntriesInput");
const communityEntriesInput = document.getElementById("communityEntriesInput");
const downloadJsonButton = document.getElementById("downloadJsonButton");
const saveStatus = document.getElementById("saveStatus");
const clubPerformanceModal = document.getElementById("clubPerformanceModal");
const clubPerformanceModalBackdrop = document.getElementById("clubPerformanceModalBackdrop");
const closeClubPerformanceModalButton = document.getElementById("closeClubPerformanceModalButton");
const clubPerformanceModalSelect = document.getElementById("clubPerformanceModalSelect");
const clubPerformanceModalSummary = document.getElementById("clubPerformanceModalSummary");
const clubPerformanceTableBody = document.getElementById("clubPerformanceTableBody");
const clubPerformanceSaveStatus = document.getElementById("clubPerformanceSaveStatus");
const saveClubPerformanceButton = document.getElementById("saveClubPerformanceButton");
const rosterManagerModal = document.getElementById("rosterManagerModal");
const rosterManagerModalBackdrop = document.getElementById("rosterManagerModalBackdrop");
const closeRosterManagerModalButton = document.getElementById("closeRosterManagerModalButton");
const rosterManagerClubSelect = document.getElementById("rosterManagerClubSelect");
const rosterManagerSummary = document.getElementById("rosterManagerSummary");
const rosterManagerTableBody = document.getElementById("rosterManagerTableBody");
const rosterManagerSaveStatus = document.getElementById("rosterManagerSaveStatus");
const saveRosterManagerButton = document.getElementById("saveRosterManagerButton");
const addPlayerForm = document.getElementById("addPlayerForm");
const addPlayerIdInput = document.getElementById("addPlayerIdInput");
const addPlayerNameInput = document.getElementById("addPlayerNameInput");
const addPlayerPositionInput = document.getElementById("addPlayerPositionInput");
const addPlayerCountryInput = document.getElementById("addPlayerCountryInput");
const addPlayerOverallInput = document.getElementById("addPlayerOverallInput");
const communityPublicForm = document.getElementById("communityPublicForm");
const communityNameInput = document.getElementById("communityNameInput");
const communityMessageInput = document.getElementById("communityMessageInput");
const communityPublicStatus = document.getElementById("communityPublicStatus");

const state = {
  rawData: null,
  meta: {},
  clubs: [],
  players: [],
  matches: [],
  schedule: [],
  transferRequests: [],
  communityMessages: [],
  user: null,
  canEdit: false,
  sourceLabel: "JSON publico",
  firebaseStatus: "disabled",
  firebaseAuthReady: false,
  firebaseErrorMessage: "",
  firebaseSetup: getFirebaseSetup(),
  revealObserver: null,
  transferRequestsUnsubscribe: null,
  communityMessagesUnsubscribe: null,
  marketClock: null,
  authBusy: false,
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
const PAGE_VIEWS = new Set(["home", "noticias", "comunidad", "admin", "admin-performance", "admin-roster", "partidos"]);
const VIEW_SECTION_MAP = {
  noticias: ["noticias"],
  comunidad: ["comunidad", "mercado-fichajes"],
  admin: ["panel-control"],
  "admin-performance": ["panel-rendimiento"],
  "admin-roster": ["panel-plantillas"],
  partidos: ["partidos"],
};

const VIEW_TOPBAR_MAP = {
  home: "home",
  noticias: "noticias",
  comunidad: "comunidad",
  admin: "admin",
  "admin-performance": "admin",
  "admin-roster": "admin",
  partidos: "partidos",
};

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

function normalizePhoneLink(value) {
  return String(value || "")
    .trim()
    .replace(/[^\d+]/g, "");
}

function isRosterOwner(user = state.user) {
  return String(user?.email || "").trim().toLowerCase() === ROSTER_OWNER_EMAIL;
}

function slugifyValue(value) {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "jugador";
}

function buildUniquePlayerId(seedValue) {
  const base = slugifyValue(seedValue);
  const existingIds = new Set(state.players.map((player) => String(player.id || "").trim().toLowerCase()));

  if (!existingIds.has(base)) {
    return base;
  }

  let index = 2;
  while (existingIds.has(`${base}-${index}`)) {
    index += 1;
  }

  return `${base}-${index}`;
}

function normalizeEditorialItems(items, fallbackItems) {
  if (!Array.isArray(items) || !items.length) {
    return fallbackItems.map((item) => ({ ...item }));
  }

  const normalized = items
    .map((item) => ({
      title: String(item?.title || "").trim(),
      text: String(item?.text || "").trim(),
    }))
    .filter((item) => item.title || item.text);

  return normalized.length ? normalized : fallbackItems.map((item) => ({ ...item }));
}

function serializeEditorialItems(items) {
  return items
    .map((item) => `${String(item?.title || "").trim()} | ${String(item?.text || "").trim()}`.trim())
    .join("\n");
}

function parseEditorialItems(rawValue, fallbackTitle) {
  return String(rawValue || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [titlePart, ...rest] = line.split("|");
      return {
        title: String(titlePart || "").trim() || `${fallbackTitle} ${index + 1}`,
        text: rest.join("|").trim(),
      };
    })
    .filter((item) => item.title || item.text);
}

function getNormalizedPathName() {
  return String(window.location.pathname || "/").replace(/\/+$/, "") || "/";
}

function buildAppViewUrl(view = "home", extraParams = {}) {
  const url = new URL("./", window.location.href);
  Object.entries(extraParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });

  if (view && view !== "home") {
    url.searchParams.set("view", view);
  } else {
    url.searchParams.delete("view");
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

function wireStaticNavigation() {
  staticViewLinks.forEach((link) => {
    const view = link.dataset.appView || "home";
    const targetUrl = buildAppViewUrl(view);
    link.setAttribute("href", targetUrl);
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.assign(targetUrl);
    });
  });
}

function getWorkspaceClubFromUrl() {
  const requestedClubId = new URLSearchParams(window.location.search).get("club");
  return getClubById(requestedClubId || "") ? requestedClubId : "";
}

function getPreferredWorkspaceClubId(fallbackClubId = "") {
  return getWorkspaceClubFromUrl() || fallbackClubId || state.clubs[0]?.id || "";
}

function updateWorkspaceClubInUrl(clubId) {
  const pathName = getNormalizedPathName();
  if (!["/admin/rendimiento", "/admin/plantillas"].includes(pathName)) {
    return;
  }

  const url = new URL(window.location.href);
  if (clubId) {
    url.searchParams.set("club", clubId);
  } else {
    url.searchParams.delete("club");
  }

  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function navigateToWorkspace(pathName, clubId = "") {
  const view = pathName === "/admin/plantillas" ? "admin-roster" : "admin-performance";
  window.location.assign(buildAppViewUrl(view, { club: clubId || null }));
}

function getCurrentView() {
  const pathName = getNormalizedPathName();
  const pathView = {
    "/noticias": "noticias",
    "/comunidad": "comunidad",
    "/admin": "admin",
    "/admin/rendimiento": "admin-performance",
    "/admin/plantillas": "admin-roster",
    "/partidos": "partidos",
  }[pathName];

  if (pathView) {
    return pathView;
  }

  const view = new URLSearchParams(window.location.search).get("view");
  return PAGE_VIEWS.has(view) ? view : "home";
}

function applyPageView() {
  let view = getCurrentView();
  if (view === "admin-performance" && !state.canEdit) {
    view = "admin";
  }
  if (view === "admin-roster" && (!state.canEdit || !isRosterOwner())) {
    view = "admin";
  }
  const focusedView = view !== "home";
  const topbarView = VIEW_TOPBAR_MAP[view] || view;

  document.body.classList.remove(
    "view-home",
    "view-noticias",
    "view-comunidad",
    "view-admin",
    "view-admin-performance",
    "view-admin-roster",
    "view-partidos",
    "focused-view"
  );
  document.body.classList.add(`view-${view}`);
  document.body.classList.toggle("focused-view", focusedView);

  topbarViewLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.viewLink === topbarView);
  });

  if (!focusedView) {
    mainSections.forEach((section) => {
      section.classList.toggle("hidden-by-view", section.classList.contains("subpage-section"));
    });
    return;
  }

  const targetSectionIds = VIEW_SECTION_MAP[view] || [];
  mainSections.forEach((section) => {
    const shouldShow = targetSectionIds.includes(section.id);
    section.classList.toggle("hidden-by-view", !shouldShow);
  });

  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
  });
}

function getWhatsAppHref(phone, message = "Hola, vi tu contacto en LIGA SCC.") {
  const normalizedPhone = normalizePhoneLink(phone);
  if (!normalizedPhone) {
    return "";
  }

  return `https://wa.me/${normalizedPhone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`;
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

function normalizeScheduleRound(round = {}, fallbackFecha = 0) {
  const normalizeFixture = (fixture = {}) => ({
    homeId: String(fixture.homeId || "").trim(),
    awayId: String(fixture.awayId || "").trim(),
  });

  const fecha = numberValue(round.fecha, fallbackFecha);
  const ida = Array.isArray(round.ida)
    ? round.ida
        .map(normalizeFixture)
        .filter((fixture) => fixture.homeId && fixture.awayId)
    : [];
  const vuelta = Array.isArray(round.vuelta)
    ? round.vuelta
        .map(normalizeFixture)
        .filter((fixture) => fixture.homeId && fixture.awayId)
    : ida.map((fixture) => ({
        homeId: fixture.awayId,
        awayId: fixture.homeId,
      }));

  return {
    fecha,
    ida,
    vuelta,
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
  normalized.meta.news = normalizeEditorialItems(normalized.meta.news, DEFAULT_NEWS_ITEMS);
  normalized.meta.community = normalizeEditorialItems(normalized.meta.community, DEFAULT_COMMUNITY_ITEMS);

  normalized.moderators = Array.isArray(normalized.moderators) ? normalized.moderators : [];
  normalized.clubs = Array.isArray(normalized.clubs) ? normalized.clubs.map(normalizeClub) : [];
  normalized.players = Array.isArray(normalized.players)
    ? dedupePlayers(normalized.players.map(normalizePlayer))
    : [];
  normalized.matches = Array.isArray(normalized.matches) ? normalized.matches.map(normalizeMatch) : [];
  normalized.schedule = Array.isArray(normalized.schedule)
    ? normalized.schedule.map((round, index) => normalizeScheduleRound(round, index + 1))
    : [];

  return normalized;
}

function getLeagueUpdatedAtValue(data = {}) {
  return String(data?.meta?.updatedAt || "").trim();
}

function shouldPreferIncomingLeagueData(incomingData) {
  const incomingUpdatedAt = getLeagueUpdatedAtValue(incomingData);
  const currentUpdatedAt = getLeagueUpdatedAtValue({ meta: state.meta });

  if (!incomingUpdatedAt || !currentUpdatedAt) {
    return true;
  }

  return incomingUpdatedAt > currentUpdatedAt;
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
    schedule: state.schedule.map((round) => ({
      fecha: numberValue(round.fecha),
      ida: round.ida.map((fixture) => ({ ...fixture })),
      vuelta: round.vuelta.map((fixture) => ({ ...fixture })),
    })),
  };
}

function applyLeagueData(data, options = {}) {
  const normalized = normalizeLeagueData(data);
  state.rawData = normalized;
  state.meta = normalized.meta;
  state.clubs = normalized.clubs;
  state.players = normalized.players;
  state.matches = normalized.matches;
  state.schedule = normalized.schedule.length ? normalized.schedule : generateRoundRobinSchedule(state.clubs);

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

function resetClubStandings() {
  state.clubs.forEach((club) => {
    club.played = 0;
    club.wins = 0;
    club.draws = 0;
    club.losses = 0;
    club.goalsFor = 0;
    club.goalsAgainst = 0;
  });
}

function recalculateClubStandingsFromMatches() {
  resetClubStandings();

  state.matches
    .filter((match) => String(match.status || "").toLowerCase() === "final")
    .forEach((match) => {
      const homeClub = getClubById(match.homeId);
      const awayClub = getClubById(match.awayId);

      if (!homeClub || !awayClub) {
        return;
      }

      const homeGoals = numberValue(match.homeGoals);
      const awayGoals = numberValue(match.awayGoals);

      homeClub.played += 1;
      awayClub.played += 1;
      homeClub.goalsFor += homeGoals;
      homeClub.goalsAgainst += awayGoals;
      awayClub.goalsFor += awayGoals;
      awayClub.goalsAgainst += homeGoals;

      if (homeGoals > awayGoals) {
        homeClub.wins += 1;
        awayClub.losses += 1;
      } else if (homeGoals < awayGoals) {
        awayClub.wins += 1;
        homeClub.losses += 1;
      } else {
        homeClub.draws += 1;
        awayClub.draws += 1;
      }
    });
}

function refreshDerivedLeagueState(options = {}) {
  state.clubs = state.clubs.map(normalizeClub);
  state.players = dedupePlayers(state.players.map(normalizePlayer));
  state.matches = state.matches.map(normalizeMatch);
  recalculateClubStandingsFromMatches();

  if (options.render) {
    renderAll();
  }
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
      title: "Noticias aparte",
      text: "La portada ya no mezcla novedades con la tabla principal: ahora las noticias tienen su propia vista.",
    },
    {
      title: "Comunidad activa",
      text: "Los jugadores pueden dejar mensajes y postularse en el mercado sin entrar al panel administrativo.",
    },
    {
      title: "Rutas directas",
      text: "Noticias, comunidad, admin y calendario abren vistas separadas para que la web se sienta mas limpia.",
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
    `${getScheduledMatchCount()} partidos programados y ${getCompletedMatchCount()} ya jugados en una portada mas limpia y facil de compartir.`;
}

function renderNewsFeed() {
  const items = normalizeEditorialItems(state.meta.news, DEFAULT_NEWS_ITEMS)
    .filter((item) => !LEGACY_PRIVATE_NEWS_TITLES.has(String(item.title || "").trim().toLowerCase()));
  if (!items.length) {
    newsFeed.innerHTML = '<p class="panel-copy">No hay noticias publicas publicadas todavia.</p>';
    return;
  }

  newsFeed.innerHTML = items
    .map(
      (item, index) => `
        <article class="news-card" data-reveal>
          <span class="news-index">0${index + 1}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `
    )
    .join("");
}

function renderCommunityGrid() {
  const pinnedItems = normalizeEditorialItems(state.meta.community, DEFAULT_COMMUNITY_ITEMS)
    .filter((item) => !LEGACY_PRIVATE_COMMUNITY_TITLES.has(String(item.title || "").trim().toLowerCase()))
    .map((item) => ({
      kind: "pin",
      title: item.title,
      text: item.text,
    }));
  const messageItems = [...state.communityMessages]
    .filter((item) => String(item.message || "").trim())
    .slice(0, 9)
    .map((item) => ({
      kind: "message",
      name: item.name,
      message: item.message,
      submittedAt: item.submittedAt,
    }));
  const items = [...pinnedItems, ...messageItems];

  if (!items.length) {
    communityGrid.innerHTML = '<p class="panel-copy">Todavia no hay mensajes publicados en la comunidad.</p>';
    return;
  }

  communityGrid.innerHTML = items
    .map(
      (item) => `
        <article class="community-card" data-reveal>
          <p class="section-tag">${escapeHtml(item.kind === "pin" ? "Destacado" : "Comunidad")}</p>
          <strong>${escapeHtml(item.kind === "pin" ? item.title || "Destacado" : item.name || "Anonimo")}</strong>
          <p>${escapeHtml(item.kind === "pin" ? item.text || "" : item.message || "")}</p>
          ${item.kind === "message" ? `<small>${escapeHtml(formatDateTime(item.submittedAt))}</small>` : ""}
        </article>
      `
    )
    .join("");
}

function fillEditorialForms() {
  if (newsEntriesInput) {
    newsEntriesInput.value = serializeEditorialItems(normalizeEditorialItems(state.meta.news, DEFAULT_NEWS_ITEMS));
  }

  if (communityEntriesInput) {
    communityEntriesInput.value = serializeEditorialItems(normalizeEditorialItems(state.meta.community, DEFAULT_COMMUNITY_ITEMS));
  }
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
    "Los administradores pueden abrir o cerrar el mercado manualmente, o dejarlo automatico cada sabado a las 00:00 hora Chile. Las postulaciones solo se publican tras una aprobacion administrativa.";

  transferPlayerIdInput.disabled = !formEnabled;
  transferPositionInput.disabled = !formEnabled;
  transferModeSelect.disabled = !formEnabled;
  transferTargetClubSelect.disabled = !formEnabled || transferModeSelect.value !== "club";
  transferPhoneInput.disabled = !formEnabled;
  transferSubmitButton.disabled = !formEnabled;
  syncTransferModeControls();

  if (!state.firebaseSetup.enabled) {
    transferSubmitStatus.textContent = "Firebase no esta disponible para recibir inscripciones.";
    transferSubmitStatus.className = "save-status warning";
  } else if (market.isOpen) {
    transferSubmitStatus.textContent = "Mercado habilitado. Puedes enviar tu inscripcion y quedara pendiente de aprobacion.";
    transferSubmitStatus.className = "save-status success";
  } else {
    transferSubmitStatus.textContent = "Mercado cerrado por ahora. Espera la apertura o un cambio de los administradores.";
    transferSubmitStatus.className = "save-status warning";
  }
}

function renderTransferRequests() {
  const count = state.transferRequests.length;
  const approvedItems = state.transferRequests.filter((request) => String(request.status || "").toLowerCase() === "aprobado" && request.isPublic);
  transferRequestsCount.textContent = `${count} inscripciones registradas.`;
  publicFreeAgentsCount.textContent = `${approvedItems.length} postulaciones publicas aprobadas.`;

  if (!count) {
    transferRequestsList.innerHTML = '<p class="panel-copy">Todavia no hay solicitudes de fichajes.</p>';
    publicFreeAgentsList.innerHTML = '<p class="panel-copy">Todavia no hay postulaciones aprobadas para mostrar.</p>';
    return;
  }

  transferRequestsList.innerHTML = state.transferRequests
    .map((request) => {
      const adminWhatsAppHref = getWhatsAppHref(
        request.phone,
        "Hola, vi tu solicitud en el mercado de fichajes de LIGA SCC."
      );

      return `
        <article class="transfer-request-item">
          <div>
            <strong>${escapeHtml(request.playerId || "Sin ID")}</strong>
            <p>Posicion: ${escapeHtml(request.position || "Por definir")}</p>
            <p>Modalidad: ${escapeHtml(request.targetClubId ? `Postula a ${request.targetClubName || "club"}` : "Agente libre")}</p>
            <p>Telefono: ${
              adminWhatsAppHref
                ? `<a class="market-contact-link inline-contact-link" href="${escapeHtml(adminWhatsAppHref)}">WhatsApp ${escapeHtml(request.phone || "Sin telefono")}</a>`
                : escapeHtml(request.phone || "Sin telefono")
            }</p>
          </div>
          <div class="transfer-request-meta">
            <span class="access-badge neutral">${escapeHtml(request.status || "Pendiente")}</span>
            ${state.canEdit ? `
              <div class="transfer-request-actions">
                <button class="secondary-btn request-action-btn" type="button" data-request-action="approve" data-request-id="${escapeHtml(request.docId)}">Aprobar</button>
                <button class="secondary-btn request-action-btn" type="button" data-request-action="reject" data-request-id="${escapeHtml(request.docId)}">Rechazar</button>
              </div>
            ` : ""}
            <small>${escapeHtml(formatDateTime(request.submittedAt))}</small>
          </div>
        </article>
      `;
    })
    .join("");

  if (!approvedItems.length) {
    publicFreeAgentsList.innerHTML = '<p class="panel-copy">Todavia no hay postulaciones aprobadas para mostrar.</p>';
    return;
  }

  publicFreeAgentsList.innerHTML = approvedItems
    .map((request) => {
      const phone = request.phone || "Sin telefono";
      const whatsappHref = getWhatsAppHref(
        request.phone,
        "Hola, vi tu postulacion en el mercado de LIGA SCC."
      );

      return `
        <article class="public-free-agent-item">
          <div>
            <strong>${escapeHtml(request.playerId || "Sin ID")}</strong>
            <p>Posicion: ${escapeHtml(request.position || "Por definir")}</p>
            <p>${escapeHtml(request.targetClubId ? `Postula a ${request.targetClubName || "club"}` : "Se postulo como agente libre.")}</p>
            <p>Contacto: ${escapeHtml(phone)}</p>
          </div>
          <div class="public-free-agent-meta">
            <div class="public-free-agent-actions">
              <span class="access-badge neutral">${escapeHtml(request.status || "Pendiente")}</span>
              ${whatsappHref ? `<a class="market-contact-link" href="${escapeHtml(whatsappHref)}">WhatsApp</a>` : ""}
            </div>
            <small>${escapeHtml(formatDateTime(request.submittedAt))}</small>
          </div>
        </article>
      `;
    })
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
      const clubWhatsAppHref = getWhatsAppHref(
        club.contact,
        `Hola, vi el contacto de ${club.name} en LIGA SCC.`
      );
      const clubContactLabel = escapeHtml(club.contact || "Por asignar");

      return `
        <article class="club-card" data-reveal>
          <div class="club-card-head">
            <span class="club-dot" style="background:${escapeHtml(club.color || "#77f2ad")}"></span>
            <div>
              <h4>${escapeHtml(club.name)}</h4>
              <span class="club-meta">${escapeHtml(club.country || "Global")} - Contacto: ${
                clubWhatsAppHref
                  ? `<a class="market-contact-link inline-contact-link" href="${escapeHtml(clubWhatsAppHref)}">WhatsApp ${clubContactLabel}</a>`
                  : clubContactLabel
              }</span>
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

function getPlayersByClubId(clubId) {
  return state.players
    .filter((player) => player.clubId === clubId)
    .sort((left, right) => left.name.localeCompare(right.name));
}

function getPlayerEditorClubPlayers() {
  const clubId = playerEditorClubSelect.value || state.clubs[0]?.id || "";
  return getPlayersByClubId(clubId);
}

function updatePlayerEditorClubSummary(players) {
  const club = getClubById(playerEditorClubSelect.value);

  if (!club) {
    playerEditorClubSummary.textContent = "Selecciona un club para cargar su lista de jugadores.";
    return;
  }

  const suffix = players.length === 1 ? "jugador disponible" : "jugadores disponibles";
  playerEditorClubSummary.textContent = `${club.name}: ${players.length} ${suffix}.`;
}

function clearPlayerForm() {
  playerEditorSelect.value = "";
  playerPositionInput.value = "POR DEFINIR";
  playerOverallInput.value = 0;
  playerMatchesInput.value = 0;
  playerGoalsInput.value = 0;
  playerAssistsInput.value = 0;
  playerMvpsInput.value = 0;
  playerCleanSheetsInput.value = 0;
  playerSavesInput.value = 0;
  playerRatingInput.value = "0.0";
}

function setClubPerformanceSaveStatus(message, tone = "neutral") {
  clubPerformanceSaveStatus.textContent = message;
  clubPerformanceSaveStatus.className = `save-status ${tone}`;
}

function getClubPerformancePlayers() {
  const clubId = clubPerformanceModalSelect.value || playerEditorClubSelect.value || state.clubs[0]?.id || "";
  return getPlayersByClubId(clubId);
}

function updateClubPerformanceSummary(players) {
  const club = getClubById(clubPerformanceModalSelect.value);

  if (!club) {
    clubPerformanceModalSummary.textContent = "Selecciona un club para cargar su plantilla completa.";
    return;
  }

  const suffix = players.length === 1 ? "jugador listo para editar" : "jugadores listos para editar";
  clubPerformanceModalSummary.textContent = `${club.name}: ${players.length} ${suffix}.`;
}

function renderClubPerformanceRows() {
  const players = getClubPerformancePlayers();
  updateClubPerformanceSummary(players);

  if (!players.length) {
    clubPerformanceTableBody.innerHTML = `
      <tr>
        <td colspan="10">No hay jugadores cargados para este club.</td>
      </tr>
    `;
    return;
  }

  clubPerformanceTableBody.innerHTML = players
    .map(
      (player) => `
        <tr data-player-id="${escapeHtml(player.id)}">
          <td class="admin-modal-player-cell">
            <strong>${escapeHtml(player.name)}</strong>
            <small>${escapeHtml(player.country || "Global")}</small>
          </td>
          <td><input data-field="position" type="text" value="${escapeHtml(player.position || "POR DEFINIR")}"></td>
          <td><input data-field="overall" type="number" min="0" value="${numberValue(player.overall)}"></td>
          <td><input data-field="matches" type="number" min="0" value="${numberValue(player.matches)}"></td>
          <td><input data-field="goals" type="number" min="0" value="${numberValue(player.goals)}"></td>
          <td><input data-field="assists" type="number" min="0" value="${numberValue(player.assists)}"></td>
          <td><input data-field="mvps" type="number" min="0" value="${numberValue(player.mvps)}"></td>
          <td><input data-field="cleanSheets" type="number" min="0" value="${numberValue(player.cleanSheets)}"></td>
          <td><input data-field="saves" type="number" min="0" value="${numberValue(player.saves)}"></td>
          <td><input data-field="rating" type="number" min="0" step="0.1" value="${numberValue(player.rating).toFixed(1)}"></td>
        </tr>
      `
    )
    .join("");
}

function setRosterManagerSaveStatus(message, tone = "neutral") {
  rosterManagerSaveStatus.textContent = message;
  rosterManagerSaveStatus.className = `save-status ${tone}`;
}

function getRosterManagerPlayers() {
  const clubId = rosterManagerClubSelect.value || playerEditorClubSelect.value || state.clubs[0]?.id || "";
  return getPlayersByClubId(clubId);
}

function updateRosterManagerSummary(players) {
  const club = getClubById(rosterManagerClubSelect.value);

  if (!club) {
    rosterManagerSummary.textContent = "Selecciona un club para gestionar su plantilla.";
    return;
  }

  const suffix = players.length === 1 ? "jugador cargado" : "jugadores cargados";
  rosterManagerSummary.textContent = `${club.name}: ${players.length} ${suffix}. Aqui puedes editar IDs, nombres visibles y sumar nuevas fichas al plantel.`;
}

function renderRosterManagerRows() {
  const players = getRosterManagerPlayers();
  updateRosterManagerSummary(players);

  if (!players.length) {
    rosterManagerTableBody.innerHTML = `
      <tr>
        <td colspan="5">No hay jugadores cargados para este club.</td>
      </tr>
    `;
    return;
  }

  rosterManagerTableBody.innerHTML = players
    .map(
      (player) => `
        <tr data-player-id="${escapeHtml(player.id)}">
          <td><input data-field="id" type="text" value="${escapeHtml(player.id || "")}" placeholder="ID de plantilla"></td>
          <td><input data-field="name" type="text" value="${escapeHtml(player.name || "")}"></td>
          <td>${escapeHtml(player.position || "POR DEFINIR")}</td>
          <td>${escapeHtml(player.country || "Global")}</td>
          <td>${escapeHtml(getClubName(player.clubId))}</td>
        </tr>
      `
    )
    .join("");
}

function openAdminModal(modal) {
  return modal;
}

function closeAdminModal(modal) {
  return modal;
}

function openClubPerformanceModal() {
  if (!state.canEdit) {
    return;
  }

  navigateToWorkspace("/admin/rendimiento", playerEditorClubSelect.value || state.clubs[0]?.id || "");
}

function closeClubPerformanceModal() {
  return;
}

function openRosterManagerModal() {
  if (!state.canEdit || !isRosterOwner()) {
    return;
  }

  navigateToWorkspace("/admin/plantillas", playerEditorClubSelect.value || state.clubs[0]?.id || "");
}

function closeRosterManagerModal() {
  return;
}

function closeAllAdminModals() {
  return;
}

function syncClubPerformanceWorkspace() {
  const selectedClubId = getPreferredWorkspaceClubId(playerEditorClubSelect.value);
  clubPerformanceModalSelect.value = selectedClubId;
  playerEditorClubSelect.value = selectedClubId;
  updateWorkspaceClubInUrl(selectedClubId);
  renderClubPerformanceRows();
  setClubPerformanceSaveStatus("Edita los jugadores del club y guarda la plantilla completa.", "neutral");
}

function syncRosterManagerWorkspace() {
  const selectedClubId = getPreferredWorkspaceClubId(playerEditorClubSelect.value);
  rosterManagerClubSelect.value = selectedClubId;
  playerEditorClubSelect.value = selectedClubId;
  updateWorkspaceClubInUrl(selectedClubId);
  renderRosterManagerRows();
  setRosterManagerSaveStatus("Edita IDs, nombres o agrega jugadores y luego guarda la plantilla.", "neutral");
}

function populatePlayerEditorPlayers(preferredPlayerId = playerEditorSelect.value) {
  const players = getPlayerEditorClubPlayers();

  updatePlayerEditorClubSummary(players);

  if (!players.length) {
    playerEditorSelect.innerHTML = '<option value="">Sin jugadores en este club</option>';
    clearPlayerForm();
    return;
  }

  playerEditorSelect.innerHTML = players
    .map(
      (player) =>
        `<option value="${escapeHtml(player.id)}">${escapeHtml(player.name)} - ${escapeHtml(player.position || "POR DEFINIR")}</option>`
    )
    .join("");

  const selectedPlayer = players.find((player) => player.id === preferredPlayerId) || players[0];
  playerEditorSelect.value = selectedPlayer.id;
  fillPlayerForm();
}

function fillPlayerForm() {
  const clubPlayers = getPlayerEditorClubPlayers();
  const player = clubPlayers.find((item) => item.id === playerEditorSelect.value) || clubPlayers[0];
  if (!player) {
    clearPlayerForm();
    return;
  }

  playerEditorSelect.value = player.id;
  if (playerEditorClubSelect.value !== player.clubId) {
    playerEditorClubSelect.value = player.clubId;
    updatePlayerEditorClubSummary(clubPlayers);
  }
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

function syncTransferModeControls() {
  const requiresClub = transferModeSelect.value === "club";
  transferTargetClubField.classList.toggle("hidden", !requiresClub);
  transferTargetClubSelect.required = requiresClub;
  transferTargetClubSelect.disabled = !requiresClub || transferSubmitButton.disabled;
}

function populateEditorSelects() {
  const selectedClub = clubEditorSelect.value;
  const selectedPlayerClub = playerEditorClubSelect.value;
  const selectedPlayer = playerEditorSelect.value;
  const selectedBulkClub = getWorkspaceClubFromUrl() || clubPerformanceModalSelect.value;
  const selectedRosterClub = getWorkspaceClubFromUrl() || rosterManagerClubSelect.value;

  clubEditorSelect.innerHTML = state.clubs
    .map((club) => `<option value="${escapeHtml(club.id)}">${escapeHtml(club.name)}</option>`)
    .join("");

  playerEditorClubSelect.innerHTML = state.clubs
    .map((club) => `<option value="${escapeHtml(club.id)}">${escapeHtml(club.name)}</option>`)
    .join("");

  clubPerformanceModalSelect.innerHTML = state.clubs
    .map((club) => `<option value="${escapeHtml(club.id)}">${escapeHtml(club.name)}</option>`)
    .join("");

  rosterManagerClubSelect.innerHTML = state.clubs
    .map((club) => `<option value="${escapeHtml(club.id)}">${escapeHtml(club.name)}</option>`)
    .join("");

  transferTargetClubSelect.innerHTML = state.clubs
    .map((club) => `<option value="${escapeHtml(club.id)}">${escapeHtml(club.name)}</option>`)
    .join("");

  if (selectedClub && state.clubs.some((club) => club.id === selectedClub)) {
    clubEditorSelect.value = selectedClub;
  }

  if (selectedPlayerClub && state.clubs.some((club) => club.id === selectedPlayerClub)) {
    playerEditorClubSelect.value = selectedPlayerClub;
  } else if (selectedPlayer) {
    const matchingPlayer = state.players.find((player) => player.id === selectedPlayer);
    playerEditorClubSelect.value = matchingPlayer?.clubId || state.clubs[0]?.id || "";
  } else {
    playerEditorClubSelect.value = state.clubs[0]?.id || "";
  }

  if (selectedBulkClub && state.clubs.some((club) => club.id === selectedBulkClub)) {
    clubPerformanceModalSelect.value = selectedBulkClub;
  } else {
    clubPerformanceModalSelect.value = playerEditorClubSelect.value || state.clubs[0]?.id || "";
  }

  if (selectedRosterClub && state.clubs.some((club) => club.id === selectedRosterClub)) {
    rosterManagerClubSelect.value = selectedRosterClub;
  } else {
    rosterManagerClubSelect.value = playerEditorClubSelect.value || state.clubs[0]?.id || "";
  }

  fillClubForm();
  populatePlayerEditorPlayers(selectedPlayer);
  renderClubPerformanceRows();
  renderRosterManagerRows();
  populateMatchEditor();
  fillMarketSettingsForm();
  if (!transferTargetClubSelect.value && state.clubs[0]) {
    transferTargetClubSelect.value = state.clubs[0].id;
  }
  syncTransferModeControls();
}

function setSaveStatus(message, tone = "neutral") {
  saveStatus.textContent = message;
  saveStatus.className = `save-status ${tone}`;
}

function getFirebaseErrorMessage(error) {
  const code = String(error?.code || "").trim();
  const rawMessage = String(error?.message || "").trim();

  if (code.includes("auth/unauthorized-domain")) {
    return "El dominio de esta web no esta autorizado en Firebase Auth. Agrega este dominio en Authentication > Settings > Authorized domains.";
  }

  if (code.includes("auth/operation-not-allowed")) {
    return "Google no esta habilitado como proveedor en Firebase Authentication.";
  }

  if (code.includes("auth/invalid-api-key")) {
    return "La apiKey de Firebase no es valida. Revisa firebase-config.js.";
  }

  if (code.includes("auth/network-request-failed")) {
    return "No se pudo conectar con Firebase. Revisa internet o si la red esta bloqueando gstatic/firebase.";
  }

  if (rawMessage.includes("Completa firebase-config.js")) {
    return rawMessage;
  }

  return rawMessage || "Revisa firebase-config.js, el dominio autorizado y las reglas de Firestore.";
}

function setEditorState() {
  const signedIn = Boolean(state.user);
  const canManageRoster = isRosterOwner(state.user);
  const canStartGoogleSignIn = state.firebaseSetup.enabled && state.firebaseAuthReady && !state.authBusy;
  signInButton.classList.toggle("hidden", signedIn);
  signOutButton.classList.toggle("hidden", !signedIn);
  signInButton.disabled = !canStartGoogleSignIn;

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
    openRosterManagerButton.classList.add("hidden");
    applyPageView();
    return;
  }

  if (state.user && state.canEdit) {
    authStatus.textContent = "Editor conectado";
    authHelp.textContent = "Tu correo esta autorizado. Ya puedes editar clubes, jugadores, partidos y mercado de fichajes desde esta web.";
    editorBadge.textContent = "Permiso de edicion activo";
    editorBadge.className = "access-badge success";
    editorPanel.classList.remove("hidden");
    openRosterManagerButton.classList.toggle("hidden", !canManageRoster);
  } else if (state.user) {
    authStatus.textContent = "Sesion iniciada sin permisos";
    authHelp.textContent =
      "Tu correo entro con Google, pero todavia no esta incluido en editorEmails o en las reglas de Firestore.";
    editorBadge.textContent = "Solo lectura";
    editorBadge.className = "access-badge warning";
    editorPanel.classList.add("hidden");
    openRosterManagerButton.classList.add("hidden");
    closeAllAdminModals();
  } else {
    if (state.firebaseAuthReady) {
      authStatus.textContent = "Listo para iniciar sesion";
      authHelp.textContent =
        "Entra con Google. Si tu correo esta autorizado, se abrira el panel de edicion automaticamente.";
      editorBadge.textContent = "Esperando login";
      editorBadge.className = "access-badge neutral";
    } else {
      authStatus.textContent = "Preparando login";
      authHelp.textContent =
        "Firebase se esta iniciando. Cuando termine, el boton de Google se habilitara automaticamente.";
      editorBadge.textContent = "Iniciando Firebase";
      editorBadge.className = "access-badge neutral";
    }
    editorPanel.classList.add("hidden");
    openRosterManagerButton.classList.add("hidden");
    closeAllAdminModals();
  }

  if (!canManageRoster) {
    closeRosterManagerModal();
  }

  if (state.sourceLabel === "Firestore en vivo") {
    configStatus.textContent = "La liga se esta leyendo desde Firestore y la web/app vera los cambios en vivo.";
  } else if (state.firebaseStatus === "ready") {
    configStatus.textContent =
      "Firebase esta listo. Si guardas por primera vez, se creara el documento de la liga en Firestore.";
  } else if (state.firebaseStatus === "error") {
    configStatus.textContent =
      `Firebase no pudo inicializarse. ${state.firebaseErrorMessage || "Revisa firebase-config.js, dominios autorizados y reglas."}`;
  } else {
    configStatus.textContent = "Firebase esta activo, pero la web sigue usando el JSON publico como respaldo.";
  }

  editorPanelNote.textContent =
    "Los cambios se guardan en Firestore con respaldo automatico para que la web y la APK conectada lean resultados, goles, asistencias y mercado al abrirse.";
  applyPageView();
}

function renderAll() {
  renderMeta();
  renderSummary();
  renderCommandCenter();
  renderNewsFeed();
  renderCommunityGrid();
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
  fillEditorialForms();
  setEditorState();
  applyPageView();
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
  refreshDerivedLeagueState();
}

async function saveCurrentLeague(changeLabel, options = {}) {
  if (!state.firebaseSetup.enabled) {
    setSaveStatus("Activa Firebase para guardar cambios compartidos desde la web.", "warning");
    return false;
  }

  if (!state.user || !isEditor(state.user)) {
    setSaveStatus("Tu correo no tiene permiso de edicion.", "warning");
    return false;
  }

  if (options.requiresRosterOwner && !isRosterOwner(state.user)) {
    setSaveStatus("Solo assencarlos2007@gmail.com puede editar nombres o agregar jugadores.", "warning");
    return false;
  }

  refreshDerivedLeagueState();
  const payload = buildLeagueDataForSave();
  applyLeagueData(payload, { sourceLabel: "Firestore en vivo" });
  renderAll();

  setSaveStatus("Guardando cambios en la nube...", "pending");

  try {
    const saveResult = await saveLeagueData(payload, state.user, {
      changeLabel,
      requiresRosterOwner: Boolean(options.requiresRosterOwner),
    });
    state.firebaseStatus = "live";
    state.sourceLabel = "Firestore en vivo";
    const backupMessage = saveResult?.backupKind === "before-save"
      ? " Respaldo automatico del estado anterior creado."
      : " Respaldo automatico inicial creado.";
    setSaveStatus(`${changeLabel} guardado correctamente.${backupMessage}`, "success");
    setEditorState();
    return true;
  } catch (error) {
    console.error(error);
    setSaveStatus("No se pudo guardar en Firestore o crear el respaldo automatico. Revisa la configuracion y las reglas.", "error");
    return false;
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

  refreshDerivedLeagueState({ render: true });
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

  refreshDerivedLeagueState({ render: true });
  await saveCurrentLeague(`Jugador ${player.name}`);
}

async function handleClubPerformanceSave() {
  const club = getClubById(clubPerformanceModalSelect.value);
  const rows = [...clubPerformanceTableBody.querySelectorAll("tr[data-player-id]")];

  if (!club || !rows.length) {
    setClubPerformanceSaveStatus("No hay jugadores cargados para guardar en este club.", "warning");
    return;
  }

  rows.forEach((row) => {
    const player = state.players.find((item) => item.id === row.dataset.playerId);
    if (!player) {
      return;
    }

    player.position = row.querySelector('[data-field="position"]').value.trim() || "POR DEFINIR";
    player.overall = numberValue(row.querySelector('[data-field="overall"]').value);
    player.matches = numberValue(row.querySelector('[data-field="matches"]').value);
    player.goals = numberValue(row.querySelector('[data-field="goals"]').value);
    player.assists = numberValue(row.querySelector('[data-field="assists"]').value);
    player.mvps = numberValue(row.querySelector('[data-field="mvps"]').value);
    player.cleanSheets = numberValue(row.querySelector('[data-field="cleanSheets"]').value);
    player.saves = numberValue(row.querySelector('[data-field="saves"]').value);
    player.rating = numberValue(row.querySelector('[data-field="rating"]').value);
  });

  state.meta.updatedAt = todayIsoLocal();
  refreshDerivedLeagueState({ render: true });
  setClubPerformanceSaveStatus("Guardando plantilla completa en la nube...", "pending");

  const saved = await saveCurrentLeague(`Plantilla ${club.name}`);
  if (saved) {
    setClubPerformanceSaveStatus(`Plantilla de ${club.name} guardada correctamente.`, "success");
    renderClubPerformanceRows();
  } else {
    setClubPerformanceSaveStatus("No se pudo guardar la plantilla completa en la nube.", "error");
  }
}

async function handleRosterManagerSave() {
  if (!isRosterOwner()) {
    setRosterManagerSaveStatus("Solo assencarlos2007@gmail.com puede editar IDs y nombres de jugadores.", "warning");
    return;
  }

  const club = getClubById(rosterManagerClubSelect.value);
  const rows = [...rosterManagerTableBody.querySelectorAll("tr[data-player-id]")];

  if (!club || !rows.length) {
    setRosterManagerSaveStatus("No hay jugadores cargados para este club.", "warning");
    return;
  }

  const externalIds = new Set(
    state.players
      .filter((player) => player.clubId !== club.id)
      .map((player) => String(player.id || "").trim().toLowerCase())
  );

  const pendingUpdates = [];
  const nextClubIds = new Set();

  for (const row of rows) {
    const originalId = row.dataset.playerId;
    const nextId = row.querySelector('[data-field="id"]').value.trim();
    const nextName = row.querySelector('[data-field="name"]').value.trim();

    if (!nextId || !nextName) {
      setRosterManagerSaveStatus("Cada jugador debe tener ID y nombre visible antes de guardar.", "warning");
      return;
    }

    const normalizedNextId = nextId.toLowerCase();
    if (nextClubIds.has(normalizedNextId) || externalIds.has(normalizedNextId)) {
      setRosterManagerSaveStatus(`El ID ${nextId} ya existe. Usa uno distinto antes de guardar.`, "warning");
      return;
    }

    nextClubIds.add(normalizedNextId);
    pendingUpdates.push({ originalId, nextId, nextName });
  }

  pendingUpdates.forEach(({ originalId, nextId, nextName }) => {
    const player = state.players.find((item) => item.id === originalId);
    if (player) {
      player.id = nextId;
      player.name = nextName;
    }
  });

  state.meta.updatedAt = todayIsoLocal();
  refreshDerivedLeagueState({ render: true });
  rosterManagerClubSelect.value = club.id;
  playerEditorClubSelect.value = club.id;
  setRosterManagerSaveStatus("Guardando cambios de la plantilla...", "pending");

  const saved = await saveCurrentLeague(`Plantilla ${club.name}`, { requiresRosterOwner: true });
  if (saved) {
    setRosterManagerSaveStatus(`IDs y nombres de ${club.name} guardados correctamente.`, "success");
    renderRosterManagerRows();
  } else {
    setRosterManagerSaveStatus("No se pudieron guardar los cambios de la plantilla.", "error");
  }
}

async function handleAddPlayerSubmit(event) {
  event.preventDefault();

  if (!isRosterOwner()) {
    setRosterManagerSaveStatus("Solo assencarlos2007@gmail.com puede agregar jugadores a las plantillas.", "warning");
    return;
  }

  const club = getClubById(rosterManagerClubSelect.value);
  const name = addPlayerNameInput.value.trim();
  const providedId = addPlayerIdInput.value.trim();

  if (!club || !name) {
    setRosterManagerSaveStatus("Selecciona un club y completa al menos el nombre visible del jugador.", "warning");
    return;
  }

  if (providedId && state.players.some((player) => String(player.id || "").trim().toLowerCase() === providedId.toLowerCase())) {
    setRosterManagerSaveStatus("Ese ID ya existe. Usa otro o deja el campo vacio para generarlo automaticamente.", "warning");
    return;
  }

  const player = normalizePlayer({
    id: providedId || buildUniquePlayerId(name),
    name,
    clubId: club.id,
    position: addPlayerPositionInput.value.trim() || "POR DEFINIR",
    country: addPlayerCountryInput.value.trim() || club.country || "Global",
    overall: numberValue(addPlayerOverallInput.value),
    matches: 0,
    goals: 0,
    assists: 0,
    mvps: 0,
    cleanSheets: 0,
    saves: 0,
    rating: 0,
  });

  state.players.push(player);
  state.players = dedupePlayers(state.players.map(normalizePlayer));
  state.meta.updatedAt = todayIsoLocal();
  refreshDerivedLeagueState({ render: true });
  setRosterManagerSaveStatus(`Agregando a ${player.name} en ${club.name}...`, "pending");

  const saved = await saveCurrentLeague(`Alta ${player.name} en ${club.name}`, { requiresRosterOwner: true });
  if (saved) {
    addPlayerForm.reset();
    setRosterManagerSaveStatus(`${player.name} fue agregado correctamente a ${club.name}.`, "success");
    renderRosterManagerRows();
    populatePlayerEditorPlayers(player.id);
  } else {
    setRosterManagerSaveStatus("No se pudo guardar el nuevo jugador en la nube.", "error");
  }
}

async function handleNewsSubmit(event) {
  event.preventDefault();

  const items = parseEditorialItems(newsEntriesInput.value, "Noticia");
  if (!items.length) {
    setSaveStatus("Agrega al menos una noticia antes de guardar.", "warning");
    return;
  }

  state.meta.news = items;
  state.meta.updatedAt = todayIsoLocal();
  renderAll();
  await saveCurrentLeague("Noticias");
}

async function handleCommunitySubmit(event) {
  event.preventDefault();

  const items = parseEditorialItems(communityEntriesInput.value, "Comunidad");
  if (!items.length) {
    setSaveStatus("Agrega al menos una entrada de comunidad antes de guardar.", "warning");
    return;
  }

  state.meta.community = items;
  state.meta.updatedAt = todayIsoLocal();
  renderAll();
  await saveCurrentLeague("Comunidad");
}

async function handleCommunityPublicSubmit(event) {
  event.preventDefault();

  if (!state.firebaseSetup.enabled) {
    communityPublicStatus.textContent = "Firebase no esta disponible para publicar mensajes.";
    communityPublicStatus.className = "save-status error";
    return;
  }

  const name = communityNameInput.value.trim();
  const message = communityMessageInput.value.trim();

  if (!name || !message) {
    communityPublicStatus.textContent = "Completa tu nombre y tu mensaje antes de publicar.";
    communityPublicStatus.className = "save-status warning";
    return;
  }

  communityPublicStatus.textContent = "Publicando mensaje en la comunidad...";
  communityPublicStatus.className = "save-status pending";

  try {
    await createCommunityMessage({ name, message });
    communityPublicForm.reset();
    communityPublicStatus.textContent = "Mensaje publicado correctamente.";
    communityPublicStatus.className = "save-status success";
  } catch (error) {
    console.error(error);
    communityPublicStatus.textContent = "No se pudo publicar el mensaje. Intenta de nuevo.";
    communityPublicStatus.className = "save-status error";
  }
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
  refreshDerivedLeagueState({ render: true });
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
  const mode = transferModeSelect.value === "free-agent" ? "free-agent" : "club";
  const targetClub = mode === "club" ? getClubById(transferTargetClubSelect.value) : null;
  const phone = transferPhoneInput.value.trim();

  if (!playerId || !position || !phone || (mode === "club" && !targetClub)) {
    setTransferSubmitStatus("Completa ID, posicion, tipo de postulacion, club si aplica, y numero de telefono.", "warning");
    return;
  }

  setTransferSubmitStatus("Enviando inscripcion al mercado...", "pending");

  try {
    await createTransferRequest({
      playerId,
      position,
      phone,
      targetClubId: targetClub?.id || "",
      targetClubName: targetClub?.name || "",
    });
    transferMarketForm.reset();
    transferModeSelect.value = "club";
    if (state.clubs[0]) {
      transferTargetClubSelect.value = state.clubs[0].id;
    }
    syncTransferModeControls();
    setTransferSubmitStatus("Inscripcion enviada correctamente. Queda pendiente de aprobacion administrativa antes de hacerse publica.", "success");
  } catch (error) {
    console.error(error);
    setTransferSubmitStatus("No se pudo enviar la inscripcion. Intenta de nuevo en unos segundos.", "error");
  }
}

async function handleTransferRequestAction(event) {
  const button = event.target.closest("[data-request-action]");
  if (!button || !state.canEdit) {
    return;
  }

  const docId = button.dataset.requestId;
  const action = button.dataset.requestAction;
  if (!docId || !action) {
    return;
  }

  const payload = action === "approve"
    ? { status: "Aprobado", isPublic: true }
    : { status: "Rechazado", isPublic: false };

  try {
    await updateTransferRequest(docId, payload, state.user);
    setSaveStatus(`Solicitud ${action === "approve" ? "aprobada" : "rechazada"} correctamente.`, "success");
  } catch (error) {
    console.error(error);
    setSaveStatus("No se pudo actualizar la solicitud del mercado.", "error");
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
  playerEditorClubSelect.addEventListener("change", () => {
    populatePlayerEditorPlayers();
    syncClubPerformanceWorkspace();
    syncRosterManagerWorkspace();
  });
  playerEditorSelect.addEventListener("change", fillPlayerForm);
  openClubPerformanceEditorButton.addEventListener("click", openClubPerformanceModal);
  openRosterManagerButton.addEventListener("click", openRosterManagerModal);
  clubPerformanceModalSelect.addEventListener("change", () => {
    playerEditorClubSelect.value = clubPerformanceModalSelect.value;
    rosterManagerClubSelect.value = clubPerformanceModalSelect.value;
    updateWorkspaceClubInUrl(clubPerformanceModalSelect.value);
    populatePlayerEditorPlayers();
    renderClubPerformanceRows();
    renderRosterManagerRows();
  });
  rosterManagerClubSelect.addEventListener("change", () => {
    playerEditorClubSelect.value = rosterManagerClubSelect.value;
    clubPerformanceModalSelect.value = rosterManagerClubSelect.value;
    updateWorkspaceClubInUrl(rosterManagerClubSelect.value);
    populatePlayerEditorPlayers();
    syncClubPerformanceWorkspace();
    renderRosterManagerRows();
  });
  saveClubPerformanceButton.addEventListener("click", handleClubPerformanceSave);
  saveRosterManagerButton.addEventListener("click", handleRosterManagerSave);
  matchRoundSelect.addEventListener("change", populateMatchEditor);
  matchLegSelect.addEventListener("change", populateMatchEditor);
  matchFixtureSelect.addEventListener("change", fillMatchForm);
  marketModeSelect.addEventListener("change", syncMarketModeControls);
  transferModeSelect.addEventListener("change", syncTransferModeControls);
  clubEditorForm.addEventListener("submit", handleClubSubmit);
  playerEditorForm.addEventListener("submit", handlePlayerSubmit);
  matchEditorForm.addEventListener("submit", handleMatchSubmit);
  marketSettingsForm.addEventListener("submit", handleMarketSettingsSubmit);
  newsEditorForm.addEventListener("submit", handleNewsSubmit);
  communityEditorForm.addEventListener("submit", handleCommunitySubmit);
  transferMarketForm.addEventListener("submit", handleTransferRequestSubmit);
  communityPublicForm.addEventListener("submit", handleCommunityPublicSubmit);
  addPlayerForm.addEventListener("submit", handleAddPlayerSubmit);
  transferRequestsList.addEventListener("click", handleTransferRequestAction);
  downloadJsonButton.addEventListener("click", handleDownloadJson);
}

function stopTransferRequestsSubscription() {
  if (typeof state.transferRequestsUnsubscribe === "function") {
    state.transferRequestsUnsubscribe();
  }
  state.transferRequestsUnsubscribe = null;
}

function stopCommunityMessagesSubscription() {
  if (typeof state.communityMessagesUnsubscribe === "function") {
    state.communityMessagesUnsubscribe();
  }
  state.communityMessagesUnsubscribe = null;
}

function startTransferRequestsSubscription() {
  stopTransferRequestsSubscription();

  if (!state.firebaseSetup.enabled) {
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
      publicFreeAgentsList.innerHTML = '<p class="panel-copy">No se pudieron cargar los agentes libres del mercado.</p>';
    }
  );
}

function startCommunityMessagesSubscription() {
  stopCommunityMessagesSubscription();

  if (!state.firebaseSetup.enabled) {
    state.communityMessages = [];
    renderCommunityGrid();
    return;
  }

  state.communityMessagesUnsubscribe = subscribeCommunityMessages(
    (items) => {
      state.communityMessages = items;
      renderCommunityGrid();
    },
    (error) => {
      console.error(error);
      communityGrid.innerHTML = '<p class="panel-copy">No se pudieron cargar los mensajes de la comunidad.</p>';
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

async function registerAppServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("./service-worker.js");
  } catch (error) {
    console.warn("No se pudo registrar el service worker.", error);
  }
}

function setupAuthButtons() {
  signInButton.addEventListener("click", async () => {
    if (!state.firebaseSetup.enabled) {
      window.alert("Primero configura firebase-config.js para activar el login con Google.");
      return;
    }

    if (!state.firebaseAuthReady) {
      window.alert(
        state.firebaseStatus === "error"
          ? state.firebaseErrorMessage || "Firebase no pudo inicializarse."
          : "Firebase se esta iniciando todavia. Espera un momento e intenta de nuevo."
      );
      return;
    }

    if (state.authBusy) {
      return;
    }

    try {
      state.authBusy = true;
      signInButton.textContent = "Abriendo...";
      setEditorState();
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
      const message = String(error?.message || "").trim();
      window.alert(
        message || "No se pudo iniciar sesion con Google. Revisa Firebase Auth y los dominios autorizados."
      );
    } finally {
      state.authBusy = false;
      signInButton.textContent = "Entrar con Google";
      setEditorState();
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
  state.firebaseAuthReady = false;
  state.firebaseErrorMessage = "";
  setEditorState();

  try {
    await initFirebase({
      onAuthReady: () => {
        state.firebaseAuthReady = true;
        state.firebaseErrorMessage = "";
        setEditorState();
      },
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
        startCommunityMessagesSubscription();
        setEditorState();
      },
      onLeagueData: ({ data, sourceLabel }) => {
        if (!shouldPreferIncomingLeagueData(data)) {
          console.warn("Se ignoro una version remota antigua de la liga para mantener los cambios locales mas recientes.");
          return;
        }

        applyLeagueData(data, { sourceLabel: sourceLabel || "Firestore en vivo" });
        refreshDerivedLeagueState({ render: true });
        setSaveStatus("La liga se sincronizo con Firestore.", "success");
      },
    });

    state.firebaseAuthReady = true;
    state.firebaseErrorMessage = "";
    setEditorState();
  } catch (error) {
    console.error(error);
    state.firebaseStatus = "error";
    state.firebaseAuthReady = false;
    state.firebaseErrorMessage = getFirebaseErrorMessage(error);
    setEditorState();
  }
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
  publicFreeAgentsList.innerHTML = emptyStateTemplate.innerHTML;
  footerUpdate.textContent = "No fue posible cargar la informacion del torneo";
  setSaveStatus("No fue posible cargar la informacion del torneo.", "error");
}

async function init() {
  try {
    wireStaticNavigation();
    await registerAppServiceWorker();
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
