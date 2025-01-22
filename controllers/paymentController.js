const { sendResult } = require("./handlers/send");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const paypal = require("@paypal/checkout-server-sdk");
const catchAsyncMiddle = require("../utils/catchAsyncMiddle");

// Define subscription plans and their prices
const SUBSCRIPTION_PLANS = {
  premium: {
    // amount: 2.99,
    amount: 3,
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  },
  "premium-plus": {
    // amount: 7.99,
    amount: 8,
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  },
};

const processStripePayment = catchAsyncMiddle(async (req, res, next) => {
  const { paymentMethodId, planType } = req.body;
  if (!paymentMethodId || !planType) {
    return next(new AppError("يرجى توفير جميع البيانات المطلوبة", 400));
  }
  if (!SUBSCRIPTION_PLANS[planType]) {
    return next(new AppError("نوع الاشتراك غير صالح", 400));
  }

  const user = req.user;
  try {
    // First retrieve the payment method to verify it exists and is valid
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (!paymentMethod) {
      return next(new AppError("طريقة الدفع غير صالحة", 400));
    }

    let stripeCustomer;
    const date = new Date();

    if (!user.currentPlan?.stripeMethod?.stripeCustomerId) {
      // Create a new customer
      stripeCustomer = await stripe.customers.create({
        email: user.email,
        payment_method: paymentMethodId,
      });

      // Create a new subscription plan for the user
      user.currentPlan = {
        type: planType,
        stripeMethod: {
          stripeCustomerId: stripeCustomer.id,
        },
        amount: SUBSCRIPTION_PLANS[planType].amount,
        lastPaymentDate: date,
        startDate: date,
        endDate: new Date(
          date.getTime() + SUBSCRIPTION_PLANS[planType].duration
        ),
        status: "active",
      };
    } else {
      // Retrieve existing customer
      stripeCustomer = await stripe.customers.retrieve(
        user.currentPlan.stripeMethod.stripeCustomerId
      );

      // Update existing subscription
      user.currentPlan.type = planType;
      user.currentPlan.amount = SUBSCRIPTION_PLANS[planType].amount;
      user.currentPlan.lastPaymentDate = date;
      user.currentPlan.startDate = date;
      user.currentPlan.endDate = new Date(
        date.getTime() + SUBSCRIPTION_PLANS[planType].duration
      );
      user.currentPlan.status = "active";
    }

    // Create payment intent with fixed amount based on plan type
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(SUBSCRIPTION_PLANS[planType].amount * 100), // Convert to cents
      currency: "usd",
      customer: stripeCustomer.id,
      payment_method: paymentMethodId,
      confirm: true,
      description: `اشتراك ${planType}`,
      metadata: {
        userId: user._id.toString(),
        planType: planType,
      },
      off_session: true,
    });

    if (paymentIntent.status === "succeeded") {
      // Store the payment intent ID for reference
      if (!user.currentPlan.stripeMethod) {
        user.currentPlan.stripeMethod = {};
      }
      user.currentPlan.stripeMethod.lastPaymentIntentId = paymentIntent.id;
      await user.save();

      return sendResult(res, {
        message: "تم معالجة الدفع بنجاح",
        data: user.getCurrentPlan(),
      });
    }

    return next(new AppError("فشلت عملية الدفع", 400));
  } catch (error) {
    console.error("Stripe payment error:", error);
    return next(
      new AppError(
        error.type === "StripeCardError"
          ? "فشلت عملية الدفع: " + error.message
          : "حدث خطأ أثناء معالجة الدفع",
        error.type === "StripeCardError" ? 400 : 500
      )
    );
  }
});

// Create PayPal environment - Using Sandbox for development
const Env =
  process.env.NODE_ENV === "development"
    ? paypal.core.SandboxEnvironment
    : paypal.core.LiveEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Env(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET_KEY)
);

const processPaypalPayment = catchAsyncMiddle(async (req, res, next) => {
  const { orderId } = req.body;
  if (!orderId) {
    return next(new AppError("يرجى توفير جميع البيانات المطلوبة", 400));
  }

  const user = req.user;
  try {
    console.log("Verifying PayPal order:", orderId);
    const request = new paypal.orders.OrdersGetRequest(orderId);
    const order = await paypalClient.execute(request);
    const planType = order.result.purchase_units[0]?.reference_id;
    if (!planType || !SUBSCRIPTION_PLANS[planType]) {
      return next(new AppError("نوع الاشتراك غير صالح", 400));
    }

    // If order is approved, capture the payment first
    if (order.result.status === "APPROVED") {
      const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
      const captureResponse = await paypalClient.execute(captureRequest);

      console.log(
        "Capture request details:",
        JSON.stringify(captureRequest, null, 2)
      );
      console.log(
        "Payment capture response:",
        JSON.stringify(captureResponse.result, null, 2)
      );

      if (captureResponse.result.status !== "COMPLETED") {
        return next(new AppError("فشل في إكمال عملية الدفع", 400));
      }
    } else if (order.result.status !== "COMPLETED") {
      return next(new AppError("حالة الطلب غير صالحة للمعالجة", 400));
    }

    // Proceed with subscription update only if payment is completed
    const date = new Date();
    // Update user's subscription plan
    if (!user.currentPlan?.paypalMethod) {
      // Create new subscription plan
      user.currentPlan = {
        type: planType,
        paypalMethod: {
          paypalCustomerId: order.result.payer.payer_id,
          lastPaymentId: orderId,
        },
        amount: SUBSCRIPTION_PLANS[planType].amount,
        lastPaymentDate: date,
        startDate: date,
        endDate: new Date(
          date.getTime() + SUBSCRIPTION_PLANS[planType].duration
        ),
        status: "active",
      };
    } else {
      // Update existing subscription
      user.currentPlan.type = planType;
      user.currentPlan.paypalMethod.lastPaymentId = orderId;
      user.currentPlan.amount = SUBSCRIPTION_PLANS[planType].amount;
      user.currentPlan.lastPaymentDate = date;
      user.currentPlan.startDate = date;
      user.currentPlan.endDate = new Date(
        date.getTime() + SUBSCRIPTION_PLANS[planType].duration
      );
      user.currentPlan.status = "active";
    }

    await user.save();
    return sendResult(res, {
      message: "تم معالجة الدفع بنجاح",
      data: user.getCurrentPlan(),
    });
  } catch (error) {
    console.error("PayPal payment error:", error);
    return next(new AppError("حدث خطأ أثناء معالجة الدفع", 400));
  }
});

const createPaypalOrder = catchAsyncMiddle(async (req, res, next) => {
  const { planType } = req.body;
  if (!planType || !SUBSCRIPTION_PLANS[planType]) {
    return next(new AppError("نوع الاشتراك غير صالح", 400));
  }
  const plan = SUBSCRIPTION_PLANS[planType];

  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation"); // to work good with the window of front-end
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: planType,
          amount: {
            currency_code: "USD",
            value: plan.amount,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: plan.amount,
                // tax_total in case there is tax;
              },
            },
          },
          items: [
            {
              name: `${planType} اشتراك`,
              quantity: "1",
              unit_amount: {
                currency_code: "USD",
                value: plan.amount,
              },
            },
          ],
          description: `${planType} اشتراك`,
        },
      ],
    });

    const order = await paypalClient.execute(request);
    console.log("PayPal order created:", JSON.stringify(order.result, null, 2));

    return sendResult(res, {
      message: "تم إنشاء طلب الدفع بنجاح",
      data: { orderId: order.result.id },
    });
  } catch (error) {
    console.error("PayPal order creation error:", error);
    return next(new AppError("حدث خطأ أثناء إنشاء طلب الدفع", 400));
  }
});

module.exports = {
  processStripePayment,
  processPaypalPayment,
  createPaypalOrder,
};
