import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  tasks: [],
  isLoading: false,

  fetchProjects: async (token) => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ projects: res.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch projects');
    }
  },

  fetchProjectDetails: async (projectId, token) => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tasksRes = await axios.get(`${API_URL}/tasks/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ currentProject: res.data, tasks: tasksRes.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch project details');
    }
  },

  createProject: async (projectData, token) => {
    try {
      const res = await axios.post(`${API_URL}/projects`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({ projects: [...state.projects, res.data] }));
      toast.success('Project created');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
      return false;
    }
  },

  createTask: async (taskData, token) => {
    try {
      const res = await axios.post(`${API_URL}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({ tasks: [...state.tasks, res.data] }));
      toast.success('Task created');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
      return false;
    }
  },

  updateTaskStatus: async (taskId, status, token) => {
    try {
      const res = await axios.put(`${API_URL}/tasks/${taskId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({
        tasks: state.tasks.map(t => t._id === taskId ? res.data : t)
      }));
    } catch (error) {
      toast.error('Failed to update task');
    }
  }
}));

export default useProjectStore;
