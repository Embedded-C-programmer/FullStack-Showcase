import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const Cart = () => {
    const { cart, updateCartItem, removeFromCart, loading } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [updatingItem, setUpdatingItem] = useState(null);

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Please login to view your cart</h2>
                <Link to="/login" className="text-blue-600 hover:underline">
                    Go to Login
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Link
                    to="/products"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdatingItem(itemId);
        const result = await updateCartItem(itemId, newQuantity);
        if (!result.success) {
            toast.error(result.message);
        }
        setUpdatingItem(null);
    };

    const handleRemove = async (itemId) => {
        const result = await removeFromCart(itemId);
        if (result.success) {
            toast.success('Item removed from cart');
        } else {
            toast.error(result.message);
        }
    };

    const calculateShipping = () => {
        return cart.totalAmount > 100 ? 0 : 10;
    };

    const calculateTax = () => {
        return cart.totalAmount * 0.08;
    };

    const calculateTotal = () => {
        return cart.totalAmount + calculateShipping() + calculateTax();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {cart.items.map((item) => (
                            <div key={item._id} className="flex items-center border-b py-4 last:border-b-0">
                                <img
                                    src={item.product?.images?.[0]?.url || '/placeholder.jpg'}
                                    alt={item.product?.name}
                                    className="w-24 h-24 object-cover rounded"
                                />

                                <div className="flex-1 ml-4">
                                    <Link
                                        to={`/products/${item.product?._id}`}
                                        className="font-semibold hover:text-blue-600"
                                    >
                                        {item.product?.name}
                                    </Link>
                                    <p className="text-sm text-gray-600 mt-1">
                                        by {item.product?.vendor?.vendorInfo?.businessName || item.product?.vendor?.name}
                                    </p>
                                    <p className="text-blue-600 font-bold mt-2">
                                        ${item.price.toFixed(2)}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                        disabled={updatingItem === item._id || item.quantity <= 1}
                                        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <FaMinus size={12} />
                                    </button>

                                    <span className="w-12 text-center font-semibold">{item.quantity}</span>

                                    <button
                                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                        disabled={updatingItem === item._id || item.quantity >= item.product?.stock}
                                        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <FaPlus size={12} />
                                    </button>
                                </div>

                                <div className="ml-4 text-right">
                                    <p className="font-bold text-lg">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => handleRemove(item._id)}
                                        className="text-red-500 hover:text-red-700 mt-2"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold">${cart.totalAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-semibold">
                                    {cart.totalAmount > 100 ? (
                                        <span className="text-green-600">FREE</span>
                                    ) : (
                                        `$${calculateShipping().toFixed(2)}`
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax (8%)</span>
                                <span className="font-semibold">${calculateTax().toFixed(2)}</span>
                            </div>

                            <div className="border-t pt-3 flex justify-between text-lg">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-blue-600">
                                    ${calculateTotal().toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {cart.totalAmount <= 100 && (
                            <p className="text-sm text-gray-600 mb-4">
                                Add ${(100 - cart.totalAmount).toFixed(2)} more for FREE shipping!
                            </p>
                        )}

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Proceed to Checkout
                        </button>

                        <Link
                            to="/products"
                            className="block text-center text-blue-600 hover:underline mt-4"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;