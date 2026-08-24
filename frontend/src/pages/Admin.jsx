import { useState, useEffect, useRef, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Key, Eye, EyeOff, Shield, X, Calendar, Check, AlertCircle, Award, Download, User, Phone
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { api } from '../services/api';
import TVKVolunteerIDCard from '../components/TVKVolunteerIDCard';
import { exportVolunteerCardCanvas } from '../utils/directCardCanvas';

// Admin Core Components & Sub-Pages
import AdminSidebar from '../admin/components/AdminSidebar';
import AdminTopbar from '../admin/components/AdminTopbar';
import ConfirmModal from '../admin/components/ConfirmModal';
import ImageUploadField from '../admin/components/ImageUploadField';
import DateTimePickerInput, { formatToDateOnly, parseDateTimeString } from '../admin/components/DateTimePickerInput';

import Dashboard from '../admin/pages/Dashboard';
import Home from '../admin/pages/Home';
import About from '../admin/pages/About';
import News from '../admin/pages/News';
import Events from '../admin/pages/Events';
import Social from '../admin/pages/Social';
import DailyUpdates from '../admin/pages/DailyUpdates';
import Appointments from '../admin/pages/Appointments';
import Volunteers from '../admin/pages/Volunteers';
import AccessLogs from '../admin/pages/AccessLogs';
import Settings from '../admin/pages/Settings';

// React Error Boundary Component to prevent blank screen unmounts
class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Tab Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-red-200 shadow-md my-6 space-y-4 max-w-xl mx-auto text-left">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-black text-gray-900 text-center">Section Temporary Error</h3>
          <p className="text-xs text-gray-600 font-semibold text-center leading-relaxed">
            An unexpected rendering issue occurred in this section. The rest of the Admin Portal remains fully active.
          </p>
          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-2xl bg-[#800000] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#600000] transition cursor-pointer"
            >
              Refresh Section
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Responsive Admin Volunteer ID Card Modal with auto-scaling
const AdminIdCardModal = ({ vol, onClose, onDownload, isDownloading }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.85);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 16;
        if (width > 0) {
          setScale(Math.min(1, width / 680));
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [vol]);

  if (!vol) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl sm:max-w-3xl w-full shadow-2xl border border-gray-100 space-y-4 text-center">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="text-left">
            <h3 className="text-base sm:text-lg font-black text-gray-900">Official Membership ID Card</h3>
            <p className="text-xs text-gray-500 font-semibold">{vol.name} • <span className="font-mono text-gray-700 font-bold">{vol.id || 'TVK-VOL'}</span></p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Auto-Scaled ID Card Preview Container */}
        <div 
          ref={containerRef}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50/80 flex items-center justify-center relative overflow-hidden shadow-inner"
          style={{ height: `${Math.round(390 * scale) + 16}px` }}
        >
          <div 
            id={`admin-tvk-card-${vol.id}`} 
            className="origin-top-left absolute"
            style={{ 
              transform: `scale(${scale})`, 
              width: '680px', 
              height: '390px',
              top: '8px',
              left: `${Math.max(0, ((containerRef.current?.clientWidth || (680 * scale)) - 680 * scale) / 2)}px`
            }}
          >
            <TVKVolunteerIDCard vol={vol} />
          </div>
        </div>

        <div className="flex justify-center space-x-3 pt-2 border-t border-gray-100">
          <button
            disabled={isDownloading}
            onClick={onDownload}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Exporting High-Res Card...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Volunteer Card</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Auth credentials states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  
  // URL Reset Token states
  const [urlResetToken, setUrlResetToken] = useState(null);
  const [isResetTokenValid, setIsResetTokenValid] = useState(false);
  const [resetTokenEmail, setResetTokenEmail] = useState('');
  const [resetTokenError, setResetTokenError] = useState('');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [adminsList, setAdminsList] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [loginError, setLoginError] = useState(false);

  // Auto-detect resetToken in URL query params on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    if (token) {
      setUrlResetToken(token);
      api.validateResetToken(token).then(res => {
        if (res && res.valid) {
          setIsResetTokenValid(true);
          setResetTokenEmail(res.email || '');
          setShowResetPasswordModal(true);
        } else {
          setIsResetTokenValid(false);
          setResetTokenError(res?.error || 'Invalid or expired password reset link');
          setShowResetPasswordModal(true);
        }
      }).catch(err => {
        setIsResetTokenValid(false);
        setResetTokenError('Failed to validate reset token');
        setShowResetPasswordModal(true);
      });
    }
  }, []);

  // Active Tab
  const [activeTab, setActiveTabState] = useState(() => {
    return sessionStorage.getItem('cdo_admin_active_tab') || 'overview';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    sessionStorage.setItem('cdo_admin_active_tab', tab);
  };

  // Toast Notification
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Delete Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    title: 'Confirm Deletion',
    message: 'Are you sure you want to permanently delete this item?',
    onConfirm: null
  });

  const triggerConfirmDelete = (config, maybeMessage, maybeOnConfirm) => {
    if (typeof config === 'function') {
      setConfirmDelete({
        isOpen: true,
        title: maybeMessage || 'Confirm Deletion',
        message: maybeOnConfirm || 'Are you sure you want to permanently delete this item?',
        onConfirm: () => {
          config();
          setConfirmDelete(prev => ({ ...prev, isOpen: false }));
        }
      });
    } else if (typeof config === 'string') {
      setConfirmDelete({
        isOpen: true,
        title: config || 'Confirm Deletion',
        message: maybeMessage || 'Are you sure you want to permanently delete this item?',
        onConfirm: () => {
          if (maybeOnConfirm) maybeOnConfirm();
          setConfirmDelete(prev => ({ ...prev, isOpen: false }));
        }
      });
    } else {
      setConfirmDelete({
        isOpen: true,
        title: config?.title || 'Confirm Deletion',
        message: config?.message || 'Are you sure you want to permanently delete this item?',
        onConfirm: () => {
          if (config?.onConfirm) config.onConfirm();
          setConfirmDelete(prev => ({ ...prev, isOpen: false }));
        }
      });
    }
  };

  // ==========================================
  // MAIN DATA STATES
  // ==========================================
  const [heroSlides, setHeroSlides] = useState([]);
  const [volunteerSlides, setVolunteerSlides] = useState([]);
  const [mlaData, setMlaData] = useState({});
  const [liveNews, setLiveNews] = useState([]);
  const [socialPosts, setSocialPosts] = useState([]);
  const [socialProfiles, setSocialProfiles] = useState({});
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [events, setEvents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [volunteerPhotos, setVolunteerPhotos] = useState([]);

  // ==========================================
  // MODAL FORM STATES (Clean English)
  // ==========================================
  // 1. Add Slide Modal
  const [showAddSlideModal, setShowAddSlideModal] = useState(false);
  const [addSlideTarget, setAddSlideTarget] = useState('banners');
  const [newSlideImage, setNewSlideImage] = useState('');

  // 2. Add News Modal
  const [showAddNewsModal, setShowAddNewsModal] = useState(false);
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newNewsDate, setNewNewsDate] = useState(() => formatToDateOnly(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  const [newNewsCategory, setNewNewsCategory] = useState('NEWS MEDIA');
  const [newNewsImage, setNewNewsImage] = useState('');

  // Edit News Modal
  const [showEditNewsModal, setShowEditNewsModal] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [editNewsTitle, setEditNewsTitle] = useState('');
  const [editNewsContent, setEditNewsContent] = useState('');
  const [editNewsDate, setEditNewsDate] = useState(() => formatToDateOnly(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  const [editNewsCategory, setEditNewsCategory] = useState('NEWS MEDIA');
  const [editNewsImage, setEditNewsImage] = useState('');

  // Add Event Modal
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventVenue, setNewEventVenue] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('Meeting');

  // 3. Add Daily Work Modal
  const [showAddDailyModal, setShowAddDailyModal] = useState(false);
  const [newDailyTitle, setNewDailyTitle] = useState('');
  const [newDailyDescription, setNewDailyDescription] = useState('');
  const [newDailyCategory, setNewDailyCategory] = useState('ROADS');
  const [newDailyLocation, setNewDailyLocation] = useState('');
  const [newDailyDate, setNewDailyDate] = useState('');
  const [newDailyImage, setNewDailyImage] = useState('');
  const [newDailyStatus, setNewDailyStatus] = useState('DONE');

  // Edit Daily Work Modal
  const [showEditDailyModal, setShowEditDailyModal] = useState(false);
  const [editingDailyId, setEditingDailyId] = useState(null);
  const [editDailyTitle, setEditDailyTitle] = useState('');
  const [editDailyDescription, setEditDailyDescription] = useState('');
  const [editDailyCategory, setEditDailyCategory] = useState('ROADS');
  const [editDailyLocation, setEditDailyLocation] = useState('');
  const [editDailyDate, setEditDailyDate] = useState('');
  const [editDailyImage, setEditDailyImage] = useState('');
  const [editDailyStatus, setEditDailyStatus] = useState('DONE');

  // 4. Add Social Post Modal
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [newPostPlatform, setNewPostPlatform] = useState('x');
  const [newPostUrl, setNewPostUrl] = useState('');

  // 6. Admin Management Modals
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminMobile, setNewAdminMobile] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('Admin');
  const [showNewAdminPass, setShowNewAdminPass] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminMobile, setEditAdminMobile] = useState('');
  const [editAdminPass, setEditAdminPass] = useState('');
  const [editAdminRole, setEditAdminRole] = useState('Admin');
  const [showEditAdminPass, setShowEditAdminPass] = useState(false);

  // 7. Volunteer Photo Modals
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [newPhotoImage, setNewPhotoImage] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');

  // 8. ID Card Preview Modal
  const [activeIdCardVolunteer, setActiveIdCardVolunteer] = useState(null);
  const [isExportingCard, setIsExportingCard] = useState(false);

  // ==========================================
  // INITIAL DATA LOAD
  // ==========================================
  const loadAllData = async () => {
    try {
      const results = await Promise.allSettled([
        api.getHeroSlides([]),
        api.getVolunteerSlides([]),
        api.getMlaData({}),
        api.getLiveNews([]),
        api.getSocialPosts([]),
        api.getSocialProfiles({}),
        api.getDailyUpdates([]),
        api.getEvents([]),
        api.getAppointments([]),
        api.getVolunteers([]),
        api.getVolunteerPhotos([]),
        api.getAdmins([]),
        api.getAccessLogs([])
      ]);

      const getValue = (idx, fallback) => {
        if (results[idx] && results[idx].status === 'fulfilled') {
          const val = results[idx].value;
          return val !== null && val !== undefined ? val : fallback;
        }
        return fallback;
      };

      setHeroSlides(getValue(0, []));
      setVolunteerSlides(getValue(1, []));
      setMlaData(getValue(2, {}));
      setLiveNews(getValue(3, []));
      setSocialPosts(getValue(4, []));
      setSocialProfiles(getValue(5, {}));
      setDailyUpdates(getValue(6, []));
      setEvents(getValue(7, []));
      setAppointments(getValue(8, []));
      setVolunteers(getValue(9, []));
      setVolunteerPhotos(getValue(10, []));
      setAdminsList(getValue(11, []));
      setAccessLogs(getValue(12, []));
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    const savedUser = sessionStorage.getItem('cdo_admin_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setIsAuthenticated(true);
        loadAllData();
      } catch (e) {
        sessionStorage.removeItem('cdo_admin_user');
      }
    }
  }, []);

  // Auto-refresh all data whenever activeTab changes or portal is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [activeTab, isAuthenticated]);

  // ==========================================
  // AUTHENTICATION HANDLERS
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(false);

    try {
      const res = await api.login(username, password);
      if (res && res.authenticated) {
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        sessionStorage.setItem('cdo_admin_user', JSON.stringify(res.user));
        loadAllData();
        triggerToast('Welcome to TVK Kallakurichi Admin Portal!');
      } else {
        setLoginError(true);
      }
    } catch (err) {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    sessionStorage.removeItem('cdo_admin_user');
    sessionStorage.removeItem('cdo_admin_active_tab');
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  const handleSaveMla = async (formData) => {
    try {
      await api.updateMlaData(formData);
      setMlaData(formData);
      triggerToast('MLA details updated successfully!');
    } catch (err) {
      triggerToast('Failed to update MLA details.');
    }
  };

  const handleAddSlide = (target) => {
    if (target === 'banners' && heroSlides.length >= 3) {
      triggerToast('Maximum 3 Hero banners limit reached! Please delete an existing banner.');
      return;
    }
    setAddSlideTarget(target);
    setNewSlideImage('');
    setShowAddSlideModal(true);
  };

  const handleDeleteSlide = async (target, index) => {
    if (target === 'banners') {
      const updated = heroSlides.filter((_, idx) => idx !== index);
      setHeroSlides(updated);
      await api.syncHeroSlides(updated);
      triggerToast('Banner slide deleted successfully!');
    } else {
      const updated = volunteerSlides.filter((_, idx) => idx !== index);
      setVolunteerSlides(updated);
      await api.syncVolunteerSlides(updated);
      triggerToast('Volunteer slide deleted successfully!');
    }
  };

  const handleOpenEditNewsModal = (news) => {
    setEditingNewsId(news.id);
    setEditNewsTitle(news.title || '');
    setEditNewsContent(news.content || news.description || '');
    setEditNewsCategory(news.category || 'NEWS MEDIA');
    setEditNewsImage(news.image || '');
    let cleanDate = '';
    if (news.date) {
      const parsed = parseDateTimeString(news.date);
      cleanDate = formatToDateOnly(parsed.year, parsed.month, parsed.day);
    } else {
      const now = new Date();
      cleanDate = formatToDateOnly(now.getFullYear(), now.getMonth(), now.getDate());
    }
    setEditNewsDate(cleanDate);
    setShowEditNewsModal(true);
  };

  const handleSaveEditNews = async () => {
    if (!editNewsTitle.trim() || !editingNewsId) {
      triggerToast('Headline title is required!', 'error');
      return;
    }
    if (!editNewsImage) {
      triggerToast('News thumbnail image is required!', 'error');
      return;
    }
    const cleanDate = editNewsDate ? editNewsDate.split(',')[0].trim() : formatToDateOnly(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    const payload = {
      title: editNewsTitle.trim(),
      image: editNewsImage,
      content: editNewsContent.trim(),
      date: cleanDate,
      category: editNewsCategory.trim() || 'NEWS MEDIA',
      author: "Desk of Hon'ble MLA Mr. C. Arul Vignesh"
    };

    const res = await api.updateLiveNews(editingNewsId, payload);
    const finalImage = res?.data?.image !== undefined ? res.data.image : (res?.image || editNewsImage);

    const updated = liveNews.map(n => {
      if (String(n.id) === String(editingNewsId)) {
        return {
          ...n,
          ...payload,
          image: finalImage
        };
      }
      return n;
    });

    setLiveNews(updated);
    triggerToast('News announcement updated successfully!');
    setShowEditNewsModal(false);
  };

  const handleDeleteNews = async (id) => {
    const updated = liveNews.filter(n => n.id !== id);
    setLiveNews(updated);
    await api.deleteLiveNews(id);
    await api.syncLiveNews(updated);
    triggerToast('News article deleted.');
  };

  const handleDeleteEvent = async (id) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    await api.syncEvents(updated);
    triggerToast('Event record deleted.');
  };

  const handleDeletePost = async (id) => {
    const updated = socialPosts.filter(p => p.id !== id);
    setSocialPosts(updated);
    await api.syncSocialPosts(updated);
    triggerToast('Social post deleted.');
  };

  const handleSaveSocialProfiles = async (newProfiles) => {
    await api.updateSocialProfiles(newProfiles);
    setSocialProfiles(newProfiles);
    triggerToast('Social profile links & quotes updated!');
  };

  const handleOpenEditDailyModal = (work) => {
    setEditingDailyId(work.id);
    setEditDailyTitle(work.title || '');
    setEditDailyDescription(work.description || '');
    setEditDailyCategory(work.category || 'ROADS');
    setEditDailyLocation(work.location || '');
    let isoDate = new Date().toISOString().split('T')[0];
    if (work.date) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(work.date)) {
        isoDate = work.date;
      } else {
        const parsed = Date.parse(work.date);
        if (!isNaN(parsed)) {
          isoDate = new Date(parsed).toISOString().split('T')[0];
        }
      }
    }
    setEditDailyDate(isoDate);
    setEditDailyImage(work.image || '');
    setEditDailyStatus(work.status || 'DONE');
    setShowEditDailyModal(true);
  };

  const handleSaveEditDaily = async () => {
    if (!editDailyTitle.trim() || !editDailyImage) return;
    const formattedDate = editDailyDate ? new Date(editDailyDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const updatedRecord = {
      id: editingDailyId,
      title: editDailyTitle.trim(),
      description: editDailyDescription.trim(),
      category: editDailyCategory,
      location: editDailyLocation.trim() || 'Constituency',
      date: formattedDate,
      image: editDailyImage,
      status: editDailyStatus || 'DONE'
    };

    const res = await api.updateDailyUpdate(editingDailyId, updatedRecord);
    const finalRecord = {
      ...updatedRecord,
      ...(res && res.data && res.data.image ? { image: res.data.image } : {})
    };

    const updated = dailyUpdates.map(d => d.id === editingDailyId ? { ...d, ...finalRecord } : d);
    setDailyUpdates(updated);
    triggerToast('Completed work record updated successfully!');
    setShowEditDailyModal(false);
  };

  const handleDeleteDaily = async (id) => {
    const updated = dailyUpdates.filter(d => d.id !== id);
    setDailyUpdates(updated);
    await api.deleteDailyUpdate(id);
    await api.syncDailyUpdates(updated);
    triggerToast('Completed work record deleted.');
  };

  const handleUpdateApptStatus = async (id, status, timeSlot = undefined) => {
    const target = appointments.find(a => a.id === id);
    const slot = timeSlot !== undefined ? timeSlot : target?.timeSlot || '';
    await api.updateAppointmentStatus(id, { status, timeSlot: slot, adminRemarks: target?.adminRemarks || '' });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status, timeSlot: slot } : a));
    triggerToast(`Appointment ${status.toLowerCase()} successfully!`);
  };

  const handleSaveApptRemarks = async (id, remarks) => {
    const target = appointments.find(a => a.id === id);
    await api.updateAppointmentStatus(id, { status: target?.status || 'PENDING', adminRemarks: remarks });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, adminRemarks: remarks } : a));
    triggerToast('Remarks saved.');
  };

  const handleAssignApptSlot = async (id, slot) => {
    const target = appointments.find(a => a.id === id);
    await api.updateAppointmentStatus(id, { status: target?.status || 'APPROVED', timeSlot: slot, adminRemarks: target?.adminRemarks || '' });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, timeSlot: slot } : a));
    triggerToast('Time slot assigned.');
  };

  const handleDeleteAppt = async (id) => {
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    await api.deleteAppointment(id);
    triggerToast('Appointment record deleted.');
  };

  const handleUpdateVolStatus = async (id, status) => {
    const target = volunteers.find(v => v.id === id);
    await api.updateVolunteerStatus(id, { status, adminRemarks: target?.adminRemarks || '' });
    setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status } : v));
    triggerToast(`Volunteer application ${status.toLowerCase()}!`);
  };

  const handleDeleteVolunteer = async (vol) => {
    if (!vol || !vol.id) return;
    try {
      const res = await api.deleteVolunteer(vol.id);
      if (!res || res.error) {
        triggerToast(res?.error || 'Failed to delete volunteer from server', 'error');
        return;
      }
      const updated = volunteers.filter(v => v.id !== vol.id);
      setVolunteers(updated);
      triggerToast(`Volunteer "${vol.name || vol.id}" permanently deleted from database and storage!`);
    } catch (err) {
      console.error('Failed to delete volunteer:', err);
      triggerToast('Failed to delete volunteer', 'error');
    }
  };

  const handleExportCard = async (vol) => {
    if (!vol) return;
    setIsExportingCard(true);
    try {
      await exportVolunteerCardCanvas(vol);
      triggerToast('Volunteer ID Card downloaded successfully!');
    } catch (err) {
      console.error('Failed to export ID card image:', err);
      triggerToast('Failed to export ID Card image', 'error');
    } finally {
      setIsExportingCard(false);
    }
  };

  const handleDeleteVolunteerPhoto = async (photo) => {
    if (!photo || !photo.id) return;
    try {
      const res = await api.deleteVolunteerPhoto(photo.id);
      if (!res || res.error) {
        triggerToast(res?.error || 'Failed to delete photo from server', 'error');
        return;
      }
      const updated = volunteerPhotos.filter(p => p.id !== photo.id);
      setVolunteerPhotos(updated);
      triggerToast('Fieldwork photo permanently deleted from database and storage!');
    } catch (err) {
      console.error('Failed to delete photo:', err);
      triggerToast('Failed to delete photo', 'error');
    }
  };

  const handleDeleteAdmin = async (adminUsername) => {
    const updated = adminsList.filter(a => a.username !== adminUsername);
    setAdminsList(updated);
    await api.syncAdmins(updated);
    triggerToast(`Admin account ${adminUsername} deleted.`);
  };

  const handleOpenEditAdminModal = (admin) => {
    setEditingAdmin(admin);
    setEditAdminName(admin.name || admin.username || '');
    setEditAdminMobile(admin.mobile || admin.phone || '');
    setEditAdminPass(admin.password || '');
    setEditAdminRole(admin.role || 'Admin');
    setShowEditAdminPass(false);
  };

  const handleSaveEditAdmin = async () => {
    if (!editingAdmin) return;
    const cleanMobile = (editAdminMobile || '').replace(/\D/g, '');
    if (cleanMobile && cleanMobile.length !== 10) {
      triggerToast('Mobile number must be exactly 10 digits', 'error');
      return;
    }
    const updated = adminsList.map(a => {
      if (a.username === editingAdmin.username) {
        return {
          ...a,
          name: a.username,
          mobile: cleanMobile,
          password: editAdminPass || a.password,
          role: editAdminRole || a.role || 'Admin'
        };
      }
      return a;
    });

    setAdminsList(updated);
    try {
      await api.syncAdmins(updated);
      triggerToast(`Admin "${editingAdmin.username}" details updated!`);
    } catch (err) {
      console.error('Failed to sync updated admin:', err);
    }
    setEditingAdmin(null);
  };

  const handleRefreshLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await api.getAccessLogs([]);
      setAccessLogs(logs || []);
      triggerToast('Access logs refreshed');
    } catch (err) {
      console.error('Failed to refresh access logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await api.clearAccessLogs();
      setAccessLogs([]);
      triggerToast('All access logs cleared successfully!');
    } catch (err) {
      console.error('Failed to clear access logs:', err);
      triggerToast('Failed to clear access logs', 'error');
    }
  };

  // ==========================================
  // TVK FLAG THEMED PREMIUM LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#450000] via-[#2d0000] to-[#1a0000] flex items-center justify-center p-4 relative overflow-hidden">
        {/* TVK Flag Golden & Crimson Glow Overlays */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#FFCC00]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-[#8B0000]/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="bg-gradient-to-b from-[#3a0000]/90 to-[#220000]/95 border-2 border-[#FFCC00]/30 rounded-3xl p-7 sm:p-10 max-w-md w-full shadow-2xl shadow-black/80 backdrop-blur-xl relative z-10 text-center">
          {/* TVK Flag Styled Badge */}
          <div className="relative mx-auto mb-5 w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FFCC00] via-[#F59E0B] to-[#FFCC00] p-1 shadow-xl shadow-yellow-500/25 flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-[#540000] flex flex-col items-center justify-center border border-[#FFCC00]/50">
              <span className="font-black text-[#FFCC00] text-2xl tracking-wider leading-none">TVK</span>
              <span className="text-[7px] text-yellow-200 font-extrabold uppercase tracking-widest mt-0.5">HQ</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Kallakurichi CDO</h2>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#FFCC00]/15 border border-[#FFCC00]/30 text-[#FFCC00] text-[10px] font-black uppercase tracking-widest mt-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] animate-pulse"></span>
            <span>Official Admin Console</span>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>Invalid username or password. Please try again.</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-black text-[#FFCC00]/90 uppercase tracking-wider block mb-1.5">Admin Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter valid username"
                className="w-full px-4 py-3 rounded-2xl bg-[#1f0000]/80 border border-[#FFCC00]/25 text-white text-xs font-bold focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-[#FFCC00]/90 uppercase tracking-wider block">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(username || '');
                    setShowForgotPasswordModal(true);
                  }}
                  className="text-[10px] font-extrabold text-[#FFCC00]/80 hover:text-[#FFCC00] hover:underline transition cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-[#1f0000]/80 border border-[#FFCC00]/25 text-white text-xs font-bold focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-200/60 hover:text-[#FFCC00] transition"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FFCC00] via-[#F59E0B] to-[#FFCC00] hover:brightness-105 text-[#420000] font-black text-xs uppercase tracking-wider shadow-lg shadow-yellow-500/25 transition mt-2 cursor-pointer border border-[#FFCC00]/50"
            >
              Sign In to Admin Portal
            </button>
          </form>
        </div>

        {/* Forgot Password Reset UI Modal */}
        {showForgotPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-gradient-to-b from-[#3a0000] to-[#220000] border-2 border-[#FFCC00]/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-left relative z-10">
              <div className="flex items-center justify-between border-b border-[#FFCC00]/20 pb-3">
                <h3 className="text-base font-black text-white">Reset Admin Password</h3>
                <button onClick={() => setShowForgotPasswordModal(false)} className="p-1 text-yellow-200/60 hover:text-[#FFCC00] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-yellow-100/80 font-medium leading-relaxed">
                Enter your registered admin email address to request password recovery.
              </p>

              <div>
                <label className="text-[10px] font-black text-[#FFCC00]/90 uppercase tracking-wider block mb-1.5">Admin Email / Username</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter valid email or username"
                  className="w-full px-4 py-3 rounded-2xl bg-[#1f0000]/80 border border-[#FFCC00]/25 text-white text-xs font-bold focus:outline-none focus:border-[#FFCC00]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#FFCC00]/20">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#FFCC00]/30 text-xs font-bold text-yellow-200 hover:bg-[#FFCC00]/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!forgotEmail.trim()) {
                      triggerToast('Please enter your admin email address', 'error');
                      return;
                    }
                    try {
                      const res = await api.requestPasswordReset(forgotEmail.trim());
                      triggerToast(res?.message || 'If an account is eligible for password reset, a password reset link has been sent.');
                    } catch (e) {
                      triggerToast('If an account is eligible for password reset, a password reset link has been sent.');
                    }
                    setShowForgotPasswordModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFCC00] to-[#F59E0B] text-[#420000] text-xs font-black uppercase tracking-wider shadow-md hover:brightness-105 cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset New Password Modal (Triggered by Email Link) */}
        {showResetPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-gradient-to-b from-[#3a0000] to-[#220000] border-2 border-[#FFCC00]/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-left relative z-10">
              <div className="flex items-center justify-between border-b border-[#FFCC00]/20 pb-3">
                <h3 className="text-base font-black text-white">Create New Password</h3>
                <button 
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }} 
                  className="p-1 text-yellow-200/60 hover:text-[#FFCC00] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!isResetTokenValid ? (
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-red-200">Link Invalid or Expired</h4>
                  <p className="text-xs text-yellow-100/70 leading-relaxed">
                    {resetTokenError || 'This password reset link is invalid, has expired (3-minute limit), or was already used.'}
                  </p>
                  <button
                    onClick={() => {
                      setShowResetPasswordModal(false);
                      window.history.replaceState({}, document.title, window.location.pathname);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#FFCC00] text-[#420000] font-black text-xs uppercase tracking-wider shadow-md hover:brightness-105 cursor-pointer"
                  >
                    Back to Admin Sign In
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (newPassword.length < 8) {
                      triggerToast('Password must be at least 8 characters long', 'error');
                      return;
                    }
                    if (newPassword !== confirmNewPassword) {
                      triggerToast('Passwords do not match', 'error');
                      return;
                    }
                    try {
                      const res = await api.resetAdminPassword(urlResetToken, newPassword);
                      if (res && res.success) {
                        triggerToast('Password updated successfully! Please sign in.');
                        setShowResetPasswordModal(false);
                        window.history.replaceState({}, document.title, window.location.pathname);
                      } else {
                        triggerToast(res?.error || 'Failed to update password', 'error');
                      }
                    } catch (err) {
                      triggerToast('Failed to update password', 'error');
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="p-3 rounded-xl bg-[#FFCC00]/10 border border-[#FFCC00]/25 text-xs text-yellow-200 font-semibold">
                    Resetting password for: <span className="text-[#FFCC00] font-bold">{resetTokenEmail}</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-[#FFCC00]/90 uppercase tracking-wider block mb-1.5">New Password (Min 8 Chars)</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full px-4 py-3 rounded-2xl bg-[#1f0000]/80 border border-[#FFCC00]/25 text-white text-xs font-bold focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition pr-10"
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-200/60 hover:text-[#FFCC00] transition cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-[#FFCC00]/90 uppercase tracking-wider block mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full px-4 py-3 rounded-2xl bg-[#1f0000]/80 border border-[#FFCC00]/25 text-white text-xs font-bold focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition pr-10"
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-200/60 hover:text-[#FFCC00] transition cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-3 border-t border-[#FFCC00]/20">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPasswordModal(false);
                        window.history.replaceState({}, document.title, window.location.pathname);
                      }}
                      className="px-4 py-2 rounded-xl border border-[#FFCC00]/30 text-xs font-bold text-yellow-200 hover:bg-[#FFCC00]/10 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFCC00] to-[#F59E0B] text-[#420000] text-xs font-black uppercase tracking-wider shadow-md hover:brightness-105 cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // MAIN ADMIN DASHBOARD LAYOUT (RESPONSIVE)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#faf8f5] flex">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#420000] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#FFCC00]/40 text-xs font-extrabold flex items-center space-x-2 animate-slideUp">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFCC00] animate-pulse"></div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reusable Delete Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title={confirmDelete.title}
        message={confirmDelete.message}
        onConfirm={confirmDelete.onConfirm}
        onCancel={() => setConfirmDelete(prev => ({ ...prev, isOpen: false }))}
      />

      {/* 1. Sidebar Navigation (Desktop + Mobile Drawer) */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* 2. Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full min-w-0 ${
        isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        <AdminTopbar
          activeTab={activeTab}
          currentUser={currentUser}
          onRefresh={loadAllData}
          isCollapsed={isSidebarCollapsed}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 md:p-10 max-w-7xl w-full mx-auto">
          <AdminErrorBoundary key={activeTab}>
          {activeTab === 'overview' && (
            <Dashboard
              appointments={appointments}
              volunteers={volunteers}
              liveNews={liveNews}
              dailyUpdates={dailyUpdates}
              events={events}
              heroSlides={heroSlides}
              currentUser={currentUser}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'banners' && (
            <Home
              heroSlides={heroSlides}
              volunteerSlides={volunteerSlides}
              currentUser={currentUser}
              onAddSlide={handleAddSlide}
              onDeleteSlide={handleDeleteSlide}
              triggerConfirmDelete={triggerConfirmDelete}
            />
          )}

          {activeTab === 'mla' && (
            <About
              mlaData={mlaData}
              setMlaData={setMlaData}
              onSave={handleSaveMla}
            />
          )}

          {activeTab === 'news' && (
            <News
              liveNews={liveNews}
              currentUser={currentUser}
              onOpenAddNewsModal={() => setShowAddNewsModal(true)}
              onEditNews={handleOpenEditNewsModal}
              onDeleteNews={handleDeleteNews}
              triggerConfirmDelete={triggerConfirmDelete}
            />
          )}

          {activeTab === 'events' && (
            <Events
              events={events}
              currentUser={currentUser}
              onOpenAddEventModal={() => {
                setNewEventTitle('');
                setNewEventDescription('');
                setNewEventDate('');
                setNewEventTime('');
                setNewEventVenue('');
                setNewEventCategory('Meeting');
                setShowAddEventModal(true);
              }}
              onDeleteEvent={handleDeleteEvent}
              triggerConfirmDelete={triggerConfirmDelete}
            />
          )}

          {activeTab === 'social' && (
            <Social
              socialPosts={socialPosts}
              socialProfiles={socialProfiles}
              currentUser={currentUser}
              onOpenAddPostModal={(platform) => {
                setNewPostPlatform(platform || 'x');
                setNewPostUrl('');
                setShowAddPostModal(true);
              }}
              onDeletePost={handleDeletePost}
              onSaveProfiles={handleSaveSocialProfiles}
              triggerConfirmDelete={triggerConfirmDelete}
            />
          )}

          {activeTab === 'daily' && (
            <DailyUpdates
              dailyUpdates={dailyUpdates}
              currentUser={currentUser}
              onOpenAddDailyModal={() => setShowAddDailyModal(true)}
              onOpenEditDailyModal={handleOpenEditDailyModal}
              onDeleteDaily={handleDeleteDaily}
              triggerConfirmDelete={triggerConfirmDelete}
            />
          )}

          {activeTab === 'appointments' && (
            <Appointments
              appointments={appointments}
              currentUser={currentUser}
              onUpdateStatus={handleUpdateApptStatus}
              onSaveRemarks={handleSaveApptRemarks}
              onAssignTimeSlot={handleAssignApptSlot}
              onDeleteAppointment={handleDeleteAppt}
            />
          )}

          {activeTab === 'volunteers' && (
            <Volunteers
              volunteers={volunteers}
              volunteerPhotos={volunteerPhotos}
              currentUser={currentUser}
              onUpdateStatus={handleUpdateVolStatus}
              onOpenIdCardModal={(vol) => setActiveIdCardVolunteer(vol)}
              onDeleteVolunteer={(vol) => {
                triggerConfirmDelete({
                  title: 'Delete Volunteer Record',
                  message: `Are you sure you want to permanently delete volunteer "${vol.name || vol.id}"? This will remove their full record from the database and delete their photo from storage.`,
                  onConfirm: () => handleDeleteVolunteer(vol)
                });
              }}
              onOpenAddPhotoModal={() => {
                setNewPhotoImage('');
                setNewPhotoTitle('');
                setShowAddPhotoModal(true);
              }}
              onOpenEditPhotoModal={(photo) => setEditingPhoto(photo)}
              onDeletePhoto={(photo) => {
                triggerConfirmDelete({
                  title: 'Delete Fieldwork Photo',
                  message: `Are you sure you want to permanently delete "${photo.title || 'this photo'}" from both database and uploads storage?`,
                  onConfirm: () => handleDeleteVolunteerPhoto(photo)
                });
              }}
            />
          )}

          {activeTab === 'access_logs' && currentUser?.role === 'Super Admin' && (
            <AccessLogs
              logs={accessLogs}
              isLoading={isLoadingLogs}
              onRefresh={handleRefreshLogs}
              onClearLogs={handleClearLogs}
              triggerConfirmDelete={triggerConfirmDelete}
            />
          )}

          {activeTab === 'admins' && currentUser?.role === 'Super Admin' && (
            <Settings
              adminsList={adminsList}
              currentUser={currentUser}
              onOpenAddAdminModal={() => setShowAddAdminModal(true)}
              onEditAdmin={handleOpenEditAdminModal}
              onDeleteAdmin={handleDeleteAdmin}
              triggerConfirmDelete={triggerConfirmDelete}
            />
          )}
          </AdminErrorBoundary>
        </main>
      </div>

      {/* Global Modals */}
      {/* 1. Add Slide Modal */}
      {showAddSlideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">
                Add {addSlideTarget === 'banners' ? 'Hero Banner' : 'Volunteer Banner'} Slide
              </h3>
              <button onClick={() => setShowAddSlideModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ImageUploadField
              label="Banner Image"
              value={newSlideImage}
              onChange={(val) => setNewSlideImage(val)}
            />

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button onClick={() => setShowAddSlideModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600">
                Cancel
              </button>
              <button
                disabled={!newSlideImage}
                onClick={async () => {
                  if (!newSlideImage) return;
                  let finalImageUrl = newSlideImage;
                  try {
                    const uploadRes = await api.uploadImage(newSlideImage, 'banners');
                    if (uploadRes && uploadRes.url) {
                      finalImageUrl = uploadRes.url;
                    }
                  } catch (e) {
                    console.warn('Upload image API error, keeping base64:', e);
                  }

                  if (addSlideTarget === 'banners') {
                    if (heroSlides.length >= 3) {
                      triggerToast('Maximum 3 Hero banners limit reached!');
                      setShowAddSlideModal(false);
                      return;
                    }
                    const updated = [...heroSlides, { desktop: finalImageUrl, mobile: finalImageUrl }];
                    setHeroSlides(updated);
                    await api.syncHeroSlides(updated);
                    triggerToast('Hero banner slide added & saved to uploads folder!');
                  } else {
                    const updated = [...volunteerSlides, { desktop: finalImageUrl, mobile: finalImageUrl }];
                    setVolunteerSlides(updated);
                    await api.syncVolunteerSlides(updated);
                    triggerToast('Volunteer banner slide added & saved to uploads folder!');
                  }
                  setShowAddSlideModal(false);
                  setNewSlideImage('');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800000] to-[#5a0000] hover:from-[#600000] hover:to-[#400000] text-white text-xs font-bold shadow-md shadow-red-900/20"
              >
                Add Slide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add News Modal */}
      {showAddNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Publish News Announcement</h3>
              <button onClick={() => setShowAddNewsModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ImageUploadField label="News Thumbnail Photo *" value={newNewsImage} onChange={setNewNewsImage} allowRemove={false} />

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Headline Title *</label>
              <input
                type="text"
                value={newNewsTitle}
                onChange={(e) => setNewNewsTitle(e.target.value)}
                placeholder="e.g. MLA Inspects Desiltation Works at Chinnasalem"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Category</label>
                <input
                  type="text"
                  value={newNewsCategory}
                  onChange={(e) => setNewNewsCategory(e.target.value)}
                  placeholder="NEWS MEDIA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                />
              </div>
              <div>
                <DateTimePickerInput
                  label="Date *"
                  value={newNewsDate}
                  onChange={setNewNewsDate}
                  includeTime={false}
                  placeholder="Select Date (DD/MM/YYYY)"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Full Content</label>
              <textarea
                rows={4}
                value={newNewsContent}
                onChange={(e) => setNewNewsContent(e.target.value)}
                placeholder="Full article paragraphs..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium leading-relaxed"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button onClick={() => setShowAddNewsModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600">
                Cancel
              </button>
              <button
                disabled={!newNewsTitle.trim() || !newNewsImage}
                onClick={async () => {
                  if (!newNewsTitle.trim()) {
                    triggerToast('Headline title is required!', 'error');
                    return;
                  }
                  if (!newNewsImage) {
                    triggerToast('News thumbnail photo is required!', 'error');
                    return;
                  }

                  const newEntry = {
                    id: Date.now(),
                    title: newNewsTitle.trim(),
                    image: newNewsImage,
                    content: newNewsContent.trim(),
                    date: newNewsDate || formatToDateOnly(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
                    category: newNewsCategory.trim() || 'NEWS MEDIA',
                    author: "Desk of Hon'ble MLA Mr. C. Arul Vignesh"
                  };

                  const res = await api.addLiveNews(newEntry);
                  const finalEntry = { ...newEntry, ...(res && res.image ? { image: res.image } : {}) };
                  const updated = [finalEntry, ...liveNews];
                  setLiveNews(updated);

                  triggerToast('News announcement published!');
                  setShowAddNewsModal(false);
                  setNewNewsTitle('');
                  setNewNewsContent('');
                  setNewNewsImage('');
                  const now = new Date();
                  setNewNewsDate(formatToDateOnly(now.getFullYear(), now.getMonth(), now.getDate()));
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800000] to-[#5a0000] hover:from-[#600000] hover:to-[#400000] text-white text-xs font-bold shadow-md shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Publish News
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2b. Edit News Modal */}
      {showEditNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Edit News Announcement</h3>
              <button onClick={() => setShowEditNewsModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ImageUploadField label="News Thumbnail Photo *" value={editNewsImage} onChange={setEditNewsImage} allowRemove={false} />

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Headline Title *</label>
              <input
                type="text"
                value={editNewsTitle}
                onChange={(e) => setEditNewsTitle(e.target.value)}
                placeholder="e.g. MLA Inspects Desiltation Works at Chinnasalem"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#800000]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Category</label>
                <input
                  type="text"
                  value={editNewsCategory}
                  onChange={(e) => setEditNewsCategory(e.target.value)}
                  placeholder="NEWS MEDIA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#800000]"
                />
              </div>
              <div>
                <DateTimePickerInput
                  label="Date *"
                  value={editNewsDate}
                  onChange={setEditNewsDate}
                  includeTime={false}
                  placeholder="Select Date (DD/MM/YYYY)"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Full Content</label>
              <textarea
                rows={4}
                value={editNewsContent}
                onChange={(e) => setEditNewsContent(e.target.value)}
                placeholder="Full article paragraphs..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium leading-relaxed text-gray-900 focus:outline-none focus:border-[#800000]"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button onClick={() => setShowEditNewsModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                disabled={!editNewsTitle.trim() || !editNewsImage}
                onClick={handleSaveEditNews}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800000] to-[#5a0000] hover:from-[#600000] hover:to-[#400000] text-white text-xs font-bold shadow-md shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2c. Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Schedule New Event / Town Hall</h3>
              <button onClick={() => setShowAddEventModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Event Title *</label>
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="e.g. Anna Nagar Grievance Redressal Town Hall"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#800000]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Category</label>
                <input
                  type="text"
                  value={newEventCategory}
                  onChange={(e) => setNewEventCategory(e.target.value)}
                  placeholder="Meeting / Town Hall / Welfare"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#800000]"
                />
              </div>
              <div>
                <DateTimePickerInput
                  label="Date *"
                  value={newEventDate}
                  onChange={setNewEventDate}
                  includeTime={false}
                  placeholder="Select Date (DD/MM/YYYY)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Time Range *</label>
                <input
                  type="text"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  placeholder="e.g. 10:00 AM - 01:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#800000]"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Venue Location *</label>
                <input
                  type="text"
                  value={newEventVenue}
                  onChange={(e) => setNewEventVenue(e.target.value)}
                  placeholder="e.g. Chinnasalem Community Hall"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#800000]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Description</label>
              <textarea
                rows={3}
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                placeholder="Details about the event, agenda, and public participation..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 leading-relaxed"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button onClick={() => setShowAddEventModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600">
                Cancel
              </button>
              <button
                disabled={!newEventTitle.trim() || !newEventDate}
                onClick={async () => {
                  if (!newEventTitle.trim()) {
                    triggerToast('Event title is required!', 'error');
                    return;
                  }
                  const newEntry = {
                    id: Date.now(),
                    title: newEventTitle.trim(),
                    description: newEventDescription.trim(),
                    date: newEventDate ? newEventDate.split(',')[0].trim() : 'Aug 2026',
                    time: newEventTime.trim() || '10:00 AM - 01:00 PM',
                    venue: newEventVenue.trim() || 'Constituency Main Office',
                    attendees: 0,
                    category: newEventCategory.trim() || 'Meeting'
                  };

                  const updated = [newEntry, ...events];
                  setEvents(updated);
                  await api.addEvent(newEntry);
                  await api.syncEvents(updated);
                  triggerToast('New event scheduled successfully!');
                  setShowAddEventModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800000] to-[#5a0000] hover:from-[#600000] hover:to-[#400000] text-white text-xs font-bold shadow-md shadow-red-900/20 cursor-pointer"
              >
                Schedule Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add Daily Work Modal */}
      {showAddDailyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Add Completed Work Record</h3>
              <button onClick={() => setShowAddDailyModal(false)} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ImageUploadField label="Work Photo *" value={newDailyImage} onChange={setNewDailyImage} allowRemove={false} />

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Work Title *</label>
              <input
                type="text"
                value={newDailyTitle}
                onChange={(e) => setNewDailyTitle(e.target.value)}
                placeholder="e.g. Streetlights Installation at Chinnasalem"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Category</label>
                <select
                  value={newDailyCategory}
                  onChange={(e) => setNewDailyCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold bg-white"
                >
                  <option value="ROADS">ROADS</option>
                  <option value="WATER SUPPLY">WATER SUPPLY</option>
                  <option value="STREET LIGHTS">STREET LIGHTS</option>
                  <option value="PARKS & WALKWAYS">PARKS & WALKWAYS</option>
                  <option value="WELLNESS">WELLNESS</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Date</label>
                <input
                  type="date"
                  value={newDailyDate}
                  onChange={(e) => setNewDailyDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Location</label>
              <input
                type="text"
                value={newDailyLocation}
                onChange={(e) => setNewDailyLocation(e.target.value)}
                placeholder="e.g. Ward 4, Chinnasalem"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Description</label>
              <textarea
                rows={3}
                value={newDailyDescription}
                onChange={(e) => setNewDailyDescription(e.target.value)}
                placeholder="Brief summary of work completed..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button onClick={() => setShowAddDailyModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 cursor-pointer">
                Cancel
              </button>
              <button
                disabled={!newDailyTitle.trim() || !newDailyImage}
                onClick={async () => {
                  if (!newDailyTitle.trim() || !newDailyImage) return;
                  const formattedDate = newDailyDate ? new Date(newDailyDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                  const newEntry = {
                    id: Date.now(),
                    title: newDailyTitle.trim(),
                    description: newDailyDescription.trim(),
                    category: newDailyCategory,
                    location: newDailyLocation.trim() || 'Constituency',
                    date: formattedDate,
                    image: newDailyImage,
                    status: 'DONE',
                    hasBadge: true,
                    isBefore: false
                  };
                  const res = await api.addDailyUpdate(newEntry);
                  const finalEntry = { ...newEntry, ...(res && res.image ? { image: res.image } : {}) };
                  const updated = [finalEntry, ...dailyUpdates];
                  setDailyUpdates(updated);
                  triggerToast('Completed work record added!');
                  setShowAddDailyModal(false);
                  setNewDailyTitle('');
                  setNewDailyDescription('');
                  setNewDailyLocation('');
                  setNewDailyImage('');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/20 cursor-pointer disabled:opacity-50"
              >
                Save Work Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Daily Work Modal */}
      {showEditDailyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Edit Completed Work Record</h3>
              <button onClick={() => setShowEditDailyModal(false)} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ImageUploadField label="Work Photo *" value={editDailyImage} onChange={setEditDailyImage} allowRemove={false} />

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Work Title *</label>
              <input
                type="text"
                value={editDailyTitle}
                onChange={(e) => setEditDailyTitle(e.target.value)}
                placeholder="e.g. Streetlights Installation at Chinnasalem"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Category</label>
                <select
                  value={editDailyCategory}
                  onChange={(e) => setEditDailyCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold bg-white"
                >
                  <option value="ROADS">ROADS</option>
                  <option value="WATER SUPPLY">WATER SUPPLY</option>
                  <option value="STREET LIGHTS">STREET LIGHTS</option>
                  <option value="PARKS & WALKWAYS">PARKS & WALKWAYS</option>
                  <option value="WELLNESS">WELLNESS</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Date</label>
                <input
                  type="date"
                  value={editDailyDate}
                  onChange={(e) => setEditDailyDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Location</label>
              <input
                type="text"
                value={editDailyLocation}
                onChange={(e) => setEditDailyLocation(e.target.value)}
                placeholder="e.g. Ward 4, Chinnasalem"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Description</label>
              <textarea
                rows={3}
                value={editDailyDescription}
                onChange={(e) => setEditDailyDescription(e.target.value)}
                placeholder="Brief summary of work completed..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button onClick={() => setShowEditDailyModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 cursor-pointer">
                Cancel
              </button>
              <button
                disabled={!editDailyTitle.trim() || !editDailyImage}
                onClick={handleSaveEditDaily}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-900/20 cursor-pointer disabled:opacity-50"
              >
                Update Work Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Add Social Post Modal */}
      {showAddPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2.5">
                {newPostPlatform === 'instagram' ? (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <svg viewBox="0 0 448 512" width="15" height="15" fill="currentColor">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shrink-0 shadow-sm">
                    <svg viewBox="0 0 512 512" width="14" height="14" fill="currentColor">
                      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
                    </svg>
                  </div>
                )}
                <h3 className="text-base font-black text-gray-900">
                  Add {newPostPlatform === 'instagram' ? 'Instagram' : 'X (Twitter)'} Post Link
                </h3>
              </div>
              <button onClick={() => setShowAddPostModal(false)} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Select Social Platform</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewPostPlatform('x')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center justify-center gap-2 ${
                    newPostPlatform === 'x'
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg viewBox="0 0 512 512" width="13" height="13" fill="currentColor">
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
                  </svg>
                  <span>X (Twitter)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewPostPlatform('instagram')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center justify-center gap-2 ${
                    newPostPlatform === 'instagram'
                      ? 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white border-transparent shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg viewBox="0 0 448 512" width="13" height="13" fill="currentColor">
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                  </svg>
                  <span>Instagram</span>
                </button>
              </div>
            </div>

            {/* Post / Reel Link Input */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                {newPostPlatform === 'instagram' ? 'Instagram Post / Reel Link' : 'X (Twitter) Post Link'}
              </label>
              <input
                type="url"
                value={newPostUrl}
                onChange={(e) => setNewPostUrl(e.target.value)}
                placeholder={
                  newPostPlatform === 'instagram'
                    ? 'https://www.instagram.com/p/DBErV5cTI8B/ or https://instagram.com/reel/...'
                    : 'https://x.com/username/status/1825828473928192'
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-red-500"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed font-medium">
                {newPostPlatform === 'instagram'
                  ? 'Paste any Instagram post or reel link. It will smoothly auto-scroll (Left to Right) in the public marquee.'
                  : 'Paste any X/Twitter tweet link. It will smoothly auto-scroll (Right to Left) in the public marquee.'}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button onClick={() => setShowAddPostModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 cursor-pointer">
                Cancel
              </button>
              <button
                disabled={!newPostUrl.trim()}
                onClick={async () => {
                  if (!newPostUrl.trim()) return;
                  const cleanUrl = newPostUrl.trim();
                  let detectedPlatform = newPostPlatform;
                  if (cleanUrl.includes('instagram.com')) {
                    detectedPlatform = 'instagram';
                  } else if (cleanUrl.includes('x.com') || cleanUrl.includes('twitter.com')) {
                    detectedPlatform = 'x';
                  }
                  const newEntry = {
                    id: Date.now(),
                    platform: detectedPlatform,
                    postUrl: cleanUrl,
                    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                  };
                  const updated = [newEntry, ...socialPosts];
                  setSocialPosts(updated);
                  await api.addSocialPost(newEntry);
                  triggerToast(`${detectedPlatform === 'instagram' ? 'Instagram' : 'X'} post added to marquee!`);
                  setShowAddPostModal(false);
                  setNewPostUrl('');
                }}
                className={`px-5 py-2.5 rounded-xl text-white font-black text-xs shadow-md transition cursor-pointer ${
                  newPostPlatform === 'instagram'
                    ? 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90'
                    : 'bg-black hover:bg-gray-900'
                }`}
              >
                Embed Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">Add New Administrator</h3>
                <p className="text-[11px] font-semibold text-gray-500">Create credentials & assign system privileges.</p>
              </div>
              <button 
                onClick={() => {
                  setShowAddAdminModal(false);
                  setShowNewAdminPass(false);
                }} 
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Username / Login ID */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                Username (Login ID) *
              </label>
              <input
                type="text"
                value={newAdminUser}
                onChange={(e) => setNewAdminUser(e.target.value)}
                placeholder="e.g. coordinator_01"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#800000]"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                Mobile Number (10 Digits) *
              </label>
              <input
                type="tel"
                maxLength={10}
                value={newAdminMobile}
                onChange={(e) => setNewAdminMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold font-mono focus:outline-none focus:border-[#800000]"
              />
              <div className="flex items-center justify-between mt-1 text-[10px] font-semibold">
                <span className={newAdminMobile.length === 10 ? "text-emerald-600 font-bold" : newAdminMobile.length > 0 ? "text-amber-600" : "text-gray-400"}>
                  {newAdminMobile.length === 10 ? "✓ 10-Digit Mobile Number Verified" : "Must be exactly 10 numeric digits"}
                </span>
                <span className={`font-mono ${newAdminMobile.length === 10 ? "text-emerald-600 font-black" : "text-gray-400"}`}>
                  {newAdminMobile.length}/10
                </span>
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showNewAdminPass ? 'text' : 'password'}
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#800000]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewAdminPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer p-1"
                  title={showNewAdminPass ? 'Hide Password' : 'Show Password'}
                >
                  {showNewAdminPass ? <EyeOff className="w-4 h-4 text-[#800000]" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Permission */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                Role Permission *
              </label>
              <select
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:outline-none focus:border-[#800000]"
              >
                <option value="Admin">Admin (Add & Edit Content Only)</option>
                <option value="Super Admin">Super Admin (Full Access & Delete Privileges)</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button 
                onClick={() => {
                  setShowAddAdminModal(false);
                  setShowNewAdminPass(false);
                }} 
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!newAdminUser.trim() || !newAdminPass || newAdminMobile.length !== 10}
                onClick={async () => {
                  if (!newAdminUser.trim() || !newAdminPass || newAdminMobile.length !== 10) {
                    if (newAdminMobile.length !== 10) {
                      triggerToast('Mobile number must be exactly 10 digits', 'error');
                    }
                    return;
                  }

                  // Generate readable timestamp
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
                  const formattedCreatedAt = `${day} ${month} ${year}, ${formattedHour}:${minutes} ${ampm}`;

                  const newEntry = {
                    id: adminsList.length + 1,
                    username: newAdminUser.trim(),
                    name: newAdminUser.trim(),
                    mobile: newAdminMobile.trim(),
                    password: newAdminPass,
                    role: newAdminRole,
                    createdAt: formattedCreatedAt
                  };

                  const updated = [...adminsList, newEntry];
                  setAdminsList(updated);
                  try {
                    await api.syncAdmins(updated);
                    triggerToast(`${newAdminRole} account "${newAdminUser}" created successfully!`);
                  } catch (err) {
                    console.error('Failed to sync admin to DB:', err);
                    triggerToast('Created locally, saving to database...', 'info');
                  }

                  setShowAddAdminModal(false);
                  setNewAdminUser('');
                  setNewAdminMobile('');
                  setNewAdminPass('');
                  setNewAdminRole('Admin');
                  setShowNewAdminPass(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800000] to-[#5a0000] hover:from-[#660000] hover:to-[#440000] text-white text-xs font-bold shadow-md shadow-red-900/20 transition cursor-pointer border border-[#FFCC00]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6.1 Edit Admin Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  Edit Admin ({editingAdmin.username})
                </h3>
                <p className="text-[11px] font-semibold text-gray-500">Update credentials, mobile number, or privileges.</p>
              </div>
              <button 
                onClick={() => setEditingAdmin(null)} 
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Username display */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                Username (Login ID)
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 font-mono">
                @{editingAdmin.username}
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                Mobile Number (10 Digits) *
              </label>
              <input
                type="tel"
                maxLength={10}
                value={editAdminMobile}
                onChange={(e) => setEditAdminMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold font-mono focus:outline-none focus:border-[#800000]"
              />
              <div className="flex items-center justify-between mt-1 text-[10px] font-semibold">
                <span className={editAdminMobile.length === 10 ? "text-emerald-600 font-bold" : editAdminMobile.length > 0 ? "text-amber-600" : "text-gray-400"}>
                  {editAdminMobile.length === 10 ? "✓ 10-Digit Mobile Number Verified" : "Must be exactly 10 numeric digits"}
                </span>
                <span className={`font-mono ${editAdminMobile.length === 10 ? "text-emerald-600 font-black" : "text-gray-400"}`}>
                  {editAdminMobile.length}/10
                </span>
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                Password (Leave blank to keep unchanged)
              </label>
              <div className="relative">
                <input
                  type={showEditAdminPass ? 'text' : 'password'}
                  value={editAdminPass}
                  onChange={(e) => setEditAdminPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#800000]"
                />
                <button
                  type="button"
                  onClick={() => setShowEditAdminPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer p-1"
                  title={showEditAdminPass ? 'Hide Password' : 'Show Password'}
                >
                  {showEditAdminPass ? <EyeOff className="w-4 h-4 text-[#800000]" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Permission */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                Role Permission
              </label>
              <select
                value={editAdminRole}
                onChange={(e) => setEditAdminRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:outline-none focus:border-[#800000]"
              >
                <option value="Admin">Admin (Add & Edit Content Only)</option>
                <option value="Super Admin">Super Admin (Full Access & Delete Privileges)</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button 
                onClick={() => setEditingAdmin(null)} 
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={editAdminMobile.length > 0 && editAdminMobile.length !== 10}
                onClick={handleSaveEditAdmin}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800000] to-[#5a0000] hover:from-[#660000] hover:to-[#440000] text-white text-xs font-bold shadow-md shadow-red-900/20 transition cursor-pointer border border-[#FFCC00]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Add Volunteer Photo Modal */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Upload Volunteer Field Work Photo</h3>
              <button onClick={() => setShowAddPhotoModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ImageUploadField label="Field Work Photo" value={newPhotoImage} onChange={setNewPhotoImage} />

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Photo Title / Activity Name</label>
              <input
                type="text"
                value={newPhotoTitle}
                onChange={(e) => setNewPhotoTitle(e.target.value)}
                placeholder="e.g. Tree Plantation Drive at Chinnasalem"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#800000]"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button onClick={() => setShowAddPhotoModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                disabled={!newPhotoImage || !newPhotoTitle.trim()}
                onClick={async () => {
                  if (!newPhotoImage || !newPhotoTitle.trim()) return;
                  try {
                    const newEntry = {
                      image: newPhotoImage,
                      title: newPhotoTitle.trim()
                    };
                    const res = await api.addVolunteerPhoto(newEntry);
                    if (!res || res.error) {
                      triggerToast(res?.error || 'Failed to upload photo to server', 'error');
                      return;
                    }
                    const savedEntry = {
                      id: res.id || Date.now(),
                      image: res.image || newPhotoImage,
                      title: newPhotoTitle.trim(),
                      uploadedAt: res.uploadedAt || new Date().toISOString()
                    };
                    setVolunteerPhotos([savedEntry, ...volunteerPhotos]);
                    triggerToast('Volunteer fieldwork photo uploaded successfully!');
                    setShowAddPhotoModal(false);
                    setNewPhotoImage('');
                    setNewPhotoTitle('');
                  } catch (err) {
                    console.error('Failed to upload photo:', err);
                    triggerToast('Failed to upload photo', 'error');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800000] to-[#5a0000] text-white text-xs font-bold shadow-md shadow-red-900/20 disabled:opacity-50 cursor-pointer"
              >
                Upload Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7.1 Edit Volunteer Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Edit Field Work Photo</h3>
              <button onClick={() => setEditingPhoto(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ImageUploadField 
              label="Field Work Photo" 
              value={editingPhoto.image} 
              allowRemove={false}
              onChange={(img) => setEditingPhoto({ ...editingPhoto, image: img })} 
            />

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Photo Title / Activity Name</label>
              <input
                type="text"
                value={editingPhoto.title || ''}
                onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                placeholder="e.g. Tree Plantation Drive at Chinnasalem"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#800000]"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button onClick={() => setEditingPhoto(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                disabled={!editingPhoto.image || !editingPhoto.title?.trim()}
                onClick={async () => {
                  if (!editingPhoto.image || !editingPhoto.title?.trim()) return;
                  try {
                    const updated = {
                      ...editingPhoto,
                      title: editingPhoto.title.trim()
                    };
                    const res = await api.updateVolunteerPhoto(editingPhoto.id, updated);
                    if (!res || res.error) {
                      triggerToast(res?.error || 'Failed to update photo on server', 'error');
                      return;
                    }
                    const finalPhoto = {
                      ...updated,
                      image: res?.image || updated.image
                    };
                    setVolunteerPhotos(volunteerPhotos.map(p => p.id === editingPhoto.id ? finalPhoto : p));
                    triggerToast('Volunteer field photo updated successfully!');
                    setEditingPhoto(null);
                  } catch (err) {
                    console.error('Failed to update photo:', err);
                    triggerToast('Failed to update photo', 'error');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800000] to-[#5a0000] text-white text-xs font-bold shadow-md shadow-red-900/20 disabled:opacity-50 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. ID Card Preview Modal */}
      {activeIdCardVolunteer && (
        <AdminIdCardModal
          vol={activeIdCardVolunteer}
          onClose={() => setActiveIdCardVolunteer(null)}
          onDownload={() => handleExportCard(activeIdCardVolunteer)}
          isDownloading={isExportingCard}
        />
      )}
    </div>
  );
};

export default Admin;
