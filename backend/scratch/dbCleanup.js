const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Project = require('../models/Project');
const Task = require('../models/Task');

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for cleanup...');

    const taskRes = await Task.deleteMany({});
    console.log(`Deleted ${taskRes.deletedCount} tasks.`);

    const projectRes = await Project.deleteMany({});
    console.log(`Deleted ${projectRes.deletedCount} projects.`);

    console.log('Database Reset Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanup();
