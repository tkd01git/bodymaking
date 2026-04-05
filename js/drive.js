
window.driveApi = {
  async auth() {
    const res = await fetch(window.DRIVE_ENDPOINTS.auth, { credentials: 'include' });
    if (!res.ok) throw new Error('Drive auth failed');
    return res.json();
  },
  async saveProfile(profile) {
    const res = await fetch(window.DRIVE_ENDPOINTS.saveProfile, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });
    if (!res.ok) throw new Error('Drive profile save failed');
    return res.json();
  },
  async loadProfile() {
    const res = await fetch(window.DRIVE_ENDPOINTS.loadProfile, { credentials: 'include' });
    if (!res.ok) throw new Error('Drive profile load failed');
    return res.json();
  },
  async saveRecords(records) {
    const res = await fetch(window.DRIVE_ENDPOINTS.saveRecords, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records })
    });
    if (!res.ok) throw new Error('Drive records save failed');
    return res.json();
  },
  async loadRecords() {
    const res = await fetch(window.DRIVE_ENDPOINTS.loadRecords, { credentials: 'include' });
    if (!res.ok) throw new Error('Drive records load failed');
    return res.json();
  }
};

