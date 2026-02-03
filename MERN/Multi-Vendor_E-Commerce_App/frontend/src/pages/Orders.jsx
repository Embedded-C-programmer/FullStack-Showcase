import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBox, FaEye } from 'react-icons/fa';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/orders');
            setOrders(res.data.data);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            processing: 'bg-purple-100 text-purple-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-16">
                    <FaBox className="text-6xl text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">No orders yet</h2>
                    <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                    <Link
                        to="/products"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex flex-wrap justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold mb-1">
                                        Order #{order.orderNumber}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                    <p className="text-xl font-bold text-blue-600 mt-2">
                                        ${order.pricing.total.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4 mb-4">
                                <h4 className="font-semibold mb-2">Items ({order.items.length})</h4>
                                <div className="space-y-2">
                                    {order.items.slice(0, 2).map((item, index) => (
                                        <div key={index} className="flex items-center text-sm">
                                            <img
                                                src={item.image || '/placeholder.jpg'}
                                                alt={item.name}
                                                className="w-12 h-12 object-cover rounded mr-3"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-gray-600">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="font-semibold">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                    {order.items.length > 2 && (
                                        <p className="text-sm text-gray-600">
                                            +{order.items.length - 2} more item(s)
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    <p>Delivery to: {order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                </div>
                                <Link
                                    to={`/orders/${order._id}`}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                                >
                                    <FaEye className="mr-2" />
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;