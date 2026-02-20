// --- TRAVEL WEBSITE INTERACTIVITY ---

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile menu toggle
document.querySelector('.mobile-toggle').addEventListener('click', () => {
  alert('Menu mobile akan segera hadir!');
});

// Smooth scroll for anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Contact form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Mengirim...';
    submitBtn.disabled = true;

    setTimeout(() => {
      alert('Terima kasih! Pesan Anda telah terkirim.');
      contactForm.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 1500);
  });
}

// Reveal animations on scroll
const revealElements = document.querySelectorAll('section, .wisata-card');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'all 0.8s ease-out';
  revealObserver.observe(el);
});


// --- RETAINED CHATBOT LOGIC ---

const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Main conversation array to keep track of history
let conversation = [];

chatForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // 1. Add user message to UI
  appendMessage('user', userMessage);
  userInput.value = '';

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
    const finalThinkingElement = document.getElementById(thinkingMessageId);
    if (data.result) {
      if (finalThinkingElement) {
        finalThinkingElement.classList.remove('typing');
        // Use marked to parse markdown to HTML
        finalThinkingElement.innerHTML = marked.parse(data.result);
      }
      // Add AI response to conversation history (Gemini uses 'model')
      conversation.push({ role: 'model', text: data.result });
    } else {
      throw new Error('No result in response');
    }
  } catch (error) {
    console.error('Chat Error:', error);
    const errorThinkingElement = document.getElementById(thinkingMessageId);
    if (errorThinkingElement) {
      errorThinkingElement.textContent = 'Maaf, terjadi kesalahan pada server.';
      errorThinkingElement.classList.add('error');
    }
  }
});

// Toggle Logic
const chatToggle = document.getElementById('chat-toggle');
const chatContainer = document.getElementById('chat-container');
const toggleBtn = document.getElementById('toggle-btn');
const minimizeBtn = document.getElementById('minimize-btn');

toggleBtn.addEventListener('click', () => {
  chatContainer.classList.remove('hidden');
  chatToggle.classList.add('hidden');
  userInput.focus();
});

minimizeBtn.addEventListener('click', () => {
  chatContainer.classList.add('hidden');
  chatToggle.classList.remove('hidden');
});

/**
 * Appends a message to the chat box
 */
function appendMessage(sender, text, id = null) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  if (id) msg.id = id;

  msg.innerHTML = text;
  chatBox.appendChild(msg);

  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth'
  });
}
