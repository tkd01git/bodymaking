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
    const barWidth = Math.min(18, stepX * 0.42);

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

      ctx.fillStyle = '#f3f3f3';
      ctx.textAlign = 'left';
      ctx.fillText(String(rightVal), w - rightPad + 6, y + 3);
    }

    rightSeries.forEach((p, i) => {
      const x = leftPad + stepX * i;
      const barHeight = (Number(p.value || 0) / maxRight) * ch;
      const y = top + ch - barHeight;
      ctx.fillStyle = '#f3f3f3';
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

    ctx.fillStyle = '#f3f3f3';
    ctx.fillRect(leftPad + 98, 6, 12, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('平均重量', leftPad + 114, 10);
  }
};
