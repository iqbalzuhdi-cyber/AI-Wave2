const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Main conversation array to keep track of history
let conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // 1. Add user message to UI
  appendMessage('user', userMessage);
  input.value = '';

  // 2. Prepare conversation for API (keeping history)
  conversation.push({ role: 'user', text: userMessage });

  // 3. Show temporary "Thinking..." bot message with animation
  const thinkingMessageId = 'thinking-' + Date.now();
  appendMessage('bot', `<span></span><span></span><span></span>`, thinkingMessageId);
  const thinkingElement = document.getElementById(thinkingMessageId);
  if (thinkingElement) thinkingElement.classList.add('typing');

  try {
    // 4. Send POST request to /api/chat
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    const data = await response.json();

    // 5. Replace "Thinking..." with AI's reply
    const thinkingElement = document.getElementById(thinkingMessageId);
    if (data.result) {
      if (thinkingElement) {
        thinkingElement.classList.remove('typing');
        // Use marked to parse markdown to HTML
        thinkingElement.innerHTML = marked.parse(data.result);
      }
      // Add AI response to conversation history
      conversation.push({ role: 'bot', text: data.result });
    } else {
      throw new Error('No result in response');
    }
  } catch (error) {
    console.error('Chat Error:', error);
    const thinkingElement = document.getElementById(thinkingMessageId);
    if (thinkingElement) {
      thinkingElement.textContent = 'Failed to get response from server.';
      thinkingElement.classList.add('error');
    }
  }
});

/**
 * Appends a message to the chat box
 * @param {string} sender - 'user' or 'bot'
 * @param {string} text - The message content
 * @param {string} [id] - Optional ID for the element (used for "Thinking..." replacement)
 */
function appendMessage(sender, text, id = null) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  if (id) msg.id = id;

  // Use innerHTML to support the loading animation spans
  msg.innerHTML = text;

  chatBox.appendChild(msg);

  // Smooth scroll to bottom
  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth'
  });
}
