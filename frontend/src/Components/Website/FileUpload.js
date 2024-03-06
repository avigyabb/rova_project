import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploaderName, setUploaderName] = useState('');
  const [uploaderEmail, setUploaderEmail] = useState('');

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      alert('Please select at least one file!');
      return;
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => {
      formData.append('file', file);
    });
    formData.append('uploader_name', uploaderName);
    formData.append('uploader_email', uploaderEmail);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/fileupload/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(response.data.message);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
    }
  };

  return (
    <div className="mt-10 flex flex-col" style={{color: "white"}}>
      <input style={{color: "black"}}
        type="text"
        placeholder="Your Name"
        value={uploaderName}
        onChange={(e) => setUploaderName(e.target.value)}
      />
      <input style={{color: "black"}}
        type="email"
        placeholder="Your Email"
        value={uploaderEmail}
        onChange={(e) => setUploaderEmail(e.target.value)}
      />
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Files</button>
    </div>
  );
};

export default FileUpload;
