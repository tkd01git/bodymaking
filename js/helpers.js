window.helpers = {
  getSetKey(date, exercise) {
    return `${date}__${exercise}`;
  },

  dateDiffDays(a, b) {
    return Math.round(
      (new Date(a + 'T00:00:00') - new Date(b + 'T00:00:00')) / 86400000
    );
  },

  flashGold(target) {
    target.classList.add('gold-flash');
    setTimeout(() => target.classList.remove('gold-flash'), 420);
  },

  readProfileFromForm() {
    return {
      height: document.getElementById('profileHeight').value,
      weight: document.getElementById('profileWeight').value,
      goal: document.getElementById('profileGoal').value,
      frequency: document.getElementById('profileFrequency').value,
      pbs: {
        benchPress: document.getElementById('pbBench').value,
        squat: document.getElementById('pbSquat').value,
        deadlift: document.getElementById('pbDeadlift').value
      }
    };
  },

  writeProfileToForm(profile) {
    document.getElementById('profileHeight').value = profile.height || '';
    document.getElementById('profileWeight').value = profile.weight || '';
    document.getElementById('profileGoal').value = profile.goal || 'hypertrophy';
    document.getElementById('profileFrequency').value = profile.frequency || 3;
    document.getElementById('pbBench').value = profile.pbs?.benchPress || '';
    document.getElementById('pbSquat').value = profile.pbs?.squat || '';
    document.getElementById('pbDeadlift').value = profile.pbs?.deadlift || '';
  },

  formatDateLabel(dateStr) {
    return `${Number(dateStr.slice(5, 7))}/${Number(dateStr.slice(8, 10))}`;
  },

  formatDurationMinutes(mins) {
    if (mins == null || Number.isNaN(mins)) return '-';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  },

  formatLocalDateTime(iso) {
    if (!iso) return '-';
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return '-';
    const y = dt.getFullYear();
    const mo = dt.getMonth() + 1;
    const d = dt.getDate();
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${y}/${mo}/${d} ${hh}:${mm}`;
  },

  toDatetimeLocalValue(iso) {
    if (!iso) return '';
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return '';
    const y = dt.getFullYear();
    const mo = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${y}-${mo}-${d}T${hh}:${mm}`;
  },

  sleepAxisValueFromIso(iso, isSleep = false) {
    if (!iso) return null;
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return null;
    let value = dt.getHours() + dt.getMinutes() / 60;
    if (isSleep && value < 12) value += 24;
    if (!isSleep && value < 12) value += 24;
    return value;
  },

  formatSleepAxisLabel(value) {
    let hour = Math.floor(value);
    const minute = Math.round((value - hour) * 60);
    if (hour >= 24) hour -= 24;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  },

  drawDualChart(canvas, leftSeries, rightSeries) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, w, h);

    if (!leftSeries.length) return;

    const maxLeft = Math.max(...leftSeries.map(x => Number(x.value || 0)), 1);
    const maxRight = Math.max(...rightSeries.map(x => Number(x.value || 0)), 1);

    const leftPad = 38;
    const rightPad = 40;
    const top = 18;
    const bottom = 30;
    const cw = w - leftPad - rightPad;
    const ch = h - top - bottom;
    const count = Math.max(leftSeries.length, rightSeries.length);
    const stepX = cw / Math.max(count - 1, 1);
    const barWidth = Math.min(10, stepX * 0.22);

    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const y = top + (ch / 3) * i;
      ctx.beginPath();
      ctx.moveTo(leftPad, y);
      ctx.lineTo(w - rightPad, y);
      ctx.stroke();
    }

    for (let i = 0; i < 4; i++) {
      const y = top + (ch / 3) * i;
      const leftVal = Math.round(maxLeft - (maxLeft / 3) * i);
      const rightVal = Math.round((maxRight - (maxRight / 3) * i) * 10) / 10;

      ctx.fillStyle = '#d4af37';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(leftVal), leftPad - 6, y + 3);

      ctx.fillStyle = '#cfcfcf';
      ctx.textAlign = 'left';
      ctx.fillText(String(rightVal), w - rightPad + 6, y + 3);
    }

    rightSeries.forEach((p, i) => {
      const x = leftPad + stepX * i;
      const barHeight = (Number(p.value || 0) / maxRight) * ch;
      const y = top + ch - barHeight;
      ctx.fillStyle = '#8a8a8a';
      ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
    });

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    leftSeries.forEach((p, i) => {
      const x = leftPad + stepX * i;
      const y = top + ch - (Number(p.value || 0) / maxLeft) * ch;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    leftSeries.forEach((p, i) => {
      const x = leftPad + stepX * i;
      const y = top + ch - (Number(p.value || 0) / maxLeft) * ch;
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = 0; i < count; i++) {
      const x = leftPad + stepX * i;
      const label = leftSeries[i]?.label || rightSeries[i]?.label || '';
      ctx.fillStyle = '#b8b8b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, h - 10);
    }

    ctx.fillStyle = '#d4af37';
    ctx.fillRect(leftPad, 6, 12, 3);
    ctx.fillStyle = '#f0d98a';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('総挙上量', leftPad + 16, 10);

    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(leftPad + 98, 6, 12, 3);
    ctx.fillStyle = '#cfcfcf';
    ctx.fillText('平均重量', leftPad + 114, 10);
  },

  drawSleepDurationChart(canvas, series) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, w, h);

    if (!series.length) return;

    const maxVal = Math.max(...series.map(x => Number(x.value || 0)), 1);
    const leftPad = 36;
    const rightPad = 16;
    const top = 18;
    const bottom = 28;
    const cw = w - leftPad - rightPad;
    const ch = h - top - bottom;
    const count = series.length;
    const stepX = cw / Math.max(count, 1);
    const barWidth = Math.min(24, stepX * 0.46);

    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const y = top + (ch / 3) * i;
      ctx.beginPath();
      ctx.moveTo(leftPad, y);
      ctx.lineTo(w - rightPad, y);
      ctx.stroke();
    }

    for (let i = 0; i < 4; i++) {
      const y = top + (ch / 3) * i;
      const val = Math.round((maxVal - (maxVal / 3) * i) * 10) / 10;
      ctx.fillStyle = '#d4af37';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(val), leftPad - 6, y + 3);
    }

    series.forEach((p, i) => {
      const x = leftPad + stepX * i + stepX / 2;
      const barHeight = (Number(p.value || 0) / maxVal) * ch;
      const y = top + ch - barHeight;
      ctx.fillStyle = '#8a8a8a';
      ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
    });

    series.forEach((p, i) => {
      const x = leftPad + stepX * i + stepX / 2;
      ctx.fillStyle = '#b8b8b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, x, h - 10);
    });

    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(leftPad, 6, 12, 3);
    ctx.fillStyle = '#cfcfcf';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('睡眠時間', leftPad + 16, 10);
  },

  drawSleepTimingChart(canvas, sleepSeries, wakeSeries) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, w, h);

    if (!sleepSeries.length && !wakeSeries.length) return;

    const leftPad = 48;
    const rightPad = 18;
    const top = 18;
    const bottom = 30;
    const cw = w - leftPad - rightPad;
    const ch = h - top - bottom;
    const count = Math.max(sleepSeries.length, wakeSeries.length, 1);
    const stepX = cw / Math.max(count - 1, 1);

    const minY = 21;
    const maxY = 32;

    const yPos = (v) => top + ch - ((v - minY) / (maxY - minY)) * ch;

    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    const ticks = [21, 24, 27, 30, 32];
    ticks.forEach(t => {
      const y = yPos(t);
      ctx.beginPath();
      ctx.moveTo(leftPad, y);
      ctx.lineTo(w - rightPad, y);
      ctx.stroke();

      ctx.fillStyle = '#cfcfcf';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(this.formatSleepAxisLabel(t), leftPad - 6, y + 3);
    });

    const drawLine = (series, stroke, fill) => {
      let started = false;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3;
      ctx.beginPath();
      series.forEach((p, i) => {
        if (p.value == null) {
          started = false;
          return;
        }
        const x = leftPad + stepX * i;
        const y = yPos(p.value);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      series.forEach((p, i) => {
        if (p.value == null) return;
        const x = leftPad + stepX * i;
        const y = yPos(p.value);
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    drawLine(sleepSeries, '#d4af37', '#d4af37');
    drawLine(wakeSeries, '#f3f3f3', '#f3f3f3');

    for (let i = 0; i < count; i++) {
      const x = leftPad + stepX * i;
      const label = sleepSeries[i]?.label || wakeSeries[i]?.label || '';
      ctx.fillStyle = '#b8b8b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, h - 10);
    }

    ctx.fillStyle = '#d4af37';
    ctx.fillRect(leftPad, 6, 12, 3);
    ctx.fillStyle = '#f0d98a';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('入眠', leftPad + 16, 10);

    ctx.fillStyle = '#f3f3f3';
    ctx.fillRect(leftPad + 70, 6, 12, 3);
    ctx.fillStyle = '#f3f3f3';
    ctx.fillText('起床', leftPad + 86, 10);
  }
};
