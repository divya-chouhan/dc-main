import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiBell, FiCheck, FiTrash2, FiX, FiInfo } from 'react-icons/fi';
import { markAsRead, markAllRead } from '../store/notificationSlice';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = ({ onClose }) => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.notifications);
  const panelRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-surface border border-textMain/10 rounded-2xl shadow-2xl overflow-hidden z-50"
    >
      <div className="p-4 border-b border-textMain/10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <FiBell className="text-primary" />
          <h3 className="font-bold text-textMain">Notifications</h3>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-primary hover:underline font-medium"
            >
              Mark all as read
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-textMain/5 rounded-lg text-textMuted">
            <FiX size={18} />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-textMain/5 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiBell size={24} className="text-textMuted" />
            </div>
            <p className="text-textMuted text-sm font-medium">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-textMain/5">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 transition-colors relative group ${
                  !notification.isRead ? 'bg-primary/5' : 'hover:bg-textMain/5'
                }`}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    !notification.isRead ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-textMain/5 text-textMuted'
                  }`}>
                    {notification.type === 'TASK_ASSIGNED' ? <FiInfo size={18} /> : <FiBell size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold truncate ${!notification.isRead ? 'text-textMain' : 'text-textMuted'}`}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-textMuted shrink-0 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-textMuted mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="mt-2 text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        <FiCheck size={12} /> MARK AS READ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 bg-textMain/5 border-t border-textMain/10 text-center">
          <button className="text-xs text-textMuted hover:text-primary font-medium transition-colors">
            View all notifications
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationPanel;
