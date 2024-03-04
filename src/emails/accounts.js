

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service : "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
      rejectUnauthorized: false
  }
});

const sendWelcomeEmail = (email, name) => {
    async function main() {
        // send mail with defined transport object
        const info = await transporter.sendMail({
          from: '"Task-manager Application" <numterminal@gmail.com>', // sender address
          to: email, // list of receivers
          subject: "Task-manager app", // Subject line
          text: `Hello ${name}`, // plain text body
          html: `<b>Hello ${name}</b>`, // html body
        });
      
        console.log("Message sent: %s", info.messageId);
        // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
      }
      main().catch(console.error);
}

const sendGoodbyeEmail = (email, name) => {
    async function main() {
        // send mail with defined transport object
        const info = await transporter.sendMail({
          from: '"Task-manager Application" <numterminal@gmail.com>', // sender address
          to: email, // list of receivers
          subject: "Task-manager app" // Subject line
        , // plain text body
          html: `<b>Hello ${name} thanks for joining our platform, We are not glad you are leaving. Pls feel free to share with us your opinion on what we can do to improve</b>`, // html body
        });
      
        console.log("Message sent: %s", info.messageId);
        // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
      }
      main().catch(console.error);
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}


