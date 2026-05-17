import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMessageSquare, FiSend, FiClock, FiUser } from 'react-icons/fi';
import { addTaskComment, updateTaskStatus } from '../store/projectSlice';
import { format, parseISO } from 'date-fns';

const TaskDrawer = ({ taskId, onClose, columns }) => {
  const [commentText, setCommentText] = useState('');
  const dispatch = useDispatch();
  
  // Select the live task from the store instead of a prop snapshot
  const task = useSelector(state => state.project.tasks.find(t => t._id === taskId));

  if (!taskId || !task) return null;

  const handleStatusChange = (e) => {
    dispatch(updateTaskStatus({ taskId: task._id, status: e.target.value }));
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dispatch(addTaskComment({ taskId: task._id, text: commentText }));
    setCommentText('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ x: '100%' }} 
          animate={{ x: 0 }} 
          exit={{ x: '100%' }} 
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full sm:max-w-md bg-background border-l border-textMain/10 shadow-2xl h-full flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-textMain/10 flex items-start justify-between bg-surface/50">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  task.priority === 'High' ? 'bg-danger/20 text-danger' :
                  task.priority === 'Medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                }`}>{task.priority}</span>
                <span className="text-xs text-textMuted flex items-center gap-1">
                  <FiClock /> {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
              <h2 className="text-xl font-bold text-textMain leading-tight">{task.title}</h2>
            </div>
            <button onClick={onClose} className="p-2 bg-surface hover:bg-textMain/10 rounded-full text-textMuted transition-colors">
              <FiX size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Task Info */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface rounded-xl p-3 border border-textMain/10">
                  <p className="text-xs text-textMuted mb-1">Status</p>
                  <select 
                    value={task.status}
                    onChange={handleStatusChange}
                    className="w-full bg-transparent text-sm font-semibold text-textMain outline-none cursor-pointer"
                  >
                    {columns.map(c => <option key={c} value={c} className="bg-surface text-textMain">{c}</option>)}
                  </select>
                </div>
                <div className="bg-surface rounded-xl p-3 border border-textMain/10">
                  <p className="text-xs text-textMuted mb-1">Assignee</p>
                  <div className="flex items-center gap-2">
                    {task.assignedTo ? (
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                        {task.assignedTo.name?.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-textMain/5 flex items-center justify-center text-textMuted">
                        <FiUser size={12} />
                      </div>
                    )}
                    <span className="text-sm font-semibold text-textMain">{task.assignedTo ? task.assignedTo.name : 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-textMain mb-2">Description</h3>
                <div className="bg-surface rounded-xl p-4 border border-textMain/10 min-h-[100px]">
                  <p className="text-sm text-textMuted whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <h3 className="text-sm font-semibold text-textMain mb-4 flex items-center gap-2">
                <FiMessageSquare /> Comments & Activity
              </h3>
              
              <div className="space-y-4 mb-6">
                {task.comments && task.comments.length > 0 ? task.comments.map(comment => (
                  <div key={comment._id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {comment.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-surface rounded-2xl rounded-tl-none p-3 border border-textMain/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-textMain">{comment.user?.name}</span>
                        <span className="text-[10px] text-textMuted">{format(new Date(comment.createdAt), 'MMM dd, h:mm a')}</span>
                      </div>
                      <p className="text-sm text-textMuted">{comment.text}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-textMuted text-center py-4">No comments yet. Start the conversation!</p>
                )}
              </div>
            </div>
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-textMain/10 bg-surface/50">
            <form onSubmit={handleComment} className="flex items-end gap-2">
              <div className="flex-1 bg-surface border border-textMain/10 rounded-xl focus-within:border-primary transition-colors overflow-hidden">
                <textarea 
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-transparent text-sm text-textMain p-3 max-h-32 outline-none resize-none"
                  rows={commentText.split('\n').length > 1 ? Math.min(commentText.split('\n').length, 4) : 1}
                />
              </div>
              <button 
                type="submit" 
                disabled={!commentText.trim()}
                className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:hover:bg-primary shrink-0 mb-0.5"
              >
                <FiSend size={16} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskDrawer;
