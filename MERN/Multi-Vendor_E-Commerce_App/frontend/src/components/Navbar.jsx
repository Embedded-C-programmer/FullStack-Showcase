// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useCart } from '../context/CartContext';
// import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';

// const Navbar = () => {
//     const { user, isAuthenticated, logout, isAdmin, isVendor } = useAuth();
//     const { cartCount } = useCart();
//     const navigate = useNavigate();
//     const [isMenuOpen, setIsMenuOpen] = useState(false);

//     const handleLogout = () => {
//         logout();
//         navigate('/login');
//     };

//     return (
//         <nav className="bg-white shadow-md sticky top-0 z-50">
//             <div className="container mx-auto px-4">
//                 <div className="flex justify-between items-center h-16">
//                     {/* Logo */}
//                     <Link to="/" className="text-2xl font-bold text-blue-600">
//                         MultiVendor
//                     </Link>

//                     {/* Desktop Navigation */}
//                     <div className="hidden md:flex items-center space-x-6">
//                         <Link to="/products" className="text-gray-700 hover:text-blue-600">
//                             Products
//                         </Link>

//                         {isAuthenticated ? (
//                             <>
//                                 {isVendor && (
//                                     <Link to="/vendor/dashboard" className="text-gray-700 hover:text-blue-600">
//                                         Vendor Dashboard
//                                     </Link>
//                                 )}

//                                 {isAdmin && (
//                                     <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600">
//                                         Admin Dashboard
//                                     </Link>
//                                 )}

//                                 <Link to="/orders" className="text-gray-700 hover:text-blue-600">
//                                     My Orders
//                                 </Link>

//                                 <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
//                                     <FaShoppingCart className="text-2xl" />
//                                     {cartCount > 0 && (
//                                         <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                                             {cartCount}
//                                         </span>
//                                     )}
//                                 </Link>

//                                 <div className="relative group">
//                                     <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
//                                         <FaUser />
//                                         <span>{user?.name}</span>
//                                     </button>

//                                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
//                                         <Link
//                                             to="/profile"
//                                             className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
//                                         >
//                                             Profile
//                                         </Link>
//                                         <button
//                                             onClick={handleLogout}
//                                             className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
//                                         >
//                                             Logout
//                                         </button>
//                                     </div>
//                                 </div>
//                             </>
//                         ) : (
//                             <>
//                                 <Link to="/login" className="text-gray-700 hover:text-blue-600">
//                                     Login
//                                 </Link>
//                                 <Link
//                                     to="/register"
//                                     className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                                 >
//                                     Register
//                                 </Link>
//                             </>
//                         )}
//                     </div>

//                     {/* Mobile menu button */}
//                     <button
//                         className="md:hidden text-gray-700"
//                         onClick={() => setIsMenuOpen(!isMenuOpen)}
//                     >
//                         {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
//                     </button>
//                 </div>

//                 {/* Mobile Navigation */}
//                 {isMenuOpen && (
//                     <div className="md:hidden py-4 space-y-3">
//                         <Link
//                             to="/products"
//                             className="block text-gray-700 hover:text-blue-600"
//                             onClick={() => setIsMenuOpen(false)}
//                         >
//                             Products
//                         </Link>

//                         {isAuthenticated ? (
//                             <>
//                                 {isVendor && (
//                                     <Link
//                                         to="/vendor/dashboard"
//                                         className="block text-gray-700 hover:text-blue-600"
//                                         onClick={() => setIsMenuOpen(false)}
//                                     >
//                                         Vendor Dashboard
//                                     </Link>
//                                 )}

//                                 {isAdmin && (
//                                     <Link
//                                         to="/admin/dashboard"
//                                         className="block text-gray-700 hover:text-blue-600"
//                                         onClick={() => setIsMenuOpen(false)}
//                                     >
//                                         Admin Dashboard
//                                     </Link>
//                                 )}

//                                 <Link
//                                     to="/orders"
//                                     className="block text-gray-700 hover:text-blue-600"
//                                     onClick={() => setIsMenuOpen(false)}
//                                 >
//                                     My Orders
//                                 </Link>

//                                 <Link
//                                     to="/cart"
//                                     className="block text-gray-700 hover:text-blue-600"
//                                     onClick={() => setIsMenuOpen(false)}
//                                 >
//                                     Cart ({cartCount})
//                                 </Link>

//                                 <Link
//                                     to="/profile"
//                                     className="block text-gray-700 hover:text-blue-600"
//                                     onClick={() => setIsMenuOpen(false)}
//                                 >
//                                     Profile
//                                 </Link>

//                                 <button
//                                     onClick={() => {
//                                         handleLogout();
//                                         setIsMenuOpen(false);
//                                     }}
//                                     className="block w-full text-left text-gray-700 hover:text-blue-600"
//                                 >
//                                     Logout
//                                 </button>
//                             </>
//                         ) : (
//                             <>
//                                 <Link
//                                     to="/login"
//                                     className="block text-gray-700 hover:text-blue-600"
//                                     onClick={() => setIsMenuOpen(false)}
//                                 >
//                                     Login
//                                 </Link>
//                                 <Link
//                                     to="/register"
//                                     className="block text-gray-700 hover:text-blue-600"
//                                     onClick={() => setIsMenuOpen(false)}
//                                 >
//                                     Register
//                                 </Link>
//                             </>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </nav>
//     );
// };

// export default Navbar;


// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useCart } from '../context/CartContext';
// import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';

// const Navbar = () => {
//     const { user, isAuthenticated, logout, isAdmin, isVendor } = useAuth();
//     const { cartCount } = useCart();
//     const navigate = useNavigate();
//     const [isMenuOpen, setIsMenuOpen] = useState(false);

//     const handleLogout = () => {
//         logout();
//         navigate('/login');
//     };

//     return (
//         <nav className="bg-white shadow-md sticky top-0 z-50">
//             <div className="container mx-auto px-4">
//                 <div className="flex justify-between items-center h-16">
//                     {/* Logo */}
//                     <Link to="/" className="text-2xl font-bold text-blue-600">
//                         MultiVendor
//                     </Link>

//                     {/* Desktop Navigation */}
//                     <div className="hidden md:flex items-center space-x-6">
//                         <Link to="/products" className="text-gray-700 hover:text-blue-600">
//                             Products
//                         </Link>

//                         {isAuthenticated ? (
//                             <>
//                                 {isVendor && (
//                                     <Link to="/vendor/dashboard" className="text-gray-700 hover:text-blue-600">
//                                         Vendor Dashboard
//                                     </Link>
//                                 )}

//                                 {isAdmin && (
//                                     <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600">
//                                         Admin Dashboard
//                                     </Link>
//                                 )}

//                                 <Link to="/orders" className="text-gray-700 hover:text-blue-600">
//                                     My Orders
//                                 </Link>

//                                 <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
//                                     <FaShoppingCart className="text-2xl" />
//                                     {cartCount > 0 && (
//                                         <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                                             {cartCount}
//                                         </span>
//                                     )}
//                                 </Link>

//                                 <div className="relative group">
//                                     <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
//                                         <FaUser />
//                                         <span>{user?.name}</span>
//                                     </button>

//                                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
//                                         <Link
//                                             to="/profile"
//                                             className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
//                                         >
//                                             Profile
//                                         </Link>
//                                         <button
//                                             onClick={handleLogout}
//                                             className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
//                                         >
//                                             Logout
//                                         </button>
//                                     </div>
//                                 </div>
//                             </>
//                         ) : (
//                             <>
//                                 <Link to="/login" className="text-gray-700 hover:text-blue-600">
//                                     Login
//                                 </Link>
//                                 <Link
//                                     to="/register"
//                                     className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                                 >
//                                     Register
//                                 </Link>
//                             </>
//                         )}
//                     </div>

//                     {/* Mobile menu button */}
//                     <button
//                         className="md:hidden text-gray-700"
//                         onClick={() => setIsMenuOpen(!isMenuOpen)}
//                     >
//                         {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
//                     </button>
//                 </div>

//                 {/* Mobile Navigation */}
//                 {isMenuOpen && (
//                     <div className="md:hidden py-4 space-y-3">
//                         <Link
//                             to="/products"
//                             className="block text-gray-700 hover:text-blue-600"
//                             onClick={() => setIsMenuOpen(false)}
//                         >
//                             Products
//                         </Link>

//                         {isAuthenticated ? (
//                             <>
//                                 {isVendor && (
//                                     <Link
//                                         to="/vendor/dashboard"
//                                         className="block text-gray-700 hover:text-blue-600"
//                                         onClick={() => setIsMenuOpen(false)}
//                                     >
//                                         Vendor Dashboard
//                                     </Link>
//                                 )}

//                                 {isAdmin && (
//                                     <Link
//                                         to="/admin/dashboard"
//                                         className="block text-gray-700 hover:text-blue-600"
//                                         onClick={() => setIsMenuOpen(false)}
//                                     >
//                                         Admin Dashboard
//                                     </Link>
//                                 )}

//                                 <Link
//                                     to="/orders"
//                                     className="block text-gray-700 hover:text-blue-600"
//                                     onClick={() => setIsMenuOpen(false)}
//                                 >
//                                     My Orders
//                                 </Link>

//                                 <Link
//                                     to="/cart"
//                                     className="block text-gray-700 hover:text-blue-600"
//                                     onClick={() => setIsMenuOpen(false)}
//                                 >
//                                     Cart ({cartCount})
//                                 </Link>

//                                 <Link
//                                     to="/profile"
//                                     className="block text-gray-700 hover:text-blue-600"
//                                     onClick={() => setIsMenuOpen(false)}
//                                 >
//                                     Profile
//                                 </Link>

//                                 <button
//                                     onClick={() => {
//                                         handleLogout();
//                                         setIsMenuOpen(false);
//                                     }}
//                                     className="block w-full text-left text-gray-700 hover:text-blue-600"
//                                 >
//                                     Logout
//                                 </button>
//                             </>
//                         ) : (
//                             <>
//                                 <Link
//                                     to="/login"
//                                     className="block text-gray-700 hover:text-blue-600"
//                                     onClick={() => setIsMenuOpen(false)}
//                                 >
//                                     Login
//                                 </Link>
//                                 <Link
//                                     to="/register"
//                                     className="block text-gray-700 hover:text-blue-600"
//                                     onClick={() => setIsMenuOpen(false)}
//                                 >
//                                     Register
//                                 </Link>
//                             </>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </nav>
//     );
// };

// export default Navbar;


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaMoon, FaSun, FaStore } from 'react-icons/fa';

const Navbar = () => {
    const { user, isAuthenticated, logout, isAdmin, isVendor } = useAuth();
    const { cartCount } = useCart();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors duration-200">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <FaStore className="text-3xl text-blue-600 dark:text-blue-400" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            MultiVendor
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/products" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">
                            Products
                        </Link>

                        {isAuthenticated ? (
                            <>
                                {isVendor && (
                                    <Link to="/vendor/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">
                                        Vendor Dashboard
                                    </Link>
                                )}

                                {isAdmin && (
                                    <Link to="/admin/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">
                                        Admin Dashboard
                                    </Link>
                                )}

                                <Link to="/orders" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">
                                    My Orders
                                </Link>

                                <Link to="/cart" className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
                                    <FaShoppingCart className="text-2xl" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Theme Toggle */}
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    aria-label="Toggle theme"
                                >
                                    {isDark ? (
                                        <FaSun className="text-xl text-yellow-400" />
                                    ) : (
                                        <FaMoon className="text-xl text-gray-700" />
                                    )}
                                </button>

                                {/* User Dropdown */}
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium">{user?.name}</span>
                                    </button>

                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border dark:border-gray-700">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                        >
                                            Profile Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Theme Toggle for logged out users */}
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    aria-label="Toggle theme"
                                >
                                    {isDark ? (
                                        <FaSun className="text-xl text-yellow-400" />
                                    ) : (
                                        <FaMoon className="text-xl text-gray-700" />
                                    )}
                                </button>

                                <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-700 dark:text-gray-200"
                        >
                            {isDark ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
                        </button>
                        <button
                            className="text-gray-700 dark:text-gray-200"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 space-y-3 border-t dark:border-gray-700">
                        <Link
                            to="/products"
                            className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Products
                        </Link>

                        {isAuthenticated ? (
                            <>
                                {isVendor && (
                                    <Link
                                        to="/vendor/dashboard"
                                        className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Vendor Dashboard
                                    </Link>
                                )}

                                {isAdmin && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}

                                <Link
                                    to="/orders"
                                    className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    My Orders
                                </Link>

                                <Link
                                    to="/cart"
                                    className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Cart ({cartCount})
                                </Link>

                                <Link
                                    to="/profile"
                                    className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Profile
                                </Link>

                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="block w-full text-left text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;