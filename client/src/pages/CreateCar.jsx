import React, { useEffect, useState } from 'react';
import '../App.css';
import featuresAPI from '../services/featuresAPI';
import '../css/CreateCar.css';

const CreateCar = () => {
    const [features, setFeatures] = useState([]);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [selections, setSelections] = useState({}); 
    const [totalPrice, setTotalPrice ] = useState(70000);

    const colorMap = {
    "Midnight Blue": "#191970",
    "Matte Black": "#28282b",
    "Phantom Gray": "#4b4b4b",
    "Arctic White": "#f0f8ff",
    "Racing Red": "#d00000",
    "Golden Sun": "#ffd700",
    "Obsidian": "#0b0d0f"
};
    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const data = await featuresAPI.getFeatures();
                setFeatures(data);
                
                // Automatically select the first feature (e.g., Exterior Color) on load
                if (data && data.length > 0) {
                    setSelectedFeature(data[0]);
                    console.log(data)
                }
            } catch (error) {
                console.error("Error fetching features:", error);
            }
        };
        fetchFeatures();
    }, []);

    const handleOptionClick = (featureId, option) => {
        setSelections(prevSelections => {
        const newSelections = { ...prevSelections, [featureId]: option };

        // 2. Calculate the total from all current selections
        const extraCosts = Object.values(newSelections).reduce(
            (sum, item) => sum + Number(item.price_modifier), 
            0
        );

        // 3. Set the new total price (Base 70k + extras)
        setTotalPrice(70000 + extraCosts);

        return newSelections;
    });

    };

    return (
        <main className="container">
            {/* Horizontal Navigation for Main Features */}
            <nav className="features-nav">
                <ul>
                    <li><strong>Customize:</strong></li>
                </ul>
                <ul>
                    {features.map((feature) => (
                        <li key={feature.id}>
                            <button 
                                // Highlights the active category
                                className={selectedFeature?.id === feature.id ? "" : "outline"}
                                onClick={() => setSelectedFeature(feature)}
                            >
                                {feature.feature_name}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Options Section: Displays specific choices for the selected feature */}
            <section className="options-section">
                {selectedFeature && (
                    <div>
                        {selectedFeature.options.map(option => {
                                const isColor = selectedFeature.feature_name.toLowerCase().includes('color');
                                const isSelected = selections[selectedFeature.id]?.id === option.id;

                                // dynamic values
                                const bgColor = colorMap[option.name] || option.name.toLowerCase();
                                const textColor = ['white', 'silver', 'yellow'].includes(option.name.toLowerCase()) ? 'black' : 'white';
                                const hasImage = option.image && option.image !== "";

                               
                                const dynamicVars = isColor ? {
                                    '--option-bg': bgColor,
                                    '--option-text': textColor
                                } : {};
                        return (
                                <div 
                                    key={option.id} 
                                    className={`option-tile ${isSelected ? 'selected' : ''} ${hasImage ? 'has-image' : ''}`}
                                    style={dynamicVars}
                                    onClick={() => handleOptionClick(selectedFeature.id, option)}                               
                                >
                                    {hasImage && (
                                        <img src={option.image} alt={option.name} className="tile-image" />
                                    )}

                                    <div className="tile-overlay">
                                        <span className="tile-name">{option.name}</span>
                                        <span className="tile-price">+${option.price_modifier}</span>
                                    </div>

                                    {/* A small checkmark that only appears when selected */}
                                    {isSelected && <div className="checkmark">✓</div>}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 3. Total Price & Submit Button */}
                <section className="total-price-summary">
                    
                        {/* Card 1: Price and Action */}
                        <article>
                            <header>
                                <h2 style={{ color: '#2ecc71', marginBottom: 0 }}>
                                    Total: ${totalPrice.toLocaleString()}
                                </h2>
                            </header>
                            <button className="contrast" onClick={() => alert("Car Saved!")}>
                                Submit Configuration
                            </button>
                        </article>

                        {/* Card 2: Current Selections List */}
                        <article>
                            <h3>Current Selection:</h3>
                            <ul>
                                {Object.values(selections).map(sel => (
                                    <li key={sel.id}>
                                        {sel.name} 
                                        <small style={{ marginLeft: '10px', color: '#888' }}>
                                            (+${sel.price_modifier})
                                        </small>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    
                </section>
            </section>

        </main>
    );
};

export default CreateCar;