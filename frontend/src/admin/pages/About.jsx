import { useState, useEffect } from 'react';
import { Save, User, Landmark } from 'lucide-react';
import ImageUploadField from '../components/ImageUploadField';
import { api } from '../../services/api';

export const About = ({ mlaData = {}, setMlaData, onSave }) => {
  const [formData, setFormData] = useState({ ...mlaData });

  useEffect(() => {
    if (mlaData && (mlaData.name || mlaData.photo || mlaData.bio)) {
      setFormData({ ...mlaData });
    } else {
      api.getMlaData({}).then((data) => {
        if (data && (data.name || data.photo || data.bio)) {
          setFormData({ ...data });
          if (setMlaData) setMlaData(data);
        }
      });
    }
  }, [mlaData]);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (setMlaData) setMlaData(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fadeIn text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">MLA Profile & Biography</h2>
          <p className="text-xs font-semibold text-gray-500">Edit representative profile information, biography details, and official photograph.</p>
        </div>
        <button
          type="submit"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#800000] to-[#5a0000] hover:from-[#600000] hover:to-[#400000] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-900/30 transition cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#FFCC00]" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Single Unified Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-150 shadow-sm space-y-8">
        
        {/* Section 1: Official Photograph & Primary Details */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <User size={16} className="text-[#800000]" />
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Representative Details & Official Photo</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4">
              <ImageUploadField
                label="Upload MLA Photo (High-Res)"
                value={formData.photo || ''}
                allowRemove={false}
                onChange={(val) => handleChange('photo', val)}
              />
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#800000]"
                  placeholder="e.g. Mr. C. Arul Vignesh"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Suffix / Designation</label>
                <input
                  type="text"
                  value={formData.suffix || ''}
                  onChange={(e) => handleChange('suffix', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#800000]"
                  placeholder="e.g. M.Sc., MLA"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Constituency Title</label>
                <input
                  type="text"
                  value={formData.constituency || ''}
                  onChange={(e) => handleChange('constituency', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#800000]"
                  placeholder="e.g. Kallakurichi Constituency | Tamilaga Vettri Kazhagam"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Biography Content */}
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Landmark size={16} className="text-[#800000]" />
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Biography</h3>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Biography Details</label>
            <textarea
              rows={8}
              value={formData.bio !== undefined ? formData.bio : [formData.bioP1, formData.bioP2].filter(Boolean).join('\n\n')}
              onChange={(e) => {
                const val = e.target.value;
                handleChange('bio', val);
              }}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#800000] leading-relaxed"
              placeholder="Enter complete MLA biography details here..."
            />
            <span className="text-[10px] text-gray-400 font-medium block mt-1">
              Tip: Separate paragraphs with a blank line (press Enter twice) to create paragraph breaks automatically on the website.
            </span>
          </div>
        </div>

      </div>
    </form>
  );
};

export default About;
