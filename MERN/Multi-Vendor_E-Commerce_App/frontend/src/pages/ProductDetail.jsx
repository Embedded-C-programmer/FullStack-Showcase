import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaShoppingCart, FaStore, FaTruck, FaShieldAlt } from 'react-icons/fa';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [review, setReview] = useState({ rating: 5, comment: '' });
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await axios.get(`/products/${id}`);
            setProduct(res.data.data);
        } catch (error) {
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        const result = await addToCart(product._id, quantity);
        if (result.success) {
            toast.success('Added to cart!');
        } else {
            toast.error(result.message);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/products/${id}/reviews`, review);
            toast.success('Review added successfully!');
            setReview({ rating: 5, comment: '' });
            fetchProduct();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add review');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Product not found</h2>
                <Link to="/products" className="text-blue-600 hover:underline">
                    Back to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
            {/* Breadcrumb */}
            <div className="mb-6 text-sm">
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/products" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Products</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 dark:text-white">{product.name}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Product Images */}
                <div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mb-4">
                        <img
                            src={product.images[selectedImage]?.url || '/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-96 object-cover"
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {product.images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`border-2 rounded-lg overflow-hidden dark:border-gray-700 ${selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                                    }`}
                            >
                                <img
                                    src={image.url}
                                    alt={`${product.name} ${index + 1}`}
                                    className="w-full h-20 object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div>
                    <h1 className="text-3xl font-bold mb-4 dark:text-white">{product.name}</h1>

                    <div className="flex items-center mb-4">
                        <div className="flex items-center mr-4">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className={i < Math.floor(product.rating.average) ? 'text-yellow-400' : 'text-gray-300'}
                                />
                            ))}
                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                                {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
                            </span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <span className="text-4xl font-bold text-blue-600">
                            ${product.price.toFixed(2)}
                        </span>
                        {product.comparePrice && (
                            <span className="ml-3 text-xl text-gray-500 line-through">
                                ${product.comparePrice.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <div className="mb-6">
                        <Link to={`/vendor/${product.vendor._id}`} className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            <FaStore className="mr-2" />
                            <span>{product.vendor.vendorInfo?.businessName || product.vendor.name}</span>
                        </Link>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>

                    {/* Stock Status */}
                    <div className="mb-6">
                        {product.stock > 0 ? (
                            <p className="text-green-600 dark:text-green-400 font-semibold dark:text-white">
                                In Stock ({product.stock} available)
                            </p>
                        ) : (
                            <p className="text-red-600 dark:text-red-400 font-semibold dark:text-white">Out of Stock</p>
                        )}
                    </div>

                    {/* Quantity Selector */}
                    {product.stock > 0 && (
                        <div className="mb-6">
                            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Quantity:</label>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-2 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    -
                                </button>
                                <span className="text-xl font-semibold w-12 text-center dark:text-white">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="px-4 py-2 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4"
                    >
                        <FaShoppingCart className="mr-2" />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                        <div className="text-center">
                            <FaTruck className="text-3xl text-blue-600 mx-auto mb-2" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">Free Shipping</p>
                        </div>
                        <div className="text-center">
                            <FaShieldAlt className="text-3xl text-blue-600 mx-auto mb-2" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</p>
                        </div>
                        <div className="text-center">
                            <FaStore className="text-3xl text-blue-600 mx-auto mb-2" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">Trusted Vendor</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4 dark:text-white">Specifications</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {product.specifications.map((spec, index) => (
                            <div key={index} className="flex border-b dark:border-gray-700 py-2">
                                <span className="font-semibold w-1/3 dark:text-gray-300">{spec.key}:</span>
                                <span className="text-gray-700 dark:text-gray-300">{spec.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Customer Reviews</h2>

                {/* Add Review Form */}
                {isAuthenticated && (
                    <form onSubmit={handleReviewSubmit} className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                        <h3 className="font-semibold mb-3 dark:text-white">Write a Review</h3>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Rating</label>
                            <select
                                value={review.rating}
                                onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                            >
                                {[5, 4, 3, 2, 1].map((num) => (
                                    <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Comment</label>
                            <textarea
                                value={review.comment}
                                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                rows="3"
                                required
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                            Submit Review
                        </button>
                    </form>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                    {product.reviews && product.reviews.length > 0 ? (
                        product.reviews.map((review, index) => (
                            <div key={index} className="border-b pb-4">
                                <div className="flex items-center mb-2">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                                            />
                                        ))}
                                    </div>
                                    <span className="ml-3 font-semibold dark:text-white">{review.user?.name}</span>
                                    <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;