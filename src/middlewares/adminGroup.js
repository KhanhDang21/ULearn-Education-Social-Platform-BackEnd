const Group = require('../models/group');

exports.isAdmin = async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found' });

  if (!group.admins.includes(req.user.userId)) {
    return res.status(403).json({ message: 'You are not an admin of this group' });
  }

  req.group = group;
  next();
}
