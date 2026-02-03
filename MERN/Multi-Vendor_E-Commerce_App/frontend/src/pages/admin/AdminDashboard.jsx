import React from 'react';
const AdminDashboard = () => (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 mb-2">Total Users</h3>
                <p className="text-3xl font-bold">5</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 mb-2">Total Vendors</h3>
                <p className="text-3xl font-bold">3</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 mb-2">Total Products</h3>
                <p className="text-3xl font-bold">12</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 mb-2">Total Orders</h3>
                <p className="text-3xl font-bold">0</p>
            </div>
        </div>
    </div>
);
export default AdminDashboard;