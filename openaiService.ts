import { OpenAI } from "openai"; // Ensure correct import according to your OpenAI SDK version

// Retrieve API key from environment variables and ensure it's a valid string
const apiKey = process.env.OPENAI_API_KEY;
if (apiKey === null || apiKey === undefined) {
  throw new Error("API key is missing from environment variables.");
}

const openai = new OpenAI({
  apiKey,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function chatWithLead(
  messages: ChatMessage[]
): Promise<string | undefined> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages,
    });

    // const reply = completion.choices[0]?.message?.content;
    // console.log("Complete:", completion.choices[0]?.message?.content);

    return completion.choices[0]?.message?.content || null;
  } catch (e) {
    console.error("Error with OpenAI chat:", e);
    return undefined;
  }
}

export { chatWithLead };
