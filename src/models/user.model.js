import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: [true, 'Username already exists'],
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    fullName :{
        type: String,
        required: true,
        index: true,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    profilePic: {
        type: String,
    },
    bio: {
        type: String,
    },
    subscription: {
        subscriptionType: {
            type: String,
            enum: ['free', 'premium'],
            default: 'free',
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date
        },
        trial: {
            type: Boolean,
            default: true,
        }
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    preferences: {
        notification: {
            type: Boolean,
            default: true,
        },
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light',
        },
    },
    socials: {
        facebook: {
            type: String,
        },
        twitter: {
            type: String,
        },
        linkedin: {
            type: String,
        },
        instagram: {
            type: String,
        },
    },
}, { timestamps: true })

const User = mongoose.model('User', userSchema) //singular name of the collection

userSchema.index({ username: 'text', fullName: 'text' });

export default User