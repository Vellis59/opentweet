const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const topicInput = document.getElementById("topic");
  const languageSelect = document.getElementById("language");
  const countSelect = document.getElementById("count");

  const outputArea = document.getElementById("output");
  const statusEl = document.getElementById("status");
  const rememberKey = document.getElementById("rememberKey");

  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");

  // Load key if saved
  const saved = localStorage.getItem("opentweet_key");
  if (saved) {
    apiKeyInput.value = saved;
    rememberKey.checked = true;
  }

  copyBtn.addEventListener("click", () => {
    if (!outputArea.value.trim()) {
      statusEl.textContent = "Nothing to copy.";
      return;
    }
    navigator.clipboard.writeText(outputArea.value)
      .then(() => statusEl.textContent = "Markdown copied.")
      .catch(() => statusEl.textContent = "Copy failed.");
  });

  generateBtn.addEventListener("click", async () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      statusEl.textContent = "Enter your OpenRouter key.";
      return;
    }

    const topic = topicInput.value.trim();
    if (!topic) {
      statusEl.textContent = "Enter a topic.";
      return;
    }

    if (rememberKey.checked) {
      localStorage.setItem("opentweet_key", key);
    } else {
      localStorage.removeItem("opentweet_key");
    }

    const language = languageSelect.value;
    const count = countSelect.value;

    const prompt = buildPrompt(topic, language, count);

    const body = {
      model: "openai/gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You generate concise, engaging tweets. Output Markdown only. No emojis.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    };

    statusEl.textContent = "Generating tweets...";
    generateBtn.disabled = true;

    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const content =
        data?.choices?.[0]?.message?.content || "No output.";

      outputArea.value = content;
      statusEl.textContent = "Done.";
    } catch (err) {
      statusEl.textContent = "Error: " + err.message;
    }

    generateBtn.disabled = false;
  });
});

function buildPrompt(topic, language, count) {
  return `
Generate ${count} tweets.

Topic: ${topic}
Language: ${language}

Rules:
- Output Markdown only.
- Each tweet must be separated clearly.
- No emojis.
- Max 280 characters per tweet.
`;
}
