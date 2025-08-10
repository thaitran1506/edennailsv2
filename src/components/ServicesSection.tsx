'use client';

interface ServicesSectionProps {
  onBookNow: () => void;
}

export default function ServicesSection({ onBookNow }: ServicesSectionProps) {
  const services = [
    {
      title: "Manicure",
      price: "$25",
      description: "Professional nail shaping, cuticle care, and premium polish application for a flawless finish."
    },
    {
      title: "Manicure and Shellac",
      price: "$35",
      description: "Classic manicure with long-lasting shellac polish for extended wear and brilliant shine."
    },
    {
      title: "Pedicure",
      price: "$35",
      description: "Complete foot care including nail trimming, shaping, cuticle care, and polish application."
    },
    {
      title: "Eden Signature Pedicure",
      price: "$50",
      description: "Our signature pedicure experience with premium treatments and relaxing foot massage."
    },
    {
      title: "Pedicure Special",
      price: "$50",
      description: "Special pedicure treatment with enhanced care and premium finishing touches."
    },
    {
      title: "Hot Rock Pedicure",
      price: "$60",
      description: "Luxurious pedicure with hot stone massage for ultimate relaxation and rejuvenation."
    },
    {
      title: "Full Set",
      price: "$55+",
      description: "Complete acrylic or gel nail extensions with shaping, design, and professional finish."
    },
    {
      title: "Fill",
      price: "$45+",
      description: "Maintenance for existing nail extensions with fresh polish and touch-ups."
    },
    {
      title: "Dipping Powder",
      price: "$50+",
      description: "Durable dipping powder application for long-lasting, chip-resistant nails."
    }
  ];

  return (
    <div className="px-40 flex flex-1 justify-center py-16 bg-white">
      <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-[#181113] text-3xl font-bold leading-tight mb-4">Our Services</h2>
          <p className="text-[#88636f] text-base max-w-2xl mx-auto">
            Professional nail care services designed to pamper and beautify your hands and feet.
          </p>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#eb477e] transition-colors duration-200"
            >
              {/* Service Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#181113]">
                  {service.title}
                </h3>
                <div className="text-right">
                  <div className="text-lg font-semibold text-[#eb477e]">{service.price}</div>
                </div>
              </div>

              {/* Service Description */}
              <p className="text-[#88636f] text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button
            onClick={onBookNow}
            className="bg-[#eb477e] text-white py-3 px-8 rounded-lg font-semibold hover:bg-[#d63d6e] transition-colors duration-200"
          >
            Book Your Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
