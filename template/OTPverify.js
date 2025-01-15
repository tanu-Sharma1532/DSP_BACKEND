const resetPasswordOtpTemplate = (otp , name) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Password Reset OTP</title>
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
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
                text-align: left;
            }
    
            .cta {
                display: inline-block;
                padding: 10px 20px;
                background-color: #FFD60A;
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
    
            .highlight {
                font-weight: bold;
                font-size: 24px;
                color: white;
                background-color: grey;
                padding: 10px 20px;
                border-radius: 5px;
                text-align: center;
            }

            .otp-container {
                margin: 20px auto; 
                display: inline-block; 
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <div class="message">Password Reset Request</div>
            <div class="body">
                <p>Dear ${name},</p>
                <p>We received a request to reset your password for your Earnvit account. To proceed with the password reset, please use the following OTP (One-Time Password):</p>
                <div class="otp-container">
                    <h2 class="highlight">${otp}</h2>
                </div>
                <p>This OTP is valid for 5 minutes. If you did not request a password reset, please disregard this email and ensure the security of your account.</p>
            </div>
            <div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a href="mailto:"></a>. We are here to help!</div>
        </div>
    </body>
    
    </html>`;
};

module.exports = resetPasswordOtpTemplate;
