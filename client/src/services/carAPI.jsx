const API_URL = '/api/cars';

const carAPI = {
    // 1. CREATE: Save a new car configuration
    saveCar: async (carData) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carData),
        });
        if (!response.ok) throw new Error('Failed to save car');
        return await response.json();
    },

    // 2. READ: Get all saved cars
    getAllCars: async () => {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch cars');
        return await response.json();
    },

    // 3. READ: Get a specific car by ID
    getCarById: async (id) => {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Car not found');
        return await response.json();
    },

    // 4. UPDATE: Modify an existing car
    updateCar: async (id, updatedData) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) throw new Error('Failed to update car');
        return await response.json();
    },

    // 5. DELETE: Remove a car
    deleteCar: async (id) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete car');
        return await response.json();
    }
};

export default carAPI;