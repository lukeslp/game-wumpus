/**
 * Hunt the Wumpus - Classic Cave Adventure Game
 * Navigate dangerous caverns, avoid hazards, and hunt the fearsome Wumpus.
 */

/**
 * Cave network topology - dodecahedron graph structure.
 * Each room connects to exactly three adjacent rooms.
 */
const GRAPH = {
  1: [2, 5, 8],
  2: [1, 3, 10],
  3: [2, 4, 12],
  4: [3, 5, 14],
  5: [1, 4, 6],
  6: [5, 7, 15],
  7: [6, 8, 17],
  8: [1, 7, 9],
  9: [8, 10, 18],
 10: [2, 9, 11],
 11: [10, 12, 19],
 12: [3, 11, 13],
 13: [12, 14, 20],
 14: [4, 13, 15],
 15: [6, 14, 16],
 16: [15, 17, 20],
 17: [7, 16, 18],
 18: [9, 17, 19],
 19: [11, 18, 20],
 20: [13, 16, 19],
};

/** Array of all room numbers in the cave network. */
const ROOM_IDS = Object.keys(GRAPH).map(Number);

/** Game configuration constants. */
const config = {
  arrows: 5,
  pits: 2,
  bats: 2,
};

/** Current game state. */
const state = {
  mode: 'move',
  arrowCount: config.arrows,
  turnCount: 0,
  visited: new Set(),
  player: null,
  wumpus: null,
  pits: new Set(),
  bats: new Set(),
  log: [],
  shotPath: [],
  gameOver: false,
  outcome: 'Exploring',
};

/** DOM element references. */
const roomsLayer = document.getElementById('rooms-layer');
const linesSvg = document.getElementById('cave-lines');
const restartBtn = document.getElementById('restart');
const modeButtons = document.querySelectorAll('.chip');
const arrowCountEl = document.getElementById('arrow-count');
const turnCountEl = document.getElementById('turn-count');
const gameStateEl = document.getElementById('game-state');
const logEl = document.getElementById('log');
const shotDisplayEl = document.getElementById('shot-display');
const fireShotBtn = document.getElementById('fire-shot');
const clearShotBtn = document.getElementById('clear-shot');
const dispatchGlanceEl = document.getElementById('dispatch-glance');

/** Map of room numbers to their DOM node elements. */
const roomNodes = new Map();

/**
 * Room positions as a Schlegel diagram of the dodecahedron.
 * Four concentric pentagons where visual adjacency matches graph adjacency.
 *   Ring 1 (outer):  1, 2, 3, 4, 5   — the outer pentagon
 *   Ring 2:          8,10,12,14, 6   — each bridges one Ring 1 node to two Ring 3 nodes
 *   Ring 3:          9,11,13,15, 7   — each bridges two Ring 2 nodes to one Ring 4 node
 *   Ring 4 (inner): 18,19,20,16,17   — the inner pentagon
 */
const ROOM_POSITIONS = {
  1:  { x: 50.0, y:  5.0 },
  2:  { x: 92.8, y: 36.1 },
  3:  { x: 76.5, y: 86.4 },
  4:  { x: 23.5, y: 86.4 },
  5:  { x:  7.2, y: 36.1 },
  6:  { x: 18.6, y: 39.8 },
  7:  { x: 37.1, y: 32.2 },
  8:  { x: 50.0, y: 17.0 },
  9:  { x: 62.9, y: 32.2 },
  10: { x: 81.4, y: 39.8 },
  11: { x: 70.9, y: 56.8 },
  12: { x: 69.4, y: 76.7 },
  13: { x: 50.0, y: 72.0 },
  14: { x: 30.6, y: 76.7 },
  15: { x: 29.1, y: 56.8 },
  16: { x: 38.6, y: 53.7 },
  17: { x: 42.9, y: 40.3 },
  18: { x: 57.1, y: 40.3 },
  19: { x: 61.4, y: 53.7 },
  20: { x: 50.0, y: 62.0 },
};

/**
 * Initialize a new game with fresh cave layout and reset state.
 */
function startGame() {
  state.visited.clear();
  state.pits.clear();
  state.bats.clear();
  state.log = [];
  state.turnCount = 0;
  state.arrowCount = config.arrows;
  state.shotPath = [];
  state.gameOver = false;
  state.outcome = 'Exploring';
  setMode('move', { silent: true });

  const used = new Set();
  state.player = drawRoom(used);
  state.visited.add(state.player);
  state.wumpus = drawRoom(used);

  for (let i = 0; i < config.pits; i += 1) {
    state.pits.add(drawRoom(used));
  }
  for (let i = 0; i < config.bats; i += 1) {
    state.bats.add(drawRoom(used));
  }

  addLog('Fresh cave plotted. Hunt the Wumpus!', true);
  updateUI();
}

/**
 * Select a random room that hasn't been used yet.
 * @param {Set} used - Set of already-occupied room numbers
 * @returns {number} A random available room number
 */
function drawRoom(used) {
  const available = ROOM_IDS.filter((room) => !used.has(room));
  const room = available[Math.floor(Math.random() * available.length)];
  used.add(room);
  return room;
}

/**
 * Add a message to the game log.
 * @param {string} message - The message to display
 * @param {boolean} important - Whether to highlight the message
 */
function addLog(message, important = false) {
  state.log.unshift({ message, important, id: crypto.randomUUID ? crypto.randomUUID() : Math.random() });
  state.log = state.log.slice(0, 7);
  renderLog();
}

/**
 * Update the DOM with current log entries.
 */
function renderLog() {
  logEl.innerHTML = '';
  state.log.forEach((entry) => {
    const item = document.createElement('li');
    item.textContent = entry.message;
    if (entry.important) item.classList.add('important');
    logEl.appendChild(item);
  });
  if (dispatchGlanceEl) {
    const latest = state.log[0];
    if (latest) {
      dispatchGlanceEl.textContent = latest.message;
      dispatchGlanceEl.classList.toggle('important', Boolean(latest.important));
    } else {
      dispatchGlanceEl.textContent = 'Awaiting intel...';
      dispatchGlanceEl.classList.remove('important');
    }
  }
}

/**
 * Switch between move and shoot modes.
 * @param {string} mode - Either 'move' or 'shoot'
 * @param {Object} options - Configuration options
 * @param {boolean} options.silent - If true, skip UI update
 */
function setMode(mode, { silent = false } = {}) {
  state.mode = mode;
  if (mode === 'move') {
    state.shotPath = [];
  }
  modeButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  if (!silent) updateUI();
}

/**
 * Handle clicks on room nodes.
 * @param {Event} event - Click event
 */
function handleRoomClick(event) {
  if (state.gameOver) return;
  const node = event.target.closest('.room-node');
  if (!node) return;
  const room = Number(node.dataset.room);
  if (state.mode === 'move') {
    attemptMove(room);
  } else {
    queueShotRoom(room);
  }
}

/**
 * Attempt to move the player to an adjacent room.
 * @param {number} room - Target room number
 */
function attemptMove(room) {
  if (room === state.player) return;
  if (!GRAPH[state.player].includes(room)) {
    addLog('You cannot walk there directly.');
    return;
  }
  state.player = room;
  state.visited.add(room);
  state.turnCount += 1;
  addLog(`Moved to room ${room}.`);
  resolveRoom();
  updateUI();
}

/**
 * Check current room for hazards and provide sensory clues.
 * @param {number} batDepth - Current bat teleport chain depth
 */
function resolveRoom(batDepth = 0) {
  if (state.player === state.wumpus) {
    loseGame('The Wumpus wakes and eats you.');
    return;
  }
  if (state.pits.has(state.player)) {
    loseGame('You fall forever into a bottomless pit.');
    return;
  }
  if (state.bats.has(state.player)) {
    addLog('Super bats whisk you through the dark!', true);
    teleportPlayer(batDepth + 1);
    return;
  }

  const warnings = describeRoom(state.player);
  const cues = [];
  if (warnings.stench) cues.push('You smell a stench.');
  if (warnings.breeze) cues.push('You feel a draft.');
  if (warnings.flutter) cues.push('You hear flapping.');
  if (cues.length === 0) {
    addLog('All is quiet... for now.');
  } else {
    cues.forEach((msg) => addLog(msg));
  }
}

/**
 * Teleport player to a random room (super bats effect).
 * @param {number} depth - Current teleport chain depth (guards against unbounded recursion)
 */
function teleportPlayer(depth = 0) {
  if (depth > 10) {
    addLog('The bats finally drop you here.', true);
    return;
  }
  const forbidden = new Set([state.player]);
  state.player = drawRoom(forbidden);
  state.visited.add(state.player);
  resolveRoom(depth);
}

/**
 * Get sensory clues for a given room.
 * @param {number} room - Room number to analyze
 * @returns {{stench: boolean, breeze: boolean, flutter: boolean}} Detected hazards
 */
function describeRoom(room) {
  const neighbors = GRAPH[room];
  return {
    stench: neighbors.includes(state.wumpus),
    breeze: neighbors.some((neighbor) => state.pits.has(neighbor)),
    flutter: neighbors.some((neighbor) => state.bats.has(neighbor)),
  };
}

/**
 * Add a room to the arrow's flight path.
 * @param {number} room - Room to add to shot path
 */
function queueShotRoom(room) {
  if (state.shotPath.length >= 5) {
    addLog('Maximum of five rooms per shot.');
    return;
  }
  state.shotPath.push(room);
  addLog(`Arrow will travel through room ${room}.`);
  updateShotDisplay();
}

/**
 * Clear the current arrow path.
 */
function clearShot() {
  state.shotPath = [];
  updateShotDisplay();
}

/**
 * Fire an arrow along the configured path.
 */
function fireShot() {
  if (state.mode !== 'shoot') {
    addLog('Switch to shoot mode first.');
    return;
  }
  if (state.shotPath.length === 0) {
    addLog('Select at least one room for the arrow.');
    return;
  }
  if (state.arrowCount <= 0) {
    addLog('No arrows remain!', true);
    return;
  }

  state.arrowCount -= 1;
  state.turnCount += 1;
  addLog(`Arrow released through rooms ${state.shotPath.join(' → ')}.`);

  let arrowRoom = state.player;
  for (let i = 0; i < state.shotPath.length; i += 1) {
    const target = state.shotPath[i];
    const neighbors = GRAPH[arrowRoom];
    if (neighbors.includes(target)) {
      arrowRoom = target;
    } else {
      arrowRoom = neighbors[Math.floor(Math.random() * neighbors.length)];
      addLog(`Arrow ricochets into room ${arrowRoom}.`);
    }

    if (arrowRoom === state.wumpus) {
      addLog('A horrible scream echoes — the Wumpus is dead!', true);
      winGame();
      clearShot();
      updateUI();
      return;
    }
    if (arrowRoom === state.player) {
      loseGame('Your own arrow strikes you down.');
      clearShot();
      updateUI();
      return;
    }
  }

  clearShot();
  addLog('Arrow clatters harmlessly.');
  maybeMoveWumpus();
  updateUI();
}

/**
 * Randomly move the Wumpus to an adjacent room (25% chance).
 */
function maybeMoveWumpus() {
  if (state.gameOver) return;
  if (Math.random() < 0.75) return;
  const neighbors = GRAPH[state.wumpus];
  state.wumpus = neighbors[Math.floor(Math.random() * neighbors.length)];
  addLog('You hear heavy footsteps in the dark...', true);
  if (state.wumpus === state.player) {
    loseGame('The Wumpus shambles into your room.');
  }
}

/**
 * Set game state to victory.
 */
function winGame() {
  state.gameOver = true;
  state.outcome = 'Victory';
  addLog('You survive another expedition.', true);
}

/**
 * Set game state to defeat.
 * @param {string} message - Message explaining how the player died
 */
function loseGame(message) {
  state.gameOver = true;
  state.outcome = 'Doomed';
  addLog(message, true);
}

/**
 * Build the cave visualization with SVG lines and room nodes.
 */
function buildCave() {
  linesSvg.innerHTML = '';
  roomsLayer.innerHTML = '';

  ROOM_IDS.forEach((room) => {
    GRAPH[room].forEach((neighbor) => {
      if (room < neighbor) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const start = ROOM_POSITIONS[room];
        const end = ROOM_POSITIONS[neighbor];
        line.setAttribute('x1', start.x);
        line.setAttribute('y1', start.y);
        line.setAttribute('x2', end.x);
        line.setAttribute('y2', end.y);
        linesSvg.appendChild(line);
      }
    });
  });

  ROOM_IDS.forEach((room) => {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'room-node';
    node.dataset.room = room;
    node.style.left = `${ROOM_POSITIONS[room].x}%`;
    node.style.top = `${ROOM_POSITIONS[room].y}%`;

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = room;
    node.appendChild(label);

    const hints = document.createElement('span');
    hints.className = 'hint-icons';
    node.appendChild(hints);

    node.setAttribute('aria-label', `Room ${room}`);
    roomsLayer.appendChild(node);
    roomNodes.set(room, node);
  });

  roomsLayer.addEventListener('click', handleRoomClick);
}

/**
 * Update visual state of all room nodes based on game state.
 */
function updateCaveNodes() {
  const neighbors = new Set(GRAPH[state.player]);
  roomNodes.forEach((node, room) => {
    node.classList.toggle('player', room === state.player);
    node.classList.toggle('move-option', state.mode === 'move' && neighbors.has(room));
    node.classList.remove('aim-step');
    node.removeAttribute('data-step');

    const reveal = state.visited.has(room) || state.gameOver;
    node.classList.toggle('revealed', reveal);
    node.classList.toggle('wumpus', reveal && room === state.wumpus);
    node.classList.toggle('pit', reveal && state.pits.has(room));
    node.classList.toggle('bats', reveal && state.bats.has(room));

    const hints = node.querySelector('.hint-icons');
    hints.textContent = '';
    const details = reveal ? describeRoom(room) : null;
    if (details) {
      if (details.stench && room !== state.wumpus) hints.textContent += '💀';
      if (details.breeze && !state.pits.has(room)) hints.textContent += '〰';
      if (details.flutter && !state.bats.has(room)) hints.textContent += '🦇';
    }

    const parts = [`Room ${room}`];
    if (room === state.player) parts.push('(your location)');
    else if (state.mode === 'move' && neighbors.has(room)) parts.push('(adjacent)');
    if (reveal && room === state.wumpus) parts.push('- Wumpus');
    if (reveal && state.pits.has(room)) parts.push('- pit');
    if (reveal && state.bats.has(room)) parts.push('- bats');
    if (details && room !== state.wumpus && !state.pits.has(room) && !state.bats.has(room)) {
      if (details.stench) parts.push('- stench nearby');
      if (details.breeze) parts.push('- breeze nearby');
      if (details.flutter) parts.push('- bats nearby');
    }
    node.setAttribute('aria-label', parts.join(' '));
  });

  state.shotPath.forEach((room, index) => {
    const node = roomNodes.get(room);
    if (!node) return;
    node.classList.add('aim-step');
    node.dataset.step = index + 1;
  });
}

/**
 * Update the game status display (arrows, turns, state).
 */
function updateStatus() {
  arrowCountEl.textContent = state.arrowCount;
  turnCountEl.textContent = state.turnCount;
  gameStateEl.textContent = state.outcome;
}

/**
 * Update the arrow path display and button states.
 */
function updateShotDisplay() {
  shotDisplayEl.textContent = state.shotPath.length
    ? state.shotPath.join(' → ')
    : 'Select up to five rooms.';
  fireShotBtn.disabled =
    state.mode !== 'shoot' || state.shotPath.length === 0 || state.arrowCount <= 0 || state.gameOver;
  clearShotBtn.disabled = state.shotPath.length === 0;
  updateCaveNodes();
}

/**
 * Update all UI elements to match current game state.
 */
function updateUI() {
  updateStatus();
  updateShotDisplay();
}

/**
 * Bind event listeners for game controls.
 */
function bindControls() {
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });
  restartBtn.addEventListener('click', startGame);
  fireShotBtn.addEventListener('click', fireShot);
  clearShotBtn.addEventListener('click', clearShot);

  document.addEventListener('keydown', (event) => {
    if (state.gameOver) return;
    if (state.mode !== 'move') return;
    const map = {
      w: GRAPH[state.player][0],
      a: GRAPH[state.player][1],
      s: GRAPH[state.player][2],
    };
    const target = map[event.key];
    if (target) {
      event.preventDefault();
      attemptMove(target);
    }
  });
}

/** Initialize the game. */
buildCave();
bindControls();
startGame();

// === Save/Load Functionality ===
const saveManager = new SaveStateManager('wumpus');

function getGameState() {
  return {
    mode: state.mode,
    arrowCount: state.arrowCount,
    turnCount: state.turnCount,
    visited: state.visited,
    player: state.player,
    wumpus: state.wumpus,
    pits: state.pits,
    bats: state.bats,
    log: state.log,
    shotPath: state.shotPath,
    gameOver: state.gameOver,
    outcome: state.outcome,
  };
}

function setGameState(saved) {
  Object.assign(state, saved);
  renderLog();
  updateUI();
}

// Add save/load buttons to header
const header = document.querySelector('header');
if (header && typeof createSaveUI === 'function') {
  createSaveUI(saveManager, getGameState, setGameState, header);
}