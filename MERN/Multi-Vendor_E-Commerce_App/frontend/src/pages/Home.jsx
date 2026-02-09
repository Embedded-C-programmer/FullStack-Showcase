import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { FaStar, FaShoppingCart, FaTruck, FaShieldAlt, FaStore } from 'react-icons/fa';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            const res = await axios.get('/products/featured');
            setFeaturedProducts(res.data.data);
        } catch (error) {
            console.error('Error fetching featured products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId) => {
        const result = await addToCart(productId, 1);
        if (result.success) {
            toast.success('Product added to cart!');
        } else if (result.requiresAuth) {
            toast.info('Please login to add items to cart');
            setTimeout(() => navigate('/login'), 1500);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white">
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-3xl animate-fade-in">
                        <h1 className="text-5xl font-bold mb-4">
                            Welcome to MultiVendor Marketplace
                        </h1>
                        <p className="text-xl mb-8 text-blue-100">
                            Discover amazing products from trusted vendors around the world
                        </p>
                        <div className="space-x-4">
                            <Link
                                to="/products"
                                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:-translate-y-1 hover:shadow-xl"
                            >
                                Shop Now
                            </Link>
                            <Link
                                to="/register"
                                className="inline-block bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition transform hover:-translate-y-1"
                            >
                                Become a Vendor
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                        <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4 flex justify-center">
                            <FaStore />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-center dark:text-white">Wide Selection</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-center">
                            Browse thousands of products from multiple vendors
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                        <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4 flex justify-center">
                            <FaShieldAlt />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-center dark:text-white">Secure Payments</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-center">
                            Shop with confidence using secure payment processing
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                        <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4 flex justify-center">
                            <FaTruck />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-center dark:text-white">Fast Shipping</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-center">
                            Get your orders delivered quickly and safely
                        </p>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <div className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-8 dark:text-white">Featured Products</h2>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
                            <div key={product._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                                <Link to={`/products/${product._id}`}>
                                    <img
                                        src={product.images[0]?.url || '/placeholder.jpg'}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                </Link>

                                <div className="p-4">
                                    <Link to={`/products/${product._id}`}>
                                        <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 line-clamp-2">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                        by {product.vendor?.vendorInfo?.businessName || product.vendor?.name}
                                    </p>

                                    <div className="flex items-center mb-2">
                                        <FaStar className="text-yellow-400" />
                                        <span className="ml-1 text-sm dark:text-gray-300">
                                            {product.rating.average.toFixed(1)} ({product.rating.count})
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            ${product.price.toFixed(2)}
                                        </span>

                                        <button
                                            onClick={() => handleAddToCart(product._id)}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center"
                                        >
                                            <FaShoppingCart className="mr-2" />
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && featuredProducts.length === 0 && (
                    <p className="text-center text-gray-600 dark:text-gray-400">No featured products available</p>
                )}

                <div className="text-center mt-8">
                    <Link
                        to="/products"
                        className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-1"
                    >
                        View All Products
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;