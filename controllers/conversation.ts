import { Request, Response } from "express";
import Lead from "../leadModel.js";
import { chatWithLead } from "../openaiService.js";
import { evaluateLead } from "../logic.js";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message }: { message: string } = req.body;
    const { email, companyName, transcript } = await Lead.findOne({
      _id: "6822328bce994e1b2d890a80",
    });

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

        return res.json({ reply: aiReply });
      }

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
            relevance,
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

      return res.json({ reply: aiReply + calendlyMessage });
    }

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
          relevance,
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
  } catch (err) {
    res.json({ error: err.message ?? err });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { transcript } = await Lead.findOne({
      _id: "6822328bce994e1b2d890a80",
    });
    res.json({ data: transcript });
  } catch (err) {
    res.json({ error: err.message ?? err });
  }
};
