const API_BASE_URL = process.env.REACT_APP_API_URL || "";

export const uploadFiles = async (files) => {
  try {
    const formData = new FormData();

    // Add files to FormData
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/api/tickets/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "File upload failed");
    }

    const result = await response.json();
    return result.files;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
};

export const getFileDownloadUrl = async (fileKey) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE_URL}/api/tickets/file/${encodeURIComponent(fileKey)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get download URL");
    }

    const result = await response.json();
    return result.downloadUrl;
  } catch (error) {
    console.error("Get download URL error:", error);
    throw error;
  }
};

export const downloadFile = async (fileKey, fileName) => {
  try {
    const downloadUrl = await getFileDownloadUrl(fileKey);

    // Create a temporary link element and click it to trigger download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("File download error:", error);
    throw error;
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const validateFileType = (file) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/zip",
    "application/x-rar-compressed",
  ];

  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};
