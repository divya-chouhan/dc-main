import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiShield, FiTrash2 } from 'react-icons/fi';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const Team = () => {
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const { token, user } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeam(res.data);
      } catch (error) {
        console.error('Failed to fetch team');
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.role === 'Admin') fetchTeam();
    else setIsLoading(false);
  }, [token, user]);

  if (user?.role !== 'Admin') {
    return (
      <div className="p-8 text-center text-textMuted flex flex-col items-center justify-center h-full">
        <FiShield size={48} className="mb-4 text-primary/50" />
        <h2 className="text-xl font-bold text-textMain mb-2">Access Restricted</h2>
        <p>Only Administrators can view the team management page.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Team Directory</h1>
          <p className="text-sm text-textMuted">Manage all members of your organization.</p>
        </div>
        <button 
          onClick={() => setShowInvite(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Invite Member
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-textMain/10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-textMain/5 border-b border-textMain/10">
                <th className="p-4 text-sm font-semibold text-textMuted">Member</th>
                <th className="p-4 text-sm font-semibold text-textMuted">Role</th>
                <th className="p-4 text-sm font-semibold text-textMuted">Joined</th>
                <th className="p-4 text-sm font-semibold text-textMuted text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" className="p-4 text-center text-textMuted">Loading...</td></tr>
              ) : team.map(member => (
                <tr key={member._id} className="border-b border-textMain/10 hover:bg-textMain/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {member.avatar ? (
                        <img src={member.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-textMain truncate">{member.name}</p>
                        <p className="text-sm text-textMuted flex items-center gap-1 truncate"><FiMail size={12}/> {member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.role === 'Admin' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-textMuted">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-textMain">Invite New Member</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              import('react-hot-toast').then(({ default: toast }) => {
                toast.success(`Invitation sent to ${inviteEmail}!`);
              });
              setShowInvite(false);
              setInviteEmail('');
            }} className="space-y-4">
              <div>
                <label className="block text-sm text-textMuted mb-1">Email Address</label>
                <input required type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="w-full bg-surface border border-textMain/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-primary" />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-lg text-textMuted hover:bg-surface">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90">Send Invite</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Team;
