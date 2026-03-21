const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const client = new SESClient({ region: process.env.AWS_REGION });

module.exports = async function sendEmail(to, message) {
  const command = new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: "Order Confirmation" },
      Body: { Text: { Data: message } }
    },
    Source: process.env.SES_EMAIL
  });

  await client.send(command);
};