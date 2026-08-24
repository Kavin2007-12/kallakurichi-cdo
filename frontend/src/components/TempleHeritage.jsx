import React from 'react';
import { Landmark, MapPin, Calendar, Crown } from 'lucide-react';
import { getCurrentLanguage } from '../utils/lang';

const TempleHeritage = () => {
  const currentLang = getCurrentLanguage();
  const isTa = currentLang === 'ta';

  const contentEn = "Ulagalantha Perumal Temple or Trivikrama Temple is a Hindu temple dedicated to Vishnu located in Tirukkoyilur, Tamil Nadu, India. Constructed in the Dravidian style of architecture, the temple is glorified in the Naalayira Divya Prabandham, the early medieval Tamil canon of the Alvar saints from the 6th–9th centuries CE. It is one of the 108 Divya Desams dedicated to Vishnu, who is worshipped as Ulagalantha Perumal and his consort Lakshmi as Poongothai. The temple is believed to have been built by the Medieval Cholas, with later contributions from Vijayanagara kings and Madurai Nayaks. The temple covers an area of 5 acres (20,000 m2) and has a temple tower that is the third tallest in Tamil Nadu, measuring 192 ft (59 m) in height.";

  const contentTa = "உலகளந்த பெருமாள் கோயில் (அருள்மிகு திரிவிக்ரமன் திருக்கோவில்) என்பது தமிழ்நாட்டின் கள்ளக்குறிச்சி மாவட்டம், திருக்கோவிலூரில் அமைந்துள்ள ஒரு பழமையான வைணவக் கோயிலாகும். திராவிடக் கட்டிடக்கலை பாணியில் கட்டப்பட்ட இக்கோயில், கி.பி. 6 முதல் 9 ஆம் நூற்றாண்டு வரையிலான ஆழ்வார்களால் நாலாயிர திவ்ய பிரபந்தத்தில் மங்களாசாசனம் செய்யப்பட்ட 108 திவ்ய தேசங்களில் ஒன்றாகும். இங்கு மூலவர் உலகளந்த பெருமாள் என்றும், தாயார் பூங்கோதை நாச்சியார் என்றும் வணங்கப்படுகின்றனர். இக்கோயில் முற்காலச் சோழர்களால் கட்டப்பட்டு, பின்னர் விஜயநகர அரசர்கள் மற்றும் மதுரை நாயக்கர்களால் திருப்பணிகள் செய்யப்பட்டதாகக் கருதப்படுகிறது. சுமார் 5 ஏக்கர் பரப்பளவைக் கொண்ட இக்கோயிலின் இராஜகோபுரம் 192 அடி (59 மீட்டர்) உயரத்துடன் தமிழகத்தின் மூன்றாவது மிக உயரமான கோபுரமாகத் திகழ்கிறது.";

  return (
    <section id="heritage-temple" className="py-16 bg-white overflow-hidden border-b border-gray-100 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/5 px-4 py-1.5 rounded-full notranslate">
            {isTa ? 'வரலாற்று பாரம்பரிய சின்னம்' : 'Historical Constituency Heritage'}
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-3 notranslate">
            {isTa ? 'திருக்கோவிலூர் உலகளந்த பெருமாள் கோவில்' : 'Tirukkoyilur Ulagalantha Perumal Temple'}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Sketch Image (No borders or padding, expanded size, shifted left) */}
          <div className="lg:col-span-6 flex justify-center lg:-translate-x-[75px] transition-transform duration-300">
            <div className="relative group max-w-[420px] sm:max-w-[460px] w-full">
              {/* Glow background effects (very subtle) */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent/10 rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition duration-500 -z-10"></div>
              
              {/* Main Image frame with left/right edge fade masking */}
              <div 
                className="relative overflow-hidden rounded-3xl"
                style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)'
                }}
              >
                <img 
                  src="/tirukkoyilur_temple.jpg" 
                  alt="Tirukkoyilur Ulagalantha Perumal Temple" 
                  className="w-full h-auto object-cover rounded-3xl select-none"
                  draggable="false"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Historical details with justified alignment (shifted left to align) */}
          <div className="lg:col-span-6 text-left space-y-6 lg:-translate-x-[40px] transition-transform duration-300">
            <div className="space-y-2 flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="flex items-center space-x-2 bg-secondary/5 text-primary border border-primary/10 px-3 py-1 rounded-lg w-fit text-xs font-bold notranslate">
                <Landmark size={14} />
                <span>{isTa ? '108 வைணவ திவ்ய தேசங்கள்' : 'One of the 108 Vaishnava Divya Desams'}</span>
              </div>
              <h3 className="text-xl md:text-3xl font-black text-gray-900 notranslate">
                {isTa ? 'உலகளந்த பெருமாள் திருக்கோவில்' : 'Ulagalantha Perumal Temple'}
              </h3>
              <p className="text-xs md:text-sm font-bold text-primary tracking-wide uppercase flex items-center justify-center lg:justify-start space-x-1.5 notranslate">
                <MapPin size={13} className="text-secondary fill-secondary" />
                <span>{isTa ? 'திருக்கோவிலூர், கள்ளக்குறிச்சி மாவட்டம்' : 'Tirukkoyilur, Kallakurichi District'}</span>
              </p>
            </div>

            {/* Justified Description Text */}
            <div className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium notranslate text-justify space-y-4">
              <p>
                {isTa ? contentTa : contentEn}
              </p>
            </div>

            {/* Quick Historical Facts Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center space-x-3 bg-gray-50 border border-gray-100 rounded-xl p-3 notranslate">
                <div className="p-2 bg-primary/10 text-primary rounded-lg"><Crown size={16} /></div>
                <div>
                  <span className="block text-[9px] text-gray-400 font-bold uppercase">{isTa ? 'வரலாற்று காலம்' : 'Historical Era'}</span>
                  <span className="text-xs font-bold text-gray-800">{isTa ? 'சோழர்கள் & நாயக்கர்கள்' : 'Cholas & Nayaks'}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-gray-50 border border-gray-100 rounded-xl p-3 notranslate">
                <div className="p-2 bg-primary/10 text-primary rounded-lg"><Calendar size={16} /></div>
                <div>
                  <span className="block text-[9px] text-gray-400 font-bold uppercase">{isTa ? 'கோபுர உயரம்' : 'Tower Height'}</span>
                  <span className="text-xs font-bold text-gray-800">{isTa ? '192 அடி (3வது உயரம்)' : '192 ft (3rd Tallest)'}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default TempleHeritage;
