const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
const DB_NAME = process.env.DB_NAME || 'kallakurichi_cdo';

let activePool = null;
let isMySqlAvailable = false;

const dataJsonPath = path.join(__dirname, '..', 'database', 'data.json');

const loadJsonStore = () => {
  try {
    if (fs.existsSync(dataJsonPath)) {
      const raw = fs.readFileSync(dataJsonPath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[JSON STORE READ ERROR]:', e.message);
  }
  return {};
};

const saveJsonStore = (store) => {
  try {
    fs.writeFileSync(dataJsonPath, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.warn('[JSON STORE WRITE ERROR]:', e.message);
  }
};

// Fallback SQL query runner against database/data.json when MySQL is unreachable
const runJsonQueryFallback = async (sql, params = []) => {
  const cleanSql = (sql || '').trim();
  const store = loadJsonStore();

  // 1. Schema inspection & DDL queries
  if (/SHOW\s+COLUMNS/i.test(cleanSql)) {
    const mockCols = [
      { Field: 'id' }, { Field: 'name' }, { Field: 'mobile' }, { Field: 'phone' },
      { Field: 'email' }, { Field: 'constituency' }, { Field: 'taluk' }, { Field: 'village' },
      { Field: 'preferredDate' }, { Field: 'date' }, { Field: 'fullAddress' }, { Field: 'full_address' },
      { Field: 'address' }, { Field: 'purpose' }, { Field: 'reason' }, { Field: 'status' },
      { Field: 'adminRemarks' }, { Field: 'timeSlot' }, { Field: 'createdAt' }, { Field: 'age' },
      { Field: 'bloodGroup' }, { Field: 'image' }, { Field: 'photo' }, { Field: 'bio' },
      { Field: 'suffix' }, { Field: 'title' }, { Field: 'description' }, { Field: 'category' },
      { Field: 'location' }, { Field: 'hasBadge' }, { Field: 'isBefore' }, { Field: 'time' },
      { Field: 'venue' }, { Field: 'attendees' }, { Field: 'ward' }, { Field: 'desktop' },
      { Field: 'mobile' }, { Field: 'content' }, { Field: 'author' }, { Field: 'uploadedAt' },
      { Field: 'volunteerName' }, { Field: 'volunteerWard' }, { Field: 'platform' },
      { Field: 'postUrl' }, { Field: 'tweetUrl' }, { Field: 'xProfileLink' },
      { Field: 'instagramProfileLink' }, { Field: 'motivationalQuoteEn' }, { Field: 'motivationalQuoteTa' },
      { Field: 'username' }, { Field: 'password' }, { Field: 'role' }, { Field: 'ipAddress' },
      { Field: 'browser' }, { Field: 'device' }, { Field: 'tokenHash' }, { Field: 'expiresAt' }, { Field: 'used' }
    ];
    return [mockCols, []];
  }

  if (/^(CREATE|ALTER|DROP)\s+/i.test(cleanSql)) {
    return [{}, []];
  }

  // 2. Identify target table name
  const tableMatch = cleanSql.match(/(?:FROM|INTO|UPDATE|TABLE)\s+[`"]?([a-zA-Z0-9_]+)[`"]?/i);
  const tableName = tableMatch ? tableMatch[1] : null;

  if (!tableName || store[tableName] === undefined) {
    if (/SELECT\s+count/i.test(cleanSql)) {
      const arr = tableName && store[tableName] ? store[tableName] : [];
      return [[{ count: Array.isArray(arr) ? arr.length : 0 }], []];
    }
    if (/SELECT/i.test(cleanSql)) {
      return [[], []];
    }
    return [{ affectedRows: 0, insertId: Date.now() }, []];
  }

  let tableData = store[tableName];
  if (tableName === 'social_profiles' && !Array.isArray(tableData) && typeof tableData === 'object' && tableData !== null) {
    tableData = [tableData];
  }
  if (!Array.isArray(tableData)) tableData = [];

  // 3. SELECT queries
  if (/^SELECT/i.test(cleanSql)) {
    if (/count\(\*\)/i.test(cleanSql)) {
      return [[{ count: tableData.length }], []];
    }

    let results = [...tableData];

    // Admin authentication query handling - strictly query stored database rows
    if (tableName === 'admins' && /username/i.test(cleanSql) && params.length >= 2) {
      const cleanUser = String(params[0] || '').toLowerCase().trim();
      const pwd = params[1];
      results = results.filter(u => u && u.username && u.username.toLowerCase().trim() === cleanUser && u.password === pwd);
    } else if (/WHERE\s+id\s*=\s*\?/i.test(cleanSql) && params.length > 0) {
      results = results.filter(item => String(item.id) === String(params[0]));
    } else if (/WHERE\s+LOWER\(username\)\s*=\s*LOWER\(\?\)/i.test(cleanSql) && params.length > 0) {
      results = results.filter(item => item && item.username && String(item.username).toLowerCase() === String(params[0]).toLowerCase());
    } else if (params.length >= 2 && /mobile\s*=\s*\?/i.test(cleanSql)) {
      results = results.filter(item => (item.mobile && item.mobile === params[0]) || (item.email && item.email === params[1]));
    }

    // ORDER BY handling
    if (/ORDER BY\s+(\w+)\s+(DESC|ASC)/i.test(cleanSql)) {
      const orderMatch = cleanSql.match(/ORDER BY\s+(\w+)\s+(DESC|ASC)/i);
      const col = orderMatch[1];
      const dir = orderMatch[2].toUpperCase();
      results.sort((a, b) => {
        const valA = a && a[col] !== undefined ? a[col] : '';
        const valB = b && b[col] !== undefined ? b[col] : '';
        if (dir === 'DESC') return valA < valB ? 1 : (valA > valB ? -1 : 0);
        return valA > valB ? 1 : (valA < valB ? -1 : 0);
      });
    }

    // LIMIT handling
    if (/LIMIT\s+1/i.test(cleanSql)) {
      results = results.slice(0, 1);
    } else if (/LIMIT\s+(\d+)/i.test(cleanSql)) {
      const limitMatch = cleanSql.match(/LIMIT\s+(\d+)/i);
      const limit = parseInt(limitMatch[1], 10);
      results = results.slice(0, limit);
    }

    return [results, []];
  }

  // 4. DELETE queries
  if (/^DELETE/i.test(cleanSql)) {
    if (/WHERE\s+id\s*=\s*\?/i.test(cleanSql) && params.length > 0) {
      store[tableName] = tableData.filter(item => String(item.id) !== String(params[0]));
    } else if (/WHERE\s+LOWER\(username\)\s*=\s*LOWER\(\?\)/i.test(cleanSql) && params.length > 0) {
      store[tableName] = tableData.filter(item => !item.username || String(item.username).toLowerCase() !== String(params[0]).toLowerCase());
    } else if (!/WHERE/i.test(cleanSql)) {
      store[tableName] = [];
    }
    saveJsonStore(store);
    return [{ affectedRows: 1 }, []];
  }

  // 5. INSERT queries
  if (/^INSERT/i.test(cleanSql)) {
    const colMatch = cleanSql.match(/\(([^)]+)\)\s*VALUES/i);
    let newObj = {};

    if (colMatch && params.length > 0) {
      const cols = colMatch[1].split(',').map(c => c.replace(/[`"\s]/g, ''));
      cols.forEach((col, idx) => {
        if (idx < params.length) {
          newObj[col] = params[idx];
        }
      });
    }

    if (!newObj.id) {
      newObj.id = Date.now();
    }

    if (!Array.isArray(store[tableName])) {
      store[tableName] = [];
    }

    store[tableName].push(newObj);
    saveJsonStore(store);
    return [{ insertId: newObj.id, affectedRows: 1 }, []];
  }

  // 6. UPDATE queries
  if (/^UPDATE/i.test(cleanSql)) {
    if (!Array.isArray(store[tableName])) {
      store[tableName] = [];
    }

    let idx = -1;
    if (/WHERE\s+LOWER\(username\)\s*=\s*LOWER\(\?\)/i.test(cleanSql) && params.length > 0) {
      const matchVal = params[params.length - 1];
      idx = store[tableName].findIndex(item => item && item.username && String(item.username).toLowerCase() === String(matchVal).toLowerCase());
    } else if (/WHERE\s+tokenHash\s*=\s*\?/i.test(cleanSql) && params.length > 0) {
      const matchVal = params[params.length - 1];
      idx = store[tableName].findIndex(item => item && item.tokenHash === String(matchVal));
    } else if (/WHERE\s+id\s*=\s*\?/i.test(cleanSql) && params.length > 0) {
      const matchVal = params[params.length - 1];
      idx = store[tableName].findIndex(item => item && String(item.id) === String(matchVal));
    } else {
      idx = store[tableName].findIndex(item => item && (String(item.id) === '1' || tableName === 'mla_data' || tableName === 'social_profiles'));
    }

    if (idx === -1) {
      if (tableName === 'mla_data' || tableName === 'social_profiles') {
        store[tableName].push({ id: 1 });
        idx = 0;
      }
    }

    if (idx !== -1 && store[tableName][idx]) {
      if (/attendees\s*=\s*attendees\s*\+\s*1/i.test(cleanSql)) {
        store[tableName][idx].attendees = (Number(store[tableName][idx].attendees) || 0) + 1;
      } else {
        // Parse SET col1=?, col2=? ...
        const setMatch = cleanSql.match(/SET\s+(.+?)(?:\s+WHERE|$)/i);
        if (setMatch) {
          const assignments = setMatch[1].split(',');
          let pIdx = 0;
          assignments.forEach(assign => {
            const parts = assign.split('=');
            if (parts.length === 2) {
              const colName = parts[0].replace(/[`"\s]/g, '');
              const valExpr = parts[1].trim();
              if (valExpr === '?' && pIdx < params.length) {
                let parsedVal = params[pIdx];
                if (parsedVal === 'true' || parsedVal === true) parsedVal = true;
                if (parsedVal === 'false' || parsedVal === false) parsedVal = false;
                store[tableName][idx][colName] = parsedVal;
                pIdx++;
              } else if (valExpr.toLowerCase() === 'true' || valExpr === '1') {
                store[tableName][idx][colName] = true;
              } else if (valExpr.toLowerCase() === 'false' || valExpr === '0') {
                store[tableName][idx][colName] = false;
              } else if (/^['"].*['"]$/.test(valExpr)) {
                store[tableName][idx][colName] = valExpr.slice(1, -1);
              }
            }
          });
        }
      }
      saveJsonStore(store);
    }
    return [{ affectedRows: 1 }, []];
  }

  return [[], []];
};

const createPoolWithConfig = (host, user, password, database = null) => {
  return mysql.createPool({
    host,
    user,
    password,
    ...(database ? { database } : {}),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  });
};

const ensureColumns = async (conn, table, columns) => {
  try {
    const [existing] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
    const existingNames = existing.map(c => c.Field.toLowerCase());
    for (const [colName, colType] of Object.entries(columns)) {
      if (!existingNames.includes(colName.toLowerCase())) {
        console.log(`[AUTO-MIGRATE] Adding missing column \`${colName}\` (${colType}) to \`${table}\`...`);
        await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${colName}\` ${colType}`);
      }
    }
  } catch (err) {
    console.warn(`[MIGRATE NOTICE] Could not inspect columns for \`${table}\`:`, err.message);
  }
};

const initMySQL = async () => {
  const hostCandidates = [DB_HOST, '127.0.0.1', 'localhost'];
  const passwordCandidates = [DB_PASSWORD, '', 'root'];

  let connected = false;

  for (const host of [...new Set(hostCandidates)]) {
    for (const pwd of [...new Set(passwordCandidates)]) {
      try {
        const rootPool = createPoolWithConfig(host, DB_USER, pwd);
        const rootConn = await rootPool.getConnection();
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        rootConn.release();
        await rootPool.end();

        activePool = createPoolWithConfig(host, DB_USER, pwd, DB_NAME);
        const conn = await activePool.getConnection();
        console.log(`[MYSQL CONNECTED] Connected to MySQL database: \`${DB_NAME}\` on ${host}!`);

        // Initialize table schemas
        await conn.query(`
          CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(100) NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS mla_data (
            id INT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            photo LONGTEXT NOT NULL,
            suffix VARCHAR(255) NOT NULL,
            constituency VARCHAR(255) NOT NULL,
            bio TEXT NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS live_news (
            id BIGINT PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            image LONGTEXT NOT NULL,
            content LONGTEXT NOT NULL,
            date VARCHAR(100) NOT NULL,
            category VARCHAR(100) NOT NULL,
            author VARCHAR(255) NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS daily_updates (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(100) NOT NULL,
            location VARCHAR(255) NOT NULL,
            date VARCHAR(100) NOT NULL,
            image LONGTEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'DONE',
            hasBadge BOOLEAN DEFAULT TRUE,
            isBefore BOOLEAN DEFAULT FALSE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS events (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            date VARCHAR(100) NOT NULL,
            time VARCHAR(100) NOT NULL,
            venue VARCHAR(255) NOT NULL,
            attendees INT DEFAULT 0,
            category VARCHAR(100) NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS grievances (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(100) NOT NULL,
            ward VARCHAR(100) NOT NULL,
            category VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            status VARCHAR(100) DEFAULT 'PENDING',
            adminRemarks TEXT NULL,
            createdAt VARCHAR(100) NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS hero_slides (
            id INT AUTO_INCREMENT PRIMARY KEY,
            desktop LONGTEXT NOT NULL,
            mobile LONGTEXT NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS volunteer_slides (
            id INT AUTO_INCREMENT PRIMARY KEY,
            desktop LONGTEXT NOT NULL,
            mobile LONGTEXT NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS appointments (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            mobile VARCHAR(100) NOT NULL DEFAULT '',
            email VARCHAR(255) NULL,
            constituency VARCHAR(100) NOT NULL DEFAULT 'Kallakurichi',
            taluk VARCHAR(100) NOT NULL DEFAULT '',
            village VARCHAR(100) NOT NULL DEFAULT '',
            preferredDate VARCHAR(100) NOT NULL DEFAULT '',
            fullAddress TEXT NULL,
            purpose TEXT NULL,
            timeSlot VARCHAR(255) NULL,
            status VARCHAR(100) DEFAULT 'PENDING',
            adminRemarks TEXT NULL,
            createdAt VARCHAR(100) NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS volunteers (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            age VARCHAR(50) NULL DEFAULT '25',
            bloodGroup VARCHAR(50) NULL DEFAULT 'O+',
            mobile VARCHAR(100) NOT NULL,
            email VARCHAR(255) NULL,
            constituency VARCHAR(100) NOT NULL DEFAULT 'Kallakurichi',
            taluk VARCHAR(100) NOT NULL,
            village VARCHAR(100) NOT NULL,
            fullAddress TEXT NOT NULL,
            image LONGTEXT NULL,
            status VARCHAR(100) DEFAULT 'PENDING',
            adminRemarks TEXT NULL,
            createdAt VARCHAR(100) NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS volunteer_photos (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            image LONGTEXT NOT NULL,
            title VARCHAR(500) NULL,
            volunteerName VARCHAR(255) NULL DEFAULT '',
            volunteerWard VARCHAR(100) NULL DEFAULT '',
            uploadedAt VARCHAR(100) NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS social_posts (
            id BIGINT PRIMARY KEY,
            platform VARCHAR(50) NOT NULL DEFAULT 'x',
            postUrl LONGTEXT NOT NULL,
            createdAt VARCHAR(100) NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS social_profiles (
            id INT PRIMARY KEY,
            xProfileLink LONGTEXT,
            instagramProfileLink LONGTEXT,
            motivationalQuoteEn TEXT,
            motivationalQuoteTa TEXT
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            tokenHash VARCHAR(255) NOT NULL,
            expiresAt BIGINT NOT NULL,
            used BOOLEAN DEFAULT FALSE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        conn.release();
        console.log('[MYSQL READY] All 13 MySQL Tables verified and ready.');
        isMySqlAvailable = true;
        connected = true;
        break;
      } catch (err) {
        // Continue to next host/password candidate
      }
    }
    if (connected) break;
  }

  if (!connected) {
    console.log('[DATA STORE NOTICE] MySQL server unavailable. Backend running smoothly with dataset fallback (database/data.json).');
    isMySqlAvailable = false;
  }
};

initMySQL();

// Fail-safe Universal Database Interface
const db = {
  query: async (sql, params = []) => {
    if (!isMySqlAvailable) {
      return runJsonQueryFallback(sql, params);
    }
    try {
      if (!activePool) {
        activePool = createPoolWithConfig(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
      }
      return await activePool.query(sql, params);
    } catch (err) {
      console.warn('[MYSQL NOTICE] Database query connection failed. Operating on fallback dataset.');
      isMySqlAvailable = false;
      return runJsonQueryFallback(sql, params);
    }
  },
  getConnection: async () => {
    if (!isMySqlAvailable) {
      return {
        query: async (sql, params) => runJsonQueryFallback(sql, params),
        release: () => {}
      };
    }
    try {
      if (!activePool) {
        activePool = createPoolWithConfig(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
      }
      return await activePool.getConnection();
    } catch (err) {
      isMySqlAvailable = false;
      return {
        query: async (sql, params) => runJsonQueryFallback(sql, params),
        release: () => {}
      };
    }
  }
};

module.exports = db;