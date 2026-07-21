/* ================= rendering ================= */
/* Depends on: weekData, currentWeek, activeMetric, metricMeta, metricOrder,
               confBadge, areaOrder, areaLabels, goodDirection  (data.js)
               renderChart  (chart.js)
               fmtValue, avgOf  (chart.js)
               setStatus, startEdit, saveEdit  (actions.js)               */

function renderAll() {
  const w = weekData[currentWeek];
  document.getElementById('pageTitle').textContent = `Client A — Week ${currentWeek} brief`;
  document.getElementById('pagePeriod').textContent = w.period;

  const pill = document.getElementById('statusPill');
  pill.className = 'status-pill ' + (w.overall_status === 'attention' ? 'status-attention' : 'status-ok');
  document.getElementById('statusText').textContent = w.overall_status === 'attention' ? 'Needs attention' : 'On track';

  const alertBox = document.getElementById('alertBox');
  if (w.top_alert) {
    alertBox.style.display = 'flex';
    document.getElementById('alertTitle').textContent = w.top_alert.title;
    document.getElementById('alertBody').textContent = w.top_alert.body;
  } else { alertBox.style.display = 'none'; }

  renderWeekRow();
  renderTabs();
  renderChart();
  renderComparison();
  renderCards();
  renderLists();
  renderFlags();
  renderReco();

  const nextWeekNum = Math.max(...Object.keys(weekData).map(Number)) + 1;
  document.getElementById('uploadHeading').textContent = `Add Week ${nextWeekNum}'s conversation`;
}

function renderComparison() {
  const w = weekData[currentWeek];
  const prevW = weekData[currentWeek - 1];
  const title = document.getElementById('compareTitle');
  const sub = document.getElementById('compareSub');
  const body = document.getElementById('compareBody');

  if (!prevW) {
    title.textContent = "Compared to last week";
    sub.textContent = "";
    body.innerHTML = `<div class="compare-empty">This is the first week on record, so there's nothing to compare yet. Add Week 2's conversation below and it'll show up here alongside this week's numbers.</div>`;
    return;
  }

  title.textContent = `Week ${currentWeek - 1} vs Week ${currentWeek}`;
  sub.textContent = "Last week's average sits on the left of each box, this week's on the right.";

  let html = '<div class="compare-grid">';
  metricOrder.forEach(key => {
    const meta = metricMeta[key];
    const prevAvg = avgOf(prevW.daily[key]);
    const currAvg = avgOf(w.daily[key]);
    let arrow = "→", trendClass = "trend-flat";
    if (prevAvg !== null && currAvg !== null) {
      const diff = currAvg - prevAvg;
      const goodUp = goodDirection[key];
      if (Math.abs(diff) < (meta.unit === "" ? 200 : 0.15)) {
        arrow = "→"; trendClass = "trend-flat";
      } else if (diff > 0) {
        arrow = "↑"; trendClass = goodUp ? "trend-good" : "trend-bad";
      } else {
        arrow = "↓"; trendClass = goodUp ? "trend-bad" : "trend-good";
      }
    }
    html += `<div class="compare-cell">
      <div class="compare-label">${meta.label}</div>
      <div class="compare-vals">
        <span class="compare-prev">${fmtValue(key, prevAvg)}</span>
        <span class="compare-arrow ${trendClass}">${arrow}</span>
        <span class="compare-curr">${fmtValue(key, currAvg)}</span>
      </div>
    </div>`;
  });
  html += '</div>';
  body.innerHTML = html;
}

function renderWeekRow() {
  const row = document.getElementById('weekRow');
  const keys = Object.keys(weekData).map(Number).sort((a, b) => a - b);
  if (keys.length < 2) { row.innerHTML = ""; return; }
  row.innerHTML = "";
  keys.forEach(k => {
    const btn = document.createElement('button');
    btn.className = 'week-btn' + (k === currentWeek ? ' active' : '');
    btn.textContent = 'Week ' + k;
    btn.onclick = () => { currentWeek = k; renderAll(); };
    row.appendChild(btn);
  });
}

function renderTabs() {
  const row = document.getElementById('tabRow');
  row.innerHTML = "";
  metricOrder.forEach(key => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (key === activeMetric ? ' active' : '');
    btn.textContent = metricMeta[key].label;
    btn.onclick = () => { activeMetric = key; renderTabs(); renderChart(); };
    row.appendChild(btn);
  });
}

function renderCards() {
  const w = weekData[currentWeek];
  const grid = document.getElementById('cardGrid');
  grid.innerHTML = "";
  areaOrder.forEach((key, i) => {
    const a = w.areas[key];
    const [label, cls] = confBadge[a.conf];
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <div class="card-head"><h3>${areaLabels[key]}</h3><span class="badge ${cls}">${label}</span></div>
      <div class="headline" id="finding-${i}">${a.headline}</div>
      <div class="detail">${a.detail}</div>
      <div class="quote">${a.evidence}</div>
      <div class="actions" id="actions-${i}">
        <button class="act-btn" onclick="setStatus(${i},'approve')">Approve</button>
        <button class="act-btn" onclick="startEdit(${i})">Edit</button>
        <button class="act-btn" onclick="setStatus(${i},'reject')">Reject</button>
      </div>`;
    grid.appendChild(el);
  });
}

function renderLists() {
  const w = weekData[currentWeek];
  document.getElementById('barrierList').innerHTML = w.barriers.map(b => `<li>${b}</li>`).join("");
  document.getElementById('pendingList').innerHTML = w.pending_actions.map(p => `<li>${p}</li>`).join("");
}

function renderFlags() {
  const w = weekData[currentWeek];
  const grid = document.getElementById('flagGrid');
  grid.innerHTML = "";
  w.risk_flags.forEach(f => {
    const [label, cls] = confBadge[f.conf];
    const el = document.createElement('div');
    el.className = 'card flag-card ' + f.severity;
    el.innerHTML = `
      <div class="flag-sev">${f.severity}</div>
      <h3 style="font-size:16px;margin:4px 0 8px;">${f.title}</h3>
      <div class="quote">${f.evidence}</div>
      <span class="badge ${cls}">${label}</span>`;
    grid.appendChild(el);
  });
}

function renderReco() {
  const w = weekData[currentWeek];
  document.getElementById('recoList').innerHTML = w.recommended_actions.map(r => `<li>${r}</li>`).join("");
}
