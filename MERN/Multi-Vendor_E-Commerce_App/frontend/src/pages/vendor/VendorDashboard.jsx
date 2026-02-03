// import React from 'react';
// import { Link } from 'react-router-dom';
// import { FaBox, FaDollarSign, FaShoppingBag } from 'react-icons/fa';

// const VendorDashboard = () => {
//     return (
//         <div className="container mx-auto px-4 py-8">
//             <h1 className="text-3xl font-bold mb-8">Vendor Dashboard</h1>

//             <div className="grid md:grid-cols-3 gap-6 mb-8">
//                 <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-blue-100 mb-1">Total Revenue</p>
//                             <h3 className="text-3xl font-bold">$0.00</h3>
//                         </div>
//                         <FaDollarSign className="text-5xl opacity-20" />
//                     </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-green-100 mb-1">Total Orders</p>
//                             <h3 className="text-3xl font-bold">0</h3>
//                         </div>
//                         <FaShoppingBag className="text-5xl opacity-20" />
//                     </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-purple-100 mb-1">Total Products</p>
//                             <h3 className="text-3xl font-bold">0</h3>
//                         </div>
//                         <FaBox className="text-5xl opacity-20" />
//                     </div>
//                 </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//                 <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
//                 <div className="grid md:grid-cols-2 gap-4">
//                     <Link
//                         to="/vendor/products/add"
//                         className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition font-semibold"
//                     >
//                         Add New Product
//                     </Link>
//                     <Link
//                         to="/vendor/products"
//                         className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition font-semibold"
//                     >
//                         Manage Products
//                     </Link>
//                 </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-md">
//                 <h2 className="text-xl font-bold mb-4">Getting Started</h2>
//                 <div className="space-y-3">
//                     <p className="text-gray-700">✓ Your vendor account is active and approved</p>
//                     <p className="text-gray-700">✓ Start by adding your first product</p>
//                     <p className="text-gray-700">✓ Set competitive prices and stock levels</p>
//                     <p className="text-gray-700">✓ Use high-quality product images</p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default VendorDashboard;



import React from 'react';
import { Link } from 'react-router-dom';

const VendorDashboard = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Vendor Dashboard</h1>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-600 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-blue-600">$0.00</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-600 mb-2">Total Orders</h3>
                    <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-600 mb-2">Total Products</h3>
                    <p className="text-3xl font-bold text-purple-600">0</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Quick Actions</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <Link to="/vendor/products/add" className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">
                        Add New Product
                    </Link>
                    <Link to="/vendor/products" className="bg-green-600 text-white p-4 rounded text-center hover:bg-green-700">
                        Manage Products
                    </Link>
                </div>
            </div>
        </div>
    );
};
export default VendorDashboard;