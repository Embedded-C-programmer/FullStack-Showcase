import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Checkout = () => {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
    });

    const subtotal = cart?.totalAmount || 0;
    const shipping = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const handleChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const orderData = {
                items: cart.items.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity
                })),
                shippingAddress,
                paymentMethod: 'stripe'
            };

            const res = await axios.post('/orders', orderData);

            // For demo purposes, auto-confirm the payment
            await axios.put(`/orders/${res.data.data._id}/payment`);

            toast.success('Order placed successfully!');
            await clearCart();
            navigate(`/orders/${res.data.data._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (!cart || cart.items.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 dark:text-white">Checkout</h1>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Shipping Information</h2>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={shippingAddress.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={shippingAddress.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Street Address</label>
                            <input
                                type="text"
                                name="street"
                                value={shippingAddress.street}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={shippingAddress.city}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={shippingAddress.state}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">ZIP Code</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={shippingAddress.zipCode}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                </div>

                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-20">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Order Summary</h2>

                        <div className="space-y-2 mb-4 dark:text-gray-300">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? <span className="text-green-500">FREE</span> : `$${shipping.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="border-t dark:border-gray-700 pt-4 mb-4">
                            <div className="flex justify-between text-xl font-bold dark:text-white">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p className="mb-2">Items: {cart.items.length}</p>
                            {cart.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-xs mb-1">
                                    <span>{item.product.name} x{item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;