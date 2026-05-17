import React, { useEffect, useState } from 'react';
import { fetchProjectDetails, createTask, updateTaskStatus, addMemberToProject, deleteProject } from '../store/projectSlice';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiPlus, FiArrowLeft, FiClock, FiCheckCircle, FiMoreVertical, FiUserPlus, FiTrash2 } from 'react-icons/fi';
import { format, parseISO, isPast } from 'date-fns';
import TaskDrawer from '../components/TaskDrawer';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const { currentProject, tasks, isLoading } = useSelector((state) => state.project);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('board'); // 'board' or 'progress'
  const [viewMode, setViewMode] = useState(user?.role === 'Admin' ? 'team-board' : 'my-tasks'); // 'my-tasks' or 'team-board'
  
  // Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState(user?._id || '');

  // Member form state
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (token) dispatch(fetchProjectDetails(id));
  }, [id, token, dispatch]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(createTask({ 
      title, description, project: id, priority, dueDate, assignedTo: assignedTo || null 
    }));
    if (createTask.fulfilled.match(resultAction)) {
      setShowModal(false);
      setTitle(''); setDescription(''); setPriority('Medium'); setDueDate(''); setAssignedTo('');
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    dispatch(updateTaskStatus({ taskId, status: newStatus }));
  };

  const handleAssignTask = (taskId) => {
    setTaskToAssign(taskId);
    setShowAssignModal(true);
  };

  const submitAssignment = (memberId) => {
    dispatch(updateTaskStatus({ taskId: taskToAssign, assignedTo: memberId }));
    setShowAssignModal(false);
    setTaskToAssign(null);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(addMemberToProject({ projectId: id, email }));
    if (addMemberToProject.fulfilled.match(resultAction)) {
      setShowMemberModal(false);
      setEmail('');
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      const resultAction = await dispatch(deleteProject(id));
      if (deleteProject.fulfilled.match(resultAction)) {
        navigate('/projects');
      }
    }
  };

  if (isLoading || !currentProject) return <div className="p-8 text-textMuted">Loading project details...</div>;

  const columns = ['Todo', 'In Progress', 'Review', 'Done'];

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-textMuted hover:text-primary mb-2 transition-colors">
            <FiArrowLeft /> Back to Projects
          </Link>
          <h1 className="text-2xl font-bold textMain">{currentProject.name}</h1>
          <p className="text-sm text-textMuted">{currentProject.description}</p>
          
          <div className="flex items-center gap-2 mt-4">
             <span className="text-sm text-textMuted mr-2">Team Progress:</span>
             <div className="flex -space-x-2">
               {currentProject.members?.map(member => (
                  <Link 
                    key={member._id} 
                    to={`/projects/${id}/member/${member._id}/progress`} 
                    title={`${member.name}'s Progress`}
                    className="relative z-0 hover:z-10"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xs ring-2 ring-background hover:scale-110 transition-transform shadow-md">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  </Link>
               ))}
             </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {user?.role === 'Admin' && (
            <>
              <button 
                onClick={() => setShowMemberModal(true)}
                className="flex items-center gap-2 bg-surface text-textMain px-4 py-2 rounded-lg hover:bg-surface/80 border border-textMain/10 transition-colors"
              >
                <FiUserPlus /> Add Member
              </button>
              <button 
                onClick={handleDeleteProject}
                className="flex items-center gap-2 bg-danger/10 text-danger px-4 py-2 rounded-lg hover:bg-danger/20 border border-danger/20 transition-colors"
                title="Delete Project"
              >
                <FiTrash2 /> Delete
              </button>
            </>
          )}
          <Link 
            to={`/projects/${id}/member/${user?._id}/progress`}
            className="text-sm text-secondary hover:underline mr-2"
          >
            My Progress
          </Link>
          {(user?.role === 'Admin' || currentProject.createdBy?._id === user?._id) && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <FiPlus /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-textMain/10">
        <button 
          onClick={() => setActiveTab('board')}
          className={`px-6 py-2 font-medium transition-colors border-b-2 ${activeTab === 'board' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textMain'}`}
        >
          Kanban Board
        </button>
        <button 
          onClick={() => setActiveTab('progress')}
          className={`px-6 py-2 font-medium transition-colors border-b-2 ${activeTab === 'progress' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textMain'}`}
        >
          Team Progress
        </button>
        {/* View Mode Switcher (only for members) */}
        {user?.role !== 'Admin' && activeTab === 'board' && (
          <div className="flex items-center gap-2 mt-6 p-1 bg-surface/50 rounded-xl w-fit border border-textMain/10">
            <button 
              onClick={() => setViewMode('my-tasks')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'my-tasks' ? 'bg-primary text-white shadow-md' : 'text-textMuted hover:text-textMain'}`}
            >
              My Tasks
            </button>
            <button 
              onClick={() => setViewMode('team-board')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'team-board' ? 'bg-primary text-white shadow-md' : 'text-textMuted hover:text-textMain'}`}
            >
              Team Board
            </button>
          </div>
        )}
      </div>

      {activeTab === 'board' ? (
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-4 md:gap-6 min-w-max h-full">
          {columns.map(status => {
            const colTasks = tasks.filter(t => {
              const matchesStatus = t.status === status;
              if (viewMode === 'my-tasks') {
                return matchesStatus && t.assignedTo?._id === user?._id;
              }
              return matchesStatus;
            });
            return (
              <div key={status} className="w-[280px] sm:w-80 flex flex-col bg-surface/30 rounded-2xl border border-textMain/10 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      status === 'Todo' ? 'bg-textMuted' : 
                      status === 'In Progress' ? 'bg-primary' : 
                      status === 'Review' ? 'bg-secondary' : 'bg-success'
                    }`} />
                    {status}
                  </h3>
                  <span className="text-xs bg-surface text-textMuted px-2 py-1 rounded-md">{colTasks.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                  {colTasks.map(task => {
                    const overdue = task.status !== 'Done' && task.dueDate && isPast(parseISO(task.dueDate));
                    return (
                      <motion.div 
                        layoutId={task._id}
                        key={task._id}
                        onClick={() => setSelectedTaskId(task._id)}
                        className={`glass p-4 rounded-xl cursor-pointer border-l-4 hover:bg-surface/80 transition-colors ${
                          overdue ? 'border-l-danger bg-danger/5' : 'border-l-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            task.priority === 'High' ? 'bg-danger/20 text-danger' :
                            task.priority === 'Medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                          }`}>{task.priority}</span>
                          
                          {/* Only show status select if user is Admin, Creator, or Assignee */}
                          {(user?.role === 'Admin' || task.assignedTo?._id === user?._id || currentProject.createdBy?._id === user?._id) ? (
                            <select 
                              value={task.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleStatusChange(task._id, e.target.value)}
                              className="text-xs bg-transparent text-textMuted outline-none cursor-pointer hover:text-textMain font-medium"
                            >
                              {columns.map(c => <option key={c} value={c} className="bg-surface text-textMain">{c}</option>)}
                            </select>
                          ) : (
                            <span className="text-[10px] bg-surface/50 text-textMuted px-2 py-0.5 rounded border border-textMain/5">
                              {task.status} (Read Only)
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
                        <p className="text-xs text-textMuted line-clamp-2 mb-3">{task.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          {task.dueDate ? (
                            <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-danger font-medium' : 'text-textMuted'}`}>
                              <FiClock /> {format(parseISO(task.dueDate), 'MMM dd')}
                            </div>
                          ) : <div />}
                          
                          {task.assignedTo && typeof task.assignedTo === 'object' && task.assignedTo.name ? (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold" title={`Assigned to ${task.assignedTo.name}`}>
                              {task.assignedTo.name.charAt(0).toUpperCase()}
                            </div>
                          ) : (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleAssignTask(task._id); }}
                              className="text-[10px] bg-secondary/10 text-secondary px-2 py-1 rounded hover:bg-secondary/20 transition-colors"
                            >
                              Assign Task
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      ) : (
        <div className="flex-1 space-y-6">
          <div className="glass rounded-2xl overflow-hidden border border-textMain/10">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-textMain/5 border-b border-textMain/10">
                  <th className="p-4 text-sm font-semibold text-textMuted">Member</th>
                  <th className="p-4 text-sm font-semibold text-textMuted">Progress</th>
                  <th className="p-4 text-sm font-semibold text-textMuted">Tasks</th>
                  <th className="p-4 text-sm font-semibold text-textMuted text-right">View Detail</th>
                </tr>
              </thead>
              <tbody>
                {currentProject.members?.length > 0 ? currentProject.members.map(member => {
                  const memberTasks = tasks.filter(t => t.assignedTo?._id === member._id);
                  const completed = memberTasks.filter(t => t.status === 'Done').length;
                  const total = memberTasks.length;
                  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                  
                  return (
                    <tr key={member._id} className="border-b border-textMain/10 hover:bg-textMain/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-textMain">{member.name}</p>
                            <p className="text-xs text-textMuted">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 w-64">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-textMain">{percent}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-4 text-xs">
                          <span className="text-textMuted"><b className="text-textMain">{completed}</b> Done</span>
                          <span className="text-textMuted"><b className="text-textMain">{total - completed}</b> Pending</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                          to={`/projects/${id}/member/${member._id}/progress`}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                        >
                          Full Report <FiArrowLeft className="rotate-180" />
                        </Link>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-textMuted">
                      No members have been added to this project yet.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Create Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm text-textMuted mb-1">Task Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-surface border border-textMain/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm text-textMuted mb-1">Description</label>
                <textarea rows="2" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-surface border border-textMain/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-primary"></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-textMuted mb-1">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-surface border border-textMain/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-primary">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-textMuted mb-1">Assignee</label>
                  <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full bg-surface border border-textMain/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-primary">
                    <option value="">Unassigned</option>
                    {currentProject.members.map(member => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-sm text-textMuted mb-1">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-surface border border-textMain/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-textMuted hover:bg-surface">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90">Add Task</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add Member to Project</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm text-textMuted mb-1">User Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" className="w-full bg-surface border border-textMain/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-primary" />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 rounded-lg text-textMuted hover:bg-surface">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90">Add Member</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-sm p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4 textMain">Assign Task</h2>
            <p className="text-sm text-textMuted mb-6">Select a team member to assign this task to:</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {currentProject.members?.length > 0 ? (
                <>
                  {currentProject.members.map(member => (
                    <button 
                      key={member._id}
                      onClick={() => submitAssignment(member._id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold textMain">{member.name}</p>
                        <p className="text-xs text-textMuted">{member.email}</p>
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-textMain/10 my-2 pt-2">
                    <button 
                      onClick={() => submitAssignment(user._id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/10 border border-transparent hover:border-secondary/20 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold textMain">Assign to Me (Admin)</p>
                        <p className="text-xs text-textMuted">Keep this task for yourself</p>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-textMuted mb-4">No members in this project yet.</p>
                  <button 
                    onClick={() => submitAssignment(user._id)}
                    className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Assign to Me (Admin)
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-textMain/10">
              <button 
                onClick={() => setShowAssignModal(false)}
                className="w-full py-2 text-sm text-textMuted hover:text-textMain transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Task Drawer */}
      <TaskDrawer 
        taskId={selectedTaskId} 
        onClose={() => setSelectedTaskId(null)} 
        columns={columns} 
      />
    </div>
  );
};

export default ProjectDetail;
