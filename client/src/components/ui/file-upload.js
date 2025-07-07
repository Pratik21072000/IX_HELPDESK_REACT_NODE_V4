import React, { useState, useRef } from "react";
import { Button } from "./button";
import { Badge } from "./badge";
import { cn } from "../../lib/utils";
import { Upload, X, FileText, Download } from "lucide-react";
import {
  uploadFiles,
  formatFileSize,
  validateFileType,
  validateFileSize,
  downloadFile,
} from "../../lib/fileUpload";

const FileUpload = ({
  value = [],
  onChange,
  maxFiles = 5,
  maxSizeMB = 10,
  disabled = false,
  className,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);

    // Validate file count
    if (value.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate files
    const validFiles = [];
    for (const file of fileArray) {
      if (!validateFileType(file)) {
        alert(`File type not allowed: ${file.name}`);
        continue;
      }

      if (!validateFileSize(file, maxSizeMB)) {
        alert(`File too large: ${file.name}. Maximum size: ${maxSizeMB}MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    try {
      setUploading(true);
      const uploadedFiles = await uploadFiles(validFiles);

      // Add uploaded files to existing files
      const newFiles = [...value, ...uploadedFiles];
      onChange(newFiles);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload files: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId) => {
    const updatedFiles = value.filter((file) => file.id !== fileId);
    onChange(updatedFiles);
  };

  const handleDownload = async (file) => {
    try {
      if (file.key) {
        await downloadFile(file.key, file.name);
      } else {
        console.error("No file key available for download");
      }
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file: " + error.message);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (disabled || uploading) return;

    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const openFileSelector = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive && "border-blue-500 bg-blue-50",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && !uploading && "cursor-pointer hover:border-gray-400",
          "border-gray-300",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-sm text-gray-600 mb-2">
          {uploading ? (
            <span>Uploading files...</span>
          ) : (
            <span>
              <span className="font-medium text-blue-600">Click to upload</span>{" "}
              or drag and drop
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Maximum {maxFiles} files, {maxSizeMB}MB each
          <br />
          Supported: JPG, PNG, PDF, DOC, TXT, ZIP
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Uploaded Files ({value.length}/{maxFiles})
          </div>
          {value.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {file.name || file.originalname}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                    {file.uploadedAt && (
                      <span className="ml-2">
                        Uploaded{" "}
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {file.key && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
