import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            loadWishlist();
        } else {
            setWishlist(null);
        }
    }, [isAuthenticated]);

    const loadWishlist = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/wishlist');
            setWishlist(res.data.data);
        } catch (error) {
            console.error('Failed to load wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (productId) => {
        if (!isAuthenticated) {
            return {
                success: false,
                message: 'Please login to add items to wishlist',
                requiresAuth: true
            };
        }

        try {
            const res = await axios.post('/wishlist', { productId });
            setWishlist(res.data.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add to wishlist'
            };
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const res = await axios.delete(`/wishlist/${productId}`);
            setWishlist(res.data.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to remove from wishlist'
            };
        }
    };

    const isInWishlist = (productId) => {
        if (!wishlist || !wishlist.products) return false;
        return wishlist.products.some(p => p._id === productId);
    };

    const wishlistCount = wishlist?.products?.length || 0;

    const value = {
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        loadWishlist,
        wishlistCount
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};