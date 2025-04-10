const Post = require('../models/post');

exports.addPost = async (req, res) => {
    const { userId, imageId, content, comments, status } = req.body;

    try {
        const newPost = new Post({
            userId,
            imageId,
            content,
            comments,
            status
        })

        await newPost.save();

        res.status(201).json({
            message: "Post saved",
            data: newPost
        })
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).send('Not found');
        }

        res.json({
            message: "Get userInfo successfully",
            data: post
        })
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
}