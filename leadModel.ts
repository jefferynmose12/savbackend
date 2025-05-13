import mongoose, { Document, Schema } from "mongoose";

// Define an interface for the Lead document
interface ILead extends Document {
  email: string;
  companyName: string;
  relevance:
    | "Not relevant"
    | "Weak lead"
    | "Hot lead"
    | "Very big potential customer";
  transcript: { role: "user" | "assistant"; content: string }[]; // Updated type
}

// Define the Lead schema with the appropriate types
const LeadSchema: Schema<ILead> = new mongoose.Schema({
  email: { type: String, required: true },
  companyName: { type: String, required: true },
  relevance: {
    type: String,
    enum: [
      "Not relevant",
      "Weak lead",
      "Hot lead",
      "Very big potential customer",
    ],
    required: true,
  },
  transcript: {
    type: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
      },
    ],
    default: [],
  },
});

// Create and export the model
const Lead = mongoose.model<ILead>("Lead", LeadSchema);
export default Lead;
