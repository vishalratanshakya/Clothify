import { products } from '../frontend/src/assets/assets.js';
import productModel from './models/productModel.js';
import 'dotenv/config';

const addProductsToDB = async () => {
    try {
        // Clear existing products
        await productModel.deleteMany({});
        console.log('Cleared existing products');

        // Add all products from assets.js
        for (const product of products) {
            const productData = {
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                subCategory: product.subCategory,
                bestseller: product.bestseller,
                sizes: product.sizes,
                image: product.image, // This will be the imported image paths
                date: product.date
            };

            const newProduct = new productModel(productData);
            await newProduct.save();
            console.log(`Added product: ${product.name}`);
        }

        console.log('All products added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error adding products:', error);
        process.exit(1);
    }
};

addProductsToDB();
