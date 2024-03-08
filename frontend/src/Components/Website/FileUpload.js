import React, { useState } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    console.log({
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        company: formData.get('company'),
        role: formData.get('role'),
        additionalDetails: formData.get('additionalDetails'),
        files: formData.get('files')
    });

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}fileupload/upload/`, formData, {
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
    <div className="mt-5 flex flex-col" style={{color: "black"}}>
      <Box
          className='box'
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
      >
          <Typography variant="h3" gutterBottom style={{ color: 'black' }}>
              Get In Touch
          </Typography>
          <p className='text-gray-500 mb-8'> 
            Fill out the form below to schedule a call with us. For a limited number of spots 
            we will analyze your chat logs and generate a report for you.
          </p>
          <div className='flex mb-3 justify-between gap-3'>
              <TextField className="flex-grow" required id="firstName" name="firstName" label="First Name" variant="outlined"/>
              <TextField className="flex-grow" required id="lastName" name="lastName" label="Last Name" variant="outlined"/>
              <TextField
                  className="flex-grow"
                  required
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  variant="outlined"
              />
          </div>
          <div className='flex mb-3 gap-3'>
              <TextField
                  className="flex-grow"
                  id="company"
                  name="company"
                  label="Company"
                  variant="outlined"
              />
              <TextField
                  id="role"
                  name="role"
                  label="Role"
                  variant="outlined"
                  className='flex-grow text-field'
              />
          </div>
          <TextField
              id="additionalDetails"
              name="additionalDetails"
              label="Additional Details"
              multiline
              rows={4}
              variant="outlined"
          />
          <div className='upload-data mt-5 mb-5'>
            <h1 className='mb-3 text-gray-500 text-sm'> (Optional) Upload a csv for us to look at. We typically respond in 24 hours.</h1>
            <input name="files" className="text-gray-500" type="file" multiple onChange={handleFileChange} />
          </div>
          <button id="submit-btn"type="submit" variant="contained"> Submit </button>
      </Box>
    </div>
  );
};

export default FileUpload;
