// DOM Elements
const fileInput = document.getElementById('file-upload');
const fileDropdown = document.getElementById('file-dropdown');
const selectedFileName = document.getElementById('selected-file-name');
const toast = document.getElementById('toast');
const scrollBtn = document.getElementById('scroll-to-bottom');

const chatWrapper = document.getElementById('chat-wrapper');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatPlaceholder = document.getElementById('chat-placeholder');

const dropdownWrapper = document.querySelector('.dropdown-wrapper');

const userAccount = document.getElementById('user-account');
const userDropdown = document.getElementById('user-dropdown');
const logoutBtn = document.getElementById('logout-btn');

// Toggle dropdown on click
userAccount.addEventListener('click', function (e) {
  e.stopPropagation(); // Prevent click from bubbling to document
  userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
});

// Hide dropdown on outside click
document.addEventListener('click', function () {
  userDropdown.style.display = 'none';
});

// Store uploaded filenames to avoid duplicates
const uploadedFiles = new Set();

// This function truncates the filename to a maximum length and adds ellipsis if needed 
// This keeps the file name from being too long on the UI
function truncateFileName(filename, maxLength = 20) {
  return filename.length > maxLength
    ? filename.slice(0, maxLength - 3) + '...'
    : filename;
}

// File Upload Handler
// fileInput.addEventListener('change', function () {
//   if (this.files && this.files.length > 0) {
//     const file = this.files[0];

//     if (!uploadedFiles.has(file.name)) {
//       uploadedFiles.add(file.name);

//       const option = document.createElement('option');
//       option.value = file.name;
//       option.textContent = truncateFileName(file.name);
//       fileDropdown.appendChild(option);

//       showToast(`File "${file.name}" uploaded successfully.`);
//     } else {
//       showToast(`File "${file.name}" already uploaded.`);
//     }

//     // Clear input to allow re-uploading the same file
//     this.value = '';
//   }
// });

fileInput.addEventListener('change', function () {
  if (this.files && this.files.length > 0) {
    const newFiles = Array.from(this.files);
    const uploadedNames = [];
    const duplicateNames = [];

    newFiles.forEach((file) => {
      if (!uploadedFiles.has(file.name)) {
        uploadedFiles.add(file.name);

        const option = document.createElement('option');
        option.value = file.name;
        option.textContent = truncateFileName(file.name);
        fileDropdown.appendChild(option);

        uploadedNames.push(file.name);
      } else {
        duplicateNames.push(file.name);
      }
    });

    // Show success toast message
    if (uploadedNames.length === 1) {
      showToast(`"${uploadedNames[0]}" uploaded successfully.`);
    } else if (uploadedNames.length > 1) {
      // selectedFileName.textContent = uploadedNames.join(', '); // No need because we don't want to show all the names in the selected files
      // showToast(`${uploadedNames.length} Files Uploaded: ${uploadedNames.join(', ')}`);
      showToast(`${uploadedNames.length} Files Uploaded Successfully.`);
    }

    // Show duplicate toast (separately)
    if (duplicateNames.length === 1) {
      showToast(`"${duplicateNames[0]}" already uploaded.`);
    } else if (duplicateNames.length > 1) {
      showToast(`${duplicateNames.length} files were already uploaded.`);
    }

    // Clear input to allow re-uploading same files
    this.value = '';
  }
});


// File Dropdown Change Handler
fileDropdown.addEventListener('change', function () {
  selectedFileName.textContent = this.value;
});

fileDropdown.addEventListener('focus', () => {
  dropdownWrapper.classList.add('open'); 
});
fileDropdown.addEventListener('blur', () => {
  dropdownWrapper.classList.remove('open');
});

// Show Toast Message on uploading or re-uploading a file
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Chat Input: Enter Keypress Handler
chatInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); // Prevents newline
    sendMessage();
  }
});

// Send Button Handler (uses same sendMessage function)
sendBtn.addEventListener('click', sendMessage);

// Send Message Function
function sendMessage() {
  const message = chatInput.value.trim();

    // Check if a file is selected before proceeding
    if (!fileDropdown.value) {
      addMessage(message, 'user');
      addMessage("⚠️ Please upload (if not already uploaded) and select a file before asking.", 'bot');
      chatInput.value = '';
      return;
    }
    
  if (message === '') return;

  addMessage(message, 'user');

  //Clear the input field after sending the message
  chatInput.value = '';

  setTimeout(() => {
    const response = generateBotResponse(message);
    addMessage(response, 'bot');
  }, 800);
}

// Add Message to Chat
// function addMessage(text, sender) {
//   if (chatPlaceholder) {
//     chatPlaceholder.remove();
//   }

//   const messageRow = document.createElement('div');
//   messageRow.classList.add('message-row', sender);

//   const messageBubble = document.createElement('div');
//   messageBubble.classList.add('chat-message', sender === 'user' ? 'user-message' : 'bot-message');
//   messageBubble.textContent = text;

//   messageRow.appendChild(messageBubble);
//   chatWrapper.appendChild(messageRow);

//   chatWrapper.scrollTop = chatWrapper.scrollHeight;
// }

function addMessage(text, sender) {
  if (chatPlaceholder) chatPlaceholder.remove();

  // Wrap everything in a message container
  const messageRow = document.createElement('div');
  messageRow.classList.add('message-row', sender);

  // Positioning wrapper for avatar + bubble
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message-container');

  // Avatar
  const avatar = document.createElement('div');
  avatar.classList.add('message-avatar', sender);

  if (sender === 'user') {
    avatar.textContent = 'Y'; // Replace with dynamic initial if needed
  } else {
    const img = document.createElement('img');
    img.src = 'bot-icon.png'; // Use appropriate path
    img.alt = 'Bot';
    avatar.appendChild(img);
  }

  // Bubble
  const messageBubble = document.createElement('div');
  messageBubble.classList.add('chat-message', sender === 'user' ? 'user-message' : 'bot-message');
  messageBubble.textContent = text;

  // Assemble
  messageContainer.appendChild(avatar);
  messageContainer.appendChild(messageBubble);
  messageRow.appendChild(messageContainer);
  chatWrapper.appendChild(messageRow);
  chatWrapper.scrollTop = chatWrapper.scrollHeight;
}


// Scroll Button Visibility
chatWrapper.addEventListener('scroll', () => {
  if (chatWrapper.scrollTop + chatWrapper.clientHeight < chatWrapper.scrollHeight - 100) {
    scrollBtn.style.display = 'block';
  } else {
    scrollBtn.style.display = 'none';
  }
});

// Scroll to Bottom
scrollBtn.addEventListener('click', () => {
  chatWrapper.scrollTop = chatWrapper.scrollHeight;
});

// Placeholder Bot Response Generator
function generateBotResponse(userMsg) {
  return `Bot response to: "${userMsg}"`;
}


logoutBtn.addEventListener('click', function () {
  // Handle logout logic here
  alert("You have been logged out.");
});