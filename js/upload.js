/* ================= upload + Claude API analysis ================= */
/* Depends on: weekData, currentWeek  (data.js)
               renderAll  (render.js)                             */

const ANALYSIS_PROMPT = `You are extracting structured client-intelligence from a client-coach coaching chat log, one week at a time.
Return ONLY valid JSON, no preamble, no markdown fences, matching exactly this shape:
{
 "period":"short description of the days covered, e.g. 'Day 1 - Day 7'",
 "overall_status":"attention" or "ok",
 "top_alert": {"title":"<=8 words","body":"<=30 words"} or null if nothing urgent,
 "daily": {"sleep":[hours or null per day],"water":[litres or null per day],"steps":[count or null per day],"nutrition":[1-5 adherence score inferred per day],"engagement":[1-5 score inferred per day],"symptoms":[0 or 1 per day]},
 "insights": { for each of sleep,water,steps,nutrition,engagement,symptoms: {"insight":"<=20 words plain takeaway","sub":"<=20 words caveat or detail","conf":"fact"|"report"|"infer"|"missing"} },
 "areas": { for each of nutrition,exercise,sleep,water,symptoms,engagement: {"conf":"fact"|"report"|"infer"|"missing","headline":"<=16 words","detail":"<=22 words","evidence":"<=20 words, paraphrased not quoted verbatim"} },
 "barriers": ["<=15 words" ... up to 4],
 "pending_actions": ["<=15 words" ... up to 4],
 "risk_flags": [{"severity":"high"|"medium","title":"<=8 words","evidence":"<=18 words","conf":"fact"|"report"|"infer"|"missing"} ... up to 4],
 "recommended_actions": ["<=15 words" ... up to 4]
}
Use "fact" only for things stated as concrete numbers/events. Use "report" for subjective client statements. Use "infer" only when you are connecting things the client did not state directly. Use "missing" when a metric was not mentioned enough days to know. All arrays for "daily" must have the same length, one entry per day found in the conversation, in chronological order, using null for days that metric wasn't mentioned. Do not include any text outside the JSON object.`;

function setUploadStatus(msg, cls) {
  const box = document.getElementById('uploadStatus');
  box.textContent = msg;
  box.className = 'upload-status' + (cls ? ' ' + cls : '');
}

async function handleAnalyze() {
  const text = document.getElementById('uploadText').value.trim();
  if (!text) { setUploadStatus('Paste or upload a conversation first.', 'err'); return; }
  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  setUploadStatus("Analyzing this week's conversation...", '');

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          { role: "user", content: ANALYSIS_PROMPT + "\n\nCONVERSATION:\n" + text }
        ]
      })
    });
    const data = await response.json();
    const textBlocks = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    const clean = textBlocks.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    const nextWeekNum = Math.max(...Object.keys(weekData).map(Number)) + 1;
    weekData[nextWeekNum] = parsed;
    currentWeek = nextWeekNum;
    document.getElementById('uploadText').value = "";
    document.getElementById('uploadFile').value = "";
    setUploadStatus(`Week ${nextWeekNum} added and compared against Week ${nextWeekNum - 1}.`, 'ok');
    renderAll();
    document.querySelector('.compare-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    console.error(err);
    setUploadStatus('Could not analyze that conversation. Please try again.', 'err');
  } finally {
    btn.disabled = false;
  }
}
