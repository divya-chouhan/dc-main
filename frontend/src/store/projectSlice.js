import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/api';

export const fetchProjects = createAsyncThunk('project/fetchProjects', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await axios.get(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    toast.error('Failed to fetch projects');
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const fetchDashboardStats = createAsyncThunk('project/fetchStats', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const fetchProjectDetails = createAsyncThunk('project/fetchDetails', async (projectId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const projectRes = await axios.get(`${API_URL}/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const tasksRes = await axios.get(`${API_URL}/tasks/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { project: projectRes.data, tasks: tasksRes.data };
  } catch (error) {
    toast.error('Failed to fetch project details');
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const createProject = createAsyncThunk('project/create', async (projectData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await axios.post(`${API_URL}/projects`, projectData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success('Project created');
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create project');
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const createTask = createAsyncThunk('project/createTask', async (taskData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await axios.post(`${API_URL}/tasks`, taskData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success('Task created');
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create task');
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const updateTaskStatus = createAsyncThunk('project/updateTaskStatus', async ({ taskId, ...updateData }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await axios.put(`${API_URL}/tasks/${taskId}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success('Task updated successfully!');
    return res.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Failed to update task';
    toast.error(errorMsg);
    return thunkAPI.rejectWithValue(errorMsg);
  }
});

export const addMemberToProject = createAsyncThunk('project/addMember', async ({ projectId, email }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await axios.post(`${API_URL}/projects/${projectId}/members`, { email }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success('Member added successfully');
    return res.data; // Returns updated project
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to add member');
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const deleteProject = createAsyncThunk('project/delete', async (projectId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    await axios.delete(`${API_URL}/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success('Project deleted');
    return projectId;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete project');
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const addTaskComment = createAsyncThunk('project/addComment', async ({ taskId, text }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await axios.post(`${API_URL}/tasks/${taskId}/comments`, { text }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data; // Returns updated task
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to add comment');
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

const initialState = {
  projects: [],
  currentProject: null,
  tasks: [],
  stats: { totalProjects: 0, tasksCompleted: 0, tasksInProgress: 0, tasksOverdue: 0 },
  isLoading: false,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state) => { state.isLoading = false; })
      
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      .addCase(fetchProjectDetails.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProjectDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload.project;
        state.tasks = action.payload.tasks;
      })
      .addCase(fetchProjectDetails.rejected, (state) => { state.isLoading = false; })

      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      })
      
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p._id !== action.payload);
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }
      })
      
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      
      .addCase(addMemberToProject.fulfilled, (state, action) => {
        state.currentProject = action.payload;
      })
      
      .addCase(addTaskComment.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      });
  }
});

export default projectSlice.reducer;
