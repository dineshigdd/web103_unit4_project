import { pool } from '../config/database.js'

export const getCarFeatures = async (req, res) => {
    try {
        const results = await pool.query(`
            SELECT 
                f.id, 
                f.feature_name, 
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', o.id, 
                        'name', o.name, 
                        'price_modifier', o.price_modifier, 
                        'image', o.image,
                        'is_convertible', o.is_convertible
                    )
                ) AS options
            FROM features f
            JOIN options o ON f.id = o.feature_id
            GROUP BY f.id, f.feature_name
            ORDER BY f.id ASC;`
        );

        res.status(200).json(results.rows);

    } catch (error) {
        // Corrected console.log: Log only the error, not the response object
        console.error("Error in getCarFeatures:", error.message);
        res.status(409).json({ error: error.message });
    }
};