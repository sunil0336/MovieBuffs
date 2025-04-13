const nodemailer = require("nodemailer")

const sendEmail = async (options) => {
  // Create a transporter
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  //   port: process.env.SMTP_PORT || 2525,
  //   auth: {
  //     user: process.env.SMTP_EMAIL || "your_mailtrap_username",
  //     pass: process.env.SMTP_PASSWORD || "your_mailtrap_password",
  //   },
  // })
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'justen.weissnat@ethereal.email',
        pass: 'XkrPw3DhWwE23PXXuw'
    }
});

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME || "Crictistaan"} <${process.env.FROM_EMAIL || "noreply@crictistaan.com"}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  // Send email
  await transporter.sendMail(mailOptions)
}

module.exports = sendEmail

