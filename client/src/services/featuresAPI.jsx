const API_URL = '/api/features';

const getFeatures = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch features');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching features:', error);
        throw error;
    }
}

export default {
    getFeatures
}