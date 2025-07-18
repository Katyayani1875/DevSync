// backend/controllers/roomController.js
const asyncHandler = require('express-async-handler');
const short = require('short-uuid');
const Room = require('../models/roomModel');

// @desc    Create a new collaboration room
// @route   POST /api/rooms
// @access  Private
const createRoom = asyncHandler(async (req, res) => {
    const roomId = short.generate(); // Generate a unique, short, URL-friendly ID
    
    const newRoom = await Room.create({
        roomId,
        owner: req.user._id, // `req.user` is added by our authMiddleware
        participants: [req.user._id]
    });

    if (newRoom) {
        res.status(201).json({
            message: 'Room created successfully',
            room: newRoom
        });
    } else {
        res.status(400);
        throw new Error('Could not create room');
    }
});

// @desc    Get room details by ID
// @route   GET /api/rooms/:roomId
// @access  Private
const getRoomById = asyncHandler(async (req, res) => {
    const room = await Room.findOne({ roomId: req.params.roomId }).populate('participants', 'name email');

    if (room) {
        // Check if the current user is a participant (for future permission checks)
        const isParticipant = room.participants.some(p => p._id.equals(req.user._id));

        if (!isParticipant) {
             // For now we add them, later this can be an invite system
            room.participants.push(req.user._id);
            await room.save();
        }

        res.json(room);
    } else {
        res.status(404);
        throw new Error('Room not found');
    }
});


module.exports = { createRoom, getRoomById };