import axiosInstance from "../axiosInstance";

export const getActiveProductBadges = async () => {
    try {
        const response = await axiosInstance.get('/products/active-badges');
        if (response.data && response.data.success) {
            return response.data.data || {};
        }
        return {};
    } catch (error) {
        console.error('Error fetching product badges:', error);
        return {};
    }
};
