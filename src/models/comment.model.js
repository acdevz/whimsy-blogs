import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }
}, { timestamps: true,}
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
