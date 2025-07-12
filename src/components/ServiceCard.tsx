interface ServiceCardProps {
  title: string;
  price: string;
  description: string;
  duration: string;
  icon: string;
  onBookNow: () => void;
}

export default function ServiceCard({ title, price, description, duration, icon, onBookNow }: ServiceCardProps) {
  return (
    <div className="card-hover p-8 group">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="text-3xl font-bold text-gradient-primary mb-4">{price}</div>
      </div>
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 font-medium">Duration: {duration}</span>
        <button 
          onClick={onBookNow}
          className="btn-primary text-sm px-6 py-2"
        >
          Book Now
        </button>
      </div>
    </div>
  );
} 