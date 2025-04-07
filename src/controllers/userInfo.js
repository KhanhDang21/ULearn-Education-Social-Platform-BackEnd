const UserInfo = require('../models/userInfo');

exports.postUserInfo = async (req, res) => {
    const {name, bio, university, imageId} = req.body;
    try{
        const newUserInfo = new UserInfo({
            name,
            bio, 
            university,
            imageId
        });

        await newUserInfo.save();

        res.status(201).json({
            message: "UserInfo saved",
            data: newUserInfo
        })
    }
    catch (error){
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.getUserInfo = async (req, res) => {
    try{
        const userInfor = await UserInfo.findById(req.params.id);

        if (!userInfor) {
            return res.status(404).send('Not found');
        }
        
        res.json({
            message: "Get userInfo successfully",
            data: userInfor
        })
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
}

exports.updateUserInfo = async (req, res) => {
    try{
        const updatedUserInfo = await UserInfo.findByIdAndUpdate(
            req.params.id,
            {
                name: req.name,
                bio: req.bio, 
                university: req.university,
                imageId: req.ImageId
            },
            { new: true }
        );

        if (!updatedUserInfo) {
            return res.status(404).json({ error: 'Not found UserInfo' });
        }
        res.json({
            message: 'Update UserInfo successfully',
            data: updatedUserInfo
        });
    }
    catch (error){
        console.error('Error:', error);
    }
}

exports.deleteUserInfo = async (req, res) => {
    try{
        const UserInfo = UserInfo.findByIdAndDelete(req.params.id);

        if (!UserInfo) {
            return res.status(404).json({ 
                message: 'Not found'
            });
        }

        res.json({ 
            message: 'Deleted UserInfo successfully', 
        });
    }
    catch (error){
        console.error('Error:', error);
    }
}