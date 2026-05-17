import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, deleteAccount, upgradeAccount } from '../store/authSlice';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiBell, FiMoon, FiSun, FiTrash2, FiAlertTriangle, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, isLoading } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [adminCode, setAdminCode] = useState('');
  
  const [theme, setTheme] = useState(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  const toggleTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setTheme(newTheme);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const data = { name, email };
    if (password) data.password = password;
    if (avatar) data.avatar = avatar;
    dispatch(updateProfile(data));
  };

  const handleUpgrade = (e) => {
    e.preventDefault();
    dispatch(upgradeAccount(adminCode)).then(() => {
      setAdminCode('');
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you absolutely sure? This action is permanent and all your personal data will be removed.')) {
      dispatch(deleteAccount()).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          navigate('/login');
        }
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2 md:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-textMain">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="md:col-span-2 glass rounded-2xl p-6 border border-textMain/10 shadow-xl">
          <h2 className="text-lg font-semibold text-textMain flex items-center gap-2 mb-6">
            <FiUser className="text-primary" /> Profile Information
          </h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-primary/20" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <label className="block text-sm text-textMuted mb-1">Avatar URL</label>
                <input type="text" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." className="w-full bg-surface border border-textMain/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-primary" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-textMuted mb-1">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-surface border border-textMain/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm text-textMuted mb-1">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-surface border border-textMain/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div className="pt-4 border-t border-textMain/10">
              <h3 className="text-sm font-semibold text-textMain flex items-center gap-2 mb-4">
                <FiLock className="text-secondary" /> Change Password
              </h3>
              <div>
                <label className="block text-sm text-textMuted mb-1">New Password (leave blank to keep current)</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-surface border border-textMain/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={isLoading} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          {user?.role === 'Member' && (
            <div className="glass rounded-2xl p-6 border border-primary/20 shadow-xl bg-primary/5">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
                <FiShield /> Upgrade to Admin
              </h2>
              <p className="text-xs text-textMuted mb-4">Enter the secret key to gain administrative privileges.</p>
              <form onSubmit={handleUpgrade} className="space-y-3">
                <input 
                  type="password" 
                  value={adminCode} 
                  onChange={e => setAdminCode(e.target.value)} 
                  placeholder="Secret Key" 
                  className="w-full bg-surface border border-textMain/10 rounded-lg p-2 text-sm text-textMain focus:outline-none focus:border-primary"
                />
                <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  Verify Key
                </button>
              </form>
            </div>
          )}

          <div className="glass rounded-2xl p-6 border border-textMain/10 shadow-xl">
            <h2 className="text-lg font-semibold text-textMain flex items-center gap-2 mb-6">
              <FiBell className="text-warning" /> Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-textMuted">Email Alerts</span>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-textMuted">Push Notifications</span>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-textMuted">Task Updates</span>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </label>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-textMain/10 shadow-xl">
            <h2 className="text-lg font-semibold text-textMain flex items-center gap-2 mb-6">
              <FiMoon className="text-primary" /> Theme
            </h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleTheme('dark')}
                className={`flex-1 py-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${theme === 'dark' ? 'bg-surface border-primary text-primary' : 'bg-surface/50 border-textMain/10 text-textMuted hover:text-textMain'}`}
              >
                <FiMoon /> Dark
              </button>
              <button 
                onClick={() => toggleTheme('light')}
                className={`flex-1 py-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${theme === 'light' ? 'bg-surface border-primary text-primary' : 'bg-surface/50 border-textMain/10 text-textMuted hover:text-textMain'}`}
              >
                <FiSun /> Light
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-2xl p-6 border border-danger/20 shadow-xl bg-danger/5">
        <h2 className="text-lg font-semibold text-danger flex items-center gap-2 mb-4">
          <FiAlertTriangle /> Danger Zone
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-textMain font-medium">Delete Account</p>
            <p className="text-sm text-textMuted">Once you delete your account, there is no going back. Please be certain.</p>
          </div>
          <button 
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-6 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors"
          >
            <FiTrash2 /> Delete My Account
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
