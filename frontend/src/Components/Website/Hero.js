import React from 'react'
import './Hero.css'
import WebNavbar from './WebNavbar'
import yc from './images/yc_logo.webp'

const Hero = () => {
    const email = "founders@rovaai.com";
    const subject = encodeURIComponent("Join Waitlist");
    const body = encodeURIComponent("First Name:\nLast Name:\n\nCompany:\nRole:\n\nAdditional Info:");

    return (
        <>
        < WebNavbar />
        <div className='hero'>
            <div className='content'>
                <div className='content2'>
                    <p>Analytics That Speaks For Your Users</p>
                    <p>Combine product analytics with LLM observability to understand how chat sessions impact KPIs like user drop-off, conversion, and retention.</p>
                    <div className='buttons'>
                        <div class="container">
                            <a class="button2" href={`mailto:${email}?subject=${subject}&body=${body}`}>
                                <span class="label-up">Join The Waitlist</span>
                                <span class="label-up">Join the Waitlist</span>
                            </a>
                        </div>
                    </div>
                    <div className='backedby'>
                        Backed By
                        <img src={yc} alt='yc' style={{ width: '200px', height: '50px' }}/>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default Hero