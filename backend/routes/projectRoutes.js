const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, getMemberProgress, updateProject, deleteProject, addMember } = require('../controllers/projectController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(protect, admin, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, admin, updateProject)
  .delete(protect, admin, deleteProject);

router.route('/:id/members')
  .post(protect, admin, addMember);

router.route('/:projectId/member/:memberId/progress')
  .get(protect, getMemberProgress);

module.exports = router;
