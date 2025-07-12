interface ServiceCardProps {
  title: string;
  price: string;
  description: string;
  duration: string;
  onBookNow: () => void;
}

export default function ServiceCard({ title, price, description, duration, onBookNow }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <span className="text-2xl font-bold text-pink-500">{price}</span>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Duration: {duration}</span>
        <button 
          onClick={onBookNow}
          className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm hover:bg-pink-600 transition-colors"
        >
          Book Now
        </button>
      </div>
    </div>
  );
} 