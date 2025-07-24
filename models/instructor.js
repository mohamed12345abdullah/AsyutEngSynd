const mongoose = require("mongoose");


const instructorRequestSchema = new mongoose.Schema(
  {
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:[true,'your instructor request already exists']
    },
    specialization: {
      type: String,
      required: [true,'specialization is required'],
    },
    experienceYears: {
      type: String,
      required: [true,'experienceYears is required'],
    },
    bio: {
      type: String,
      required: [true,'bio is required'],
    },
    github: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    coursesCanTeach: {
      type: String,
      required: [true,'coursesCanTeach is required'],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    interviewDate: {
      type: Date,
      default: null,
    },
    cv:{
      fileId: {
        type: String,
        default: null,
      },
      fileUrl: {
        type: String,
        default: null,
      },
    }
  },
  { timestamps: true }
);




module.exports = mongoose.model("Instructor", instructorRequestSchema);
