const nodemailer = require('nodemailer')

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// Email templates
const emailTemplates = {
  emailVerification: (otp, userName) => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Email Verification</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for signing up! To complete your registration, please verify your email address by entering the verification code below:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <h3 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">Verification Code</h3>
            <div style="background: white; padding: 15px; border-radius: 6px; border: 2px dashed #007bff;">
              <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${otp}</span>
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            This code will expire in ${process.env.OTP_EXPIRE || 10} minutes. If you didn't request this verification, please ignore this email.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 14px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    `
  }),
  
  passwordReset: (otp, userName) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset your password. To proceed with the password reset, please enter the verification code below:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <h3 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">Reset Code</h3>
            <div style="background: white; padding: 15px; border-radius: 6px; border: 2px dashed #dc3545;">
              <span style="font-size: 32px; font-weight: bold; color: #dc3545; letter-spacing: 5px;">${otp}</span>
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            This code will expire in ${process.env.OTP_EXPIRE || 10} minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 14px;">
              For security reasons, this link will expire soon. If you need assistance, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    `
  })
}

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    console.log('Email configuration:', {
      host: 'smtp.gmail.com',
      port: 587,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? '***' : 'NOT SET'
    })
    
    const transporter = createTransporter()
    const emailTemplate = emailTemplates[template](data.otp, data.userName)
    
    const mailOptions = {
      from: `"Auth App" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    }
    
    console.log('Sending email to:', to)
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error.message }
  }
}

// Send email verification
const sendEmailVerification = async (email, otp, userName) => {
  return await sendEmail(email, 'emailVerification', { otp, userName })
}

// Send password reset email
const sendPasswordReset = async (email, otp, userName) => {
  return await sendEmail(email, 'passwordReset', { otp, userName })
}

module.exports = {
  sendEmailVerification,
  sendPasswordReset
} 