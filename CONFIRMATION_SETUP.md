# Appointment Confirmation System Setup

Your Eden Nails website now includes automatic email and SMS confirmations for appointments! Here's how to set it up:

## 🔧 Required Services

### 1. Email Confirmations (Resend)
[Resend](https://resend.com) provides reliable email delivery with great developer experience.

**Setup Steps:**
1. Go to [resend.com](https://resend.com) and create an account
2. Verify your domain (or use their test domain for development)
3. Get your API key from the dashboard
4. Add `RESEND_API_KEY=re_your_key_here` to your `.env.local` file

**Pricing:** Free tier includes 100 emails/day, 3,000 emails/month

### 2. SMS Confirmations (Twilio)
[Twilio](https://twilio.com) is the leading SMS service provider.

**Setup Steps:**
1. Go to [twilio.com](https://twilio.com) and create an account
2. Get a phone number from the console
3. Find your Account SID and Auth Token in the dashboard
4. Add these to your `.env.local` file:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

**Pricing:** Pay-as-you-go, typically $0.0075 per SMS in the US

## 📋 Environment Variables

Create a `.env.local` file in your project root:

```bash
# Email Confirmation Service (Resend)
RESEND_API_KEY=re_your_api_key_here

# SMS Confirmation Service (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## 🚀 Deployment

When deploying to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all four environment variables above
4. Redeploy your application

## ✨ What Customers Receive

### Email Confirmation
- Professional HTML email with Eden Nails branding
- Complete appointment details (service, date, time, duration)
- Important information (arrive early, cancellation policy)
- Confirmation ID for reference
- Salon contact information

### SMS Confirmation
- Concise text message with key details
- Appointment summary with emojis for easy reading
- Confirmation ID
- Reminder about arrival time and cancellation policy

## 🔍 Testing

To test the confirmation system:

1. Set up both services (Resend + Twilio)
2. Add environment variables
3. Deploy to Vercel
4. Book a test appointment with your own email/phone
5. Check that you receive both confirmations

## 🛠️ Troubleshooting

### Email Issues
- Check your Resend API key is correct
- Verify your domain is set up (or use test domain)
- Check Vercel environment variables are set
- Look at Vercel function logs for errors

### SMS Issues
- Verify Twilio credentials are correct
- Ensure your phone number is in E.164 format (+1234567890)
- Check that your Twilio account has sufficient balance
- For international numbers, verify country permissions

### General Issues
- Check Vercel deployment logs
- Verify all environment variables are set
- Test with a simple appointment booking
- Check the browser console for any errors

## 📊 Monitoring

Both services provide dashboards to monitor:
- Delivery rates
- Failed messages
- Usage statistics
- Costs

## 🔒 Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables for all API keys
- Regularly rotate your API keys
- Monitor usage to prevent abuse
- Consider rate limiting for production use

## 💡 Future Enhancements

Consider adding:
- Appointment reminders (24 hours before)
- Cancellation/rescheduling links
- Two-way SMS for confirmations
- Email templates for different appointment types
- Customer feedback surveys after appointments 