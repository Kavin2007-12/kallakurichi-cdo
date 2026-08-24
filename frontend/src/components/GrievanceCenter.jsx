import { useState, useEffect } from 'react';
import { FileEdit, Search, CheckCircle2, ShieldAlert, ArrowRight, Upload, X, Copy, Check, Loader2 } from 'lucide-react';
import { getCurrentLanguage } from '../utils/lang';

const GrievanceCenter = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'track'
  
  // File Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('Ward 1 - Kallakurichi Town Zone');
  const [category, setCategory] = useState('Sanitation & Garbage');
  const [details, setDetails] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  
  // Track Status States
  const [searchId, setSearchId] = useState('');
  const [trackedGrievance, setTrackedGrievance] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const currentLang = getCurrentLanguage();

  // Mock initial grievances database for testing
  const seedGrievances = [
    {
      id: 'KK-GRV-1001',
      name: 'Rajendran M.',
      phone: '9876543210',
      ward: 'Ward 2 - Bazaar Street Kallakurichi',
      category: 'Sanitation & Garbage',
      details: 'Overflowing public waste bin near Main Bazaar street road junction, creating heavy odor and stray dog issues.',
      date: 'Aug 05, 2026',
      photo: '/completed_water_supply.jpg',
      status: 'RESOLVED',
      assignedOfficer: 'Thiru. K. Paneerselvam (Sanitation Inspector)',
      updates: [
        { title: 'Grievance Lodged', time: 'Aug 05, 10:30 AM', desc: 'Complaint registered by citizen and dispatched to Ward 2 office.', done: true },
        { title: 'Officer Assigned', time: 'Aug 05, 02:15 PM', desc: 'Sanitation Inspector K. Paneerselvam assigned for verification.', done: true },
        { title: 'Action Initiated', time: 'Aug 06, 09:00 AM', desc: 'Clearance trucks dispatched to empty bins and clean local block.', done: true },
        { title: 'Resolved & Closed', time: 'Aug 06, 04:30 PM', desc: 'Sanitation completed. Verification photo proof uploaded.', done: true }
      ],
      resolutionProof: 'Garbage cleared and street disinfected. Additional bins placed at Bazaar street corner.'
    },
    {
      id: 'KK-GRV-1002',
      name: 'Selvi Anbarasan',
      phone: '9845612307',
      ward: 'Ward 5 - Kaveri Nagar Zone',
      category: 'Street Lights',
      details: 'Three consecutive streetlights are not working on Netaji Cross Road, making walking unsafe after 7:00 PM.',
      date: 'Aug 10, 2026',
      photo: '/completed_streetlights.jpg',
      status: 'IN_PROGRESS',
      assignedOfficer: 'Tmt. R. Shanthi (Assistant Electrical Engineer)',
      updates: [
        { title: 'Grievance Lodged', time: 'Aug 10, 09:00 AM', desc: 'Complaint registered and forwarded to electrical department.', done: true },
        { title: 'Officer Assigned', time: 'Aug 10, 11:30 AM', desc: 'AEE Shanthi assigned to inspect cable lines.', done: true },
        { title: 'Action Initiated', time: 'Aug 11, 08:30 AM', desc: 'Maintenance team dispatched. Diagnostic found fault in step-down transformer fuse.', done: true },
        { title: 'Resolution Pending', time: 'Pending', desc: 'Awaiting replacement transformer switch parts, scheduled for resolution within 24 hours.', done: false }
      ]
    }
  ];

  // Initialize data on load
  useEffect(() => {
    import('../services/api').then(({ api }) => {
      api.getGrievances(seedGrievances);
    });
  }, []);

  // Handle mock file upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAttachedPhoto(file.name);
    setUploadProgress(10);
    
    // Simulate upload loader progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const handleRemovePhoto = () => {
    setAttachedPhoto(null);
    setUploadProgress(0);
  };

  // Submit grievance handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !details.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `KK-GRV-${Math.floor(1000 + Math.random() * 9000)}`;
      const formattedDate = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });

      const newGrievance = {
        id: generatedId,
        name,
        phone,
        ward,
        category,
        details,
        description: details,
        date: formattedDate,
        photo: '/completed_road_work.jpg', // Default mockup
        status: 'SUBMITTED',
        assignedOfficer: 'Ward Zonal Grievance Officer',
        updates: [
          { title: 'Grievance Lodged', time: `${formattedDate}, Just Now`, desc: 'Complaint registered successfully and assigned to Ward Inspector.', done: true },
          { title: 'Officer Assignment', time: 'Pending', desc: 'Grievance officer assignment under process.', done: false },
          { title: 'Action Initiation', time: 'Pending', desc: 'On-site verification details to be updated.', done: false },
          { title: 'Resolution', time: 'Pending', desc: 'Resolution timeline within 48-72 working hours.', done: false }
        ]
      };

      // Save to database & localStorage
      import('../services/api').then(({ api }) => {
        api.submitGrievance(newGrievance);
        const currentGrievances = JSON.parse(localStorage.getItem('kallakurichi_grievances')) || seedGrievances;
        const updatedList = [newGrievance, ...currentGrievances];
        localStorage.setItem('kallakurichi_grievances', JSON.stringify(updatedList));
      });

      setIsSubmitting(false);
      setSubmissionSuccess(newGrievance);
    }, 1500);
  };

  // Track status handler
  const handleTrackSearch = (e) => {
    e.preventDefault();
    setSearchError(null);
    setTrackedGrievance(null);

    const query = searchId.trim().toUpperCase();
    if (!query) return;

    import('../services/api').then(({ api }) => {
      api.getGrievances(seedGrievances).then(database => {
        const list = Array.isArray(database) && database.length > 0 ? database : seedGrievances;
        const match = list.find(g => (g.id && g.id.trim().toUpperCase() === query) || (g.phone && g.phone.trim() === searchId.trim()));

        if (match) {
          setTrackedGrievance(match);
        } else {
          setSearchError(currentLang === 'ta' ? 'தவறான புகார் எண் / தொலைபேசி எண். மீண்டும் சரிபார்க்கவும்.' : 'Invalid Grievance ID / Phone Number. Please verify and try again.');
        }
      });
    });
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleResetForm = () => {
    setName('');
    setPhone('');
    setWard('Ward 1 - Kallakurichi Town Zone');
    setCategory('Sanitation & Garbage');
    setDetails('');
    setAttachedPhoto(null);
    setUploadProgress(0);
    setSubmissionSuccess(null);
  };

  const handleClosePortal = () => {
    handleResetForm();
    setTrackedGrievance(null);
    setSearchId('');
    setSearchError(null);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Full Grievance Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[80] flex items-center justify-center p-4 notranslate">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-scale-up select-text">
            
            {/* Modal Header */}
            <div className="bg-primary text-white p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2.5">
                <FileEdit size={20} />
                <div>
                  <h3 className="font-bold text-base md:text-lg">
                    {currentLang === 'ta' ? 'பொதுமக்கள் புகார் தீர்வு மையம்' : 'Citizen Grievance Center'}
                  </h3>
                </div>
              </div>
              <button 
                onClick={handleClosePortal}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div className="bg-gray-50 border-b border-gray-150 p-4 flex justify-center">
              <div className="flex bg-white p-1 rounded-2xl border border-gray-150 shadow-xs max-w-sm w-full select-none">
                <button
                  type="button"
                  onClick={() => { setActiveTab('file'); setSearchError(null); setTrackedGrievance(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition duration-300 flex items-center justify-center space-x-2 cursor-pointer border-0 outline-none ${
                    activeTab === 'file'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-primary/70 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  <FileEdit size={14} />
                  <span>{currentLang === 'ta' ? 'புகார் பதிவு' : 'File a Grievance'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => { setActiveTab('track'); handleResetForm(); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition duration-300 flex items-center justify-center space-x-2 cursor-pointer border-0 outline-none ${
                    activeTab === 'track'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-primary/70 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  <Search size={14} />
                  <span>{currentLang === 'ta' ? 'நிலை கண்காணிப்பு' : 'Track Status'}</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[68vh]">
              
              {/* Tab 1: File Grievance */}
              {activeTab === 'file' && (
                <div>
                  {!submissionSuccess ? (
                    <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                      
                      {/* Name & Phone Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-gray-700 mb-1">Full Name</label>
                          <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Anbarasan K."
                            className="border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 font-medium"
                            required
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-gray-700 mb-1">Contact Number</label>
                          <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 font-medium"
                            required
                          />
                        </div>
                      </div>

                      {/* Ward & Category Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-gray-700 mb-1">Your Ward / Location</label>
                          <select
                            value={ward}
                            onChange={(e) => setWard(e.target.value)}
                            className="border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition bg-white font-medium"
                          >
                            <option value="Ward 1 - Kallakurichi Town Zone">Ward 1 - Kallakurichi Town</option>
                            <option value="Ward 2 - Bazaar Street Kallakurichi">Ward 2 - Bazaar Street</option>
                            <option value="Ward 3 - Gandhi Colony Kallakurichi">Ward 3 - Gandhi Colony</option>
                            <option value="Ward 4 - Railway Junction Zone">Ward 4 - Railway Junction</option>
                            <option value="Ward 5 - Kaveri Nagar Zone">Ward 5 - Kaveri Nagar</option>
                            <option value="Ward 6 - Netaji Street Zone">Ward 6 - Netaji Street</option>
                          </select>
                        </div>

                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-gray-700 mb-1">Grievance Category</label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition bg-white font-medium"
                          >
                            <option value="Sanitation & Garbage">Sanitation & Garbage Disposal</option>
                            <option value="Roads & Potholes">Road Damage & Potholes</option>
                            <option value="Water Supply">Drinking Water issues</option>
                            <option value="Street Lights">Streetlights out of order</option>
                            <option value="Drainage Control">Stormwater drains & clogging</option>
                          </select>
                        </div>
                      </div>

                      {/* Details TextArea */}
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-gray-700 mb-1">Describe the Issue</label>
                        <textarea 
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          placeholder="Include precise street landmarks, details of issue, and how long it has been pending."
                          rows="3"
                          className="border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none transition duration-200 resize-none font-medium text-left"
                          required
                        ></textarea>
                      </div>

                      {/* Photo Upload Attachment */}
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-gray-700 mb-1">Attach Photo (Optional)</label>
                        
                        {!attachedPhoto ? (
                          <div className="border border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100/50 transition-colors duration-200 relative cursor-pointer group">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            />
                            <Upload size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                            <span className="text-[11px] font-bold text-gray-500 mt-1">Click to select photo</span>
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-[9px] border border-primary/10">
                                IMG
                              </div>
                              <div className="text-left flex flex-col">
                                <span className="text-xs font-bold text-gray-800 line-clamp-1">{attachedPhoto}</span>
                                {uploadProgress < 100 ? (
                                  <span className="text-[8px] text-gray-400 font-bold">Uploading {uploadProgress}%</span>
                                ) : (
                                  <span className="text-[8px] text-emerald-600 font-bold">Upload Finished ✓</span>
                                )}
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={handleRemovePhoto}
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition cursor-pointer border-0 bg-transparent"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={handleClosePortal}
                          className="px-5 py-2.5 rounded-xl border border-gray-250 text-gray-700 text-xs md:text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || (attachedPhoto && uploadProgress < 100)}
                          className="bg-primary hover:bg-accent text-white px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Filing...</span>
                            </>
                          ) : (
                            <span>File Complaint</span>
                          )}
                        </button>
                      </div>

                    </form>
                  ) : (
                    /* Success Screen */
                    <div className="text-center space-y-6 py-6 select-text">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md border border-emerald-100 animate-scale-up">
                        <CheckCircle2 size={32} strokeWidth={2.5} />
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-gray-900">Grievance Filed Successfully!</h4>
                        <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
                          Your complaint has been forwarded to the Ward inspector. Save the ID below to monitor updates:
                        </p>
                      </div>

                      <div className="flex items-center justify-center space-x-2 bg-gray-50 border border-gray-150 p-4 rounded-2xl max-w-sm mx-auto">
                        <span className="font-mono font-black text-primary text-base md:text-lg select-all">
                          {submissionSuccess.id}
                        </span>
                        <button
                          onClick={() => handleCopyId(submissionSuccess.id)}
                          className="text-gray-400 hover:text-primary p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition cursor-pointer"
                          title="Copy Tracking ID"
                        >
                          {isCopied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                        </button>
                      </div>

                      <p className="text-[11px] text-gray-400 font-bold max-w-sm mx-auto leading-normal">
                        * A confirmation message has been dispatched to your mobile number. Resolution updates will appear inside the "Track Status" tab using this ID.
                      </p>

                      <div className="pt-4">
                        <button
                          onClick={handleResetForm}
                          className="px-6 py-2.5 bg-primary hover:bg-accent text-white font-bold rounded-xl text-xs md:text-sm shadow-md transition cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Track Status */}
              {activeTab === 'track' && (
                <div className="space-y-6">
                  
                  {/* Search Bar Panel */}
                  <div className="bg-gray-50 rounded-2xl border border-gray-150 p-4 text-left">
                    <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-grow relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={searchId}
                          onChange={(e) => setSearchId(e.target.value)}
                          placeholder="Enter Grievance ID (e.g. KK-GRV-1001)"
                          className="w-full border border-gray-200 focus:border-primary rounded-xl pl-9 pr-4 py-2.5 text-xs md:text-sm focus:outline-none transition font-medium"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-primary hover:bg-accent text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition shadow-xs cursor-pointer shrink-0"
                      >
                        Track Complaint
                      </button>
                    </form>

                    {searchError && (
                      <div className="mt-2.5 flex items-center space-x-2 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-xl">
                        <ShieldAlert size={12} className="shrink-0" />
                        <span>{searchError}</span>
                      </div>
                    )}
                  </div>

                  {/* Tracking Result View */}
                  {trackedGrievance && (
                    <div className="text-left space-y-6 animate-scale-up">
                      
                      {/* Result Top Card Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-100 pb-4 select-text">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Tracked Grievance</span>
                          <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center space-x-2 mt-0.5">
                            <span>ID: {trackedGrievance.id}</span>
                            <button
                              onClick={() => handleCopyId(trackedGrievance.id)}
                              className="text-gray-400 hover:text-primary p-1 rounded-md transition hover:bg-gray-50 border border-transparent hover:border-gray-150"
                            >
                              {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            </button>
                          </h3>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase border ${
                          trackedGrievance.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : trackedGrievance.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {trackedGrievance.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Grievance Details Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-text text-xs text-gray-700">
                        <div className="space-y-3">
                          <div>
                            <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Lodged Date</span>
                            <span className="text-gray-900 font-bold">{trackedGrievance.date}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Category & Location</span>
                            <span className="text-gray-900 font-bold">{trackedGrievance.category} • {trackedGrievance.ward.split(' - ')[1] || trackedGrievance.ward}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Assigned Officer</span>
                            <span className="text-gray-900 font-bold">{trackedGrievance.assignedOfficer}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Citizen Name</span>
                            <span className="text-gray-900 font-bold">{trackedGrievance.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl select-text">
                        <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider mb-1">Grievance Description</span>
                        <p className="text-xs font-semibold text-gray-800 leading-relaxed text-left">{trackedGrievance.details}</p>
                      </div>

                      {/* Interactive Status Timeline Progress */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Progress Timeline</h4>
                        
                        <div className="relative pl-6 space-y-4">
                          {/* Vertical Timeline Track Line */}
                          <div className="w-0.5 bg-gray-200 absolute top-2 bottom-2 left-[5px]"></div>
                          
                          {trackedGrievance.updates.map((update, idx) => (
                            <div key={idx} className="relative text-left flex items-start">
                              {/* Timeline Node Point indicator */}
                              <div className={`w-3 h-3 rounded-full border-2 border-white absolute left-[-25px] top-1 z-10 ${
                                update.done ? 'bg-emerald-500' : 'bg-gray-300'
                              }`}></div>

                              <div className="flex-grow">
                                <div className="flex justify-between items-center select-text">
                                  <span className={`text-xs font-bold ${update.done ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {update.title}
                                  </span>
                                  <span className="text-[9px] text-gray-400 font-bold">{update.time}</span>
                                </div>
                                <p className={`text-xs mt-0.5 font-medium ${update.done ? 'text-gray-600' : 'text-gray-400'}`}>
                                  {update.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resolved Photo Proof Block */}
                      {trackedGrievance.status === 'RESOLVED' && (
                        <div className="border border-emerald-100 rounded-2xl p-4 bg-emerald-50/15 flex flex-col sm:flex-row gap-4 items-center">
                          <div className="w-24 h-16 bg-gray-200 rounded-xl overflow-hidden shadow-xs shrink-0 relative">
                            <img src={trackedGrievance.photo} alt="Verification" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/10"></div>
                            <span className="absolute bottom-1 right-2 bg-emerald-600 text-[8px] font-black text-white px-2 py-0.5 rounded-sm">AFTER</span>
                          </div>

                          <div className="text-left flex-grow">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Resolution Proof</span>
                            <p className="text-xs font-semibold text-gray-800 leading-normal">{trackedGrievance.resolutionProof}</p>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default GrievanceCenter;
