const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

exports.createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    // Ensure creator is in members
    const finalMembers = members || [];
    if (!finalMembers.includes(req.user._id)) {
        finalMembers.push(req.user._id);
    }

    const project = await Project.create({
      name,
      description,
      members: finalMembers,
      createdBy: req.user._id
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find().populate('members', 'name email').populate('createdBy', 'name');
    } else {
      projects = await Project.find({ members: req.user._id }).populate('members', 'name email').populate('createdBy', 'name');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email').populate('createdBy', 'name');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Check if member is part of project or admin
    if (req.user.role !== 'Admin' && !project.members.some(m => m._id.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to view this project' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMemberProgress = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    console.log(`FETCHING PROGRESS: Project ${projectId}, Member ${memberId}`);

    const project = await Project.findById(projectId);
    if (!project) {
        console.error('PROGRESS ERROR: Project Not Found');
        return res.status(404).json({ message: 'Project not found' });
    }

    // Robust check for member/creator
    const isMember = project.members.some(id => id.toString() === memberId);
    const isCreator = project.createdBy.toString() === memberId;
    
    console.log(`AUTH CHECK: isMember=${isMember}, isCreator=${isCreator}`);

    if (!isMember && !isCreator) {
        console.error('PROGRESS ERROR: User not in project');
        return res.status(400).json({ message: 'User is not a member or creator of this project' });
    }

    // Role-based access check: 
    // Allow if user is an Admin OR is a member of THIS project
    const requesterIsMember = project.members.some(id => id.toString() === req.user._id.toString());
    const requesterIsCreator = project.createdBy.toString() === req.user._id.toString();

    if (req.user.role !== 'Admin' && !requesterIsMember && !requesterIsCreator) {
        console.error('PROGRESS ERROR: Requester is not part of this project');
        return res.status(403).json({ message: 'Not authorized to view this project progress' });
    }

    const tasks = await Task.find({ project: projectId, assignedTo: memberId });
    const now = new Date();

    const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'Done').length,
        pendingTasks: tasks.filter(t => t.status !== 'Done').length,
        overdueTasks: tasks.filter(t => t.status !== 'Done' && t.dueDate && new Date(t.dueDate) < now).length,
        progressPercentage: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100) : 0,
        tasks: tasks
    };

    const member = await User.findById(memberId).select('name email avatar role');

    res.json({
        member,
        ...stats,
        recentActivity: tasks.slice(0, 5) // Fallback activity
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await Project.findByIdAndDelete(req.params.id);
    // optionally delete all tasks for this project
    await Task.deleteMany({ project: req.params.id });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User with this email not found' });

    if (project.members.includes(user._id)) {
        return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(user._id);
    await project.save();
    
    res.json(await Project.findById(req.params.id).populate('members', 'name email').populate('createdBy', 'name'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
