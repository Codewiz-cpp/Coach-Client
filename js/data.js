/* ================= metric meta (shared across weeks) ================= */
const metricMeta = {
  sleep: { label: "Sleep", unit: "hrs", color: "#2F6F62" },
  water: { label: "Water", unit: "L", color: "#8B9184" },
  steps: { label: "Steps", unit: "", color: "#B5792A" },
  nutrition: { label: "Nutrition adherence", unit: "/5", color: "#665C9E" },
  engagement: { label: "Engagement", unit: "/5", color: "#2F6F62" },
  symptoms: { label: "Symptoms", unit: "present", color: "#AE4A34" }
};
const metricOrder = ["sleep", "water", "steps", "nutrition", "engagement", "symptoms"];
const confBadge = { fact: ['Confirmed fact', 'b-fact'], report: ['Client-reported', 'b-report'], infer: ['AI inference', 'b-infer'], missing: ['Missing data', 'b-missing'] };
const areaOrder = ["nutrition", "exercise", "sleep", "water", "symptoms", "engagement"];
const areaLabels = { nutrition: "Nutrition adherence", exercise: "Exercise / steps", sleep: "Sleep", water: "Water intake", symptoms: "Symptoms / stress", engagement: "Engagement level" };

// true = higher number is the better outcome
const goodDirection = { sleep: true, water: true, steps: true, nutrition: true, engagement: true, symptoms: false };

/* ================= week 1 data (from Day 1 transcript) ================= */
const weekData = {
  1: {
    period: "Day 1 – Day 8 · source: WhatsApp-style chat log",
    overall_status: "attention",
    top_alert: { title: "Top priority — Day 7 fatigue event", body: "Client briefly fell asleep during a work meeting and said she felt she \"could sleep for days.\" This came after several nights of short sleep and a missed accountability call the same day." },
    daily: {
      sleep: [5, null, 5, null, null, null, 5.5, 8],
      water: [null, null, 4, null, null, null, null, 3.5],
      steps: [null, null, 8000, 4500, null, null, 6000, 8000],
      nutrition: [4, 3, 2, 4, 3, 2, 3, 4],
      engagement: [5, 5, 5, 5, 5, 5, 2, 5],
      symptoms: [1, 1, 0, 0, 0, 1, 0, 1]
    },
    insights: {
      sleep: { insight: "Sleep stayed low most of the week, then recovered sharply on Day 8.", sub: "Only 4 of 8 days have an exact figure — the rest were not mentioned.", conf: "fact" },
      water: { insight: "Water intake is the least-tracked metric — only 2 of 8 days have a number.", sub: "Other days just say \"water done\" with no amount.", conf: "missing" },
      steps: { insight: "Steps hover around 6,000–8,000 on days they were logged, dipping mid-week.", sub: "Day 4's 4,500 was a partial-day count, not a full-day total.", conf: "fact" },
      nutrition: { insight: "Adherence dips on the two most hectic days (Day 3 and Day 6) and recovers after.", sub: "A composite score inferred from meal descriptions and coach comments.", conf: "infer" },
      engagement: { insight: "High and self-initiated all week, with a single sharp dip on Day 7.", sub: "The dip lines up exactly with the most stressful day recorded.", conf: "infer" },
      symptoms: { insight: "Acidity or bloating was mentioned on 4 of 8 days, spread across the whole week.", sub: "Not tied to one bad day — looks like a recurring pattern.", conf: "fact" }
    },
    areas: {
      nutrition: { conf: "report", headline: "Moderate — meals stayed simple, but breakfast protein is a recurring gap.", detail: "Coach directly flagged low breakfast protein on Day 5 and Day 6; ACV and sprouts were missed on several days.", evidence: "Day 5 — Coach: \"Protein seems low in breakfast on some days.\" Day 3: \"Forgot ACV today.\"" },
      exercise: { conf: "fact", headline: "Consistent light activity daily — walking, stretching, and household movement.", detail: "No high-intensity training; steps ranged roughly 4,500–8,000 on the days reported.", evidence: "Day 4: \"Did around 20 minutes walking, stretching and breathing today. Feeling really good.\"" },
      sleep: { conf: "fact", headline: "Short sleep most of the week (5–5.5 hrs), recovering to 8 hrs by Day 8.", detail: "The Day 7 fatigue event is the clearest sign sleep debt had built up before recovery.", evidence: "Day 1: \"Slept only around 5 hours last night.\" Day 8: \"Slept better, around 8 hours.\"" },
      water: { conf: "missing", headline: "Mostly unquantified — only 2 of 8 days have an exact number.", detail: "A data-completeness gap rather than a behavior problem.", evidence: "Day 2: \"Walk and water done.\" (no amount) Day 8: \"Water around 3.5 litres.\"" },
      symptoms: { conf: "fact", headline: "Acidity and bloating recurred through the week; one high-stress day on Day 7.", detail: "Mentioned unprompted on four separate days — doesn't look like a one-off.", evidence: "Day 1: \"Feeling some acidity since morning.\" Day 7: \"Feeling very low.\"" },
      engagement: { conf: "infer", headline: "High and self-initiated overall, with one dip on Day 7.", detail: "The dip coincides exactly with the most stressful day recorded.", evidence: "Accountability coach, Day 7: \"Tried calling you. Please update when free.\"" }
    },
    barriers: [
      "Reported — School schedule leaves little time for structured meals or planning.",
      "Reported — Vegetables not kept stocked at home, so salad/veg prep is skipped.",
      "Inference — Protein-rich breakfast habit not yet established.",
      "Reported — Work stress and \"office politics\" affecting sleep and energy."
    ],
    pending_actions: [
      "Stock vegetables for salad prep — client said \"will do it tomorrow,\" not confirmed since.",
      "Set a reminder around meal timing for ACV — agreed Day 3, still inconsistent by Day 5.",
      "Confirm sprouts (ordered Day 5) have arrived and are being used at breakfast.",
      "Adjust overall routine around school schedule — open, ongoing item."
    ],
    risk_flags: [
      { severity: "high", title: "Possible sleep deprivation / burnout signal", evidence: "\"I actually slept for a few seconds\" during a meeting; \"I feel I can sleep for days.\"", conf: "infer" },
      { severity: "medium", title: "Persistent bloating / acidity across the week", evidence: "Acidity Day 1–2; bloating raised again Day 5, 6, 8.", conf: "fact" },
      { severity: "medium", title: "Weight increase despite reduced food intake", evidence: "\"Weight seems slightly up even though I'm eating almost half of what I used to eat.\"", conf: "report" },
      { severity: "medium", title: "Engagement dip during high-stress day", evidence: "Missed check-in call the same day as the fatigue event.", conf: "infer" }
    ],
    recommended_actions: [
      "Open the next check-in on sleep and stress, not nutrition — the Day 7 event is most urgent.",
      "Revisit breakfast protein options (sprouts, chana, moong) given the recurring gap.",
      "Confirm status of the two open items: vegetable stocking and the ACV reminder.",
      "If bloating/acidity persists, consider a dietary or medical review."
    ]
  }
};

// Mutable state — lives here so all modules can reference it
let currentWeek = 1;
let activeMetric = "sleep";
