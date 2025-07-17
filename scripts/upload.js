document.addEventListener("DOMContentLoaded", function () {
  fetchUserRole(); //


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
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// === Reset All States ===
function resetModalState() {
  groupSelect.selectedIndex = 0;
  selectedFile = null;
  updateModalSubtitle('default');
  dropPlaceholder.textContent = "Drag and drop your file here";
  dropPlaceholder.style.display = "inline";
  dropZone.classList.remove("active", "file-selected");
  dropZone.style.cursor = "not-allowed";

  if (filePreview) filePreview.style.display = "none";

  if (progressContainer && progressBar && uploadProgress && uploadError) {
    progressContainer.style.display = "none";
    progressBar.style.width = "0%";
    progressBar.style.backgroundColor = "#007bff";
    uploadProgress.textContent = "";
    uploadError.style.display = "none";
  }

  uploadBtn.disabled = true;
  uploadBtn.classList.remove("active", "error");
  uploadBtn.textContent = "Upload File";
}

// === Fetch Groups from API ===
async function fetchGroups() {
  try {
    const response = await fetch('/api/groups');
    const groups = await response.json();

    groupSelect.innerHTML = `<option value="" disabled hidden selected></option>`;
    groups.forEach((group) => {
      const option = document.createElement("option");
      option.value = group.id;
      option.textContent = group.name;
      groupSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load groups:', error);
  }
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

// === Drag & Drop & File Picker ===
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
  handleFileSelection(e.dataTransfer.files[0]);
});
dropZone.addEventListener("click", () => {
  if (!dropZone.classList.contains("active") || selectedFile) return;
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".pdf,.doc,.docx";
  fileInput.onchange = (e) => handleFileSelection(e.target.files[0]);
  fileInput.click();
});

// === File Handling ===
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
removeFileBtn.addEventListener("click", () => {
  if (uploadInterval) clearInterval(uploadInterval);
  selectedFile = null;
  dropZone.classList.add("active");
  dropZone.classList.remove("file-selected");
  dropZone.style.cursor = "pointer";
  dropPlaceholder.style.display = "inline";
  filePreview.style.display = "none";
  progressContainer.style.display = "none";
  uploadError.style.display = "none";
  fileNameElem.textContent = "";
  fileSizeElem.textContent = "";
  progressBar.style.width = "0%";
  uploadProgress.textContent = "";
  uploadBtn.textContent = "Upload File";
  uploadBtn.disabled = true;
  uploadBtn.classList.remove("active", "error");
  updateModalSubtitle("default");
});
function formatFileSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
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

// === Upload Button Click ===
uploadBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  const selectedFileName = selectedFile.name;
  const exists = await checkFileExists(selectedFileName);

  if (exists && !isFileConfirmed) {
    modal.style.display = "none";
    confirmModal.style.display = "flex";
    return;
  }

  isFileConfirmed = false;
  beginUpload();
});

// === File Check API ===
async function checkFileExists(filename) {
  try {
    const res = await fetch(`/api/files/check?filename=${encodeURIComponent(filename)}`);
    const data = await res.json();
    return data.exists;
  } catch (err) {
    console.error("File check error:", err);
    return false;
  }
}

// === Upload to API (with progress bar) ===
function beginUpload() {
  resetProgressUI();

  const xhr = new XMLHttpRequest();
  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("group_id", groupSelect.value);

  xhr.open(isFileConfirmed ? "PUT" : "POST", isFileConfirmed ? "/api/files/overwrite" : "/api/files/upload", true);

  xhr.upload.onprogress = function (e) {
    if (e.lengthComputable) {
      const percent = (e.loaded / e.total) * 100;
      progressBar.style.width = `${percent}%`;
      uploadProgress.textContent = `${formatFileSize(e.loaded)} / ${formatFileSize(e.total)}`;
    }
  };

  xhr.onload = function () {
    if (xhr.status === 200) {
      uploadBtn.textContent = "Uploaded Successfully";
      uploadBtn.disabled = false;
    } else {
      handleUploadError();
    }
  };

  xhr.onerror = function () {
    handleUploadError();
  };

  uploadBtn.textContent = "Processing...";
  progressContainer.style.display = "block";
  xhr.send(formData);
}

// === Confirm Replace Logic ===
confirmReplaceBtn.addEventListener("click", () => {
  isFileConfirmed = true;
  confirmModal.style.display = "none";
  modal.style.display = "flex";
  setTimeout(() => uploadBtn.click(), 100);
});
cancelReplaceBtn.addEventListener("click", () => {
  confirmModal.style.display = "none";
  modal.style.display = "flex";
});

// === UI Helpers ===
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


//This function fetches the user role, and then sets the visibility of UPLOAD button on the homepage according to the type of user
function fetchUserRole() {
  fetch("/api/user-info")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch user info");
      return response.json();
    })
    .then((data) => {
      const uploadButton = document.querySelector(".upload-button");

      if (data.role === "Supervisor") {
        uploadButton.style.display = "block"; 
      } else {
        uploadButton.style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Error fetching user info:", error);
      // Optionally hide upload button on error
      document.querySelector(".upload-button").style.display = "none";
    });
}
