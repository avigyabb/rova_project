import React from 'react'
import './Hero.css'
import WebNavbar from './WebNavbar'
import yc from './images/yc_logo.webp'
import rovaDemo from './rova_demo.mp4'
import { Link } from 'react-router-dom'


const Hero = () => {
    const email = "founders@rovaai.com";
    const subject = encodeURIComponent("Join Waitlist");
    const body = encodeURIComponent("First Name:\nLast Name:\n\nCompany:\nRole:\n\nAdditional Info:");

    return (
        <>
        < WebNavbar />
        <div className='hero'>
            {true ? (
                <div className='content'>
                    <div className='content2'>
                        <div className='backedby'>
                            <h1 style={{marginRight: '1%'}}>Backed By</h1>
                            <img src={yc} alt='yc' style={{ width: '180px', height: '50px' }}/>
                        </div>
                        <p> AI Apps That Learn From Your Users ✨ </p>
                        <p>We analyze and surface chat topics/sessions that influence product KPIs (retention, conversion, churn, etc.), optimize prompts, and automatically curate evaluation & fine-tuning data.</p>
                        <div className='buttons'>
                            <div class="container">
                                {/* <a class="button2" href={`mailto:${email}?subject=${subject}&body=${body}`}> */}
                                <Link class="button2" to={'/analyze-logs'}>
                                    <span class="label-up">Join The Waitlist 🎉</span>
                                    <span class="label-up">Join the Waitlist 🎉</span>
                                </Link>
                            </div>
                        </div>
                        <p style={{fontSize: '14px', marginTop: '1%'}}> or email us at <a href="mailto:founders@rovaai.com" style={{color: '#FF8263'}}>founders@rovaai.com</a></p>
                        <p style={{marginTop: '8%', marginBottom: '2%'}}> Watch Our Demo! 🤩</p>
                        <video style={{marginBottom: '10%'}}controls>
                            <source src={rovaDemo} type="video/mp4"/>
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            ) : (
                <div className='signup flex'>
                    <div className='signup-description'>
                        <h1>Book a Demo</h1>
                    </div>
                </div>
            )}
        </div>
        </>
    )
}

export default Hero