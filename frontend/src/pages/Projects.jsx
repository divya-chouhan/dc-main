import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects, createProject, deleteProject } from '../store/projectSlice';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiFolder, FiUsers, FiTrash2 } from 'react-icons/fi';

const Projects = () => {
  const { user, token } = useSelector((state) => state.auth);
  const { projects, isLoading } = useSelector((state) => state.project);
  const dispatch = useDispatch();
  
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (token) dispatch(fetchProjects());
  }, [token, dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(createProject({ name, description }));
    if (createProject.fulfilled.match(resultAction)) {
      setShowModal(false);
      setName('');
      setDescription('');
    }
  };

  const handleDelete = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will also be removed.')) {
      dispatch(deleteProject(projectId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold textMain">Projects</h1>
          <p className="text-sm text-textMuted">Manage your team projects and workspaces.</p>
        </div>
        {user?.role === 'Admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <FiPlus /> New Project
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-textMuted">Loading projects...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((p, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              key={p._id}
              className="relative group"
            >
              <Link to={`/projects/${p._id}`}>
                <div className="glass p-6 rounded-2xl h-full border border-textMain/10 hover:border-primary/50 transition-colors flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-surface/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FiFolder className="text-2xl text-primary" />
                    </div>
                    {user?.role === 'Admin' && (
                      <button 
                        onClick={(e) => handleDelete(e, p._id)}
                        className="p-2 text-textMuted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        title="Delete Project"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 textMain">{p.name}</h3>
                  <p className="text-sm text-textMuted flex-1">{p.description}</p>
                  
                  <div className="mt-6 pt-4 border-t border-textMain/10 flex items-center justify-between text-sm text-textMuted">
                    <span className="flex items-center gap-1"><FiUsers /> {p.members?.length || 0} Members</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          
          {projects.length === 0 && (
            <div className="col-span-full py-12 text-center glass rounded-2xl border-dashed">
              <FiFolder className="text-4xl text-textMuted mx-auto mb-3" />
              <p className="text-textMuted">No projects found.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-textMuted mb-1">Project Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface border border-textMain/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm text-textMuted mb-1">Description</label>
                <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-surface border border-textMain/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-primary"></textarea>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-textMuted hover:bg-surface">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90">Create Project</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Projects;
