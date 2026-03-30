const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET semua notes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM notes ORDER BY tanggal_dibuat DESC');
    res.json({ status: true, data: rows });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

// GET note by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ status: false, message: 'Note tidak ditemukan' });
    res.json({ status: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

// POST tambah note
router.post('/', async (req, res) => {
  const { judul, isi } = req.body;
  if (!judul || !isi) return res.status(400).json({ status: false, message: 'Judul dan isi wajib diisi' });
  try {
    const [result] = await db.query('INSERT INTO notes (judul, isi) VALUES (?, ?)', [judul, isi]);
    res.status(201).json({ status: true, message: 'Note berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

// PUT edit note
router.put('/:id', async (req, res) => {
  const { judul, isi } = req.body;
  if (!judul || !isi) return res.status(400).json({ status: false, message: 'Judul dan isi wajib diisi' });
  try {
    const [result] = await db.query('UPDATE notes SET judul = ?, isi = ? WHERE id = ?', [judul, isi, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ status: false, message: 'Note tidak ditemukan' });
    res.json({ status: true, message: 'Note berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

// DELETE note
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM notes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ status: false, message: 'Note tidak ditemukan' });
    res.json({ status: true, message: 'Note berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

module.exports = router;