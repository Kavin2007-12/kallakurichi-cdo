const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const syncAllToMySQL = require('./database/syncMySQL');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiters for Security
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { authenticated: false, error: 'Too many login attempts. Please try again after 15 minutes.' }
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit password reset requests to 5 per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password reset requests. Please try again after 15 minutes.' }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support base64 image uploads

// Helper to format JS dates into universally valid MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
const toMySQLDateTime = (d) => {
  try {
    const date = d ? new Date(d) : new Date();
    if (isNaN(date.getTime())) {
      const now = new Date();
      return now.toISOString().slice(0, 19).replace('T', ' ');
    }
    return date.toISOString().slice(0, 19).replace('T', ' ');
  } catch (e) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
};

// Serve physical static image uploads with permissive CORS for client-side canvas export
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Helper to permanently delete a physical file from the uploads folder
const deletePhysicalFile = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') return;
  try {
    let cleanUrl = fileUrl.split('?')[0].split('#')[0];
    const match = cleanUrl.match(/uploads\/[a-zA-Z0-9_\-\/.]+/);
    if (match) {
      const fullPath = path.join(__dirname, match[0]);
      if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isFile()) {
        fs.unlinkSync(fullPath);
        console.log(`[FILE DELETED] Permanently removed file: ${fullPath}`);
      }
    }
  } catch (err) {
    console.warn(`[FILE DELETE ERROR]: ${err.message}`);
  }
};

// Helper to ensure ONLY the latest image exists in uploads/about
const cleanAboutDirectoryExcept = (keepFilename = '') => {
  try {
    const aboutDir = path.join(__dirname, 'uploads', 'about');
    if (fs.existsSync(aboutDir)) {
      const files = fs.readdirSync(aboutDir);
      for (const file of files) {
        if (file !== keepFilename && !file.startsWith('.')) {
          const filePath = path.join(aboutDir, file);
          if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
            console.log(`[ABOUT DIR CLEANED] Removed old file: ${filePath}`);
          }
        }
      }
    }
  } catch (e) {
    console.warn(`[ABOUT DIR CLEAN ERROR]: ${e.message}`);
  }
};

// Helper to scan all uploads subdirectories and permanently delete any image files NOT referenced in active database tables
const cleanUnusedPhysicalFiles = async () => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) return;

    const activeImageUrls = new Set();

    try {
      const [mla] = await db.query('SELECT photo FROM mla_data');
      (mla || []).forEach(r => r && r.photo && activeImageUrls.add(r.photo.split('?')[0]));
    } catch (e) {}

    try {
      const [updates] = await db.query('SELECT image FROM daily_updates');
      (updates || []).forEach(r => r && r.image && activeImageUrls.add(r.image.split('?')[0]));
    } catch (e) {}

    try {
      const [hero] = await db.query('SELECT desktop, mobile FROM hero_slides');
      (hero || []).forEach(r => {
        if (r && r.desktop) activeImageUrls.add(r.desktop.split('?')[0]);
        if (r && r.mobile) activeImageUrls.add(r.mobile.split('?')[0]);
      });
    } catch (e) {}

    try {
      const [news] = await db.query('SELECT image FROM live_news');
      (news || []).forEach(r => r && r.image && activeImageUrls.add(r.image.split('?')[0]));
    } catch (e) {}

    try {
      const [vSlides] = await db.query('SELECT desktop, mobile FROM volunteer_slides');
      (vSlides || []).forEach(r => {
        if (r && r.desktop) activeImageUrls.add(r.desktop.split('?')[0]);
        if (r && r.mobile) activeImageUrls.add(r.mobile.split('?')[0]);
      });
    } catch (e) {}

    try {
      const [vols] = await db.query('SELECT image FROM volunteers');
      (vols || []).forEach(r => r && r.image && activeImageUrls.add(r.image.split('?')[0]));
    } catch (e) {}

    try {
      const [vPhotos] = await db.query('SELECT image FROM volunteer_photos');
      (vPhotos || []).forEach(r => r && r.image && activeImageUrls.add(r.image.split('?')[0]));
    } catch (e) {}

    try {
      const [grvs] = await db.query('SELECT image FROM grievances');
      (grvs || []).forEach(r => r && r.image && activeImageUrls.add(r.image.split('?')[0]));
    } catch (e) {}

    const subdirs = fs.readdirSync(uploadsDir);
    for (const subdir of subdirs) {
      const dirPath = path.join(uploadsDir, subdir);
      if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          if (file.startsWith('.')) continue;
          const relativeUrl = `/uploads/${subdir}/${file}`;
          if (!activeImageUrls.has(relativeUrl)) {
            const filePath = path.join(dirPath, file);
            if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
              try {
                fs.unlinkSync(filePath);
                console.log(`[STORAGE PURGED] Removed unreferenced physical image: ${filePath}`);
              } catch (e) {}
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[STORAGE PURGE NOTICE]:', err.message);
  }
};

// SEO Prefix Generator by category
const getSeoPrefix = (category, customPrefix = '') => {
  if (category === 'updates') {
    return 'tvk-works-kallakurichi-mla-arul-vignesh';
  }
  if (category === 'news') {
    return 'tvk-news-kallakurichi-mla-arul-vignesh';
  }
  if (category === 'about') {
    return 'mr-c-arul-vignesh-mla-kallakurichi';
  }
  if (category === 'banners') {
    return 'tvk-banner-kallakurichi-mla-arul-vignesh';
  }
  if (category === 'volunteer_photos') {
    return 'tvk-fieldwork-kallakurichi-mla-arul-vignesh';
  }
  if (category === 'volunteers') {
    return 'tvk-volunteer-kallakurichi-mla-arul-vignesh';
  }
  if (customPrefix && customPrefix !== 'misc' && customPrefix !== category && customPrefix !== 'work_update') {
    return customPrefix.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  return 'tvk-works-kallakurichi';
};

// Helper to save Base64 data string to categorized uploads directory with SEO naming
const saveBase64Image = (dataString, category = 'misc', prefix = '') => {
  if (!dataString || typeof dataString !== 'string' || !dataString.startsWith('data:image')) {
    return dataString; // Return as is if already a URL or empty
  }

  try {
    const matches = dataString.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return dataString;
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : (matches[1] || 'png').split('+')[0];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const validCategories = ['banners', 'about', 'updates', 'news', 'volunteers', 'volunteer_photos', 'grievances'];
    const targetCategory = validCategories.includes(category) ? category : 'misc';
    const targetDir = path.join(__dirname, 'uploads', targetCategory);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const seoPrefix = getSeoPrefix(targetCategory, prefix);
    const filename = `${seoPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${ext}`;
    const filePath = path.join(targetDir, filename);

    fs.writeFileSync(filePath, buffer);
    console.log(`[FILE SAVED] Created file at: ${filePath}`);
    return `/uploads/${targetCategory}/${filename}`;
  } catch (err) {
    console.error('[IMAGE SAVE ERROR]:', err.message);
    return dataString;
  }
};

// Test Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CDO Constituency Digital Office API is running.' });
});

// ==========================================
// DEDICATED IMAGE UPLOAD ENDPOINT
// ==========================================
app.post('/api/upload/:category', (req, res) => {
  try {
    const { category } = req.params;
    const { image, filename: customPrefix } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const savedUrl = saveBase64Image(image, category, customPrefix || category);
    res.json({ url: savedUrl, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 1. MLA DATA ENDPOINTS
// ==========================================
app.get('/api/mla-data', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM mla_data LIMIT 1');
    if (rows && rows.length > 0) {
      return res.json(rows[0]);
    }
    res.json(null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/mla-data', async (req, res) => {
  try {
    const {
      name, photo, suffix, constituency,
      bio, bioP1, bioP2
    } = req.body;

    let savedPhoto = '';
    if (photo && photo.startsWith('data:image')) {
      savedPhoto = saveBase64Image(photo, 'about', 'mr_c_arul_vignesh_mla_kallakurichi');
      const filename = path.basename(savedPhoto);
      // Clean up all other old files from uploads/about folder so ONLY the new image remains
      cleanAboutDirectoryExcept(filename);
    } else if (photo && typeof photo === 'string' && photo.trim() !== '') {
      savedPhoto = photo.trim();
      const filename = path.basename(savedPhoto);
      cleanAboutDirectoryExcept(filename);
    } else {
      // If photo was cleared/removed: remove all files from uploads/about folder
      cleanAboutDirectoryExcept('');
      savedPhoto = '';
    }

    const fullBio = bio !== undefined ? bio : [bioP1, bioP2].filter(Boolean).join('\n\n');

    const [existing] = await db.query('SELECT id FROM mla_data WHERE id = 1');
    if (existing && existing.length > 0) {
      await db.query(
        `UPDATE mla_data SET name=?, photo=?, suffix=?, constituency=?, bio=? WHERE id = 1`,
        [name || '', savedPhoto || '', suffix || '', constituency || '', fullBio || '']
      );
    } else {
      await db.query(
        `INSERT INTO mla_data (id, name, photo, suffix, constituency, bio) VALUES (1, ?, ?, ?, ?, ?)`,
        [name || '', savedPhoto || '', suffix || '', constituency || '', fullBio || '']
      );
    }

    const updated = {
      id: 1,
      name: name || '',
      photo: savedPhoto || '',
      suffix: suffix || '',
      constituency: constituency || '',
      bio: fullBio || ''
    };

    res.json({ message: 'MLA data updated successfully', photo: savedPhoto, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. DAILY UPDATES ENDPOINTS
// ==========================================
app.get('/api/daily-updates', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM daily_updates ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/daily-updates', async (req, res) => {
  try {
    const { title, description, category, location, date, image, status, hasBadge, isBefore } = req.body;
    const savedImage = saveBase64Image(image, 'updates', 'work_update');
    const [result] = await db.query(
      `INSERT INTO daily_updates (title, description, category, location, date, image, status, hasBadge, isBefore) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, location, date, savedImage, status || 'DONE', hasBadge !== false, isBefore || false]
    );
    res.json({ id: result.insertId, image: savedImage, message: 'Daily update created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/daily-updates', async (req, res) => {
  try {
    const updates = Array.isArray(req.body) ? req.body : [];
    const [existingRows] = await db.query('SELECT image FROM daily_updates');
    const oldImages = existingRows ? existingRows.map(r => r.image).filter(Boolean) : [];

    const newImageSet = new Set();
    const processedItems = [];
    for (const update of updates) {
      const savedImage = saveBase64Image(update.image, 'updates', 'work_update');
      if (savedImage) newImageSet.add(savedImage);
      processedItems.push({ ...update, image: savedImage });
    }

    // Automatically clean up deleted physical files from disk
    for (const oldImg of oldImages) {
      if (oldImg && !newImageSet.has(oldImg) && oldImg.startsWith('/uploads/')) {
        deletePhysicalFile(oldImg);
      }
    }

    await db.query('DELETE FROM daily_updates');
    for (const update of processedItems) {
      await db.query(
        `INSERT INTO daily_updates (id, title, description, category, location, date, image, status, hasBadge, isBefore) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [update.id, update.title, update.description, update.category, update.location, update.date, update.image, update.status, update.hasBadge, update.isBefore]
      );
    }
    res.json({ message: 'Daily updates updated successfully and deleted files cleaned up' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/daily-updates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, location, date, image, status } = req.body;
    
    // Fetch existing image to delete if replaced
    const [existingRows] = await db.query('SELECT image FROM daily_updates WHERE id = ?', [id]);
    let savedImage = image;
    if (image && image.startsWith('data:image')) {
      if (existingRows && existingRows.length > 0 && existingRows[0].image && existingRows[0].image.startsWith('/uploads/')) {
        deletePhysicalFile(existingRows[0].image);
      }
      savedImage = saveBase64Image(image, 'updates', 'work_update');
    }

    await db.query(
      `UPDATE daily_updates 
       SET title = ?, description = ?, category = ?, location = ?, date = ?, image = ?, status = ? 
       WHERE id = ?`,
      [title, description, category, location, date, savedImage, status || 'DONE', id]
    );

    res.json({
      message: 'Daily work update updated successfully',
      data: { id: Number(id) || id, title, description, category, location, date, image: savedImage, status: status || 'DONE' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/daily-updates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT image FROM daily_updates WHERE id = ?', [id]);
    if (rows && rows.length > 0 && rows[0].image && rows[0].image.startsWith('/uploads/')) {
      deletePhysicalFile(rows[0].image);
    }
    await db.query('DELETE FROM daily_updates WHERE id = ?', [id]);
    res.json({ message: 'Daily update deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. EVENTS ENDPOINTS
// ==========================================
app.get('/api/events', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { title, description, date, time, venue, attendees, category } = req.body;
    const [result] = await db.query(
      `INSERT INTO events (title, description, date, time, venue, attendees, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, date, time, venue, attendees || 0, category || 'Meeting']
    );
    res.json({ id: result.insertId, message: 'Event created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events', async (req, res) => {
  try {
    // Bulk overwrite (used by sync/admin saves)
    const events = req.body;
    await db.query('DELETE FROM events');
    for (const ev of events) {
      await db.query(
        `INSERT INTO events (id, title, description, date, time, venue, attendees, category) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [ev.id, ev.title, ev.description, ev.date, ev.time, ev.venue, ev.attendees || 0, ev.category || 'Meeting']
      );
    }
    res.json({ message: 'Events updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events/:id/attend', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE events SET attendees = attendees + 1 WHERE id = ?', [id]);
    res.json({ message: 'Attendee counter incremented' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. GRIEVANCES ENDPOINTS
// ==========================================
app.get('/api/grievances', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM grievances ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/grievances', async (req, res) => {
  try {
    const { id, name, phone, mobile, ward, category, description, details, status, adminRemarks } = req.body;
    const grvId = id || `KK-GRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const grvPhone = (phone || mobile || '').trim();
    const grvDesc = (description || details || '').trim();
    await db.query(
      `INSERT INTO grievances (id, name, phone, ward, category, description, status, adminRemarks) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [grvId, (name || '').trim(), grvPhone, ward || '', category || '', grvDesc, status || 'PENDING', adminRemarks || '']
    );
    res.json({ id: grvId, message: 'Grievance submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/grievances', async (req, res) => {
  try {
    // Bulk sync overwrite
    const grievances = req.body;
    await db.query('DELETE FROM grievances');
    for (const g of grievances) {
      await db.query(
        `INSERT INTO grievances (id, name, phone, ward, category, description, status, adminRemarks, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [g.id, g.name || '', g.phone || g.mobile || '', g.ward || '', g.category || '', g.description || g.details || '', g.status || 'PENDING', g.adminRemarks || '', g.createdAt || new Date()]
      );
    }
    res.json({ message: 'Grievances synced successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/grievances/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;
    await db.query(
      'UPDATE grievances SET status = ?, adminRemarks = ? WHERE id = ?',
      [status, adminRemarks, id]
    );
    res.json({ message: 'Grievance status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. HERO SLIDES ENDPOINTS
// ==========================================
app.get('/api/hero-slides', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM hero_slides ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/hero-slides', async (req, res) => {
  try {
    const slides = Array.isArray(req.body) ? req.body : [];
    
    // 1. Fetch existing slides from DB
    const [existingRows] = await db.query('SELECT * FROM hero_slides');
    
    // 2. Identify removed files and delete them physically from the disk
    const newUrls = new Set();
    slides.forEach(s => {
      if (s.desktop) newUrls.add(s.desktop);
      if (s.mobile) newUrls.add(s.mobile);
    });

    if (existingRows && existingRows.length > 0) {
      for (const oldRow of existingRows) {
        if (oldRow.desktop && !newUrls.has(oldRow.desktop)) {
          deletePhysicalFile(oldRow.desktop);
        }
        if (oldRow.mobile && !newUrls.has(oldRow.mobile)) {
          deletePhysicalFile(oldRow.mobile);
        }
      }
    }

    // 3. Update DB
    await db.query('DELETE FROM hero_slides');
    for (const slide of slides) {
      const savedDesk = saveBase64Image(slide.desktop, 'banners', 'tvk-kallakurichi-mla-arul-vignesh-banner');
      const savedMob = saveBase64Image(slide.mobile, 'banners', 'tvk-kallakurichi-mla-arul-vignesh-banner-mob');
      await db.query(
        'INSERT INTO hero_slides (desktop, mobile) VALUES (?, ?)',
        [savedDesk, savedMob]
      );
    }
    res.json({ message: 'Hero slides updated successfully and deleted files cleaned up' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. LIVE NEWS ENDPOINTS
// ==========================================
app.get('/api/live-news', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM live_news ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/live-news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM live_news WHERE id = ?', [id]);
    if (rows && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'News article not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/live-news', async (req, res) => {
  try {
    const {
      title,
      image,
      content = '',
      date = '',
      category = 'NEWS MEDIA',
      author = "Desk of Hon'ble MLA Mr. C. Arul Vignesh"
    } = req.body;
    const newsId = Date.now();
    const dateStr = date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const savedImage = saveBase64Image(image, 'news', 'kallakurichi_mla_news');
    await db.query(
      'INSERT INTO live_news (id, title, image, content, date, category, author) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newsId, title, savedImage, content, dateStr, category, author]
    );
    res.json({ id: newsId, title, image: savedImage, content, date: dateStr, category, author, message: 'News update created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/live-news', async (req, res) => {
  try {
    const newsItems = Array.isArray(req.body) ? req.body : [];
    const [existingRows] = await db.query('SELECT image FROM live_news');
    const oldImages = existingRows ? existingRows.map(r => r.image).filter(Boolean) : [];

    const newImageSet = new Set();
    const processedItems = [];
    for (const item of newsItems) {
      const savedImage = saveBase64Image(item.image, 'news', 'kallakurichi_mla_news');
      if (savedImage) newImageSet.add(savedImage);
      processedItems.push({ ...item, image: savedImage });
    }

    // Delete any old physical images removed during news sync or deletion
    for (const oldImg of oldImages) {
      if (oldImg && !newImageSet.has(oldImg) && oldImg.startsWith('/uploads/')) {
        deletePhysicalFile(oldImg);
      }
    }

    await db.query('DELETE FROM live_news');
    for (const item of processedItems) {
      await db.query(
        'INSERT INTO live_news (id, title, image, content, date, category, author) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          item.id,
          item.title,
          item.image || '',
          item.content || item.description || '',
          item.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          item.category || 'NEWS MEDIA',
          item.author || "Desk of Hon'ble MLA Mr. C. Arul Vignesh"
        ]
      );
    }
    res.json({ message: 'News synced successfully', data: processedItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/live-news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image, content = '', date = '', category = 'NEWS MEDIA', author = "Desk of Hon'ble MLA Mr. C. Arul Vignesh" } = req.body;

    const [existing] = await db.query('SELECT image FROM live_news WHERE id = ?', [id]);
    const oldImage = existing && existing.length > 0 ? existing[0].image : null;

    let savedImage = '';
    if (image && image.startsWith('data:image')) {
      if (oldImage && oldImage.startsWith('/uploads/')) {
        deletePhysicalFile(oldImage);
      }
      savedImage = saveBase64Image(image, 'news', 'kallakurichi_mla_news');
    } else if (image && typeof image === 'string' && image.trim() !== '') {
      savedImage = image.trim();
    } else {
      if (oldImage && oldImage.startsWith('/uploads/')) {
        deletePhysicalFile(oldImage);
      }
      savedImage = '';
    }

    const dateStr = date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    await db.query(
      'UPDATE live_news SET title = ?, image = ?, content = ?, date = ?, category = ?, author = ? WHERE id = ?',
      [title, savedImage, content, dateStr, category, author, id]
    );

    const updated = {
      id: Number(id) || id,
      title,
      image: savedImage,
      content,
      date: dateStr,
      category,
      author
    };

    res.json({ message: 'News article updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/live-news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT image FROM live_news WHERE id = ?', [id]);
    if (rows && rows.length > 0 && rows[0].image) {
      deletePhysicalFile(rows[0].image);
    }
    await db.query('DELETE FROM live_news WHERE id = ?', [id]);
    res.json({ message: 'News article deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. VOLUNTEER SLIDES ENDPOINTS
// ==========================================
app.get('/api/volunteer-slides', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM volunteer_slides ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/volunteer-slides', async (req, res) => {
  try {
    const slides = Array.isArray(req.body) ? req.body : [];
    
    // 1. Fetch existing slides
    const [existingRows] = await db.query('SELECT * FROM volunteer_slides');
    
    // 2. Delete removed files from disk
    const newUrls = new Set();
    slides.forEach(s => {
      if (s.desktop) newUrls.add(s.desktop);
      if (s.mobile) newUrls.add(s.mobile);
    });

    if (existingRows && existingRows.length > 0) {
      for (const oldRow of existingRows) {
        if (oldRow.desktop && !newUrls.has(oldRow.desktop)) {
          deletePhysicalFile(oldRow.desktop);
        }
        if (oldRow.mobile && !newUrls.has(oldRow.mobile)) {
          deletePhysicalFile(oldRow.mobile);
        }
      }
    }

    // 3. Update DB
    await db.query('DELETE FROM volunteer_slides');
    for (const slide of slides) {
      const savedDesk = saveBase64Image(slide.desktop, 'banners', 'tvk-kallakurichi-volunteer-arul-vignesh-banner');
      const savedMob = saveBase64Image(slide.mobile, 'banners', 'tvk-kallakurichi-volunteer-arul-vignesh-banner-mob');
      await db.query(
        'INSERT INTO volunteer_slides (desktop, mobile) VALUES (?, ?)',
        [savedDesk, savedMob]
      );
    }
    res.json({ message: 'Volunteer slides updated successfully and deleted files cleaned up' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. APPOINTMENTS ENDPOINTS
// ==========================================
app.get('/api/appointments', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM appointments ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    console.error('[APPOINTMENTS GET ERROR]:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const {
      id,
      name,
      mobile,
      phone,
      email,
      constituency = 'Kallakurichi',
      taluk,
      village,
      preferredDate,
      date,
      fullAddress,
      full_address,
      address,
      purpose,
      reason,
      status = 'PENDING',
      adminRemarks = '',
      timeSlot = ''
    } = req.body;

    // Generate sequential TVK-KKI-0001 formatted ID if not specified
    let aptId = id;
    if (!aptId || !aptId.startsWith('TVK-KKI-')) {
      const [existingRows] = await db.query('SELECT id FROM `appointments`');
      let maxNum = 0;
      for (const r of existingRows) {
        if (r.id) {
          const match = r.id.match(/TVK-KKI-(\d+)/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        }
      }
      aptId = `TVK-KKI-${(maxNum + 1).toString().padStart(4, '0')}`;
    }

    const aptName = (name || '').trim();
    const aptMobile = (mobile || phone || '').trim();
    const aptEmail = (email || '').trim();
    const aptDate = (preferredDate || date || '').trim();
    const aptAddress = (fullAddress || full_address || address || '').trim();
    const aptPurpose = (purpose || reason || '').trim();
    const aptTimeSlot = (timeSlot || '').trim();
    const aptCreatedAt = toMySQLDateTime();

    // Fetch existing columns in appointments table dynamically
    const [cols] = await db.query('SHOW COLUMNS FROM `appointments`');
    const existingCols = cols.map(c => c.Field);

    const record = {};
    if (existingCols.includes('id')) record.id = aptId;
    if (existingCols.includes('name')) record.name = aptName;
    if (existingCols.includes('mobile')) record.mobile = aptMobile;
    if (existingCols.includes('phone')) record.phone = aptMobile;
    if (existingCols.includes('email')) record.email = aptEmail;
    if (existingCols.includes('constituency')) record.constituency = constituency || 'Kallakurichi';
    if (existingCols.includes('taluk')) record.taluk = (taluk || '').trim();
    if (existingCols.includes('village')) record.village = (village || '').trim();
    if (existingCols.includes('preferredDate')) record.preferredDate = aptDate;
    if (existingCols.includes('date')) record.date = aptDate;
    if (existingCols.includes('fullAddress')) record.fullAddress = aptAddress;
    if (existingCols.includes('full_address')) record.full_address = aptAddress;
    if (existingCols.includes('address')) record.address = aptAddress;
    if (existingCols.includes('purpose')) record.purpose = aptPurpose;
    if (existingCols.includes('reason')) record.reason = aptPurpose;
    if (existingCols.includes('status')) record.status = status || 'PENDING';
    if (existingCols.includes('adminRemarks')) record.adminRemarks = adminRemarks || '';
    if (existingCols.includes('timeSlot')) record.timeSlot = aptTimeSlot;
    if (existingCols.includes('createdAt')) record.createdAt = aptCreatedAt;

    const fieldNames = Object.keys(record);
    const fieldPlaceholders = fieldNames.map(() => '?').join(', ');
    const fieldValues = Object.values(record);

    const insertSql = `INSERT INTO \`appointments\` (\`${fieldNames.join('`, `')}\`) VALUES (${fieldPlaceholders})`;
    await db.query(insertSql, fieldValues);

    console.log(`[APPOINTMENT SAVED] Successfully saved appointment ${aptId} into MySQL database!`);
    res.json({ id: aptId, message: 'Appointment booked successfully' });
  } catch (err) {
    console.error('[APPOINTMENT SAVE ERROR]:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments', async (req, res) => {
  try {
    const appointments = req.body;
    await db.query('DELETE FROM appointments');
    const [cols] = await db.query('SHOW COLUMNS FROM `appointments`');
    const existingCols = cols.map(c => c.Field);

    for (const apt of appointments) {
      const record = {};
      if (existingCols.includes('id')) record.id = apt.id;
      if (existingCols.includes('name')) record.name = apt.name || '';
      if (existingCols.includes('mobile')) record.mobile = apt.mobile || apt.phone || '';
      if (existingCols.includes('phone')) record.phone = apt.mobile || apt.phone || '';
      if (existingCols.includes('email')) record.email = apt.email || '';
      if (existingCols.includes('constituency')) record.constituency = apt.constituency || 'Kallakurichi';
      if (existingCols.includes('taluk')) record.taluk = apt.taluk || '';
      if (existingCols.includes('village')) record.village = apt.village || '';
      if (existingCols.includes('preferredDate')) record.preferredDate = apt.preferredDate || apt.date || '';
      if (existingCols.includes('date')) record.date = apt.preferredDate || apt.date || '';
      if (existingCols.includes('fullAddress')) record.fullAddress = apt.fullAddress || apt.full_address || apt.address || '';
      if (existingCols.includes('full_address')) record.full_address = apt.fullAddress || apt.full_address || apt.address || '';
      if (existingCols.includes('address')) record.address = apt.fullAddress || apt.full_address || apt.address || '';
      if (existingCols.includes('purpose')) record.purpose = apt.purpose || apt.reason || '';
      if (existingCols.includes('reason')) record.reason = apt.purpose || apt.reason || '';
      if (existingCols.includes('status')) record.status = apt.status || 'PENDING';
      if (existingCols.includes('adminRemarks')) record.adminRemarks = apt.adminRemarks || '';
      if (existingCols.includes('timeSlot')) record.timeSlot = apt.timeSlot || '';
      if (existingCols.includes('createdAt')) record.createdAt = toMySQLDateTime(apt.createdAt);

      const fieldNames = Object.keys(record);
      const fieldPlaceholders = fieldNames.map(() => '?').join(', ');
      const fieldValues = Object.values(record);
      await db.query(`INSERT INTO \`appointments\` (\`${fieldNames.join('`, `')}\`) VALUES (${fieldPlaceholders})`, fieldValues);
    }
    res.json({ message: 'Appointments synced successfully' });
  } catch (err) {
    console.error('[APPOINTMENTS SYNC ERROR]:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, timeSlot, adminRemarks } = req.body;
    if (timeSlot !== undefined) {
      await db.query(
        'UPDATE appointments SET status = ?, timeSlot = ?, adminRemarks = ? WHERE id = ?',
        [status, timeSlot, adminRemarks, id]
      );
    } else {
      await db.query(
        'UPDATE appointments SET status = ?, adminRemarks = ? WHERE id = ?',
        [status, adminRemarks, id]
      );
    }
    res.json({ message: 'Appointment updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. VOLUNTEERS ENDPOINTS
// ==========================================
app.get('/api/volunteers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM volunteers ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/volunteers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM volunteers WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/volunteers', async (req, res) => {
  try {
    const { id, name, age, Age, bloodGroup, bloodgroup, blood_group, blood, mobile, phone, email, constituency, taluk, village, fullAddress, full_address, address, image, photo, status, adminRemarks } = req.body;
    
    // Generate sequential TVK-VOL-0001 formatted ID if not provided
    let volunteerId = id;
    if (!volunteerId || !volunteerId.startsWith('TVK-VOL-')) {
      const [existingRows] = await db.query('SELECT id FROM `volunteers`');
      let maxNum = 0;
      for (const r of existingRows) {
        if (r.id) {
          const match = r.id.match(/TVK-VOL-(\d+)/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        }
      }
      volunteerId = `TVK-VOL-${(maxNum + 1).toString().padStart(4, '0')}`;
    }

    const volunteerAge = (age || Age || '').toString().trim();
    const volunteerBloodGroup = (bloodGroup || bloodgroup || blood_group || blood || '').toString().trim();
    const volunteerMobile = (mobile || phone || '').trim();
    const volunteerEmail = (email || '').trim();
    const volunteerAddress = (fullAddress || full_address || address || '').trim();
    const volunteerImage = saveBase64Image(image || photo, 'volunteers', 'volunteer_id');
    const volunteerStatus = status || 'PENDING';
    const volunteerRemarks = adminRemarks || '';

    // Check if duplicate mobile or email already exists and is not REJECTED
    if (volunteerMobile || volunteerEmail) {
      const [duplicates] = await db.query(
        "SELECT id, status FROM volunteers WHERE ((mobile = ? AND mobile != '') OR (email = ? AND email != '')) AND status != 'REJECTED'",
        [volunteerMobile, volunteerEmail]
      );
      if (duplicates.length > 0) {
        return res.status(400).json({
          error: 'This mobile number or email address is already registered.'
        });
      }
    }

    await db.query(
      `INSERT INTO volunteers (id, name, age, bloodGroup, mobile, email, constituency, taluk, village, fullAddress, image, status, adminRemarks, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        volunteerId,
        name ? name.trim() : '',
        volunteerAge,
        volunteerBloodGroup,
        volunteerMobile,
        (email || '').trim(),
        constituency || 'Kallakurichi',
        (taluk || '').trim(),
        (village || '').trim(),
        volunteerAddress,
        volunteerImage,
        volunteerStatus,
        volunteerRemarks,
        toMySQLDateTime()
      ]
    );
    res.json({ id: volunteerId, image: volunteerImage, message: 'Volunteer registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/volunteers', async (req, res) => {
  try {
    const volunteers = req.body;
    await db.query('DELETE FROM volunteers');
    for (const v of volunteers) {
      const vAge = (v.age || v.Age || '').toString().trim();
      const vBloodGroup = (v.bloodGroup || v.bloodgroup || v.blood_group || v.blood || '').toString().trim();
      const volunteerImage = saveBase64Image(v.image || v.photo, 'volunteers', 'volunteer_id');
      await db.query(
        `INSERT INTO volunteers (id, name, age, bloodGroup, mobile, email, constituency, taluk, village, fullAddress, image, status, adminRemarks, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          v.id,
          v.name,
          vAge,
          vBloodGroup,
          v.mobile || v.phone || '',
          v.email || '',
          v.constituency || 'Kallakurichi',
          v.taluk || '',
          v.village || '',
          v.fullAddress || v.full_address || v.address || '',
          volunteerImage,
          v.status || 'PENDING',
          v.adminRemarks || '',
          toMySQLDateTime(v.createdAt)
        ]
      );
    }
    res.json({ message: 'Volunteers synced successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/volunteers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;
    await db.query(
      'UPDATE volunteers SET status = ?, adminRemarks = ? WHERE id = ?',
      [status || 'APPROVED', adminRemarks || '', id]
    );
    res.json({ message: 'Volunteer status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/volunteers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT image FROM volunteers WHERE id = ?', [id]);
    if (existing && existing.length > 0 && existing[0].image) {
      deletePhysicalFile(existing[0].image);
    }
    await db.query('DELETE FROM volunteers WHERE id = ?', [id]);
    console.log(`[VOLUNTEER DELETED] ID: ${id} and photo permanently removed from database & storage.`);
    res.json({ success: true, message: 'Volunteer and photo deleted successfully from database and storage' });
  } catch (err) {
    console.error('[VOLUNTEER DELETE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. VOLUNTEER PHOTOS ENDPOINTS
// ==========================================
app.get('/api/volunteer-photos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM volunteer_photos ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/volunteer-photos', async (req, res) => {
  try {
    const { image, title, volunteerName, volunteerWard } = req.body;
    const photoTitle = (title || '').trim();
    const name = (volunteerName || '').trim();
    const ward = (volunteerWard || '').trim();
    const savedPhoto = saveBase64Image(image, 'volunteer_photos', 'field_photo');
    const uploadedAt = new Date().toISOString();
    const [result] = await db.query(
      'INSERT INTO volunteer_photos (image, title, volunteerName, volunteerWard, uploadedAt) VALUES (?, ?, ?, ?, ?)',
      [savedPhoto, photoTitle, name, ward, uploadedAt]
    );
    res.json({ id: result.insertId, image: savedPhoto, title: photoTitle, volunteerName: name, volunteerWard: ward, uploadedAt, message: 'Volunteer photo uploaded successfully' });
  } catch (err) {
    console.error('[VOLUNTEER PHOTO UPLOAD ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/volunteer-photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { image, title, volunteerName, volunteerWard } = req.body;
    const photoTitle = (title || '').trim();
    const name = (volunteerName || '').trim();
    const ward = (volunteerWard || '').trim();
    
    // Check old image to clean up physical file if image is replaced
    const [existing] = await db.query('SELECT image FROM volunteer_photos WHERE id = ?', [id]);
    let savedPhoto = image;
    if (image && typeof image === 'string' && image.startsWith('data:image')) {
      savedPhoto = saveBase64Image(image, 'volunteer_photos', 'field_photo');
      if (existing && existing.length > 0 && existing[0].image && existing[0].image !== savedPhoto && existing[0].image.startsWith('/uploads/')) {
        deletePhysicalFile(existing[0].image);
      }
    }

    await db.query(
      'UPDATE volunteer_photos SET image = ?, title = ?, volunteerName = ?, volunteerWard = ? WHERE id = ?',
      [savedPhoto, photoTitle, name, ward, id]
    );
    res.json({ id: Number(id), image: savedPhoto, title: photoTitle, volunteerName: name, volunteerWard: ward, message: 'Volunteer photo updated successfully' });
  } catch (err) {
    console.error('[VOLUNTEER PHOTO UPDATE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/volunteer-photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT image FROM volunteer_photos WHERE id = ?', [id]);
    if (existing && existing.length > 0 && existing[0].image) {
      deletePhysicalFile(existing[0].image);
    }
    await db.query('DELETE FROM volunteer_photos WHERE id = ?', [id]);
    console.log(`[VOLUNTEER PHOTO DELETED] ID: ${id} removed from database & storage.`);
    res.json({ success: true, message: 'Volunteer photo deleted successfully from database and storage' });
  } catch (err) {
    console.error('[VOLUNTEER PHOTO DELETE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/volunteer-photos', async (req, res) => {
  try {
    const photos = Array.isArray(req.body) ? req.body : [];
    const [existingRows] = await db.query('SELECT image FROM volunteer_photos');
    const oldImages = existingRows ? existingRows.map(r => r.image).filter(Boolean) : [];

    const newImageSet = new Set();
    const processedPhotos = [];
    for (const photo of photos) {
      const photoTitle = (photo.title || '').trim();
      const name = (photo.volunteerName || '').trim();
      const ward = (photo.volunteerWard || '').trim();
      const savedPhoto = saveBase64Image(photo.image, 'volunteer_photos', 'field_photo');
      if (savedPhoto) newImageSet.add(savedPhoto);
      processedPhotos.push({
        id: photo.id || null,
        image: savedPhoto,
        title: photoTitle,
        volunteerName: name,
        volunteerWard: ward,
        uploadedAt: photo.uploadedAt || new Date().toISOString()
      });
    }

    // Automatically clean up deleted physical files from disk
    for (const oldImg of oldImages) {
      if (oldImg && !newImageSet.has(oldImg) && oldImg.startsWith('/uploads/')) {
        deletePhysicalFile(oldImg);
      }
    }

    await db.query('DELETE FROM volunteer_photos');
    for (const photo of processedPhotos) {
      await db.query(
        'INSERT INTO volunteer_photos (id, image, title, volunteerName, volunteerWard, uploadedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [photo.id || null, photo.image, photo.title, photo.volunteerName, photo.volunteerWard, photo.uploadedAt]
      );
    }
    res.json({ message: 'Volunteer photos synced successfully and deleted files cleaned up' });
  } catch (err) {
    console.error('[VOLUNTEER PHOTO SYNC ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Helper: Parse Browser and Device / OS from User-Agent header
function parseClientUserAgent(uaString) {
  const ua = uaString || '';
  let browser = 'Chrome';
  if (ua.includes('Edg/') || ua.includes('Edge/')) browser = 'Microsoft Edge';
  else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Apple Safari';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Brave')) browser = 'Brave';

  let device = 'Desktop PC';
  if (ua.includes('iPhone')) device = 'iPhone (iOS)';
  else if (ua.includes('iPad')) device = 'iPad (iPadOS)';
  else if (ua.includes('Android')) device = 'Android Mobile';
  else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) device = 'Apple macOS';
  else if (ua.includes('Windows NT 10.0')) device = 'Windows 11 / 10';
  else if (ua.includes('Windows')) device = 'Windows PC';
  else if (ua.includes('Linux')) device = 'Linux System';

  return { browser, device };
}

function getLogTimestamp() {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(now.getDate()).padStart(2, '0');
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const formattedHour = String(hours).padStart(2, '0');
  return `${day} ${month} ${year}, ${formattedHour}:${minutes} ${ampm}`;
}

// 11. ADMINS ACCOUNTS & ACCESS LOGS ENDPOINTS
// ==========================================
app.get('/api/admins', async (req, res) => {
  try {
    // SECURITY: Exclude password hashes from API responses
    const [rows] = await db.query('SELECT id, username, name, mobile, role, createdAt FROM admins ORDER BY id ASC');
    const safeRows = (rows || []).map(({ password, ...rest }) => rest);
    res.json(safeRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admins/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUser = (username || '').trim();

    if (!cleanUser || !password) {
      return res.status(400).json({ authenticated: false, error: 'Username and password are required' });
    }

    const [rows] = await db.query(
      'SELECT id, username, name, mobile, password, role, createdAt FROM admins WHERE LOWER(username) = LOWER(?)',
      [cleanUser]
    );

    // Client information resolution for Audit Logs
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '127.0.0.1';
    const cleanIp = String(rawIp).split(',')[0].replace('::ffff:', '').trim();
    const userAgent = req.headers['user-agent'] || '';
    const { browser, device } = parseClientUserAgent(userAgent);
    const location = (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.'))
      ? 'Kallakurichi, TN (Local)'
      : 'Tamil Nadu, India';
    const timestamp = getLogTimestamp();

    if (rows && rows.length > 0) {
      const userRecord = rows[0];
      let match = false;

      // Check Bcrypt hash or fallback to legacy check & auto-hash upgrade
      if (userRecord.password && (userRecord.password.startsWith('$2a$') || userRecord.password.startsWith('$2b$'))) {
        match = await bcrypt.compare(password, userRecord.password);
      } else if (userRecord.password === password) {
        match = true;
        // Auto-upgrade plain password to Bcrypt hash in DB
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, userRecord.id]);
      }

      if (match) {
        // Record successful login audit log
        try {
          await db.query(
            'INSERT INTO access_logs (username, role, status, ipAddress, browser, device, location, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userRecord.username, userRecord.role || 'Admin', 'Success', cleanIp, browser, device, location, timestamp]
          );
        } catch (logErr) {
          console.error('[DB Log Error]', logErr.message);
        }

        // Return user details WITHOUT password hash
        const { password: _, ...safeUser } = userRecord;
        return res.json({ authenticated: true, user: safeUser });
      }
    }

    // Record failed login attempt
    let attemptedRole = 'Admin';
    if (rows && rows.length > 0) attemptedRole = rows[0].role || 'Admin';

    try {
      await db.query(
        'INSERT INTO access_logs (username, role, status, ipAddress, browser, device, location, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [cleanUser || 'anonymous', attemptedRole, 'Failed', cleanIp, browser, device, location, timestamp]
      );
    } catch (logErr) {
      console.error('[DB Log Error]', logErr.message);
    }

    return res.status(401).json({ authenticated: false, error: 'Invalid username or password' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// FORGOT & RESET PASSWORD ENDPOINTS (STRICT SPECIFICATION)
// ==========================================

// 1. Request Reset (adminForgotPassword)
app.post('/api/admins/forgot-password', resetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (cleanEmail) {
      const [admins] = await db.query('SELECT * FROM admins');
      const targetAdmin = (admins || []).find(
        a => a && a.username && a.username.toLowerCase().trim() === cleanEmail
      );

      if (targetAdmin) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = Date.now() + 3 * 60 * 1000; // 3-minute expiration

        await db.query(
          `INSERT INTO password_reset_tokens (email, tokenHash, expiresAt, used) VALUES (?, ?, ?, ?)`,
          [cleanEmail, tokenHash, expiresAt, false]
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/admin?resetToken=${rawToken}`;

        console.log(`[PASSWORD RESET REQUESTED] Email: ${cleanEmail}`);

        // Create SMTP Transporter
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 465,
          secure: true,
          auth: {
            user: process.env.SMTP_USER || 'gradixtechnologies@gmail.com',
            pass: process.env.SMTP_PASS || 'bnhwpewcxaebogoy'
          }
        });

        // Email HTML Content
        const mailOptions = {
          from: process.env.EMAIL_FROM || '"Kallakurichi CDO HQ" <gradixtechnologies@gmail.com>',
          to: cleanEmail,
          subject: '🔐 Admin Password Reset Request - Kallakurichi CDO',
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #1a0000; padding: 40px 20px; color: #ffffff;">
              <div style="max-width: 550px; margin: 0 auto; background: #3a0000; border: 2px solid #FFCC00; border-radius: 24px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
                <div style="text-align: center; margin-bottom: 24px;">
                  <div style="display: inline-block; background: #FFCC00; color: #420000; font-weight: 900; font-size: 22px; padding: 8px 24px; border-radius: 16px; letter-spacing: 2px;">TVK HQ</div>
                  <h2 style="color: #FFCC00; margin-top: 16px; font-size: 20px; font-weight: 800;">Kallakurichi CDO Admin Reset</h2>
                </div>
                <p style="font-size: 14px; color: #ffffff; line-height: 1.6;">Hello Admin,</p>
                <p style="font-size: 14px; color: #e5e5e5; line-height: 1.6;">A password reset request was issued for your Kallakurichi Constituency Digital Office admin account (<strong>${cleanEmail}</strong>).</p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetLink}" style="background: linear-gradient(135deg, #FFCC00, #F59E0B); color: #420000; text-decoration: none; padding: 14px 30px; border-radius: 16px; font-weight: 900; font-size: 14px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(255, 204, 0, 0.4);">Reset Password Now</a>
                </div>
                <p style="font-size: 12px; color: #ffcccc; background: rgba(255,0,0,0.25); border: 1px solid rgba(255,0,0,0.4); padding: 12px; border-radius: 12px; text-align: center;">⚠️ <strong>Security Notice:</strong> This link expires in exactly <strong>3 minutes</strong> and can only be used once.</p>
                <hr style="border: 0; border-top: 1px solid rgba(255,204,0,0.2); margin: 24px 0;" />
                <p style="font-size: 11px; color: #aaaaaa; text-align: center;">If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
              </div>
            </div>
          `
        };

        // Send email asynchronously
        transporter.sendMail(mailOptions).then(info => {
          console.log(`[EMAIL SENT SUCCESSFULLY] To: ${cleanEmail} | Message ID: ${info.messageId}`);
        }).catch(emailErr => {
          console.error('[EMAIL DISPATCH ERROR]:', emailErr);
        });
      }
    }

    // Account Enumeration Defense: Always return uniform message
    return res.json({
      message: 'If an account is eligible for password reset, a password reset link has been sent.'
    });
  } catch (err) {
    console.error('[FORGOT PASSWORD ERROR]:', err);
    return res.json({
      message: 'If an account is eligible for password reset, a password reset link has been sent.'
    });
  }
});

// 2. Pre-Validation (validateResetToken)
app.get('/api/admins/reset-password/validate', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ valid: false, error: 'Reset token is required' });
    }

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const [tokens] = await db.query('SELECT * FROM password_reset_tokens');
    
    const record = (tokens || []).find(
      t => t && t.tokenHash === tokenHash
    );

    if (!record) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired password reset link' });
    }

    if (record.used === true || record.used === 'true' || record.used === 1 || record.used === '1') {
      return res.status(400).json({ valid: false, error: 'This password reset link has already been used' });
    }

    if (Number(record.expiresAt) < Date.now()) {
      return res.status(400).json({ valid: false, error: 'Password reset link has expired (3-minute limit exceeded)' });
    }

    return res.json({ valid: true, email: record.email });
  } catch (err) {
    return res.status(500).json({ valid: false, error: 'Failed to validate reset token: ' + err.message });
  }
});

// 3. Password Update & Token Revocation (adminResetPassword)
app.post('/api/admins/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    if (!token) {
      return res.status(400).json({ error: 'Reset token is required' });
    }

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const [tokens] = await db.query('SELECT * FROM password_reset_tokens');
    
    const record = (tokens || []).find(
      t => t && t.tokenHash === tokenHash
    );

    if (!record || record.used || Number(record.expiresAt) < Date.now()) {
      return res.status(400).json({ error: 'Invalid, expired, or already used password reset link' });
    }

    // Encrypt new password using bcrypt salt 10
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in admins table
    await db.query(
      'UPDATE admins SET password = ? WHERE LOWER(username) = LOWER(?)',
      [hashedPassword, record.email]
    );

    // Revoke token (mark used = true)
    await db.query(
      'UPDATE password_reset_tokens SET used = true WHERE tokenHash = ?',
      [tokenHash]
    );

    console.log(`[PASSWORD RESET SUCCESSFUL] Account: ${record.email}`);

    return res.json({
      success: true,
      message: 'Password updated successfully. You can now sign in with your new password.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reset password: ' + err.message });
  }
});

app.put('/api/admins', async (req, res) => {
  try {
    const admins = req.body;
    if (Array.isArray(admins)) {
      await db.query('DELETE FROM admins');
      for (const admin of admins) {
        let passwordHash = admin.password || '';
        if (passwordHash && !passwordHash.startsWith('$2a$') && !passwordHash.startsWith('$2b$')) {
          passwordHash = await bcrypt.hash(passwordHash, 10);
        }
        await db.query(
          'INSERT INTO admins (username, name, mobile, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
          [
            admin.username || '',
            admin.name || admin.username || '',
            admin.mobile || admin.phone || '',
            passwordHash,
            admin.role || 'Admin',
            admin.createdAt || ''
          ]
        );
      }
    }
    res.json({ message: 'Admins updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admins', async (req, res) => {
  try {
    const { username, name, mobile, password, role, createdAt } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO admins (username, name, mobile, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [
        (username || '').trim(),
        (name || username || '').trim(),
        (mobile || '').trim(),
        hashedPassword,
        role || 'Admin',
        createdAt || ''
      ]
    );
    res.json({ 
      success: true, 
      id: result.insertId,
      username, 
      name: name || username, 
      mobile, 
      role: role || 'Admin', 
      createdAt 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admins/:username', async (req, res) => {
  try {
    const { username } = req.params;
    await db.query('DELETE FROM admins WHERE LOWER(username) = LOWER(?)', [username]);
    res.json({ message: `Admin ${username} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 12. ACCESS LOGS AUDIT ENDPOINTS
// ==========================================
app.get('/api/access-logs', async (req, res) => {
  try {
    // Only return logs for sub-admins and added super admins (exclude root 'admin')
    const [rows] = await db.query(
      'SELECT id, username, role, status, ipAddress, browser, device, location, createdAt FROM access_logs WHERE LOWER(username) != "admin" ORDER BY id DESC LIMIT 500'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/access-logs', async (req, res) => {
  try {
    const { username, role, status, ipAddress, browser, device, location, createdAt } = req.body;
    const rawIp = ipAddress || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '127.0.0.1';
    const cleanIp = String(rawIp).split(',')[0].replace('::ffff:', '').trim();
    const userAgent = req.headers['user-agent'] || '';
    const parsed = parseClientUserAgent(userAgent);

    const [result] = await db.query(
      'INSERT INTO access_logs (username, role, status, ipAddress, browser, device, location, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        username || 'anonymous',
        role || 'Admin',
        status || 'Success',
        cleanIp,
        browser || parsed.browser,
        device || parsed.device,
        location || 'Kallakurichi, TN',
        createdAt || getLogTimestamp()
      ]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/access-logs', async (req, res) => {
  try {
    await db.query('DELETE FROM access_logs');
    res.json({ message: 'Access logs cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 13. SOCIAL POSTS & PROFILES ENDPOINTS
// ==========================================
app.get('/api/social-posts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM social_posts ORDER BY id DESC');
    const normalized = (rows || []).map(r => {
      const url = r.postUrl || r.tweetUrl || r.link || '';
      let platform = r.platform || r.feedType || 'x';
      if (url.includes('instagram.com')) {
        platform = 'instagram';
      } else if (url.includes('x.com') || url.includes('twitter.com')) {
        platform = 'x';
      }
      return {
        id: r.id,
        platform,
        postUrl: url,
        createdAt: r.createdAt || r.dateTime || 'Recent'
      };
    });
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/social-posts', async (req, res) => {
  try {
    const { id, platform, postUrl, tweetUrl, createdAt } = req.body;
    const postId = id || Date.now();
    const url = (postUrl || tweetUrl || '').trim();
    let targetPlatform = platform || 'x';
    if (url.includes('instagram.com')) {
      targetPlatform = 'instagram';
    } else if (url.includes('x.com') || url.includes('twitter.com')) {
      targetPlatform = 'x';
    }
    const dateStr = createdAt || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    try {
      await db.query(
        `INSERT INTO social_posts (id, platform, postUrl, createdAt) VALUES (?, ?, ?, ?)`,
        [postId, targetPlatform, url, dateStr]
      );
    } catch (insertErr) {
      await db.query(
        `INSERT INTO social_posts (id, feedType, tweetUrl, createdAt) VALUES (?, ?, ?, ?)`,
        [postId, targetPlatform, url, dateStr]
      );
    }

    res.json({ id: postId, platform: targetPlatform, postUrl: url, createdAt: dateStr, message: 'Social post created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/social-posts', async (req, res) => {
  try {
    const posts = Array.isArray(req.body) ? req.body : [];
    await db.query('DELETE FROM social_posts');
    for (const p of posts) {
      const url = (p.postUrl || p.tweetUrl || '').trim();
      let targetPlatform = p.platform || 'x';
      if (url.includes('instagram.com')) targetPlatform = 'instagram';
      else if (url.includes('x.com') || url.includes('twitter.com')) targetPlatform = 'x';

      try {
        await db.query(
          `INSERT INTO social_posts (id, platform, postUrl, createdAt) VALUES (?, ?, ?, ?)`,
          [p.id, targetPlatform, url, p.createdAt || 'Recent']
        );
      } catch (e) {
        await db.query(
          `INSERT INTO social_posts (id, feedType, tweetUrl, createdAt) VALUES (?, ?, ?, ?)`,
          [p.id, targetPlatform, url, p.createdAt || 'Recent']
        );
      }
    }
    res.json({ message: 'Social posts updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/social-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM social_posts WHERE id = ?', [id]);
    res.json({ message: 'Social post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/social-profiles', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM social_profiles LIMIT 1');
    if (rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/social-profiles', async (req, res) => {
  try {
    const { xProfileLink, instagramProfileLink, motivationalQuoteEn, motivationalQuoteTa } = req.body;
    await db.query('DELETE FROM social_profiles');
    await db.query(
      `INSERT INTO social_profiles (id, xProfileLink, instagramProfileLink, motivationalQuoteEn, motivationalQuoteTa) 
       VALUES (1, ?, ?, ?, ?)`,
      [xProfileLink || 'https://x.com/TVKVijayHQ', instagramProfileLink || 'https://instagram.com/tvkvijayhq', motivationalQuoteEn || '', motivationalQuoteTa || '']
    );
    res.json({ message: 'Social profiles updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database Auto-migration to ensure all tables and columns are up to date
const initDB = async () => {
  try {
    // Create and auto-migrate mla_data table
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`mla_data\` (
        \`id\` INT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`photo\` LONGTEXT NOT NULL,
        \`suffix\` VARCHAR(255) NOT NULL,
        \`constituency\` VARCHAR(255) NOT NULL,
        \`bio\` TEXT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      const [mlaCols] = await db.query(`SHOW COLUMNS FROM \`mla_data\``);
      const mlaColNames = mlaCols.map(c => c.Field);
      if (!mlaColNames.includes('bio')) {
        await db.query(`ALTER TABLE \`mla_data\` ADD COLUMN \`bio\` TEXT NULL`);
      }
      const redundantCols = ['nameTa', 'constituencyTa', 'bioP1', 'bioP1Ta', 'bioP2', 'bioP2Ta', 'born', 'bornTa', 'education', 'educationTa', 'election', 'electionTa', 'parent', 'parentTa'];
      for (const col of redundantCols) {
        if (mlaColNames.includes(col)) {
          try { await db.query(`ALTER TABLE \`mla_data\` DROP COLUMN \`${col}\``); } catch(e){}
        }
      }
      console.log('[DB] MLA data table schema verified & auto-migrated successfully.');
    } catch (e) {}

    // Create volunteers table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`volunteers\` (
        \`id\` VARCHAR(100) PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`mobile\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`constituency\` VARCHAR(100) NOT NULL DEFAULT 'Kallakurichi',
        \`taluk\` VARCHAR(100) NOT NULL,
        \`village\` VARCHAR(100) NOT NULL,
        \`fullAddress\` TEXT NOT NULL,
        \`image\` LONGTEXT NULL,
        \`status\` VARCHAR(100) DEFAULT 'APPROVED',
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Check existing columns to add any missing ones smoothly
    const [cols] = await db.query(`SHOW COLUMNS FROM \`volunteers\``);
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('mobile') && colNames.includes('phone')) {
      await db.query(`ALTER TABLE \`volunteers\` CHANGE COLUMN \`phone\` \`mobile\` VARCHAR(100) NOT NULL`);
    } else if (!colNames.includes('mobile')) {
      await db.query(`ALTER TABLE \`volunteers\` ADD COLUMN \`mobile\` VARCHAR(100) NOT NULL AFTER \`name\``);
    }
    if (!colNames.includes('constituency')) {
      await db.query(`ALTER TABLE \`volunteers\` ADD COLUMN \`constituency\` VARCHAR(100) NOT NULL DEFAULT 'Kallakurichi' AFTER \`email\``);
    }
    if (!colNames.includes('taluk')) {
      await db.query(`ALTER TABLE \`volunteers\` ADD COLUMN \`taluk\` VARCHAR(100) NOT NULL AFTER \`constituency\``);
    }
    if (!colNames.includes('village')) {
      await db.query(`ALTER TABLE \`volunteers\` ADD COLUMN \`village\` VARCHAR(100) NOT NULL AFTER \`taluk\``);
    }
    if (!colNames.includes('fullAddress')) {
      await db.query(`ALTER TABLE \`volunteers\` ADD COLUMN \`fullAddress\` TEXT NULL AFTER \`village\``);
    }
    if (!colNames.includes('image')) {
      await db.query(`ALTER TABLE \`volunteers\` ADD COLUMN \`image\` LONGTEXT NULL AFTER \`fullAddress\``);
    }
    console.log('[DB] Volunteers table schema verified & auto-migrated successfully.');

    // Create appointments table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`appointments\` (
        \`id\` VARCHAR(100) PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`mobile\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(255) NULL,
        \`constituency\` VARCHAR(100) NOT NULL DEFAULT 'Kallakurichi',
        \`taluk\` VARCHAR(100) NOT NULL,
        \`village\` VARCHAR(100) NOT NULL,
        \`preferredDate\` VARCHAR(100) NOT NULL,
        \`fullAddress\` TEXT NOT NULL,
        \`purpose\` TEXT NOT NULL,
        \`status\` VARCHAR(100) DEFAULT 'PENDING',
        \`adminRemarks\` TEXT NULL,
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Check existing columns in appointments table
    const [aptCols] = await db.query(`SHOW COLUMNS FROM \`appointments\``);
    const aptColNames = aptCols.map(c => c.Field);

    if (!aptColNames.includes('mobile') && aptColNames.includes('phone')) {
      await db.query(`ALTER TABLE \`appointments\` CHANGE COLUMN \`phone\` \`mobile\` VARCHAR(100) NOT NULL`);
    } else if (!aptColNames.includes('mobile')) {
      await db.query(`ALTER TABLE \`appointments\` ADD COLUMN \`mobile\` VARCHAR(100) NOT NULL AFTER \`name\``);
    }
    if (!aptColNames.includes('constituency')) {
      await db.query(`ALTER TABLE \`appointments\` ADD COLUMN \`constituency\` VARCHAR(100) NOT NULL DEFAULT 'Kallakurichi' AFTER \`email\``);
    }
    if (!aptColNames.includes('taluk')) {
      await db.query(`ALTER TABLE \`appointments\` ADD COLUMN \`taluk\` VARCHAR(100) NOT NULL AFTER \`constituency\``);
    }
    if (!aptColNames.includes('village')) {
      await db.query(`ALTER TABLE \`appointments\` ADD COLUMN \`village\` VARCHAR(100) NOT NULL AFTER \`taluk\``);
    }
    if (!aptColNames.includes('preferredDate') && aptColNames.includes('date')) {
      await db.query(`ALTER TABLE \`appointments\` CHANGE COLUMN \`date\` \`preferredDate\` VARCHAR(100) NOT NULL`);
    } else if (!aptColNames.includes('preferredDate')) {
      await db.query(`ALTER TABLE \`appointments\` ADD COLUMN \`preferredDate\` VARCHAR(100) NOT NULL AFTER \`village\``);
    }
    if (!aptColNames.includes('fullAddress')) {
      await db.query(`ALTER TABLE \`appointments\` ADD COLUMN \`fullAddress\` TEXT NOT NULL AFTER \`preferredDate\``);
    }
    if (!aptColNames.includes('purpose') && aptColNames.includes('reason')) {
      await db.query(`ALTER TABLE \`appointments\` CHANGE COLUMN \`reason\` \`purpose\` TEXT NOT NULL`);
    } else if (!aptColNames.includes('purpose')) {
      await db.query(`ALTER TABLE \`appointments\` ADD COLUMN \`purpose\` TEXT NOT NULL AFTER \`fullAddress\``);
    }
    try { await db.query("ALTER TABLE `appointments` MODIFY COLUMN `createdAt` VARCHAR(100) NULL"); } catch(e){}
    try { await db.query("ALTER TABLE `volunteers` MODIFY COLUMN `createdAt` VARCHAR(100) NULL"); } catch(e){}
    console.log('[DB] Appointments table schema verified & auto-migrated successfully.');

    // ==========================================
    // 12. SOCIAL MEDIA POSTS & PROFILES ENDPOINTS
    // ==========================================
    const autoMigrateSocialSchema = async () => {
      try {
        const [cols] = await db.query('SHOW COLUMNS FROM social_posts');
        const colNames = (cols || []).map(c => c.Field);
        
        if (!colNames.includes('platform')) {
          console.log('[AUTO-MIGRATE] Adding platform column to social_posts...');
          await db.query('ALTER TABLE social_posts ADD COLUMN platform VARCHAR(50) NOT NULL DEFAULT "x"');
        }
        if (!colNames.includes('postUrl')) {
          console.log('[AUTO-MIGRATE] Adding postUrl column to social_posts...');
          await db.query('ALTER TABLE social_posts ADD COLUMN postUrl LONGTEXT NULL');
          if (colNames.includes('tweetUrl')) {
            await db.query('UPDATE social_posts SET postUrl = tweetUrl WHERE postUrl IS NULL OR postUrl = ""');
          }
        }
      } catch (err) {
        try {
          await db.query(`
            CREATE TABLE IF NOT EXISTS social_posts (
              id BIGINT PRIMARY KEY,
              platform VARCHAR(50) NOT NULL DEFAULT 'x',
              postUrl LONGTEXT NOT NULL,
              createdAt VARCHAR(100) NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);
        } catch (e) {}
      }

      try {
        const [pCols] = await db.query('SHOW COLUMNS FROM social_profiles');
        const pColNames = (pCols || []).map(c => c.Field);
        if (!pColNames.includes('xProfileLink')) {
          await db.query('ALTER TABLE social_profiles ADD COLUMN xProfileLink LONGTEXT NULL');
        }
        if (!pColNames.includes('instagramProfileLink')) {
          await db.query('ALTER TABLE social_profiles ADD COLUMN instagramProfileLink LONGTEXT NULL');
        }
      } catch (err) {
        try {
          await db.query(`
            CREATE TABLE IF NOT EXISTS social_profiles (
              id INT PRIMARY KEY,
              xProfileLink LONGTEXT,
              instagramProfileLink LONGTEXT,
              motivationalQuoteEn TEXT,
              motivationalQuoteTa TEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);
        } catch (e) {}
      }
    };

    autoMigrateSocialSchema();

    // Create admins table if not exists and seed default super admin
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(100) UNIQUE NOT NULL,
        \`name\` VARCHAR(200) NULL DEFAULT '',
        \`mobile\` VARCHAR(50) NULL DEFAULT '',
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(100) NOT NULL,
        \`createdAt\` VARCHAR(100) NULL DEFAULT ''
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Auto-migrate columns for existing admins table
    try {
      await db.query(`ALTER TABLE \`admins\` ADD COLUMN \`name\` VARCHAR(200) NULL DEFAULT ''`);
    } catch (e) {}
    try {
      await db.query(`ALTER TABLE \`admins\` ADD COLUMN \`mobile\` VARCHAR(50) NULL DEFAULT ''`);
    } catch (e) {}
    try {
      await db.query(`ALTER TABLE \`admins\` ADD COLUMN \`createdAt\` VARCHAR(100) NULL DEFAULT ''`);
    } catch (e) {}

    const [existingAdmins] = await db.query('SELECT id FROM admins WHERE LOWER(username) = "admin"');
    if (existingAdmins.length === 0) {
      await db.query(`
        INSERT INTO \`admins\` (\`username\`, \`name\`, \`mobile\`, \`password\`, \`role\`, \`createdAt\`) 
        VALUES ('admin', 'Super Admin', '', 'password1207', 'Super Admin', '')
      `);
      console.log('[DB] Default admin seeded: admin / password1207');
    }
    console.log('[DB] Admins table schema verified & auto-migrated successfully.');

    // Auto-migrate volunteer_photos schema
    try {
      await db.query(`ALTER TABLE \`volunteer_photos\` MODIFY \`id\` BIGINT AUTO_INCREMENT`);
      await db.query(`ALTER TABLE \`volunteer_photos\` MODIFY \`image\` LONGTEXT NOT NULL`);
      await db.query(`ALTER TABLE \`volunteer_photos\` MODIFY \`title\` VARCHAR(500) NULL`);
      await db.query(`ALTER TABLE \`volunteer_photos\` MODIFY \`volunteerName\` VARCHAR(255) NULL DEFAULT ''`);
      await db.query(`ALTER TABLE \`volunteer_photos\` MODIFY \`volunteerWard\` VARCHAR(100) NULL DEFAULT ''`);
      await db.query(`ALTER TABLE \`volunteer_photos\` MODIFY \`uploadedAt\` VARCHAR(100) NULL`);
      console.log('[DB] Volunteer photos table schema verified & auto-migrated successfully.');
    } catch (e) {}

    // Auto-migrate events schema
    try {
      await db.query(`ALTER TABLE \`events\` MODIFY \`id\` BIGINT`);
      console.log('[DB] Events table schema verified & auto-migrated successfully.');
    } catch (e) {}

    // Auto-migrate access_logs schema
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS \`access_logs\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`username\` VARCHAR(100) NOT NULL,
          \`role\` VARCHAR(100) NOT NULL DEFAULT 'Admin',
          \`status\` VARCHAR(50) NOT NULL DEFAULT 'Success',
          \`ipAddress\` VARCHAR(100) NOT NULL DEFAULT '127.0.0.1',
          \`browser\` VARCHAR(100) NOT NULL DEFAULT 'Google Chrome',
          \`device\` VARCHAR(100) NOT NULL DEFAULT 'Desktop PC',
          \`location\` VARCHAR(150) NOT NULL DEFAULT 'Kallakurichi, TN',
          \`createdAt\` VARCHAR(100) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('[DB] Access logs table schema verified & auto-migrated successfully.');
    } catch (e) {}

    // Auto-seed initial data from data.json if tables are currently empty
    try {
      const dataJsonPath = path.join(__dirname, 'database', 'data.json');
      if (fs.existsSync(dataJsonPath)) {
        const seedData = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));

        // 1. Daily Updates
        try {
          const [dailyRows] = await db.query('SELECT count(*) as count FROM daily_updates');
          if (dailyRows[0].count === 0 && seedData.daily_updates && seedData.daily_updates.length > 0) {
            console.log('[DB-SEED] Seeding daily_updates from data.json...');
            for (const u of seedData.daily_updates) {
              await db.query(
                `INSERT INTO daily_updates (id, title, description, category, location, date, image, status, hasBadge, isBefore) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [u.id, u.title, u.description || '', u.category || 'ROADS', u.location || 'Constituency', u.date || 'Aug 2026', u.image || '', u.status || 'DONE', u.hasBadge ? 1 : 0, u.isBefore ? 1 : 0]
              );
            }
          }
        } catch (e) {}

        // 2. Live News
        try {
          const [newsRows] = await db.query('SELECT count(*) as count FROM live_news');
          if (newsRows[0].count === 0 && seedData.live_news && seedData.live_news.length > 0) {
            console.log('[DB-SEED] Seeding live_news from data.json...');
            for (const n of seedData.live_news) {
              await db.query(
                `INSERT INTO live_news (id, title, image, content, date, category, author) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [n.id, n.title, n.image || '', n.content || n.description || '', n.date || 'Aug 2026', n.category || 'NEWS MEDIA', n.author || "Desk of Hon'ble MLA Mr. C. Arul Vignesh"]
              );
            }
          }
        } catch (e) {}

        // 3. Hero Slides
        try {
          const [heroRows] = await db.query('SELECT count(*) as count FROM hero_slides');
          if (heroRows[0].count === 0 && seedData.hero_slides && seedData.hero_slides.length > 0) {
            console.log('[DB-SEED] Seeding hero_slides from data.json...');
            for (const s of seedData.hero_slides) {
              await db.query(
                `INSERT INTO hero_slides (desktop, mobile) VALUES (?, ?)`,
                [s.desktop, s.mobile || s.desktop]
              );
            }
          }
        } catch (e) {}

        // 4. Volunteer Slides
        try {
          const [volSlideRows] = await db.query('SELECT count(*) as count FROM volunteer_slides');
          if (volSlideRows[0].count === 0 && seedData.volunteer_slides && seedData.volunteer_slides.length > 0) {
            console.log('[DB-SEED] Seeding volunteer_slides from data.json...');
            for (const s of seedData.volunteer_slides) {
              await db.query(
                `INSERT INTO volunteer_slides (desktop, mobile) VALUES (?, ?)`,
                [s.desktop, s.mobile || s.desktop]
              );
            }
          }
        } catch (e) {}

        // 5. Appointments
        try {
          const [apptRows] = await db.query('SELECT count(*) as count FROM appointments');
          if (apptRows[0].count === 0 && seedData.appointments && seedData.appointments.length > 0) {
            console.log('[DB-SEED] Seeding appointments from data.json...');
            for (const a of seedData.appointments) {
              await db.query(
                `INSERT INTO appointments (id, name, mobile, email, constituency, taluk, village, preferredDate, fullAddress, purpose, timeSlot, status, adminRemarks, createdAt) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [a.id, a.name, a.mobile || '', a.email || '', a.constituency || 'Kallakurichi', a.taluk || '', a.village || '', a.preferredDate || '', a.fullAddress || '', a.purpose || '', a.timeSlot || '', a.status || 'PENDING', a.adminRemarks || '', a.createdAt || '']
              );
            }
          }
        } catch (e) {}

        // 6. Volunteers
        try {
          const [volRows] = await db.query('SELECT count(*) as count FROM volunteers');
          if (volRows[0].count === 0 && seedData.volunteers && seedData.volunteers.length > 0) {
            console.log('[DB-SEED] Seeding volunteers from data.json...');
            for (const v of seedData.volunteers) {
              await db.query(
                `INSERT INTO volunteers (id, name, mobile, email, constituency, taluk, village, fullAddress, image, status, createdAt) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [v.id, v.name, v.mobile || '', v.email || '', v.constituency || 'Kallakurichi', v.taluk || '', v.village || '', v.fullAddress || '', v.image || '', v.status || 'APPROVED', v.createdAt || '']
              );
            }
          }
        } catch (e) {}

        // 7. Social Profiles
        try {
          const [profRows] = await db.query('SELECT count(*) as count FROM social_profiles');
          if (profRows[0].count === 0) {
            await db.query(
              `INSERT INTO social_profiles (id, xProfileLink, instagramProfileLink, motivationalQuoteEn, motivationalQuoteTa) 
               VALUES (1, 'https://x.com/TVKVijayHQ', 'https://instagram.com/tvkvijayhq', '', '')`
            );
          }
        } catch (e) {}
      }
    } catch (seedErr) {
      console.warn('[DB AUTO-SEED ERROR]', seedErr.message);
    }
  } catch (err) {
    console.warn('[DB AUTO-MIGRATION WARNING]', err.message);
  }
};

// Start Server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Express CDO Backend server is running on http://0.0.0.0:${PORT} (accessible from all devices on network)`);
  await initDB();
  await cleanUnusedPhysicalFiles();
});
