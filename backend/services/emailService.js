const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        text: "booking successfull",
        html
    };

    const info =  await transporter.sendMail(mailOptions);

}

module.exports = sendEmail;
