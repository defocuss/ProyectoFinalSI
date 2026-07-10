(function() {
  // ---------- NAVEGACIÓN ----------
  const slidesContainer = document.getElementById('slidesContainer');
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let currentSlide = 0;
  let isTransitioning = false;

  const headerLinks = document.querySelectorAll('.header a[data-slide]');
  const indicator = document.getElementById('slideIndicator');
  const pageIndicator = document.getElementById('pageIndicator');

  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = 'page-dot' + (i === 0 ? ' active' : '');
    dot.dataset.index = i;
    dot.addEventListener('click', () => goToSlide(i));
    pageIndicator.appendChild(dot);
  }
  const dots = pageIndicator.querySelectorAll('.page-dot');

  function goToSlide(index) {
    if (isTransitioning || index === currentSlide || index < 0 || index >= totalSlides) return;
    isTransitioning = true;
    currentSlide = index;
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    headerLinks.forEach(link => {
      link.classList.toggle('active', parseInt(link.dataset.slide) === currentSlide);
    });
    indicator.textContent = `${currentSlide + 1} / ${totalSlides}`;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
    setTimeout(() => { isTransitioning = false; }, 500);
  }

  document.getElementById('prevBtn').addEventListener('click', () => goToSlide(currentSlide - 1));
  document.getElementById('nextBtn').addEventListener('click', () => goToSlide(currentSlide + 1));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
    else if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
  });
  headerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(parseInt(link.dataset.slide));
    });
  });

  // ---------- SIMULACIÓN Q-LEARNING ----------
  const ROWS = 5, COLS = 5;
  const START = { r: 0, c: 0 };
  const GOAL = { r: ROWS-1, c: COLS-1 };
  const OBSTACLES = [{ r: 1, c: 2 }, { r: 2, c: 2 }, { r: 3, c: 2 }];
  const ACTIONS = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];

  let agent = { r: START.r, c: START.c };
  let qTable = [];
  let episode = 0, stepCount = 0, totalReward = 0;
  let isRunning = false, timerId = null, episodeSteps = 0;

  let alpha = 0.50, gamma = 0.90, epsilon = 0.20, speed = 200;

  const canvas = document.getElementById('gridCanvas');
  const ctx = canvas.getContext('2d');
  const qGridMini = document.getElementById('qGridMini');
  const episodeSpan = document.getElementById('episodeCount');
  const stepSpan = document.getElementById('stepCount');
  const rewardSpan = document.getElementById('totalReward');

  const alphaSlider = document.getElementById('alphaSlider');
  const gammaSlider = document.getElementById('gammaSlider');
  const epsilonSlider = document.getElementById('epsilonSlider');
  const speedSlider = document.getElementById('speedSlider');
  const alphaVal = document.getElementById('alphaVal');
  const gammaVal = document.getElementById('gammaVal');
  const epsilonVal = document.getElementById('epsilonVal');
  const speedVal = document.getElementById('speedVal');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');

  function initQTable() {
    qTable = [];
    for (let r = 0; r < ROWS; r++) {
      qTable[r] = [];
      for (let c = 0; c < COLS; c++) {
        qTable[r][c] = Array(ACTIONS.length).fill(0);
      }
    }
  }
  initQTable();

  function isObstacle(r, c) { return OBSTACLES.some(o => o.r === r && o.c === c); }
  function isValid(r, c) { return r >= 0 && r < ROWS && c >= 0 && c < COLS && !isObstacle(r, c); }
  function isGoal(r, c) { return r === GOAL.r && c === GOAL.c; }
  function resetAgent() { agent.r = START.r; agent.c = START.c; episodeSteps = 0; }

  function chooseAction(r, c) {
    if (Math.random() < epsilon) {
      const valid = [];
      for (let a = 0; a < ACTIONS.length; a++) {
        const nr = r + ACTIONS[a].dr, nc = c + ACTIONS[a].dc;
        if (isValid(nr, nc)) valid.push(a);
      }
      return valid.length ? valid[Math.floor(Math.random() * valid.length)] : 0;
    } else {
      const values = qTable[r][c];
      let best = 0, bestVal = -Infinity;
      for (let a = 0; a < values.length; a++) {
        const nr = r + ACTIONS[a].dr, nc = c + ACTIONS[a].dc;
        if (isValid(nr, nc) && values[a] > bestVal) {
          bestVal = values[a];
          best = a;
        }
      }
      return best;
    }
  }

  function step() {
    if (!isRunning) return;
    const r = agent.r, c = agent.c;
    if (isGoal(r, c)) { endEpisode(); return; }

    const action = chooseAction(r, c);
    const dr = ACTIONS[action].dr, dc = ACTIONS[action].dc;
    const nr = r + dr, nc = c + dc;
    let reward = -0.1, nextR = r, nextC = c;
    if (isValid(nr, nc)) {
      nextR = nr; nextC = nc;
      if (isGoal(nextR, nextC)) reward = 10;
    } else {
      reward = -1;
    }

    const oldQ = qTable[r][c][action];
    let maxNext = 0;
    if (isValid(nextR, nextC)) maxNext = Math.max(...qTable[nextR][nextC]);
    const newQ = oldQ + alpha * (reward + gamma * maxNext - oldQ);
    qTable[r][c][action] = newQ;

    agent.r = nextR; agent.c = nextC;
    stepCount++; totalReward += reward; episodeSteps++;
    updateStats();

    if (isGoal(agent.r, agent.c)) { endEpisode(); return; }
    drawGrid();
    drawQGridMini();
    if (isRunning) {
      clearTimeout(timerId);
      timerId = setTimeout(step, speed);
    }
  }

  function endEpisode() {
    episode++;
    resetAgent();
    updateStats();
    drawGrid();
    drawQGridMini();
    if (isRunning) timerId = setTimeout(step, speed);
  }

  function drawGrid() {
    const size = canvas.width / ROWS;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * size, y = r * size;
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size, size);
        if (isObstacle(r, c)) {
          ctx.fillStyle = '#3a3a3a';
          ctx.fillRect(x, y, size, size);
        }
        if (isGoal(r, c)) {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(x + size/2, y + size/2, size*0.3, 0, 2*Math.PI);
          ctx.fill();
          ctx.fillStyle = '#0f0f0f';
          ctx.font = `${size*0.5}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('M', x + size/2, y + size/2 + 2);
        }
      }
    }
    const ax = agent.c * size + size/2, ay = agent.r * size + size/2;
    ctx.shadowColor = 'rgba(33, 78, 52, 0.4)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#214E34';
    ctx.beginPath();
    ctx.arc(ax, ay, size*0.35, 0, 2*Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (isObstacle(r, c) || isGoal(r, c)) continue;
        const maxQ = Math.max(...qTable[r][c]);
        ctx.fillStyle = '#94a3b8';
        ctx.font = `${size*0.2}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(maxQ.toFixed(1), c*size + size/2, r*size + size - 4);
      }
    }
  }

  function drawQGridMini() {
    qGridMini.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'q-grid-cell';
        if (isObstacle(r, c)) {
          cell.textContent = 'X';
          cell.style.background = '#1a1a1a';
        } else if (isGoal(r, c)) {
          cell.textContent = 'M';
          cell.style.background = '#1a2a1a';
        } else {
          const maxQ = Math.max(...qTable[r][c]);
          const intensity = Math.min(1, (maxQ + 5) / 15);
          const g = Math.round(180 - intensity * 120);
          const b = Math.round(220 - intensity * 160);
          cell.style.background = `rgb(20, ${g}, ${b})`;
          cell.textContent = maxQ.toFixed(1);
        }
        qGridMini.appendChild(cell);
      }
    }
  }

  function updateStats() {
    episodeSpan.textContent = episode;
    stepSpan.textContent = stepCount;
    rewardSpan.textContent = totalReward.toFixed(1);
  }

  function startSimulation() {
    if (isRunning) {
      isRunning = false;
      clearTimeout(timerId);
      startBtn.textContent = 'Reanudar';
      return;
    }
    isRunning = true;
    startBtn.textContent = 'Pausar';
    if (episode === 0) {
      resetAgent();
      totalReward = 0; stepCount = 0;
      updateStats();
      drawGrid();
      drawQGridMini();
    }
    timerId = setTimeout(step, speed);
  }

  function resetSimulation() {
    isRunning = false;
    clearTimeout(timerId);
    startBtn.textContent = 'Iniciar';
    episode = 0; stepCount = 0; totalReward = 0;
    initQTable();
    resetAgent();
    updateStats();
    drawGrid();
    drawQGridMini();
    agent.r = START.r; agent.c = START.c;
    drawGrid();
  }

  alphaSlider.addEventListener('input', function() {
    alpha = parseFloat(this.value);
    alphaVal.textContent = alpha.toFixed(2);
  });
  gammaSlider.addEventListener('input', function() {
    gamma = parseFloat(this.value);
    gammaVal.textContent = gamma.toFixed(2);
  });
  epsilonSlider.addEventListener('input', function() {
    epsilon = parseFloat(this.value);
    epsilonVal.textContent = epsilon.toFixed(2);
  });
  speedSlider.addEventListener('input', function() {
    speed = parseInt(this.value);
    speedVal.textContent = speed;
    if (isRunning) {
      clearTimeout(timerId);
      timerId = setTimeout(step, speed);
    }
  });

  startBtn.addEventListener('click', startSimulation);
  resetBtn.addEventListener('click', resetSimulation);

  resetAgent();
  drawGrid();
  drawQGridMini();
  updateStats();
  alphaVal.textContent = alpha.toFixed(2);
  gammaVal.textContent = gamma.toFixed(2);
  epsilonVal.textContent = epsilon.toFixed(2);
  speedVal.textContent = speed;

  goToSlide(0);
})();