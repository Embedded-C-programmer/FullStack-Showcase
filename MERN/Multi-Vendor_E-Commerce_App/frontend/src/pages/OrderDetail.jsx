import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import OrderTracking from '../components/OrderTracking';
import { FaArrowLeft } from 'react-icons/fa';

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await axios.get(`/orders/${id}`);
            setOrder(res.data.data);
        } catch (error) {
            toast.error('Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        setCancelling(true);
        try {
            await axios.put(`/orders/${id}/cancel`, { reason: cancelReason });
            toast.success('Order cancelled successfully');
            fetchOrder();
            setShowCancelForm(false);
            setCancelReason('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400">Order not found</p>
            </div>
        );
    }

    const canCancel = ['pending', 'confirmed'].includes(order.status);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link to="/orders" className="flex items-center text-blue-600 dark:text-blue-400 hover:underline">
                        <FaArrowLeft className="mr-2" />
                        Back to Orders
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white">Order #{order.orderNumber}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    {canCancel && !showCancelForm && (
                        <button
                            onClick={() => setShowCancelForm(true)}
                            className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                            Cancel Order
                        </button>
                    )}

                    {showCancelForm && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded">
                            <h3 className="font-semibold mb-2 dark:text-white">Cancel Order</h3>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Please provide a reason for cancellation..."
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded mb-3 dark:bg-gray-700 dark:text-white"
                                rows="3"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={cancelling}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                >
                                    {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCancelForm(false);
                                        setCancelReason('');
                                    }}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <OrderTracking
                    status={order.status}
                    createdAt={order.createdAt}
                    confirmedAt={order.confirmedAt}
                    shippedAt={order.shippedAt}
                    deliveredAt={order.deliveredAt}
                    cancelledAt={order.cancelledAt}
                />

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Order Items</h2>
                    <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex gap-4 pb-4 border-b dark:border-gray-700 last:border-0">
                                <img
                                    src={item.image || '/placeholder.jpg'}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold dark:text-white">{item.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">${item.price.toFixed(2)} each</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Shipping Address</h2>
                    <div className="text-gray-700 dark:text-gray-300">
                        <p>{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Payment Summary</h2>
                    <div className="space-y-2 dark:text-gray-300">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${order.pricing.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{order.pricing.shipping === 0 ? <span className="text-green-500">FREE</span> : `$${order.pricing.shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span>${order.pricing.tax.toFixed(2)}</span>
                        </div>
                        <div className="border-t dark:border-gray-700 pt-2 mt-2">
                            <div className="flex justify-between text-xl font-bold dark:text-white">
                                <span>Total</span>
                                <span>${order.pricing.total.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-4 text-sm">
                            <p className="dark:text-gray-400">Payment Method: <span className="font-semibold dark:text-white uppercase">{order.paymentInfo.method}</span></p>
                            <p className="dark:text-gray-400">Payment Status: <span className={`font-semibold ${order.paymentInfo.status === 'succeeded' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                {order.paymentInfo.status}
                            </span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;