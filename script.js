const fileInput = document.getElementById('file-upload');
const fileDropdown = document.getElementById('file-dropdown');
const selectedFileName = document.getElementById('selected-file-name');
const toast = document.getElementById('toast');

const scrollBtn = document.getElementById('scroll-to-bottom');

const chatWrapper = document.getElementById('chat-messages');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatPlaceholder = document.getElementById('chat-placeholder');


// Store uploaded filenames to avoid duplicates
const uploadedFiles = new Set();

fileInput.addEventListener('change', function () {
  if (this.files && this.files.length > 0) {
    const file = this.files[0];

    if (!uploadedFiles.has(file.name)) {
      uploadedFiles.add(file.name);

      const option = document.createElement('option');
      option.value = file.name;
      option.textContent = file.name;
      fileDropdown.appendChild(option);

      showToast(`File "${file.name}" uploaded successfully.`);
    } else {
      showToast(`File "${file.name}" already uploaded.`);
    }

    // Clear input to allow re-uploading the same file
    this.value = '';
  }
});

fileDropdown.addEventListener('change', function () {
  selectedFileName.textContent = this.value;
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000); // Hide after 3 seconds
}

//Chatbot functionality

// sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const message = chatInput.value.trim();
  if (message === '') return;

  // Add user message
  addMessage(message, 'user');

  // Clear input
  chatInput.value = '';

  // Simulate bot response after 800ms
  setTimeout(() => {
    const response = generateBotResponse(message);
    addMessage(response, 'bot');
  }, 800);
}

function addMessage(text, sender) {
    // Remove placeholder if exists
    if (chatPlaceholder) {
      chatPlaceholder.remove();
    }
  
    const messageRow = document.createElement('div');
    messageRow.classList.add('message-row', sender); // 'user' or 'bot'
  
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('chat-message', sender === 'user' ? 'user-message' : 'bot-message');
    messageBubble.textContent = text;
  
    messageRow.appendChild(messageBubble);
    chatWrapper.appendChild(messageRow);
  
    // Scroll to bottom
    chatWrapper.scrollTop = chatWrapper.scrollHeight;
    //   chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  chatWrapper.addEventListener('scroll', () => {
    // Show button if user scrolls up more than 100px
    if (chatWrapper.scrollTop + chatWrapper.clientHeight < chatWrapper.scrollHeight - 100) {
      scrollBtn.style.display = 'block';
    } else {
      scrollBtn.style.display = 'none';
    }
  });
  
  scrollBtn.addEventListener('click', () => {
    chatWrapper.scrollTop = chatWrapper.scrollHeight;
  });
  
  // Handle send button
sendBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message !== '') {
      addMessage(message, 'user');
  
      // Clear input
      chatInput.value = '';
  
      // Simulated bot response (you can remove this when backend is connected)
      setTimeout(() => {
        addMessage("This is a sample response from the bot.", 'bot');
      }, 600);
    }
  });

function generateBotResponse(userMsg) {
  // Placeholder logic (replace with API integration later)
  return `Bot response to: "${userMsg}"`;
}
