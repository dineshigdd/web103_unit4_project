import React from 'react'

export const ShowCase = ({ features }) => {
  return (
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
  )
}
