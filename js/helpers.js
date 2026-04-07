window.helpers = {
  getSetKey(date, exercise) {
    return `${date}__${exercise}`;
  },

  dateDiffDays(dateA, dateB) {
    const a = new Date(`${dateA}T00:00:00`);
    const b = new Date(`${dateB}T00:00:00`);
    const diff = a.getTime() - b.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  },

  flashGold(el) {
    if (!el) return;
    el.classList.remove('gold-flash');
    void el.offsetWidth;
    el.classList.add('gold-flash');
    setTimeout(() => el.classList.remove('gold-flash'), 900);
  },

  writeProfileToForm(profile) {
    document.getElementById('profileHeight').value = profile?.height ?? '';
    document.getElementById('profileWeight').value = profile?.weight ?? '';
    document.getElementById('profileGoal').value = profile?.goal ?? 'hypertrophy';
    document.getElementById('profileFrequency').value = profile?.frequency ?? 3;
    document.getElementById('pbBench').value = profile?.pbs?.benchPress ?? '';
    document.getElementById('pbSquat').value = profile?.pbs?.squat ?? '';
    document.getElementById('pbDeadlift').value = profile?.pbs?.deadlift ?? '';
  },

  readProfileFromForm() {
    return {
      height: Number(document.getElementById('profileHeight').value || 0) || '',
      weight: Number(document.getElementById('profileWeight').value || 0) || '',
      goal: document.getElementById('profileGoal').value || 'hypertrophy',
      frequency: Number(document.getElementById('profileFrequency').value || 0) || '',
      pbs: {
        benchPress: Number(document.getElementById('pbBench').value || 0) || '',
        squat: Number(document.getElementById('pbSquat').value || 0) || '',
        deadlift: Number(document.getElementById('pbDeadlift').value || 0) || ''
      }
    };
  },

  getNiceStep(maxValue) {
    if (!maxValue || maxValue <= 0) return 10;

    const rough = maxValue / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
    const normalized = rough / magnitude;

    let nice;
    if (normalized <= 1) nice = 1;
    else if (normalized <= 2) nice = 2;
    else if (normalized <= 5) nice = 5;
    else nice = 10;

    return nice * magnitude;
  },

  drawDualChart(canvas, leftSeries = [], rightSeries = []) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 16, right: 42, bottom: 38, left: 42 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const labels = leftSeries.map(d => d.label);
    const leftValues = leftSeries.map(d => Number(d.value || 0));
    const rightValues = rightSeries.map(d => Number(d.value || 0));

    const leftMaxRaw = Math.max(...leftValues, 0);
    const rightMaxRaw = Math.max(...rightValues, 0);

    const leftStep = this.getNiceStep(leftMaxRaw || 100);
    const rightStep = this.getNiceStep(rightMaxRaw || 20);

    const leftMax = Math.max(leftStep * 4, Math.ceil(leftMaxRaw / leftStep) * leftStep);
    const rightMax = Math.max(rightStep * 4, Math.ceil(rightMaxRaw / rightStep) * rightStep);

    const yLeft = (v) => padding.top + chartH - (v / leftMax) * chartH;
    const yRight = (v) => padding.top + chartH - (v / rightMax) * chartH;
    const x = (i) => {
      if (labels.length <= 1) return padding.left + chartW / 2;
      return padding.left + (chartW / (labels.length - 1)) * i;
    };

    ctx.strokeStyle = '#252525';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const yy = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, yy);
      ctx.lineTo(width - padding.right, yy);
      ctx.stroke();
    }

    ctx.fillStyle = '#8d8d8d';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 4; i++) {
      const val = leftMax - leftStep * i;
      const yy = yLeft(val);
      ctx.fillText(String(Math.round(val)), padding.left - 6, yy);
    }

    ctx.textAlign = 'left';
    for (let i = 0; i <= 4; i++) {
      const val = rightMax - rightStep * i;
      const yy = yRight(val);
      ctx.fillText(String(Math.round(val)), width - padding.right + 6, yy);
    }

    if (labels.length) {
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      leftValues.forEach((v, i) => {
        const xx = x(i);
        const yy = yLeft(v);
        if (i === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      });
      ctx.stroke();

      ctx.strokeStyle = '#f3f3f3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      rightValues.forEach((v, i) => {
        const xx = x(i);
        const yy = yRight(v);
        if (i === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      });
      ctx.stroke();

      leftValues.forEach((v, i) => {
        const xx = x(i);
        const yy = yLeft(v);
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.arc(xx, yy, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      rightValues.forEach((v, i) => {
        const xx = x(i);
        const yy = yRight(v);
        ctx.fillStyle = '#f3f3f3';
        ctx.beginPath();
        ctx.arc(xx, yy, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#9a9a9a';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      labels.forEach((label, i) => {
        ctx.fillText(label, x(i), height - padding.bottom + 10);
      });
    }
  }
};
