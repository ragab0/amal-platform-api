# NABZA Platform - Professional CV Builder API

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6+-green.svg)](https://www.mongodb.com/)
[![Amazon S3](https://img.shields.io/badge/Amazon%20S3-v1-blue.svg)](https://aws.amazon.com/s3/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-v3-blue.svg)](https://swagger.io/)
[![Swagger UI](https://img.shields.io/badge/Swagger%20UI-v5-blue.svg)](https://swagger.io/tools/swagger-ui/)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-v6-blue.svg)](https://nodemailer.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-blue.svg)](https://socket.io/)
[![Stripe](https://img.shields.io/badge/Stripe-v8-blue.svg)](https://stripe.com/)
[![PayPal](https://img.shields.io/badge/PayPal-v2-blue.svg)](https://www.paypal.com/)
[![Google AI](https://img.shields.io/badge/Google%20AI-v2-blue.svg)](https://developers.google.com/ai)

<!-- [![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE) -->

## 📖 Overview

NABZA Platform is a sophisticated AI-driven CV builder platform specifically designed for Arabic speakers, helping them create professional and customizable CVs with ease. This repository contains the backend API that powers the platform.

**A STARTER VERSION**, [Schema - UML Diagrams](./docs/Amal.pdf)
![](./docs/schema-uml-diagrams.png)

**A STARTER VERSION**, [Use-case (routs) - UML Diagrams](./docs/Amal.pdf)
![](./docs/use-cases-diagrams.jpg)

## 🌟 Features

### CV Management

- **AI-Powered Content Suggestions**: Integration with OpenAI and Google AI models for smart CV content recommendations
- **File Storage**: Secure file storage using Amazon S3 buckets

### Authentication & Security

- **Comprehensive Auth System**:
  - Social media integration (Google, LinkedIn)
  - Email verification
  - JWT-based authentication
  - Secure password handling with bcrypt
- **Security Features**:
  - Rate limiting
  - CORS protection
  - XSS prevention
  - MongoDB injection protection
  - Helmet security headers

### Payment Integration (TEMP)

- **Stripe integration**:
- **PayPal integration**:

### Real-time Features

- **Chat System**: Real-time communication using Socket.IO
- **Notifications**: Instant notifications for (tell now):
  - Chat messages
  <!-- - CV reviews
  - Payment status
  - System updates -->

### Email System

- **Transactional Emails**: Using Nodemailer for reliable email delivery
  <!-- - Welcome emails for new users -->
  - Email verification
  - Password reset instructions
  - Custom HTML templates with RTL support for Arabic content
  - Branded emails with نبذة platform identity
  <!-- - Error handling and retry mechanism -->

## 🚀 Technology Stack

### Core

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO

### AI & Machine Learning

- OpenAI API
- Google Generative AI (In case of OpenAI fails)

### Cloud Services

- **Storage**: Amazon S3 (Free Instance)
- **Deployment**: Render (Free Instance)

### Authentication

- Passport.js
- JWT
- bcrypt

### Payment Processing

- Stripe API
- PayPal SDK

### Security

- Helmet
- Express Rate Limit
- Express Mongo Sanitize
- HPP (HTTP Parameter Pollution)
- CORS

## 🔒 Security

The platform implements various security measures:

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting for API endpoints
<!-- - Input sanitization -->
- XSS protection
- Security headers with Helmet
- CORS configuration
- MongoDB injection prevention

## 📚 API Documentation

Simple API documentation is available in OpenAPI/Swagger format:

- Development: `http://localhost:3000/api/v1/docs`
- Production: `https://api.ragab.shop/api/v1/docs`

## 🎯 Frontend Links

The frontend application is built with Next.js and is available:

- live at:
  https://www.ragab.shop or https://nabza-platform.vercel.app
- repo at:
  https://github.com/ragab0/nabza-platform
