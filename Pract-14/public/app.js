// Client-side JS: show selected file info and upload via Fetch with notifications
(function () {
  const fileInput = document.getElementById("fileInput");
  const fileInfo = document.getElementById("file-info");
  const statusEl = document.getElementById("status");
  const form = document.querySelector(".upload-form");
  const uploadBtn = document.getElementById("uploadBtn");

  function humanFileSize(size) {
    if (size === 0) return "0 B";
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    return (size / Math.pow(1024, i)).toFixed(i ? 1 : 0) + " " + sizes[i];
  }

  fileInput.addEventListener("change", () => {
    const f = fileInput.files[0];
    if (!f) {
      fileInfo.textContent = "No file chosen";
      return;
    }
    fileInfo.textContent = `${f.name} — ${humanFileSize(f.size)}`;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = fileInput.files[0];
    if (!f) return showStatus("Please choose a file first.", "error");

    // Basic client-side validation (type + size) to avoid a round-trip
    if (f.type !== "application/pdf")
      return showStatus("Only PDF files are allowed.", "error");
    if (f.size > 2 * 1024 * 1024)
      return showStatus("File too large. Max size is 2MB.", "error");

    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    const formData = new FormData();
    formData.append("resume", f);

    try {
      const res = await fetch("/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        showStatus(
          data && data.message ? data.message : "Upload failed",
          "error"
        );
      } else {
        showStatus("Upload successful — " + (data.filename || ""), "success");
        // Reset file input
        form.reset();
        fileInfo.textContent = "No file chosen";
      }
    } catch (err) {
      showStatus("Network error. Try again.", "error");
      console.error(err);
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = "Upload";
    }
  });

  function showStatus(message, type = "info") {
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.className =
      "status " +
      (type === "success"
        ? "status--success"
        : type === "error"
        ? "status--error"
        : "");
    // Auto-hide after a few seconds
    clearTimeout(statusEl._hideTimer);
    statusEl._hideTimer = setTimeout(() => {
      statusEl.hidden = true;
    }, 5000);
  }
})();
