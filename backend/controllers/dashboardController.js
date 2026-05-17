const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    
    let projects = [];
    if (role === 'Admin') {
      projects = await Project.find();
    } else {
      projects = await Project.find({ members: userId });
    }
    
    const projectIds = projects.map(p => p._id);
    
    let taskQuery = { project: { $in: projectIds } };
    // If not admin, maybe only stats for their assigned tasks, but usually dashboard shows project-level stats or personal stats. Let's show personal tasks for Member.
    if (role !== 'Admin') {
        taskQuery.assignedTo = userId;
    }

    const tasks = await Task.find(taskQuery);
    
    const now = new Date();
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;

    tasks.forEach(task => {
        if (task.status === 'Done') completed++;
        if (task.status === 'In Progress') inProgress++;
        if (task.status !== 'Done' && task.dueDate && new Date(task.dueDate) < now) {
            overdue++;
        }
    });

    res.json({
        totalProjects: projects.length,
        tasksCompleted: completed,
        tasksInProgress: inProgress,
        tasksOverdue: overdue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
