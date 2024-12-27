const fs = require('fs');
const welcomeEmailTemplate = (name) => {
        return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Welcome to Cartvit</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
            .message {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #333333; /* Dark color for emphasis */
            }
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
            .cta {
                display: inline-block;
                padding: 10px 20px;
                background-color: #FFD60A; /* Yellow for call-to-action */
                color: #000000;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
            }
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="favicon.png" alt="Cartvit Logo" class="logo">
            <div class="message">Welcome to Cartvit, ${name}!</div>
            <div class="body">
                <p>Dear ${name},</p>
                <p>Welcome to Cartvit! We're excited to have you join our community.</p>
                <p>With Cartvit, you can enjoy seamless offers, coupons, and discover amazing deals.</p>
                <p>Start exploring now!</p>
            </div>
            <div class="support">
                If you have any questions or need assistance, please feel free to reach out to us at 
                <a href="mailto:info@cartvit.com">info@cartvit.com</a>. We're here to help!
            </div>
        </div>
    </body>
    </html>`;
};

module.exports = welcomeEmailTemplate;
