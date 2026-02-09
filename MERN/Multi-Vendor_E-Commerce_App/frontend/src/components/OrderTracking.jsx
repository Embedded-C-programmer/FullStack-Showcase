import React from 'react';
import { FaCheck, FaBox, FaTruck, FaHome } from 'react-icons/fa';

const OrderTracking = ({ status, createdAt, confirmedAt, shippedAt, deliveredAt, cancelledAt }) => {
    const getStatusInfo = () => {
        const steps = [
            {
                name: 'Order Placed',
                status: 'pending',
                date: createdAt,
                icon: FaBox,
                completed: true
            },
            {
                name: 'Confirmed',
                status: 'confirmed',
                date: confirmedAt,
                icon: FaCheck,
                completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(status)
            },
            {
                name: 'Shipped',
                status: 'shipped',
                date: shippedAt,
                icon: FaTruck,
                completed: ['shipped', 'delivered'].includes(status)
            },
            {
                name: 'Delivered',
                status: 'delivered',
                date: deliveredAt,
                icon: FaHome,
                completed: status === 'delivered'
            }
        ];

        if (status === 'cancelled') {
            return [{
                name: 'Cancelled',
                status: 'cancelled',
                date: cancelledAt,
                icon: FaBox,
                completed: true,
                isCancelled: true
            }];
        }

        return steps;
    };

    const steps = getStatusInfo();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-6 dark:text-white">Order Tracking</h2>

            <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <div key={index} className="relative flex items-start mb-8 last:mb-0">
                            {/* Icon Circle */}
                            <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full ${step.isCancelled ? 'bg-red-500' :
                                    step.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                } text-white`}>
                                <Icon className="text-2xl" />
                            </div>

                            {/* Content */}
                            <div className="ml-6 flex-1">
                                <h3 className={`text-lg font-semibold ${step.isCancelled ? 'text-red-500' :
                                        step.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {step.name}
                                </h3>
                                {step.date && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {new Date(step.date).toLocaleString()}
                                    </p>
                                )}
                                {step.completed && !step.isCancelled && (
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">✓ Completed</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Status Badge */}
            <div className="mt-6 pt-6 border-t dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Status:</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;