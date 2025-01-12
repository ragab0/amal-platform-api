const nodemailer = require("nodemailer");
const AppError = require("./appError");

const { EMAIL_USERNAME, EMAIL_PASSWORD, NODE_ENV } = process.env;

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
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD,
      },
    });
  }

  async send({ next, email, subject, text, html }) {
    try {
      const transporter = await this.createTransporter();

      const mailOptions = {
        from: `عمل <${EMAIL_USERNAME}>`,
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
      console.log(`EMAIL SEND ERROR ${error.code}:`, error);
      if (error.code === "EAUTH") {
        return next(
          new AppError("عذراً, تم تعطيل خدمة الايميلات مؤقتاً.", 400)
        );
      } else {
        throw error;
      }
    }
  }

  // 01 send;
  async sendVerificationCode(next, verificationCode) {
    const subject = "رمز التحقق من البريد الإلكتروني";
    const html = `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">مرحباً بك في عمل</h1>
          <p style="color: #34495e; font-size: 16px;">نحن سعداء بانضمامك إلينا</p>
        </div>
        
        <p style="color: #2c3e50; font-size: 16px; margin-bottom: 20px;">مرحباً ${this.firstName}،</p>
        
        <p style="color: #2c3e50; font-size: 16px; margin-bottom: 20px;">شكراً لتسجيلك معنا. لإكمال عملية التسجيل، يرجى استخدام رمز التحقق التالي:</p>
        
        <div style="background-color: #f7f9fc; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <h2 style="color: #2c3e50; letter-spacing: 5px; margin: 0; font-size: 28px;">${verificationCode}</h2>
        </div>
        
        <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 15px;">ينتهي هذا الرمز خلال 10 دقائق</p>
        
        <p style="color: #7f8c8d; font-size: 14px;">إذا لم تقم بطلب رمز التحقق هذا، يرجى تجاهل هذا البريد الإلكتروني.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #2c3e50; margin-bottom: 5px;">مع تحيات</p>
          <p style="color: #2c3e50; font-weight: bold;">فريق عمل</p>
        </div>
      </div>
    `;

    const text = `
      مرحباً بك في عمل!

      مرحباً ${this.firstName}،

      شكراً لتسجيلك معنا. لإكمال عملية التسجيل، يرجى استخدام رمز التحقق التالي:

      ${verificationCode}

      ينتهي هذا الرمز خلال 10 دقائق.

      إذا لم تقم بطلب رمز التحقق هذا، يرجى تجاهل هذا البريد الإلكتروني.

      مع تحيات
      فريق عمل
    `;

    await this.send({
      next,
      email: this.email,
      subject,
      text,
      html,
    });
  }

  // 02 send;
  async sendPasswordReset(next, email, resetURL) {
    return this.send({
      next,
      email,
      subject: "إعادة تعيين كلمة المرور (صالح لمدة 10 دقائق)",
      text: `
        هل نسيت كلمة المرور؟ 
        اضغط على الرابط التالي لإعادة تعيين كلمة المرور: ${resetURL}
        إذا لم تقم بطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.
      `,
      html: `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">إعادة تعيين كلمة المرور</h1>
          </div>
          
          <p style="color: #2c3e50; font-size: 16px; margin-bottom: 20px;">مرحباً،</p>
          
          <p style="color: #2c3e50; font-size: 16px; margin-bottom: 25px;">لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر أدناه لإعادة التعيين:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" 
               style="background-color: #3498db; color: white; padding: 12px 35px;
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      font-size: 16px;">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          
          <p style="color: #7f8c8d; font-size: 14px; margin-top: 25px;">هذا الرابط صالح لمدة 10 دقائق فقط.</p>
          <p style="color: #7f8c8d; font-size: 14px;">إذا لم تقم بطلب إعادة التعيين، يرجى تجاهل هذا البريد الإلكتروني.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #2c3e50; margin-bottom: 5px;">مع تحيات</p>
            <p style="color: #2c3e50; font-weight: bold;">فريق عمل</p>
          </div>
        </div>
      `,
    });
  }
}

module.exports = Email;
