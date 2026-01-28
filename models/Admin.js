import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        default: 'admin'
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

// Since user requested plain text, we remove hashing and match methods

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
