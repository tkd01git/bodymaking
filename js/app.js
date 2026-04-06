const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const state = {
  selectedGroup: 'chest',
  selectedExercise: 'ベンチプレス',
  selectedDate: todayStr,
  selectedHistoryDate: todayStr,
  selectedHistoryRange: 'daily',
  selectedCalendarMetric: 'total',
  selectedSummaryMetric: 'total',
  profile: JSON.parse(localStorage.getItem('liftflow-profile') || 'null') || structuredClone(window.DEFAULT_PROFILE),
  setRecords: { ...(window.USE_SAMPLE_DATA ? window.sampleSetRecords : {}), ...JSON.parse(localStorage.getItem('liftflow-set-records') || '{}') },
  restRemaining: 120,
  restTimer: null,
  rootMode: 'record'
};

const el = {
  recordRoot: document.getElementById('record-root'),
  historyRoot: document.getElementById('history-root'),
  muscleGroupSelect: document.getElementById('muscleGroupSelect'),
  exerciseSelect: document.getElementById('exerciseSelect'),
  exerciseName: document.getElementById('exerciseName'),
  lastPerformed: document.getElementById('lastPerformed'),
  goalSets: document.getElementById('goalSets'),
  goalReps: document.getElementById('goalReps'),
  aiSuggestionText: document.getElementById('aiSuggestionText'),
  muscleNames: document.getElementById('muscleNames'),
  restDisplay: document.getElementById('restDisplay'),
  restMin: document.getElementById('restMin'),
  restSec: document.getElementById('restSec'),
  restStart: document.getElementById('restStart'),
  restReset: document.getElementById('restReset'),
  setNumber: document.getElementById('setNumber'),
  repNumber: document.getElementById('repNumber'),
  weightNumber: document.getElementById('weightNumber'),
  addSetBtn: document.getElementById('addSetBtn'),
  setRecords: document.getElementById('setRecords'),
  recordCard: document.getElementById('recordCard'),
  timerCard: document.getElementById('timerCard'),
  suggestionCard: document.getElementById('suggestionCard'),
  dailyAiText: document.getElementById('dailyAiText'),
  calendarGrid: document.getElementById('calendarGrid'),
  calendarMetricSelect: document.getElementById('calendarMetricSelect'),
  calendarMonthLabel: document.getElementById('calendarMonthLabel'),
  summaryMetricSelect: document.getElementById('summaryMetricSelect'),
  summaryVolume: document.getElementById('summaryVolume'),
  summaryAvgWeight: document.getElementById('summaryAvgWeight'),
  summaryReps: document.getElementById('summaryReps'),
  summarySets: document.getElementById('summarySets'),
  historyComboCanvas: document.getElementById('historyComboCanvas'),
  trainingTrendCanvas: document.getElementById('trainingTrendCanvas'),
  openSetupBtn: document.getElementById('openSetupBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsMenu: document.getElementById('settingsMenu'),
  driveSyncBtn: document.getElementById('driveSyncBtn'),
  setupModal: document.getElementById('setupModal'),
  saveProfileBtn: document.getElementById('saveProfileBtn'),
  closeSetupBtn: document.getElementById('closeSetupBtn'),
  prevChartBtn: document.getElementById('prevChartBtn'),
  nextChartBtn: document.getElementById('nextChartBtn')
};

const { getSetKey, dateDiffDays, flashGold, drawDualChart } = window.helpers;

function saveLocal() {
  localStorage.setItem('liftflow-set-records', JSON.stringify(state.setRecords));
}

function saveProfileLocal(profile) {
  state.profile = profile;
  localStorage.setItem('liftflow-profile', JSON.stringify(profile));
}

async function loadDriveDataOnStartup() {
  try {
    const profileRes = await window.driveApi.loadProfile();
    if (profileRes?.profile) {
      state.profile = profileRes.profile;
      localStorage.setItem('liftflow-profile', JSON.stringify(state.profile));
    }
  } catch (e) {
    console.error('Drive profile load failed:', e);
  }

  try {
    const recordsRes = await window.driveApi.loadRecords();
    if (recordsRes?.records) {
      state.setRecords = recordsRes.records;
      localStorage.setItem('liftflow-set-records', JSON.stringify(state.setRecords));
    }
  } catch (e) {
    console.error('Drive records load failed:', e);
  }
}

function toggleSettingsMenu() {
  el.settingsMenu.classList.toggle('hidden');
}

function closeSettingsMenu() {
  el.settingsMenu.classList.add('hidden');
}

function openSetupModal() {
  el.setupModal.classList.remove('hidden');
  window.helpers.writeProfileToForm(state.profile);
}

function closeSetupModal() {
  el.setupModal.classList.add('hidden');
}

function getRecordsForDate(date) {
  return Object.keys(state.setRecords)
    .filter(key => key.startsWith(`${date}__`))
    .flatMap(key => {
      const exercise = key.split('__')[1];
      return state.setRecords[key].map(r => ({ ...r, exercise }));
    });
}

function matchFilter(exercise, filter) {
  const g = window.EXERCISES[exercise]?.group;
  if (filter === 'total') return true;
  if (filter === 'upper') return ['chest', 'shoulder', 'back', 'arms'].includes(g);
  if (filter === 'lower') return g === 'legs';
  if (filter === 'legs') return g === 'legs';
  return g === filter;
}

function getFilteredRecordsForDate(date, filter = 'total') {
  return getRecordsForDate(date).filter(r => matchFilter(r.exercise, filter));
}

function getTotalVolumeForDate(date, filter = 'total') {
  return getFilteredRecordsForDate(date, filter).reduce((sum, r) => sum + r.reps * r.weight, 0);
}

function getAvgWeightForDate(date, filter = 'total') {
  const records = getFilteredRecordsForDate(date, filter);
  if (!records.length) return 0;
  return Math.round((records.reduce((sum, r) => sum + r.weight, 0) / records.length) * 10) / 10;
}

function getTotalRepsForDate(date, filter = 'total') {
  return getFilteredRecordsForDate(date, filter).reduce((sum, r) => sum + r.reps, 0);
}

function getSetCountForDate(date, filter = 'total') {
  return getFilteredRecordsForDate(date, filter).length;
}

function getAllDatesWithTraining() {
  return [...new Set(Object.keys(state.setRecords).map(k => k.split('__')[0]))].sort();
}

function makeSuggestion(exerciseName) {
  const ex = window.EXERCISES[exerciseName];
  const days = dateDiffDays(state.selectedDate, ex.lastDate);
  const goalSets = 3;
  const goalReps = ['サイドレイズ', 'ダンベルフライ'].includes(exerciseName) ? '10-15' : exerciseName === '懸垂' ? '6-10' : '5-8';
  const tone = days < 2 ? 'Recovery Focus' : 'Progressive Load';
  const text = days < 2
    ? 'Previous session is close, so today prioritizes quality and repeatability over pushing load.'
    : 'Recent trend is stable, so today aims to keep quality high and slightly raise total work.';
  return { goalSets, goalReps, tone, text };
}

function makeRecoverySuggestion() {
  const todayVol = getTotalVolumeForDate(state.selectedDate);
  return {
    text: todayVol > 0
      ? '今日の負荷を踏まえると、回復を優先して睡眠と食事を丁寧に整えるのがおすすめです。'
      : '今日は軽めなので、無理をせず体調管理を優先して次回に備えましょう。'
  };
}

async function refreshAiSuggestions() {
  const payload = {
    profile: state.profile,
    selectedExercise: state.selectedExercise,
    selectedDate: state.selectedDate,
    records: state.setRecords,
    variationSeed: Date.now()
  };

  try {
    const training = await window.aiApi.getTrainingPlan(payload);
    el.goalSets.textContent = training.goalSets ?? '-';
    el.goalReps.textContent = training.goalReps ?? '-';
    el.aiSuggestionText.textContent = training.text ?? '';
  } catch (_) {
    const fallback = makeSuggestion(state.selectedExercise);
    el.goalSets.textContent = fallback.goalSets;
    el.goalReps.textContent = fallback.goalReps;
    el.aiSuggestionText.textContent = fallback.text;
  }

  try {
    const recovery = await window.aiApi.getRecoveryPlan(payload);
    el.dailyAiText.textContent = recovery.text ?? '';
  } catch (_) {
    const fallback = makeRecoverySuggestion();
    el.dailyAiText.textContent = fallback.text;
  }
}

function renderExerciseOptions() {
  el.exerciseSelect.innerHTML = '';
  Object.entries(window.EXERCISES)
    .filter(([, v]) => v.group === state.selectedGroup)
    .forEach(([name]) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      el.exerciseSelect.appendChild(opt);
    });

  if (!window.EXERCISES[state.selectedExercise] || window.EXERCISES[state.selectedExercise].group !== state.selectedGroup) {
    state.selectedExercise = el.exerciseSelect.value || Object.keys(window.EXERCISES)[0];
  }
}

function renderBodyMap() {
  document.querySelectorAll('#frontBody [id], #backBody [id]').forEach(node => {
    if (node.tagName !== 'svg') node.setAttribute('fill', '#1f2937');
  });

  window.EXERCISES[state.selectedExercise].target.forEach(id => {
    const node = document.getElementById(id);
    if (node) node.setAttribute('fill', '#ef4444');
  });
}

function renderSetRecords() {
  const records = state.setRecords[getSetKey(state.selectedDate, state.selectedExercise)] || [];
  if (!records.length) {
    el.setRecords.innerHTML = '<div class="sub">まだ記録がありません。</div>';
    return;
  }

  el.setRecords.innerHTML = records.map((r, i) =>
    `<div class="record-item">
      <div>
        <div class="record-main">${r.set} set / ${r.reps} reps / ${r.weight}kg</div>
        <div class="record-sub">Volume ${r.reps * r.weight}</div>
      </div>
      <button data-remove="${i}" style="width:auto;">Delete</button>
    </div>`
  ).join('');

  el.setRecords.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', async () => {
    const arr = state.setRecords[getSetKey(state.selectedDate, state.selectedExercise)] || [];
    arr.splice(Number(btn.dataset.remove), 1);
    state.setRecords[getSetKey(state.selectedDate, state.selectedExercise)] = arr;
    saveLocal();
    renderSetRecords();
    renderTrainingTrend();
    renderHistorySummary();
    renderCalendar();
    await saveRecordsEveryTime();
  }));
}

async function renderTraining() {
  const ex = window.EXERCISES[state.selectedExercise];
  el.exerciseName.textContent = state.selectedExercise;
  el.lastPerformed.textContent = `前回実施: ${ex.lastDate}`;
  el.muscleNames.innerHTML = ex.muscles.map(m => `<span class="muscle-pill">${m}</span>`).join('');
  renderSetRecords();
  renderBodyMap();
  renderTrainingTrend();
  await refreshAiSuggestions();
}

function renderTrainingTrend() {
  const dates = getAllDatesWithTraining().slice(-6);
  const left = dates.map(d => ({
    label: `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`,
    value: getTotalVolumeForDate(d)
  }));
  const right = dates.map(d => ({
    label: `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`,
    value: getAvgWeightForDate(d)
  }));
  drawDualChart(el.trainingTrendCanvas, left, right);
}

function aggregateSeries(range) {
  const dates = getAllDatesWithTraining();
  if (!dates.length) return { left: [], right: [] };

  if (range === 'daily') {
    return {
      left: dates.map(d => ({
        label: `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`,
        value: getTotalVolumeForDate(d)
      })),
      right: dates.map(d => ({
        label: `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`,
        value: getAvgWeightForDate(d)
      }))
    };
  }

  if (range === 'weekly') {
    const weeks = {};
    dates.forEach(d => {
      const dt = new Date(d + 'T00:00:00');
      const start = new Date(dt);
      start.setDate(dt.getDate() - dt.getDay());
      const key = `${start.getMonth() + 1}/${start.getDate()}`;

      if (!weeks[key]) weeks[key] = { volume: 0, avgList: [] };
      weeks[key].volume += getTotalVolumeForDate(d);

      const avg = getAvgWeightForDate(d);
      if (avg) weeks[key].avgList.push(avg);
    });

    const keys = Object.keys(weeks);
    return {
      left: keys.map(k => ({ label: k, value: weeks[k].volume })),
      right: keys.map(k => ({
        label: k,
        value: Math.round((weeks[k].avgList.reduce((a, b) => a + b, 0) / Math.max(weeks[k].avgList.length, 1)) * 10) / 10
      }))
    };
  }

  const months = {};
  dates.forEach(d => {
    const dt = new Date(d + 'T00:00:00');
    const key = `${dt.getMonth() + 1}月`;

    if (!months[key]) months[key] = { volume: 0, avgList: [] };
    months[key].volume += getTotalVolumeForDate(d);

    const avg = getAvgWeightForDate(d);
    if (avg) months[key].avgList.push(avg);
  });

  const keys = Object.keys(months);
  return {
    left: keys.map(k => ({ label: k, value: months[k].volume })),
    right: keys.map(k => ({
      label: k,
      value: Math.round((months[k].avgList.reduce((a, b) => a + b, 0) / Math.max(months[k].avgList.length, 1)) * 10) / 10
    }))
  };
}

function renderCalendar() {
  const baseDate = new Date(state.selectedHistoryDate + 'T00:00:00');
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  el.calendarMonthLabel.textContent = `${year}年${month + 1}月`;
  el.calendarGrid.innerHTML = '';

  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => {
    const node = document.createElement('div');
    node.className = 'dow';
    node.textContent = d;
    el.calendarGrid.appendChild(node);
  });

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'day empty';
    el.calendarGrid.appendChild(blank);
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const metric = getTotalVolumeForDate(dateStr, state.selectedCalendarMetric);

    const btn = document.createElement('button');
    btn.className = 'day';
    if (metric > 0) btn.classList.add('partial');
    if (dateStr === state.selectedHistoryDate) btn.classList.add('active');

    btn.innerHTML = `<div class="day-num">${d}</div><div class="day-metric">${metric || '-'}</div>`;
    btn.addEventListener('click', () => {
      state.selectedHistoryDate = dateStr;
      renderHistorySummary();
      renderCalendar();
    });

    el.calendarGrid.appendChild(btn);
  }
}

function renderHistorySummary() {
  const date = state.selectedHistoryDate;
  const filter = state.selectedSummaryMetric;

  el.summaryVolume.textContent = getTotalVolumeForDate(date, filter) || '-';
  el.summaryAvgWeight.textContent = getAvgWeightForDate(date, filter) || '-';
  el.summaryReps.textContent = getTotalRepsForDate(date, filter) || '-';
  el.summarySets.textContent = getSetCountForDate(date, filter) || '-';

  const aggregated = aggregateSeries(state.selectedHistoryRange);
  const leftWindow = getWindowedSeries(aggregated.left, state.chartOffset, state.chartWindowSize);
  const rightWindow = getWindowedSeries(aggregated.right, state.chartOffset, state.chartWindowSize);
  drawDualChart(el.historyComboCanvas, leftWindow, rightWindow);
}

function renderRootMode() {
  document.querySelectorAll('.tab').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === state.rootMode));
  el.recordRoot.classList.toggle('hidden', state.rootMode !== 'record');
  el.historyRoot.classList.toggle('hidden', state.rootMode !== 'history');
}

function syncRestFromInput() {
  state.restRemaining = Math.max(0, Number(el.restMin.value || 0) * 60 + Number(el.restSec.value || 0));
  renderRest();
}

function renderRest() {
  const m = Math.floor(state.restRemaining / 60);
  const s = state.restRemaining % 60;
  el.restDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function notifyRestEnd() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;

    if (AudioCtx) {
      const ctx = new AudioCtx();

      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      playTone(880, now, 0.18);
      playTone(1174, now + 0.18, 0.18);
      playTone(1568, now + 0.36, 0.28);
    }
  } catch (e) {
    console.error(e);
  }

  if (navigator.vibrate) {
    navigator.vibrate([150, 80, 150, 80, 250]);
  }

  flashGold(el.timerCard);
}

function startRestTimer() {
  clearInterval(state.restTimer);
  if (state.restRemaining <= 0) syncRestFromInput();
  flashGold(el.timerCard);

  state.restTimer = setInterval(() => {
    state.restRemaining -= 1;
    renderRest();
    if (state.restRemaining <= 0) {
      clearInterval(state.restTimer);
      state.restTimer = null;
      notifyRestEnd();
    }
  }, 1000);
}

async function saveRecordsEveryTime() {
  try {
    await window.driveApi.saveRecords(state.setRecords);
  } catch (e) {
    console.error(e);
  }
}

async function addSetRecord() {
  const key = getSetKey(state.selectedDate, state.selectedExercise);
  const arr = state.setRecords[key] || [];
  arr.push({
    set: Number(el.setNumber.value),
    reps: Number(el.repNumber.value),
    weight: Number(el.weightNumber.value)
  });
  state.setRecords[key] = arr.sort((a, b) => a.set - b.set);

  saveLocal();
  el.setNumber.value = String(Math.min(Number(el.setNumber.value) + 1, 8));

  renderSetRecords();
  renderTrainingTrend();
  renderHistorySummary();
  renderCalendar();
  flashGold(el.recordCard);
  syncRestFromInput();
  startRestTimer();
  await saveRecordsEveryTime();
}

function initSelectors() {
  window.MUSCLE_GROUPS.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.value;
    opt.textContent = g.label;
    el.muscleGroupSelect.appendChild(opt);
  });

  renderExerciseOptions();

  for (let i = 1; i <= 8; i++) {
    el.setNumber.insertAdjacentHTML('beforeend', `<option value="${i}">${i} set</option>`);
  }
  for (let i = 1; i <= 20; i++) {
    el.repNumber.insertAdjacentHTML('beforeend', `<option value="${i}">${i} reps</option>`);
  }
  for (let i = 0; i <= 220; i += 2.5) {
    el.weightNumber.insertAdjacentHTML('beforeend', `<option value="${i}">${i}kg</option>`);
  }

  el.muscleGroupSelect.value = state.selectedGroup;
  el.exerciseSelect.value = state.selectedExercise;

  if (el.summaryMetricSelect) {
    el.summaryMetricSelect.value = state.selectedSummaryMetric;
  }
}

async function initializeApp() {
  await loadDriveDataOnStartup();

  initSelectors();
  syncRestFromInput();
  renderRootMode();
  await renderTraining();
  renderCalendar();
  renderHistorySummary();

  if (!state.profile || (!state.profile.height && !localStorage.getItem('liftflow-profile'))) {
    openSetupModal();
  }
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  state.rootMode = tab.dataset.tab;
  renderRootMode();
  if (state.rootMode === 'history') {
    renderCalendar();
    renderHistorySummary();
  }
}));

document.querySelectorAll('.segment').forEach(seg => seg.addEventListener('click', () => {
  state.selectedHistoryRange = seg.dataset.range;
  document.querySelectorAll('.segment').forEach(s => s.classList.toggle('active', s.dataset.range === state.selectedHistoryRange));
  renderHistorySummary();
}));

el.calendarMetricSelect.addEventListener('change', e => {
  state.selectedCalendarMetric = e.target.value;
  renderCalendar();
});

if (el.summaryMetricSelect) {
  el.summaryMetricSelect.addEventListener('change', e => {
    state.selectedSummaryMetric = e.target.value;
    renderHistorySummary();
  });
}

el.prevChartBtn.addEventListener('click', () => {
  const aggregated = aggregateSeries(state.selectedHistoryRange);
  if (state.chartOffset + state.chartWindowSize < aggregated.left.length) {
    state.chartOffset += state.chartWindowSize;
    renderHistorySummary();
  }
});

el.nextChartBtn.addEventListener('click', () => {
  state.chartOffset = Math.max(0, state.chartOffset - state.chartWindowSize);
  renderHistorySummary();
});

el.muscleGroupSelect.addEventListener('change', async e => {
  state.selectedGroup = e.target.value;
  renderExerciseOptions();
  el.exerciseSelect.value = state.selectedExercise;
  await renderTraining();
  flashGold(el.suggestionCard);
});

el.exerciseSelect.addEventListener('change', async e => {
  state.selectedExercise = e.target.value;
  await renderTraining();
  flashGold(el.suggestionCard);
});

el.restMin.addEventListener('input', syncRestFromInput);
el.restSec.addEventListener('input', syncRestFromInput);
el.restStart.addEventListener('click', startRestTimer);
el.restReset.addEventListener('click', () => {
  clearInterval(state.restTimer);
  state.restTimer = null;
  syncRestFromInput();
  flashGold(el.timerCard);
});

el.addSetBtn.addEventListener('click', addSetRecord);

el.settingsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSettingsMenu();
});

document.addEventListener('click', (e) => {
  if (!el.settingsMenu.contains(e.target) && e.target !== el.settingsBtn) {
    closeSettingsMenu();
  }
});

el.openSetupBtn.addEventListener('click', () => {
  closeSettingsMenu();
  openSetupModal();
});

el.closeSetupBtn.addEventListener('click', closeSetupModal);

el.driveSyncBtn.addEventListener('click', async () => {
  closeSettingsMenu();
  try {
    const authRes = await window.driveApi.auth();
    if (authRes?.authUrl) {
      window.location.href = authRes.authUrl;
      return;
    }
  } catch (e) {
    console.error(e);
  }
});

el.saveProfileBtn.addEventListener('click', async () => {
  const profile = window.helpers.readProfileFromForm();
  saveProfileLocal(profile);
  try {
    await window.driveApi.saveProfile(profile);
  } catch (e) {
    console.error(e);
  }
  closeSetupModal();
  await refreshAiSuggestions();
});

initializeApp();
