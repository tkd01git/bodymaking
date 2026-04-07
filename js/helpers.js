window.helpers = {
  getSetKey(date, exercise) {
    return `${date}__${exercise}`;
  },

  dateDiffDays(a, b) {
    if (!a || !b) return 999;
    const da = new Date(`${a}T00:00:00`);
    const db = new Date(`${b}T00:00:00`);
    return Math.floor((da - db) / (1000 * 60 * 60 * 24));
  },

  flashGold(el) {
    if (!el) return;
    el.classList.remove('gold-flash');
    void el.offsetWidth;
    el.classList.add('gold-flash');
    setTimeout(() => el.classList.remove('gold-flash'), 900);
  },

  writeProfileToForm(profile) {
    if (!profile) return;
    document.getElementById('profileHeight').value = profile.height ?? '';
    document.getElementById('profileWeight').value = profile.weight ?? '';
    document.getElementById('profileGoal').value = profile.goal ?? 'hypertrophy';
    document.getElementById('profileFrequency').value = profile.frequency ?? 3;
    document.getElementById('pbBench').value = profile.pbs?.benchPress ?? '';
    document.getElementById('pbSquat').value = profile.pbs?.squat ?? '';
    document.getElementById('pbDeadlift').value = profile.pbs?.deadlift ?? '';
  },

  readProfileFromForm() {
    return {
      height: Number(document.getElementById('profileHeight').value || ''),
      weight: Number(document.getElementById('profileWeight').value || ''),
      goal: document.getElementById('profileGoal').value,
      frequency: Number(document.getElementById('profileFrequency').value || ''),
      pbs: {
        benchPress: Number(document.getElementById('pbBench').value || ''),
        squat: Number(document.getElementById('pbSquat').value || ''),
        deadlift: Number(document.getElementById('pbDeadlift').value || '')
      }
    };
  },

  getNiceAxisMax(maxValue) {
    if (!maxValue || maxValue <= 0) return 4;

    const roughStep = maxValue / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;

    let niceStep;
    if (normalized <= 1) niceStep = 1;
    else if (normalized <= 2) niceStep = 2;
    else if (normalized <= 5) niceStep = 5;
    else niceStep = 10;

    const step = niceStep * magnitude;
    return step * 4;
  },

  drawDualChart(canvas, leftSeries = [], rightSeries = []) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 18, right: 42, bottom: 34, left: 42 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const count = Math.max(leftSeries.length, rightSeries.length);
    if (!count) {
      ctx.fillStyle = '#9a9a9a';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data', width / 2, height / 2);
      return;
    }

    const labels = Array.from({ length: count }, (_, i) => leftSeries[i]?.label ?? rightSeries[i]?.label ?? '');
    const leftValues = Array.from({ length: count }, (_, i) => Number(leftSeries[i]?.value ?? 0));
    const rightValues = Array.from({ length: count }, (_, i) => Number(rightSeries[i]?.value ?? 0));

    const leftRawMax = Math.max(...leftValues, 0);
    const rightRawMax = Math.max(...rightValues, 0);

    const leftMax = this.getNiceAxisMax(leftRawMax);
    const rightMax = this.getNiceAxisMax(rightRawMax);

    const xAt = (i) => {
      if (count === 1) return padding.left + chartWidth / 2;
      return padding.left + (chartWidth * i) / (count - 1);
    };
    const yLeft = (v) => padding.top + chartHeight - (v / leftMax) * chartHeight;
    const yRight = (v) => padding.top + chartHeight - (v / rightMax) * chartHeight;

    ctx.strokeStyle = '#252525';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '10px sans-serif';
    ctx.textBaseline = 'middle';

    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const value = Math.round((leftMax * (4 - i)) / 4);
      const y = padding.top + (chartHeight * i) / 4;
      ctx.fillText(String(value), padding.left - 6, y);
    }

    ctx.textAlign = 'left';
    for (let i = 0; i <= 4; i++) {
      const value = Math.round((rightMax * (4 - i)) / 4);
      const y = padding.top + (chartHeight * i) / 4;
      ctx.fillText(String(value), width - padding.right + 6, y);
    }

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    leftValues.forEach((v, i) => {
      const x = xAt(i);
      const y = yLeft(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = '#d4af37';
    leftValues.forEach((v, i) => {
      const x = xAt(i);
      const y = yLeft(v);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = '#f3f3f3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    rightValues.forEach((v, i) => {
      const x = xAt(i);
      const y = yRight(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = '#f3f3f3';
    rightValues.forEach((v, i) => {
      const x = xAt(i);
      const y = yRight(v);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    labels.forEach((label, i) => {
      ctx.fillText(label, xAt(i), height - padding.bottom + 8);
    });
  }
};
