const { Resend } = require('resend');

// Initialize with the API key from your .env file
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function sendEmail(to, subject, message) {
  try {
    const data = await resend.emails.send({
      from: 'FeedMeFood <onboarding@resend.dev>', // Change this once domain is verified
      to: [to],
      subject: subject,
      html: `<strong>${message}</strong>`,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Resend Error:", error);
    return { success: false, error };
  }
}
