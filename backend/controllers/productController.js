import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// function for add product
const addProduct = async (req, res) => {
    try {
        console.log("=== ADD PRODUCT START ===");
        
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body
        console.log("Received form data:", { name, description, price, category, subCategory, sizes, bestseller });

        if (!name || !description || !price) {
            return res.json({ success: false, message: "Name, description, and price are required fields." })
        }

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)
        console.log("Images found:", images.length);

        if (images.length === 0) {
            return res.json({ success: false, message: "At least one image is required" })
        }

        console.log("Uploading images to Cloudinary...");
        console.log("Cloudinary config:", {
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY ? "Set" : "Not set",
            api_secret: process.env.CLOUDINARY_SECRET_KEY ? "Set" : "Not set"
        });
        
        let imagesUrl = [];
        
        try {
            // Try to upload to Cloudinary
            imagesUrl = await Promise.all(
                images.map(async (item, index) => {
                    try {
                        console.log(`Uploading image ${index + 1}:`, item.originalname);
                        let result = await cloudinary.uploader.upload(item.path, { 
                            resource_type: 'image'
                        });
                        console.log(`Image ${index + 1} uploaded successfully:`, result.secure_url);
                        return result.secure_url
                    } catch (uploadError) {
                        console.error(`Failed to upload image ${index + 1}:`, uploadError);
                        throw new Error(`Failed to upload image ${index + 1}: ${uploadError.message}`);
                    }
                })
            )
            console.log("All images uploaded successfully:", imagesUrl);
        } catch (cloudinaryError) {
            console.log("Cloudinary upload failed, using fallback images:", cloudinaryError.message);
            
            // Check if it's an authentication error
            if (cloudinaryError.message.includes('Invalid api_key') || 
                cloudinaryError.message.includes('authentication') ||
                cloudinaryError.message.includes('credentials')) {
                
                console.log(`
                ════════════════════════════════════════════════════════════════
                ⚠️  CLOUDINARY CONFIGURATION ERROR ⚠️
                
                Your Cloudinary credentials are invalid or missing.
                
                TO FIX THIS:
                1. Go to https://cloudinary.com and create a free account
                2. Get your credentials from the dashboard:
                   - Cloud name
                   - API Key
                   - API Secret
                3. Update your .env file with the correct credentials
                
                For now, using placeholder images instead...
                ════════════════════════════════════════════════════════════════
                `);
            }
            
            // Fallback to base64 encoded placeholder images for maximum reliability
            const placeholderImages = [
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMjAwQzEyNy45MDkgMjAwIDExMCAxNzIuMDkxIDExMCAxNTBDMTEwIDEyNy45MDkgMTI3LjkwOSAxMTAgMTUwIDExMEMxNzIuMDkxIDExMCAxOTAgMTI3LjkwOSAxOTAgMTUwQzE5MCAxNzIuMDkxIDE3Mi4wOTEgMjAwIDE1MCAyMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xNTAgMTYwQzEzOC45NTQgMTYwIDEzMCAxNTEuMDQ2IDEzMCAxNDBDMTMwIDEyOC45NTQgMTM4Ljk1NCAxMjAgMTUwIDEyMEMxNjEuMDQ2IDEyMCAxNzAgMTI4Ljk1NCAxNzAgMTQwQzE3MCAxNTEuMDQ2IDE2MS4wNDYgMTYwIDE1MCAxNjBaIiBmaWxsPSIjNjM2NkYxIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+UHJvZHVjdCAxPC90ZXh0Pgo8L3N2Zz4K",
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRTBFQkZGIi8+CjxwYXRoIGQ9Ik0xNTAgMjAwQzEyNy45MDkgMjAwIDExMCAxNzIuMDkxIDExMCAxNTBDMTEwIDEyNy45MDkgMTI3LjkwOSAxMTAgMTUwIDExMEMxNzIuMDkxIDExMCAxOTAgMTI3LjkwOSAxOTAgMTUwQzE5MCAxNzIuMDkxIDE3Mi4wOTEgMjAwIDE1MCAyMDBaIiBmaWxsPSIjODM4NEY4Ii8+CjxwYXRoIGQ9Ik0xNTAgMTYwQzEzOC45NTQgMTYwIDEzMCAxNTEuMDQ2IDEzMCAxNDBDMTMwIDEyOC45NTQgMTM4Ljk1NCAxMjAgMTUwIDEyMEMxNjEuMDQ2IDEyMCAxNzAgMTI4Ljk1NCAxNzAgMTQwQzE3MCAxNTEuMDQ2IDE2MS4wNDYgMTYwIDE1MCAxNjBaIiBmaWxsPSIjNjM2NkYxIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjODM4NEY4IiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+UHJvZHVjdCAyPC90ZXh0Pgo8L3N2Zz4K",
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjREVGNUNBIi8+CjxwYXRoIGQ9Ik0xNTAgMjAwQzEyNy45MDkgMjAwIDExMCAxNzIuMDkxIDExMCAxNTBDMTEwIDEyNy45MDkgMTI3LjkwOSAxMTAgMTUwIDExMEMxNzIuMDkxIDExMCAxOTAgMTI3LjkwOSAxOTAgMTUwQzE5MCAxNzIuMDkxIDE3Mi4wOTEgMjAwIDE1MCAyMDBaIiBmaWxsPSIjQjdDMkVBIi8+CjxwYXRoIGQ9Ik0xNTAgMTYwQzEzOC45NTQgMTYwIDEzMCAxNTEuMDQ2IDEzMCAxNDBDMTMwIDEyOC45NTQgMTM4Ljk1NCAxMjAgMTUwIDEyMEMxNjEuMDQ2IDEyMCAxNzAgMTI4Ljk1NCAxNzAgMTQwQzE3MCAxNTEuMDQ2IDE2MS4wNDYgMTYwIDE1MCAxNjBaIiBmaWxsPSIjNjM2NkYxIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjQjdDMkVBIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+UHJvZHVjdCAzPC90ZXh0Pgo8L3N2Zz4K",
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRkVGM0VGIi8+CjxwYXRoIGQ9Ik0xNTAgMjAwQzEyNy45MDkgMjAwIDExMCAxNzIuMDkxIDExMCAxNTBDMTEwIDEyNy45MDkgMTI3LjkwOSAxMTAgMTUwIDExMEMxNzIuMDkxIDExMCAxOTAgMTI3LjkwOSAxOTAgMTUwQzE5MCAxNzIuMDkxIDE3Mi4wOTEgMjAwIDE1MCAyMDBaIiBmaWxsPSIjQ0E4RDQ1Ii8+CjxwYXRoIGQ9Ik0xNTAgMTYwQzEzOC45NTQgMTYwIDEzMCAxNTEuMDQ2IDEzMCAxNDBDMTMwIDEyOC45NTQgMTM4Ljk1NCAxMjAgMTUwIDEyMEMxNjEuMDQ2IDEyMCAxNzAgMTI4Ljk1NCAxNzAgMTQwQzE3MCAxNTEuMDQ2IDE2MS4wNDYgMTYwIDE1MCAxNjBaIiBmaWxsPSIjNjM2NkYxIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjQ0E4RDQ1IiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+UHJvZHVjdCA0PC90ZXh0Pgo8L3N2Zz4K"
            ];
            
            imagesUrl = images.map((item, index) => placeholderImages[index % placeholderImages.length]);
            console.log("Using fallback base64 placeholder images:", imagesUrl);
        }

        // Parse sizes to ensure it's an array
        let parsedSizes;
        try {
            parsedSizes = JSON.parse(sizes);
            console.log("Parsed sizes:", parsedSizes);
        } catch (sizeError) {
            console.log("Error parsing sizes, using empty array:", sizeError);
            parsedSizes = [];
        }

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: parsedSizes,
            image: imagesUrl,
            date: Date.now()
        }

        console.log("Creating product with data:", productData);

        const product = new productModel(productData);
        console.log("Product model created:", product);

        await product.save()
        console.log("Product saved successfully to MongoDB. Product ID:", product._id);

        // Include a message about Cloudinary if fallback was used
        let message = "Product Added Successfully";
        if (imagesUrl[0].startsWith('data:image')) {
            message += " (using placeholder images - Cloudinary not configured)";
        } else {
            message += " (images uploaded to Cloudinary)";
        }

        console.log("=== ADD PRODUCT SUCCESS ===");
        res.json({ success: true, message, productId: product._id })

    } catch (error) {
        console.log("=== ADD PRODUCT ERROR ===");
        console.log("Error in addProduct:", error);
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        console.log("=== LIST PRODUCTS START ===");
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, removeProduct, singleProduct }