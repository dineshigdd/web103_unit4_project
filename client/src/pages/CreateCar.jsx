import React, { useEffect, useState } from 'react';
import '../App.css';
import featuresAPI from '../services/featuresAPI';
import '../css/CreateCar.css';

const CreateCar = () => {
    const [features, setFeatures] = useState([]);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [selections, setSelections] = useState({}); // To track chosen options

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
                }
            } catch (error) {
                console.error("Error fetching features:", error);
            }
        };
        fetchFeatures();
    }, []);

    const handleOptionClick = (featureId, option) => {
        setSelections(prev => ({
            ...prev,
            [featureId]: option
        }));
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
                            // Logic: If the feature name contains "Color", show the actual color
                            const isColor = selectedFeature.feature_name.toLowerCase().includes('color');
                            const isSelected = selections[selectedFeature.id]?.id === option.id;

                            const buttonStyle = isColor ? {
                                backgroundColor: colorMap[option.name] ||    option.name.toLowerCase(),
                                color: ['white', 'silver', 'yellow'].includes(option.name.toLowerCase()) ? 'black' : 'white',
                                border: isSelected ? '5px solid #0076ff' : '1px solid rgba(0,0,0,0.2)',
                                transition: 'transform 0.2s',
                                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                minHeight: '80px'
                            } : {};

                            return (
                                <button 
                                    key={option.id} 
                                    style={buttonStyle}
                                    className={!isColor ? (isSelected ? "" : "outline secondary") : ""}
                                    onClick={() => handleOptionClick(selectedFeature.id, option)}
                                >
                                    {option.name}
                                    {option.price_modifier > 0 && ` (+$${option.price_modifier})`}
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Summary View (Optional: Shows what is currently picked) */}
            <footer style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid #ccc' }}>
                <h3>Current Selection:</h3>
                <ul>
                    {Object.values(selections).map(sel => (
                        <li key={sel.id}>{sel.name}</li>
                    ))}
                </ul>
            </footer>
        </main>
    );
};

export default CreateCar;