import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiFolder, FiLogOut, FiMenu, FiX, FiCheckCircle, FiSearch, FiBell, FiSettings, FiUsers } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { fetchNotifications } from '../store/notificationSlice';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationPanel from './NotificationPanel';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  React.useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
      
      // Add polling to check for new notifications every 30 seconds
      const interval = setInterval(() => {
        dispatch(fetchNotifications());
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: FiHome },
    { name: 'Projects', path: '/projects', icon: FiFolder },
    { name: 'Team', path: '/team', icon: FiUsers },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar Backdrop for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 w-64 h-screen bg-surface border-r border-textMain/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gradient flex items-center gap-2">
            <FiCheckCircle className="text-primary" /> TaskFlow
          </h1>
          <button className="md:hidden text-textMuted p-2 hover:bg-textMain/5 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => {
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-semibold border border-primary/20' 
                    : 'text-textMuted hover:bg-textMain/5 hover:text-textMain'
                }`
              }
            >
              <link.icon size={20} />
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Summary */}
        <div className="p-4 m-4 rounded-xl bg-background border border-textMain/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-textMain">{user?.name}</p>
              <p className="text-xs text-textMuted truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors font-medium"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Sticky Top Navbar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 md:px-6 bg-surface/80 backdrop-blur-md border-b border-textMain/10 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-textMain p-2 hover:bg-textMain/5 rounded-lg">
              <FiMenu size={24} />
            </button>
            <div className="hidden sm:flex items-center bg-background border border-textMain/10 rounded-full px-4 py-2 w-48 lg:w-64 focus-within:border-primary transition-all">
              <FiSearch className="text-textMuted mr-2" />
              <input type="text" placeholder="Search..." className="bg-transparent text-sm w-full outline-none text-textMain placeholder-textMuted" />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 relative">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`relative p-2 transition-colors rounded-lg ${isNotificationOpen ? 'text-primary bg-primary/10' : 'text-textMuted hover:text-textMain hover:bg-textMain/5'}`}
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-[10px] text-white flex items-center justify-center rounded-full border-2 border-surface font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {isNotificationOpen && (
                <NotificationPanel onClose={() => setIsNotificationOpen(false)} />
              )}
            </AnimatePresence>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto flex flex-col relative custom-scrollbar">
          <div className="flex-1 p-4 md:p-8">
            <Outlet />
          </div>
          
          {/* Footer */}
          <footer className="w-full py-8 px-4 md:px-8 border-t border-textMain/5 bg-surface/30 mt-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-textMuted">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-primary" />
                  <span className="font-bold text-textMain">TaskFlow</span>
                </div>
                <span className="hidden md:inline text-textMain/20">|</span>
                <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
              </div>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 font-medium">
                <button 
                  onClick={() => import('react-hot-toast').then(({ default: toast }) => toast('Privacy Policy coming soon!', { icon: '📄' }))}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Privacy
                </button>
                <button 
                  onClick={() => import('react-hot-toast').then(({ default: toast }) => toast('Terms of Service coming soon!', { icon: '⚖️' }))}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Terms
                </button>
                <button 
                  onClick={() => import('react-hot-toast').then(({ default: toast }) => toast('Contact Support coming soon!', { icon: '💬' }))}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Support
                </button>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Layout;
