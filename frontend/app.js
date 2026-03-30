const API = 'http://localhost:3000/notes';
let allNotes = [];
let deleteTargetId = null;
let deleteTargetName = '';

// Warna untuk kartu
const cardAccents = [
  '#6C63FF', '#fd79a8', '#00cec9', '#fdcb6e', '#a29bfe', '#74b9ff', '#55efc4'
];

// ================= LOAD & RENDER =================
async function loadNotes() {
  try {
    const res = await fetch(API);
    const json = await res.json();
    allNotes = json.data || [];
    renderNotes(allNotes);
    updateStats(allNotes);
  } catch (e) {
    showToast('Gagal menghubungi server!', 'error');
  }
}

function renderNotes(notes) {
  const grid = document.getElementById('notesGrid');
  const empty = document.getElementById('emptyState');
  grid.innerHTML = '';

  if (notes.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  notes.forEach((note, i) => {
    const accent = cardAccents[i % cardAccents.length];
    const date = new Date(note.tanggal_dibuat);
    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const card = document.createElement('div');
    card.className = 'note-card';
    card.style.setProperty('--card-accent', accent);
    card.innerHTML = `
      <div class="card-top">
        <h3 class="note-title">${escapeHtml(note.judul)}</h3>
        <div class="card-actions">
          <button class="btn-icon btn-edit" onclick="openEditModal(${note.id})" title="Edit">✏️</button>
          <button class="btn-icon btn-del" onclick="openDeleteModal(${note.id}, '${escapeHtml(note.judul)}')" title="Hapus">🗑️</button>
        </div>
      </div>
      <p class="note-body">${escapeHtml(note.isi)}</p>
      <div class="note-date">🕐 ${dateStr}, ${timeStr}</div>
    `;
    grid.appendChild(card);
  });
}

function updateStats(notes) {
  document.getElementById('totalNotes').textContent = notes.length;
  const today = new Date().toDateString();
  const todayCount = notes.filter(n => new Date(n.tanggal_dibuat).toDateString() === today).length;
  document.getElementById('todayNotes').textContent = todayCount;
}

// ================= SEARCH =================
function filterNotes() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allNotes.filter(n =>
    n.judul.toLowerCase().includes(q) || n.isi.toLowerCase().includes(q)
  );
  renderNotes(filtered);
}

// ================= MODAL =================
function openModal() {
  document.getElementById('modalTitle').textContent = 'Catatan Baru';
  document.getElementById('noteId').value = '';
  document.getElementById('inputJudul').value = '';
  document.getElementById('inputIsi').value = '';
  document.getElementById('judulCount').textContent = '0/100';
  document.getElementById('saveIcon').textContent = '💾';
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('inputJudul').focus();
}

async function openEditModal(id) {
  try {
    const res = await fetch(`${API}/${id}`);
    const json = await res.json();
    const note = json.data;
    document.getElementById('modalTitle').textContent = 'Edit Catatan';
    document.getElementById('noteId').value = note.id;
    document.getElementById('inputJudul').value = note.judul;
    document.getElementById('inputIsi').value = note.isi;
    document.getElementById('judulCount').textContent = `${note.judul.length}/100`;
    document.getElementById('saveIcon').textContent = '✏️';
    document.getElementById('modalOverlay').classList.add('active');
  } catch (e) {
    showToast('Gagal memuat data catatan', 'error');
  }
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

// Char counter
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('inputJudul').addEventListener('input', function() {
    document.getElementById('judulCount').textContent = `${this.value.length}/100`;
  });
  loadNotes();
});

// ================= SAVE =================
async function saveNote() {
  const id = document.getElementById('noteId').value;
  const judul = document.getElementById('inputJudul').value.trim();
  const isi = document.getElementById('inputIsi').value.trim();

  if (!judul || !isi) {
    showToast('Judul dan isi tidak boleh kosong!', 'warning');
    return;
  }

  const body = JSON.stringify({ judul, isi });
  const headers = { 'Content-Type': 'application/json' };

  try {
    let res;
    if (id) {
      res = await fetch(`${API}/${id}`, { method: 'PUT', headers, body });
    } else {
      res = await fetch(API, { method: 'POST', headers, body });
    }
    const json = await res.json();
    if (json.status) {
      showToast(id ? 'Catatan berhasil diperbarui! ✨' : 'Catatan berhasil disimpan! 🎉');
      closeModal();
      loadNotes();
    } else {
      showToast(json.message, 'error');
    }
  } catch (e) {
    showToast('Gagal menyimpan catatan', 'error');
  }
}

// ================= DELETE =================
function openDeleteModal(id, name) {
  deleteTargetId = id;
  deleteTargetName = name;
  document.getElementById('deleteNoteName').textContent = name;
  document.getElementById('deleteOverlay').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteOverlay').classList.remove('active');
  deleteTargetId = null;
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  try {
    const res = await fetch(`${API}/${deleteTargetId}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.status) {
      showToast('Catatan dihapus 🗑️');
      closeDeleteModal();
      loadNotes();
    } else {
      showToast(json.message, 'error');
    }
  } catch (e) {
    showToast('Gagal menghapus catatan', 'error');
  }
}

// ================= TOAST =================
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ================= UTILS =================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}