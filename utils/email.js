const nodemailer = require("nodemailer");

const { EMAIL_USERNAME: user, EMAIL_PASSWORD: pass } = process.env;

class Email {
  async createTransporter() {
    // if (process.env.NODE_ENV === "development") {
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

      if (process.env.NODE_ENV === "development") {
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

module.exports = new Email();
