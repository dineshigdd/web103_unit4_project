import { Router } from "express";
import { getCarFeatures } from "../controllers/features.js";


const router = Router()

router.get('/', getCarFeatures )

export default router