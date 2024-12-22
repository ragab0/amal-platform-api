const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان الوظيفة مطلوب"],
      trim: true,
      minlength: [3, "عنوان الوظيفة يجب أن يكون على الأقل 3 أحرف"],
      maxlength: [100, "عنوان الوظيفة يجب أن لا يتجاوز 100 حرف"],
    },
    company: {
      type: String,
      required: [true, "اسم الشركة مطلوب"],
      trim: true,
      minlength: [1, "اسم الشركة يجب أن يكون على الأقل حرف"],
      maxlength: [50, "اسم الشركة يجب أن لا يتجاوز 50 حرف"],
    },
    description: {
      type: String,
      required: [true, "وصف الوظيفة مطلوب"],
      trim: true,
      minlength: [10, "وصف الوظيفة يجب أن يكون على الأقل 10 أحرف"],
      maxlength: [2000, "وصف الوظيفة يجب أن لا يتجاوز 2000 حرف"],
    },
    requirements: [
      {
        type: String,
        required: [true, "متطلبات الوظيفة مطلوبة"],
        trim: true,
        minlength: [3, "كل متطلب يجب أن يكون على الأقل 3 أحرف"],
        maxlength: [200, "كل متطلب يجب أن لا يتجاوز 200 حرف"],
      },
    ],
    location: {
      country: {
        type: String,
        required: [true, "دولة الوظيفة مطلوبة"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "مدينة الوظيفة مطلوبة"],
        trim: true,
      },
    },
    type: {
      type: String,
      required: [true, "نوع الوظيفة مطلوب"],
      enum: {
        values: ["دوام كامل", "دوام جزئي", "عقد", "تدريب"],
        message: "نوع الوظيفة غير صحيح",
      },
    },
    experience: {
      type: String,
      required: [true, "مستوى الخبرة مطلوب"],
      enum: {
        values: ["حديث تخرج", "مبتدأ", "متوسط", "متقدم"],
        message: "مستوى الخبرة غير صحيح",
      },
    },
    salary: {
      from: {
        type: Number,
        required: [true, "الحد الأدنى للراتب مطلوب"],
        min: [0, "الراتب يجب أن يكون أكبر من صفر"],
      },
      to: {
        type: Number,
        required: [true, "الحد الأقصى للراتب مطلوب"],
        validate: {
          validator: function (value) {
            return value >= this.salary.from;
          },
          message:
            "الحد الأقصى للراتب يجب أن يكون أكبر من أو يساوي الحد الأدنى",
        },
      },
      currency: {
        type: String,
        required: [true, "عملة الراتب مطلوبة"],
        enum: {
          values: ["EGP", "USD", "SAR"],
          message: "عملة الراتب غير صحيحة",
        },
        default: "EGP",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "يجب تحديد منشئ الوظيفة"],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

jobSchema.index({ title: 1, company: 1 });

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
