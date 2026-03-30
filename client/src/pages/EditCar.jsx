import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import carAPI from '../services/carAPI';
import featuresAPI from '../services/featuresAPI';
import { COLOR_MAP, BASE_CAR_PRICE } from '../utils/constants';
import '../css/EditCar.css'
import '../App.css';

const EditCar = ({ title }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State management
    const [features, setFeatures] = useState([]);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [itemName, setItemName] = useState(''); // Matches your input value
    const [selections, setSelections] = useState({}); 
    const [basePrice] = useState(BASE_CAR_PRICE); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (title) document.title = title;

        const loadInitialData = async () => {
            try {
                const [carData, allFeatures] = await Promise.all([
                    carAPI.getCarById(id),
                    featuresAPI.getFeatures()
                ]);

                if (carData) {
                    let options = carData.selections || carData.selected_options;
                    if (typeof options === 'string') options = JSON.parse(options);
                    
                    setItemName(carData.item_name);
                    setSelections(options || {});
                }

                if (allFeatures) {
                    setFeatures(allFeatures);
                    if (allFeatures.length > 0) setSelectedFeature(allFeatures[0]);
                }
            } catch (err) {
                console.error("Error loading EditCar data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id, title]);

    // Recalculate total price whenever selections change
    const totalPrice = useMemo(() => {
        const optionsTotal = Object.values(selections).reduce((acc, opt) => acc + Number(opt.price_modifier || 0), 0);
        return basePrice + optionsTotal;
    }, [selections, basePrice]);

    const handleSelectOption = (feature, option) => {
        setSelections(prev => ({
            ...prev,
            [feature.id]: { 
                ...option, 
                categoryLabel: feature.feature_name 
            }
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updatedCar = {
                item_name: itemName,
                selections: selections,
                total_price: totalPrice
            };
            await carAPI.updateCar(id, updatedCar);
            alert("Configuration updated!");
            navigate('/customcars');  
        } catch (err) {
            alert("Update failed.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this build?")) {
            try {
                await carAPI.deleteCar(id);
                navigate('/customcars');
            } catch (err) {
                alert("Delete failed.");
            }
        }
    };

    // Helper function to find color regardless of CAPS
        const getOptionColor = (name) => {
            if (!name) return '#333';
            // Find the key in COLOR_MAP that matches the name (ignoring case)
            const key = Object.keys(COLOR_MAP).find(k => k.toLowerCase() === name.toLowerCase());
            return COLOR_MAP[key] || '#333'; 
        };

    if (loading) return <div className="loading-state">Loading...</div>;

    return (
        <div className="container">
            {/* Features Navigation */}
            <nav className="features-nav">
                <ul>
                    <li><strong>Customize:</strong></li>
                </ul>
                <ul>
                    {features.map((feature) => (
                        <li key={feature.id}>
                            <button 
                                className={selectedFeature?.id === feature.id ? "" : "outline"}
                                onClick={() => setSelectedFeature(feature)}
                            >
                                {feature.feature_name}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="showcase-wrapper">
                <div className="showcase-content">
                    {/* LEFT SIDE: Name, Price, and Options */}
                    <aside className="build-sidebar">
                        <div className="build-header">
                            <input 
                                type="text" 
                                className="edit-name-input"
                                value={itemName} 
                                onChange={(e) => setItemName(e.target.value)} 
                                placeholder="Car Name"
                            />
                            <div className="price-tag">
                                <span className="coin">💰</span>
                                <span>${totalPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="selectors-container">
                            {selectedFeature && (
                                <div className="options-selector">
                                    <label>Choose {selectedFeature.feature_name}</label>
                                    <div className="options-grid">
                                        {selectedFeature.options?.map((opt) => (
                                            <button 
                                                key={opt.id}
                                                className={selections[selectedFeature.id]?.id === opt.id ? "active-opt" : "outline"}
                                                onClick={() => handleSelectOption(selectedFeature, opt)}
                                            >
                                                {opt.name} (${opt.price_modifier >= 0 ? '+' : ''}{opt.price_modifier})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="build-actions">
                            <button className="red-btn" onClick={handleUpdate}>UPDATE</button>
                            <button className="red-btn" onClick={handleDelete}>DELETE</button>
                        </div>
                    </aside>

                    {/* RIGHT SIDE: Dynamic Visual Image Tiles */}
                    <div className="visual-tiles-container">
                        {features.map((feature) => {
                            // Look up if this specific feature (e.g., Exterior) is in our selections
                            // Use feature.id or feature.feature_name depending on how you store keys
                            const selectedOption = selections[feature.id] || selections[feature.feature_name];

                            return (
                                <div key={feature.id} className="part-tile">
                                    {selectedOption ? (
                                        <div className="tile-content-wrapper" style={{ width: '100%', height: '100%' }}>
                                            {selectedOption.image ? (
                                                <img 
                                                    src={selectedOption.image} 
                                                    alt={selectedOption.name} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                /* THE COLOR BLOCK */
                                                <div 
                                                    className="color-block"
                                                    style={{ 
                                                        backgroundColor: getOptionColor(selectedOption.name),
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
                                                    <p className="cat">{feature.feature_name}</p>
                                                    <p className="name">{selectedOption.name}</p>
                                                    <p className="price">+${selectedOption.price_modifier}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* EMPTY SLOT: Keeps the UI from moving */
                                        <div className="placeholder-slot">
                                            <span>Select {feature.feature_name}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCar;