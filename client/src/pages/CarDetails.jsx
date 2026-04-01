import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import carAPI from '../services/carAPI';
import '../css/CarDetails.css';
import { COLOR_MAP, BASE_CAR_PRICE } from '../utils/constants';
import Notification from '../components/Notification';

const CarDetails = ({ title }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalConfig, setModalConfig] = useState({ 
            isOpen: false, 
            title: "", 
            message: "", 
            type: "" 
    });

    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });
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
    // 1. Setup the modal for Confirmation
        setModalConfig({
            isOpen: true,
            title: "Delete Build?",
            message: "This will permanently remove 'Stealth Droptop' from your garage. Are you sure?",
            type: "error", // Use error type to trigger your red text style
            // We pass the actual delete logic as the onClose or a separate handler
            onConfirm: async () => {
                try {
                    await carAPI.deleteCar(id);
                    setModalConfig({ isOpen: false }); // Close modal
                    navigate('/customcars');           // Redirect
                } catch (err) {
                    // If it fails, reuse the modal to show the error
                    setModalConfig({
                        isOpen: true,
                        title: "Error",
                        message: "Failed to delete the car. Please try again.",
                        type: "error",
                        onConfirm: () => setModalConfig({ isOpen: false })
                    });
                }
            }
        });
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
                <Notification 
                        isOpen={modalConfig.isOpen}
                        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                        onConfirm={modalConfig.onConfirm} 
                        title={modalConfig.title}
                        message={modalConfig.message}
                        type={modalConfig.type}
                    />
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