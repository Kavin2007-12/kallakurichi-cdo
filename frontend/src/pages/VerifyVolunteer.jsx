import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  User, 
  MapPin, 
  Droplet, 
  Calendar, 
  ArrowLeft, 
  AlertCircle, 
  QrCode,
  Download,
  Building2,
  Phone
} from 'lucide-react';
import TVKVolunteerIDCard from '../components/TVKVolunteerIDCard';
import { exportVolunteerCardCanvas } from '../utils/directCardCanvas';

export default function VerifyVolunteer() {
  const [searchParams] = useSearchParams();
  const volunteerId = searchParams.get('id') || searchParams.get('code') || '';

  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!volunteerId) {
      setLoading(false);
      setError('செல்லுபடியாகும் உறுப்பினர் குறியீடு (Member ID) குறிப்பிடப்படவில்லை.');
      return;
    }

    const fetchVolunteer = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from public backend endpoint
        const res = await fetch(`/api/volunteers/${encodeURIComponent(volunteerId)}`);
        if (res.ok) {
          const data = await res.json();
          setVolunteer(data);
        } else {
          // Fallback: search in full list
          const allRes = await fetch('/api/volunteers');
          if (allRes.ok) {
            const list = await allRes.json();
            const found = list.find(v => (v.id || '').toUpperCase() === volunteerId.toUpperCase());
            if (found) {
              setVolunteer(found);
            } else {
              setError(`உறுப்பினர் ID "${volunteerId}" பதிவுகளில் காணப்படவில்லை.`);
            }
          } else {
            setError('உறுப்பினர் விவரங்களைப் பெற முடியவில்லை.');
          }
        }
      } catch (err) {
        console.error('Error verifying volunteer:', err);
        setError('சேவையகத்துடன் இணைக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteer();
  }, [volunteerId]);

  const handleDownload = async () => {
    if (!volunteer) return;
    try {
      setIsDownloading(true);
      await exportVolunteerCardCanvas(volunteer);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#FFF9F2] via-white to-[#FDF2F4] text-gray-900 flex flex-col font-sans">
      {/* Top TVK Official Header */}
      <header className="bg-[#680208] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center overflow-hidden border border-amber-400">
              <img src="/TVK_Logo.png" alt="TVK" className="w-full h-full object-cover" onError={(e) => { e.target.src = '/tn_logo.png'; }} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-[#FCCB06] tracking-wide leading-none font-['Mukta_Malar']">
                தமிழக வெற்றிக் கழகம்
              </h1>
              <p className="text-[11px] text-amber-200/90 font-medium">கள்ளக்குறிச்சி தொகுதி - உறுப்பினர் சரிபார்ப்பு</p>
            </div>
          </div>

          <Link
            to="/volunteer"
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition flex items-center space-x-1"
          >
            <ArrowLeft size={13} />
            <span>முகப்பு</span>
          </Link>
        </div>
      </header>

      {/* Main Verification Container */}
      <main className="max-w-3xl mx-auto px-4 py-8 flex-grow w-full">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 border-4 border-[#680208] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800">உறுப்பினர் விவரங்கள் சரிபார்க்கப்படுகின்றன...</h3>
            <p className="text-xs text-gray-500 mt-1">Verifying official TVK membership credentials...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-xl text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-black text-red-700 mb-2">சரிபார்ப்பு தோல்வி (Not Verified)</h2>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <Link
              to="/volunteer"
              className="inline-block bg-[#680208] hover:bg-[#500106] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition"
            >
              தன்னார்வலர் பக்கம் செல்லவும்
            </Link>
          </div>
        ) : volunteer ? (
          <div className="space-y-6">
            {/* 1. Official Verified Badge Banner */}
            <div className="bg-linear-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden text-center">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="w-14 h-14 bg-white text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-emerald-300">
                <ShieldCheck size={32} />
              </div>

              <div className="inline-flex items-center space-x-1.5 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-400/40 text-[11px] font-bold text-emerald-200 uppercase tracking-widest mb-2">
                <CheckCircle2 size={13} className="text-emerald-300" />
                <span>OFFICIALLY VERIFIED VOLUNTEER</span>
              </div>

              <h2 className="text-2xl font-black tracking-tight text-white mb-1">
                {volunteer.name}
              </h2>
              <p className="text-sm text-emerald-100 font-mono tracking-wider font-bold">
                Member ID: {volunteer.id}
              </p>
            </div>

            {/* 2. Official ID Card Visual Display */}
            <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <QrCode size={18} className="text-[#680208]" />
                  <h3 className="text-sm font-black text-[#680208] uppercase tracking-wider">
                    Digital Volunteer ID Card
                  </h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {volunteer.status === 'APPROVED' ? 'APPROVED' : volunteer.status || 'ACTIVE'}
                </span>
              </div>

              {/* ID Card Display container with scaling */}
              <div className="w-full overflow-x-auto flex justify-center py-2 bg-gray-50/60 rounded-2xl p-2 border border-gray-100">
                <div id={`verify-card-${volunteer.id}`} className="shrink-0">
                  <TVKVolunteerIDCard vol={volunteer} />
                </div>
              </div>

              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-3 bg-linear-to-r from-[#680208] to-[#8C000B] hover:from-[#500106] hover:to-[#680208] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>பதிவிறக்குகிறது...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Download Volunteer Card</span>
                  </>
                )}
              </button>
            </div>

            {/* 3. Full Verified Details Grid */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md space-y-4">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">
                உறுப்பினர் சரிபார்க்கப்பட்ட முழு விவரங்கள் (Verified Records)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm">
                <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 flex items-start space-x-3">
                  <User size={18} className="text-[#680208] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase">முழுப் பெயர் / Full Name</p>
                    <p className="font-bold text-gray-900 text-[15px]">{volunteer.name}</p>
                  </div>
                </div>

                <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 flex items-start space-x-3">
                  <ShieldCheck size={18} className="text-[#680208] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase">உறுப்பினர் எண் / Member ID</p>
                    <p className="font-bold text-[#680208] text-[15px] font-mono">{volunteer.id}</p>
                  </div>
                </div>

                <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 flex items-start space-x-3">
                  <Droplet size={18} className="text-[#680208] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase">இரத்த வகை / Blood Group & Age</p>
                    <p className="font-bold text-gray-900 text-[15px]">
                      {volunteer.bloodGroup || volunteer.bloodgroup || 'O+'} / {volunteer.age || volunteer.Age ? `${volunteer.age || volunteer.Age} Yrs` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 flex items-start space-x-3">
                  <Building2 size={18} className="text-[#680208] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase">மாவட்டம் / District</p>
                    <p className="font-bold text-gray-900 text-[15px]">Kallakurichi (கள்ளக்குறிச்சி)</p>
                  </div>
                </div>

                <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 flex items-start space-x-3">
                  <MapPin size={18} className="text-[#680208] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase">தொகுதி / Constituency</p>
                    <p className="font-bold text-gray-900 text-[15px]">{volunteer.constituency || volunteer.taluk || 'Chinnasalem'}</p>
                  </div>
                </div>

                <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 flex items-start space-x-3">
                  <Calendar size={18} className="text-[#680208] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase">சரிபார்க்கப்பட்ட நிலை / Status</p>
                    <p className="font-bold text-emerald-700 text-[15px]">
                      {volunteer.status === 'APPROVED' ? 'Approved & Active' : volunteer.status || 'Verified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Footer Verification Seal */}
            <div className="text-center text-xs text-gray-500 pt-2 pb-6 space-y-1">
              <p className="font-bold text-[#680208]">தமிழக வெற்றிக் கழகம் - கள்ளக்குறிச்சி தொகுதி அலுவலகம்</p>
              <p>Official Digital Membership Verification Portal • Powered by TVK Kallakurichi</p>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
