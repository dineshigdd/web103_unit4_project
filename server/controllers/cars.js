import { pool } from '../config/database.js'

// 1. CREATE: Save a new car configuration
export const createCar = async (req, res) => {
    const { item_name, selections, base_price, total_price } = req.body;

    try {
        const query = `
            INSERT INTO custom_items (item_name, base_price, selected_options, total_price) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`;
        
        const values = [
            item_name, 
            base_price, 
            JSON.stringify(selections), 
            total_price
        ];
        
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("CREATE Error:", err.message);
        res.status(500).json({ error: "Failed to save the car configuration." });
    }
};

// 2. READ: Get all saved cars
export const getAllCars = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM custom_items ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error("READ ALL Error:", err.message);
        res.status(500).json({ error: "Failed to fetch saved cars." });
    }
};

// 3. READ: Get one specific car by ID
export const getCarById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM custom_items WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Configuration not found." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("READ ONE Error:", err.message);
        res.status(500).json({ error: "Server error while fetching car." });
    }
};

// 4. UPDATE: Modify an existing car
export const updateCar = async (req, res) => {
    const { id } = req.params;
    const { item_name, selections, total_price } = req.body;

    try {
        const query = `
            UPDATE custom_items 
            SET item_name = $1, selected_options = $2, total_price = $3 
            WHERE id = $4 
            RETURNING *`;
        
        const values = [item_name, JSON.stringify(selections), total_price, id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Car not found to update." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("UPDATE Error:", err.message);
        res.status(500).json({ error: "Failed to update configuration." });
    }
};

// 5. DELETE: Remove a saved car
export const deleteCar = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM custom_items WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Car not found to delete." });
        }
        res.json({ message: "Car configuration deleted successfully." });
    } catch (err) {
        console.error("DELETE Error:", err.message);
        res.status(500).json({ error: "Failed to delete configuration." });
    }
};

const carController = {
    createCar,
    getAllCars,
    getCarById,
    updateCar,
    deleteCar
};

export default carController;