/* ================= approve / edit / reject logic ================= */

/**
 * setStatus — highlights the active action button and optionally strikes through the finding.
 * @param {number} i      - card index (matches finding-{i} and actions-{i} IDs)
 * @param {string} status - 'approve' | 'reject'
 */
function setStatus(i, status) {
  const finding = document.getElementById('finding-' + i);
  const actionsBox = document.getElementById('actions-' + i);
  const btns = actionsBox.querySelectorAll('.act-btn');
  btns.forEach(b => b.classList.remove('active-approve', 'active-reject'));
  finding.classList.remove('rejected');
  if (status === 'approve') { btns[0].classList.add('active-approve'); }
  else if (status === 'reject') { btns[2].classList.add('active-reject'); finding.classList.add('rejected'); }
}

/**
 * startEdit — replaces the headline div with an inline textarea + Save button.
 * @param {number} i - card index
 */
function startEdit(i) {
  const finding = document.getElementById('finding-' + i);
  const current = finding.textContent;
  finding.innerHTML = `<textarea class="edit-box" id="edit-${i}">${current}</textarea><button class="act-btn" style="margin-top:2px;" onclick="saveEdit(${i})">Save</button>`;
}

/**
 * saveEdit — commits the edited text and auto-approves the finding.
 * @param {number} i - card index
 */
function saveEdit(i) {
  const val = document.getElementById('edit-' + i).value;
  document.getElementById('finding-' + i).innerHTML = val;
  setStatus(i, 'approve');
}
