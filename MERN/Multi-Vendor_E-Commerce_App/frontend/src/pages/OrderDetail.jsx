import React from 'react';
import { useParams } from 'react-router-dom';
const OrderDetail = () => {
    const { id } = useParams();
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Order Details</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p>Order ID: {id}</p>
            </div>
        </div>
    );
};
export default OrderDetail;