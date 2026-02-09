import React, { useState } from 'react';
import { FaCreditCard, FaMobileAlt, FaUniversity, FaQrcode, FaMoneyBillWave } from 'react-icons/fa';
import QRCode from 'react-qr-code';

const PaymentMethods = ({ total, onPaymentComplete, loading }) => {
    const [selectedMethod, setSelectedMethod] = useState('cod');
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });
    const [upiId, setUpiId] = useState('');
    const [showQR, setShowQR] = useState(false);

    const paymentMethods = [
        { id: 'card', name: 'Credit/Debit Card', icon: FaCreditCard, color: 'blue' },
        { id: 'upi', name: 'UPI Payment', icon: FaMobileAlt, color: 'purple' },
        { id: 'netbanking', name: 'Net Banking', icon: FaUniversity, color: 'green' },
        { id: 'qr', name: 'Scan QR Code', icon: FaQrcode, color: 'indigo' },
        { id: 'cod', name: 'Cash on Delivery', icon: FaMoneyBillWave, color: 'yellow' }
    ];

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        if (name === 'number') {
            const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            setCardDetails({ ...cardDetails, [name]: formatted.slice(0, 19) });
        } else if (name === 'expiry') {
            const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d{1,2})/, '$1/$2');
            setCardDetails({ ...cardDetails, [name]: formatted.slice(0, 5) });
        } else if (name === 'cvv') {
            setCardDetails({ ...cardDetails, [name]: value.slice(0, 3) });
        } else {
            setCardDetails({ ...cardDetails, [name]: value });
        }
    };

    const handlePayment = () => {
        onPaymentComplete(selectedMethod);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Payment Method</h2>

            {/* Payment Method Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                        <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`p-4 rounded-lg border-2 transition ${selectedMethod === method.id
                                    ? `border-${method.color}-500 bg-${method.color}-50 dark:bg-${method.color}-900 dark:bg-opacity-20`
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Icon className={`text-3xl mx-auto mb-2 ${selectedMethod === method.id ? `text-${method.color}-500` : 'text-gray-400'
                                }`} />
                            <p className={`text-sm font-medium text-center ${selectedMethod === method.id ? `text-${method.color}-700 dark:text-${method.color}-300` : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                {method.name}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Payment Details Forms */}
            {selectedMethod === 'card' && (
                <div className="space-y-4 mb-6 animate-fade-in">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Card Number
                        </label>
                        <input
                            type="text"
                            name="number"
                            value={cardDetails.number}
                            onChange={handleCardChange}
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cardholder Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={cardDetails.name}
                            onChange={handleCardChange}
                            placeholder="JOHN DOE"
                            className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Expiry Date
                            </label>
                            <input
                                type="text"
                                name="expiry"
                                value={cardDetails.expiry}
                                onChange={handleCardChange}
                                placeholder="MM/YY"
                                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                CVV
                            </label>
                            <input
                                type="password"
                                name="cvv"
                                value={cardDetails.cvv}
                                onChange={handleCardChange}
                                placeholder="123"
                                maxLength="3"
                                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            )}

            {selectedMethod === 'upi' && (
                <div className="space-y-4 mb-6 animate-fade-in">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            UPI ID
                        </label>
                        <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="yourname@upi"
                            className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 p-4 rounded-lg">
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                            💡 Popular UPI Apps: Google Pay, PhonePe, Paytm, BHIM
                        </p>
                    </div>
                </div>
            )}

            {selectedMethod === 'netbanking' && (
                <div className="space-y-4 mb-6 animate-fade-in">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Your Bank
                        </label>
                        <select className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white">
                            <option>State Bank of India</option>
                            <option>HDFC Bank</option>
                            <option>ICICI Bank</option>
                            <option>Axis Bank</option>
                            <option>Kotak Mahindra Bank</option>
                            <option>Other Banks</option>
                        </select>
                    </div>
                </div>
            )}

            {selectedMethod === 'qr' && (
                <div className="mb-6 animate-fade-in">
                    {!showQR ? (
                        <button
                            onClick={() => setShowQR(true)}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                        >
                            Generate QR Code
                        </button>
                    ) : (
                        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                Scan this QR code with any UPI app to pay
                            </p>
                            <div className="bg-white p-4 inline-block rounded-lg">
                                <QRCode value={`upi://pay?pa=merchant@upi&pn=MultiVendor&am=${total}&cu=INR`} size={200} />
                            </div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-4">₹{total.toFixed(2)}</p>
                        </div>
                    )}
                </div>
            )}

            {selectedMethod === 'cod' && (
                <div className="mb-6 animate-fade-in">
                    <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-4 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                            💵 <strong>Cash on Delivery</strong>
                        </p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            Pay with cash when your order is delivered. Please keep exact change ready.
                        </p>
                    </div>
                </div>
            )}

            {/* Total Amount */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${total.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Pay Now Button */}
            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
            >
                {loading ? 'Processing...' : 'Complete Payment'}
            </button>

            {/* Security Badge */}
            <div className="mt-4 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure Payment Processing
            </div>
        </div>
    );
};

export default PaymentMethods;