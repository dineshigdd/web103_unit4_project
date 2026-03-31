import React, { useEffect, useState } from 'react';
import '../App.css';
import featuresAPI from '../services/featuresAPI';
import carAPI from '../services/carAPI'; 
import '../css/CreateCar.css';
import { COLOR_MAP, BASE_CAR_PRICE } from '../utils/constants';

const CreateCar = () => {
    const [features, setFeatures] = useState([]);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [selections, setSelections] = useState({}); 
    const [totalPrice, setTotalPrice] = useState(BASE_CAR_PRICE);
    const [carName, setCarName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

 
    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const data = await featuresAPI.getFeatures();
                setFeatures(data);
                
                // FIX: data is an array, you want to select the first OBJECT in that array
                if (data && data.length > 0) {
                    setSelectedFeature(data[0]); 
                }
            } catch (error) {
                console.error("Error fetching features:", error);
            }
        };
        fetchFeatures();
    }, []);

    // Ensure this function receives the full 'feature' object from your .map()
    const handleOptionClick = (feature, option) => {
        setSelections(prevSelections => {
            const newSelections = { 
                ...prevSelections, 
                // We use feature.id as the key so each category only has one choice
                [feature.id]: { 
                    ...option, 
                    // This is the CRITICAL line for your receipt labels
                    categoryLabel: feature.feature_name 
                } 
            };

            // Recalculate total price immediately
            const extraCosts = Object.values(newSelections).reduce(
                (sum, item) => sum + Number(item.price_modifier || 0), 
                0
            );

            setTotalPrice(70000 + extraCosts);
            return newSelections;
        });
    };

    const handleSaveCar = async () => {
        if (!carName.trim()) {
            alert("Please give your configuration a name first!");
            return;
        }

        setIsSaving(true);
        const carData = {
            item_name: carName,
            base_price: 70000,
            selections: selections,
            total_price: totalPrice
        };

        try {
            const result = await carAPI.saveCar(carData);
            alert(`Success! "${result.item_name}" has been saved to your garage.`);
            setCarName(""); 
        } catch (error) {
            console.error("Error saving car:", error);
            alert("Failed to save configuration.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="container">
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

            <section className="options-section">
                {selectedFeature && (
                    <div className="options-grid">
                        {selectedFeature.options.map(option => {
                            const isColor = selectedFeature.feature_name.toLowerCase().includes('color');
                            const isSelected = selections[selectedFeature.id]?.id === option.id;
                            
                            const bgColor = COLOR_MAP[option.name] || option.name.toLowerCase();
                            const textColor = ['white', 'silver', 'yellow'].includes(option.name.toLowerCase()) ? 'black' : 'white';
                            const hasImage = option.image && option.image !== "";

                            const dynamicVars = isColor ? {
                                '--option-bg': bgColor,
                                '--option-text': textColor
                            } : {};

                            return (
                                <div 
                                    key={option.id} 
                                    className={`option-tile ${isSelected ? 'selected' : ''}`}
                                    style={dynamicVars}
                                    // FIX: Pass the whole selectedFeature object here
                                    onClick={() => handleOptionClick(selectedFeature, option)}                               
                                >
                                    {hasImage && (
                                        <img src={option.image} alt={option.name} className="tile-image" />
                                    )}

                                    <div className="tile-overlay">
                                        <span className="tile-name">{option.name}</span>
                                        <span className="tile-price">+${option.price_modifier}</span>
                                    </div>

                                    {isSelected && <div className="checkmark">✓</div>}
                                </div>
                            );
                        })}
                    </div>
                )}

                <section className="total-price-summary">
                    <article className="save-config-card">
                        <header>
                            <h2 style={{ color: '#2ecc71', margin: 0 }}>
                                Total: ${totalPrice.toLocaleString()}
                            </h2>
                        </header>
                        
                        <label htmlFor="car-name">
                            Configuration Name
                            <input 
                                type="text" 
                                id="car-name" 
                                placeholder="e.g. Red Stealth Sport" 
                                value={carName}
                                onChange={(e) => setCarName(e.target.value)}
                            />
                        </label>

                        <footer>
                            <button 
                                className="contrast" 
                                onClick={handleSaveCar}
                                disabled={isSaving || !carName.trim()}
                            >
                                {isSaving ? "Saving..." : "Submit Configuration"}
                            </button>
                        </footer>
                    </article>

                    <article className="receipt-card">
                        <h3>Current Build</h3>
                        <ul>
                            {Object.values(selections).length > 0 ? (
                                Object.values(selections).map((sel, index) => (
                                    // FIX: Use a unique key combination or sel.id
                                    <li key={sel.id || index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        {/* Now sel.categoryLabel exists because of the handleOptionClick fix */}
                                        <span><strong>{sel.categoryLabel}:</strong> {sel.name}</span>
                                        <span style={{ color: '#888' }}>+${sel.price_modifier}</span>
                                    </li>
                                ))
                            ) : (
                                <li style={{ color: '#888', fontStyle: 'italic' }}>No options selected</li>
                            )}
                        </ul>
                    </article>
                </section>
            </section>
        </main>
    );
};

export default CreateCar;