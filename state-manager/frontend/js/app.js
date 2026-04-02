// ── App State ─────────────────────────────────────────────────────────────────
let currentUser = null;
let allStates   = [];
let activeState = null;
let currentFilter = 'ALL';
let autosaveTimer = null;
let isReadOnly = false;

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('current_user');
  const token  = localStorage.getItem('jwt_token');
  if (stored && token) {
    currentUser = JSON.parse(stored);
    showDashboard();
  }
});

// ── Auth ──────────────────────────────────────────────────────────────────────
function switchTab(tab, e) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  e.currentTarget.classList.add('active');
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');
  btn.textContent = 'Signing in…'; btn.disabled = true;
  try {
    const res = await api.login({
      username: document.getElementById('login-username').value,
      password: document.getElementById('login-password').value
    });
    storeAuth(res); showDashboard();
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove('hidden');
  } finally { btn.textContent = 'Sign In →'; btn.disabled = false; }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const errEl = document.getElementById('reg-error');
  errEl.classList.add('hidden');
  btn.textContent = 'Creating account…'; btn.disabled = true;
  try {
    const res = await api.register({
      username: document.getElementById('reg-username').value,
      email:    document.getElementById('reg-email').value,
      password: document.getElementById('reg-password').value
    });
    storeAuth(res); showDashboard();
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove('hidden');
  } finally { btn.textContent = 'Create Account →'; btn.disabled = false; }
}

function storeAuth(res) {
  localStorage.setItem('jwt_token', res.token);
  localStorage.setItem('current_user', JSON.stringify(res));
  currentUser = res;
}

function logout() {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('current_user');
  currentUser = null; allStates = []; activeState = null;
  showScreen('auth-screen');
}

// ── Screens ───────────────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

async function showDashboard() {
  showScreen('dashboard-screen');
  document.getElementById('nav-username').textContent = currentUser.username;
  await loadDashboard();
}

function goToDashboard() { showDashboard(); }

// ── Dashboard ─────────────────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const data = await api.getDashboard();
    document.getElementById('stat-total').textContent     = data.totalStates;
    document.getElementById('stat-progress').textContent  = data.inProgress;
    document.getElementById('stat-done').textContent      = data.completed;
    document.getElementById('stat-abandoned').textContent = data.abandoned;
    allStates = await api.listStates();
    renderStates();
  } catch (err) { toast('Failed to load dashboard: ' + err.message, 'error'); }
}

function filterStates(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderStates();
}

function renderStates() {
  const grid = document.getElementById('states-grid');
  const filtered = currentFilter === 'ALL'
    ? allStates
    : allStates.filter(s => s.status === currentFilter);

  grid.innerHTML = '';
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📋</div>
      <p>${currentFilter === 'ALL' ? 'No workflows yet. Start one!' : 'No ' + currentFilter.toLowerCase().replace('_',' ') + ' workflows.'}</p>
      ${currentFilter === 'ALL' ? '<button class="btn btn-primary" onclick="showNewWorkflowModal()">+ New Workflow</button>' : ''}
    </div>`;
    return;
  }

  filtered.forEach(state => {
    const card = document.createElement('div');
    card.className = 'state-card';
    const isCompleted = state.status === 'COMPLETED';
    const wfDef = WORKFLOWS[state.workflowType];
    card.innerHTML = `
      <div class="state-card-header">
        <div class="state-card-title">${state.workflowName}</div>
        <span class="status-badge badge-${state.status}">${state.status.replace('_',' ')}</span>
      </div>
      <div class="state-card-type">${wfDef ? wfDef.label : state.workflowType} · v${state.version}</div>
      <div class="card-progress-bar">
        <div class="card-progress-fill ${isCompleted ? 'done' : ''}" style="width:${state.progressPercent}%"></div>
      </div>
      <div class="card-progress-text">Step ${state.currentStep} of ${state.totalSteps} · ${state.progressPercent}%</div>
      <div class="card-meta">Updated ${timeAgo(state.updatedAt)}</div>
      <div class="card-actions">
        ${state.status === 'IN_PROGRESS' ? `<button class="btn btn-primary btn-sm" onclick="resumeWorkflow('${state.id}')">▶ Resume</button>` : ''}
        ${state.status === 'COMPLETED' ? `<button class="btn btn-outline btn-sm" onclick="viewWorkflow('${state.id}')">👁 View Summary</button>` : ''}
        ${state.snapshots && state.snapshots.length > 0 ? `<button class="btn btn-outline btn-sm" onclick="showSnapshots('${state.id}')">🔄 Versions</button>` : ''}
        ${state.status !== 'ABANDONED' && state.status !== 'COMPLETED' ? `<button class="btn btn-outline btn-sm" onclick="abandonWorkflow('${state.id}')">⏸ Abandon</button>` : ''}
        <button class="btn btn-outline btn-sm" onclick="deleteWorkflow('${state.id}')">🗑</button>
      </div>`;
    grid.appendChild(card);
  });
}

// ── New Workflow ──────────────────────────────────────────────────────────────
function showNewWorkflowModal() {
  document.getElementById('modal-new').classList.remove('hidden');
}

async function createWorkflow() {
  const name = document.getElementById('new-wf-name').value.trim();
  const type = document.getElementById('new-wf-type').value;
  if (!name) { toast('Please enter a workflow name', 'error'); return; }
  const wfDef = WORKFLOWS[type];
  try {
    const state = await api.createState({
      workflowName: name, workflowType: type,
      totalSteps: wfDef.totalSteps, initialData: {}
    });
    closeModal('modal-new');
    document.getElementById('new-wf-name').value = '';
    openWorkflow(state);
    toast('Workflow created!', 'success');
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

// ── Open / Resume Workflow (EDIT mode) ────────────────────────────────────────
async function resumeWorkflow(id) {
  try { const state = await api.getState(id); openWorkflow(state); }
  catch (err) { toast('Error: ' + err.message, 'error'); }
}

function openWorkflow(state) {
  activeState = state;
  isReadOnly = false;
  showScreen('workflow-screen');
  document.getElementById('workflow-title').textContent = state.workflowName;
  document.querySelector('.workflow-actions').style.display = 'flex';
  renderWorkflowStep();
}

// ── VIEW SUMMARY (completed workflow — clean read-only display) ───────────────
async function viewWorkflow(id) {
  try { const state = await api.getState(id); openViewSummary(state); }
  catch (err) { toast('Error: ' + err.message, 'error'); }
}

function openViewSummary(state) {
  activeState = state;
  isReadOnly = true;
  const wfDef = WORKFLOWS[state.workflowType];
  showScreen('workflow-screen');

  document.getElementById('workflow-title').textContent = state.workflowName;
  document.querySelector('.workflow-actions').style.display = 'none';

  // Progress bar: 100% all done
  document.getElementById('step-label').textContent    = `All ${state.totalSteps} steps completed`;
  document.getElementById('progress-pct').textContent  = '100%';
  document.getElementById('progress-fill').style.width = '100%';

  // All step dots green ✓
  const dotsEl = document.getElementById('step-dots');
  dotsEl.innerHTML = '';
  for (let i = 1; i <= state.totalSteps; i++) {
    const dot = document.createElement('div');
    dot.className = 'step-dot done';
    dot.textContent = '✓';
    dotsEl.appendChild(dot);
  }

  // Build per-step summary cards
  let html = '<div class="summary-view">';
  wfDef.steps.forEach((stepDef, idx) => {
    const stepNum  = idx + 1;
    const stepData = state.stateData?.[stepNum] || {};

    html += `
      <div class="summary-section">
        <div class="summary-section-header">
          <span class="summary-step-badge">Step ${stepNum}</span>
          <span class="summary-section-title">${stepDef.title}</span>
        </div>
        <div class="summary-fields">`;

    stepDef.fields.forEach(field => {
      const raw = stepData[field.id];
      let display = '<span class="summary-empty">—</span>';
      if (raw !== null && raw !== undefined && raw !== '') {
        display = `<span class="summary-value-text">${Array.isArray(raw) ? (raw.length ? raw.join(', ') : '—') : String(raw)}</span>`;
      }
      html += `
        <div class="summary-row">
          <span class="summary-label">${field.label}</span>
          ${display}
        </div>`;
    });

    html += `</div></div>`;
  });
  html += '</div>';

  document.getElementById('step-content').innerHTML = html;

  // Replace nav with single back button
  document.querySelector('.step-nav').innerHTML = `
    <button class="btn btn-primary" onclick="goToDashboard()">← Back to Dashboard</button>
    <div></div><div></div>`;
}

// ── Render Workflow Step (EDIT mode) ──────────────────────────────────────────
function renderWorkflowStep() {
  const state   = activeState;
  const wfDef   = WORKFLOWS[state.workflowType];
  const stepIdx = state.currentStep - 1;
  const stepDef = wfDef.steps[stepIdx];

  // Correct progress: step 1/4 = 25%, step 4/4 = 100%
  const pct = Math.round((state.currentStep / state.totalSteps) * 100);
  document.getElementById('step-label').textContent    = `Step ${state.currentStep} of ${state.totalSteps}`;
  document.getElementById('progress-pct').textContent  = pct + '%';
  document.getElementById('progress-fill').style.width = pct + '%';

  // Step dots
  const dotsEl = document.getElementById('step-dots');
  dotsEl.innerHTML = '';
  for (let i = 1; i <= state.totalSteps; i++) {
    const dot = document.createElement('div');
    dot.className = 'step-dot';
    dot.textContent = i < state.currentStep ? '✓' : i;
    if (i < state.currentStep) dot.classList.add('done');
    else if (i === state.currentStep) dot.classList.add('active');
    dotsEl.appendChild(dot);
  }

  // Load THIS step's saved data (keyed by step number)
  const stepSavedData = state.stateData?.[state.currentStep] || {};

  document.getElementById('step-content').innerHTML = `
    <div class="step-title">${stepDef.title}</div>
    <div class="step-subtitle">${stepDef.subtitle}</div>
    ${renderStepFields(stepDef, stepSavedData)}
  `;

  // Rebuild nav buttons (in case summary replaced them)
  const isLast = state.currentStep >= state.totalSteps;
  document.querySelector('.step-nav').innerHTML = `
    <button class="btn btn-outline" id="btn-prev" onclick="prevStep()" ${state.currentStep <= 1 ? 'disabled' : ''}>← Previous</button>
    <div class="autosave-indicator" id="autosave-indicator">✓ Auto-saved</div>
    <button class="btn btn-primary" id="btn-next" onclick="nextStep()">${isLast ? 'Finish ✓' : 'Next →'}</button>`;

  setupAutosave();
}

// ── Autosave ──────────────────────────────────────────────────────────────────
function setupAutosave() {
  document.getElementById('step-card').querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('change', scheduleAutosave);
    el.addEventListener('input', scheduleAutosave);
  });
}
function scheduleAutosave() { clearTimeout(autosaveTimer); autosaveTimer = setTimeout(doAutosave, 2000); }

async function doAutosave() {
  if (!activeState || isReadOnly) return;
  const stepDef = WORKFLOWS[activeState.workflowType].steps[activeState.currentStep - 1];
  const data    = collectStepData(stepDef);
  try {
    const updated = await api.updateState(activeState.id, {
      currentStep: activeState.currentStep,
      stateData: { ...activeState.stateData, [activeState.currentStep]: data },
      createSnapshot: false
    });
    activeState = updated;
    const ind = document.getElementById('autosave-indicator');
    if (ind) { ind.classList.add('show'); setTimeout(() => ind.classList.remove('show'), 2000); }
  } catch (err) { console.warn('Autosave failed', err); }
}

// ── Step Navigation ───────────────────────────────────────────────────────────
async function nextStep() {
  if (!activeState) return;
  const stepDef = WORKFLOWS[activeState.workflowType].steps[activeState.currentStep - 1];
  const data    = collectStepData(stepDef);
  const isLast  = activeState.currentStep >= activeState.totalSteps;
  const nextNum = isLast ? activeState.currentStep : activeState.currentStep + 1;

  try {
    const updated = await api.updateState(activeState.id, {
      currentStep: nextNum,
      stateData: { ...activeState.stateData, [activeState.currentStep]: data },
      createSnapshot: true
    });
    activeState = updated;
    if (updated.status === 'COMPLETED') {
      toast('🎉 Workflow completed!', 'success');
      setTimeout(() => goToDashboard(), 1800);
    } else {
      renderWorkflowStep();
    }
  } catch (err) { toast('Save failed: ' + err.message, 'error'); }
}

async function prevStep() {
  if (!activeState || activeState.currentStep <= 1) return;
  const stepDef = WORKFLOWS[activeState.workflowType].steps[activeState.currentStep - 1];
  const data    = collectStepData(stepDef);
  try {
    const updated = await api.updateState(activeState.id, {
      currentStep: activeState.currentStep - 1,
      stateData: { ...activeState.stateData, [activeState.currentStep]: data },
      createSnapshot: false
    });
    activeState = updated;
    renderWorkflowStep();
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

// ── Snapshot ──────────────────────────────────────────────────────────────────
async function saveSnapshot() {
  if (!activeState) return;
  const stepDef = WORKFLOWS[activeState.workflowType].steps[activeState.currentStep - 1];
  const data    = collectStepData(stepDef);
  try {
    const updated = await api.updateState(activeState.id, {
      currentStep: activeState.currentStep,
      stateData: { ...activeState.stateData, [activeState.currentStep]: data },
      createSnapshot: true
    });
    activeState = updated;
    toast('Snapshot saved (v' + updated.version + ')', 'success');
  } catch (err) { toast('Snapshot failed: ' + err.message, 'error'); }
}

async function showSnapshots(stateId) {
  document.getElementById('modal-snapshots').classList.remove('hidden');
  const content = document.getElementById('snapshots-content');
  content.innerHTML = 'Loading…';
  try {
    const state = await api.getState(stateId);
    const snaps = state.snapshots || [];
    if (!snaps.length) { content.innerHTML = '<p style="color:var(--text-muted)">No snapshots yet.</p>'; return; }
    content.innerHTML = snaps.map(snap => `
      <div class="snapshot-item">
        <div>
          <div class="snapshot-ver">Version ${snap.version} — Step ${snap.step}</div>
          <div class="snapshot-meta">${new Date(snap.savedAt).toLocaleString()}</div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="revertToSnapshot('${stateId}', ${snap.version})">Revert</button>
      </div>`).join('');
  } catch (err) { content.innerHTML = `<p style="color:red">${err.message}</p>`; }
}

async function revertToSnapshot(stateId, version) {
  if (!confirm(`Revert to version ${version}? Current progress will be replaced.`)) return;
  try {
    const updated = await api.revertState(stateId, version);
    closeModal('modal-snapshots');
    if (activeState && activeState.id === stateId) { activeState = updated; renderWorkflowStep(); }
    toast('Reverted to v' + version, 'success');
    loadDashboard();
  } catch (err) { toast('Revert failed: ' + err.message, 'error'); }
}

// ── Audit Log ─────────────────────────────────────────────────────────────────
async function showAuditLog() {
  if (!activeState) return;
  document.getElementById('modal-audit').classList.remove('hidden');
  const content = document.getElementById('audit-log-content');
  content.innerHTML = 'Loading…';
  try {
    const entries = await api.getAuditLog(activeState.id);
    if (!entries.length) { content.innerHTML = '<p style="color:var(--text-muted)">No audit entries yet.</p>'; return; }
    const colors = { CREATED:'#4f46e5', UPDATED:'#d97706', DELETED:'#dc2626',
      LOADED:'#718096', STEP_ADVANCED:'#059669', COMPLETED:'#059669', REVERTED:'#7c3aed' };
    content.innerHTML = entries.map(e => `
      <div class="audit-entry">
        <div class="audit-dot" style="background:${colors[e.action]||'#718096'}"></div>
        <div>
          <div class="audit-action">${e.action.replace('_',' ')}</div>
          <div class="audit-meta">Step ${e.stepFrom} → ${e.stepTo} &nbsp;·&nbsp; ${new Date(e.timestamp).toLocaleString()}</div>
        </div>
      </div>`).join('');
  } catch (err) { content.innerHTML = `<p style="color:red">${err.message}</p>`; }
}

// ── Card Actions ──────────────────────────────────────────────────────────────
async function abandonWorkflow(id) {
  if (!confirm('Mark this workflow as abandoned?')) return;
  try { await api.abandonState(id); toast('Workflow abandoned', 'success'); loadDashboard(); }
  catch (err) { toast('Error: ' + err.message, 'error'); }
}

async function deleteWorkflow(id) {
  if (!confirm('Permanently delete this workflow? This cannot be undone.')) return;
  try { await api.deleteState(id); toast('Deleted', 'success'); loadDashboard(); }
  catch (err) { toast('Error: ' + err.message, 'error'); }
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  setTimeout(() => el.classList.remove('show'), 3000);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
