import dotenv from "dotenv";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import connectDB from "./db.js";
import Lead from "./leadModel.js";
import { chatWithLead } from "./openaiService.js";
import { evaluateLead } from "./logic.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(bodyParser.json());

connectDB();

interface Message {
  role: "user" | "assistant";
  content: string;
}

app.post("/send-message", async (req: Request, res: Response) => {
  try {
    const { message }: { message: string } = req.body; // Destructure with type annotations

    const { email, companyName, transcript } = await Lead.findOne({
      _id: "6822328bce994e1b2d890a80",
    });
    console.log("lead", email);

    let aiReply: string;

    let updatedMessages: Message[];

    if (email === "" || companyName === "") {
      const emailMatch = message.match(
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
      );
      const emailInner = emailMatch ? emailMatch[0] : null;
      const companyMatch = message.match(
        /\b(company\s*name\s*[:\-]?\s*\w[\w\s]*)/i
      );
      const companyNameInner = companyMatch ? companyMatch[0] : null;
      if (!emailInner) {
        const missingParts = [];
        if (!email) missingParts.push("email address");
        if (!companyName) missingParts.push("company name");
        missingParts.push("provide lead relevance also");

        aiReply = `Could you please provide your ${missingParts.join(
          " and "
        )}? This helps us qualify your lead.`;

        updatedMessages = [
          ...transcript,
          { role: "user", content: message },
          { role: "assistant", content: aiReply },
        ];

        await Lead.findOneAndUpdate(
          { _id: "6822328bce994e1b2d890a80" },
          { $set: { transcript: updatedMessages } },
          { new: true }
        );
        res.json({ reply: aiReply });
      } else {
        updatedMessages = [...transcript, { role: "user", content: message }];

        aiReply = await chatWithLead(updatedMessages);

        const contentText = [
          ...updatedMessages,
          { role: "assistant", content: aiReply },
        ].map((m) => m.content);

        const relevance = evaluateLead(contentText);

        await Lead.findOneAndUpdate(
          { _id: "6822328bce994e1b2d890a80" },
          {
            $set: {
              email: emailInner,
              companyName: companyNameInner,
              relevance: relevance,
              transcript: [
                ...updatedMessages,
                { role: "assistant", content: aiReply },
              ],
            },
          },

          { new: true }
        );

        const calendlyMessage = [
          "Hot lead",
          "Very big potential customer",
        ].includes(relevance)
          ? `\n\nHere's a link to book a demo: https://calendly.com/kanhasoft/demo`
          : "";

        res.json({ reply: aiReply + calendlyMessage });
      }
    } else {
      console.log("here you go");
      updatedMessages = [...transcript, { role: "user", content: message }];

      aiReply = await chatWithLead(updatedMessages);
      const contentText = [
        ...updatedMessages,
        { role: "assistant", content: aiReply },
      ].map((m) => m.content);

      const relevance = evaluateLead(contentText);

      await Lead.findOneAndUpdate(
        { _id: "6822328bce994e1b2d890a80" },
        {
          $set: {
            relevance: relevance,
            transcript: [
              ...updatedMessages,
              { role: "assistant", content: aiReply },
            ],
          },
        },

        { new: true }
      );

      const calendlyMessage = [
        "Hot lead",
        "Very big potential customer",
      ].includes(relevance)
        ? `\n\nHere's a link to book a demo: https://calendly.com/kanhasoft/demo`
        : "";

      res.json({ reply: aiReply + calendlyMessage });
    }
  } catch (err) {
    res.json({ error: err.message ?? err });
  }
});

app.get("/messages", async (req: Request, res: Response) => {
  const { transcript } = await Lead.findOne({
    _id: "6822328bce994e1b2d890a80",
  });

  try {
    res.json({ data: [...transcript] });
  } catch (err) {
    res.json({ error: err.message ?? err });
  }
});

app.get("/user", async (req: Request, res: Response) => {
  const { email, companyName } = await Lead.findOne({
    _id: "6822328bce994e1b2d890a80",
  });

  try {
    res.json({ data: { email, companyName } });
  } catch (err) {
    res.json({ error: err.message ?? err });
  }
});

app.get("/test", async (req: Request, res: Response) => {
  res.json({ message: "Testing" });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
