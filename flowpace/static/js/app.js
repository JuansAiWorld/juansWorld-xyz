const API = '';
const state = {
  routines: [],
  completions: [],
  settings: { is_pro: false, is_audio_enabled: true, is_voice_enabled: false, volume: 0.7, selected_sound_pack: 'default', background_color: 'blue' },
  view: 'list',
  selectedRoutine: null,
  editingRoutine: null,
  timer: null,
  timerState: 'idle',
  currentStepIndex: 0,
  flattenedSteps: [],
  timeRemaining: 0,
  totalElapsed: 0,
  totalDuration: 0,
  lastAnnouncedSecond: null,
  didAnnounceComplete: false,
  currentStepDuration: 0,
  voiceQueue: [],
};

const colorMap = {
  red: '#ef4444', orange: '#f97316', yellow: '#eab308', green: '#22c55e',
  blue: '#3b82f6', purple: '#a855f7', pink: '#ec4899', gray: '#6b7280', black: '#111827',
};

const bgColorMap = {
  red: ['#1a0505', '#2d0a0a'], orange: ['#1a0f05', '#2d1a0a'], yellow: ['#1a1705', '#2d2a0a'],
  green: ['#051a0d', '#0a2d18'], blue: ['#050a1a', '#0a152d'], purple: ['#0f051a', '#1a0a2d'],
  pink: ['#1a0512', '#2d0a1f'], gray: ['#0f0f10', '#1a1a1c'], black: ['#000000', '#0a0a0a'],
};

// ---------- API ----------
async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadData() {
  state.routines = await api('GET', '/api/routines');
  state.settings = await api('GET', '/api/settings');
  render();
}

// ---------- Utils ----------
function fmtTime(sec) {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function fmtShort(sec) {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
function setBg(colorKey) {
  const [s, e] = bgColorMap[colorKey] || bgColorMap.blue;
  document.querySelectorAll('.view').forEach(v => v.style.background = `linear-gradient(135deg, ${s} 0%, ${e} 100%)`);
}
function playBeep(freq = 800, duration = 0.15, type = 'sine') {
  if (!state.settings.is_audio_enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(state.settings.volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration);
  } catch (e) { console.error(e); }
}
function speak(text, rate = 1, pitch = 1) {
  if (!state.settings.is_audio_enabled || !state.settings.is_voice_enabled) return;
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate; u.pitch = pitch; u.volume = state.settings.volume;
  window.speechSynthesis.speak(u);
}
function stopAudio() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ---------- Navigation ----------
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  state.view = name;
  window.scrollTo(0, 0);
}
function goBack() { showView('list'); renderList(); }

// ---------- Rendering ----------
function render() {
  setBg(state.settings.background_color);
  renderList(); renderSettings(); renderAnalytics();
}

function renderList() {
  const el = document.getElementById('routine-list');
  if (!state.routines.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⏱</div>
        <h2>Ready to Optimize Your Workflow?</h2>
        <p style="color:var(--text-secondary);max-width:320px;">Create your first professional interval timer routine to boost productivity and focus</p>
        <button class="btn" onclick="openEditor()">Create Your First Routine</button>
      </div>`;
    return;
  }
  const limit = state.settings.is_pro ? Infinity : 3;
  const canAdd = state.routines.length < limit;
  el.innerHTML = state.routines.map((r, i) => `
    <div class="routine-row" draggable="true" data-index="${i}" data-id="${r.id}" onclick="openDetail('${r.id}')">
      <div class="routine-icon">⏱</div>
      <div class="routine-info">
        <div class="routine-name">${esc(r.name)}</div>
        <div class="routine-meta">
          <span>📋 ${r.steps.length} steps</span>
          <span>⏱ ${fmtShort(r.total_duration || r.steps.reduce((a,s)=>a+(s.duration||0),0))}</span>
        </div>
      </div>
    </div>
  `).join('');

  // drag reorder
  let dragSrc = null;
  el.querySelectorAll('.routine-row').forEach(row => {
    row.addEventListener('dragstart', e => { dragSrc = row; e.dataTransfer.effectAllowed = 'move'; });
    row.addEventListener('dragover', e => { e.preventDefault(); return false; });
    row.addEventListener('drop', async e => {
      e.stopPropagation();
      if (dragSrc !== row) {
        const from = +dragSrc.dataset.index, to = +row.dataset.index;
        const item = state.routines.splice(from, 1)[0];
        state.routines.splice(to, 0, item);
        await api('POST', '/api/routines/reorder', { ordered_ids: state.routines.map(r=>r.id) });
        renderList();
      }
    });
  });

  const btnArea = document.getElementById('list-actions');
  btnArea.innerHTML = `
    <button class="btn btn-glass w-full" ${!canAdd?'disabled':''} onclick="openEditor()">
      ${canAdd ? '➕ Create New Routine' : '🔒 Upgrade to Create More'}
    </button>
    ${!state.settings.is_pro && state.routines.length>=3 ? '<p class="text-center text-xs opacity-60" style="margin-top:8px;">Upgrade to Pro for unlimited routines</p>':''}
  `;
}

function openDetail(id) {
  const r = state.routines.find(x => x.id === id);
  if (!r) return;
  state.selectedRoutine = r;
  const total = r.total_duration || r.steps.reduce((a,s)=>a+(s.duration||0),0);
  document.getElementById('detail-content').innerHTML = `
    <div class="detail-header">
      <div class="detail-icon">⏱</div>
      <h1>${esc(r.name)}</h1>
      <div class="stats-row">
        <div class="stat-pill"><div class="stat-value">${r.steps.length}</div><div class="stat-label">Steps</div></div>
        <div class="stat-pill"><div class="stat-value">${fmtShort(total)}</div><div class="stat-label">Duration</div></div>
      </div>
      <div class="flex gap-4 mt-2">
        <button class="btn" style="padding:10px 18px;font-size:0.9rem;" onclick="openEditor('${r.id}')">✏️ Edit</button>
        <button class="btn btn-glass" style="padding:10px 18px;font-size:0.9rem;" onclick="duplicateRoutine('${r.id}')">📋 Copy</button>
        <button class="btn btn-glass" style="padding:10px 18px;font-size:0.9rem;background:rgba(239,68,68,0.2);" onclick="deleteRoutine('${r.id}')">🗑 Delete</button>
      </div>
    </div>
    <div style="padding:0 20px;"><h3 style="margin-bottom:12px;">Routine Breakdown</h3></div>
    <div class="steps-list">
      ${r.steps.map(item => `
        <div class="step-item">
          <div class="step-dot" style="background:${colorMap[item.color]||colorMap.blue}"></div>
          <div class="step-name">${esc(item.name)}</div>
          <div class="step-time">${fmtShort(item.duration)}</div>
        </div>
        ${item.type==='group' && item.steps ? item.steps.map(s=>`
          <div class="step-item" style="margin-left:24px;opacity:0.8;">
            <div class="step-dot" style="background:${colorMap[s.color]||colorMap.blue};width:10px;height:10px;"></div>
            <div class="step-name" style="font-size:0.9rem;">${esc(s.name)}</div>
            <div class="step-time" style="font-size:0.8rem;">${fmtShort(s.duration)}</div>
          </div>
        `).join(''):''}
      `).join('')}
    </div>
    <div style="padding:20px;text-align:center;">
      <button class="btn w-full" style="padding:18px;" onclick="startTimer('${r.id}')">▶ Start Routine</button>
      <p style="margin-top:10px;color:var(--text-secondary);font-size:0.85rem;">Tap to begin your focused work session</p>
    </div>
  `;
  showView('detail');
}

async function deleteRoutine(id) {
  if (!confirm('Delete this routine?')) return;
  await api('DELETE', '/api/routines/' + id);
  await loadData();
  goBack();
}
async function duplicateRoutine(id) {
  await api('POST', '/api/routines/' + id + '/duplicate');
  await loadData();
  showToast('Routine duplicated');
}

// ---------- Editor ----------
let editorItems = [];
function openEditor(id) {
  editorItems = [];
  state.editingRoutine = null;
  if (id) {
    const r = state.routines.find(x => x.id === id);
    if (r) { state.editingRoutine = r; editorItems = JSON.parse(JSON.stringify(r.steps)); }
  }
  document.getElementById('editor-name').value = state.editingRoutine ? state.editingRoutine.name : '';
  renderEditorItems();
  showView('editor');
}
function renderEditorItems() {
  const el = document.getElementById('editor-items');
  if (!editorItems.length) {
    el.innerHTML = `<div class="empty-state" style="padding:40px 0;"><div class="empty-icon" style="width:80px;height:80px;font-size:2rem;">➕</div><h3>No Steps Yet</h3><p style="color:var(--text-secondary);">Add steps and groups to build your routine</p></div>`;
  } else {
    el.innerHTML = editorItems.map((item, i) => `
      <div class="item-row" draggable="true" data-index="${i}">
        <div class="step-dot" style="background:${colorMap[item.color]||colorMap.blue}"></div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;">${esc(item.name)}</div>
          <div style="font-size:0.8rem;color:var(--text-secondary);">${item.type==='group'?`${item.steps?.length||0} steps × ${item.loop_count||1} loops`:'Single step'}</div>
        </div>
        <div class="step-time">${fmtShort(item.duration)}</div>
        <button class="btn btn-glass btn-icon" style="width:36px;height:36px;font-size:1rem;" onclick="editItem(${i})">✏️</button>
        <button class="btn btn-glass btn-icon" style="width:36px;height:36px;font-size:1rem;background:rgba(239,68,68,0.2);" onclick="removeItem(${i})">🗑</button>
      </div>
    `).join('');
    // drag sort
    let src = null;
    el.querySelectorAll('.item-row').forEach(row => {
      row.addEventListener('dragstart', e => { src = row; });
      row.addEventListener('dragover', e => e.preventDefault());
      row.addEventListener('drop', e => {
        e.stopPropagation();
        if (src !== row) {
          const f = +src.dataset.index, t = +row.dataset.index;
          const item = editorItems.splice(f, 1)[0]; editorItems.splice(t, 0, item); renderEditorItems();
        }
      });
    });
  }
  const total = editorItems.reduce((a,s)=>a+(s.duration||0),0);
  document.getElementById('editor-total').textContent = fmtShort(total);
}
function removeItem(i) { editorItems.splice(i,1); renderEditorItems(); }
function editItem(i) {
  const item = editorItems[i];
  if (item.type === 'step') {
    document.getElementById('step-name').value = item.name;
    document.getElementById('step-duration').value = Math.floor(item.duration);
    document.getElementById('step-color').value = item.color;
    document.getElementById('step-modal').dataset.index = i;
    showModal('step-modal');
  } else {
    document.getElementById('group-name').value = item.name;
    document.getElementById('group-loops').value = item.loop_count || 1;
    document.getElementById('group-color').value = item.color;
    // populate sub-steps editor
    const subEl = document.getElementById('group-substeps');
    subEl.innerHTML = (item.steps||[]).map((s, si) => `
      <div class="item-row" style="margin-bottom:6px;">
        <input class="sub-step-name" data-index="${si}" value="${esc(s.name)}" placeholder="Name" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:8px 12px;border-radius:10px;color:#fff;">
        <input class="sub-step-dur" data-index="${si}" type="number" value="${Math.floor(s.duration)}" placeholder="Sec" style="width:70px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:8px 12px;border-radius:10px;color:#fff;">
        <button class="btn btn-glass btn-icon" style="width:32px;height:32px;font-size:0.8rem;background:rgba(239,68,68,0.2);" onclick="this.parentElement.remove()">🗑</button>
      </div>
    `).join('');
    document.getElementById('group-modal').dataset.index = i;
    showModal('group-modal');
  }
}

async function saveRoutine() {
  const name = document.getElementById('editor-name').value.trim();
  if (!name || !editorItems.length) { showToast('Please add a name and at least one step'); return; }
  const payload = { name, steps: editorItems };
  if (state.editingRoutine) {
    await api('PUT', '/api/routines/' + state.editingRoutine.id, { id: state.editingRoutine.id, ...payload });
  } else {
    await api('POST', '/api/routines', payload);
  }
  await loadData();
  goBack();
  showToast(state.editingRoutine ? 'Routine updated' : 'Routine created');
}

// ---------- Timer ----------
function startTimer(id) {
  const r = state.routines.find(x => x.id === id);
  if (!r) return;
  state.selectedRoutine = r;
  // flatten steps
  state.flattenedSteps = [];
  for (const item of r.steps) {
    if (item.type === 'step' && item.duration > 0) {
      state.flattenedSteps.push({ id: item.id, name: item.name, duration: item.duration, color: item.color });
    } else if (item.type === 'group' && item.steps) {
      for (let l=0; l<(item.loop_count||1); l++) {
        for (const s of item.steps) {
          if (s.duration > 0) state.flattenedSteps.push({ id: s.id, name: s.name, duration: s.duration, color: s.color });
        }
      }
    }
  }
  if (!state.flattenedSteps.length) { showToast('No valid steps'); return; }
  state.currentStepIndex = 0;
  state.totalElapsed = 0;
  state.totalDuration = state.flattenedSteps.reduce((a,s)=>a+s.duration,0);
  state.lastAnnouncedSecond = null;
  state.didAnnounceComplete = false;
  updateTimerDisplay();
  showView('timer');
  resumeTimer();
}

function updateTimerDisplay() {
  const step = state.flattenedSteps[state.currentStepIndex];
  const next = state.flattenedSteps[state.currentStepIndex+1] || null;
  document.getElementById('timer-step-label').textContent = 'Current Step';
  document.getElementById('timer-step-name').textContent = step ? step.name.toUpperCase() : '';
  document.getElementById('timer-time').textContent = fmtTime(state.timeRemaining);
  document.getElementById('timer-next').innerHTML = next
    ? `<div style="font-size:0.75rem;color:var(--text-secondary);letter-spacing:1px;">NEXT STEP</div><div style="font-weight:700;">${esc(next.name).toUpperCase()}</div>`
    : `<div style="font-size:0.75rem;color:transparent;">NEXT</div><div style="font-weight:700;color:transparent;">NONE</div>`;

  // ring progress
  const circumference = 2 * Math.PI * 130;
  const sp = step && step.duration > 0 ? Math.max(0, Math.min(1, (step.duration - state.timeRemaining) / step.duration)) : 0;
  const op = state.totalDuration > 0 ? Math.max(0, Math.min(1, state.totalElapsed / state.totalDuration)) : 0;
  const ring = document.getElementById('timer-ring');
  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = `${circumference * (1 - sp)}`;

  // bg color
  if (step) setBg(step.color);
}

function timerTick() {
  if (state.timerState !== 'running') return;
  state.timeRemaining -= 0.1;
  state.totalElapsed += 0.1;
  if (state.timeRemaining < 0) state.timeRemaining = 0;
  updateTimerDisplay();

  // countdown speech
  const sec = Math.ceil(state.timeRemaining);
  const dur = state.currentStepDuration;
  if (sec > 0) {
    if (dur <= 3) { if (sec === 1 && state.lastAnnouncedSecond !== 1) { state.lastAnnouncedSecond = 1; speak(String(sec), 0.6, 1.2); playBeep(600, 0.1); }}
    else if (dur <= 5) { if ((sec === 2 || sec === 1) && state.lastAnnouncedSecond !== sec) { state.lastAnnouncedSecond = sec; speak(String(sec), 0.6, 1.2); playBeep(600, 0.1); }}
    else { if (sec <= 3 && state.lastAnnouncedSecond !== sec) { state.lastAnnouncedSecond = sec; speak(String(sec), 0.6, 1.2); playBeep(600, 0.1); }}
  }
  if (state.timeRemaining <= 0 && state.timerState === 'running') {
    if (!state.didAnnounceComplete) { state.didAnnounceComplete = true; speak('Step complete', 0.5, 1); playBeep(1000, 0.3); }
    moveToNextStep();
  }
}

function moveToNextStep() {
  state.currentStepIndex++;
  if (state.currentStepIndex >= state.flattenedSteps.length) {
    completeRoutine();
    return;
  }
  const step = state.flattenedSteps[state.currentStepIndex];
  state.timeRemaining = step.duration;
  state.currentStepDuration = step.duration;
  state.lastAnnouncedSecond = null;
  state.didAnnounceComplete = false;
  playBeep(900, 0.15); // step change sound
  speak(`Next: ${step.name}`, 0.5, 1);
  updateTimerDisplay();
}

function moveToPrevStep() {
  if (state.currentStepIndex > 0) {
    state.currentStepIndex--;
    const step = state.flattenedSteps[state.currentStepIndex];
    state.timeRemaining = step.duration;
    state.currentStepDuration = step.duration;
    state.lastAnnouncedSecond = null;
    state.didAnnounceComplete = false;
    updateTimerDisplay();
  }
}

function completeRoutine() {
  pauseTimer();
  state.timerState = 'completed';
  stopAudio();
  playBeep(1200, 0.4); playBeep(1500, 0.5);
  speak('Session complete! Great work!', 0.4, 1.1);
  // save completion
  const r = state.selectedRoutine;
  if (r) {
    api('POST', '/api/completions', { routine_name: r.name, total_duration: state.totalDuration }).catch(()=>{});
  }
  showCompletionView();
}

function showCompletionView() {
  const r = state.selectedRoutine;
  document.getElementById('timer-running').style.display = 'none';
  document.getElementById('timer-completed').style.display = 'flex';
  document.getElementById('comp-routine-name').textContent = r ? r.name : '';
  document.getElementById('comp-steps').textContent = state.flattenedSteps.length;
  document.getElementById('comp-duration').textContent = fmtTime(state.totalDuration);
}

function resumeTimer() {
  if (state.timerState === 'completed') return;
  if (state.timerState === 'idle') {
    const step = state.flattenedSteps[state.currentStepIndex];
    state.timeRemaining = step.duration;
    state.currentStepDuration = step.duration;
    speak(`Starting: ${step.name}`, 0.5, 1);
  }
  state.timerState = 'running';
  if (state.timer) clearInterval(state.timer);
  state.timer = setInterval(timerTick, 100);
  updatePlayBtn();
}
function pauseTimer() {
  state.timerState = 'paused';
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
  updatePlayBtn();
}
function togglePlayPause() {
  if (state.timerState === 'running') pauseTimer(); else resumeTimer();
}
function resetTimer() {
  pauseTimer();
  state.timerState = 'idle';
  state.currentStepIndex = 0;
  state.totalElapsed = 0;
  state.lastAnnouncedSecond = null;
  state.didAnnounceComplete = false;
  document.getElementById('timer-running').style.display = 'flex';
  document.getElementById('timer-completed').style.display = 'none';
  setBg(state.settings.background_color);
  updateTimerDisplay();
}
function updatePlayBtn() {
  const btn = document.getElementById('btn-play');
  btn.textContent = state.timerState === 'running' ? '⏸' : '▶';
}

function exitTimer() {
  pauseTimer();
  stopAudio();
  resetTimer();
  setBg(state.settings.background_color);
  goBack();
}

// ---------- Settings ----------
function renderSettings() {
  const s = state.settings;
  document.getElementById('setting-audio').checked = s.is_audio_enabled;
  document.getElementById('setting-voice').checked = s.is_voice_enabled;
  document.getElementById('setting-pro').checked = s.is_pro;
  document.getElementById('vol-val').textContent = Math.round(s.volume * 100) + '%';
  document.getElementById('vol-slider').value = s.volume;

  // color grid
  const cg = document.getElementById('color-grid');
  cg.innerHTML = Object.entries(colorMap).map(([k,v]) => `
    <div class="color-swatch ${s.background_color===k?'active':''}" style="background:${v};" onclick="setBgColor('${k}')"></div>
  `).join('');

  // sound packs
  const sp = document.getElementById('sound-packs');
  const cats = {};
  for (const p of window.soundPacks || []) { (cats[p.category] = cats[p.category]||[]).push(p); }
  sp.innerHTML = Object.entries(cats).map(([cat, packs]) => `
    <div style="margin-bottom:16px;">
      <div style="font-size:0.75rem;font-weight:700;color:var(--text-secondary);margin-bottom:8px;text-transform:uppercase;">${esc(cat)}</div>
      ${packs.map(p=>`
        <div class="item-row" style="margin-bottom:6px;cursor:pointer;${s.selected_sound_pack===p.id?'background:rgba(99,102,241,0.15);border-color:rgba(99,102,241,0.4);':''}" onclick="setSoundPack('${p.id}')">
          <div style="font-size:1.5rem;">${p.emoji}</div>
          <div style="flex:1;"><div style="font-weight:600;">${esc(p.display_name)}</div><div style="font-size:0.8rem;color:var(--text-secondary);">${esc(p.description)}</div></div>
          ${s.selected_sound_pack===p.id?'<span style="color:var(--accent);font-size:1.25rem;">✓</span>':'<button class="btn btn-glass" style="padding:4px 10px;font-size:0.75rem;" onclick="event.stopPropagation();previewPack(\''+p.id+'\')">Preview</button>'}
        </div>
      `).join('')}
    </div>
  `).join('');
}

async function setBgColor(color) {
  state.settings.background_color = color;
  await api('PUT', '/api/settings', state.settings);
  setBg(color); renderSettings();
}
async function toggleAudio() {
  state.settings.is_audio_enabled = document.getElementById('setting-audio').checked;
  await api('PUT', '/api/settings', state.settings);
}
async function toggleVoice() {
  state.settings.is_voice_enabled = document.getElementById('setting-voice').checked;
  await api('PUT', '/api/settings', state.settings);
}
async function setVolume(v) {
  state.settings.volume = parseFloat(v);
  document.getElementById('vol-val').textContent = Math.round(state.settings.volume * 100) + '%';
  await api('PUT', '/api/settings', state.settings);
}
async function togglePro() {
  state.settings.is_pro = document.getElementById('setting-pro').checked;
  await api('PUT', '/api/settings', state.settings);
  render(); showToast(state.settings.is_pro ? 'Pro enabled' : 'Pro disabled');
}
async function setSoundPack(id) {
  state.settings.selected_sound_pack = id;
  await api('PUT', '/api/settings', state.settings);
  renderSettings(); showToast('Sound pack updated');
}
function previewPack(id) {
  playBeep(800 + Math.random()*400, 0.2);
}

// ---------- Analytics ----------
let analyticsRange = 'week';
async function renderAnalytics() {
  const data = await api('GET', '/api/analytics?time_range=' + analyticsRange);
  document.getElementById('ana-sessions').textContent = data.total_sessions;
  document.getElementById('ana-time').textContent = fmtShort(data.total_time);
  document.getElementById('ana-streak').textContent = data.streak + ' days';
  document.getElementById('ana-avg').textContent = fmtShort(data.avg_duration);

  // chart
  const comp = data.completions || [];
  const dayMap = {};
  for (const c of comp) {
    const d = c.completed_at.split('T')[0];
    dayMap[d] = (dayMap[d]||0) + (c.total_duration/60);
  }
  const days = Object.keys(dayMap).sort().slice(-14);
  const maxVal = Math.max(...Object.values(dayMap), 1);
  document.getElementById('chart-bars').innerHTML = days.map(d => `
    <div class="chart-bar" style="height:${(dayMap[d]/maxVal*100)}%" title="${d}: ${Math.round(dayMap[d])}m"></div>
  `).join('');

  document.getElementById('breakdown-list').innerHTML = data.breakdown.map(b => `
    <div class="breakdown-item">
      <span style="font-weight:600;">${esc(b.name)}</span>
      <span style="color:var(--text-secondary);font-size:0.85rem;">${b.count} sessions • ${fmtShort(b.total_time)}</span>
    </div>
  `).join('');
}
function setAnalyticsRange(r) {
  analyticsRange = r;
  document.querySelectorAll('#ana-segments .segment').forEach(s => s.classList.toggle('active', s.dataset.range===r));
  renderAnalytics();
}

// ---------- Modals ----------
function showModal(id) { document.getElementById(id).classList.add('active'); }
function hideModal(id) { document.getElementById(id).classList.remove('active'); }

function openStepModal() {
  document.getElementById('step-name').value = '';
  document.getElementById('step-duration').value = '30';
  document.getElementById('step-color').value = 'blue';
  delete document.getElementById('step-modal').dataset.index;
  showModal('step-modal');
}
function saveStepModal() {
  const name = document.getElementById('step-name').value.trim();
  const dur = parseFloat(document.getElementById('step-duration').value) || 0;
  const color = document.getElementById('step-color').value;
  if (!name || dur <= 0) { showToast('Please enter name and duration'); return; }
  const idx = document.getElementById('step-modal').dataset.index;
  const item = { id: crypto.randomUUID(), type: 'step', name, duration: dur, color };
  if (idx !== undefined) editorItems[+idx] = item; else editorItems.push(item);
  hideModal('step-modal'); renderEditorItems();
}

function openGroupModal() {
  document.getElementById('group-name').value = '';
  document.getElementById('group-loops').value = '2';
  document.getElementById('group-color').value = 'purple';
  document.getElementById('group-substeps').innerHTML = '';
  delete document.getElementById('group-modal').dataset.index;
  showModal('group-modal');
}
function addSubStep() {
  const el = document.getElementById('group-substeps');
  const i = el.children.length;
  const div = document.createElement('div'); div.className = 'item-row'; div.style.marginBottom = '6px';
  div.innerHTML = `<input class="sub-step-name" data-index="${i}" placeholder="Name" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:8px 12px;border-radius:10px;color:#fff;"><input class="sub-step-dur" data-index="${i}" type="number" placeholder="Sec" style="width:70px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:8px 12px;border-radius:10px;color:#fff;"><button class="btn btn-glass btn-icon" style="width:32px;height:32px;font-size:0.8rem;background:rgba(239,68,68,0.2);" onclick="this.parentElement.remove()">🗑</button>`;
  el.appendChild(div);
}
function saveGroupModal() {
  const name = document.getElementById('group-name').value.trim();
  const loops = parseInt(document.getElementById('group-loops').value) || 1;
  const color = document.getElementById('group-color').value;
  const subSteps = [];
  document.querySelectorAll('#group-substeps .item-row').forEach(row => {
    const n = row.querySelector('.sub-step-name').value.trim();
    const d = parseFloat(row.querySelector('.sub-step-dur').value) || 0;
    if (n && d > 0) subSteps.push({ id: crypto.randomUUID(), name: n, duration: d, color: 'blue' });
  });
  if (!name || !subSteps.length) { showToast('Please enter name and at least one sub-step'); return; }
  const total = subSteps.reduce((a,s)=>a+s.duration,0) * loops;
  const idx = document.getElementById('group-modal').dataset.index;
  const item = { id: crypto.randomUUID(), type: 'group', name, duration: total, color, steps: subSteps, loop_count: loops };
  if (idx !== undefined) editorItems[+idx] = item; else editorItems.push(item);
  hideModal('group-modal'); renderEditorItems();
}

// ---------- Init ----------
function esc(s) {
  const d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}

window.addEventListener('DOMContentLoaded', async () => {
  // load sound packs
  try { window.soundPacks = await api('GET', '/api/soundpacks'); } catch { window.soundPacks = []; }
  await loadData();

  // seed if empty
  if (!state.routines.length) {
    try { await api('POST', '/api/seed'); await loadData(); } catch {}
  }

  // event bindings
  document.getElementById('btn-back').onclick = goBack;
  document.getElementById('btn-settings').onclick = () => { renderSettings(); showView('settings'); };
  document.getElementById('btn-analytics').onclick = () => { renderAnalytics(); showView('analytics'); };
  document.getElementById('btn-add-step').onclick = openStepModal;
  document.getElementById('btn-add-group').onclick = openGroupModal;
  document.getElementById('btn-save-step').onclick = saveStepModal;
  document.getElementById('btn-save-group').onclick = saveGroupModal;
  document.getElementById('btn-add-substep').onclick = addSubStep;
  document.getElementById('btn-play').onclick = togglePlayPause;
  document.getElementById('btn-skip-back').onclick = moveToPrevStep;
  document.getElementById('btn-skip-fwd').onclick = moveToNextStep;
  document.getElementById('btn-exit-timer').onclick = exitTimer;
  document.getElementById('btn-restart').onclick = () => { resetTimer(); resumeTimer(); };
  document.getElementById('vol-slider').oninput = e => setVolume(e.target.value);
  document.getElementById('setting-audio').onchange = toggleAudio;
  document.getElementById('setting-voice').onchange = toggleVoice;
  document.getElementById('setting-pro').onchange = togglePro;

  // close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
  });
});
