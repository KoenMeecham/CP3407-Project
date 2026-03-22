
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const client = new SESClient({ region: process.env.AWS_REGION });

module.exports = async function sendEmail(to, message) {
  const command = new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: "Order Confirmation - FeedMeFood" },
      Body: { 
        Text: { Data: message },
        Html: { Data: `<h1>Order Confirmed</h1><p>${message}</p>` } // Optional HTML version
      }
    },
    Source: process.env.SES_EMAIL // Must be a verified identity in AWS SES
  });

  try {
    await client.send(command);
  } catch (error) {
    console.error("SES Email Error:", error);
  }
};