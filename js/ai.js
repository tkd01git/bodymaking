
window.aiApi = {
  async getTrainingPlan(payload) {
    const res = await fetch(window.AI_ENDPOINTS.training, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('AI training request failed');
    return res.json();
  },
  async getRecoveryPlan(payload) {
    const res = await fetch(window.AI_ENDPOINTS.recovery, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('AI recovery request failed');
    return res.json();
  }
};
