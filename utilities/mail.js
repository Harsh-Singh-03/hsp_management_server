const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
              user: process.env.USER,
              pass: process.env.PASS,
            },
          });

        await transporter.sendMail({
            from: process.env.FROM,
            to: email,
            subject: subject,
            html: text,
        });
        console.log("Email Sent Successfully");
        return true;
    } catch (e) {
        throw e
    }
};

module.exports = sendEmail;