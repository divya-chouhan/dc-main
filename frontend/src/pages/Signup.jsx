import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../store/authSlice';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';

const Signup = () => {
  const API_URL = import.meta.env.PROD 
    ? '/api' 
    : 'http://localhost:5000/api';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [adminCode, setAdminCode] = useState('');
  const { isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(signupUser({ name, email, password, role, adminCode }));
    if (signupUser.fulfilled.match(resultAction)) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Left Illustration Section */}
      <div className="hidden lg:flex flex-1 relative bg-surface items-center justify-center order-2 lg:order-1">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-lg text-center p-8 glass rounded-3xl border border-textMain/10 shadow-2xl">
          <FiCheckCircle className="text-6xl text-secondary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Join Your Team Today</h2>
          <p className="text-textMuted text-lg">Create projects, track progress, and conquer your goals with our beautiful task management suite.</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 z-10 order-1 lg:order-2">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-textMain mb-2">Create Account</h1>
            <p className="text-textMuted">Join us and start managing tasks</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full bg-surface border border-textMain/10 rounded-xl pl-10 pr-4 py-3 text-textMain focus:ring-2 focus:ring-secondary focus:outline-none transition-all"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-surface border border-textMain/10 rounded-xl pl-10 pr-4 py-3 text-textMain focus:ring-2 focus:ring-secondary focus:outline-none transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                <input 
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-surface border border-textMain/10 rounded-xl pl-10 pr-4 py-3 text-textMain focus:ring-2 focus:ring-secondary focus:outline-none transition-all"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Role</label>
              <select 
                value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full bg-surface border border-textMain/10 rounded-xl px-4 py-3 text-textMain focus:ring-2 focus:ring-secondary focus:outline-none transition-all"
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {role === 'Admin' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                <label className="block text-sm font-medium text-textMuted mb-1">Admin Secret Key</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                  <input 
                    type="password" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} required={role === 'Admin'}
                    className="w-full bg-surface border border-danger/30 rounded-xl pl-10 pr-4 py-3 text-textMain focus:ring-2 focus:ring-danger focus:outline-none transition-all"
                    placeholder="Enter secret admin key"
                  />
                </div>
              </motion.div>
            )}

            <button 
              type="submit" disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-secondary hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/25 disabled:opacity-50 mt-4"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-textMain/10"></div>
            <span className="text-xs text-textMuted uppercase font-semibold">Or continue with</span>
            <div className="flex-1 h-px bg-textMain/10"></div>
          </div>

          <a href={`${API_URL}/auth/google`} className="mt-6 w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-surface border border-textMain/10 text-textMain hover:bg-textMain/5 transition-colors font-medium">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </a>

          <p className="mt-8 text-center text-sm text-textMuted">
            Already have an account? <Link to="/login" className="text-secondary hover:underline font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
