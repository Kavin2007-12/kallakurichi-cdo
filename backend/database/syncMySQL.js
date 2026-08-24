const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

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

async function syncAllToMySQL() {
  console.log('Connecting to MySQL with credentials:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'kallakurichi_cdo'
  });

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kallakurichi_cdo'
  });

  console.log('Connected to MySQL successfully. Setting up clean table schemas...');

  // 1. Admins Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 2. Live News Table (Clean without *Ta columns)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS live_news (
      id BIGINT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      image LONGTEXT,
      content LONGTEXT,
      date VARCHAR(100),
      category VARCHAR(100),
      author VARCHAR(255)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  // Drop redundant columns if still present
  try { await conn.query("ALTER TABLE live_news DROP COLUMN titleTa"); } catch(e){}
  try { await conn.query("ALTER TABLE live_news DROP COLUMN contentTa"); } catch(e){}
  try { await conn.query("ALTER TABLE live_news DROP COLUMN sourceUrl"); } catch(e){}
  try { await conn.query("ALTER TABLE live_news MODIFY id BIGINT"); } catch(e){}
  try { await conn.query("ALTER TABLE live_news MODIFY image LONGTEXT"); } catch(e){}
  try { await conn.query("ALTER TABLE live_news MODIFY content LONGTEXT"); } catch(e){}

  // 3. Appointments Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      mobile VARCHAR(100) NULL,
      email VARCHAR(255) NULL,
      constituency VARCHAR(100) NULL,
      taluk VARCHAR(100) NULL,
      village VARCHAR(100) NULL,
      preferredDate VARCHAR(100) NULL,
      fullAddress TEXT NULL,
      purpose TEXT NULL,
      timeSlot VARCHAR(255) NULL,
      status VARCHAR(100) DEFAULT 'PENDING',
      adminRemarks TEXT NULL,
      createdAt VARCHAR(100) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 4. Volunteers Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      age VARCHAR(50) NULL,
      bloodGroup VARCHAR(50) NULL,
      mobile VARCHAR(100) NULL,
      email VARCHAR(255) NULL,
      constituency VARCHAR(100) NULL,
      taluk VARCHAR(100) NULL,
      village VARCHAR(100) NULL,
      fullAddress TEXT NULL,
      image LONGTEXT NULL,
      status VARCHAR(100) DEFAULT 'PENDING',
      adminRemarks TEXT NULL,
      createdAt VARCHAR(100) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  try { await conn.query("ALTER TABLE appointments MODIFY COLUMN createdAt VARCHAR(100) NULL"); } catch(e){}
  try { await conn.query("ALTER TABLE volunteers MODIFY COLUMN createdAt VARCHAR(100) NULL"); } catch(e){}
  try { await conn.query("ALTER TABLE volunteers ADD COLUMN age VARCHAR(50) NULL"); } catch(e){}
  try { await conn.query("ALTER TABLE volunteers ADD COLUMN bloodGroup VARCHAR(50) NULL"); } catch(e){}
  try { await conn.query("UPDATE volunteers SET age = '25' WHERE age IS NULL OR age = ''"); } catch(e){}
  try { await conn.query("UPDATE volunteers SET bloodGroup = 'O+' WHERE bloodGroup IS NULL OR bloodGroup = ''"); } catch(e){}

  // 5. Daily Updates Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS daily_updates (
      id BIGINT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      location VARCHAR(255),
      date VARCHAR(100),
      image LONGTEXT,
      status VARCHAR(50),
      hasBadge TINYINT(1),
      isBefore TINYINT(1)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 6. Volunteer Photos Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS volunteer_photos (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      image LONGTEXT,
      title VARCHAR(500),
      volunteerName VARCHAR(255) DEFAULT '',
      volunteerWard VARCHAR(100) DEFAULT '',
      uploadedAt VARCHAR(100)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  try { await conn.query("ALTER TABLE volunteer_photos MODIFY id BIGINT AUTO_INCREMENT"); } catch(e){}
  try { await conn.query("ALTER TABLE volunteer_photos MODIFY image LONGTEXT"); } catch(e){}
  try { await conn.query("ALTER TABLE volunteer_photos MODIFY title VARCHAR(500)"); } catch(e){}
  try { await conn.query("ALTER TABLE volunteer_photos MODIFY volunteerName VARCHAR(255) NULL DEFAULT ''"); } catch(e){}
  try { await conn.query("ALTER TABLE volunteer_photos MODIFY volunteerWard VARCHAR(100) NULL DEFAULT ''"); } catch(e){}

  // 7. Hero Slides Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id INT PRIMARY KEY,
      desktop LONGTEXT,
      mobile LONGTEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  try { await conn.query("ALTER TABLE hero_slides MODIFY desktop LONGTEXT"); } catch(e){}
  try { await conn.query("ALTER TABLE hero_slides MODIFY mobile LONGTEXT"); } catch(e){}

  // 8. Volunteer Slides Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS volunteer_slides (
      id INT PRIMARY KEY,
      desktop LONGTEXT,
      mobile LONGTEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  try { await conn.query("ALTER TABLE volunteer_slides MODIFY desktop LONGTEXT"); } catch(e){}
  try { await conn.query("ALTER TABLE volunteer_slides MODIFY mobile LONGTEXT"); } catch(e){}

  // 9. MLA Data Table (Clean Admin Schema)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS mla_data (
      id INT PRIMARY KEY,
      name VARCHAR(255),
      photo LONGTEXT,
      suffix VARCHAR(255),
      constituency VARCHAR(255),
      bio TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  try { await conn.query("ALTER TABLE mla_data ADD COLUMN bio TEXT NULL"); } catch(e){}
  // Drop redundant columns if still present
  const mlaRedundantCols = [
    'nameTa', 'constituencyTa', 
    'bioP1', 'bioP1Ta', 'bioP2', 'bioP2Ta', 
    'born', 'bornTa', 
    'education', 'educationTa', 
    'election', 'electionTa', 
    'parent', 'parentTa'
  ];
  for (const c of mlaRedundantCols) {
    try { await conn.query(`ALTER TABLE mla_data DROP COLUMN ${c}`); } catch(e){}
  }

  // 10. Events Table (Clean without *Ta columns)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS events (
      id BIGINT PRIMARY KEY,
      title VARCHAR(255),
      description TEXT,
      date VARCHAR(100),
      time VARCHAR(100),
      venue VARCHAR(255),
      attendees INT,
      category VARCHAR(100)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  try { await conn.query("ALTER TABLE events MODIFY id BIGINT"); } catch(e){}
  const eventTaCols = ['titleTa', 'descriptionTa', 'venueTa'];
  for (const c of eventTaCols) {
    try { await conn.query(`ALTER TABLE events DROP COLUMN ${c}`); } catch(e){}
  }

  // 11. Grievances Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS grievances (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255),
      phone VARCHAR(100),
      ward VARCHAR(100),
      category VARCHAR(100),
      description TEXT,
      status VARCHAR(100),
      adminRemarks TEXT,
      createdAt VARCHAR(100)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 12. Social Posts Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS social_posts (
      id BIGINT PRIMARY KEY,
      platform VARCHAR(50) NOT NULL DEFAULT 'x',
      postUrl LONGTEXT NOT NULL,
      createdAt VARCHAR(100) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 13. Social Profiles Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS social_profiles (
      id INT PRIMARY KEY,
      xProfileLink LONGTEXT,
      instagramProfileLink LONGTEXT,
      motivationalQuoteEn TEXT,
      motivationalQuoteTa TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Schemas verified. Populating data from data.json into MySQL...');

  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));

  // 1. Admins
  if (data.admins && data.admins.length > 0) {
    await conn.query('DELETE FROM admins');
    for (const a of data.admins) {
      await conn.query(
        'INSERT INTO admins (id, username, password, role) VALUES (?, ?, ?, ?)',
        [a.id || null, a.username, a.password, a.role]
      );
    }
  }

  // 2. Live News
  if (data.live_news && data.live_news.length > 0) {
    await conn.query('DELETE FROM live_news');
    for (const n of data.live_news) {
      await conn.query(
        'INSERT INTO live_news (id, title, image, content, date, category, author) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          n.id,
          n.title,
          n.image,
          n.content || n.description || '',
          n.date || 'Aug 2026',
          n.category || 'NEWS MEDIA',
          n.author || 'TVK Media & Press Cell'
        ]
      );
    }
  }

  // 3. Daily Updates
  if (data.daily_updates && data.daily_updates.length > 0) {
    await conn.query('DELETE FROM daily_updates');
    for (const u of data.daily_updates) {
      await conn.query(
        'INSERT INTO daily_updates (id, title, description, category, location, date, image, status, hasBadge, isBefore) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          u.id,
          u.title,
          u.description || '',
          u.category || 'ROADS',
          u.location || 'Constituency',
          u.date || 'Aug 2026',
          u.image || '',
          u.status || 'DONE',
          u.hasBadge ? 1 : 0,
          u.isBefore ? 1 : 0
        ]
      );
    }
  }

  // 4. Appointments
  if (data.appointments && data.appointments.length > 0) {
    await conn.query('DELETE FROM appointments');
    for (const a of data.appointments) {
      await conn.query(
        `INSERT INTO appointments (id, name, mobile, email, constituency, taluk, village, preferredDate, fullAddress, purpose, timeSlot, status, adminRemarks, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          a.id,
          a.name,
          a.mobile || a.phone || '',
          a.email || '',
          a.constituency || 'Kallakurichi',
          a.taluk || '',
          a.village || '',
          a.preferredDate || a.date || '',
          a.fullAddress || a.address || '',
          a.purpose || a.reason || '',
          a.timeSlot || '',
          a.status || 'PENDING',
          a.adminRemarks || '',
          toMySQLDateTime(a.createdAt)
        ]
      );
    }
  }

  // 5. Volunteers
  if (data.volunteers && data.volunteers.length > 0) {
    await conn.query('DELETE FROM volunteers');
    for (const v of data.volunteers) {
      const vAge = (v.age || v.Age || '25').toString().trim();
      const vBloodGroup = (v.bloodGroup || v.bloodgroup || v.blood_group || v.blood || 'O+').toString().trim();
      await conn.query(
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
          v.fullAddress || v.address || '',
          v.image || v.photo || '',
          v.status || 'PENDING',
          v.adminRemarks || '',
          toMySQLDateTime(v.createdAt)
        ]
      );
    }
  }
  try { await conn.query("UPDATE volunteers SET age = '25' WHERE age IS NULL OR age = ''"); } catch(e){}
  try { await conn.query("UPDATE volunteers SET bloodGroup = 'O+' WHERE bloodGroup IS NULL OR bloodGroup = ''"); } catch(e){}

  // 6. Volunteer Photos
  const [photoCountRows] = await conn.query('SELECT COUNT(*) as count FROM volunteer_photos');
  if (photoCountRows[0].count === 0 && data.volunteer_photos && data.volunteer_photos.length > 0) {
    for (const p of data.volunteer_photos) {
      await conn.query(
        'INSERT INTO volunteer_photos (id, image, title, volunteerName, volunteerWard, uploadedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [
          p.id || null,
          p.image,
          p.title || p.volunteerName || '',
          p.volunteerName || p.title || '',
          p.volunteerWard || 'Ward 1',
          p.uploadedAt || new Date().toISOString()
        ]
      );
    }
  }


  // 7. Hero Slides
  if (data.hero_slides && data.hero_slides.length > 0) {
    await conn.query('DELETE FROM hero_slides');
    for (const s of data.hero_slides) {
      await conn.query(
        'INSERT INTO hero_slides (id, desktop, mobile) VALUES (?, ?, ?)',
        [s.id, s.desktop, s.mobile]
      );
    }
  }

  // 8. Volunteer Slides
  if (data.volunteer_slides && data.volunteer_slides.length > 0) {
    await conn.query('DELETE FROM volunteer_slides');
    for (const s of data.volunteer_slides) {
      await conn.query(
        'INSERT INTO volunteer_slides (id, desktop, mobile) VALUES (?, ?, ?)',
        [s.id, s.desktop, s.mobile]
      );
    }
  }

  // 9. MLA Data
  if (data.mla_data && data.mla_data.length > 0) {
    await conn.query('DELETE FROM mla_data');
    const m = data.mla_data[0];
    await conn.query(
      `INSERT INTO mla_data (id, name, photo, suffix, constituency, bio) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        1, m.name, m.photo, m.suffix, m.constituency,
        m.bio || [m.bioP1, m.bioP2].filter(Boolean).join('\n\n')
      ]
    );
  }

  // 10. Events
  if (data.events && data.events.length > 0) {
    await conn.query('DELETE FROM events');
    for (const e of data.events) {
      await conn.query(
        'INSERT INTO events (id, title, description, date, time, venue, attendees, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          e.id, e.title, e.description,
          e.date, e.time, e.venue, e.attendees || 0, e.category || 'Meeting'
        ]
      );
    }
  }

  // 11. Social Posts
  if (data.social_posts && data.social_posts.length > 0) {
    await conn.query('DELETE FROM social_posts');
    for (const p of data.social_posts) {
      await conn.query(
        `INSERT INTO social_posts (id, platform, postUrl, createdAt) 
         VALUES (?, ?, ?, ?)`,
        [
          p.id,
          p.platform || (p.postUrl?.includes('instagram.com') ? 'instagram' : 'x'),
          p.postUrl || p.tweetUrl || '',
          p.createdAt || 'Recent'
        ]
      );
    }
  }

  // 12. Social Profiles
  if (data.social_profiles) {
    await conn.query('DELETE FROM social_profiles');
    const sp = Array.isArray(data.social_profiles) ? data.social_profiles[0] : data.social_profiles;
    if (sp) {
      await conn.query(
        `INSERT INTO social_profiles (id, xProfileLink, instagramProfileLink, motivationalQuoteEn, motivationalQuoteTa) 
         VALUES (1, ?, ?, ?, ?)`,
        [
          sp.xProfileLink || 'https://x.com/TVKVijayHQ',
          sp.instagramProfileLink || 'https://instagram.com/tvkvijayhq',
          sp.motivationalQuoteEn || '',
          sp.motivationalQuoteTa || ''
        ]
      );
    }
  }

  console.log('✅ ALL MYSQL TABLES FULLY SYNCHRONIZED AND CLEANED!');
  await conn.end();
}

module.exports = syncAllToMySQL;

if (require.main === module) {
  syncAllToMySQL().catch(err => {
    console.log('MySQL Sync Notice: Database connection unavailable (system operates on data.json dataset).', err.message || err);
  });
}
