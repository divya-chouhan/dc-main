const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('./models/Project');
const User = require('./models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const project = await Project.findOne();
        if (!project) {
            console.log('No project found');
            process.exit();
        }

        console.log('--- PROJECT DATA ---');
        console.log('Name:', project.name);
        console.log('ID:', project._id);
        console.log('Members:', project.members);
        console.log('Created By:', project.createdBy);

        const users = await User.find({}, 'name email _id role');
        console.log('\n--- USERS IN DB ---');
        users.forEach(u => {
            console.log(`- ${u.name} (${u.role}): ${u._id} [${u.email}]`);
        });

        process.exit();
    } catch (err) {
        console.error('DB Check Failed:', err);
        process.exit(1);
    }
}

check();
