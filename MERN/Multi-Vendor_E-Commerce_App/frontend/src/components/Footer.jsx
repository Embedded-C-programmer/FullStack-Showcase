import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaStore, FaHeart } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <FaStore className="text-3xl text-blue-500" />
                            <span className="text-2xl font-bold text-white">MultiVendor</span>
                        </div>
                        <p className="text-gray-400 mb-4">
                            Your trusted marketplace for quality products from verified vendors worldwide.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-blue-500 transition">
                                <FaFacebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                                <FaTwitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-pink-500 transition">
                                <FaInstagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-blue-600 transition">
                                <FaLinkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/products" className="hover:text-blue-500 transition">
                                    Browse Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="hover:text-blue-500 transition">
                                    Become a Vendor
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="hover:text-blue-500 transition">
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="hover:text-blue-500 transition">
                                    My Account
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Customer Service</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="hover:text-blue-500 transition">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-blue-500 transition">
                                    Return Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-blue-500 transition">
                                    Shipping Info
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-blue-500 transition">
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Newsletter</h3>
                        <p className="text-gray-400 mb-4 text-sm">
                            Subscribe to get special offers and updates.
                        </p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button className="bg-blue-600 px-4 py-2 rounded-r-lg hover:bg-blue-700 transition">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm mb-4 md:mb-0">
                        © 2026 MultiVendor. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                        <a href="#" className="hover:text-blue-500 transition">
                            Privacy Policy
                        </a>
                        <span className="text-gray-600">|</span>
                        <a href="#" className="hover:text-blue-500 transition">
                            Terms of Service
                        </a>
                        <span className="text-gray-600">|</span>
                        <a href="#" className="hover:text-blue-500 transition">
                            Cookie Policy
                        </a>
                    </div>
                    <p className="text-gray-400 text-sm mt-4 md:mt-0 flex items-center">
                        Made with <FaHeart className="text-red-500 mx-1" /> by MERN Stack
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;