const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const state = {
  selectedGroup: '',
  selectedExercise: '',
  selectedDate: todayStr,
  selectedHistoryDate: todayStr,
  selectedHistoryRange: 'daily',
  selectedHistoryMetric: 'total',
  calendarCursor: {
    year: today.getFullYear(),
    month: today.getMonth()
  },
  chartOffset: 0,
  chartWindowSize: 8,
  isRecordHistoryOpen: false,
  profile: JSON.parse(localStorage.getItem('liftflow-profile') || 'null') || structuredClone(window.DEFAULT_PROFILE),
  setRecords: { ...(window.USE_SAMPLE_DATA ? window.sampleSetRecords : {}), ...JSON.parse(localStorage.getItem('liftflow-set-records') || '{}') },
  restRemaining: 120,
  restEndAt: null,
  restTimer: null,
  rootMode: 'record',
  audioCtx: null
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
  repNumber: document.getElementById('repNumber'),
  weightNumber: document.getElementById('weightNumber'),
  addSetBtn: document.getElementById('addSetBtn'),
  setRecords: document.getElementById('setRecords'),
  recordCard: document.getElementById('recordCard'),
  timerCard: document.getElementById('timerCard'),
  suggestionCard: document.getElementById('suggestionCard'),
  dailyAiText: document.getElementById('dailyAiText'),
  calendarGrid: document.getElementById('calendarGrid'),
  calendarMonthLabel: document.getElementById('calendarMonthLabel'),
  historyMetricSelect: document.getElementById('historyMetricSelect'),
  summaryVolume: document.getElementById('summaryVolume'),
  summaryAvgWeight: document.getElementById('summaryAvgWeight'),
  summaryReps: document.getElementById('summaryReps'),
  summarySets: document.getElementById('summarySets'),
  historyComboCanvas: document.getElementById('historyComboCanvas'),
  trainingTrendCanvas: document.getElementById('trainingTrendCanvas'),
  trainingTrendTitle: document.getElementById('trainingTrendTitle'),
  historyTrendTitle: document.getElementById('historyTrendTitle'),
  openSetupBtn: document.getElementById('openSetupBtn'),
  driveSyncBtn: document.getElementById('driveSyncBtn'),
  setupModal: document.getElementById('setupModal'),
  saveProfileBtn: document.getElementById('saveProfileBtn'),
  closeSetupBtn: document.getElementById('closeSetupBtn'),
  prevChartBtn: document.getElementById('prevChartBtn'),
  nextChartBtn: document.getElementById('nextChartBtn'),
  prevMonthBtn: document.getElementById('prevMonthBtn'),
  nextMonthBtn: document.getElementById('nextMonthBtn'),
  toggleRecordHistoryBtn: document.getElementById('toggleRecordHistoryBtn'),
  recordHistoryPanel: document.getElementById('recordHistoryPanel')
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

function getRecordsForExercise(exerciseName) {
  return Object.keys(state.setRecords)
    .filter(key => key.endsWith(`__${exerciseName}`))
    .flatMap(key => {
      const date = key.split('__')[0];
      return state.setRecords[key].map(r => ({ ...r, exercise: exerciseName, date }));
    });
}

function getRecordsForDateAndMetric(date, metric = 'total') {
  const records = getRecordsForDate(date);
  if (metric === 'total') return records;
  return records.filter(r => r.exercise === metric);
}

function getTotalVolumeForDate(date, metric = 'total') {
  return getRecordsForDateAndMetric(date, metric).reduce((sum, r) => sum + r.reps * r.weight, 0);
}

function getAvgWeightForDate(date, metric = 'total') {
  const records = getRecordsForDateAndMetric(date, metric);
  if (!records.length) return 0;
  return Math.round((records.reduce((sum, r) => sum + r.weight, 0) / records.length) * 10) / 10;
}

function getTotalRepsForDate(date, metric = 'total') {
  return getRecordsForDateAndMetric(date, metric).reduce((sum, r) => sum + r.reps, 0);
}

function getSetCountForDate(date, metric = 'total') {
  return getRecordsForDateAndMetric(date, metric).length;
}

function getAllDatesWithTraining() {
  return [...new Set(Object.keys(state.setRecords).map(k => k.split('__')[0]))].sort();
}

function getWindowedSeries(series, offset = 0, size = 8) {
  const total = series.length;
  const end = Math.max(total - offset, 0);
  const start = Math.max(end - size, 0);
  return series.slice(start, end);
}

function getLastPerformedDate(exerciseName) {
  const dates = Object.keys(state.setRecords)
    .filter(key => key.endsWith(`__${exerciseName}`))
    .map(key => key.split('__')[0])
    .sort();
  return dates.length ? dates[dates.length - 1] : '';
}

function getMetricOptions() {
  return [
    { value: 'total', label: '全種目総重量' },
    ...Object.keys(window.EXERCISES).map(name => ({ value: name, label: name }))
  ];
}

function populateMetricSelect(selectEl, selectedValue) {
  if (!selectEl) return;
  const options = getMetricOptions();
  selectEl.innerHTML = options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
  selectEl.value = selectedValue;
}

function getMetricLabel(metric) {
  return metric === 'total' ? '全種目' : metric;
}

function getRangeWindowDates(anchorDateStr, rangeType) {
  const anchor = new Date(`${anchorDateStr}T00:00:00`);
  let days = 1;
  if (rangeType === 'weekly') days = 7;
  if (rangeType === 'monthly') days = 30;

  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return dates;
}

function getRangeSummary(anchorDateStr, rangeType, metric = 'total') {
  const dates = getRangeWindowDates(anchorDateStr, rangeType);
  const allRecords = dates.flatMap(date => getRecordsForDateAndMetric(date, metric));

  return {
    totalVolume: allRecords.reduce((sum, r) => sum + r.reps * r.weight, 0),
    avgWeight: allRecords.length
      ? Math.round((allRecords.reduce((sum, r) => sum + r.weight, 0) / allRecords.length) * 10) / 10
      : 0,
    totalReps: allRecords.reduce((sum, r) => sum + r.reps, 0),
    setCount: allRecords.length
  };
}

function buildAnchorsBackwards(rangeType) {
  const dates = getAllDatesWithTraining();
  if (!dates.length) return [];

  const latest = new Date(`${state.selectedHistoryDate}T00:00:00`);
  const earliest = new Date(`${dates[0]}T00:00:00`);
  const step = rangeType === 'daily' ? 1 : rangeType === 'weekly' ? 7 : 30;

  const anchors = [];
  const cursor = new Date(latest);

  while (cursor >= earliest) {
    anchors.unshift(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`);
    cursor.setDate(cursor.getDate() - step);
  }

  return anchors;
}

function makeSuggestion(exerciseName) {
  const ex = window.EXERCISES[exerciseName];
  const lastPerformed = getLastPerformedDate(exerciseName) || ex.lastDate || '';
  const days = lastPerformed ? dateDiffDays(state.selectedDate, lastPerformed) : 999;
  const goalSets = 3;
  const goalReps = ['サイドレイズ', 'ダンベルフライ'].includes(exerciseName) ? '10-15' : exerciseName === '懸垂' ? '6-10' : '5-8';
  const text = days < 2
    ? '前回の実施日が近いので、今日は無理に負荷を追わず、フォームの再現性と疲労管理を優先しましょう。'
    : '最近の推移は安定しているので、今日は質を保ちながら少しだけ総仕事量を伸ばす意識がおすすめです。';
  return { goalSets, goalReps, text };
}

function makeRecoverySuggestion() {
  const dates = getAllDatesWithTraining();
  const allRecords = dates.flatMap(date => getRecordsForDate(date));
  const totalVolume = allRecords.reduce((sum, r) => sum + r.reps * r.weight, 0);

  return {
    text: totalVolume > 0
      ? 'これまでの履歴全体を見ると、睡眠・食事・疲労管理を丁寧に整えるのが回復面で重要です。'
      : 'まだ記録が少ないので、まずは無理のない頻度で継続しながら回復習慣を整えていきましょう。'
  };
}

async function refreshAiSuggestions() {
  if (!state.selectedExercise) {
    el.goalSets.textContent = '-';
    el.goalReps.textContent = '-';
    el.aiSuggestionText.textContent = '種目を選択するとAI提案を表示します。';
    el.dailyAiText.textContent = '種目を選択すると回復コメントを表示します。';
    return;
  }

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
  if (!el.exerciseSelect) return;

  el.exerciseSelect.innerHTML = '<option value="">選択してください</option>';

  if (!state.selectedGroup) {
    state.selectedExercise = '';
    return;
  }

  Object.entries(window.EXERCISES)
    .filter(([, v]) => v.group === state.selectedGroup)
    .forEach(([name]) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      el.exerciseSelect.appendChild(opt);
    });

  if (!window.EXERCISES[state.selectedExercise] || window.EXERCISES[state.selectedExercise].group !== state.selectedGroup) {
    state.selectedExercise = '';
  }

  el.exerciseSelect.value = state.selectedExercise;
}

function renderBodyMap() {
  document.querySelectorAll('#frontBody [id], #backBody [id]').forEach(node => {
    if (node.tagName !== 'svg') node.setAttribute('fill', '#1f2937');
  });

  if (!state.selectedExercise || !window.EXERCISES[state.selectedExercise]) return;

  const targets = window.EXERCISES[state.selectedExercise].target || [];
  targets.forEach(id => {
    const node = document.getElementById(id);
    if (node) node.setAttribute('fill', '#d4af37');
  });
}

function renderRecordHistoryToggle() {
  if (!el.toggleRecordHistoryBtn || !el.recordHistoryPanel) return;
  el.recordHistoryPanel.classList.toggle('hidden', !state.isRecordHistoryOpen);
  el.toggleRecordHistoryBtn.textContent = state.isRecordHistoryOpen ? 'Hide Set History' : 'Show Set History';
}

function formatRecordTimestamp(record) {
  if (record.loggedAt) {
    const dt = new Date(record.loggedAt);
    if (!Number.isNaN(dt.getTime())) {
      return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    }
  }
  if (record.date === '2026-04-06') return '2026年4月6日 17:00';
  if (record.date) return `${record.date} -`;
  return '-';
}

function renderSetRecords() {
  if (!state.selectedExercise) {
    el.setRecords.innerHTML = '<div class="sub">種目を選択してください。</div>';
    renderRecordHistoryToggle();
    return;
  }

  const records = (state.setRecords[getSetKey(state.selectedDate, state.selectedExercise)] || [])
    .map((r, index) => ({ ...r, __originalIndex: index, date: state.selectedDate }))
    .sort((a, b) => {
      const aTime = a.loggedAt ? new Date(a.loggedAt).getTime() : 0;
      const bTime = b.loggedAt ? new Date(b.loggedAt).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      return b.__originalIndex - a.__originalIndex;
    })
    .slice(0, 10);

  if (!records.length) {
    el.setRecords.innerHTML = '<div class="sub">まだ記録がありません。</div>';
    renderRecordHistoryToggle();
    return;
  }

  el.setRecords.innerHTML = records.map(r =>
    `<div class="record-item">
      <div>
        <div class="record-main">${r.reps} reps / ${r.weight}kg</div>
        <div class="record-sub">Volume ${r.reps * r.weight} ・ ${formatRecordTimestamp(r)}</div>
      </div>
      <button data-remove="${r.__originalIndex}" style="width:auto;">Delete</button>
    </div>`
  ).join('');

  el.setRecords.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', async () => {
    const arr = state.setRecords[getSetKey(state.selectedDate, state.selectedExercise)] || [];
    arr.splice(Number(btn.dataset.remove), 1);

    if (!arr.length) delete state.setRecords[getSetKey(state.selectedDate, state.selectedExercise)];
    else state.setRecords[getSetKey(state.selectedDate, state.selectedExercise)] = arr;

    saveLocal();
    renderSetRecords();
    renderTrainingTrend();
    renderHistorySummary();
    renderCalendar();
    await saveRecordsEveryTime();
    await refreshAiSuggestions();
  }));

  renderRecordHistoryToggle();
}

async function renderTraining() {
  if (!state.selectedExercise || !window.EXERCISES[state.selectedExercise]) {
    el.exerciseName.textContent = '-';
    el.lastPerformed.textContent = '前回実施: -';
    el.muscleNames.innerHTML = '';
    renderSetRecords();
    renderBodyMap();
    renderTrainingTrend();
    return;
  }

  const ex = window.EXERCISES[state.selectedExercise];
  const lastPerformed = getLastPerformedDate(state.selectedExercise) || ex.lastDate || '';
  el.exerciseName.textContent = state.selectedExercise;
  el.lastPerformed.textContent = lastPerformed ? `前回実施: ${lastPerformed}` : '前回実施: -';
  el.muscleNames.innerHTML = ex.muscles.map(m => `<span class="muscle-pill">${m}</span>`).join('');
  renderSetRecords();
  renderBodyMap();
  renderTrainingTrend();
}

function renderTrainingTrend() {
  if (!state.selectedExercise) {
    el.trainingTrendTitle.textContent = 'Selected Exercise × Avg Weight';
    drawDualChart(el.trainingTrendCanvas, [], []);
    return;
  }

  const exerciseName = state.selectedExercise;
  const exerciseRecords = getRecordsForExercise(exerciseName);
  const dates = [...new Set(exerciseRecords.map(r => r.date))].sort().slice(-6);

  const left = dates.map(d => ({
    label: `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`,
    value: getTotalVolumeForDate(d, exerciseName)
  }));

  const right = dates.map(d => ({
    label: `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`,
    value: getAvgWeightForDate(d, exerciseName)
  }));

  el.trainingTrendTitle.textContent = `${exerciseName} 総重量 × 平均重量`;
  drawDualChart(el.trainingTrendCanvas, left, right);
}

function aggregateSeries(range, metric = 'total') {
  const anchors = buildAnchorsBackwards(range);
  return {
    left: anchors.map(anchor => {
      const summary = getRangeSummary(anchor, range, metric);
      return {
        label: `${anchor.slice(5, 7)}/${anchor.slice(8, 10)}`,
        value: summary.totalVolume
      };
    }),
    right: anchors.map(anchor => {
      const summary = getRangeSummary(anchor, range, metric);
      return {
        label: `${anchor.slice(5, 7)}/${anchor.slice(8, 10)}`,
        value: summary.avgWeight
      };
    })
  };
}

function renderCalendar() {
  const year = state.calendarCursor.year;
  const month = state.calendarCursor.month;

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
    const metric = getTotalVolumeForDate(dateStr, state.selectedHistoryMetric);

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
  const metric = state.selectedHistoryMetric;
  const summary = getRangeSummary(state.selectedHistoryDate, state.selectedHistoryRange, metric);

  el.summaryVolume.textContent = summary.totalVolume || '-';
  el.summaryAvgWeight.textContent = summary.avgWeight || '-';
  el.summaryReps.textContent = summary.totalReps || '-';
  el.summarySets.textContent = summary.setCount || '-';

  const aggregated = aggregateSeries(state.selectedHistoryRange, metric);
  const leftWindow = getWindowedSeries(aggregated.left, state.chartOffset, state.chartWindowSize);
  const rightWindow = getWindowedSeries(aggregated.right, state.chartOffset, state.chartWindowSize);

  el.historyTrendTitle.textContent = `${getMetricLabel(metric)} 総重量 × 平均重量`;
  drawDualChart(el.historyComboCanvas, leftWindow, rightWindow);
}

function renderRootMode() {
  document.querySelectorAll('.tab').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === state.rootMode));
  el.recordRoot.classList.toggle('hidden', state.rootMode !== 'record');
  el.historyRoot.classList.toggle('hidden', state.rootMode !== 'history');
}

function getAudioContext() {
  if (!state.audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) state.audioCtx = new AudioCtx();
  }
  return state.audioCtx;
}

async function primeAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') await ctx.resume();
  } catch (e) {
    console.error(e);
  }
}

function syncRestFromInput() {
  state.restRemaining = Math.max(0, Number(el.restMin.value || 0) * 60 + Number(el.restSec.value || 0));
  renderRest();
}

function updateRestFromTarget() {
  if (!state.restEndAt) return;
  const diff = Math.max(0, Math.ceil((state.restEndAt - Date.now()) / 1000));
  state.restRemaining = diff;
  renderRest();

  if (diff <= 0) {
    clearInterval(state.restTimer);
    state.restTimer = null;
    state.restEndAt = null;
    notifyRestEnd();
  }
}

function renderRest() {
  const m = Math.floor(state.restRemaining / 60);
  const s = state.restRemaining % 60;
  el.restDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

async function notifyRestEnd() {
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') await ctx.resume();

      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.14, start + 0.01);
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

  if (navigator.vibrate) navigator.vibrate([150, 80, 150, 80, 250]);
  flashGold(el.timerCard);
}

async function startRestTimer() {
  await primeAudio();
  clearInterval(state.restTimer);

  if (state.restRemaining <= 0) syncRestFromInput();
  flashGold(el.timerCard);

  state.restEndAt = Date.now() + state.restRemaining * 1000;
  updateRestFromTarget();

  state.restTimer = setInterval(() => {
    updateRestFromTarget();
  }, 250);
}

async function saveRecordsEveryTime() {
  try {
    await window.driveApi.saveRecords(state.setRecords);
  } catch (e) {
    console.error(e);
  }
}

async function addSetRecord() {
  if (!state.selectedExercise) return;
  await primeAudio();

  const key = getSetKey(state.selectedDate, state.selectedExercise);
  const arr = state.setRecords[key] || [];

  arr.push({
    reps: Number(el.repNumber.value),
    weight: Number(el.weightNumber.value),
    loggedAt: new Date().toISOString()
  });

  state.setRecords[key] = arr;

  saveLocal();
  renderSetRecords();
  renderTrainingTrend();
  renderHistorySummary();
  renderCalendar();
  flashGold(el.recordCard);
  syncRestFromInput();
  await startRestTimer();
  await saveRecordsEveryTime();
  await refreshAiSuggestions();
}

function initSelectors() {
  if (!el.muscleGroupSelect) return;

  el.muscleGroupSelect.innerHTML = '<option value="">選択してください</option>';
  window.MUSCLE_GROUPS.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.value;
    opt.textContent = g.label;
    el.muscleGroupSelect.appendChild(opt);
  });

  renderExerciseOptions();

  for (let i = 1; i <= 30; i++) {
    el.repNumber.insertAdjacentHTML('beforeend', `<option value="${i}">${i} reps</option>`);
  }
  for (let i = 0; i <= 220; i += 2.5) {
    el.weightNumber.insertAdjacentHTML('beforeend', `<option value="${i}">${i}kg</option>`);
  }

  el.muscleGroupSelect.value = state.selectedGroup;
  el.exerciseSelect.value = state.selectedExercise;
  populateMetricSelect(el.historyMetricSelect, state.selectedHistoryMetric);
  renderRecordHistoryToggle();
}

async function initializeApp() {
  await loadDriveDataOnStartup();
  initSelectors();
  syncRestFromInput();
  renderRootMode();
  await renderTraining();
  await refreshAiSuggestions();
  renderCalendar();
  renderHistorySummary();

  if (!state.profile || (!state.profile.height && !localStorage.getItem('liftflow-profile'))) {
    openSetupModal();
  }
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', async () => {
  await primeAudio();
  state.rootMode = tab.dataset.tab;
  renderRootMode();
  if (state.rootMode === 'history') {
    renderCalendar();
    renderHistorySummary();
  }
}));

document.querySelectorAll('.segment').forEach(seg => seg.addEventListener('click', () => {
  state.selectedHistoryRange = seg.dataset.range;
  state.chartOffset = 0;
  document.querySelectorAll('.segment').forEach(s => s.classList.toggle('active', s.dataset.range === state.selectedHistoryRange));
  renderHistorySummary();
}));

if (el.historyMetricSelect) {
  el.historyMetricSelect.addEventListener('change', e => {
    state.selectedHistoryMetric = e.target.value;
    state.chartOffset = 0;
    renderCalendar();
    renderHistorySummary();
  });
}

if (el.prevMonthBtn && el.nextMonthBtn) {
  el.prevMonthBtn.addEventListener('click', () => {
    state.calendarCursor.month -= 1;
    if (state.calendarCursor.month < 0) {
      state.calendarCursor.month = 11;
      state.calendarCursor.year -= 1;
    }
    renderCalendar();
  });

  el.nextMonthBtn.addEventListener('click', () => {
    state.calendarCursor.month += 1;
    if (state.calendarCursor.month > 11) {
      state.calendarCursor.month = 0;
      state.calendarCursor.year += 1;
    }
    renderCalendar();
  });
}

if (el.prevChartBtn && el.nextChartBtn) {
  el.prevChartBtn.addEventListener('click', () => {
    const aggregated = aggregateSeries(state.selectedHistoryRange, state.selectedHistoryMetric);
    if (state.chartOffset + state.chartWindowSize < aggregated.left.length) {
      state.chartOffset += state.chartWindowSize;
      renderHistorySummary();
    }
  });

  el.nextChartBtn.addEventListener('click', () => {
    state.chartOffset = Math.max(0, state.chartOffset - state.chartWindowSize);
    renderHistorySummary();
  });
}

if (el.toggleRecordHistoryBtn) {
  el.toggleRecordHistoryBtn.addEventListener('click', () => {
    state.isRecordHistoryOpen = !state.isRecordHistoryOpen;
    renderRecordHistoryToggle();
  });
}

if (el.muscleGroupSelect) {
  el.muscleGroupSelect.addEventListener('change', async e => {
    await primeAudio();
    state.selectedGroup = e.target.value;
    state.selectedExercise = '';
    renderExerciseOptions();
    await renderTraining();
    await refreshAiSuggestions();
    flashGold(el.suggestionCard);
  });
}

if (el.exerciseSelect) {
  el.exerciseSelect.addEventListener('change', async e => {
    await primeAudio();
    state.selectedExercise = e.target.value;
    await renderTraining();
    await refreshAiSuggestions();
    flashGold(el.suggestionCard);
  });
}

el.restMin.addEventListener('input', syncRestFromInput);
el.restSec.addEventListener('input', syncRestFromInput);
el.restStart.addEventListener('click', startRestTimer);
el.restReset.addEventListener('click', async () => {
  await primeAudio();
  clearInterval(state.restTimer);
  state.restTimer = null;
  state.restEndAt = null;
  syncRestFromInput();
  flashGold(el.timerCard);
});

el.addSetBtn.addEventListener('click', addSetRecord);

el.openSetupBtn.addEventListener('click', () => {
  openSetupModal();
});

el.closeSetupBtn.addEventListener('click', closeSetupModal);

el.driveSyncBtn.addEventListener('click', async () => {
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

document.addEventListener('visibilitychange', () => {
  if (state.restEndAt) updateRestFromTarget();
});

window.addEventListener('focus', () => {
  if (state.restEndAt) updateRestFromTarget();
});

['touchstart', 'click', 'keydown'].forEach(evt => {
  window.addEventListener(evt, () => {
    primeAudio();
  }, { passive: true });
});

initializeApp();
