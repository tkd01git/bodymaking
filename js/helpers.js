
window.helpers = {
  getSetKey(date, exercise) { return `${date}__${exercise}`; },
  dateDiffDays(a, b) { return Math.round((new Date(a + 'T00:00:00') - new Date(b + 'T00:00:00')) / 86400000); },
  flashGold(target) { target.classList.add('gold-flash'); setTimeout(() => target.classList.remove('gold-flash'), 420); },
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
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h); ctx.fillStyle = '#09101a'; ctx.fillRect(0,0,w,h);
    if (!leftSeries.length) return;
    const maxLeft = Math.max(...leftSeries.map(x => x.value), 1);
    const maxRight = Math.max(...rightSeries.map(x => x.value), 1);
    const left=38,right=40,top=18,bottom=30, cw=w-left-right, ch=h-top-bottom, count=Math.max(leftSeries.length, rightSeries.length), stepX=cw/Math.max(count-1,1);
    ctx.strokeStyle='#223044'; ctx.lineWidth=1;
    for (let i=0;i<4;i++) { const y=top+(ch/3)*i; ctx.beginPath(); ctx.moveTo(left,y); ctx.lineTo(w-right,y); ctx.stroke(); }
    for (let i=0;i<4;i++) {
      const y=top+(ch/3)*i;
      const leftVal=Math.round(maxLeft-(maxLeft/3)*i), rightVal=Math.round((maxRight-(maxRight/3)*i)*10)/10;
      ctx.fillStyle='#60a5fa'; ctx.font='10px sans-serif'; ctx.textAlign='right'; ctx.fillText(String(leftVal), left-6, y+3);
      ctx.fillStyle='#22c55e'; ctx.textAlign='left'; ctx.fillText(String(rightVal), w-right+6, y+3);
    }
    ctx.strokeStyle='#60a5fa'; ctx.lineWidth=3; ctx.beginPath();
    leftSeries.forEach((p,i)=>{ const x=left+stepX*i, y=top+ch-(p.value/maxLeft)*ch; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }); ctx.stroke();
    leftSeries.forEach((p,i)=>{ const x=left+stepX*i, y=top+ch-(p.value/maxLeft)*ch; ctx.fillStyle='#60a5fa'; ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill(); });
    ctx.strokeStyle='#22c55e'; ctx.lineWidth=3; ctx.beginPath();
    rightSeries.forEach((p,i)=>{ const x=left+stepX*i, y=top+ch-(p.value/maxRight)*ch; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }); ctx.stroke();
    rightSeries.forEach((p,i)=>{ const x=left+stepX*i, y=top+ch-(p.value/maxRight)*ch; ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill(); });
    for (let i=0;i<count;i++) { const x=left+stepX*i, label=leftSeries[i]?.label || rightSeries[i]?.label || ''; ctx.fillStyle='#93a0b4'; ctx.font='11px sans-serif'; ctx.textAlign='center'; ctx.fillText(label, x, h-10); }
    ctx.fillStyle='#60a5fa'; ctx.fillRect(left,6,12,3); ctx.fillStyle='#cfe5ff'; ctx.font='11px sans-serif'; ctx.textAlign='left'; ctx.fillText('総挙上量', left+16,10);
    ctx.fillStyle='#22c55e'; ctx.fillRect(left+98,6,12,3); ctx.fillStyle='#d6ffe4'; ctx.fillText('平均重量', left+114,10);
  }
};
