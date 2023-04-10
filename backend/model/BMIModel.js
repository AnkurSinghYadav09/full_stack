const mongoose = require("mongoose");

const bmiSchema = new mongoose.Schema(
  {
    BMI: { type: String, required: true },
    height: { type: String, required: true },
    weight: { type: String, required: true },
    user_id: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const BMIModel = mongoose.model("BMI", bmiSchema);

module.exports = { BMIModel };
