import React from 'react'
import './Hero.css'
import WebNavbar from './WebNavbar'
import { TextField } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import Auth from './Auth';

const Login = () => {
    const navigate = useNavigate();
    const handleLoginChange = (event) => {
        // Update the sqlQuery state with the new value from the textarea
        console.log(process.env.REACT_APP_AUTH_HEADER)
        if (event.target.value === process.env.REACT_APP_AUTH_HEADER) {
            // window.location.href = `/${process.env.REACT_APP_AUTH_HEADER}/sessions`;
            //navigate(`${process.env.REACT_APP_AUTH_HEADER}/sessions`);
        }
    };

    return (
        <>
        < WebNavbar />
        <div className='hero flex justify-center items-center'>
            {/* <p className='text-white'>Early Access</p>
            <input className='ml-5 mr-10 p-2 rounded' placeholder='Enter Code' onChange={handleLoginChange}/> */}
            <Auth />
        </div>
        </>
    )
}

export default Login