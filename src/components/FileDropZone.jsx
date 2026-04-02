import React, { useRef, useCallback } from 'react';

export default function FileDropZone({ files, onFilesDropped, onRemoveFile }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const processFiles = useCallback(async (fileList) => {
    const accepted = [];
    for (const file of fileList) {
      const ext = file.name.toLowerCase().split('.').pop();
      if (ext === 'md' || ext === 'markdown') {
        try {
          const content = await file.text();
          accepted.push({
            name: file.name,
            originalName: file.name,
            path: file.path,
            size: file.size,
            lastModified: file.lastModified,
            content
          });
        } catch {
          // skip unreadable files
        }
      }
    }
    if (accepted.length > 0) {
      onFilesDropped(accepted);
    }
  }, [onFilesDropped]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[#60A5FA] bg-[#1E3A5F]/30'
            : 'border-[#374151] hover:border-[#4B5563] bg-[#111827]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".md,.markdown"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="text-[#6B7280] mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p className="text-[#9CA3AF] text-sm">
          Drag & drop <span className="text-[#60A5FA]">.md files</span> here or click to browse
        </p>
        <p className="text-[#6B7280] text-xs mt-1">
          Only .md and .markdown files accepted
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-[#9CA3AF] mb-2">{files.length} file{files.length !== 1 ? 's' : ''} loaded</p>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1F2937] border border-[#374151] rounded-lg text-sm"
              >
                <span className="text-[#9CA3AF] truncate max-w-[200px]">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(index);
                  }}
                  className="text-[#6B7280] hover:text-[#F87171] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
