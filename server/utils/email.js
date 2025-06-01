const nodemailer = require("nodemailer")

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME || "Criticstaan"} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  // Send email
  await transporter.sendMail(mailOptions)
}

module.exports = sendEmail



