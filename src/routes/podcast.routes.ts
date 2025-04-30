import { GoogleGenAI } from "@google/genai";
import { Router, Request, Response } from "express";
import { AI_SUFFIX, API_KEY } from "../constants";

export const podcastRouter = Router();

const ai = new GoogleGenAI({
  apiKey: API_KEY,
});
podcastRouter.post("/generate-podcast", async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query || typeof query !== "string" || query.trim() === "") {
    res
      .status(400)
      .json({ error: "Query is required and must be a non-empty string." });
    return;
  }

  try {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${AI_SUFFIX} : ${query}`,
    });

    const content =
      (aiResponse as any)?.text ||
      (aiResponse as any)?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      console.error("AI responded but no text was found:", aiResponse);
      res
        .status(502)
        .json({ error: "AI responded but content was empty or malformed." });
      return;
    }

    res.status(200).json({ content });
    return;
  } catch (error: any) {
    console.error("Error generating content:", error);

    if (error?.response?.status === 401) {
      res
        .status(401)
        .json({ error: "Unauthorized. Invalid or missing API key." });
      return;
    }

    if (error?.response?.status === 403) {
      res
        .status(403)
        .json({ error: "Forbidden. You may not have access to this model." });
      return;
    }

    if (error?.response?.status === 429) {
      res
        .status(429)
        .json({ error: "Rate limit exceeded. Please try again later." });
      return;
    }

    res.status(500).json({
      error: "An unexpected error occurred while generating podcast content.",
      message: error?.message || "Unknown error",
    });
    return;
  }
});
