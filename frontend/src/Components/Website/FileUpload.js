import React, { useState } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const FileUpload = () => {
  const [loading, setLoading] = useState('Submit');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setLoading('Uploading...');
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
    setLoading('Submit');
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
              Submit Your Chat Logs
          </Typography>
          <p className='text-gray-500 mb-8 text-sm'> 
            Provide a Google Drive / Dropbox / OneDrive / SharePoint / etc. link for us to look at -OR- upload your files. We will analyze your chat logs and send back a report in 24 hours.
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
          <div className='upload-data flex-col mt-5 mb-5'>
            <h1 className='mb-3 text-gray-500 text-sm'> (Optional) Provide a link (preferred for larger files) or upload your csv/json/etc. </h1>
            <TextField id="filesLink" name="filesLink" label="File Link" variant="outlined" className='flex-grow'/>
            <input name="files" className="text-gray-500 ml-5" type="file" multiple />
          </div>
          <button id="submit-btn"type="submit" variant="contained"> {loading} </button>
      </Box>
    </div>
  );
};

export default FileUpload;
