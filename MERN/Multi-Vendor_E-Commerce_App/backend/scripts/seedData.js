const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});

        // Create Users
        console.log('Creating users...');

        // Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            phone: '+1234567890',
            isActive: true
        });

        // Vendors
        const vendor1 = await User.create({
            name: 'Tech Store',
            email: 'techstore@example.com',
            password: 'vendor123',
            role: 'vendor',
            phone: '+1234567891',
            isActive: true,
            vendorInfo: {
                businessName: 'TechWorld Electronics',
                businessDescription: 'Premium electronics and gadgets',
                isApproved: true,
                commission: 10,
                rating: {
                    average: 4.5,
                    count: 120
                }
            }
        });

        const vendor2 = await User.create({
            name: 'Fashion Hub',
            email: 'fashionhub@example.com',
            password: 'vendor123',
            role: 'vendor',
            phone: '+1234567892',
            isActive: true,
            vendorInfo: {
                businessName: 'StyleZone Fashion',
                businessDescription: 'Trendy clothing and accessories',
                isApproved: true,
                commission: 12,
                rating: {
                    average: 4.7,
                    count: 85
                }
            }
        });

        const vendor3 = await User.create({
            name: 'Home Essentials',
            email: 'homestore@example.com',
            password: 'vendor123',
            role: 'vendor',
            phone: '+1234567893',
            isActive: true,
            vendorInfo: {
                businessName: 'CozyHome Store',
                businessDescription: 'Quality home and garden products',
                isApproved: true,
                commission: 8,
                rating: {
                    average: 4.3,
                    count: 65
                }
            }
        });

        // Regular Users
        const user1 = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'user123',
            role: 'user',
            phone: '+1234567894',
            isActive: true
        });

        const user2 = await User.create({
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: 'user123',
            role: 'user',
            phone: '+1234567895',
            isActive: true
        });

        console.log('Users created successfully!');

        // Create Products
        console.log('Creating products...');

        const products = [
            // Tech Products
            {
                vendor: vendor1._id,
                name: 'Premium Wireless Headphones',
                description: 'Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation, 30-hour battery life, and premium comfort padding.',
                price: 199.99,
                comparePrice: 249.99,
                category: 'Electronics',
                subcategory: 'Audio',
                images: [
                    { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Headphones front view' },
                    { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500', alt: 'Headphones side view' }
                ],
                stock: 50,
                tags: ['wireless', 'audio', 'premium', 'noise-cancelling'],
                specifications: [
                    { key: 'Brand', value: 'TechWorld' },
                    { key: 'Battery Life', value: '30 hours' },
                    { key: 'Connectivity', value: 'Bluetooth 5.0' },
                    { key: 'Weight', value: '250g' }
                ],
                rating: { average: 4.6, count: 45 },
                isFeatured: true,
                shippingInfo: { weight: 0.3, freeShipping: true }
            },
            {
                vendor: vendor1._id,
                name: 'Smart Watch Pro',
                description: 'Stay connected and track your fitness with our advanced smartwatch. Features include heart rate monitoring, GPS, and 7-day battery life.',
                price: 299.99,
                category: 'Electronics',
                subcategory: 'Wearables',
                images: [
                    { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', alt: 'Smart Watch' }
                ],
                stock: 35,
                tags: ['smartwatch', 'fitness', 'wearable'],
                specifications: [
                    { key: 'Display', value: '1.4" AMOLED' },
                    { key: 'Battery', value: '7 days' },
                    { key: 'Water Resistance', value: '5ATM' }
                ],
                rating: { average: 4.4, count: 32 },
                isFeatured: true,
                shippingInfo: { weight: 0.1, freeShipping: true }
            },
            {
                vendor: vendor1._id,
                name: 'Wireless Bluetooth Speaker',
                description: '360° sound with deep bass. Waterproof design perfect for outdoor adventures. 12-hour battery life.',
                price: 79.99,
                comparePrice: 99.99,
                category: 'Electronics',
                images: [
                    { url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', alt: 'Bluetooth Speaker' }
                ],
                stock: 75,
                tags: ['speaker', 'bluetooth', 'waterproof'],
                rating: { average: 4.5, count: 68 },
                shippingInfo: { weight: 0.5, freeShipping: false, shippingCost: 5 }
            },
            {
                vendor: vendor1._id,
                name: 'USB-C Fast Charging Cable 6ft',
                description: 'Durable braided charging cable with fast charging support. Compatible with all USB-C devices.',
                price: 14.99,
                category: 'Electronics',
                images: [
                    { url: 'https://images.unsplash.com/photo-1585861358183-6b5e39e0f331?w=500', alt: 'USB Cable' }
                ],
                stock: 200,
                tags: ['cable', 'usb-c', 'charging'],
                rating: { average: 4.7, count: 156 },
                shippingInfo: { weight: 0.05, freeShipping: false, shippingCost: 3 }
            },

            // Fashion Products
            {
                vendor: vendor2._id,
                name: 'Classic Denim Jacket',
                description: 'Timeless denim jacket with a modern fit. Made from premium quality denim with reinforced stitching. Perfect for layering.',
                price: 89.99,
                category: 'Clothing',
                subcategory: 'Outerwear',
                images: [
                    { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', alt: 'Denim Jacket' }
                ],
                stock: 45,
                tags: ['denim', 'jacket', 'casual', 'unisex'],
                specifications: [
                    { key: 'Material', value: '100% Cotton Denim' },
                    { key: 'Fit', value: 'Regular' },
                    { key: 'Care', value: 'Machine Wash' }
                ],
                rating: { average: 4.6, count: 38 },
                isFeatured: true,
                shippingInfo: { weight: 0.7, freeShipping: true }
            },
            {
                vendor: vendor2._id,
                name: 'Premium Leather Handbag',
                description: 'Elegant genuine leather handbag with spacious compartments. Features gold-tone hardware and adjustable strap.',
                price: 149.99,
                comparePrice: 199.99,
                category: 'Clothing',
                subcategory: 'Accessories',
                images: [
                    { url: 'https://images.unsplash.com/photo-1564422170194-896b89110ef8?w=500', alt: 'Leather Handbag' }
                ],
                stock: 28,
                tags: ['handbag', 'leather', 'luxury', 'accessories'],
                rating: { average: 4.8, count: 42 },
                isFeatured: true,
                shippingInfo: { weight: 0.8, freeShipping: true }
            },
            {
                vendor: vendor2._id,
                name: 'Summer Floral Dress',
                description: 'Lightweight floral print dress perfect for summer. Breathable fabric with a flattering A-line silhouette.',
                price: 59.99,
                category: 'Clothing',
                images: [
                    { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', alt: 'Summer Dress' }
                ],
                stock: 55,
                tags: ['dress', 'summer', 'floral', 'women'],
                rating: { average: 4.5, count: 29 },
                shippingInfo: { weight: 0.3, freeShipping: false, shippingCost: 5 }
            },

            // Home Products
            {
                vendor: vendor3._id,
                name: 'Ceramic Plant Pot Set (3 pieces)',
                description: 'Beautiful set of 3 ceramic plant pots in different sizes. Modern design with drainage holes. Perfect for indoor plants.',
                price: 39.99,
                category: 'Home & Garden',
                subcategory: 'Decor',
                images: [
                    { url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500', alt: 'Plant Pots' }
                ],
                stock: 40,
                tags: ['planters', 'ceramic', 'home-decor', 'indoor'],
                rating: { average: 4.4, count: 25 },
                shippingInfo: { weight: 2, freeShipping: false, shippingCost: 8 }
            },
            {
                vendor: vendor3._id,
                name: 'Luxury Throw Blanket',
                description: 'Ultra-soft chenille throw blanket. Oversized design perfect for couches and beds. Available in multiple colors.',
                price: 49.99,
                category: 'Home & Garden',
                subcategory: 'Textiles',
                images: [
                    { url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500', alt: 'Throw Blanket' }
                ],
                stock: 60,
                tags: ['blanket', 'cozy', 'home', 'bedroom'],
                rating: { average: 4.7, count: 51 },
                isFeatured: true,
                shippingInfo: { weight: 1.2, freeShipping: true }
            },
            {
                vendor: vendor3._id,
                name: 'LED Desk Lamp with USB Port',
                description: 'Modern LED desk lamp with adjustable brightness and color temperature. Built-in USB charging port. Energy efficient.',
                price: 34.99,
                category: 'Home & Garden',
                images: [
                    { url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', alt: 'Desk Lamp' }
                ],
                stock: 85,
                tags: ['lamp', 'led', 'desk', 'lighting'],
                rating: { average: 4.6, count: 73 },
                shippingInfo: { weight: 0.6, freeShipping: false, shippingCost: 6 }
            },
            {
                vendor: vendor3._id,
                name: 'Stainless Steel Kitchen Knife Set',
                description: 'Professional 5-piece knife set with ergonomic handles. Includes chef knife, bread knife, utility knife, paring knife, and sharpener.',
                price: 79.99,
                category: 'Home & Garden',
                subcategory: 'Kitchen',
                images: [
                    { url: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500', alt: 'Knife Set' }
                ],
                stock: 32,
                tags: ['kitchen', 'knives', 'cooking', 'professional'],
                rating: { average: 4.8, count: 44 },
                isFeatured: true,
                shippingInfo: { weight: 1.5, freeShipping: true }
            }
        ];

        await Product.insertMany(products);

        console.log('Products created successfully!');
        console.log('\n========================================');
        console.log('SEED DATA COMPLETED SUCCESSFULLY!');
        console.log('========================================');
        console.log('\nTest Accounts Created:');
        console.log('--------------------');
        console.log('Admin:');
        console.log('  Email: admin@example.com');
        console.log('  Password: admin123');
        console.log('\nVendors:');
        console.log('  Email: techstore@example.com');
        console.log('  Password: vendor123');
        console.log('  Email: fashionhub@example.com');
        console.log('  Password: vendor123');
        console.log('  Email: homestore@example.com');
        console.log('  Password: vendor123');
        console.log('\nUsers:');
        console.log('  Email: john@example.com');
        console.log('  Password: user123');
        console.log('  Email: jane@example.com');
        console.log('  Password: user123');
        console.log('\nTotal Products Created: ' + products.length);
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();