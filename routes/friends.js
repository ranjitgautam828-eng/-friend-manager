const express = require('express');
const router = express.Router();
const Friend = require('../models/Friend');
const authenticateToken = require('../middleware/auth');

// Apply authentication middleware to all friend routes
router.use(authenticateToken);

// Helper function to process hobbies from comma-separated string
const processHobbies = (hobbiesInput) => {
    if (!hobbiesInput) return [];
    if (Array.isArray(hobbiesInput)) return hobbiesInput;
    return hobbiesInput.split(',').map(hobby => hobby.trim()).filter(hobby => hobby);
};

// GET /api/friends - Get all friends for current user
router.get('/', async (req, res) => {
    try {
        const userEmail = req.user.email;
        const friends = await Friend.find({ createdBy: userEmail }).sort({ createdAt: -1 });
        res.json(friends);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ message: 'Error fetching friends', error: error.message });
    }
});

// GET /api/friends/:id - Get single friend by ID
router.get('/:id', async (req, res) => {
    try {
        const userEmail = req.user.email;
        const friend = await Friend.findOne({ 
            _id: req.params.id,
            createdBy: userEmail 
        });

        if (!friend) {
            return res.status(404).json({ message: 'Friend not found' });
        }

        res.json(friend);
    } catch (error) {
        console.error('Error fetching friend:', error);
        res.status(500).json({ message: 'Error fetching friend', error: error.message });
    }
});

// POST /api/friends - Create a new friend
router.post('/', async (req, res) => {
    try {
        const { name, age, hobbies, contactEmail, contactPhone } = req.body;
        const userEmail = req.user.email;

        // Validate required fields
        if (!name || !age || !contactEmail || !contactPhone) {
            return res.status(400).json({ 
                message: 'Name, age, contact email, and contact phone are required' 
            });
        }

        // Process hobbies from comma-separated string
        const hobbiesArray = processHobbies(hobbies);

        // Create new friend
        const friend = new Friend({
            name,
            age: parseInt(age),
            hobbies: hobbiesArray,
            contact: {
                email: contactEmail,
                phone: contactPhone
            },
            createdBy: userEmail
        });

        await friend.save();
        res.status(201).json(friend);
    } catch (error) {
        console.error('Error creating friend:', error);
        res.status(500).json({ message: 'Error creating friend', error: error.message });
    }
});

// PUT /api/friends/:id - Update a friend (full update)
router.put('/:id', async (req, res) => {
    try {
        const { name, age, hobbies, contactEmail, contactPhone } = req.body;
        const userEmail = req.user.email;

        // Check if friend exists and belongs to user
        const existingFriend = await Friend.findOne({ 
            _id: req.params.id,
            createdBy: userEmail 
        });

        if (!existingFriend) {
            return res.status(404).json({ message: 'Friend not found or access denied' });
        }

        // Process hobbies from comma-separated string
        const hobbiesArray = processHobbies(hobbies);

        // Update friend
        const updatedFriend = await Friend.findByIdAndUpdate(
            req.params.id,
            {
                name,
                age: parseInt(age),
                hobbies: hobbiesArray,
                contact: {
                    email: contactEmail,
                    phone: contactPhone
                },
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        res.json(updatedFriend);
    } catch (error) {
        console.error('Error updating friend:', error);
        res.status(500).json({ message: 'Error updating friend', error: error.message });
    }
});

// PATCH /api/friends/:id - Partial update a friend
router.patch('/:id', async (req, res) => {
    try {
        const userEmail = req.user.email;
        const updates = req.body;

        // Check if friend exists and belongs to user
        const friend = await Friend.findOne({ 
            _id: req.params.id,
            createdBy: userEmail 
        });

        if (!friend) {
            return res.status(404).json({ message: 'Friend not found or access denied' });
        }

        // Handle nested contact object update
        if (updates.contactEmail || updates.contactPhone) {
            friend.contact = {
                email: updates.contactEmail || friend.contact.email,
                phone: updates.contactPhone || friend.contact.phone
            };
        }

        // Handle hobbies update (if provided as comma-separated string)
        if (updates.hobbies) {
            friend.hobbies = processHobbies(updates.hobbies);
        }

        // Handle other fields
        if (updates.name) friend.name = updates.name;
        if (updates.age) friend.age = parseInt(updates.age);

        friend.updatedAt = Date.now();
        await friend.save();

        res.json(friend);
    } catch (error) {
        console.error('Error updating friend:', error);
        res.status(500).json({ message: 'Error updating friend', error: error.message });
    }
});

// DELETE /api/friends/:id - Delete a friend
router.delete('/:id', async (req, res) => {
    try {
        const userEmail = req.user.email;

        const friend = await Friend.findOneAndDelete({ 
            _id: req.params.id,
            createdBy: userEmail 
        });

        if (!friend) {
            return res.status(404).json({ message: 'Friend not found or access denied' });
        }

        res.json({ message: 'Friend deleted successfully', friend });
    } catch (error) {
        console.error('Error deleting friend:', error);
        res.status(500).json({ message: 'Error deleting friend', error: error.message });
    }
});

module.exports = router;