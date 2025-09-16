import React from 'react';

const UploadProgress = ({ progress, fileName }) => {
  const progressValue = Math.round(progress);
  
  return (
    <div className="progress">
      <div className="progress__header">
        <div className="progress__title">
          🚀 Uploading {fileName && `"${fileName}"`}...
        </div>
        <div className="progress__percentage">
          {progressValue}%
        </div>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-bar__fill"
          style={{ width: `${progressValue}%` }}
        />
      </div>
      <div className="progress__footer">
        Please don't close this window while uploading...
      </div>
    </div>
  );
};

export default UploadProgress;
