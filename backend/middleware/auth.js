import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {

    const { token } = req.headers;

    console.log('Auth middleware - Token present:', !!token);
    console.log('Auth middleware - JWT_SECRET present:', !!process.env.JWT_SECRET);

    if (!token) {
        console.log('Auth middleware - No token provided');
        return res.json({ success: false, message: 'Not Authorized Login Again' })
    }

    try {

        console.log('Auth middleware - Verifying token...');
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        console.log('Auth middleware - Token decoded:', { id: token_decode.id });
        
        // Set both req.user for profile routes and req.body.userId for cart routes
        req.user = { id: token_decode.id }
        req.body.userId = token_decode.id
        console.log('Auth middleware - user object added to request:', req.user);
        console.log('Auth middleware - userId added to request body:', req.body.userId);
        
        next()

    } catch (error) {
        console.log('Auth middleware - Token verification failed:', error.message);
        res.json({ success: false, message: error.message })
    }

}

export default authUser