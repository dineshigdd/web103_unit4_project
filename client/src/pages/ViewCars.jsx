import React, { useEffect, useState } from 'react';
import carAPI from '../services/carAPI';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import '../css/ViewCars.css';

const ViewCars = () => {
    const [savedCars, setSavedCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchCars = async () => {
            try {
                const data = await carAPI.getAllCars();
                console.log(data)
                setSavedCars(data || []);
            } catch (error) {
                console.error("Error fetching cars:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCars();
    }, []);

    if (loading) return <div className="garage-page-wrapper"><aria-busy></aria-busy></div>;

    return (
        <div className="garage-page-wrapper">
            <div className="garage-content-limited">
                <header className="garage-header">
                    <h1>My Saved Garage</h1>
                </header>

                <div className="garage-list-container">
                    {savedCars.map((car) => (
                        <article key={car.id} className="car-banner">
                            
                            {/* LEFT: Icon and Name */}
                            <div className="banner-brand">
                                <span className="car-emoji">🏎️</span>
                                <h2 className="banner-title">{car.item_name}</h2>
                            </div>

                            {/* MIDDLE: Options Grid (Horizontal) */}
                            <div className="banner-specs">
                            {/* FIX: Change 'car.selections' to 'car.selected_options' */}
                            {car.selected_options && Object.values(car.selected_options).map((opt, i) => (
                                <div key={i} className="spec-item">
                                    <span className="spec-label">
                                        {opt.categoryLabel || 'Feature'}:
                                    </span>
                                    <span className="spec-value">{opt.name}</span>
                                </div>
                            ))}
                            </div>

                            {/* RIGHT: Price and Button */}
                            <div className="banner-actions">
                                <div className="banner-price">
                                    <span className="money-bag">💰</span>
                                    <h3>${car.total_price?.toLocaleString()}</h3>
                                </div>
                                <button 
                                    className="details-btn" 
                                    onClick={() => navigate(`/customcars/${car.id}`)}
                                >
                                    DETAILS
                                </button>
                            </div>

                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ViewCars;