// backend/models/roomModel.js
const mongoose = require('mongoose');

// We start with a simple file structure. This can be evolved into a nested tree.
const fileSchema = new mongoose.Schema({
    name: { type: String, required: true, default: 'main.js' },
    content: { type: String, default: '// Start coding here!' },
    language: { type: String, default: 'javascript' },
});

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  files: { type: [fileSchema], default: () => ([{}]) }, // Create one default file
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;