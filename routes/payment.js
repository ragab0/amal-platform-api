const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authControllers = require("../controllers/authControllers");

// Protected payment route
router
  .route("/stripe")
  .post(authControllers.protect, paymentController.processStripePayment);

router
  .route("/paypal")
  .post(authControllers.protect, paymentController.processPaypalPayment);

router
  .route("/create-paypal-order")
  .post(authControllers.protect, paymentController.createPaypalOrder);

module.exports = router;
