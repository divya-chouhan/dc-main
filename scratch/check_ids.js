const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/priya/OneDrive/Desktop/Team Task Manager/backend/.env' });

const Project = require('./backend/models/Project');
const User = require('./backend/models/User');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const project = await Project.findOne();
    if (!project) {
        console.log('No project found');
        process.exit();
    }

    console.log('Project:', project.name, 'ID:', project._id);
    console.log('Members:', project.members);
    console.log('Created By:', project.createdBy);

    const users = await User.find({}, 'name email _id role');
    console.log('Users in DB:', users);

    process.exit();
}

check();
