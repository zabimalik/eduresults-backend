import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        default: 'admin@gmail.com'
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

// Storing passwords in plain text as requested by user
const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
