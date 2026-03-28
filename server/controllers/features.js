import { pool } from '../config/database.js'

export const getFeatures = async( req , res ) =>{
    try{
        const results = await pool.query(`
            SELECT 
                f.id, 
                f.feature_name, 
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', o.id, 
                        'name', o.name, 
                        'price_modifier', o.price_modifier, 
                        'image', o.image
                    )
                ) AS options
            FROM features f
            JOIN options o ON f.id = o.feature_id
            GROUP BY f.id, f.feature_name
            ORDER BY f.id ASC;`
        )
       

        res.status(200).json(results.rows);


    }catch(error){
        console.log( res.status(409).json({error: error.message }))
    }
}