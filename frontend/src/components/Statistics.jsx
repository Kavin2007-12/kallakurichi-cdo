import { FileText, Clock, RefreshCw, CheckCircle } from 'lucide-react';

const Statistics = () => {
  const stats = [
    { label: 'Total Complaints', value: '2,458', icon: FileText, color: 'text-white', bg: 'bg-primary', hover: 'group-hover:scale-105' },
    { label: 'Pending', value: '1,248', icon: Clock, color: 'text-primary', bg: 'bg-secondary', hover: 'group-hover:scale-105' },
    { label: 'In Progress', value: '856', icon: RefreshCw, color: 'text-white', bg: 'bg-primary', hover: 'group-hover:scale-105' },
    { label: 'Resolved', value: '354', icon: CheckCircle, color: 'text-primary', bg: 'bg-secondary', hover: 'group-hover:scale-105' },
  ];

  return (
    <div className="bg-gray-50 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex justify-center mb-10">
          <h2 className="text-primary font-extrabold tracking-wide px-4 text-sm md:text-lg text-center uppercase">
            Kallakurichi At a Glance
          </h2>
        </div>

        {/* Stats Grid - 2 per row on mobile, 4 per row on PC */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 flex flex-col lg:flex-row items-center lg:space-x-5 space-y-3 lg:space-y-0 shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer group text-center lg:text-left"
              >
                {/* Icon Container */}
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 ${stat.hover} transition-colors duration-300`}>
                  <Icon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" strokeWidth={2} />
                </div>
                
                {/* Content */}
                <div className="flex-1 w-full">
                  <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 line-clamp-1">{stat.label}</p>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-800 leading-none group-hover:text-primary transition-colors duration-300">
                    {stat.value}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Statistics;
