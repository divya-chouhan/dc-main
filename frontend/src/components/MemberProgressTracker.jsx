import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  FiCheckCircle as CheckCircle2, FiClock as Clock, FiAlertCircle as AlertCircle, FiCalendar as Calendar, 
  FiFilter as Filter, FiMoreVertical as MoreVertical, FiTarget as Target, FiList as ListTodo
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { format, isPast, parseISO } from 'date-fns';
import { cn } from '../utils/cn';
import TaskDrawer from './TaskDrawer';

const COLORS = {
  Todo: '#94a3b8',
  'In Progress': '#3b82f6',
  Review: '#a855f7',
  Done: '#22c55e'
};

const MemberProgressTracker = () => {
  const { projectId, memberId } = useParams();
  const { token } = useSelector((state) => state.auth);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const baseUrl = import.meta.env.PROD 
          ? '/api' 
          : 'http://localhost:5000/api';
          
        const res = await axios.get(`${baseUrl}/projects/${projectId}/member/${memberId}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData({
          member: res.data.member || { name: 'Member', role: 'Project Member' },
          stats: res.data,
          tasks: res.data.tasks || [],
          activity: res.data.recentActivity || []
        });
        setLoading(false);
      } catch (err) {
        console.error('CRITICAL: Progress Fetch Failed', err);
        // Fallback for debugging - show the exact error if possible
        setData({
          member: { name: 'Error Loading', role: 'Please refresh' },
          stats: { totalTasks: 0, progressPercentage: 0 },
          tasks: [],
          activity: []
        });
        setLoading(false);
      }
    };
    if (token && projectId && memberId) fetchProgress();
  }, [projectId, memberId, token]);

  if (loading) return <div className="p-20 text-center text-primary text-2xl font-bold">Loading Progress...</div>;
  if (!data) return <div className="p-20 text-center text-danger text-2xl font-bold">Failed to load member data.</div>;

  const { member, stats, tasks } = data;
  const filteredTasks = tasks.filter(t => filterStatus === 'All' || t.status === filterStatus);

  const chartData = [
    { name: 'Todo', value: tasks.filter(t => t.status === 'Todo').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length },
    { name: 'Review', value: tasks.filter(t => t.status === 'Review').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'Done').length },
  ];

  const safeFormatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'No due date';
      return format(date, 'MMM dd, yyyy');
    } catch (e) {
      return 'No due date';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header Profile Section */}
      <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between shadow-xl gap-6 border border-textMain/10">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold border-2 border-primary shrink-0">
            {(member?.name || 'M').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold textMain truncate">{member?.name || 'Member'}</h1>
            <p className="text-textMuted truncate">{member?.role || 'Team Member'}</p>
          </div>
        </div>
        <div className="w-full sm:w-auto flex flex-col items-center sm:items-end">
          <p className="text-xs md:text-sm text-textMuted mb-2 uppercase tracking-wider font-semibold">Overall Completion</p>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-48 h-3 bg-surface rounded-full overflow-hidden border border-textMain/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats?.progressPercentage || 0}%` }}
                className="h-full bg-gradient-to-r from-primary to-secondary"
              />
            </div>
            <span className="font-bold text-lg md:text-xl text-primary">{stats?.progressPercentage || 0}%</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Tasks', value: stats?.totalTasks, icon: ListTodo, color: 'text-accent' },
          { title: 'Completed', value: stats?.completedTasks, icon: CheckCircle2, color: 'text-success' },
          { title: 'Pending', value: stats?.pendingTasks, icon: Clock, color: 'text-warning' },
          { title: 'Overdue', value: stats?.overdueTasks, icon: AlertCircle, color: 'text-danger' },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-5 flex items-center space-x-4 border border-textMain/10">
            <div className={cn("p-3 rounded-lg bg-surface/50 shrink-0", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-textMuted truncate">{stat.title}</p>
              <p className="text-2xl font-bold textMain">{stat.value || 0}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6 border border-textMain/10 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="text-primary" /> Assigned Tasks
              </h2>
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-surface border border-textMain/10 rounded-lg p-2 text-sm text-textMain outline-none"
              >
                {['All', 'Todo', 'In Progress', 'Review', 'Done'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="space-y-3">
              {filteredTasks.length > 0 ? filteredTasks.map((task, idx) => (
                <div key={task._id || idx} className="p-4 bg-surface/40 rounded-xl border border-textMain/10 flex justify-between items-center hover:bg-surface/60 transition-all">
                  <div className="flex-1">
                    <h3 className="font-semibold textMain">{task.title || 'Untitled Task'}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={cn("w-2 h-2 rounded-full", 
                        task.status === 'Done' ? 'bg-success' : 
                        task.status === 'In Progress' ? 'bg-primary' : 'bg-textMuted'
                      )} />
                      <p className="text-xs text-textMuted">{task.status || 'No Status'}</p>
                      <span className="text-xs text-textMuted">•</span>
                      <p className="text-xs text-textMuted">Due: {safeFormatDate(task.dueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        task.priority === 'High' ? 'bg-danger/10 text-danger' : 
                        task.priority === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                     )}>
                       {task.priority || 'Normal'}
                     </span>
                      <button 
                        onClick={() => setSelectedTaskId(task._id)}
                        className="p-1 hover:bg-surface rounded text-textMuted transition-colors"
                      >
                        <MoreVertical size={16}/>
                      </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-textMuted">
                  <ListTodo className="mx-auto mb-2 opacity-20" size={48} />
                  <p>No tasks found for this status.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 border border-textMain/10 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Breakdown</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {chartData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[item.name] }} />
                    <span className="text-textMuted">{item.name}</span>
                  </div>
                  <span className="font-bold textMain">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TaskDrawer 
        taskId={selectedTaskId} 
        onClose={() => setSelectedTaskId(null)} 
        columns={['Todo', 'In Progress', 'Review', 'Done']}
      />
    </motion.div>
  );
};

export default MemberProgressTracker;
