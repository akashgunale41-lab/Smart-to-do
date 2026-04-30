const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Get all users with task counts (Admin only)
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -resetToken -resetTokenExpiry');

    // For each user, count their completed and pending tasks
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const completedTasks = await Task.countDocuments({ userId: user._id, status: 'completed' });
        const pendingTasks   = await Task.countDocuments({ userId: user._id, status: 'pending' });
        return {
          ...user.toObject(),
          completedTasks,
          pendingTasks,
          totalTasks: completedTasks + pendingTasks,
        };
      })
    );

    res.status(200).json(usersWithStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all tasks (Admin only)
// @route   GET /api/admin/tasks
// @access  Admin
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get summary stats (Admin only)
// @route   GET /api/admin/stats
// @access  Admin
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });

    res.status(200).json({ totalUsers, totalTasks, completedTasks, pendingTasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
