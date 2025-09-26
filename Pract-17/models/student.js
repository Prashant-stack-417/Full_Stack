const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number },
    phone: { type: String },
    course: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
