const supabase = require("../config/supabaseClient");
const sendEmail = require("../services/emailService");
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const ExpirationTime = 1000 * 60 * 5; // 5 minutes

const sendOtp = async (Id) => {
  const { data: emailData, error: emailError } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", Id)
    .single();
  if (emailError) {
    return { error: emailError.message };
  }
  console.log(emailData);
  const email = emailData.email;
  const otp = generateOtp();
  // expiration time in yyyy-mm-dd hh:mm:ss format
  const expirationTime = new Date(Date.now() + ExpirationTime).toISOString();
  const { data, error } = await supabase
    .from("otp")
    .insert([
      {
        userId: Id,
        otp: otp,
        expiration_time: expirationTime,
      },
    ])
    .select("*")
    .single();
  if (error) {
    return { error: error.message };
  }
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BookSmartly OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .logo {
            width: 120px;
            margin-bottom: 20px;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #007BFF;
            letter-spacing: 2px;
            margin: 10px 0;
        }
        .message {
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
        }
        .footer {
            font-size: 14px;
            color: #777;
            margin-top: 20px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .highlight {
            color: #d9534f;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        
        <h2>BookSmartly OTP Verification</h2>
        <p class="message">Hello,</p>
        <p class="message">Use the OTP below to verify your email. This OTP will expire in <span class="highlight">5 minutes</span>.</p>
        <p class="otp">${otp}</p>
        <p class="message">If you did not request this, please ignore this email.</p>
        <div class="footer">
            <p>Need help? <a href="mailto:BookSmartlywell@gmail.com">Mail Us</a></p>
            <p>&copy; 2025 BookSmartly. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
  sendEmail(email, "OTP for Verification", html);
  return { data };
};
module.exports = sendOtp;

