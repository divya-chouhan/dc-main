import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects, fetchDashboardStats } from '../store/projectSlice';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiAlertCircle, FiFolder } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const { projects, stats, isLoading } = useSelector((state) => state.project);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      dispatch(fetchProjects());
      dispatch(fetchDashboardStats());
    }
  }, [token, dispatch]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass p-5 md:p-8 rounded-2xl border border-textMain/10 bg-gradient-to-br from-surface to-surface/50">
        <h1 className="text-2xl md:text-3xl font-bold textMain mb-2">
          {stats.totalProjects === 0 ? `Welcome to TaskFlow, ${user?.name.split(' ')[0]}! 🚀` : `Welcome back, ${user?.name.split(' ')[0]}! 👋`}
        </h1>
        <p className="text-sm md:text-base text-textMuted">
          {stats.totalProjects === 0 ? "Let's get started by creating your first project." : "Here is what's happening with your projects today."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Projects', value: stats.totalProjects, icon: FiFolder, color: 'text-primary' },
          { title: 'Tasks Completed', value: stats.tasksCompleted, icon: FiCheckCircle, color: 'text-success' },
          { title: 'In Progress', value: stats.tasksInProgress, icon: FiClock, color: 'text-warning' },
          { title: 'Overdue', value: stats.tasksOverdue, icon: FiAlertCircle, color: 'text-danger' },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-5 md:p-6 hover:bg-surface/90 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs md:text-sm text-textMuted uppercase tracking-wider font-semibold">{stat.title}</p>
              <div className={`p-2 rounded-lg bg-surface/50 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold textMain">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Recent Projects</h2>
          <Link to="/projects" className="text-primary hover:underline text-sm">View All</Link>
        </div>
        {isLoading ? (
          <p className="text-textMuted">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-textMuted">No projects found. Create one to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.slice(0, 3).map(p => (
              <Link to={`/projects/${p._id}`} key={p._id}>
                <div className="glass p-5 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{p.name}</h3>
                  <p className="text-sm text-textMuted line-clamp-2">{p.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-textMuted">
                    <span>{p.members?.length || 0} Members</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
