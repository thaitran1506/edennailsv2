export default function ContactSection() {
  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-1 justify-center py-8 bg-white">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="flex flex-wrap justify-center gap-3 p-4">
          <p className="text-[#181113] tracking-light text-[32px] font-bold leading-tight min-w-72 text-center">Contact Us</p>
        </div>
        <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
          We&apos;d love to hear from you! Whether you have a question about our services, want to book an appointment, or just want to say hello, please don&apos;t hesitate to reach out.
        </p>
        <h3 className="text-[#181113] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4 text-center">Our Location</h3>
        <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">7916 SE Division St, Portland, OR 97206</p>
        <div className="flex px-4 py-3 justify-center">
          <iframe
            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=7916+SE+Division+St,+Portland,+OR+97206"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-lg max-w-2xl"
            title="Eden Nails Location"
          ></iframe>
        </div>
        <h3 className="text-[#181113] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4 text-center">Contact Information</h3>
        <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">Phone: (503) 673-9971</p>
        <h3 className="text-[#181113] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4 text-center">Business Hours</h3>
        <div className="p-4 flex justify-center">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 max-w-md w-full">
            <div className="space-y-3">
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[#88636f] font-medium text-sm">Monday</span>
                  <span className="text-[#181113] font-semibold text-sm">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[#88636f] font-medium text-sm">Tuesday</span>
                  <span className="text-[#181113] font-semibold text-sm">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[#88636f] font-medium text-sm">Wednesday</span>
                  <span className="text-[#181113] font-semibold text-sm">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[#88636f] font-medium text-sm">Thursday</span>
                  <span className="text-[#181113] font-semibold text-sm">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[#88636f] font-medium text-sm">Friday</span>
                  <span className="text-[#181113] font-semibold text-sm">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[#88636f] font-medium text-sm">Saturday</span>
                  <span className="text-[#181113] font-semibold text-sm">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#88636f] font-medium text-sm">Sunday</span>
                  <span className="text-[#181113] font-semibold text-sm">10:00 AM - 6:00 PM</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
