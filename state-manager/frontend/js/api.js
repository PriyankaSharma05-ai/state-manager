// ── API Client ────────────────────────────────────────────────────────────────
const API_BASE = "https://state-manager-backend.onrender.com";

const api = (() => {
  function getToken() { return localStorage.getItem('jwt_token'); }

  async function request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);

    if (res.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('current_user');
      window.location.reload();
      return;
    }

    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || `Error ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  return {
    // Auth
    register: (body) => request('POST', '/auth/register', body),
    login:    (body) => request('POST', '/auth/login', body),

    // States
    getDashboard:  ()           => request('GET',    '/states/dashboard'),
    listStates:    ()           => request('GET',    '/states'),
    getState:      (id)         => request('GET',    `/states/${id}`),
    createState:   (body)       => request('POST',   '/states', body),
    updateState:   (id, body)   => request('PUT',    `/states/${id}`, body),
    deleteState:   (id)         => request('DELETE', `/states/${id}`),
    abandonState:  (id)         => request('PATCH',  `/states/${id}/abandon`),
    revertState:   (id, ver)    => request('PATCH',  `/states/${id}/revert/${ver}`),
    getAuditLog:   (id)         => request('GET',    `/states/${id}/audit`),
  };
})();
