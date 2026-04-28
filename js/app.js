const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const state = {
  mainTab: 'training',
  trainingSubTab: 'workout',
  recoverySubTab: 'sleeping',

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

  selectedSleepArchiveDate: todayStr,
  sleepCalendarCursor: {
    year: today.getFullYear(),
    month: today.getMonth()
  },

  isRecordHistoryOpen: false,
  isSleepHistoryOpen: false,

  profile: JSON.parse(localStorage.getItem('liftflow-profile') || 'null') || structuredClone(window.DEFAULT_PROFILE),
  setRecords: { ...(window.USE_SAMPLE_DATA ? window.sampleSetRecords : {}), ...JSON.parse(localStorage.getItem('liftflow-set-records') || '{}') },
  sleepRecords: JSON.parse(localStorage.getItem('liftflow-sleep-records') || '[]'),

  morningMemo: localStorage.getItem('liftflow-morning-memo') || '',

  restRemaining: 120,
  restEndAt: null,
  restTimer: null,
  audioCtx: null
};

const el = {
  trainingSubTabs: document.getElementById('trainingSubTabs'),
  recoverySubTabs: document.getElementById('recoverySubTabs'),

  workoutRoot: document.getElementById('workoutRoot'),
  trainingArchiveRoot: document.getElementById('trainingArchiveRoot'),
  sleepingRoot: document.getElementById('sleepingRoot'),
  recoveryArchiveRoot: document.getElementById('recoveryArchiveRoot'),
  tipsRoot: document.getElementById('tipsRoot'),

  muscleGroupSelect: document.getElementById('muscleGroupSelect'),
  exerciseSelect: document.getElementById('exerciseSelect'),
  exerciseName: document.getElementById('exerciseName'),
  lastPerformed: document.getElementById('lastPerformed'),
  goalSets: document.getElementById('goalSets'),
  goalReps: document.getElementById('goalReps'),
  muscleNames: document.getElementById('muscleNames'),
  planAiCommentBtn: document.getElementById('planAiCommentBtn'),
  planAiText: document.getElementById('planAiText'),

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
  trainingTrendCanvas: document.getElementById('trainingTrendCanvas'),
  trainingTrendTitle: document.getElementById('trainingTrendTitle'),
  toggleRecordHistoryBtn: document.getElementById('toggleRecordHistoryBtn'),
  recordHistoryPanel: document.getElementById('recordHistoryPanel'),

  calendarGrid: document.getElementById('calendarGrid'),
  calendarMonthLabel: document.getElementById('calendarMonthLabel'),
  historyMetricSelect: document.getElementById('historyMetricSelect'),
  summaryVolume: document.getElementById('summaryVolume'),
  summaryAvgWeight: document.getElementById('summaryAvgWeight'),
  summaryReps: document.getElementById('summaryReps'),
  summarySets: document.getElementById('summarySets'),
  historyComboCanvas: document.getElementById('historyComboCanvas'),
  historyTrendTitle: document.getElementById('historyTrendTitle'),
  prevMonthBtn: document.getElementById('prevMonthBtn'),
  nextMonthBtn: document.getElementById('nextMonthBtn'),
  prevChartBtn: document.getElementById('prevChartBtn'),
  nextChartBtn: document.getElementById('nextChartBtn'),

  sleepStartBtn: document.getElementById('sleepStartBtn'),
  sleepWakeBtn: document.getElementById('sleepWakeBtn'),
  sleepStatusText: document.getElementById('sleepStatusText'),
  manualSleepAt: document.getElementById('manualSleepAt'),
  manualWakeAt: document.getElementById('manualWakeAt'),
  manualSleepSaveBtn: document.getElementById('manualSleepSaveBtn'),
  sleepAiCommentBtn: document.getElementById('sleepAiCommentBtn'),
  sleepAiText: document.getElementById('sleepAiText'),
  morningMemo: document.getElementById('morningMemo'),
  sleepRecentList: document.getElementById('sleepRecentList'),
  toggleSleepHistoryBtn: document.getElementById('toggleSleepHistoryBtn'),
  sleepHistoryPanel: document.getElementById('sleepHistoryPanel'),

  sleepCalendarGrid: document.getElementById('sleepCalendarGrid'),
  sleepCalendarMonthLabel: document.getElementById('sleepCalendarMonthLabel'),
  prevSleepMonthBtn: document.getElementById('prevSleepMonthBtn'),
  nextSleepMonthBtn: document.getElementById('nextSleepMonthBtn'),
  sleepDetailSleepAt: document.getElementById('sleepDetailSleepAt'),
  sleepDetailWakeAt: document.getElementById('sleepDetailWakeAt'),
  sleepDetailDuration: document.getElementById('sleepDetailDuration'),
  sleepArchiveEditToggleBtn: document.getElementById('sleepArchiveEditToggleBtn'),
  sleepArchiveEditPanel: document.getElementById('sleepArchiveEditPanel'),
  archiveEditSleepAt: document.getElementById('archiveEditSleepAt'),
  archiveEditWakeAt: document.getElementById('archiveEditWakeAt'),
  archiveSleepSaveBtn: document.getElementById('archiveSleepSaveBtn'),
  archiveSleepDeleteBtn: document.getElementById('archiveSleepDeleteBtn'),
  sleepDurationCanvas: document.getElementById('sleepDurationCanvas'),
  sleepTimingCanvas: document.getElementById('sleepTimingCanvas'),

  tipsList: document.getElementById('tipsList'),

  openSetupBtn: document.getElementById('openSetupBtn'),
  driveSyncBtn: document.getElementById('driveSyncBtn'),
  setupModal: document.getElementById('setupModal'),
  saveProfileBtn: document.getElementById('saveProfileBtn'),
  closeSetupBtn: document.getElementById('closeSetupBtn')
};

const {
  getSetKey,
  dateDiffDays,
  flashGold,
  drawDualChart,
  drawSleepDurationChart,
  drawSleepTimingChart,
  formatDateLabel,
  formatDurationMinutes,
  formatLocalDateTime,
  toDatetimeLocalValue,
  sleepAxisValueFromIso
} = window.helpers;

function saveLocal() {
  localStorage.setItem('liftflow-set-records', JSON.stringify(state.setRecords));
}

function saveSleepLocal() {
  localStorage.setItem('liftflow-sleep-records', JSON.stringify(state.sleepRecords));
}

function saveMorningMemoLocal() {
  localStorage.setItem('liftflow-morning-memo', state.morningMemo);
}

function saveProfileLocal(profile) {
  state.profile = profile;
  localStorage.setItem('liftflow-profile', JSON.stringify(profile));
}

function getDateStringFromIso(iso) {
  const dt = new Date(iso);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function calcDurationMinutes(sleepAt, wakeAt) {
  const s = new Date(sleepAt).getTime();
  const w = new Date(wakeAt).getTime();
  return Math.max(0, Math.round((w - s) / 60000));
}

function buildSleepRecord({ id, sleepAt, wakeAt, source }) {
  return {
    id: id || `sleep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sleepAt,
    wakeAt,
    durationMinutes: wakeAt ? calcDurationMinutes(sleepAt, wakeAt) : null,
    wakeDate: wakeAt ? getDateStringFromIso(wakeAt) : null,
    source: source || 'manual'
  };
}

function normalizeSleepRecords(records) {
  if (!Array.isArray(records)) return [];
  return records
    .map((r, idx) => ({
      id: r.id || `sleep_${idx}_${Date.now()}`,
      sleepAt: r.sleepAt || null,
      wakeAt: r.wakeAt || null,
      durationMinutes: r.durationMinutes ?? (r.sleepAt && r.wakeAt ? calcDurationMinutes(r.sleepAt, r.wakeAt) : null),
      wakeDate: r.wakeDate || (r.wakeAt ? getDateStringFromIso(r.wakeAt) : null),
      source: r.source || 'manual'
    }))
    .filter(r => r.sleepAt);
}

function mergeSleepRecords(localRecords = [], driveRecords = []) {
  const map = new Map();

  [...driveRecords, ...localRecords].forEach(record => {
    if (!record || !record.id) return;

    const existing = map.get(record.id);

    if (!existing) {
      map.set(record.id, record);
      return;
    }

    const existingWake = existing.wakeAt ? new Date(existing.wakeAt).getTime() : 0;
    const nextWake = record.wakeAt ? new Date(record.wakeAt).getTime() : 0;

    if (!existing.wakeAt && record.wakeAt) {
      map.set(record.id, record);
      return;
    }

    if (nextWake > existingWake) {
      map.set(record.id, record);
      return;
    }

    if ((record.durationMinutes || 0) > (existing.durationMinutes || 0)) {
      map.set(record.id, record);
    }
  });

  return [...map.values()].sort((a, b) => {
    const aTime = new Date(a.wakeAt || a.sleepAt || 0).getTime();
    const bTime = new Date(b.wakeAt || b.sleepAt || 0).getTime();
    return aTime - bTime;
  });
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

  try {
    const sleepingRes = await window.driveApi.loadSleeping();
    const driveSleeping = normalizeSleepRecords(sleepingRes?.sleeping || []);
    const localSleeping = normalizeSleepRecords(
      JSON.parse(localStorage.getItem('liftflow-sleep-records') || '[]')
    );

    state.sleepRecords = mergeSleepRecords(localSleeping, driveSleeping);
    saveSleepLocal();
  } catch (e) {
    console.error('Drive sleeping load failed:', e);
  }
}

function openSetupModal() {
  el.setupModal.classList.remove('hidden');
  window.helpers.writeProfileToForm(state.profile);
}

function closeSetupModal() {
  el.setupModal.classList.add('hidden');
}

function getOpenSleepRecord() {
  const openRecords = state.sleepRecords
    .filter(r => r.sleepAt && !r.wakeAt)
    .sort((a, b) => new Date(b.sleepAt) - new Date(a.sleepAt));
  return openRecords[0] || null;
}

function getPrimarySleepRecordForDate(dateStr) {
  const records = state.sleepRecords.filter(r => r.wakeDate === dateStr && r.sleepAt && r.wakeAt);
  if (!records.length) return null;
  return [...records].sort((a, b) => {
    const durDiff = (b.durationMinutes || 0) - (a.durationMinutes || 0);
    if (durDiff !== 0) return durDiff;
    return new Date(b.wakeAt) - new Date(a.wakeAt);
  })[0];
}

function getSleepHoursForDate(dateStr) {
  const rec = getPrimarySleepRecordForDate(dateStr);
  if (!rec?.durationMinutes) return 0;
  return Math.round((rec.durationMinutes / 60) * 10) / 10;
}

function getRecordsForDate(date) {
  return Object.keys(state.setRecords)
    .filter(key => key.startsWith(`${date}__`))
    .flatMap(key => {
      const exercise = key.split('__')[1];
      return state.setRecords[key].map(r => ({ ...r, exercise }));
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
  const latest = new Date(`${state.selectedHistoryDate}T00:00:00`);
  const step = rangeType === 'daily' ? 1 : rangeType === 'weekly' ? 7 : 30;
  const pointCount = 5;
  const anchors = [];

  for (let i = pointCount - 1; i >= 0; i--) {
    const d = new Date(latest);
    d.setDate(latest.getDate() - step * i);
    anchors.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }

  return anchors;
}

function makeSuggestion(exerciseName) {
  const ex = window.EXERCISES[exerciseName];
  const lastPerformed = getLastPerformedDate(exerciseName) || ex.lastDate || '';
  const days = lastPerformed ? dateDiffDays(state.selectedDate, lastPerformed) : 999;
  const goalSets = 3;
  const goalReps = ['サイドレイズ', 'ダンベルフライ'].includes(exerciseName) ? '10-15' : exerciseName === '懸垂' ? '6-10' : '5-8';
  return { goalSets, goalReps, days };
}

function makePlanCommentFallback(exerciseName) {
  if (!exerciseName) return '種目を選択してください。';
  const suggestion = makeSuggestion(exerciseName);
  if (suggestion.days <= 1) {
    return '直近で同部位の刺激が入っている可能性があります。今日は可動域とフォームの安定を優先し、無理な重量更新は避けてください。';
  }
  if (suggestion.goalReps === '10-15') {
    return '反動を抑えて対象筋に乗せ続けることを優先してください。トップで丁寧に止め、負荷が逃げないフォームを意識すると質が上がります。';
  }
  return 'メインセットではフォームを崩さず、狙ったレップ帯を確実に取り切ることを優先してください。最後まで出力を揃える意識が重要です。';
}

function makeRecoverySuggestion() {
  const dates = getAllDatesWithTraining();
  const allRecords = dates.flatMap(date => getRecordsForDate(date));
  const totalVolume = allRecords.reduce((sum, r) => sum + r.reps * r.weight, 0);
  const latestSleep = getPrimarySleepRecordForDate(state.selectedSleepArchiveDate) || getPrimarySleepRecordForDate(todayStr);

  if (latestSleep?.durationMinutes >= 420) {
    return { text: '睡眠は十分確保できています。今日は疲労感と筋肉痛の程度を見ながら回復を優先してください。' };
  }
  if (totalVolume > 0) {
    return { text: '直近のトレーニング量に対して睡眠がやや不足気味です。今日は入眠を早め、水分と食事を丁寧に整えましょう。' };
  }
  return { text: '睡眠と生活リズムを安定させることが回復の土台になります。起床時刻を一定に保つのがおすすめです。' };
}

async function fetchPlanAiComment() {
  if (!state.selectedExercise) {
    el.planAiText.textContent = '種目を選択してください。';
    return;
  }

  const payload = {
    profile: state.profile,
    selectedExercise: state.selectedExercise,
    selectedDate: state.selectedDate,
    records: state.setRecords,
    sleepRecords: state.sleepRecords,
    variationSeed: Date.now()
  };

  el.planAiText.textContent = '生成中...';

  try {
    const training = await window.aiApi.getTrainingPlan(payload);
    if (training.goalSets != null) el.goalSets.textContent = training.goalSets;
    if (training.goalReps != null) el.goalReps.textContent = training.goalReps;
    el.planAiText.textContent = training.text || makePlanCommentFallback(state.selectedExercise);
  } catch (e) {
    console.error(e);
    el.planAiText.textContent = makePlanCommentFallback(state.selectedExercise);
  }
}

async function fetchSleepingAiComment() {
  const payload = {
    profile: state.profile,
    selectedExercise: state.selectedExercise,
    selectedDate: state.selectedDate,
    selectedWakeDate: state.selectedSleepArchiveDate,
    records: state.setRecords,
    sleepRecords: state.sleepRecords,
    variationSeed: Date.now()
  };

  el.sleepAiText.textContent = '生成中...';

  try {
    const recovery = await window.aiApi.getRecoveryPlan(payload);
    el.sleepAiText.textContent = recovery.text ?? '';
  } catch (_) {
    const fallback = makeRecoverySuggestion();
    el.sleepAiText.textContent = fallback.text;
  }
}

function renderExerciseOptions() {
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
  el.recordHistoryPanel.classList.toggle('hidden', !state.isRecordHistoryOpen);
  el.toggleRecordHistoryBtn.textContent = state.isRecordHistoryOpen ? 'Hide Set History' : 'Show Set History';
}

function renderSleepHistoryToggle() {
  el.sleepHistoryPanel.classList.toggle('hidden', !state.isSleepHistoryOpen);
  el.toggleSleepHistoryBtn.textContent = state.isSleepHistoryOpen ? 'Hide Sleep History' : 'Show Sleep History';
}

function formatRecordTimestamp(record) {
  if (record.loggedAt) return formatLocalDateTime(record.loggedAt);
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
  }));

  renderRecordHistoryToggle();
}

async function renderWorkout() {
  if (!state.selectedExercise || !window.EXERCISES[state.selectedExercise]) {
    el.exerciseName.textContent = '-';
    el.lastPerformed.textContent = '前回実施: -';
    el.muscleNames.innerHTML = '';
    el.goalSets.textContent = '-';
    el.goalReps.textContent = '-';
    el.planAiText.textContent = '';
    renderSetRecords();
    renderBodyMap();
    renderTrainingTrend();
    return;
  }

  const ex = window.EXERCISES[state.selectedExercise];
  const lastPerformed = getLastPerformedDate(state.selectedExercise) || ex.lastDate || '';
  const suggestion = makeSuggestion(state.selectedExercise);

  el.exerciseName.textContent = state.selectedExercise;
  el.lastPerformed.textContent = lastPerformed ? `前回実施: ${lastPerformed}` : '前回実施: -';
  el.muscleNames.innerHTML = ex.muscles.map(m => `<span class="muscle-pill">${m}</span>`).join('');
  el.goalSets.textContent = suggestion.goalSets;
  el.goalReps.textContent = suggestion.goalReps;
  el.planAiText.textContent = '';

  renderSetRecords();
  renderBodyMap();
  renderTrainingTrend();
}

function renderTrainingTrend() {
  if (!state.selectedExercise) {
    el.trainingTrendTitle.textContent = 'Selected Exercise';
    drawDualChart(el.trainingTrendCanvas, [], []);
    return;
  }

  const dates = [];
  const anchor = new Date(`${state.selectedDate}T00:00:00`);
  for (let i = 4; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }

  const left = dates.map(d => ({
    label: formatDateLabel(d),
    value: getTotalVolumeForDate(d, state.selectedExercise)
  }));

  const right = dates.map(d => ({
    label: formatDateLabel(d),
    value: getAvgWeightForDate(d, state.selectedExercise)
  }));

  el.trainingTrendTitle.textContent = state.selectedExercise;
  drawDualChart(el.trainingTrendCanvas, left, right);
}

function aggregateSeries(range, metric = 'total') {
  const anchors = buildAnchorsBackwards(range);
  return {
    left: anchors.map(anchor => {
      const summary = getRangeSummary(anchor, range, metric);
      return {
        label: formatDateLabel(anchor),
        value: summary.totalVolume
      };
    }),
    right: anchors.map(anchor => {
      const summary = getRangeSummary(anchor, range, metric);
      return {
        label: formatDateLabel(anchor),
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

  el.historyTrendTitle.textContent = `${getMetricLabel(metric)}`;
  drawDualChart(el.historyComboCanvas, leftWindow, rightWindow);
}

function renderSleepStatus() {
  const open = getOpenSleepRecord();
  if (!open) {
    el.sleepStatusText.textContent = '未記録';
    return;
  }
  el.sleepStatusText.textContent = `記録中: ${formatLocalDateTime(open.sleepAt)} から睡眠開始`;
}

function renderSleepRecentList() {
  const records = [...state.sleepRecords]
    .sort((a, b) => {
      const aTime = new Date(a.wakeAt || a.sleepAt || 0).getTime();
      const bTime = new Date(b.wakeAt || b.sleepAt || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 10);

  if (!records.length) {
    el.sleepRecentList.innerHTML = '<div class="sub">まだ睡眠記録がありません。</div>';
    renderSleepHistoryToggle();
    return;
  }

  el.sleepRecentList.innerHTML = records.map(r => `
    <div class="sleep-item">
      <div style="flex:1;">
        <div class="sleep-main">${formatDurationMinutes(r.durationMinutes)}</div>
        <div class="sleep-sub">入眠 ${formatLocalDateTime(r.sleepAt)} / 起床 ${formatLocalDateTime(r.wakeAt)}</div>
      </div>
      <div class="sleep-actions">
        <button class="mini-btn" data-sleep-edit="${r.id}" type="button">Edit</button>
        <button class="mini-btn" data-sleep-delete="${r.id}" type="button">Delete</button>
      </div>
    </div>
    <div id="sleep-edit-panel-${r.id}" class="sleep-edit-panel hidden">
      <div>
        <label>入眠日時</label>
        <input type="datetime-local" id="sleep-edit-sleepAt-${r.id}" value="${toDatetimeLocalValue(r.sleepAt)}" />
      </div>
      <div>
        <label>起床日時</label>
        <input type="datetime-local" id="sleep-edit-wakeAt-${r.id}" value="${toDatetimeLocalValue(r.wakeAt)}" />
      </div>
      <button class="primary" data-sleep-save="${r.id}" type="button">Save</button>
    </div>
  `).join('');

  el.sleepRecentList.querySelectorAll('[data-sleep-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(`sleep-edit-panel-${btn.dataset.sleepEdit}`);
      panel.classList.toggle('hidden');
    });
  });

  el.sleepRecentList.querySelectorAll('[data-sleep-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      state.sleepRecords = state.sleepRecords.filter(r => r.id !== btn.dataset.sleepDelete);
      saveSleepLocal();
      renderSleepStatus();
      renderSleepRecentList();
      renderSleepArchiveCalendar();
      renderSleepArchiveDetail();
      renderSleepArchiveCharts();
      await saveSleepEveryTime();
    });
  });

  el.sleepRecentList.querySelectorAll('[data-sleep-save]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.sleepSave;
      const sleepAtValue = document.getElementById(`sleep-edit-sleepAt-${id}`).value;
      const wakeAtValue = document.getElementById(`sleep-edit-wakeAt-${id}`).value;

      if (!sleepAtValue || !wakeAtValue) return;

      const sleepAt = new Date(sleepAtValue).toISOString();
      const wakeAt = new Date(wakeAtValue).toISOString();
      if (new Date(wakeAt) <= new Date(sleepAt)) return;

      state.sleepRecords = state.sleepRecords.map(r =>
        r.id === id ? buildSleepRecord({ ...r, sleepAt, wakeAt, source: r.source }) : r
      );

      saveSleepLocal();
      renderSleepStatus();
      renderSleepRecentList();
      renderSleepArchiveCalendar();
      renderSleepArchiveDetail();
      renderSleepArchiveCharts();
      await saveSleepEveryTime();
    });
  });

  renderSleepHistoryToggle();
}

function renderSleepArchiveCalendar() {
  const year = state.sleepCalendarCursor.year;
  const month = state.sleepCalendarCursor.month;
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  el.sleepCalendarMonthLabel.textContent = `${year}年${month + 1}月`;
  el.sleepCalendarGrid.innerHTML = '';

  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => {
    const node = document.createElement('div');
    node.className = 'dow';
    node.textContent = d;
    el.sleepCalendarGrid.appendChild(node);
  });

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'day empty';
    el.sleepCalendarGrid.appendChild(blank);
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hours = getSleepHoursForDate(dateStr);
    const btn = document.createElement('button');

    btn.className = 'day';
    if (hours > 0) btn.classList.add('partial');
    if (dateStr === state.selectedSleepArchiveDate) btn.classList.add('active');

    btn.innerHTML = `<div class="day-num">${d}</div><div class="day-metric">${hours > 0 ? `${hours}h` : '-'}</div>`;
    btn.addEventListener('click', () => {
      state.selectedSleepArchiveDate = dateStr;
      renderSleepArchiveCalendar();
      renderSleepArchiveDetail();
      renderSleepArchiveCharts();
    });

    el.sleepCalendarGrid.appendChild(btn);
  }
}

function renderSleepArchiveDetail() {
  const rec = getPrimarySleepRecordForDate(state.selectedSleepArchiveDate);
  if (!rec) {
    el.sleepDetailSleepAt.textContent = '-';
    el.sleepDetailWakeAt.textContent = '-';
    el.sleepDetailDuration.textContent = '-';
    el.sleepArchiveEditPanel.classList.add('hidden');
    el.archiveEditSleepAt.value = '';
    el.archiveEditWakeAt.value = '';
    return;
  }

  el.sleepDetailSleepAt.textContent = formatLocalDateTime(rec.sleepAt);
  el.sleepDetailWakeAt.textContent = formatLocalDateTime(rec.wakeAt);
  el.sleepDetailDuration.textContent = formatDurationMinutes(rec.durationMinutes);

  el.archiveEditSleepAt.value = toDatetimeLocalValue(rec.sleepAt);
  el.archiveEditWakeAt.value = toDatetimeLocalValue(rec.wakeAt);
}

function renderSleepArchiveCharts() {
  const dates = [];
  const anchor = new Date(`${state.selectedSleepArchiveDate}T00:00:00`);
  for (let i = 4; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }

  const durationSeries = dates.map(dateStr => ({
    label: formatDateLabel(dateStr),
    value: getSleepHoursForDate(dateStr)
  }));

  const sleepSeries = dates.map(dateStr => {
    const rec = getPrimarySleepRecordForDate(dateStr);
    return {
      label: formatDateLabel(dateStr),
      value: rec ? sleepAxisValueFromIso(rec.sleepAt, true) : null
    };
  });

  const wakeSeries = dates.map(dateStr => {
    const rec = getPrimarySleepRecordForDate(dateStr);
    return {
      label: formatDateLabel(dateStr),
      value: rec ? sleepAxisValueFromIso(rec.wakeAt, false) : null
    };
  });

  drawSleepDurationChart(el.sleepDurationCanvas, durationSeries);
  drawSleepTimingChart(el.sleepTimingCanvas, sleepSeries, wakeSeries);
}

function renderTips() {
  if (!el.tipsList) return;

  const rawTips = window.TIPS_DATA;
  const tips = Array.isArray(rawTips) ? rawTips : [];

  if (!tips.length) {
    el.tipsList.innerHTML = `
      <div class="tip-card">
        <div class="tip-title">Tips が読み込まれていません</div>
        <div class="tip-claim">
          js/constants.js の <code>window.TIPS_DATA</code> を確認してください。
        </div>
      </div>
    `;
    return;
  }

  el.tipsList.innerHTML = tips.map((tip, index) => `
    <div class="tip-card">
      <div class="tip-category">${tip.category || `未分類 ${index + 1}`}</div>
      <div class="tip-title">${tip.title || 'タイトル未設定'}</div>
      <div class="tip-claim">${tip.claim || '主張未設定'}</div>
      <div class="tip-source">${tip.source || '出典未設定'}</div>
      <div class="tip-body">
        <div><strong>実験:</strong> ${tip.method || '未設定'}</div>
        <div><strong>結果:</strong> ${tip.result || '未設定'}</div>
      </div>
    </div>
  `).join('');
}

function renderMainTabs() {
  document.querySelectorAll('[data-main-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mainTab === state.mainTab);
  });

  el.trainingSubTabs.classList.toggle('hidden', state.mainTab !== 'training');
  el.recoverySubTabs.classList.toggle('hidden', state.mainTab !== 'recovery');

  el.workoutRoot.classList.add('hidden');
  el.trainingArchiveRoot.classList.add('hidden');
  el.sleepingRoot.classList.add('hidden');
  el.recoveryArchiveRoot.classList.add('hidden');
  el.tipsRoot.classList.add('hidden');

  if (state.mainTab === 'training') {
    if (state.trainingSubTab === 'workout') el.workoutRoot.classList.remove('hidden');
    if (state.trainingSubTab === 'archive') el.trainingArchiveRoot.classList.remove('hidden');
  } else if (state.mainTab === 'recovery') {
    if (state.recoverySubTab === 'sleeping') el.sleepingRoot.classList.remove('hidden');
    if (state.recoverySubTab === 'archive') el.recoveryArchiveRoot.classList.remove('hidden');
  } else if (state.mainTab === 'tips') {
    el.tipsRoot.classList.remove('hidden');
  }

  document.querySelectorAll('[data-training-subtab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.trainingSubtab === state.trainingSubTab);
  });

  document.querySelectorAll('[data-recovery-subtab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.recoverySubtab === state.recoverySubTab);
  });
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

async function saveSleepEveryTime() {
  try {
    const latest = await window.driveApi.loadSleeping();
    const driveSleeping = normalizeSleepRecords(latest?.sleeping || []);

    state.sleepRecords = mergeSleepRecords(state.sleepRecords, driveSleeping);
    saveSleepLocal();

    await window.driveApi.saveSleeping(state.sleepRecords);
  } catch (e) {
    console.error('Drive sleeping save failed:', e);
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
}

async function handleSleepStart() {
  const open = getOpenSleepRecord();
  if (open) {
    el.sleepStatusText.textContent = '未完了の入眠記録があります。先に起床を記録してください。';
    return;
  }

  const rec = buildSleepRecord({
    sleepAt: new Date().toISOString(),
    wakeAt: null,
    source: 'timestamp'
  });

  state.sleepRecords.push(rec);
  saveSleepLocal();
  renderSleepStatus();
  renderSleepRecentList();
  await saveSleepEveryTime();
}

async function handleSleepWake() {
  const open = getOpenSleepRecord();
  if (!open) {
    el.sleepStatusText.textContent = '先に入眠を記録してください。';
    return;
  }

  const wakeAt = new Date().toISOString();
  if (new Date(wakeAt) <= new Date(open.sleepAt)) return;

  state.sleepRecords = state.sleepRecords.map(r =>
    r.id === open.id ? buildSleepRecord({ ...r, wakeAt, source: r.source }) : r
  );

  saveSleepLocal();
  renderSleepStatus();
  renderSleepRecentList();
  renderSleepArchiveCalendar();
  renderSleepArchiveDetail();
  renderSleepArchiveCharts();
  await saveSleepEveryTime();
}

async function handleManualSleepSave() {
  const sleepAtVal = el.manualSleepAt.value;
  const wakeAtVal = el.manualWakeAt.value;
  if (!sleepAtVal || !wakeAtVal) return;

  const sleepAt = new Date(sleepAtVal).toISOString();
  const wakeAt = new Date(wakeAtVal).toISOString();
  if (new Date(wakeAt) <= new Date(sleepAt)) return;

  state.sleepRecords.push(buildSleepRecord({
    sleepAt,
    wakeAt,
    source: 'manual'
  }));

  el.manualSleepAt.value = '';
  el.manualWakeAt.value = '';

  saveSleepLocal();
  renderSleepStatus();
  renderSleepRecentList();
  renderSleepArchiveCalendar();
  renderSleepArchiveDetail();
  renderSleepArchiveCharts();
  await saveSleepEveryTime();
}

async function saveArchiveSleepEdit() {
  const rec = getPrimarySleepRecordForDate(state.selectedSleepArchiveDate);
  if (!rec) return;

  const sleepAtVal = el.archiveEditSleepAt.value;
  const wakeAtVal = el.archiveEditWakeAt.value;
  if (!sleepAtVal || !wakeAtVal) return;

  const sleepAt = new Date(sleepAtVal).toISOString();
  const wakeAt = new Date(wakeAtVal).toISOString();
  if (new Date(wakeAt) <= new Date(sleepAt)) return;

  state.sleepRecords = state.sleepRecords.map(r =>
    r.id === rec.id ? buildSleepRecord({ ...r, sleepAt, wakeAt, source: r.source }) : r
  );

  saveSleepLocal();
  renderSleepRecentList();
  renderSleepArchiveCalendar();
  renderSleepArchiveDetail();
  renderSleepArchiveCharts();
  await saveSleepEveryTime();
}

async function deleteArchiveSleepRecord() {
  const rec = getPrimarySleepRecordForDate(state.selectedSleepArchiveDate);
  if (!rec) return;

  state.sleepRecords = state.sleepRecords.filter(r => r.id !== rec.id);
  saveSleepLocal();
  renderSleepRecentList();
  renderSleepArchiveCalendar();
  renderSleepArchiveDetail();
  renderSleepArchiveCharts();
  await saveSleepEveryTime();
}

function initSelectors() {
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

  populateMetricSelect(el.historyMetricSelect, state.selectedHistoryMetric);
  el.morningMemo.value = state.morningMemo;
  renderRecordHistoryToggle();
  renderSleepHistoryToggle();
}

async function initializeApp() {
  state.sleepRecords = normalizeSleepRecords(state.sleepRecords);
  await loadDriveDataOnStartup();
  initSelectors();
  syncRestFromInput();
  renderMainTabs();
  await renderWorkout();
  renderCalendar();
  renderHistorySummary();
  renderSleepStatus();
  renderSleepRecentList();
  renderSleepArchiveCalendar();
  renderSleepArchiveDetail();
  renderSleepArchiveCharts();
  renderTips();

  if (!state.profile || (!state.profile.height && !localStorage.getItem('liftflow-profile'))) {
    openSetupModal();
  }
}

document.querySelectorAll('[data-main-tab]').forEach(tab => {
  tab.addEventListener('click', () => {
    state.mainTab = tab.dataset.mainTab;
    renderMainTabs();

    if (state.mainTab === 'tips') {
      renderTips();
    }
  });
});

document.querySelectorAll('[data-training-subtab]').forEach(tab => {
  tab.addEventListener('click', () => {
    state.trainingSubTab = tab.dataset.trainingSubtab;
    renderMainTabs();
    if (state.trainingSubTab === 'archive') {
      renderCalendar();
      renderHistorySummary();
    }
  });
});

document.querySelectorAll('[data-recovery-subtab]').forEach(tab => {
  tab.addEventListener('click', () => {
    state.recoverySubTab = tab.dataset.recoverySubtab;
    renderMainTabs();
    if (state.recoverySubTab === 'archive') {
      renderSleepArchiveCalendar();
      renderSleepArchiveDetail();
      renderSleepArchiveCharts();
    }
  });
});

document.querySelectorAll('.segment').forEach(seg => {
  seg.addEventListener('click', () => {
    state.selectedHistoryRange = seg.dataset.range;
    state.chartOffset = 0;
    document.querySelectorAll('.segment').forEach(s => {
      s.classList.toggle('active', s.dataset.range === state.selectedHistoryRange);
    });
    renderHistorySummary();
  });
});

el.historyMetricSelect.addEventListener('change', e => {
  state.selectedHistoryMetric = e.target.value;
  state.chartOffset = 0;
  renderCalendar();
  renderHistorySummary();
});

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

el.toggleRecordHistoryBtn.addEventListener('click', () => {
  state.isRecordHistoryOpen = !state.isRecordHistoryOpen;
  renderRecordHistoryToggle();
});

if (el.toggleSleepHistoryBtn) {
  el.toggleSleepHistoryBtn.addEventListener('click', () => {
    state.isSleepHistoryOpen = !state.isSleepHistoryOpen;
    renderSleepHistoryToggle();
  });
}

el.muscleGroupSelect.addEventListener('change', async e => {
  await primeAudio();
  state.selectedGroup = e.target.value;
  state.selectedExercise = '';
  renderExerciseOptions();
  await renderWorkout();
  flashGold(el.suggestionCard);
});

el.exerciseSelect.addEventListener('change', async e => {
  await primeAudio();
  state.selectedExercise = e.target.value;
  await renderWorkout();
  flashGold(el.suggestionCard);
});

el.planAiCommentBtn.addEventListener('click', fetchPlanAiComment);

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

el.sleepStartBtn.addEventListener('click', handleSleepStart);
el.sleepWakeBtn.addEventListener('click', handleSleepWake);
el.manualSleepSaveBtn.addEventListener('click', handleManualSleepSave);
el.sleepAiCommentBtn.addEventListener('click', fetchSleepingAiComment);

el.morningMemo.addEventListener('input', () => {
  state.morningMemo = el.morningMemo.value;
  saveMorningMemoLocal();
});

el.prevSleepMonthBtn.addEventListener('click', () => {
  state.sleepCalendarCursor.month -= 1;
  if (state.sleepCalendarCursor.month < 0) {
    state.sleepCalendarCursor.month = 11;
    state.sleepCalendarCursor.year -= 1;
  }
  renderSleepArchiveCalendar();
});

el.nextSleepMonthBtn.addEventListener('click', () => {
  state.sleepCalendarCursor.month += 1;
  if (state.sleepCalendarCursor.month > 11) {
    state.sleepCalendarCursor.month = 0;
    state.sleepCalendarCursor.year += 1;
  }
  renderSleepArchiveCalendar();
});

el.sleepArchiveEditToggleBtn.addEventListener('click', () => {
  el.sleepArchiveEditPanel.classList.toggle('hidden');
});

el.archiveSleepSaveBtn.addEventListener('click', saveArchiveSleepEdit);
el.archiveSleepDeleteBtn.addEventListener('click', deleteArchiveSleepRecord);

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
