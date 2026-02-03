import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const VendorAddProduct = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        stock: '',
        images: [{ url: '', alt: '' }]
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/products', formData);
            toast.success('Product created successfully!');
            navigate('/vendor/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create product');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Add New Product</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                <div className="mb-4">
                    <label className="block font-medium mb-1">Product Name</label>
                    <input type="text" required className="w-full px-3 py-2 border rounded"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="mb-4">
                    <label className="block font-medium mb-1">Description</label>
                    <textarea required className="w-full px-3 py-2 border rounded" rows="4"
                        value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block font-medium mb-1">Price</label>
                        <input type="number" step="0.01" required className="w-full px-3 py-2 border rounded"
                            value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Stock</label>
                        <input type="number" required className="w-full px-3 py-2 border rounded"
                            value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block font-medium mb-1">Category</label>
                    <select className="w-full px-3 py-2 border rounded"
                        value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                        <option>Electronics</option>
                        <option>Clothing</option>
                        <option>Home & Garden</option>
                        <option>Sports & Outdoors</option>
                        <option>Books</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block font-medium mb-1">Image URL</label>
                    <input type="url" className="w-full px-3 py-2 border rounded"
                        value={formData.images[0].url} onChange={(e) => setFormData({ ...formData, images: [{ url: e.target.value, alt: formData.name }] })} />
                    <p className="text-sm text-gray-600 mt-1">Use free images from https://unsplash.com</p>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Create Product
                </button>
            </form>
        </div>
    );
};
export default VendorAddProduct;