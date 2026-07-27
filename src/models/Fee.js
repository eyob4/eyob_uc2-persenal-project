import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["paid", "unpaid", "overdue"], default: "unpaid" },
    paymentDate: Date,
    receiptNo: { type: String, trim: true },
  },
  { timestamps: true }
);

const Fee = mongoose.models.Fee || mongoose.model("Fee", feeSchema);
export default Fee;
