/* ================= chart rendering via Chart.js ================= */
/* Depends on: Chart.js + chartjs-plugin-datalabels (CDN, loaded before this file)
               weekData, currentWeek, activeMetric,
               metricMeta, confBadge  (data.js)              */

// Holds the Chart.js instance so we can destroy/recreate on tab/week switch
let chartInstance = null;

/* ------------------------------------------------------------------
   fmtValue — formats a raw metric value for display
   (also used by render.js for the comparison strip)
   ------------------------------------------------------------------ */
function fmtValue(key, v) {
  if (v === null || v === undefined) return "—";
  if (key === "steps")      return Math.round(v).toLocaleString();
  if (key === "water")      return v.toFixed(1) + " L";
  if (key === "sleep")      return v.toFixed(1) + " hrs";
  if (key === "nutrition" || key === "engagement") return v.toFixed(1) + "/5";
  if (key === "symptoms")   return Math.round(v * 100) + "% of days";
  return v;
}

/* ------------------------------------------------------------------
   avgOf — returns mean of non-null values in an array
   (also used by render.js for the comparison strip)
   ------------------------------------------------------------------ */
function avgOf(arr) {
  const vals = arr.filter(v => v !== null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/* ------------------------------------------------------------------
   hexToRgba — converts a #rrggbb hex string to rgba(r,g,b,a)
   ------------------------------------------------------------------ */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ------------------------------------------------------------------
   renderChart — builds / rebuilds the Chart.js line chart.
   Called by renderAll() whenever the week or active metric changes.

   Key data-representation choices that match the original SVG:
   • spanGaps: true  → real values are always connected (never orphaned)
   • segment.borderDash  → segments crossing a null day get a dashed stroke
   • pointRadius per-point  → only real (non-null) days get a visible dot
   • datalabels plugin  → floating value label above each real data point
   ------------------------------------------------------------------ */
function renderChart() {
  const w    = weekData[currentWeek];
  const prevW = weekData[currentWeek - 1];
  const meta  = metricMeta[activeMetric];
  const ins   = w.insights[activeMetric];

  // ── insight text ──────────────────────────────────────────────
  document.getElementById('chartInsight').innerHTML =
    ins.insight +
    ` <span class="badge ${confBadge[ins.conf][1]} chart-conf">${confBadge[ins.conf][0]}</span>`;
  document.getElementById('chartSub').textContent = ins.sub;

  // ── previous-week legend ──────────────────────────────────────
  const fadeLegend = document.getElementById('fadeLegend');
  if (prevW) {
    fadeLegend.style.display = 'block';
    fadeLegend.innerHTML =
      `<span class="dash"></span>Week ${currentWeek - 1}` +
      `<span class="solid"></span>Week ${currentWeek}`;
  } else {
    fadeLegend.style.display = 'none';
  }

  // ── raw data arrays ───────────────────────────────────────────
  const curr  = w.daily[activeMetric];
  const prev  = prevW ? prevW.daily[activeMetric] : null;
  const nDays = Math.max(curr.length, prev ? prev.length : 0);
  const labels = Array.from({ length: nDays }, (_, i) => `D${i + 1}`);

  // ── destroy old chart instance ────────────────────────────────
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const canvas = document.getElementById('chartCanvas');
  const ctx    = canvas.getContext('2d');

  // Gradient fill beneath the current-week line
  const gradient = ctx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, hexToRgba(meta.color, 0.2));
  gradient.addColorStop(1, hexToRgba(meta.color, 0.0));

  const datasets = [];

  // ── Previous week overlay ─────────────────────────────────────
  // spanGaps: true so isolated prev-week points also connect.
  // The entire series is already faded + dashed, so no per-segment logic needed.
  if (prev) {
    datasets.push({
      label: `Week ${currentWeek - 1}`,
      data: prev,
      borderColor: hexToRgba(meta.color, 0.3),
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderDash: [6, 4],
      spanGaps: true,
      tension: 0.35,
      fill: false,
      // Per-point: show dot only where data exists
      pointBackgroundColor: prev.map(v => v !== null ? hexToRgba(meta.color, 0.4) : 'transparent'),
      pointBorderColor: 'transparent',
      pointRadius: prev.map(v => v !== null ? 3 : 0),
      pointHoverRadius: prev.map(v => v !== null ? 5 : 0),
      // No floating labels on the faded overlay
      datalabels: { display: false },
    });
  }

  // ── Current week ──────────────────────────────────────────────
  // spanGaps: true keeps all real data points connected.
  // The segment callback dashes any line segment that crosses a missing day,
  // faithfully replicating the original SVG's "dashed-across-gap" visual.
  datasets.push({
    label: `Week ${currentWeek}`,
    data: curr,
    borderColor: meta.color,
    backgroundColor: gradient,
    borderWidth: 2.5,
    spanGaps: true,
    tension: 0.35,
    fill: true,
    // Per-point: real values get a solid dot; null positions get radius 0 (invisible)
    pointBackgroundColor: curr.map(v => v !== null ? meta.color : 'transparent'),
    pointBorderColor:     curr.map(v => v !== null ? '#FAF7F1' : 'transparent'),
    pointBorderWidth: 2,
    pointRadius:      curr.map(v => v !== null ? 5 : 0),
    pointHoverRadius: curr.map(v => v !== null ? 8 : 0),
    // Dash any segment that bridges one or more null days
    segment: {
      borderDash: (ctx) => {
        const start = ctx.p0DataIndex;
        const end   = ctx.p1DataIndex;
        for (let i = start + 1; i < end; i++) {
          if (curr[i] === null || curr[i] === undefined) return [6, 4];
        }
        return undefined; // consecutive real values → solid
      },
    },
    // Floating value labels above each real data point
    datalabels: {
      display: (ctx) => {
        const v = curr[ctx.dataIndex];
        return v !== null && v !== undefined;
      },
      align: 'top',
      anchor: 'end',
      offset: 5,
      color: meta.color,
      font: {
        family: "'Helvetica Neue', Helvetica, sans-serif",
        size: 11,
        weight: '600',
      },
      formatter: (v) => fmtValue(activeMetric, v),
    },
  });

  // ── Chart.js instance ─────────────────────────────────────────
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      animation: { duration: 350, easing: 'easeInOutQuart' },

      // Extra top padding so datalabels above the highest point aren't clipped
      layout: { padding: { top: 28, right: 8 } },

      plugins: {
        legend: { display: false },

        // chartjs-plugin-datalabels global defaults
        // (each dataset overrides via dataset.datalabels above)
        datalabels: {
          display: false, // off by default; datasets opt in
        },

        tooltip: {
          backgroundColor: '#1A2118',
          titleColor: '#FAF7F1',
          bodyColor: '#8B9184',
          borderColor: meta.color,
          borderWidth: 1,
          padding: 14,
          cornerRadius: 10,
          titleFont: {
            family: "'Helvetica Neue', Helvetica, sans-serif",
            size: 13,
            weight: '600',
          },
          bodyFont: {
            family: "'Helvetica Neue', Helvetica, sans-serif",
            size: 13,
          },
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw;
              if (v === null || v === undefined) return `  ${ctx.dataset.label}: —`;
              return `  ${ctx.dataset.label}: ${fmtValue(activeMetric, v)}`;
            },
          },
        },
      },

      scales: {
        x: {
          grid: { color: '#E6E0D360', drawBorder: false },
          border: { display: false },
          ticks: {
            font: {
              family: "'Helvetica Neue', Helvetica, sans-serif",
              size: 12,
              weight: '500',
            },
            color: '#8B9184',
            maxRotation: 0,
          },
        },

        y: {
          grid: { color: '#E6E0D360', drawBorder: false },
          border: { display: false },
          ticks: {
            font: {
              family: "'Helvetica Neue', Helvetica, sans-serif",
              size: 12,
              weight: '500',
            },
            color: '#8B9184',
            callback: (v) => fmtValue(activeMetric, v),
          },
        },
      },
    },
  });
}
