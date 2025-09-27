import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

const DocumentUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/documents`, {
        credentials: 'include'
      });
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('description', description);

    try {
      const response = await fetch(`${API_URL}/api/documents/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Document uploaded successfully!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        setSelectedFile(null);
        setDescription('');
        setShowUploadForm(false);
        fetchDocuments(); // Refresh the document list
      } else {
        toast.error(data.error || 'Upload failed', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      // Get the signed download URL from backend
      const response = await fetch(`${API_URL}/api/documents/download/${document._id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Open the signed URL directly in a new window
          // This bypasses CORS issues by letting the browser handle the download
          window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');

          toast.success('Document download started!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        } else {
          throw new Error(data.error || 'Download failed');
        }
      } else {
        throw new Error('Download request failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Document deleted successfully!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        fetchDocuments(); // Refresh the document list
      } else {
        toast.error(data.error || 'Delete failed', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white font-bold text-xl">Document Manager</h2>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-blue-500 hover:bg-blue-300 px-4 py-2 rounded-full flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {showUploadForm ? 'Cancel Upload' : 'Upload Document'}
        </button>
      </div>

      {showUploadForm && (
        <div className="bg-slate-800/50 p-6 rounded-lg mb-6 border border-blue-500">
          <h3 className="text-lg font-semibold mb-4">Upload New Document</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select File</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="bg-slate-700 border border-blue-500 rounded-lg p-2 w-full text-white"
                accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png,.gif,.zip,.rar,.7z"
              />
              {selectedFile && (
                <p className="text-sm text-gray-300 mt-1">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description for this document"
                className="bg-slate-700 border border-blue-500 rounded-lg p-2 w-full text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setDescription('');
                  setShowUploadForm(false);
                }}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="documents-section">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Documents Yet</h3>
            <p className="text-gray-400">Upload your first document to get started</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4">Your Documents ({documents.length})</h3>
            <div className="bg-slate-800/30 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-blue-800 text-white sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Description</th>
                      <th className="text-left p-3">Size</th>
                      <th className="text-left p-3">Upload Date</th>
                      <th className="text-center p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-blue-900/10 text-white">
                    {documents.map((doc) => (
                      <tr key={doc._id} className="border-b border-slate-700">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="truncate max-w-xs" title={doc.originalName}>
                              {doc.originalName}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-gray-300 truncate max-w-xs" title={doc.description}>
                            {doc.description || 'No description'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-300">
                          {formatFileSize(doc.size)}
                        </td>
                        <td className="p-3 text-gray-300">
                          {formatDate(doc.uploadDate)}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleDownload(doc)}
                              className="bg-green-600 hover:bg-green-500 p-2 rounded-lg"
                              title="Download"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(doc._id)}
                              className="bg-red-600 hover:bg-red-500 p-2 rounded-lg"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;