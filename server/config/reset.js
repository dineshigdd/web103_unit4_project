import { pool } from './database.js';
import featuresData from '../data/features.js'
import customItemsData from '../data/customItems.js'

const createTables = async () => {
    const createTableQuery = `
        DROP TABLE IF EXISTS custom_items CASCADE;
        DROP TABLE IF EXISTS options CASCADE;
        DROP TABLE IF EXISTS features CASCADE;

        CREATE TABLE features (
            id SERIAL PRIMARY KEY,
            feature_name VARCHAR(255) NOT NULL
        );

        CREATE TABLE options (
            id SERIAL PRIMARY KEY,
            feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            price_modifier INTEGER DEFAULT 0,
            visual_asset VARCHAR(255)
        );

        CREATE TABLE custom_items (
            id SERIAL PRIMARY KEY,
            item_name VARCHAR(255) NOT NULL,
            base_price INTEGER NOT NULL,
            selected_options JSONB NOT NULL, -- Stores the selected IDs for flexibility
            total_price INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(createTableQuery);
        console.log('Tables created successfully');
    } catch (err) {
        console.error('Error creating tables:', err);
    }
};

const seedDatabase = async () => {
    await createTables();

    try {
        // 1. Insert Features and Options
        for (const feature of featuresData) {
            const featureRes = await pool.query(
                'INSERT INTO features (feature_name) VALUES ($1) RETURNING id',
                [feature.feature_name]
            );
            const featureId = featureRes.rows[0].id;

            for (const option of feature.options) {
                await pool.query(
                    'INSERT INTO options (feature_id, name, price_modifier, visual_asset) VALUES ($1, $2, $3, $4)',
                    [featureId, option.name, option.price_modifier, option.visual_asset]
                );
            }
            console.log(`Feature "${feature.feature_name}" and its options inserted`);
        }

        // 2. Insert Sample Custom Items
        for (const item of customItemsData) {
            await pool.query(
                'INSERT INTO custom_items (item_name, base_price, selected_options, total_price) VALUES ($1, $2, $3, $4)',
                [
                    item.item_name,
                    item.base_price,
                    JSON.stringify(item.selected_options),
                    item.total_price
                ]
            );
            console.log(`Custom Item "${item.item_name}" inserted`);
        }

    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        // Close the pool connection if this is a standalone script
        // await pool.end(); 
    }
};

seedDatabase();