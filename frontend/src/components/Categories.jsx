import { Map, Droplet, Zap, Waves, Trash2, Lightbulb, Landmark, MoreHorizontal } from 'lucide-react';

const Categories = () => {
  const categories = [
    { name: 'Roads & Streets', icon: Map, bg: 'bg-white', border: 'border-gray-100', hover: 'hover:bg-gray-50', color: 'text-primary' },
    { name: 'Water Supply', icon: Droplet, bg: 'bg-white', border: 'border-gray-100', hover: 'hover:bg-gray-50', color: 'text-blue-500' },
    { name: 'Electricity', icon: Zap, bg: 'bg-white', border: 'border-gray-100', hover: 'hover:bg-gray-50', color: 'text-yellow-500' },
    { name: 'Drainage', icon: Waves, bg: 'bg-white', border: 'border-gray-100', hover: 'hover:bg-gray-50', color: 'text-teal-600' },
    { name: 'Garbage Management', icon: Trash2, bg: 'bg-white', border: 'border-gray-100', hover: 'hover:bg-gray-50', color: 'text-green-600' },
    { name: 'Street Lights', icon: Lightbulb, bg: 'bg-white', border: 'border-gray-100', hover: 'hover:bg-gray-50', color: 'text-amber-500' },
    { name: 'Public Property', icon: Landmark, bg: 'bg-white', border: 'border-gray-100', hover: 'hover:bg-gray-50', color: 'text-primary' },
    { name: 'Others', icon: MoreHorizontal, bg: 'bg-white', border: 'border-gray-100', hover: 'hover:bg-gray-50', color: 'text-gray-600' },
  ];

  return (
    <div className="py-12 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex justify-center mb-10">
          <h2 className="text-primary font-extrabold tracking-wide px-4 text-sm md:text-lg text-center uppercase">
            Register Complaint — Select a Category
          </h2>
        </div>

        {/* Categories Grid - 2 per row on mobile, 4 per row on PC */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <div 
                key={index} 
                className={`${cat.bg} border ${cat.border} ${cat.hover} rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}
              >
                {/* Icon Container - Top */}
                <div className={`mb-3 md:mb-4 ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                </div>
                
                {/* Content - Bottom */}
                <h3 className={`font-bold ${cat.color} text-[13px] md:text-sm text-center leading-snug`}>
                  {cat.name}
                </h3>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Categories;
