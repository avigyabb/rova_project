import Navbar from "./Navbar";
import { Link } from 'react-router-dom';
import '../styles/Navbar.css'
import FileUpload from "./Website/FileUpload";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import '../styles/MiniProjects.css';

const MiniProjects = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    console.log({
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        company: formData.get('company'),
        role: formData.get('role'),
        additionalDetails: formData.get('additionalDetails'),
    });
    // Here, you would typically send the formData to a server
  };

  return (
    <>
      <div className="navbarWrapper flex flex-row mb-5"> 
        <Link to={`/`} className="ml-5 mr-2 font-bold text-2xl"> rova </Link>
        <p style={{ fontSize: '12px', color: 'gray'}}> CONTACT US </p>
        <Link to={``} className="link ml-auto mr-5"> </Link> 
      </div>
      <div className='signup-form'>
          <Box
              className='box'
              component="form"
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit}
          >
              <Typography variant="h6" gutterBottom style={{ color: 'black' }}>
                  Registration Form
              </Typography>
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
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                  Submit
              </Button>
          </Box>
          <FileUpload />
      </div>
    </>
  )
}

export default MiniProjects