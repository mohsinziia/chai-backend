import ollama from 'ollama'


export const generateUsernameAI = async () => {


  const prompt = `Generate a single concise, creative, and unique username for a social media platform.
The username should be cool, catchy, and abstract.

The username must:
1. Be strictly lowercase.
2. Contain only letters and numbers (no spaces or special characters).
3. Be between 5 and 12 characters long.
4. Respond with ONLY the username string itself. No explanations, no quotes, no extra text.`;

  try {

    const response = await ollama.chat({
      model: 'llama3',
      messages: [{ role: 'user', content: prompt }],
    })

    const rawUsername = response.message.content
    const cleaned = rawUsername.trim().toLowerCase().replace(/[^a-z0-9]/g, "");


    if (cleaned.length >= 3) return cleaned;

  } catch (error) {
    console.error("AI Generation failed:", error.message);
  }

  return `user-${Math.floor(1000 + Math.random() * 9000)}`;
};
