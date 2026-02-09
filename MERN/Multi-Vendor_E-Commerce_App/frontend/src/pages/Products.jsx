import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FaStar, FaShoppingCart, FaFilter, FaHeart, FaRegHeart } from 'react-icons/fa';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'newest'
    });

    const [showFilters, setShowFilters] = useState(false);

    const categories = [
        'Electronics',
        'Clothing',
        'Home & Garden',
        'Sports & Outdoors',
        'Books',
        'Beauty & Health',
        'Toys & Games',
        'Automotive',
        'Food & Beverages',
        'Other'
    ];

    useEffect(() => {
        fetchProducts();
    }, [searchParams]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams(searchParams);
            const res = await axios.get(`/products?${params}`);
            setProducts(res.data.data);
            setPagination({
                total: res.data.total,
                pages: res.data.pages,
                currentPage: res.data.currentPage
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const applyFilters = () => {
        const params = {};
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params[key] = filters[key];
            }
        });
        setSearchParams(params);
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            sort: 'newest'
        });
        setSearchParams({});
    };

    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page);
        setSearchParams(params);
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

    const handleWishlistToggle = async (productId) => {
        if (isInWishlist(productId)) {
            const result = await removeFromWishlist(productId);
            if (result.success) {
                toast.success('Removed from wishlist');
            } else {
                toast.error(result.message);
            }
        } else {
            const result = await addToWishlist(productId);
            if (result.success) {
                toast.success('Added to wishlist!');
            } else if (result.requiresAuth) {
                toast.info('Please login to add to wishlist');
                setTimeout(() => navigate('/login'), 1500);
            } else {
                toast.error(result.message);
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold dark:text-white">Products</h1>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                >
                    <FaFilter className="mr-2" />
                    Filters
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Filters Sidebar */}
                <div className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">Filters</h2>

                        {/* Search */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search products..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Category */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category
                            </label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Price Range
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="minPrice"
                                    value={filters.minPrice}
                                    onChange={handleFilterChange}
                                    placeholder="Min"
                                    className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="number"
                                    name="maxPrice"
                                    value={filters.maxPrice}
                                    onChange={handleFilterChange}
                                    placeholder="Max"
                                    className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Sort By
                            </label>
                            <select
                                name="sort"
                                value={filters.sort}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>

                        {/* Apply/Clear Buttons */}
                        <div className="space-y-2">
                            <button
                                onClick={applyFilters}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded hover:shadow-lg transition"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={clearFilters}
                                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {products.map((product) => (
                                    <div key={product._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                                        <div className="relative">
                                            <Link to={`/products/${product._id}`}>
                                                <img
                                                    src={product.images[0]?.url || '/placeholder.jpg'}
                                                    alt={product.name}
                                                    className="w-full h-48 object-cover"
                                                />
                                            </Link>

                                            {/* Wishlist Heart Button */}
                                            <button
                                                onClick={() => handleWishlistToggle(product._id)}
                                                className="absolute top-2 right-2 bg-white dark:bg-gray-700 p-2 rounded-full hover:scale-110 transition shadow-md"
                                            >
                                                {isInWishlist(product._id) ? (
                                                    <FaHeart className="text-red-500 text-xl" />
                                                ) : (
                                                    <FaRegHeart className="text-gray-600 dark:text-gray-300 text-xl" />
                                                )}
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
                                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <FaShoppingCart className="mr-2" />
                                                    {product.stock === 0 ? 'Out of Stock' : 'Add'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex justify-center items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="px-4 py-2 bg-white dark:bg-gray-800 dark:text-white border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {[...Array(pagination.pages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => handlePageChange(i + 1)}
                                            className={`px-4 py-2 rounded ${pagination.currentPage === i + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white dark:bg-gray-800 dark:text-white border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.pages}
                                        className="px-4 py-2 bg-white dark:bg-gray-800 dark:text-white border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-600 dark:text-gray-400">No products found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;