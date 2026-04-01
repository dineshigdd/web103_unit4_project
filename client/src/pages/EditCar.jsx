import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import carAPI from '../services/carAPI';
import featuresAPI from '../services/featuresAPI';
import { COLOR_MAP, BASE_CAR_PRICE } from '../utils/constants';
import ConstraintModal from '../components/ConstraintModal';
import { validateRoofCompatibility } from '../utils/validation'; 
import Notification from '../components/Notification';

import '../css/EditCar.css';
import '../App.css';

const EditCar = ({ title }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State management
    const [features, setFeatures] = useState([]);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [itemName, setItemName] = useState(''); 
    const [selections, setSelections] = useState({}); 
    const [basePrice] = useState(BASE_CAR_PRICE); 
    const [loading, setLoading] = useState(true);
    const [isConvertible, setIsConvertible] = useState(false);
    const [error, setError] = useState("");
    const [modalConfig, setModalConfig] = useState({ 
            isOpen: false, 
            title: "", 
            message: "", 
            type: "" 
    });

    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });
    
    const selectedCount = Object.keys(selections).length;
    const totalRequired = 4; // Or however many categories yo

    useEffect(() => {
    if (title) document.title = title;

    const loadInitialData = async () => {
        try {
            const [carData, allFeatures] = await Promise.all([
                carAPI.getCarById(id),
                featuresAPI.getFeatures()
            ]);

            if (carData) {
                if (carData) {
                    let options = carData.selected_options || carData.selections;
                    if (typeof options === 'string') options = JSON.parse(options);
                    
                    setItemName(carData.item_name || "");
                    setSelections(options || {});
                    
                    // MATCHING YOUR DB: Using "is_convertible_only" for the car build status
                    const carIsConvertible = !!carData.is_convertible;                 
                    setIsConvertible(carIsConvertible);

                    // Ensure error is empty so no dialog box shows on load
                    setError(""); 
                }
            }

            if (allFeatures) {
                setFeatures(allFeatures);
                if (allFeatures.length > 0) setSelectedFeature(allFeatures[0]);
            }
        } catch (err) {
            console.error("Error loading EditCar data:", err);
        } finally {
            // Only stop the loading spinner once everything is set
            setLoading(false); 
        }
    };
    loadInitialData();
    }, [id, title]);

    const totalPrice = useMemo(() => {
        const optionsTotal = Object.values(selections).reduce((acc, opt) => acc + Number(opt.price_modifier || 0), 0);
        return basePrice + optionsTotal;
    }, [selections, basePrice]);

    const handleSelectOption = (feature, option) => {
     

        const featureId = Number(feature.id);
        const updatedSelection = { 
            ...option, 
            categoryLabel: feature.feature_name 
        };

        // 2. Update the selections
        setSelections(prev => ({
            ...prev,
            [featureId]: updatedSelection
        }));

        // 3. Only RE-FIRE the error if the CURRENT selection is actually bad
        if (featureId === 3) {
            const msg = validateRoofCompatibility(isConvertible, option);
            
            if (msg) {
                setError(msg); // Only set it if there is a real problem
                
            }
        } 
       
    };

    const handleUpdate = async (e) => {
        if (e) e.preventDefault();
        
        // 1. Get the current roof from your selections state
    // We check both string "3" and number 3 just in case
        const currentRoof = selections[3] || selections["3"];

        // 2. LIVE VALIDATION: Calculate it right now
    // This does not rely on the 'error' state variable at all
        const activeError = currentRoof 
        ? validateRoofCompatibility(isConvertible, currentRoof) 
        : ""

        // 2. Validation: Check for Name
        if (!itemName.trim()) {
            setModalConfig({
                isOpen: true,
                title: "Missing Name",
                message: "Please give your masterpiece a name before saving!",
                type: "error"
            });
            return;
        }

        // 3. Validation: Check for Roof/Convertible Compatibility
        // This uses the 'error' state which should be set by your toggle/dropdown logic
        
        if (activeError) {
            setModalConfig({
                isOpen: true,
                title: "Compatibility Issue",
                message: activeError, 
                type: "error"
            });
            return;
        }

        // 4. Validation: Check for completeness
        if (selectedCount < totalRequired) {
            setModalConfig({
                isOpen: true,
                title: "Incomplete Build",
                message: `This car is missing ${totalRequired - selectedCount} parts. Please select an option for every category.`,
                type: "error"
            });
            return;
        }

        // 5. Execution: Save to Database
        try {
            const updatedCar = {
                item_name: itemName,
                is_convertible: isConvertible, 
                selections: selections,
                total_price: totalPrice
            };

            await carAPI.updateCar(id, updatedCar);

            // 6. Success Notification with Integrated Navigation
            setModalConfig({
                isOpen: true,
                title: "Changes Saved!",
                message: "Your car has been successfully updated.",
                type: "success",
                // The navigation happens ONLY when the user clicks the "Confirm" button
                onConfirm: () => {
                    setModalConfig({ isOpen: false });
                    navigate('/customcars');
                }
            });
        } catch (err) {
            setModalConfig({
                isOpen: true,
                title: "Update Failed",
                message: "We couldn't save your changes. Please try again.",
                type: "error"
            });
        }
    };

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

    const getOptionColor = (name) => {
        if (!name) return '#333';
        const key = Object.keys(COLOR_MAP).find(k => k.toLowerCase() === name.toLowerCase());
        return COLOR_MAP[key] || '#333'; 
    };

    if (loading) return <div className="loading-state">Loading...</div>;

    return (
        <div className="container">
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

                        <div className="car-specs-header">
                            <h3>Editing Your Build</h3>
                            <p>
                                <strong>Body Style:</strong> {isConvertible ? "Convertible" : "Coupe"} 
                                <span className="lock-icon"> 🔒 (Locked)</span>
                            </p>
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
                                            const chosenOption = selectedFeature.options.find(
                                                (opt) => String(opt.id) === e.target.value
                                            );
                                            if (chosenOption) handleSelectOption(selectedFeature, chosenOption);
                                        }}
                                    >
                                        <option value="" disabled>-- Choose an option --</option>
                                        {selectedFeature.options?.map((opt) => (
                                            <option key={opt.id} value={opt.id}>
                                                {opt.name} (${opt.price_modifier >= 0 ? '+' : ''}{opt.price_modifier})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="build-actions">
                        <button 
                            className="red-btn" 
                            disabled={error !== ""} 
                            onClick={handleUpdate}
                        >
                            UPDATE
                        </button>
                        
                        <button 
                            className="red-btn outline" 
                            onClick={handleDelete}
                        >
                            DELETE
                        </button>
                    </div>                       
                    </aside>
                    {/* validations and notificaitons */}
                     <ConstraintModal error={error} setError={setError} />
                     
                    <Notification 
                        isOpen={modalConfig.isOpen}
                        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                        onConfirm={modalConfig.onConfirm} 
                        title={modalConfig.title}
                        message={modalConfig.message}
                        type={modalConfig.type}
                    />

                    <div className="visual-tiles-container">
                        {features.map((feature) => {
                            const selectedOption = selections[feature.id];
                            return (
                                <div key={feature.id} className="part-tile">
                                    {selectedOption ? (
                                        <div className="tile-content-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
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
                                                        width: '100%', height: '100%'
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

export default EditCar;