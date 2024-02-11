import React, { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import logo from './images/rovalogo.png'
import { Link } from 'react-router-dom'

import './WebNavbar.css'

const WebNavbar = () => {

    const email = "founders@rovaai.com";
    const subject = encodeURIComponent("Join Waitlist");
    const body = encodeURIComponent("First Name:\nLast Name:\n\nCompany:\nRole:\n\nAdditional Info:");

    // Setting mobile nav
    const [click, setClick] = useState(false)
    const handleClick = () => setClick(!click)

    // Change nav color when scrolling
    const [color, setColor] = useState(false)
    const changeColor = () => {
        if (window.scrollY >= 90) {
            setColor(true)
        } else {
            setColor(false)
        }
    }

    window.addEventListener('scroll', changeColor)

    // close menu on click
    const closeMenu = () => setClick(false)

    return (
        <div className={color ? 'web-header web-header-bg' : 'web-header'}>
            <nav className='web-navbar'>
                <div className='web-logo-container'>
                    {/* <a href='/' className='web-logo'>
                        <img src={logo} alt='logo' style={{ width: '100px', height: '70px' }} />
                    </a> */}
                    <Link to={`/`}>
                        <p className="mr-auto ml-5 font-bold text-4xl text-white"> rova </p>
                    </Link>
                </div>
                <div className='web-hamburger' onClick={handleClick}>
                    {click ? (<FaTimes size={30} style={{ color: '#ffffff' }} />)
                        : (<FaBars size={30} style={{ color: '#ffffff' }} />)}

                </div>
                <ul className={click ? "nav-menu active" : "nav-menu"}>
                    <li className='nav-item'>
                        <a href={`mailto:${email}?subject=${subject}&body=${body}`} onClick={closeMenu}>
                            <span class="label-down">Book Demo</span>
                            <span class="label-down">Book Demo</span>
                        </a>
                    </li>
                    {/* <li className='nav-item'>
                        <a href='/' onClick={closeMenu}>
                            <span class="label-down">Get Started</span>
                            <span class="label-down">Get Started</span>
                        </a>
                    </li> */}
                    <li className='nav-item'>
                        <Link to={`/login`} onClick={closeMenu}>
                            <span class="label-down">Early Access</span>
                            <span class="label-down">Early Access</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default WebNavbar