import userModel from "../models/userModel.js"


// add products to user cart
const addToCart = async (req,res) => {
    try {
        
        const { userId, itemId, size } = req.body

        console.log('addToCart request:', { userId, itemId, size });

        // Check if userId is valid (not admin user)
        if (!userId || userId.startsWith('admin_')) {
            console.log('Invalid or admin userId for cart operations:', userId);
            return res.json({ success: false, message: "Invalid user for cart operations" });
        }

        const userData = await userModel.findById(userId)
        
        if (!userData) {
            console.log('User not found:', userId);
            return res.json({ success: false, message: "User not found" });
        }
        
        let cartData = userData.cartData || {};

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1
            }
            else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate(userId, {cartData})

        res.json({ success: true, message: "Added To Cart" })

    } catch (error) {
        console.log('Error in addToCart:', error)
        res.json({ success: false, message: error.message })
    }
}

// update user cart
const updateCart = async (req,res) => {
    try {
        
        const { userId ,itemId, size, quantity } = req.body

        console.log('updateCart request:', { userId, itemId, size, quantity });

        // Check if userId is valid (not admin user)
        if (!userId || userId.startsWith('admin_')) {
            console.log('Invalid or admin userId for cart operations:', userId);
            return res.json({ success: false, message: "Invalid user for cart operations" });
        }

        const userData = await userModel.findById(userId)
        
        if (!userData) {
            console.log('User not found:', userId);
            return res.json({ success: false, message: "User not found" });
        }
        
        let cartData = userData.cartData || {};

        cartData[itemId][size] = quantity

        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log('Error in updateCart:', error)
        res.json({ success: false, message: error.message })
    }
}


// get user cart data
const getUserCart = async (req,res) => {

    try {
        
        const { userId } = req.body
        
        console.log('getUserCart request:', { userId });

        // Check if userId is valid (not admin user)
        if (!userId || userId.startsWith('admin_')) {
            console.log('Invalid or admin userId for cart operations:', userId);
            return res.json({ success: false, message: "Invalid user for cart operations" });
        }

        const userData = await userModel.findById(userId)
        
        if (!userData) {
            console.log('User not found:', userId);
            return res.json({ success: false, message: "User not found" });
        }
        
        let cartData = userData.cartData || {};

        res.json({ success: true, cartData })

    } catch (error) {
        console.log('Error in getUserCart:', error)
        res.json({ success: false, message: error.message })
    }

}

export { addToCart, updateCart, getUserCart }