// Automatically resolve API URL through Vite proxy for universal cross-device access
const getApiBase = () => {
  return '/api';
};

const API_BASE = getApiBase();

// Helper to make API requests directly to MySQL Backend
const apiRequest = async (endpoint, method = 'GET', body = null, fallbackKey = null, defaultVal = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    let res;
    try {
      res = await fetch(`${API_BASE}${endpoint}`, options);
    } catch (netErr) {
      // Direct fallback to 5001 if Vite proxy fails
      const host = typeof window !== 'undefined' && window.location ? window.location.hostname : '127.0.0.1';
      try {
        res = await fetch(`http://${host}:5001/api${endpoint}`, options);
      } catch (e) {}
    }

    // If proxy failed with non-ok response on GET, try direct port 5001
    if ((!res || !res.ok) && method === 'GET') {
      try {
        const host = typeof window !== 'undefined' && window.location ? window.location.hostname : '127.0.0.1';
        const directRes = await fetch(`http://${host}:5001/api${endpoint}`, options);
        if (directRes && directRes.ok) {
          res = directRes;
        }
      } catch (e) {}
    }

    if (res && res.ok) {
      const data = await res.json();
      if (fallbackKey && typeof window !== 'undefined' && window.localStorage && method === 'GET' && data) {
        try {
          localStorage.setItem(fallbackKey, JSON.stringify(data));
        } catch (e) {}
      }
      return data;
    }
  } catch (err) {
    console.error(`[API ERROR] Endpoint ${endpoint} communication failed:`, err.message);
  }

  // Graceful offline localStorage fallback for GET requests
  if (fallbackKey && typeof window !== 'undefined' && window.localStorage && method === 'GET') {
    try {
      const cached = localStorage.getItem(fallbackKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed !== null && parsed !== undefined) return parsed;
      }
    } catch (e) {}
  }

  return defaultVal;
};

export const api = {
  // MLA Data
  getMlaData: (defaultVal) =>
    apiRequest('/mla-data', 'GET', null, 'kallakurichi_mla', defaultVal),
  updateMlaData: async (data) => {
    const res = await apiRequest('/mla-data', 'PUT', data);
    const updated = {
      ...data,
      ...(res && res.photo ? { photo: res.photo } : {}),
      ...(res && res.data ? res.data : {})
    };
    return res;
  },

  // Daily Updates
  getDailyUpdates: (defaultVal) =>
    apiRequest('/daily-updates', 'GET', null, 'kallakurichi_updates_v3', defaultVal),
  addDailyUpdate: (data) =>
    apiRequest('/daily-updates', 'POST', data),
  updateDailyUpdate: (id, data) =>
    apiRequest(`/daily-updates/${id}`, 'PUT', data),
  deleteDailyUpdate: (id) =>
    apiRequest(`/daily-updates/${id}`, 'DELETE'),
  syncDailyUpdates: (list) =>
    apiRequest('/daily-updates', 'PUT', list),

  // Events
  getEvents: (defaultVal) =>
    apiRequest('/events', 'GET', null, 'kallakurichi_events', defaultVal),
  addEvent: (data) =>
    apiRequest('/events', 'POST', data),
  syncEvents: (list) =>
    apiRequest('/events', 'PUT', list),
  deleteEvent: (id) =>
    apiRequest(`/events/${id}`, 'DELETE'),
  registerRsvp: (id) =>
    apiRequest(`/events/${id}/attend`, 'POST'),

  // Grievances
  getGrievances: (defaultVal) =>
    apiRequest('/grievances', 'GET', null, 'kallakurichi_grievances', defaultVal),
  submitGrievance: (data) =>
    apiRequest('/grievances', 'POST', data),
  syncGrievances: (list) =>
    apiRequest('/grievances', 'PUT', list),
  updateGrievanceStatus: (id, data) =>
    apiRequest(`/grievances/${id}`, 'PUT', data),

  // Hero Slides
  getHeroSlides: async (defaultVal = []) => {
    const res = await apiRequest('/hero-slides', 'GET', null, 'kallakurichi_slides', defaultVal);
    if (Array.isArray(res) && res.length > 0) {
      return res.map(s => typeof s === 'string' ? { desktop: s, mobile: s } : s).filter(s => s && (s.desktop || s.mobile));
    }
    return defaultVal;
  },
  syncHeroSlides: (list) =>
    apiRequest('/hero-slides', 'PUT', list),

  // Live News
  getLiveNews: (defaultVal = []) =>
    apiRequest('/live-news', 'GET', null, 'kallakurichi_news', defaultVal),
  addLiveNews: async (data) => {
    const res = await apiRequest('/live-news', 'POST', data);
    return res;
  },
  syncLiveNews: async (list) => {
    const res = await apiRequest('/live-news', 'PUT', list);
    return res;
  },
  updateLiveNews: async (id, data) => {
    const res = await apiRequest(`/live-news/${id}`, 'PUT', data);
    return res;
  },
  deleteLiveNews: async (id) => {
    return apiRequest(`/live-news/${id}`, 'DELETE');
  },

  // Volunteer Slides
  getVolunteerSlides: async (defaultVal = []) => {
    const res = await apiRequest('/volunteer-slides', 'GET', null, 'kallakurichi_volunteer_slides', defaultVal);
    if (Array.isArray(res) && res.length > 0) {
      return res.map(s => typeof s === 'string' ? { desktop: s, mobile: s } : s).filter(s => s && (s.desktop || s.mobile));
    }
    return defaultVal;
  },
  syncVolunteerSlides: (list) =>
    apiRequest('/volunteer-slides', 'PUT', list),

  // Appointments
  getAppointments: (defaultVal) =>
    apiRequest('/appointments', 'GET', null, null, defaultVal),
  bookAppointment: (data) =>
    apiRequest('/appointments', 'POST', data),
  syncAppointments: (list) =>
    apiRequest('/appointments', 'PUT', list),
  updateAppointmentStatus: (id, data) =>
    apiRequest(`/appointments/${id}`, 'PUT', data),
  deleteAppointment: (id) =>
    apiRequest(`/appointments/${id}`, 'DELETE'),

  // Volunteers
  getVolunteers: (defaultVal) =>
    apiRequest('/volunteers', 'GET', null, 'kallakurichi_volunteers', defaultVal),
  registerVolunteer: (data) =>
    apiRequest('/volunteers', 'POST', data),
  syncVolunteers: (list) =>
    apiRequest('/volunteers', 'PUT', list),
  updateVolunteerStatus: (id, data) =>
    apiRequest(`/volunteers/${id}/status`, 'PUT', data),
  deleteVolunteer: (id) =>
    apiRequest(`/volunteers/${id}`, 'DELETE'),

  // Volunteer Photos
  getVolunteerPhotos: (defaultVal) =>
    apiRequest('/volunteer-photos', 'GET', null, 'kallakurichi_volunteer_photos', defaultVal),
  addVolunteerPhoto: (data) =>
    apiRequest('/volunteer-photos', 'POST', data),
  uploadVolunteerPhoto: (data) =>
    apiRequest('/volunteer-photos', 'POST', data),
  updateVolunteerPhoto: (id, data) =>
    apiRequest(`/volunteer-photos/${id}`, 'PUT', data),
  deleteVolunteerPhoto: (id) =>
    apiRequest(`/volunteer-photos/${id}`, 'DELETE'),
  syncVolunteerPhotos: (list) =>
    apiRequest('/volunteer-photos', 'PUT', list),

  // Helper to capture client device info for logs
  getClientInfo: () => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    let browser = 'Google Chrome';
    if (ua.includes('Edg/') || ua.includes('Edge/')) browser = 'Microsoft Edge';
    else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Apple Safari';
    else if (ua.includes('Chrome/')) browser = 'Google Chrome';

    let device = 'Desktop PC';
    if (ua.includes('iPhone')) device = 'iPhone (iOS)';
    else if (ua.includes('iPad')) device = 'iPad (iPadOS)';
    else if (ua.includes('Android')) device = 'Android Mobile';
    else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) device = 'Apple macOS';
    else if (ua.includes('Windows NT 10.0')) device = 'Windows 11 / 10';
    else if (ua.includes('Windows')) device = 'Windows PC';
    else if (ua.includes('Linux')) device = 'Linux System';

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
    const createdAt = `${day} ${month} ${year}, ${formattedHour}:${minutes} ${ampm}`;

    return { browser, device, createdAt };
  },

  login: async (username, password) => {
    return api.loginAdmin(username, password);
  },
  loginAdmin: async (username, password) => {
    const cleanUser = (username || '').trim();
    try {
      const res = await fetch(`${API_BASE}/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password })
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      } else if (res.status === 401 || res.status === 400) {
        const errData = await res.json().catch(() => ({ authenticated: false, error: 'Invalid username or password' }));
        return errData;
      }
    } catch (err) {
      console.warn('[API ERROR] Unable to reach backend authentication API.');
    }
    return { authenticated: false, error: 'Invalid username or password' };
  },
  getAdmins: (defaultVal = []) =>
    apiRequest('/admins', 'GET', null, 'kallakurichi_admins', defaultVal),
  syncAdmins: (list) =>
    apiRequest('/admins', 'PUT', list),
  addAdmin: (data) =>
    apiRequest('/admins', 'POST', data),
  deleteAdmin: (username) =>
    apiRequest(`/admins/${encodeURIComponent(username)}`, 'DELETE'),

  // Password Reset Flow
  requestPasswordReset: (email) =>
    apiRequest('/admins/forgot-password', 'POST', { email }),
  validateResetToken: (token) =>
    apiRequest(`/admins/reset-password/validate?token=${encodeURIComponent(token)}`, 'GET'),
  resetAdminPassword: (token, newPassword) =>
    apiRequest('/admins/reset-password', 'POST', { token, newPassword }),

  // Access Logs Audit
  getAccessLogs: (defaultVal = []) =>
    apiRequest('/access-logs', 'GET', null, 'kallakurichi_access_logs', defaultVal),
  clearAccessLogs: () =>
    apiRequest('/access-logs', 'DELETE'),
  addAccessLog: (data) =>
    apiRequest('/access-logs', 'POST', data),

  // Social Media Posts & Profiles
  getSocialPosts: (defaultVal) =>
    apiRequest('/social-posts', 'GET', null, 'kallakurichi_social_posts', defaultVal),
  addSocialPost: (data) =>
    apiRequest('/social-posts', 'POST', data),
  syncSocialPosts: (list) =>
    apiRequest('/social-posts', 'PUT', list),
  deleteSocialPost: (id) =>
    apiRequest(`/social-posts/${id}`, 'DELETE'),

  getSocialProfiles: (defaultVal) =>
    apiRequest('/social-profiles', 'GET', null, 'kallakurichi_social_profiles', defaultVal),
  updateSocialProfiles: (data) =>
    apiRequest('/social-profiles', 'PUT', data),

  // Dedicated Category-wise Image Upload Helper
  uploadImage: (image, category = 'misc', filename = '') =>
    apiRequest(`/upload/${category}`, 'POST', { image, filename })
};
