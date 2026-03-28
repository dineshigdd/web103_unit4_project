import { Router } from "express";
import { getFeatures } from "../controllers/features.js";


const router = Router()

router.get('/', getFeatures )

export default router