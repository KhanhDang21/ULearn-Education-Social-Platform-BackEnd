const Group = require('../models/group');
const Post = require('../models/post');

exports.addGroup = async (req, res) => {
    const { name, description, imageId } = req.body;

    try {
        const newGroup = await Group.create({
            name,
            description,
            imageId,
            admins: [req.user.userId],
            members: [req.user.userId],
        })

        res.status(201).json({
            message: "Group saved",
            data: newGroup
        })
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.getGroup = async (req, res) => {
    try {
        const groups = await Group.find().populate('admins', 'email').populate('members', 'email');

        res.json(
            groups)
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.joinGroup = async (req, res) => {
    try {
        const group = await group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({
                message: 'Group not found'
            });
        }

        if (!group.members.includes(req.user.userId)) {
            group.members.push(req.user.userId);
            await group.save();
        }

        res.json({
            message: 'Joined group', group
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.leaveGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({
                message: 'Group not found'
            });
        }

        group.members = group.members.filter(member => member.toString() !== req.user.userId);
        await group.save();

        res.json({
            message: 'Left group'
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.addPost = async (req, res) => {
    try {
        const { content, imageId } = req.body;
        const groupId = req.params.id;

        const group = await Group.findById(groupId);
        if (!group){ 
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.members.includes(req.user.userId)) {
            return res.status(403).json({ message: 'You must be a group member to post' });
        }

        const post = await Post.create({
            userId: req.user.userId,
            groupId: groupId,
            content,
            imageId
        });

        res.status(201).json(post);
    } 
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.deleteGroup = async (req, res) => {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted' });
}
