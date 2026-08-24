import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2, ArrowRight } from 'lucide-react';
import { getCurrentLanguage } from '../utils/lang';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Vanakkam! Welcome to the Kallakurichi Constituency Digital Office helper. How can I assist you today?',
      textTa: 'வணக்கம்! கள்ளக்குறிச்சி சட்டமன்ற தொகுதி டிஜிட்டல் அலுவலகத்திற்கு உங்களை வரவேற்கிறோம். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const currentLang = getCurrentLanguage();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Suggested Quick Questions (Updated for new web features)
  const suggestions = [
    {
      label: 'How to download Volunteer ID Card?',
      labelTa: 'தன்னார்வலர் அடையாள அட்டை பதிவிறக்கம்?',
      query: 'download_id_card'
    },
    {
      label: 'Book appointment with MLA',
      labelTa: 'சட்டமன்ற உறுப்பினரைச் சந்திக்க முன்பதிவு',
      query: 'book_appointment'
    },
    {
      label: 'Submit a public grievance / complaint',
      labelTa: 'பொதுமக்கள் புகார் பதிவு செய்வது எப்படி?',
      query: 'submit_grievance'
    },
    {
      label: 'View latest news & constituency works',
      labelTa: 'சமீபத்திய செய்திகள் & தொகுதிப் பணிகள்',
      query: 'latest_news'
    },
    {
      label: 'Contact Constituency Office',
      labelTa: 'தொகுதி அலுவலகத் தொடர்பு விவரங்கள்',
      query: 'contact_office'
    }
  ];

  // Auto answers database for updated web commands
  const getBotResponse = (queryText) => {
    const text = queryText.toLowerCase();

    // 1. Volunteer ID Card Download
    if (text.includes('download_id_card') || text.includes('id card') || text.includes('id_card') || text.includes('card') || text.includes('அடையாள அட்டை') || text.includes('membership')) {
      return {
        en: 'To download your TVK Volunteer ID Card: 1) Go to the "Volunteer" page from the top navigation menu. 2) Fill in your Name, Age, Blood Group, Mobile number, and Address. 3) Click "Register & Generate ID Card". 4) Your digital TVK Volunteer Card will be created instantly — click "Download ID Card" to save it to your device!',
        ta: 'தவெக தன்னார்வலர் அடையாள அட்டையைப் பதிவிறக்கம் செய்ய: 1) மேல் உள்ள "Volunteer" (தன்னார்வலர்) பக்கத்திற்குச் செல்லவும். 2) உங்கள் பெயர், வயது, இரத்த வகை, மொபைல் எண் மற்றும் முகவரியைப் பூர்த்தி செய்யவும். 3) "Register & Generate ID Card" பொத்தானைக் கிளிக் செய்யவும். 4) உங்கள் டிஜிட்டல் உறுப்பினர் அட்டை உடனே உருவாக்கப்படும். "Download ID Card" என்பதைக் கிளிக் செய்து சேமித்துக் கொள்ளலாம்!'
      };
    }

    // 2. Book Appointment with MLA
    if (text.includes('book_appointment') || text.includes('appointment') || text.includes('meet') || text.includes('சந்திக்க') || text.includes('முன்பதிவு')) {
      return {
        en: 'To book an official appointment with MLA Mr. C. Arul Vignesh: 1) Click "Appointment" in the top bar. 2) Select your Taluk, Village, Preferred Date, and Purpose of meeting. 3) Click "Book Appointment". You will receive a Reference ID to track your meeting approval status!',
        ta: 'சட்டமன்ற உறுப்பினர் திரு. சி. அருள் விக்னேஷ் அவர்களை நேரில் சந்திக்க: 1) மேல் உள்ள "Appointment" பக்கத்திற்குச் செல்லவும். 2) உங்கள் வட்டம், கிராமம், விருப்பமான தேதி மற்றும் சந்திப்பின் நோக்கத்தைத் தேர்ந்தெடுக்கவும். 3) "Book Appointment" கிளிக் செய்யவும். அனுமதி நிலையை அறிய Reference ID வழங்கப்படும்!'
      };
    }

    // 3. Submit Public Grievance / Complaint
    if (text.includes('submit_grievance') || text.includes('grievance') || text.includes('complaint') || text.includes('புகார்')) {
      return {
        en: 'To file a public grievance or complaint: 1) Scroll to the Grievance Portal on the homepage or click "Submit Grievance". 2) Provide your Ward, Mobile number, Issue Category (Roads, Water, Lighting), and Details. 3) You will get a Tracking ID (e.g. KK-GRV-1234) to monitor resolution updates!',
        ta: 'பொதுமக்கள் புகார் பதிவு செய்ய: 1) முகப்புப் பக்கத்தில் உள்ள Grievance பகுதிக்குச் செல்லவும். 2) உங்கள் வார்டு, மொபைல் எண், புகாரின் வகை (சாலை, குடிநீர், மின்விளக்கு) மற்றும் விவரங்களை எழுதவும். 3) புகாரின் நிலையைத் தொடர்ந்து கண்காணிக்க Tracking ID வழங்கப்படும்!'
      };
    }

    // 4. Latest News & Works Completed
    if (text.includes('latest_news') || text.includes('news') || text.includes('work') || text.includes('update') || text.includes('செய்திகள்') || text.includes('பணிகள்')) {
      return {
        en: 'For latest news and constituency developments: 1) Check "Live News & Press Media" on the homepage for official announcements and click any article for full coverage. 2) Explore "Updates & Works Completed" to see local infrastructure projects (tap any card on mobile to see detailed description).',
        ta: 'சமீபத்திய செய்திகள் மற்றும் வளர்ச்சிப் பணிகளைப் பார்க்க: 1) முகப்புப் பக்கத்தில் உள்ள "Live News" பகுதியில் அதிகாரப்பூர்வ அறிவிப்புகள் மற்றும் செய்திகளைப் படிக்கலாம். 2) "Updates & Works Completed" பகுதியில் நிறைவுற்ற வளர்ச்சித் திட்டங்களைப் பார்க்கலாம் (மொபைலில் கார்டைக் கிளிக் செய்து முழு விவரத்தையும் அறியலாம்).'
      };
    }

    // 5. Contact Office
    if (text.includes('contact_office') || text.includes('contact') || text.includes('phone') || text.includes('email') || text.includes('office') || text.includes('தொடர்பு')) {
      return {
        en: 'Kallakurichi Constituency Office Details: Address: Kallakurichi Assembly Constituency Office, Kallakurichi, Tamil Nadu - 606202. Phone: +91 98765 43210 | Email: kallakurichioffice@gmail.com. Hours: Mon-Sat, 10:00 AM – 6:00 PM.',
        ta: 'கள்ளக்குறிச்சி தொகுதி அலுவலகத் தொடர்பு விவரங்கள்: முகவரி: கள்ளக்குறிச்சி சட்டமன்ற தொகுதி அலுவலகம், கள்ளக்குறிச்சி, தமிழ்நாடு - 606202. தொலைபேசி: +91 98765 43210 | மின்னஞ்சல்: kallakurichioffice@gmail.com. வேலை நேரம்: திங்கள் - சனி, காலை 10:00 - மாலை 6:00 வரை.'
      };
    }

    return {
      en: 'Thank you for contacting the Kallakurichi Constituency Assistant. You can ask about downloading Volunteer ID Cards, booking MLA appointments, submitting grievances, or viewing latest news. For direct queries, call our office at +91 98765 43210.',
      ta: 'கள்ளக்குறிச்சி தொகுதி உதவி மையத்தைத் தொடர்பு கொண்டமைக்கு நன்றி. தன்னார்வலர் அட்டை பதிவிறக்கம், சட்டமன்ற உறுப்பினர் சந்திப்பு முன்பதிவு, புகார் பதிவு மற்றும் செய்திகள் பற்றி கேளுங்கள். அவசர உதவிக்கு +91 98765 43210 என்ற எண்ணில் அழைக்கவும்.'
    };
  };

  const handleSendMessage = (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      textTa: textToSend
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Trigger typing indicator and reply
    setIsTyping(true);
    setTimeout(() => {
      const response = getBotResponse(textToSend);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.en,
        textTa: response.ta
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      <div className="fixed bottom-10 left-6 lg:bottom-8 lg:left-8 z-[60] notranslate">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-secondary text-primary font-extrabold px-5 py-3.5 rounded-full shadow-2xl hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2.5 border border-primary/20 cursor-pointer animate-pulse-ring"
        >
          <MessageSquare size={18} strokeWidth={2.5} />
          <span className="text-xs md:text-sm font-sans tracking-wide">
            {currentLang === 'ta' ? 'கேளுங்கள்' : 'Ask'}
          </span>
        </button>
      </div>

      {/* Chat window Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-xs z-[70] flex items-end md:items-center justify-center md:justify-start md:pl-10 md:pb-10 notranslate">
          {/* Chat Window Container */}
          <div className="bg-white w-full md:w-[380px] h-[85vh] md:h-[550px] rounded-t-3xl md:rounded-2xl shadow-2xl border border-gray-100 flex flex-col justify-between overflow-hidden animate-slide-up">

            {/* Chat Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-white/20 p-1 flex-shrink-0">
                  <img src="/TVK_Logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm md:text-base leading-none">CDO Assistant</span>
                  <span className="text-[10px] text-emerald-300 font-bold mt-1 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{currentLang === 'ta' ? 'ஆன்லைனில் உள்ளது' : 'Online - Help Desk'}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-[82%] ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Icon */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white p-1.5 ${m.sender === 'user' ? 'bg-primary' : 'bg-secondary text-primary'
                      }`}>
                      {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>

                    {/* Text Bubble */}
                    <div className={`p-3 rounded-2xl shadow-xs text-xs md:text-sm leading-relaxed ${m.sender === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none font-medium'
                      }`}>
                      {currentLang === 'ta' ? m.textTa : m.text}
                    </div>
                  </div>
                </div>
              ))}

              {/* Bot Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary text-primary p-1.5">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none flex items-center justify-center shadow-xs">
                      <Loader2 size={16} className="animate-spin text-primary/60" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Prompts & Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">

              {/* Suggestion Chips */}
              <div className="flex flex-col space-y-2 mb-4">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s.query)}
                    className="bg-gray-50 hover:bg-primary/5 text-gray-700 hover:text-primary border border-gray-200 hover:border-primary/20 text-[10px] md:text-xs text-left px-3.5 py-2 rounded-xl transition duration-200 font-semibold flex items-center justify-between cursor-pointer group"
                  >
                    <span>{currentLang === 'ta' ? s.labelTa : s.label}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>

              {/* Text Input Row */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={currentLang === 'ta' ? 'கேள்விகளை தட்டச்சு செய்யவும்...' : 'Type your question...'}
                  className="flex-grow border border-gray-200 focus:border-primary rounded-xl px-3.5 py-2 text-xs md:text-sm focus:outline-none transition duration-200"
                />
                <button
                  type="submit"
                  className="bg-primary text-white p-2.5 rounded-xl hover:bg-accent transition shadow-md cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
