const Task = require('../models/Task');

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, reminderTime } = req.body;
    
    // Validate required fields
    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    // Validate: dueDate must not be in the past
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // reset to start of today
      const selectedDate = new Date(dueDate);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return res.status(400).json({ message: 'Past dates are not allowed for due date.' });
      }
    }

    // Validate: reminderTime must not be in the past
    if (reminderTime) {
      const now = new Date();
      const selectedReminder = new Date(reminderTime);
      if (selectedReminder < now) {
        return res.status(400).json({ message: 'Past times are not allowed for reminder time.' });
      }
    }

    const newTask = new Task({
      title,
      description,
      priority,
      dueDate,
      reminderTime,
      userId: req.userId
    });

    const task = await newTask.save();
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all tasks for logged in user (with filter/sort)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, sort } = req.query;

    let query = { userId: req.userId };

    // Apply filters if provided
    if (status) query.status = status;
    if (priority) query.priority = priority;

    let mongoQuery = Task.find(query);

    // Default sort by createdAt desc if no sort is provided,
    // otherwise sort by dueDate or whatever the client passes.
    if (sort === 'dueDate') {
      mongoQuery = mongoQuery.sort({ dueDate: 1 });
    } else {
      mongoQuery = mongoQuery.sort({ createdAt: -1 });
    }

    const tasks = await mongoQuery;
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Make sure user owns task
    if (task.userId.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Make sure user owns task
    if (task.userId.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
