const DATA_PATH = "league-data.json";
const STORAGE_KEY = "scc-custom-moderators";
const FIXED_ADMIN = "SLYINTHEBLOCK";

const state = {
  meta: {},
  moderators: [],
  customModerators: [],
  clubs: [],
  players: [],
  schedule: [],
};

const summaryGrid = document.getElementById("summaryGrid");
const clubStandingsBody = document.getElementById("clubStandingsBody");
const clubCards = document.getElementById("clubCards");
const playersTableBody = document.getElementById("playersTableBody");
const leaderboards = document.getElementById("leaderboards");
const moderatorsList = document.getElementById("moderatorsList");
const moderatorForm = document.getElementById("moderatorForm");
const moderatorCount = document.getElementById("moderatorCount");
const commandList = document.getElementById("commandList");
const spotlightList = document.getElementById("spotlightList");
const emptyStateTemplate = document.getElementById("emptyStateTemplate");
const seasonBadge = document.getElementById("seasonBadge");
const adminBadge = document.getElementById("adminBadge");
const brandName = document.getElementById("brandName");
const brandRegion = document.getElementById("brandRegion");
const heroTitle = document.getElementById("heroTitle");
const heroDescription = document.getElementById("heroDescription");
const heroBadges = document.getElementById("heroBadges");
const adminName = document.getElementById("adminName");
const heroAdmin = document.getElementById("heroAdmin");
const heroClubCount = document.getElementById("heroClubCount");
const heroPlayerCount = document.getElementById("heroPlayerCount");
const heroModeratorCount = document.getElementById("heroModeratorCount");
const heroCountryCount = document.getElementById("heroCountryCount");
const updatedAt = document.getElementById("updatedAt");
const footerBrand = document.getElementById("footerBrand");
const footerRegion = document.getElementById("footerRegion");
const footerUpdate = document.getElementById("footerUpdate");
const formatLabel = document.getElementById("formatLabel");
const gameLabel = document.getElementById("gameLabel");
const modeLabel = document.getElementById("modeLabel");
const globalSummary = document.getElementById("globalSummary");
const playerSearch = document.getElementById("playerSearch");
const playerClubFilter = document.getElementById("playerClubFilter");
const playerPositionFilter = document.getElementById("playerPositionFilter");
const fixturesSummary = document.getElementById("fixturesSummary");
const fixtureRoundFilter = document.getElementById("fixtureRoundFilter");
const fixturesGrid = document.getElementById("fixturesGrid");

function pointsFor(club) {
  return Number(club.wins || 0) * 3 + Number(club.draws || 0);
}

function goalDifference(club) {
  return Number(club.goalsFor || 0) - Number(club.goalsAgainst || 0);
}

function sortClubs(clubs) {
  return [...clubs].sort((a, b) =>
    pointsFor(b) - pointsFor(a) ||
    goalDifference(b) - goalDifference(a) ||
    Number(b.goalsFor || 0) - Number(a.goalsFor || 0) ||
    a.name.localeCompare(b.name)
  );
}

function sortPlayers(players, field) {
  return [...players].sort((a, b) =>
    Number(b[field] || 0) - Number(a[field] || 0) ||
    Number(b.rating || 0) - Number(a.rating || 0) ||
    a.name.localeCompare(b.name)
  );
}

function getAllModerators() {
  return [...state.moderators, ...state.customModerators];
}

function getClubById(clubId) {
  return state.clubs.find((club) => club.id === clubId);
}

function getClubName(clubId) {
  return getClubById(clubId)?.name || "Sin club";
}

function getCountryCount() {
  const countries = new Set();
  (state.meta.countries || []).forEach((country) => countries.add(country));
  state.clubs.forEach((club) => club.country && countries.add(club.country));
  state.players.forEach((player) => player.country && countries.add(player.country));
  getAllModerators().forEach((moderator) => moderator.country && countries.add(moderator.country));
  return countries.size;
}

function getMatchCount() {
  const totalPlayed = state.clubs.reduce((sum, club) => sum + Number(club.played || 0), 0);
  return Math.round(totalPlayed / 2);
}

function getScheduledMatchCount() {
  return state.schedule.reduce((sum, round) => sum + round.ida.length + round.vuelta.length, 0);
}

function formatDate(value) {
  if (!value) {
    return "Pendiente";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function loadCustomModerators() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("No se pudo leer el staff guardado localmente.", error);
    return [];
  }
}

function saveCustomModerators() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.customModerators));
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
  const totalRounds = rotation.length - 1;

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex += 1) {
    const matches = [];

    for (let index = 0; index < rotation.length / 2; index += 1) {
      const first = rotation[index];
      const second = rotation[rotation.length - 1 - index];

      if (first.id === "bye" || second.id === "bye") {
        continue;
      }

      const shouldFlip = roundIndex % 2 === 1;
      matches.push({
        homeId: shouldFlip ? second.id : first.id,
        awayId: shouldFlip ? first.id : second.id,
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
  const admin = FIXED_ADMIN;
  const region = state.meta.region || "Global";

  brandName.textContent = leagueName;
  brandRegion.textContent = `${region} - ${state.meta.game || "FC26"}`;
  seasonBadge.textContent = state.meta.season || "Season 01";
  adminBadge.textContent = admin;
  heroTitle.textContent = `${leagueName} para competir desde cualquier pais.`;
  heroDescription.textContent =
    `${state.meta.format || "Liga internacional"} de ${state.meta.game || "EA SPORTS FC 26"} en ` +
    `${state.meta.mode || "Clubs Pro"} con control centralizado de staff, clubes, partidos y estadisticas.`;
  heroBadges.innerHTML = [region, state.meta.game || "FC26", state.meta.mode || "Clubs Pro"]
    .map((label) => `<span class="signal-pill">${label}</span>`)
    .join("");

  adminName.textContent = admin;
  heroAdmin.textContent = admin;
  heroClubCount.textContent = state.clubs.length;
  heroPlayerCount.textContent = state.players.length;
  heroModeratorCount.textContent = getAllModerators().length;
  heroCountryCount.textContent = getCountryCount();
  updatedAt.textContent = formatDate(state.meta.updatedAt);

  formatLabel.textContent = state.meta.format || "Liga internacional";
  gameLabel.textContent = state.meta.game || "EA SPORTS FC 26";
  modeLabel.textContent = state.meta.mode || "Clubs Pro";

  footerBrand.textContent = leagueName;
  footerRegion.textContent = `${region} - ${state.meta.mode || "Clubs Pro"} - ${state.meta.game || "FC26"}`;
  footerUpdate.textContent = `Ultima actualizacion: ${formatDate(state.meta.updatedAt)}`;

  globalSummary.textContent =
    `${leagueName} reune ${state.clubs.length} clubes, ${state.players.length} jugadores, ` +
    `${getAllModerators().length} miembros de staff y ${getScheduledMatchCount()} partidos programados.`;

  if (fixturesSummary) {
    fixturesSummary.textContent =
      `${state.schedule.length} fechas base, ${state.schedule.length * 2} jornadas totales y ` +
      `${getScheduledMatchCount()} partidos programados automaticamente.`;
  }
}

function renderSummary() {
  const leaderClub = sortClubs(state.clubs)[0];
  const topScorer = sortPlayers(state.players, "goals")[0];
  const cards = [
    { label: "Clubes inscritos", value: state.clubs.length },
    { label: "Jugadores registrados", value: state.players.length },
    { label: "Fechas base", value: state.schedule.length },
    { label: "Partidos programados", value: getScheduledMatchCount() },
    { label: "Partidos jugados", value: getMatchCount() },
    { label: "Paises activos", value: getCountryCount() },
    { label: "Lider actual", value: leaderClub ? leaderClub.name : "Sin datos" },
    { label: "Maximo goleador", value: topScorer ? `${topScorer.name} - ${topScorer.goals}` : "Sin datos" },
  ];

  summaryGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card">
          <span>${card.label}</span>
          <strong>${card.value}</strong>
        </article>
      `
    )
    .join("");
}

function renderCommandCenter() {
  const items = [
    {
      label: "Cobertura",
      value: `${getCountryCount()} paises listados`,
    },
    {
      label: "Temporada",
      value: state.meta.season || "Season 01",
    },
    {
      label: "Calendario",
      value: `${state.schedule.length} fechas ida y ${state.schedule.length} vuelta`,
    },
    {
      label: "Publicacion",
      value: "Lista para abrir local o desplegar en web",
    },
  ];

  commandList.innerHTML = items
    .map(
      (item) => `
        <article>
          <span>${item.label}</span>
          <strong>${item.value}</strong>
        </article>
      `
    )
    .join("");

  spotlightList.innerHTML = [
    {
      title: "Calendario automatico",
      text: "Los partidos se generan solos desde los 22 clubes que cargaste en la liga.",
    },
    {
      title: "Staff editable",
      text: "Puedes agregar moderadores desde esta misma pagina y quedan guardados en tu navegador.",
    },
    {
      title: "Lectura clara",
      text: "Tabla, calendario, destacados y ranking de jugadores quedan visibles en una sola ruta.",
    },
  ]
    .map(
      (item) => `
        <li>
          <strong>${item.title}</strong>
          <span>${item.text}</span>
        </li>
      `
    )
    .join("");
}

function renderModerators() {
  const moderators = getAllModerators();
  moderatorCount.textContent = moderators.length;
  heroModeratorCount.textContent = moderators.length;

  if (!moderators.length) {
    moderatorsList.innerHTML = emptyStateTemplate.innerHTML;
    return;
  }

  moderatorsList.innerHTML = moderators
    .map((moderator) => {
      const isCustom = moderator.source === "custom";
      const statusClass = String(moderator.status || "").toLowerCase() === "standby" ? "standby" : "";
      return `
        <article class="moderator-item" data-source="${isCustom ? "custom" : "seed"}">
          <div>
            <strong>${moderator.name}</strong>
            <span>${moderator.role}</span>
            <p>${moderator.country} - ${isCustom ? "Agregado localmente" : "Base del torneo"}</p>
          </div>
          <div>
            <span class="status-badge ${statusClass}">${moderator.status || "Activo"}</span>
            ${isCustom ? `<button class="remove-btn" type="button" data-id="${moderator.id}">Quitar</button>` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderStandings() {
  if (!state.clubs.length) {
    clubStandingsBody.innerHTML = createEmptyRow(12);
    return;
  }

  clubStandingsBody.innerHTML = sortClubs(state.clubs)
    .map(
      (club, index) => `
        <tr>
          <td><span class="rank-badge">${index + 1}</span></td>
          <td>${club.name}</td>
          <td>${club.country || "Global"}</td>
          <td>${club.contact || club.manager || "Por asignar"}</td>
          <td>${club.played || 0}</td>
          <td>${club.wins || 0}</td>
          <td>${club.draws || 0}</td>
          <td>${club.losses || 0}</td>
          <td>${club.goalsFor || 0}</td>
          <td>${club.goalsAgainst || 0}</td>
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
            <span class="club-dot" style="background:${club.color || "#77f2ad"}"></span>
            <div>
              <h4>${club.name}</h4>
              <span class="club-meta">${club.country || "Global"} - Contacto: ${club.contact || club.manager || "Por asignar"}</span>
              <span class="club-meta">${club.stadium || "Sin estadio asignado"}</span>
            </div>
          </div>
          <p class="club-meta">
            Referente: ${starPlayer ? `${starPlayer.name} (${Number(starPlayer.rating).toFixed(1)})` : "Por definir"}
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
  if (!fixtureRoundFilter) {
    return;
  }

  fixtureRoundFilter.innerHTML = [
    '<option value="">Todas las fechas</option>',
    ...state.schedule.map((round) => `<option value="${round.fecha}">Fecha ${round.fecha}</option>`),
  ].join("");
}

function renderFixtureList(matches) {
  return matches
    .map((match, index) => {
      const homeClub = getClubById(match.homeId);
      const awayClub = getClubById(match.awayId);
      return `
        <li class="fixture-item">
          <span class="fixture-matchday">Partido ${index + 1}</span>
          <strong>${homeClub?.name || "Por definir"} vs ${awayClub?.name || "Por definir"}</strong>
          <small>${homeClub?.country || "Global"} vs ${awayClub?.country || "Global"}</small>
        </li>
      `;
    })
    .join("");
}

function renderFixtures() {
  if (!fixturesGrid) {
    return;
  }

  if (!state.schedule.length) {
    fixturesGrid.innerHTML = emptyStateTemplate.innerHTML;
    return;
  }

  const selectedRound = Number(fixtureRoundFilter?.value || 0);
  const roundsToRender = selectedRound
    ? state.schedule.filter((round) => round.fecha === selectedRound)
    : state.schedule;

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
              <ul class="fixture-list">
                ${renderFixtureList(round.ida)}
              </ul>
            </section>

            <section class="fixture-column">
              <div class="fixture-column-head">
                <span>Vuelta</span>
                <strong>Jornada ${round.fecha + state.schedule.length}</strong>
              </div>
              <ul class="fixture-list">
                ${renderFixtureList(round.vuelta)}
              </ul>
            </section>
          </div>
        </article>
      `
    )
    .join("");
}

function populatePlayerFilters() {
  const clubOptions = state.clubs
    .map((club) => `<option value="${club.id}">${club.name}</option>`)
    .join("");
  const positionOptions = [...new Set(state.players.map((player) => player.position).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((position) => `<option value="${position}">${position}</option>`)
    .join("");

  playerClubFilter.innerHTML = `<option value="">Todos los clubes</option>${clubOptions}`;
  playerPositionFilter.innerHTML = `<option value="">Todas las posiciones</option>${positionOptions}`;
}

function getFilteredPlayers() {
  const searchValue = playerSearch.value.trim().toLowerCase();
  const clubValue = playerClubFilter.value;
  const positionValue = playerPositionFilter.value;

  return sortPlayers(state.players, "rating").filter((player) => {
    const clubName = getClubName(player.clubId).toLowerCase();
    const matchesSearch =
      !searchValue ||
      player.name.toLowerCase().includes(searchValue) ||
      clubName.includes(searchValue) ||
      String(player.country || "").toLowerCase().includes(searchValue);

    const matchesClub = !clubValue || player.clubId === clubValue;
    const matchesPosition = !positionValue || player.position === positionValue;
    return matchesSearch && matchesClub && matchesPosition;
  });
}

function renderPlayers() {
  const players = getFilteredPlayers();

  if (!players.length) {
    playersTableBody.innerHTML = createEmptyRow(11);
    return;
  }

  playersTableBody.innerHTML = players
    .map(
      (player) => `
        <tr>
          <td>${player.name}</td>
          <td>${player.country || "Global"}</td>
          <td>${getClubName(player.clubId)}</td>
          <td>${player.position}</td>
          <td>${player.overall}</td>
          <td>${player.matches}</td>
          <td>${player.goals}</td>
          <td>${player.assists}</td>
          <td>${player.mvps}</td>
          <td>${player.cleanSheets}</td>
          <td>${Number(player.rating).toFixed(1)}</td>
        </tr>
      `
    )
    .join("");
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
    { title: "Mejor media", field: "rating", suffix: "de nota" },
  ];

  leaderboards.innerHTML = categories
    .map((category) => {
      const items = sortPlayers(state.players, category.field)
        .slice(0, 4)
        .map((player) => {
          const value = category.field === "rating" ? Number(player[category.field]).toFixed(1) : player[category.field];
          return `
            <div class="leader-item">
              <div>
                <strong>${player.name}</strong>
                <small>${getClubName(player.clubId)} - ${player.position} - ${player.country || "Global"}</small>
              </div>
              <strong>${value} ${category.suffix}</strong>
            </div>
          `;
        })
        .join("");

      return `
        <section class="leader-section">
          <h4>${category.title}</h4>
          ${items}
        </section>
      `;
    })
    .join("");
}

function addModeratorFromForm(event) {
  event.preventDefault();

  const formData = new FormData(moderatorForm);
  const requestedRole = String(formData.get("role") || "").trim();
  const moderator = {
    id: `custom-${Date.now()}`,
    name: String(formData.get("name") || "").trim(),
    country: String(formData.get("country") || "").trim(),
    role: requestedRole,
    status: String(formData.get("status") || "Activo").trim(),
    source: "custom",
  };

  if (!moderator.name || !moderator.country || !moderator.role) {
    return;
  }

  if (/\badmin\b/i.test(requestedRole) || /\badministrador\b/i.test(requestedRole)) {
    window.alert(`El unico admin del sitio es ${FIXED_ADMIN}. Usa un rol de moderacion diferente.`);
    return;
  }

  state.customModerators.unshift(moderator);
  saveCustomModerators();
  moderatorForm.reset();
  renderMeta();
  renderSummary();
  renderCommandCenter();
  renderModerators();
}

function removeModerator(event) {
  const button = event.target.closest("[data-id]");
  if (!button) {
    return;
  }

  const id = button.dataset.id;
  state.customModerators = state.customModerators.filter((moderator) => moderator.id !== id);
  saveCustomModerators();
  renderMeta();
  renderSummary();
  renderCommandCenter();
  renderModerators();
}

function setupFilters() {
  playerSearch.addEventListener("input", renderPlayers);
  playerClubFilter.addEventListener("change", renderPlayers);
  playerPositionFilter.addEventListener("change", renderPlayers);
}

function setupFixtures() {
  if (fixtureRoundFilter) {
    fixtureRoundFilter.addEventListener("change", renderFixtures);
  }
}

function setupModerators() {
  moderatorForm.addEventListener("submit", addModeratorFromForm);
  moderatorsList.addEventListener("click", removeModerator);
}

function setupReveal() {
  const revealItems = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 55, 220)}ms`;
    observer.observe(item);
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
    return await response.json();
  } catch (error) {
    console.warn("No se pudieron cargar datos remotos, usando respaldo local.", error);
    return null;
  }
}

async function loadData() {
  const remoteData = await fetchRemoteData();
  const localSeed = window.LEAGUE_DATA ? JSON.parse(JSON.stringify(window.LEAGUE_DATA)) : null;
  const data = remoteData || localSeed;

  if (!data) {
    throw new Error("No se encontraron datos del torneo.");
  }

  state.meta = data.meta || {};
  state.moderators = Array.isArray(data.moderators) ? data.moderators : [];
  state.customModerators = loadCustomModerators();
  state.clubs = Array.isArray(data.clubs) ? data.clubs : [];
  state.players = Array.isArray(data.players) ? data.players : [];
  state.schedule = generateRoundRobinSchedule(state.clubs);
}

async function init() {
  try {
    await loadData();
    renderMeta();
    renderSummary();
    renderCommandCenter();
    renderModerators();
    renderStandings();
    renderClubCards();
    populateFixtureFilter();
    renderFixtures();
    populatePlayerFilters();
    renderPlayers();
    renderLeaderboards();
    setupFilters();
    setupFixtures();
    setupModerators();
    setupReveal();
  } catch (error) {
    console.error(error);
    summaryGrid.innerHTML = emptyStateTemplate.innerHTML;
    moderatorsList.innerHTML = emptyStateTemplate.innerHTML;
    clubStandingsBody.innerHTML = createEmptyRow(12);
    clubCards.innerHTML = emptyStateTemplate.innerHTML;
    if (fixturesGrid) {
      fixturesGrid.innerHTML = emptyStateTemplate.innerHTML;
    }
    playersTableBody.innerHTML = createEmptyRow(11);
    leaderboards.innerHTML = emptyStateTemplate.innerHTML;
    footerUpdate.textContent = "No fue posible cargar la informacion del torneo";
  }
}

init();
