import { Router } from "express";
import  carController from '../controllers/cars.js'

const router = Router();

router.post('/', carController.createCar);         
router.get('/', carController.getAllCars);         
router.get('/:id', carController.getCarById);      
router.put('/:id', carController.updateCar);       
router.delete('/:id', carController.deleteCar);    


export default router