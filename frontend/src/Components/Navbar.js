import "../styles/Navbar.css"
import { Link } from 'react-router-dom'; // Import Link

function Navbar() {
    return (
        <div className="navbarWrapper flex flex-row mb-5"> 
            <p className="mr-auto ml-5 font-bold text-2xl"> rova </p>
            <Link to="/" className="mr-5">Flows</Link> 
            <Link to="/sessions" className="mr-5">Users</Link> 
        </div>
    )
}

export default Navbar;