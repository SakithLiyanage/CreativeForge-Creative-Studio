import React, { useState } from 'react';
import axios from 'axios';
import { 
  IoDocumentText, 
  IoDocuments,
  IoDownload,
  IoCheckmarkCircle,
  IoAlert,
  IoCloudUpload,
  IoText,
  IoSwapHorizontal,
  IoLayersOutline
} from 'react-icons/io5';

const DocumentProcessor = () => {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const tools = [
    {
      id: 'merge',
      name: 'PDF Merger',
      icon: IoLayersOutline,
      description: 'Combine multiple PDF files into one',
      acceptedFiles: '.pdf',
      multiple: true
    },
    {
      id: 'docx-to-pdf',
      name: 'DOCX to PDF',
      icon: IoSwapHorizontal,
      description: 'Convert Word documents to PDF',
      acceptedFiles: '.docx',
      multiple: false
    },
    {
      id: 'pdf-to-docx',
      name: 'PDF to DOCX',
      icon: IoSwapHorizontal,
      description: 'Convert PDF files to Word documents',
      acceptedFiles: '.pdf',
      multiple: false
    },
    {
      id: 'split',
      name: 'PDF Splitter',
      icon: IoDocuments,
      description: 'Split PDF into pages or ranges',
      acceptedFiles: '.pdf',
      multiple: false
    },
    {
      id: 'extract',
      name: 'Text Extractor',
      icon: IoText,
      description: 'Extract text from PDF or DOCX files',
      acceptedFiles: '.pdf,.docx',
      multiple: false
    }
  ];

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setResult(null);
    setError('');
  };

  const processDocument = async () => {
    if (files.length === 0) {
      setError('Please select files to process');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      
      if (tools.find(t => t.id === activeTab)?.multiple) {
        files.forEach(file => formData.append('file', file));
      } else {
        formData.append('file', files[0]);
      }

      let endpoint = '';
      switch (activeTab) {
        case 'merge':
          endpoint = '/api/documents/merge-pdf';
          break;
        case 'docx-to-pdf':
          endpoint = '/api/documents/docx-to-pdf';
          break;
        case 'pdf-to-docx':
          endpoint = '/api/documents/pdf-to-docx';
          break;
        case 'split':
          endpoint = '/api/documents/split-pdf';
          formData.append('splitType', 'pages'); // Default to split by pages
          break;
        case 'extract':
          endpoint = '/api/documents/extract-text';
          break;
        default:
          throw new Error('Invalid operation');
      }

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes
      });

      setResult(response.data);
      setFiles([]);

    } catch (error) {
      console.error('❌ Document processing error:', error);
      setError(error.response?.data?.message || 'Processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (filename) => {
    try {
      console.log('📥 Starting download for:', filename);
      
      // Use fetch for better error handling
      const response = await fetch(`/api/documents/download/${filename}`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      // Get the blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download completed:', filename);
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      setError(`Download failed: ${error.message}`);
    }
  };

  const activeTool = tools.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 content-with-navbar bg-pattern-dots">
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up-fade">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-100 mb-8 shadow-lg">
            <IoDocumentText className="text-blue-500 animate-bounce-gentle" />
            <span className="text-sm font-semibold gradient-text">Document Processing Suite</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-display">
            <span className="gradient-text-flow">Document</span>
            <br />
            <span className="text-gray-900">Processor</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-body">
            Professional document processing tools for PDF merging, conversion, and text extraction
          </p>
        </div>

        {/* Tool Selection */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTab(tool.id);
                setFiles([]);
                setResult(null);
                setError('');
              }}
              className={`p-6 rounded-2xl transition-all duration-300 text-center ${
                activeTab === tool.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'card-modern hover:shadow-lg'
              }`}
            >
              <tool.icon className={`text-3xl mx-auto mb-3 ${
                activeTab === tool.id ? 'text-white' : 'text-blue-500'
              }`} />
              <h3 className={`font-bold text-sm ${
                activeTab === tool.id ? 'text-white' : 'text-gray-900'
              }`}>
                {tool.name}
              </h3>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Processing Panel */}
          <div className="space-y-8">
            <div className="card-modern animate-slide-up-fade delay-150">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <activeTool.icon className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-black gradient-text">{activeTool.name}</h2>
                  <p className="text-gray-600 text-sm">{activeTool.description}</p>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">
                  Select {activeTool.multiple ? 'Files' : 'File'}:
                </label>
                <div className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors duration-300">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept={activeTool.acceptedFiles}
                    multiple={activeTool.multiple}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <IoCloudUpload className="text-6xl text-gray-400 mx-auto mb-4" />
                    <div className="text-xl font-bold text-gray-700 mb-2">
                      Click to select {activeTool.multiple ? 'files' : 'file'}
                    </div>
                    <div className="text-gray-500">
                      Supported: {activeTool.acceptedFiles}
                    </div>
                  </label>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                        <IoDocumentText className="text-blue-500" />
                        <span className="font-medium text-blue-900">{file.name}</span>
                        <span className="text-sm text-blue-600">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Process Button */}
              <button
                onClick={processDocument}
                disabled={loading || files.length === 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Document...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <activeTool.icon className="text-xl" />
                    <span>Process Document</span>
                  </div>
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-2xl animate-slide-up-fade">
                  <div className="flex items-center text-red-700">
                    <IoAlert className="mr-3 text-xl" />
                    <div>
                      <strong>Error:</strong> {error}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result Panel */}
          <div className="space-y-8">
            {result ? (
              <div className="card-modern animate-slide-up-fade delay-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <IoCheckmarkCircle className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-black gradient-text">Processing Complete!</h2>
                </div>

                <div className="space-y-4">
                  {/* Single file result */}
                  {result.filename && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-2xl border border-green-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-green-800">{result.filename}</p>
                          <p className="text-sm text-green-600">
                            {result.fileSize ? `${(result.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                            {result.wordCount && ` • ${result.wordCount} words`}
                          </p>
                        </div>
                        <button
                          onClick={() => downloadFile(result.filename)}
                          className="btn-secondary"
                        >
                          <IoDownload className="mr-2" />
                          Download
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Multiple files result */}
                  {result.files && (
                    <div className="space-y-3">
                      {result.files.map((file, index) => (
                        <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-blue-800">{file.filename}</p>
                              <p className="text-sm text-blue-600">
                                {file.pageNumber && `Page ${file.pageNumber}`}
                                {file.pageRange && `Pages ${file.pageRange}`}
                              </p>
                            </div>
                            <button
                              onClick={() => downloadFile(file.filename)}
                              className="btn-secondary text-sm"
                            >
                              <IoDownload className="mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text extraction result */}
                  {result.extractedText && (
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <h4 className="font-bold text-gray-800 mb-2">Extracted Text Preview:</h4>
                      <div className="bg-white p-3 rounded-xl border text-sm text-gray-700 max-h-48 overflow-y-auto">
                        {result.extractedText}
                      </div>
                      <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
                        <span>{result.characterCount} characters • {result.wordCount} words</span>
                        <button
                          onClick={() => downloadFile(result.filename)}
                          className="btn-secondary text-sm"
                        >
                          <IoDownload className="mr-1" />
                          Download Full Text
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="text-center text-green-600 font-medium">
                    {result.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-modern text-center animate-slide-up-fade delay-300">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IoDocumentText className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">Ready to Process</h3>
                <p className="text-gray-500 text-body">Upload your documents and start processing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentProcessor;
