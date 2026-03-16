import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import productModel from './models/productModel.js';
import 'dotenv/config';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

// Sample product data with placeholder images
const sampleProducts = [
    {
        name: "Women Round Neck Cotton Top",
        description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
        price: 100,
        category: "Women",
        subCategory: "Topwear",
        sizes: ["S", "M", "L"],
        bestseller: true,
        image: ["https://res.cloudinary.com/daowawj5g/image/upload/v1716634345/sample1.jpg"]
    },
    {
        name: "Men Round Neck Pure Cotton T-shirt",
        description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
        price: 200,
        category: "Men",
        subCategory: "Topwear",
        sizes: ["M", "L", "XL"],
        bestseller: true,
        image: ["https://res.cloudinary.com/daowawj5g/image/upload/v1716621345/sample2.jpg"]
    },
    {
        name: "Girls Round Neck Cotton Top",
        description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
        price: 220,
        category: "Kids",
        subCategory: "Topwear",
        sizes: ["S", "L", "XL"],
        bestseller: true,
        image: ["https://res.cloudinary.com/daowawj5g/image/upload/v1716234545/sample3.jpg"]
    },
    {
        name: "Men Tapered Fit Flat-Front Trousers",
        description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
        price: 190,
        category: "Men",
        subCategory: "Bottomwear",
        sizes: ["S", "L", "XL"],
        bestseller: false,
        image: ["https://res.cloudinary.com/daowawj5g/image/upload/v1716621542/sample4.jpg"]
    },
    {
        name: "Women Zip-Front Relaxed Fit Jacket",
        description: "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.",
        price: 170,
        category: "Women",
        subCategory: "Winterwear",
        sizes: ["S", "M", "L", "XL"],
        bestseller: false,
        image: ["https://res.cloudinary.com/daowawj5g/image/upload/v1716634345/sample5.jpg"]
    }
];

const addSampleProducts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI + '/e-commerce');
        console.log('Connected to MongoDB');

        // Clear existing products
        await productModel.deleteMany({});
        console.log('Cleared existing products');

        // Add sample products
        for (const product of sampleProducts) {
            const newProduct = new productModel({
                ...product,
                date: Date.now()
            });
            await newProduct.save();
            console.log(`Added product: ${product.name}`);
        }

        console.log('Sample products added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error adding products:', error);
        process.exit(1);
    }
};

addSampleProducts();
