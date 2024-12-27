const nodemailer = require('nodemailer');

const mailSender = async (to, subject, message) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: '75836f001@smtp-brevo.com',
                pass: 'DOFJYgBq965IRwsn'
            }
        });

        const mailOptions = {
            from: 'support@cartvit.com',
            to,
            subject,
            html: message
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info);
        return info; 
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
};

module.exports = mailSender;
