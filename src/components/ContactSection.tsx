export default function ContactSection() {
  return (
    <div className="px-40 flex flex-1 justify-center py-5">
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
          <div className="grid grid-cols-[20%_1fr] gap-x-6 max-w-md">
            <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5dcdf] py-5">
              <p className="text-[#88636f] text-sm font-normal leading-normal">Monday</p>
              <p className="text-[#181113] text-sm font-normal leading-normal">9:00 AM - 7:00 PM</p>
            </div>
            <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5dcdf] py-5">
              <p className="text-[#88636f] text-sm font-normal leading-normal">Tuesday</p>
              <p className="text-[#181113] text-sm font-normal leading-normal">9:00 AM - 7:00 PM</p>
            </div>
            <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5dcdf] py-5">
              <p className="text-[#88636f] text-sm font-normal leading-normal">Wednesday</p>
              <p className="text-[#181113] text-sm font-normal leading-normal">9:00 AM - 7:00 PM</p>
            </div>
            <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5dcdf] py-5">
              <p className="text-[#88636f] text-sm font-normal leading-normal">Thursday</p>
              <p className="text-[#181113] text-sm font-normal leading-normal">9:00 AM - 7:00 PM</p>
            </div>
            <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5dcdf] py-5">
              <p className="text-[#88636f] text-sm font-normal leading-normal">Friday</p>
              <p className="text-[#181113] text-sm font-normal leading-normal">9:00 AM - 7:00 PM</p>
            </div>
            <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5dcdf] py-5">
              <p className="text-[#88636f] text-sm font-normal leading-normal">Saturday</p>
              <p className="text-[#181113] text-sm font-normal leading-normal">10:00 AM - 6:00 PM</p>
            </div>
            <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e5dcdf] py-5">
              <p className="text-[#88636f] text-sm font-normal leading-normal">Sunday</p>
              <p className="text-[#181113] text-sm font-normal leading-normal">10:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
