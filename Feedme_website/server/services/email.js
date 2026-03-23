// server/services/email.js

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION || "ap-southeast-2",
});

export async function sendOrderEmail(to, order) {
  try {
    const command = new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL, // e.g. noreply@feedmefood.pro
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: "Your FeedMe Order Confirmation",
        },
        Body: {
          Text: {
            Data: `
Thanks for your order!

Order ID: ${order.id}
Total: $${order.total_price}

We’ll start preparing your food soon 
            `,
          },
        },
      },
    });

    await ses.send(command);
    console.log("Email sent");
  } catch (err) {
    console.error("SES error:", err);
  }
}