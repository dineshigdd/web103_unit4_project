import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import carAPI from '../services/carAPI';
import '../css/CarDetails.css';
import { COLOR_MAP, BASE_CAR_PRICE } from '../utils/constants';

const CarDetails = ({ title }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (title) document.title = title;
        const fetchCar = async () => {
            try {
                const data = await carAPI.getCarById(id);
                // Parse if stored as string
                if (data && typeof data.selected_options === 'string') {
                    data.selected_options = JSON.parse(data.selected_options);
                }
                setCar(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCar();
    }, [id, title]);

    const handleDelete = async () => {
        if (window.confirm("Delete this configuration?")) {
            await carAPI.deleteCar(id);
            navigate('/customcars');
        }
    };

    if (loading) return <div className="loading-state">Loading...</div>;
    if (!car) return <div className="error-state">Build not found.</div>;

    // Helper function to find color regardless of CAPS
        const getOptionColor = (name) => {
            if (!name) return '#333';
            // Find the key in COLOR_MAP that matches the name (ignoring case)
            const key = Object.keys(COLOR_MAP).find(k => k.toLowerCase() === name.toLowerCase());
            return COLOR_MAP[key] || '#333'; 
        };

    const options = car.selected_options ? Object.values(car.selected_options) : [];

    return (
        <div className="showcase-wrapper">
            {/* Background Image of the car for that "Atmospheric" feel */}
            <div className="hero-bg"></div>

            <div className="showcase-content">
                {/* Header Info: Name, Price, Actions */}
                <aside className="build-sidebar">
                    <div className="build-header">
                        <h1>{car.item_name}</h1>
                        <div className="price-tag">
                            <span className="coin">💰</span>
                            <span>${car.total_price?.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="build-actions">
                        <button className="red-btn" onClick={() => navigate(`/edit/${id}`)}>EDIT</button>
                        <button className="red-btn" onClick={handleDelete}>DELETE</button>
                    </div>
                </aside>

                {/* Visual Tiles: This is where the images live */}
                <div className="visual-tiles-container">
                    {options.map((opt, i) => (
                        <div key={i} className="part-tile">
                            {opt.image ? (<img src={opt.image} alt={opt.name} />):
                            
                            (
                               /* THE COLOR BLOCK */
                                <div 
                                    className="color-block"
                                    style={{ 
                                        backgroundColor: getOptionColor( opt.name),
                                        width: '100%',
                                        height: '100%',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0
                                    }}
                                ></div>
                            )}
                            <div className="part-overlay">
                                <div className="overlay-inner">
                                    <p className="cat">{opt.categoryLabel}</p>
                                    <p className="name">{opt.name}</p>
                                    <p className="price">+${opt.price_modifier}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CarDetails;