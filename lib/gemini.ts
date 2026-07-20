import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
  sender: 'me' | 'them';
  text: string;
}

const FALLBACK_SUGGESTIONS = ['👍', 'Okay', 'Let me get back to you'];

/**
 * Get AI reply suggestions from Gemini.
 * Returns exactly 3 short, natural reply options.
 */
export async function getReplySuggestions(
  history: ChatMessage[]
): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, returning fallback suggestions');
    return FALLBACK_SUGGESTIONS;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const conversationText = history
      .map((msg) => `${msg.sender === 'me' ? 'Me' : 'Them'}: ${msg.text}`)
      .join('\n');

    const prompt = `You are helping suggest quick reply options for a personal chat conversation.

Given this conversation:
${conversationText}

Suggest exactly 3 short, natural, first-person reply options. Each should be:
- Brief (1-8 words)
- Casual and conversational  
- Appropriate for a close friend/partner chat
- Different in tone (e.g., one agreeable, one question, one expressive)

Return ONLY a JSON array of 3 strings, nothing else. Example: ["Sounds good!", "What time?", "😂 lol"]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Try to parse JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.warn('AI response not parseable as JSON:', responseText);
      return FALLBACK_SUGGESTIONS;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (
      Array.isArray(parsed) &&
      parsed.length >= 1 &&
      parsed.every((s: unknown) => typeof s === 'string')
    ) {
      return parsed.slice(0, 3);
    }

    return FALLBACK_SUGGESTIONS;
  } catch (error) {
    console.error('Gemini API error:', error);
    return FALLBACK_SUGGESTIONS;
  }
}
