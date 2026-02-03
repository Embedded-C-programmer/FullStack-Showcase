import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated, token } = useAuth();

    // Load cart when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadCart();
        } else {
            setCart(null);
        }
    }, [isAuthenticated]);

    // Load cart from server
    // const loadCart = async () => {
    //     try {
    //         setLoading(true);
    //         const res = await axios.get('/cart');
    //         setCart(res.data.data);
    //     } catch (error) {
    //         console.error('Failed to load cart:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    const loadCart = async () => {
        try {
            setLoading(true);

            const res = await axios.get('/cart', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCart(res.data.data);
        } catch (error) {
            console.error('Failed to load cart:', error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };


    // Add item to cart
    const addToCart = async (productId, quantity = 1) => {
        try {
            const res = await axios.post('/cart', { productId, quantity });
            setCart(res.data.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add to cart'
            };
        }
    };

    // Update cart item
    const updateCartItem = async (itemId, quantity) => {
        try {
            const res = await axios.put(`/cart/${itemId}`, { quantity });
            setCart(res.data.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update cart'
            };
        }
    };

    // Remove item from cart
    const removeFromCart = async (itemId) => {
        try {
            const res = await axios.delete(`/cart/${itemId}`);
            setCart(res.data.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to remove from cart'
            };
        }
    };

    // Clear cart
    const clearCart = async () => {
        try {
            const res = await axios.delete('/cart');
            setCart(res.data.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to clear cart'
            };
        }
    };

    // Get cart item count
    const getCartCount = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    };

    const value = {
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        loadCart,
        cartCount: getCartCount()
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};