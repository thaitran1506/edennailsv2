import { Resend } from 'resend';
import twilio from 'twilio';

// Initialize services
const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface AppointmentDetails {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: string;
  specialRequests?: string;
  appointmentId: string;
}

export async function sendEmailConfirmation(appointment: AppointmentDetails): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Eden Nails <appointments@edennails.com>',
      to: [appointment.customerEmail],
      subject: 'Appointment Confirmation - Eden Nails',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d97706; margin: 0;">Eden Nails</h1>
            <p style="color: #666; margin: 5px 0;">Professional Nail Care</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Appointment Confirmed! ✨</h2>
            <p style="color: #374151; margin-bottom: 20px;">
              Hi ${appointment.customerName},<br>
              Your appointment has been successfully booked. We can't wait to pamper you!
            </p>
            
            <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #d97706;">
              <h3 style="color: #1f2937; margin-top: 0;">Appointment Details</h3>
              <p style="margin: 5px 0;"><strong>Service:</strong> ${appointment.service}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${appointment.appointmentDate}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.appointmentTime}</p>
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${appointment.duration}</p>
              ${appointment.specialRequests ? `<p style="margin: 5px 0;"><strong>Special Requests:</strong> ${appointment.specialRequests}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Confirmation ID:</strong> ${appointment.appointmentId}</p>
            </div>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin-top: 0;">Important Information</h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Please arrive 10 minutes early</li>
              <li>Bring a valid ID</li>
              <li>If you need to reschedule, please call us at least 24 hours in advance</li>
              <li>Cancellations less than 24 hours may incur a fee</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; margin: 5px 0;">Eden Nails Salon</p>
            <p style="color: #666; margin: 5px 0;">📍 123 Beauty Lane, Nail City, NC 12345</p>
            <p style="color: #666; margin: 5px 0;">📞 (555) 123-NAIL</p>
            <p style="color: #666; margin: 5px 0;">✉️ info@edennails.com</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Email sending error:', error);
      return false;
    }

    console.log('Email confirmation sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending email confirmation:', error);
    return false;
  }
}

export async function sendSMSConfirmation(appointment: AppointmentDetails): Promise<boolean> {
  try {
    const message = `✨ Eden Nails Appointment Confirmed!

Hi ${appointment.customerName}!

Service: ${appointment.service}
📅 ${appointment.appointmentDate}
🕐 ${appointment.appointmentTime}
⏱️ ${appointment.duration}

Confirmation ID: ${appointment.appointmentId}

Please arrive 10 min early. Need to reschedule? Call (555) 123-NAIL at least 24hrs ahead.

See you soon! 💅`;

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: appointment.customerPhone,
    });

    console.log('SMS confirmation sent successfully:', result.sid);
    return true;
  } catch (error) {
    console.error('Error sending SMS confirmation:', error);
    return false;
  }
}

export async function sendBothConfirmations(appointment: AppointmentDetails): Promise<{
  emailSent: boolean;
  smsSent: boolean;
}> {
  const [emailSent, smsSent] = await Promise.all([
    sendEmailConfirmation(appointment),
    sendSMSConfirmation(appointment),
  ]);

  return { emailSent, smsSent };
} 