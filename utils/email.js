const nodemailer = require("nodemailer");

const { EMAIL_USERNAME: user, EMAIL_PASSWORD: pass, NODE_ENV } = process.env;

class Email {
  constructor(user) {
    this.user = user;
    this.email = user.email;
    this.firstName = user.fname;
  }

  async createTransporter() {
    // if (NODE_ENV === "development") {
    //   // Use Ethereal for testing in development
    //   const testAccount = await nodemailer.createTestAccount();
    //   return nodemailer.createTransport({
    //     host: "smtp.ethereal.email",
    //     port: 587,
    //     secure: false,
    //     auth: {
    //       user: testAccount.user,
    //       pass: testAccount.pass,
    //     },
    //   });
    // }

    // Use Gmail for production
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  async send({ email, subject, text, html }) {
    try {
      const transporter = await this.createTransporter();

      const mailOptions = {
        from: `Amal <${user}>`,
        to: email,
        subject,
        text,
        html,
      };

      const info = await transporter.sendMail(mailOptions);

      if (NODE_ENV === "development") {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return {
          previewUrl: nodemailer.getTestMessageUrl(info),
        };
      }

      return info;
    } catch (error) {
      throw error;
    }
  }

  async sendVerificationCode(verificationCode) {
    const subject = "Email Verification Code";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Amal!</h2>
        <p>Hello ${this.firstName},</p>
        <p>Thank you for signing up. To complete your registration, please use the following verification code:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
          <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${verificationCode}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this verification code, please ignore this email.</p>
        <p>Best regards,<br>The Amal Team</p>
      </div>
    `;

    const text = `
      Welcome to Amal!
      
      Hello ${this.firstName},
      
      Thank you for signing up. To complete your registration, please use the following verification code:
      
      ${verificationCode}
      
      This code will expire in 10 minutes.
      
      If you didn't request this verification code, please ignore this email.
      
      Best regards,
      The Amal Team
    `;

    await this.send({
      email: this.email,
      subject,
      text,
      html,
    });
  }

  async sendPasswordReset(email, resetURL) {
    return this.send({
      email,
      subject: "Password Reset (valid for 10 minutes)",
      text: `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, please ignore this email!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>Hello,</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" 
               style="background-color: #4CAF50; color: white; padding: 12px 25px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link is valid for 10 minutes only.<br>
            If you didn't request this reset, please ignore this email.
          </p>
        </div>
      `,
    });
  }
}

module.exports = Email;
