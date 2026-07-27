import mongoose from "mongoose";

const parentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    phone: { type: String, trim: true },
    occupation: { type: String, trim: true },
  },
  { timestamps: true }
);

const Parent = mongoose.models.Parent || mongoose.model("Parent", parentSchema);
export default Parent;
