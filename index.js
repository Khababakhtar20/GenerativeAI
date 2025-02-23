const API_KEY =
  "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"; // Your Deepseek API key

class ChatIntegration {
  constructor() {
    this.messageInput = document.getElementById("userInput");
    this.sendButton = document.getElementById("sendButton");
    this.chatMessages = document.getElementById("chatMessages");
    this.apiUrl = "https://api.openai.com/v1/chat/completions";
    this.apiKey =
      "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"; // Your Deepseek API key;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage();
      }
    });

    this.sendButton.addEventListener("click", () => this.sendMessage());

    document
      .getElementById("clearChat")
      .addEventListener("click", () => this.clearChat());
  }

  async sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message) return;

    try {
      this.addMessageToChat(message, true);
      this.messageInput.value = "";

      // Show typing indicator
      const loadingDiv = document.createElement("div");
      loadingDiv.className = "typing-indicator";
      loadingDiv.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
      `;
      this.chatMessages.appendChild(loadingDiv);

      const response = await this.getAIResponse(message);

      // Remove typing indicator
      this.chatMessages.removeChild(loadingDiv);

      this.addMessageToChat(response, false);
    } catch (error) {
      console.error("Error sending message:", error);
      this.addMessageToChat(
        "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
        false
      );
    }
  }

  async getAIResponse(message) {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.7,
          max_tokens: 512,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Response:", errorData);
        throw new Error(errorData.message || "API request failed");
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error("Invalid response format from API");
      }
      return data.choices[0].message.content;
    } catch (error) {
      console.error("API Error Details:", error);
      if (error.message.includes("Authentication")) {
        throw new Error(
          "API key authentication failed. Please check your API key."
        );
      }
      throw new Error(
        `Failed to get response from AI service: ${error.message}`
      );
    }
  }

  addMessageToChat(text, isUser) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;
    messageDiv.textContent = text;
    this.chatMessages.appendChild(messageDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  clearChat() {
    this.chatMessages.innerHTML = `
      <div class="welcome-message">
        <h2>👋 Welcome!</h2>
        <p>I'm your AI assistant. How can I help you today?</p>
      </div>
    `;
  }
}

// Initialize chat integration when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.chatIntegration = new ChatIntegration();
});
