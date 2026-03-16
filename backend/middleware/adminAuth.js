import jwt from 'jsonwebtoken'

const adminAuth = async (req,res,next) => {
    try {
        const { token } = req.headers
        console.log('Admin auth - Token present:', !!token);
        
        if (!token) {
            console.log('Admin auth - No token provided');
            return res.json({success:false,message:"Not Authorized Login Again"})
        }
        
        const token_decode = jwt.verify(token,process.env.JWT_SECRET);
        console.log('Admin auth - Token decoded:', token_decode);
        
        // Check if token has admin ID format (new format) or matches old format
        const isAdminUser = token_decode.id && token_decode.id.startsWith('admin_');
        const isOldFormat = token_decode === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD;
        
        if (!isAdminUser && !isOldFormat) {
            console.log('Admin auth - Not an admin user');
            return res.json({success:false,message:"Not Authorized Login Again"})
        }
        
        console.log('Admin auth - Authentication successful');
        next()
    } catch (error) {
        console.log('Admin auth - Error:', error.message);
        res.json({ success: false, message: error.message })
    }
}

export default adminAuth