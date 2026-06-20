export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { question } = req.body || {};

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "Question is required" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: "Server is missing ANTHROPIC_API_KEY. Add it in Vercel project settings."
    });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        system: "You are Adeka AI, a friendly and encouraging study tutor for students on Adeka Academy Hub. Explain things simply, clearly, and step by step. Keep answers focused and not overly long.",
        messages: [{ role: "user", content: question }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(502).json({ error: "AI service error. Please try again shortly." });
    }

    const answer = (data.content || [])
      .map((block) => block.text || "")
      .join("\n")
      .trim() || "Sorry, I couldn't generate an answer for that.";

    return res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
