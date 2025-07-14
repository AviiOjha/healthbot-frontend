// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
  
// const fileInput = document.getElementById('file-upload');
const fileDropdown = document.getElementById("file-dropdown");
const secondaryDropdown = document.getElementById("secondary-dropdown");
const selectedFileName = document.getElementById("selected-file-name");
const toast = document.getElementById("toast");
const scrollBtn = document.getElementById("scroll-to-bottom");
const clearChatBtn = document.getElementById("clear-chat-btn");

const chatWrapper = document.getElementById("chat-wrapper");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const chatPlaceholder = document.getElementById("chat-placeholder");

const dropdownWrapper = document.querySelector(".dropdown-wrapper");

const userAccount = document.getElementById("user-account");
const userDropdown = document.getElementById("user-dropdown");
const logoutBtn = document.getElementById("logout-btn");

// Toggle dropdown on click
userAccount.addEventListener("click", function (e) {
  e.stopPropagation(); // Prevent click from bubbling to document
  userDropdown.style.display =
    userDropdown.style.display === "block" ? "none" : "block";
});

// Hide dropdown on outside click
document.addEventListener("click", function () {
  userDropdown.style.display = "none";
});

// Store uploaded filenames to avoid duplicates
const uploadedFiles = new Set();

// This function truncates the filename to a maximum length and adds ellipsis if needed
// This keeps the file name from being too long on the UI
function truncateFileName(filename, maxLength = 20) {
  return filename.length > maxLength
    ? filename.slice(0, maxLength - 3) + "..."
    : filename;
}

// Show Toast Message on uploading or re-uploading a file
// function showToast(message) {
//   toast.textContent = message;
//   toast.classList.add('show');
//   setTimeout(() => {
//     toast.classList.remove('show');
//   }, 3000);
// }

// File Upload Handler
// fileInput.addEventListener('change', function () {
//   if (this.files && this.files.length > 0) {
//     const newFiles = Array.from(this.files);
//     const uploadedNames = [];
//     const duplicateNames = [];

//     newFiles.forEach((file) => {
//       if (!uploadedFiles.has(file.name)) {
//         uploadedFiles.add(file.name);

//         const option = document.createElement('option');
//         option.value = file.name;
//         option.textContent = truncateFileName(file.name);
//         fileDropdown.appendChild(option);

//         uploadedNames.push(file.name);
//       } else {
//         duplicateNames.push(file.name);
//       }
//     });

// Show success toast message
// if (uploadedNames.length === 1) {
//   showToast(`"${uploadedNames[0]}" uploaded successfully.`);
// } else if (uploadedNames.length > 1) {
// selectedFileName.textContent = uploadedNames.join(', '); // No need because we don't want to show all the names in the selected files
// showToast(`${uploadedNames.length} Files Uploaded: ${uploadedNames.join(', ')}`);
//   showToast(`${uploadedNames.length} Files Uploaded Successfully.`);
// }

// Show duplicate toast message(separately)
//     if (duplicateNames.length === 1) {
//       showToast(`"${duplicateNames[0]}" already uploaded.`);
//     } else if (duplicateNames.length > 1) {
//       showToast(`${duplicateNames.length} files were already uploaded.`);
//     }

//     // Clear input to allow re-uploading same files
//     this.value = '';
//   }
// });

// File Dropdown Change Handler
fileDropdown.addEventListener("change", function () {
  selectedFileName.textContent = this.value;
  const wrapper = e.target.closest(".dropdown-wrapper");
  wrapper.classList.remove("open");
});

fileDropdown.addEventListener("focus", (e) => {
  const wrapper = e.target.closest(".dropdown-wrapper");
  wrapper.classList.add("open");
});

fileDropdown.addEventListener("blur", (e) => {
  const wrapper = e.target.closest(".dropdown-wrapper");
  wrapper.classList.remove("open");
});

clearChatBtn.addEventListener("click", () => {
  chatWrapper.innerHTML = "";

  // const placeholder = document.createElement('p');
  // placeholder.id = 'chat-placeholder';
  // placeholder.className = 'chat-placeholder';
  // placeholder.textContent = 'Your chats appear here once you start conversation.';
  // chatWrapper.appendChild(placeholder);
});

// Chat Input: Enter Keypress Handler
chatInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // Prevents newline
    sendMessage();
  }
});

// Send Button Handler (uses same sendMessage function)
sendBtn.addEventListener("click", sendMessage);

// Send Message Function
function sendMessage() {
  const message = chatInput.value.trim();

  // Check if a file is selected before proceeding
  if (!fileDropdown.value) {
    addMessage(message, "user");
    addMessage(
      "⚠️ Please upload (if not already uploaded) and select a file before asking.",
      "bot"
    );
    chatInput.value = "";
    return;
  }

  if (message === "") return;

  addMessage(message, "user");

  //Clear the input field after sending the message
  chatInput.value = "";

  setTimeout(() => {
    const response = generateBotResponse(message);
    addMessage(response, "bot");
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
  const messageRow = document.createElement("div");
  messageRow.classList.add("message-row", sender);

  // Positioning wrapper for avatar + bubble
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");

  // Avatar
  const avatar = document.createElement("div");
  avatar.classList.add("message-avatar", sender);

  if (sender === "user") {
    avatar.textContent = "Y"; // Replace with dynamic initial if needed
  } else {
    const img = document.createElement("img");
    img.src = "bot-icon.png"; // Use appropriate path
    img.alt = "Bot";
    avatar.appendChild(img);
  }

  // Bubble
  const messageBubble = document.createElement("div");
  messageBubble.classList.add(
    "chat-message",
    sender === "user" ? "user-message" : "bot-message"
  );
  messageBubble.textContent = text;

  // Assemble
  messageContainer.appendChild(avatar);
  messageContainer.appendChild(messageBubble);
  messageRow.appendChild(messageContainer);
  chatWrapper.appendChild(messageRow);
  chatWrapper.scrollTop = chatWrapper.scrollHeight;
}

// Scroll Button Visibility
// chatWrapper.addEventListener('scroll', () => {
//   if (chatWrapper.scrollTop + chatWrapper.clientHeight < chatWrapper.scrollHeight - 100) {
//     scrollBtn.style.display = 'block';
//   } else {
//     scrollBtn.style.display = 'none';
//   }
// });

// Scroll to Bottom
// scrollBtn.addEventListener('click', () => {
//   chatWrapper.scrollTop = chatWrapper.scrollHeight;
// });

// Placeholder Bot Response Generator
function generateBotResponse(userMsg) {
  return `Bot response to: "${userMsg}"`;
}

logoutBtn.addEventListener("click", function () {
  // Handle logout logic here
  alert("You have been logged out.");
});

//Modal functionalities

// === Modal Elements ===
const openModalBtn = document.querySelector(".upload-btn");
const modal = document.getElementById("upload-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalSubtitle = document.querySelector('.modal-subtitle');

const groupSelect = document.getElementById("group-select");
const uploadBtn = document.getElementById("upload-file-btn");
const dropZone = document.getElementById("drop-zone");
const dropPlaceholder = document.getElementById("drop-placeholder");

const filePreview = document.getElementById("file-preview");
const fileNameElem = document.getElementById("file-name");
const fileSizeElem = document.getElementById("file-size");
const removeFileBtn = document.getElementById("remove-file-btn");


const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");
const uploadProgress = document.getElementById("upload-progress");
const uploadError = document.getElementById("upload-error");

const confirmModal = document.getElementById("confirm-modal");
const confirmReplaceBtn = document.getElementById("confirm-replace-btn");
const cancelReplaceBtn = document.getElementById("cancel-replace-btn");


let selectedFile = null;
let uploadInterval = null;

let isFileConfirmed = false;
let existingFiles = ["Avinash_Resume.pdf", "summary.docx"]; // Simulated list of uploaded files


// === Open Modal ===
openModalBtn.addEventListener("click", (e) => {
  e.preventDefault();
  modal.style.display = "flex";
  fetchGroups();
  resetModalState();
});

// === Close Modal ===
function closeModal() {
  modal.style.display = "none";
  resetModalState();
}

closeModalBtn.addEventListener("click", closeModal);

// === Escape Closes Modal ===
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// === Reset All States ===
function resetModalState() {
  groupSelect.selectedIndex = 0;
  selectedFile = null;
  updateModalSubtitle('default');
  dropPlaceholder.textContent = "Drag and drop your file here";
  dropZone.classList.remove("active");
  dropZone.style.cursor = "not-allowed";
  uploadBtn.disabled = true;
  uploadBtn.classList.remove("active");
}

// === Populate Dropdown ===
function fetchGroups() {
  const dummyGroups = [
    { id: 1, name: "Marketing" },
    { id: 2, name: "Engineering" },
    { id: 3, name: "HR" },
  ];
  groupSelect.innerHTML = `<option value="" disabled hidden selected></option>`;
  dummyGroups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = group.name;
    groupSelect.appendChild(option);
  });
}

// === Group Selection Handler ===
groupSelect.addEventListener("change", () => {
  const hasGroup = groupSelect.value !== "";
  if (hasGroup) {
    dropZone.classList.add("active");
    dropZone.style.cursor = "pointer";
  } else {
    dropZone.classList.remove("active");
    dropZone.style.cursor = "not-allowed";
  }
  updateUploadButtonState();
});

// === Drag & Drop Feedback ===
dropZone.addEventListener("dragover", (e) => {
  if (!dropZone.classList.contains("active")) return;
  e.preventDefault();
  dropZone.style.backgroundColor = "#eef";
});

dropZone.addEventListener("dragleave", () => {
  if (!dropZone.classList.contains("active")) return;
  dropZone.style.backgroundColor = "#f0f8ff";
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!dropZone.classList.contains("active")) return;
  dropZone.style.backgroundColor = "#f9f9f9";
  const file = e.dataTransfer.files[0];
  handleFileSelection(file);
});

// === Click to Browse ===
dropZone.addEventListener("click", () => {
  if (!dropZone.classList.contains("active") || selectedFile) return;
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".pdf,.doc,.docx";
  fileInput.onchange = (e) => handleFileSelection(e.target.files[0]);
  fileInput.click();
});

// === Handle File Selection ===
function handleFileSelection(file) {
  if (!file) return;
  selectedFile = file;

  fileNameElem.textContent = file.name;
  fileSizeElem.textContent = formatFileSize(file.size);

  dropZone.classList.add("file-selected");
  filePreview.style.display = "flex";
  dropPlaceholder.style.display = "none";

  updateUploadButtonState();
}

// === Delete File ===
removeFileBtn.addEventListener("click", () => {

  // stop upload progress if it's running
  if (uploadInterval) {
    clearInterval(uploadInterval);
    uploadInterval = null;
  }

  selectedFile = null;

  // Reset drop zone visuals
  dropZone.classList.add("active");
  dropZone.classList.remove("file-selected");
  dropZone.style.cursor = "pointer";
  dropPlaceholder.style.display = "inline";
  filePreview.style.display = "none";
  progressContainer.style.display = "none";
  uploadError.style.display = "none";

  // Clear content
  fileNameElem.textContent = "";
  fileSizeElem.textContent = "";
  progressBar.style.width = "0%";
  uploadProgress.textContent = "";

  // Reset upload button
  uploadBtn.textContent = "Upload File";
  uploadBtn.disabled = true;
  uploadBtn.classList.remove("active", "error");

  // Reset subtitle
  updateModalSubtitle("default");
});

// === Format file size ===
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// === Update Upload Button State ===
function updateUploadButtonState() {
  const canUpload = selectedFile && groupSelect.value !== "";
  if (canUpload) {
    uploadBtn.disabled = false;
    uploadBtn.classList.add("active");
  } else {
    uploadBtn.disabled = true;
    uploadBtn.classList.remove("active");
  }
}


// Simulated Upload Handler
// uploadBtn.addEventListener("click", () => {
//   if (!selectedFile) return;

//   resetProgressUI();

//   updateModalSubtitle('processing');
//   uploadBtn.textContent = "Processing...";
//   progressContainer.style.display = "block";

//   // Simulate upload
//   const total = selectedFile.size;
//   let uploaded = 0;
//   const chunkSize = total / 100; // simulate 100 chunks
//   uploadInterval = setInterval(() => {
//     // Simulate failure
//     const simulateError = Math.random() < 0.03;
//     if (simulateError) {
//   clearInterval(uploadInterval);  // ✅
//   uploadInterval = null;
//   handleUploadError();
//   return;
// }

//     uploaded += chunkSize;
//     if (uploaded >= total) {
//       uploaded = total;
//       clearInterval(uploadInterval);
//       uploadInterval = null;
//       uploadBtn.textContent = "Uploaded Successfully";
//       updateModalSubtitle('success');
//     }

//     const percent = Math.floor((uploaded / total) * 100);
//     progressBar.style.width = `${percent}%`;

//     uploadProgress.textContent = `${formatFileSize(
//       uploaded
//     )} / ${formatFileSize(total)}`;
//   }, 80);
// });



//New upload button click event that checks whether a file with same name exists or not
uploadBtn.addEventListener("click", () => {
  if (!selectedFile) return;

  const selectedFileName = selectedFile.name;

  // Check if file already exists (simulate check)
  const fileExists = existingFiles.includes(selectedFileName);

  if (fileExists && !isFileConfirmed) {
    // Show confirmation modal
    modal.style.display = "none";
    confirmModal.style.display = "flex";
    return;
  }

  // Proceed with upload if confirmed or file is new
  isFileConfirmed = false;
  beginUpload();
});

function beginUpload() {
  resetProgressUI();

  uploadBtn.textContent = "Processing...";
  progressContainer.style.display = "block";

  const total = selectedFile.size;
  let uploaded = 0;
  const chunkSize = total / 100;

  if (window.uploadInterval) clearInterval(window.uploadInterval);

  window.uploadInterval = setInterval(() => {
    const simulateError = Math.random() < 0.03;
    if (simulateError) {
      clearInterval(window.uploadInterval);
      handleUploadError();
      return;
    }

    uploaded += chunkSize;
    if (uploaded >= total) {
      uploaded = total;
      clearInterval(window.uploadInterval);
      uploadBtn.textContent = "Uploaded Successfully";
      uploadBtn.disabled = false;

      // Simulate saving file to existing list
      if (!existingFiles.includes(selectedFile.name.toLowerCase())) {
        existingFiles.push(selectedFile.name.toLowerCase());
      }
    }

    const percent = Math.floor((uploaded / total) * 100);
    progressBar.style.width = `${percent}%`;
    uploadProgress.textContent = `${formatFileSize(uploaded)} / ${formatFileSize(total)}`;
  }, 80);
}

// Replace file
confirmReplaceBtn.addEventListener("click", () => {
  isFileConfirmed = true;
  confirmModal.style.display = "none";
  modal.style.display = "flex";
  setTimeout(() => {
    uploadBtn.click(); // Trigger upload again
  }, 100); // small delay to allow modal transition
});

// Cancel replace
cancelReplaceBtn.addEventListener("click", () => {
  confirmModal.style.display = "none";
  modal.style.display = "flex";
});



// Format size in MB
function formatFileSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function resetProgressUI() {
  uploadBtn.classList.remove("error");
  uploadBtn.disabled = true;
  uploadError.style.display = "none";
  progressBar.style.width = "0%";
  progressBar.style.backgroundColor = "#007bff";
  uploadProgress.textContent = `0MB / ${formatFileSize(selectedFile.size)}`;
}

function handleUploadError() {
  clearInterval(uploadInterval);
  progressBar.style.width = "100%";
  progressBar.style.backgroundColor = "red";
  uploadProgress.textContent = "0MB";
  uploadError.style.display = "inline";
  uploadBtn.textContent = "Try again";
  uploadBtn.classList.add("error");
  uploadBtn.disabled = false;
  updateModalSubtitle('error');
}


function updateModalSubtitle(state) {
  switch (state) {
    case 'default':
      modalSubtitle.textContent = 'Please select a group to enable file upload';
      break;
    case 'processing':
    case 'success':
      modalSubtitle.textContent = 'This process may take time';
      break;
    case 'error':
      modalSubtitle.textContent = 'Try Again';
      break;
  }
}



});