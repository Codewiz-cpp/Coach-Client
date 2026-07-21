/* ================= entry point ================= */
/* Depends on: renderAll  (render.js)
               handleAnalyze  (upload.js)           */

// Wire up the file-upload reader
document.getElementById('uploadFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { document.getElementById('uploadText').value = reader.result; };
  reader.onerror = () => { setUploadStatus('Could not read that file.', 'err'); };
  reader.readAsText(file);
});

// Initial render on page load
renderAll();
