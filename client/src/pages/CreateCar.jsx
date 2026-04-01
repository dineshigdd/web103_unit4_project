import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import carAPI from '../services/carAPI';
import featuresAPI from '../services/featuresAPI';
import { COLOR_MAP, BASE_CAR_PRICE } from '../utils/constants';
import ConstraintModal from '../components/ConstraintModal';
import { validateRoofCompatibility } from '../utils/validation';
import Notification from '../components/Notification'
import '../css/CreateCar.css'; 
import '../App.css';

const CreateCar = ({ title }) => {
    const navigate = useNavigate();

    // State management
    const [features, setFeatures] = useState([]);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [itemName, setItemName] = useState(''); 
    const [selections, setSelections] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [isConvertible, setIsConvertible] = useState(false);
    const [error, setError] = useState("");
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", message: "", type: "" });
    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

    

    const handleToggleConvertible = () => {
        const nextValue = !isConvertible;
        const currentRoof = selections[3]; // Assuming 3 is your Roof ID

        if (currentRoof) {
            // Use your utility to check if the current roof works with the NEW toggle state
            const errorMsg = validateRoofCompatibility(nextValue, currentRoof);
            
            if (errorMsg) {
                // 1. Show the error
                setError(errorMsg);
                
                // 2. FORCE the checkbox to stay/return to the valid state
                // If the user tried to check it (nextValue = true) but it failed,
                // we keep it false.
                setIsConvertible(false); 
                
                // 3. Clear the roof selection so the dropdown goes to "Choose an option"
                setSelections(prev => {
                    const newSelections = { ...prev };
                    delete newSelections[3];
                    return newSelections;
                });
                
                return; // Exit so the final setIsConvertible(nextValue) doesn't run
            }
    }

    // If no conflict, proceed normally
    setIsConvertible(nextValue);
    setError("");
};
    
    useEffect(() => {
        if (title) document.title = title;

        const loadFeatures = async () => {
            try {
                const allFeatures = await featuresAPI.getFeatures();
                if (allFeatures) {
                    setFeatures(allFeatures);
                    if (allFeatures.length > 0) setSelectedFeature(allFeatures[0]);
                }
            } catch (err) {
                console.error("Error loading features:", err);
            } finally {
                setLoading(false);
            }
        };
        loadFeatures();
    }, [title]);

    // Calculate total price based on selections
    const totalPrice = useMemo(() => {
        const optionsTotal = Object.values(selections).reduce(
            (acc, opt) => acc + Number(opt.price_modifier || 0), 
            0
        );
        return BASE_CAR_PRICE + optionsTotal;
    }, [selections]);

    const handleSelectOption = (feature, option) => {
        if (feature.id === 3) {
            // If they pick a roof that IS convertible, ensure the checkbox is checked
            if (option.is_convertible) {
                setIsConvertible(true);
            } 
            // If they pick a roof that is NOT convertible, ensure the checkbox is unchecked
            else {
                setIsConvertible(false);
            }
            
            // Since the checkbox now always matches the roof, we can clear the error
            setError(""); 
        }

        setError("");
        setSelections(prev => ({
            ...prev,
            [feature.id]: { 
                ...option, 
                categoryLabel: feature.feature_name 
            }
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!itemName.trim()) {
            setModalConfig({
                isOpen: true,
                title: "Missing Name",
                message: "Please give your masterpiece a name before saving!",
                type: "error"
            });
            return;
            
        }
    
    if (Object.keys(selections).length < features.length) {
        setModalConfig({
            isOpen: true,
            title: "Incomplete Build",
            message: `You still have ${features.length - Object.keys(selections).length} parts to select.`,
            type: "error"
        });
       
        return;
    }

    if (error) {
        setModalConfig({
            isOpen: true,
            title: "Compatibility Error",
            message: "Please resolve the errors (check the roof compatibility) before saving.",
            type: "error"
        });
        
        return;
    }
        try {
            const newCar = {
                item_name: itemName,
                base_price: BASE_CAR_PRICE,
                is_convertible: isConvertible,
                selections: selections,
                total_price: totalPrice
            };

            
            await carAPI.saveCar(newCar); // Assuming you have a createCar method
            setModalConfig({
                isOpen: true,
                title: "Success!",
                message: "Your car has been saved to your garage.",
                type: "success"
            });

            navigate('/customcars');  
        } catch (err) {
            setModalConfig({
                isOpen: true,
                title: "Error",
                message: "Something went wrong while saving.",
                type: "error"
            });
        }
    };

    const getOptionColor = (name) => {
        if (!name) return '#333';
        const key = Object.keys(COLOR_MAP).find(k => k.toLowerCase() === name.toLowerCase());
        return COLOR_MAP[key] || '#333'; 
    };

    if (loading) return <div className="loading-state">Loading build tools...</div>;

    return (
        <div className="container">
            {/* Features Navigation */}
            <nav className="features-nav">
                <ul>
                    <li><strong>Design Your Car:</strong></li>
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
                    {/* LEFT SIDE: Input and Dropdown */}
                    <aside className="build-sidebar">
                        <div className="build-header">
                            <input 
                                type="text" 
                                className="edit-name-input"
                                value={itemName} 
                                onChange={(e) => setItemName(e.target.value)} 
                                placeholder="Name your build..."
                            />
                            <div className="price-tag">
                                <span className="coin">💰</span>
                                <span>${totalPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="selectors-container">
                            {selectedFeature && (
                                <div className="options-selector">
                                    <label htmlFor="feature-select">Available {selectedFeature.feature_name}s:</label>
                                    <select 
                                        id="feature-select"
                                        className="feature-dropdown"
                                        value={selections[selectedFeature.id]?.id || ""} 
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            
                                            // Handle Resetting to "Choose an option"
                                            if (selectedId === "") {
                                                setSelections(prev => {
                                                    const newSelections = { ...prev };
                                                    delete newSelections[selectedFeature.id];
                                                    return newSelections;
                                                });

                                                // If we are currently looking at the ROOF category, reset the box
                                                if (selectedFeature.id === 3) {
                                                    setIsConvertible(false); // This unchecks the box
                                                    setError("");            // Clears any leftover compatibility errors
                                                }
                                                return; 
                                            }

                                            // Handle normal selection
                                            const chosenOption = selectedFeature.options.find(
                                                (opt) => String(opt.id) === selectedId
                                            );
                                            
                                            if (chosenOption) {
                                                handleSelectOption(selectedFeature, chosenOption);
                                            }
                                        }}
                                    >
                                        <option value="">-- Choose an option --</option>
                                        {selectedFeature.options?.map((opt) => (
                                            <option key={opt.id} value={opt.id}>
                                                {opt.name} (${opt.price_modifier >= 0 ? '+' : ''}{opt.price_modifier})
                                            </option>
                                        ))}
                                    </select>
                                </div>                                
                            )}
                            <div className="extra-options">
                                <label className="switch-container">
                                    <input 
                                        type="checkbox" 
                                        checked={isConvertible} 
                                        onChange={handleToggleConvertible} 
                                    />
                                    <span className="checkmark"></span>
                                    Convertible Top
                                </label>
                            </div>
                        </div>

                       {/* validaition and Notification components */}
                         <ConstraintModal error={error} setError={setError} />
                         <Notification
                            isOpen={modalConfig.isOpen}
                            onClose={closeModal}
                            title={modalConfig.title}
                            message={modalConfig.message}
                            type={modalConfig.type}
                        />
                        <div className="build-actions">
                            <button className="red-btn" onClick={handleSave}>CREATE CAR</button>
                        </div>
                    </aside>

                    {/* RIGHT SIDE: The Visual Grid */}
                    <div className="visual-tiles-container">
                        {features.map((feature) => {
                            const selectedOption = selections[feature.id];

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
                                                <div 
                                                    className="color-block"
                                                    style={{ 
                                                        backgroundColor: getOptionColor(selectedOption.name),
                                                        width: '100%', height: '100%',
                                                        display: 'block', position: 'absolute',
                                                        top: 0, left: 0
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

export default CreateCar;