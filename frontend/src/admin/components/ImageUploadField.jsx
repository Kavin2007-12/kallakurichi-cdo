import { useState, useRef } from 'react';
import { UploadCloud, Trash2, RefreshCw } from 'lucide-react';

// Reusable Drag & Drop Image Uploader with canvas image compression and precise file control
export const ImageUploadField = ({ value, onChange, label, allowRemove = true }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        onChange(compressedBase64);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBrowse = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col text-left space-y-1.5 w-full">
      {label && <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{label}</label>}
      
      {/* Hidden native file input triggered only via programmatic click */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {value ? (
        <div className="border border-gray-200 bg-gray-50 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3 min-w-0">
            <img 
              src={value} 
              alt="Uploaded Preview" 
              className="w-14 h-14 object-cover rounded-xl border border-gray-300 shadow-xs shrink-0 bg-white" 
            />
            <div className="min-w-0">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Image Loaded
              </span>
              <span className="text-[9px] text-gray-400 font-bold block truncate max-w-[140px] sm:max-w-[200px]">
                {value.startsWith('data:') ? 'Custom Image File' : value}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleBrowse}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-wider border border-gray-200 shadow-xs transition cursor-pointer"
              title="Change / Replace this image"
            >
              <RefreshCw size={11} className="text-gray-500" />
              <span>Change</span>
            </button>
            {allowRemove && (
              <button 
                type="button" 
                onClick={handleClear}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider border border-red-200 shadow-xs transition cursor-pointer"
                title="Remove / Delete this image"
              >
                <Trash2 size={11} className="text-red-500" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div 
          onClick={handleBrowse}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition cursor-pointer text-center relative min-h-[110px] select-none ${
            isDragActive 
              ? 'border-[#800000] bg-[#800000]/5' 
              : 'border-gray-200 bg-gray-50 hover:bg-gray-100/60 hover:border-gray-300'
          }`}
        >
          <UploadCloud size={22} className="text-gray-400 mb-1" />
          <span className="text-xs font-bold text-gray-700 block">Drag & drop image here</span>
          <span className="text-[10px] text-gray-400 font-bold block">or click to browse from device</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
