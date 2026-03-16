import userModel from '../models/userModel.js';

// Get user profile data
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // This should come from auth middleware
        
        console.log('Fetching user profile for:', userId);
        
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        console.log('User profile found:', { 
            id: user._id, 
            email: user.email, 
            name: `${user.firstName} ${user.lastName}` 
        });
        
        res.json({ 
            success: true, 
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                street: user.street,
                city: user.city,
                state: user.state,
                zipcode: user.zipcode,
                country: user.country,
                image: user.image || null
            }
        });
        
    } catch (error) {
        console.log('Error fetching user profile:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get user profile by ID (for admin use)
const getUserProfileById = async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.json({ success: false, message: 'User ID is required' });
        }
        
        console.log('Fetching user profile by ID for admin:', userId);
        
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        console.log('User profile found:', { 
            id: user._id, 
            email: user.email, 
            name: `${user.firstName} ${user.lastName}` 
        });
        
        res.json({ 
            success: true, 
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                name: user.name, // Include original name field
                email: user.email,
                phone: user.phone,
                street: user.street,
                city: user.city,
                state: user.state,
                zipcode: user.zipcode,
                country: user.country,
                image: user.image || null
            }
        });
        
    } catch (error) {
        console.log('Error fetching user profile by ID:', error);
        res.json({ success: false, message: error.message });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, phone, street, city, state, zipcode, country } = req.body;
        
        console.log('Updating user profile for:', userId);
        
        const updateData = {
            firstName: firstName || '',
            lastName: lastName || '',
            phone: phone || '',
            street: street || '',
            city: city || '',
            state: state || '',
            zipcode: zipcode || '',
            country: country || ''
        };
        
        const updatedUser = await userModel.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        console.log('User profile updated successfully');
        
        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                phone: updatedUser.phone,
                street: updatedUser.street,
                city: updatedUser.city,
                state: updatedUser.state,
                zipcode: updatedUser.zipcode,
                country: updatedUser.country,
                image: updatedUser.image || null
            }
        });
        
    } catch (error) {
        console.log('Error updating user profile:', error);
        res.json({ success: false, message: error.message });
    }
};

export { getUserProfile, getUserProfileById, updateUserProfile };
