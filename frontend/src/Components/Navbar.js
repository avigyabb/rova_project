import "../styles/Navbar.css"
import { Link } from 'react-router-dom'; // Import Link

function Navbar() {
    return (
        <div className="navbarWrapper flex flex-row mb-5"> 
            <Link to={`/`} className="mr-auto ml-5 font-bold text-2xl"> rova </Link> 
            <Link to={`${process.env.REACT_APP_AUTH_HEADER}`} className="mr-5"> Journeys </Link> 
            <Link to={`${process.env.REACT_APP_AUTH_HEADER}/sessions`} className="mr-5"> Events </Link> 
            <Link to={`${process.env.REACT_APP_AUTH_HEADER}/charts`} className="mr-5"> Charts </Link> 
        </div>
    )
}

export default Navbar;