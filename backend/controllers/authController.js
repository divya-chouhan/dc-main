const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, adminCode } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    let finalRole = 'Member';
    if (role === 'Admin') {
      if (adminCode === process.env.ADMIN_SECRET_KEY) {
        finalRole = 'Admin';
      } else {
        return res.status(401).json({ message: 'Invalid Admin Secret Key' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword, role: finalRole });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Find all projects created by this user
    const userProjects = await Project.find({ createdBy: userId });
    const projectIds = userProjects.map(p => p._id);

    // 2. Delete all tasks associated with those projects
    await Task.deleteMany({ project: { $in: projectIds } });

    // 3. Delete the projects themselves
    await Project.deleteMany({ createdBy: userId });

    // 4. Remove this user from the 'members' list of ANY other projects they joined
    await Project.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // 5. Delete the user
    await User.deleteOne({ _id: userId });

    res.json({ message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: error.message });
  }
};
exports.upgradeToAdmin = async (req, res) => {
  try {
    const { adminCode } = req.body;
    if (adminCode !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ message: 'Invalid Admin Secret Key' });
    }

    const user = await User.findById(req.user._id);
    user.role = 'Admin';
    await user.save();

    res.json({
        _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
