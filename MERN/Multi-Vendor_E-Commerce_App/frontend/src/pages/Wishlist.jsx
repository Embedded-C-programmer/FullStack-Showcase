import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { FaHeart, FaShoppingCart, FaStar, FaTrash } from 'react-icons/fa';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, loading } = useWishlist();
    const { addToCart } = useCart();

    const handleRemove = async (productId) => {
        const result = await removeFromWishlist(productId);
        if (result.success) {
            toast.success('Removed from wishlist');
        } else {
            toast.error(result.message);
        }
    };

    const handleAddToCart = async (productId) => {
        const result = await addToCart(productId, 1);
        if (result.success) {
            toast.success('Added to cart!');
        } else {
            toast.error(result.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 dark:text-white flex items-center">
                <FaHeart className="text-red-500 mr-3" />
                My Wishlist
            </h1>

            {!wishlist || wishlist.products.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
                    <FaHeart className="text-6xl text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Save items you love for later!</p>
                    <Link
                        to="/products"
                        className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {wishlist.products.map((product) => (
                        <div key={product._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                            <div className="relative">
                                <Link to={`/products/${product._id}`}>
                                    <img
                                        src={product.images[0]?.url || '/placeholder.jpg'}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                </Link>
                                <button
                                    onClick={() => handleRemove(product._id)}
                                    className="absolute top-2 right-2 bg-white dark:bg-gray-700 p-2 rounded-full hover:bg-red-500 hover:text-white transition"
                                >
                                    <FaTrash />
                                </button>
                            </div>

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
                                        disabled={product.stock === 0}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded hover:shadow-lg transition flex items-center disabled:opacity-50"
                                    >
                                        <FaShoppingCart className="mr-1" />
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;