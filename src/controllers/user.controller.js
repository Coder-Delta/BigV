import transporter from "../service/mail.service.js"
import { generateOTP } from "../utils/otpGenerator.js";
import redis from "../redis_server.js"

// Send OTP Mail
const testMail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const genOtp = generateOTP();
    const redisKey = `otp:${email}`;
    
    const sendOtpRedis = await redis.set(redisKey, genOtp, {
      ex: 300,
    });

    if (sendOtpRedis !== 'OK') {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to store OTP in Redis' 
      });
    }

    await transporter.sendMail({
      from: `"VerifyX" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'OTP Verification Mail',
      text: `Your OTP is: ${genOtp}\n\nDon't share this OTP with anyone and don't reply to this mail. This is a system generated mail.\n\nValid for 5 minutes.`,
    });

    res.json({ 
      success: true, 
      message: 'OTP sent successfully'
    });

  } catch (error) {
    console.error('ERROR in testMail:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP',
      error: error.message 
    });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const redisKey = `otp:${email}`;
    const storedOtp = await redis.get(redisKey);
    
    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found'
      });
    }

    if (String(storedOtp).trim() === String(otp).trim()) {
      await redis.del(redisKey);
      
      return res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid OTP'
    });

  } catch (error) {
    console.error('ERROR in verifyOtp:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export { testMail, verifyOtp };