import React from 'react';
import { Link } from 'react-router-dom'; // Add this import
import bespokeLogo from '../assets/bespoke_logo.png';
import '../App.css';
import '../css/Navigation.css';

const Navigation = () => {
    return (
        <nav className="container-fluid">
            <ul>
                <li className="nav-logo-group">
                    {/* Use Link instead of <a> to prevent page refresh */}
                    <Link to="/" className="logo-link">
                        <img 
                            src={bespokeLogo} 
                            alt="Bespoke Auto Logo" 
                            className="nav-logo-image"
                        />
                        <span>Bespoke Auto</span>
                    </Link>
                </li>
            </ul>

            <ul>
                {/* Update these to Links as well for a seamless SPA experience */}
                <li><Link to='/' role='button' className="outline">Customize</Link></li>
                <li><Link to='/customcars' role='button'>View Cars</Link></li>
            </ul>
        </nav>
    );
}

export default Navigation;