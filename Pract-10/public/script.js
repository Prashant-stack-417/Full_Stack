let currentLogContent = "";
let activeFile = null;

// Load the list of log files when page loads
document.addEventListener("DOMContentLoaded", function () {
  loadLogFiles();
  setStatus("Ready");
});

// Function to load all available log files
async function loadLogFiles() {
  setStatus("Loading files...");
  const fileList = document.getElementById("fileList");

  try {
    const response = await fetch("/api/logs");
    const data = await response.json();

    if (data.success) {
      if (data.files.length === 0) {
        fileList.innerHTML = '<div class="loading">No log files found</div>';
      } else {
        fileList.innerHTML = "";
        data.files.forEach((file) => {
          const fileItem = document.createElement("div");
          fileItem.className = "file-item";
          fileItem.textContent = file.name;
          fileItem.onclick = () => loadLogFile(file.name);
          fileList.appendChild(fileItem);
        });
      }
      setStatus("Ready");
    } else {
      throw new Error(data.message || "Failed to load files");
    }
  } catch (error) {
    console.error("Error loading files:", error);
    fileList.innerHTML = '<div class="loading">Error loading files</div>';
    showError(`Failed to load file list: ${error.message}`);
    setStatus("Error");
  }
}

// Function to load and display a specific log file
async function loadLogFile(filename) {
  setStatus("Loading file...");

  // Update active file styling
  document.querySelectorAll(".file-item").forEach((item) => {
    item.classList.remove("active");
    if (item.textContent === filename) {
      item.classList.add("active");
    }
  });

  try {
    const response = await fetch(`/api/logs/${filename}`);
    const data = await response.json();

    if (data.success) {
      activeFile = filename;
      currentLogContent = data.content;
      displayLogContent(data);
      hideError();
      setStatus("File loaded");
    } else {
      throw new Error(data.message || "Failed to load file");
    }
  } catch (error) {
    console.error("Error loading file:", error);
    showError(`Failed to load ${filename}: ${error.message}`);
    setStatus("Error");
  }
}

// Function to display log content in the interface
function displayLogContent(data) {
  // Hide welcome message and show log content
  document.getElementById("welcomeMessage").style.display = "none";
  document.getElementById("logContent").style.display = "block";

  // Update file information
  document.getElementById("fileName").textContent = data.filename;
  document.getElementById("fileSize").textContent = `Size: ${formatFileSize(
    data.size
  )}`;
  document.getElementById("lastModified").textContent = `Modified: ${formatDate(
    data.lastModified
  )}`;
  document.getElementById("lineCount").textContent = `Lines: ${data.lineCount}`;

  // Display content with line numbers
  displayContentWithLineNumbers(data.content);

  // Clear search
  document.getElementById("searchInput").value = "";
}

// Function to display content with line numbers
function displayContentWithLineNumbers(content) {
  const logText = document.getElementById("logText");
  const lines = content.split("\n");

  let numberedContent = "";
  lines.forEach((line, index) => {
    const lineNumber = (index + 1).toString().padStart(4, " ");
    numberedContent += `${lineNumber} | ${line}\n`;
  });

  logText.textContent = numberedContent;
}

// Function to search within log content
function searchInContent() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const logText = document.getElementById("logText");

  if (!searchTerm) {
    // If search is empty, restore original content
    displayContentWithLineNumbers(currentLogContent);
    return;
  }

  const lines = currentLogContent.split("\n");
  let highlightedContent = "";

  lines.forEach((line, index) => {
    const lineNumber = (index + 1).toString().padStart(4, " ");
    let processedLine = line;

    // Highlight search terms (case insensitive)
    if (line.toLowerCase().includes(searchTerm)) {
      const regex = new RegExp(escapeRegex(searchTerm), "gi");
      processedLine = line.replace(
        regex,
        (match) => `<mark class="highlight">${match}</mark>`
      );
    }

    highlightedContent += `${lineNumber} | ${processedLine}\n`;
  });

  logText.innerHTML = highlightedContent;
}

// Function to clear search
function clearSearch() {
  document.getElementById("searchInput").value = "";
  searchInContent();
}

// Function to show error messages
function showError(message) {
  document.getElementById("welcomeMessage").style.display = "none";
  document.getElementById("logContent").style.display = "none";
  document.getElementById("errorMessage").style.display = "block";
  document.getElementById("errorText").textContent = message;
}

// Function to hide error messages
function hideError() {
  document.getElementById("errorMessage").style.display = "none";
}

// Function to update status
function setStatus(status) {
  document.getElementById("status").textContent = status;

  // Change color based on status
  const statusElement = document.getElementById("status");
  if (status.includes("Error")) {
    statusElement.style.color = "#dc3545";
  } else if (status.includes("Loading")) {
    statusElement.style.color = "#ffc107";
  } else {
    statusElement.style.color = "#28a745";
  }
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Helper function to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Keyboard shortcuts
document.addEventListener("keydown", function (event) {
  // Ctrl+F to focus search
  if (event.ctrlKey && event.key === "f") {
    event.preventDefault();
    const searchInput = document.getElementById("searchInput");
    if (searchInput.style.display !== "none") {
      searchInput.focus();
    }
  }

  // Escape to clear search
  if (event.key === "Escape") {
    clearSearch();
  }

  // F5 to refresh file list
  if (event.key === "F5") {
    event.preventDefault();
    loadLogFiles();
  }
});

// Auto-refresh file list every 30 seconds
setInterval(loadLogFiles, 30000);
