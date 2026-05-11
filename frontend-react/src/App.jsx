import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://h-02-488015.et.r.appspot.com/notes';

const cardAccents = ['#6C63FF', '#fd79a8', '#00cec9', '#fdcb6e', '#a29bfe', '#74b9ff', '#55efc4'];

function App() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, judul: '', isi: '' });
  const [deleteTarget, setDeleteTarget] = useState({ id: null, judul: '' });
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load Notes
  const fetchNotes = async () => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (json.status) setNotes(json.data || []);
    } catch (error) {
      showToast('Gagal menghubungi server!', 'error');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Toast Function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Handlers
  const handleOpenModal = (note = null) => {
    if (note) {
      setFormData({ id: note.id, judul: note.judul, isi: note.isi });
    } else {
      setFormData({ id: null, judul: '', isi: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async () => {
    if (!formData.judul.trim() || !formData.isi.trim()) {
      showToast('Judul dan isi tidak boleh kosong!', 'warning');
      return;
    }

    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `${API_URL}/${formData.id}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judul: formData.judul, isi: formData.isi })
      });
      const json = await res.json();
      
      if (json.status) {
        showToast(formData.id ? 'Catatan berhasil diperbarui! ✨' : 'Catatan berhasil disimpan! 🎉');
        handleCloseModal();
        fetchNotes();
      } else {
        showToast(json.message, 'error');
      }
    } catch (error) {
      showToast('Gagal menyimpan catatan', 'error');
    }
  };

  const handleOpenDelete = (note) => {
    setDeleteTarget(note);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.status) {
        showToast('Catatan dihapus 🗑️');
        setIsDeleteModalOpen(false);
        fetchNotes();
      }
    } catch (error) {
      showToast('Gagal menghapus catatan', 'error');
    }
  };

  // Derived state calculations
  const totalNotes = notes.length;
  const todayNotes = notes.filter(n => new Date(n.tanggal_dibuat).toDateString() === new Date().toDateString()).length;
  const filteredNotes = notes.filter(n =>
    n.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.isi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="app-container">
        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <div className="logo">
              <span className="logo-icon">📓</span>
              <span className="logo-text">NoteSpace</span>
            </div>
            <p className="tagline">Ruang untuk pikiran-pikiranmu</p>
          </div>
          <button className="btn-new" onClick={() => handleOpenModal()}>
            <span>+</span> Catatan Baru
          </button>
        </header>

        {/* STATS BAR */}
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-num">{totalNotes}</span>
            <span className="stat-label">Total Catatan</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-num">{todayNotes}</span>
            <span className="stat-label">Hari Ini</span>
          </div>
        </div>

        {/* SEARCH */}
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Cari catatan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        {/* NOTES GRID */}
        <div className="notes-grid">
          {filteredNotes.map((note, index) => {
            const dateObj = new Date(note.tanggal_dibuat);
            const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const accent = cardAccents[index % cardAccents.length];

            return (
              <div key={note.id} className="note-card" style={{ '--card-accent': accent }}>
                <div className="card-top">
                  <h3 className="note-title">{note.judul}</h3>
                  <div className="card-actions">
                    <button className="btn-icon btn-edit" onClick={() => handleOpenModal(note)} title="Edit">✏️</button>
                    <button className="btn-icon btn-del" onClick={() => handleOpenDelete(note)} title="Hapus">🗑️</button>
                  </div>
                </div>
                <p className="note-body">{note.isi}</p>
                <div className="note-date">🕐 {dateStr}, {timeStr}</div>
              </div>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {filteredNotes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🌿</div>
            <h3>Belum ada catatan</h3>
            <p>Mulai tulis sesuatu yang bermakna hari ini</p>
            <button className="btn-new" onClick={() => handleOpenModal()}>Buat Catatan Pertama</button>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH/EDIT */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`} onClick={(e) => e.target.className.includes('modal-overlay') && handleCloseModal()}>
        <div className="modal">
          <div className="modal-header">
            <h2>{formData.id ? 'Edit Catatan' : 'Catatan Baru'}</h2>
            <button className="modal-close" onClick={handleCloseModal}>✕</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Judul</label>
              <input 
                type="text" 
                placeholder="Tulis judul catatan..." 
                maxLength="100"
                value={formData.judul}
                onChange={(e) => setFormData({...formData, judul: e.target.value})}
              />
              <span className="char-count">{formData.judul.length}/100</span>
            </div>
            <div className="form-group">
              <label>Isi Catatan</label>
              <textarea 
                placeholder="Tuangkan pikiranmu di sini..." 
                rows="6"
                value={formData.isi}
                onChange={(e) => setFormData({...formData, isi: e.target.value})}
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={handleCloseModal}>Batal</button>
            <button className="btn-save" onClick={handleSave}>
              <span>{formData.id ? '✏️' : '💾'}</span> Simpan
            </button>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRM MODAL */}
      <div className={`modal-overlay ${isDeleteModalOpen ? 'active' : ''}`}>
        <div className="modal modal-sm">
          <div className="modal-header">
            <h2>Hapus Catatan?</h2>
          </div>
          <div className="modal-body">
            <p>Catatan "<strong>{deleteTarget.judul}</strong>" akan dihapus permanen. Lanjutkan?</p>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Batal</button>
            <button className="btn-delete-confirm" onClick={handleConfirmDelete}>Ya, Hapus</button>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>
    </>
  );
}

export default App;