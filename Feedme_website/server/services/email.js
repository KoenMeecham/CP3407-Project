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
      from: "FeedMe <onboarding@resend.dev>",
      to,
      subject: "Order Confirmation",
      html: `
        <div style="font-family: Arial; max-width:600px; margin:auto;">
          <h2 style="color:#f4a14c;">Order Confirmed </h2>

          <p>Your food is being prepared.</p>

          <ul>${itemsHtml}</ul>

          <h3>Total: $${order.total_price}</h3>

          <p>Thanks for using FeedMe </p>
        </div>
      `,
    });

    console.log("Email sent");
  } catch (err) {
    console.error(err);
  }
}

module.exports = { sendOrderEmail };