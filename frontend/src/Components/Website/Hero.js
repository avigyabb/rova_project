import React from 'react'
import './Hero.css'
import WebNavbar from './WebNavbar'
import FileUpload from './FileUpload'
import yc from './images/yc_logo.webp'
import rovaDemo from './rova_demo.mp4'
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Hero = () => {
    const email = "founders@rovaai.com";
    const subject = encodeURIComponent("Join Waitlist");
    const body = encodeURIComponent("First Name:\nLast Name:\n\nCompany:\nRole:\n\nAdditional Info:");

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
        < WebNavbar />
        <div className='hero'>
                <div className='content'>
                    <div className='content2'>
                        <div className='backedby'>
                            <h1 style={{marginRight: '1%'}}>Backed By</h1>
                            <img src={yc} alt='yc' style={{ width: '180px', height: '50px' }}/>
                        </div>
                        <p> AI Apps That Learn From Your Users ✨</p>
                        <p>We analyze and surface chat topics/sessions that influence product KPIs (retention, conversion, churn, etc.), optimize prompts, and automatically curate evaluation & fine-tuning data.</p>
                        <div className='buttons'>
                            <div class="container">
                                <a class="button2" href={`mailto:${email}?subject=${subject}&body=${body}`}>
                                    <span class="label-up">Join The Waitlist 🎉</span>
                                    <span class="label-up">Join the Waitlist 🎉</span>
                                </a>
                            </div>
                        </div>
                        <p style={{marginTop: '10%'}}> Watch Our Demo! 🤩</p>
                        <video style={{marginBottom: '10%'}}controls>
                            <source src={rovaDemo} type="video/mp4"/>
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div className='backedby'>
                        Backed By
                        <img src={yc} alt='yc' style={{ width: '200px', height: '50px' }}/>
                    </div>
                    <FileUpload />
                </div>
        </div>
        </>
    )
}

export default Hero