// server/services/email.js
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOrderEmail(to, order) {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${item.name} x${item.quantity} - $${item.price}</li>`
    )
    .join("");

  try {
    await resend.emails.send({
      from: "Orders <orders@feedmefood.pro>", // Using your verified domain
      to,
      subject: "Your FeedMe Order is Confirmed!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color:#f4a14c;">Order Confirmed!</h2>
          <p>Hi there, your food is being prepared at the restaurant.</p>
          <hr />
          <ul style="list-style: none; padding: 0;">${itemsHtml}</ul>
          <hr />
          <h3>Total Paid: $${order.total_price}</h3>
          <p>You can view your order status in the "Orders" tab of the app.</p>
          <p>Thanks for choosing <strong>FeedMe</strong>!</p>
        </div>
      `,
    });
    console.log(`Order email sent to ${to}`);
  } catch (err) {
    console.error("Resend Email Error:", err);
  }
}

module.exports = { sendOrderEmail };