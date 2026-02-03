import React from 'react';
import { Link } from 'react-router-dom';

const VendorProducts = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Products</h1>
                <Link to="/vendor/products/add" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                    Add Product
                </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600">No products yet. Click "Add Product" to get started!</p>
            </div>
        </div>
    );
};
export default VendorProducts;