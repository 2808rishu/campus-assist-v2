import React, { useState, useCallback, useRef } from 'react';
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UploadIcon, Camera, FileUp, X, Loader2, RefreshCw, AlertCircle } from "lucide-react";

export default function AssetUploader({ onUploadComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef(null);

  const MAX_RETRIES = 3;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

  const validateFile = useCallback((selectedFile) => {
    if (!selectedFile) return null;

    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      return "File size must be less than 10MB. Please choose a smaller file.";
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      return "File type not supported. Please upload PDF, images (JPG, PNG, GIF), or text documents.";
    }

    return null;
  }, [MAX_FILE_SIZE]);

  const handleFileSelect = useCallback((selectedFile) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setFile(selectedFile);
    setRetryCount(0);
  }, [validateFile, setError, setFile, setRetryCount]); // Added state setters as dependencies, though React guarantees their stability

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const attemptUpload = async (fileToUpload, attempt = 1) => {
    try {
      console.log(`Upload attempt ${attempt}/${MAX_RETRIES} for file: ${fileToUpload.name}`);
      
      const { file_url } = await UploadFile({ file: fileToUpload });
      
      if (!file_url) {
        throw new Error("No file URL returned from upload service");
      }

      return file_url;
    } catch (err) {
      console.error(`Upload attempt ${attempt} failed:`, err);
      
      // Check if it's a server error that might be retryable
      const isRetryableError = 
        err.message?.includes('500') ||
        err.message?.includes('timeout') ||
        err.message?.includes('DatabaseTimeout') ||
        err.message?.includes('network');

      if (attempt < MAX_RETRIES && isRetryableError) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptUpload(fileToUpload, attempt + 1);
      }

      throw err;
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    let progressInterval;

    try {
      // Start progress simulation
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 30) return prev + 2;
          if (prev < 70) return prev + 1;
          if (prev < 90) return prev + 0.5;
          return prev;
        });
      }, 200);

      const file_url = await attemptUpload(file);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create the asset record
      await onUploadComplete({
        file_name: file.name,
        file_type: file.type,
        file_url: file_url,
        description: `Uploaded ${file.name}`,
        tags: [file.type.split('/')[0]] // Add file type as tag
      });

      // Reset after success
      setTimeout(() => {
        setFile(null);
        setIsUploading(false);
        setUploadProgress(0);
        setRetryCount(0);
      }, 1500);

    } catch (err) {
      clearInterval(progressInterval);
      console.error("Upload failed after all retries:", err);
      
      let errorMessage = "Upload failed. Please try again.";
      
      if (err.message?.includes('DatabaseTimeout') || err.message?.includes('timeout')) {
        errorMessage = "Server is temporarily busy. Please wait a moment and try again.";
      } else if (err.message?.includes('500')) {
        errorMessage = "Server error occurred. Please try again in a few minutes.";
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (err.message?.includes('size') || err.message?.includes('large')) {
        errorMessage = "File is too large. Please choose a smaller file.";
      }

      setError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
      setRetryCount(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleUpload();
  };

  const resetUploader = () => {
    setFile(null);
    setError(null);
    setIsUploading(false);
    setUploadProgress(0);
    setRetryCount(0);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-colors hover:border-blue-400 bg-white">
        {!file ? (
          <div onDrop={handleDrop} onDragOver={handleDragOver} className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <FileUp className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold">Drag & drop a file or click to upload</p>
              <p className="text-sm text-gray-500 mt-1">
                Supports: PDF, Images (JPG, PNG, GIF), Documents (up to 10MB)
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
              accept="application/pdf,image/*,text/plain,.doc,.docx"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <UploadIcon className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <FileUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-3" 
                onClick={resetUploader}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {isUploading && (
              <div className="w-full max-w-sm mx-auto space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-blue-600">
                  Uploading... {Math.round(uploadProgress)}%
                  {retryCount > 0 && ` (Attempt ${retryCount + 1})`}
                </p>
              </div>
            )}

            {!isUploading && !error && (
              <Button 
                onClick={handleUpload} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileUp className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            )}

            {!isUploading && error && (
              <div className="space-y-3">
                <Button 
                  onClick={handleRetry} 
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again {retryCount > 0 && `(${retryCount}/${MAX_RETRIES})`}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            {!isUploading && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setError(null)}
                className="ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {uploadProgress === 100 && !error && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            ✅ File uploaded successfully!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}