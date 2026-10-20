import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { resumeService } from "../../services/resumeService.js";
import toast from "react-hot-toast";

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchResumes = createAsyncThunk(
  "resume/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const data = await resumeService.getResumes(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch resumes."
      );
    }
  }
);

export const fetchResume = createAsyncThunk(
  "resume/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const data = await resumeService.getResume(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch resume."
      );
    }
  }
);

export const createResume = createAsyncThunk(
  "resume/create",
  async (resumeData, { rejectWithValue }) => {
    try {
      const data = await resumeService.createResume(resumeData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create resume."
      );
    }
  }
);

export const updateResume = createAsyncThunk(
  "resume/update",
  async ({ id, data: resumeData }, { rejectWithValue }) => {
    try {
      const data = await resumeService.updateResume(id, resumeData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update resume."
      );
    }
  }
);

export const deleteResume = createAsyncThunk(
  "resume/delete",
  async (id, { rejectWithValue }) => {
    try {
      await resumeService.deleteResume(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete resume."
      );
    }
  }
);

export const duplicateResume = createAsyncThunk(
  "resume/duplicate",
  async (id, { rejectWithValue }) => {
    try {
      const data = await resumeService.duplicateResume(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to duplicate resume."
      );
    }
  }
);

export const toggleArchiveResume = createAsyncThunk(
  "resume/toggleArchive",
  async (id, { rejectWithValue }) => {
    try {
      const data = await resumeService.toggleArchive(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Action failed."
      );
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const defaultResumeData = {
  title: "My Resume",
  template: "modern",
  colorScheme: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#06b6d4",
    background: "#ffffff",
    text: "#1f2937",
  },
  font: { family: "Inter", size: "medium" },
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
    portfolio: "",
    profileImage: "",
    jobTitle: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  volunteerWork: [],
  customSections: [],
  sectionOrder: [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
    "awards",
  ],
  targetJobRole: "",
  targetJobDescription: "",
  tags: [],
  notes: "",
};

const initialState = {
  resumes: [],
  currentResume: null,
  activeResumeData: { ...defaultResumeData },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
  isLoading: false,
  isSaving: false,
  isDeleting: false,
  error: null,
  // UI state (persisted)
  currentTemplate: "modern",
  colorScheme: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#06b6d4",
    background: "#ffffff",
    text: "#1f2937",
  },
  sectionOrder: [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
    "awards",
  ],
  previewMode: false,
  unsavedChanges: false,
  lastSaved: null,
  filters: {
    search: "",
    template: "",
    archived: false,
    sort: "-createdAt",
  },
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    setActiveResumeData: (state, action) => {
      state.activeResumeData = { ...state.activeResumeData, ...action.payload };
      state.unsavedChanges = true;
    },

    updateSection: (state, action) => {
      const { section, data } = action.payload;
      state.activeResumeData[section] = data;
      state.unsavedChanges = true;
    },

    updatePersonalInfo: (state, action) => {
      state.activeResumeData.personalInfo = {
        ...state.activeResumeData.personalInfo,
        ...action.payload,
      };
      state.unsavedChanges = true;
    },

    updateSummary: (state, action) => {
      state.activeResumeData.summary = action.payload;
      state.unsavedChanges = true;
    },

    addExperience: (state, action) => {
      state.activeResumeData.experience.push(action.payload);
      state.unsavedChanges = true;
    },

    updateExperience: (state, action) => {
      const { id, data } = action.payload;
      const idx = state.activeResumeData.experience.findIndex(
        (e) => e.id === id
      );
      if (idx !== -1) {
        state.activeResumeData.experience[idx] = {
          ...state.activeResumeData.experience[idx],
          ...data,
        };
        state.unsavedChanges = true;
      }
    },

    removeExperience: (state, action) => {
      state.activeResumeData.experience =
        state.activeResumeData.experience.filter(
          (e) => e.id !== action.payload
        );
      state.unsavedChanges = true;
    },

    addEducation: (state, action) => {
      state.activeResumeData.education.push(action.payload);
      state.unsavedChanges = true;
    },

    updateEducation: (state, action) => {
      const { id, data } = action.payload;
      const idx = state.activeResumeData.education.findIndex(
        (e) => e.id === id
      );
      if (idx !== -1) {
        state.activeResumeData.education[idx] = {
          ...state.activeResumeData.education[idx],
          ...data,
        };
        state.unsavedChanges = true;
      }
    },

    removeEducation: (state, action) => {
      state.activeResumeData.education =
        state.activeResumeData.education.filter(
          (e) => e.id !== action.payload
        );
      state.unsavedChanges = true;
    },

    addSkill: (state, action) => {
      state.activeResumeData.skills.push(action.payload);
      state.unsavedChanges = true;
    },

    updateSkill: (state, action) => {
      const { id, data } = action.payload;
      const idx = state.activeResumeData.skills.findIndex((s) => s.id === id);
      if (idx !== -1) {
        state.activeResumeData.skills[idx] = {
          ...state.activeResumeData.skills[idx],
          ...data,
        };
        state.unsavedChanges = true;
      }
    },

    removeSkill: (state, action) => {
      state.activeResumeData.skills = state.activeResumeData.skills.filter(
        (s) => s.id !== action.payload
      );
      state.unsavedChanges = true;
    },

    addProject: (state, action) => {
      state.activeResumeData.projects.push(action.payload);
      state.unsavedChanges = true;
    },

    updateProject: (state, action) => {
      const { id, data } = action.payload;
      const idx = state.activeResumeData.projects.findIndex(
        (p) => p.id === id
      );
      if (idx !== -1) {
        state.activeResumeData.projects[idx] = {
          ...state.activeResumeData.projects[idx],
          ...data,
        };
        state.unsavedChanges = true;
      }
    },

    removeProject: (state, action) => {
      state.activeResumeData.projects = state.activeResumeData.projects.filter(
        (p) => p.id !== action.payload
      );
      state.unsavedChanges = true;
    },

    addCertification: (state, action) => {
      state.activeResumeData.certifications.push(action.payload);
      state.unsavedChanges = true;
    },

    removeCertification: (state, action) => {
      state.activeResumeData.certifications =
        state.activeResumeData.certifications.filter(
          (c) => c.id !== action.payload
        );
      state.unsavedChanges = true;
    },

    updateCertification: (state, action) => {
      const { id, data } = action.payload;
      const idx = state.activeResumeData.certifications.findIndex(
        (c) => c.id === id
      );
      if (idx !== -1) {
        state.activeResumeData.certifications[idx] = {
          ...state.activeResumeData.certifications[idx],
          ...data,
        };
        state.unsavedChanges = true;
      }
    },

    addLanguage: (state, action) => {
      state.activeResumeData.languages.push(action.payload);
      state.unsavedChanges = true;
    },

    removeLanguage: (state, action) => {
      state.activeResumeData.languages =
        state.activeResumeData.languages.filter(
          (l) => l.id !== action.payload
        );
      state.unsavedChanges = true;
    },

    reorderSections: (state, action) => {
      state.activeResumeData.sectionOrder = action.payload;
      state.sectionOrder = action.payload;
      state.unsavedChanges = true;
    },

    setTemplate: (state, action) => {
      state.currentTemplate = action.payload;
      state.activeResumeData.template = action.payload;
      state.unsavedChanges = true;
    },

    setColorScheme: (state, action) => {
      state.colorScheme = { ...state.colorScheme, ...action.payload };
      state.activeResumeData.colorScheme = {
        ...state.activeResumeData.colorScheme,
        ...action.payload,
      };
      state.unsavedChanges = true;
    },

    setPreviewMode: (state, action) => {
      state.previewMode = action.payload;
    },

    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    markSaved: (state) => {
      state.unsavedChanges = false;
      state.lastSaved = new Date().toISOString();
    },

    resetActiveResume: (state) => {
      state.activeResumeData = { ...defaultResumeData };
      state.unsavedChanges = false;
      state.currentResume = null;
      state.currentTemplate = defaultResumeData.template;
      state.colorScheme = { ...defaultResumeData.colorScheme };
      state.sectionOrder = [...defaultResumeData.sectionOrder];
    },

    loadResumeForEdit: (state, action) => {
      state.activeResumeData = action.payload;
      state.currentResume = action.payload;
      state.currentTemplate = action.payload.template || "modern";
      state.colorScheme = action.payload.colorScheme || state.colorScheme;
      state.sectionOrder =
        action.payload.sectionOrder || state.sectionOrder;
      state.unsavedChanges = false;
    },

    updateATSScore: (state, action) => {
      if (state.currentResume) {
        state.currentResume.atsScore = action.payload;
      }
      if (state.activeResumeData) {
        state.activeResumeData.atsScore = action.payload;
      }
    },

    clearResumeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch All ─────────────────────────────
    builder
      .addCase(fetchResumes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResumes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resumes = action.payload.data.resumes;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchResumes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // ── Fetch One ─────────────────────────────
    builder
      .addCase(fetchResume.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResume.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentResume = action.payload.data.resume;
      })
      .addCase(fetchResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // ── Create ────────────────────────────────
    builder
      .addCase(createResume.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createResume.fulfilled, (state, action) => {
        state.isSaving = false;
        state.resumes.unshift(action.payload.data.resume);
        state.currentResume = action.payload.data.resume;
        state.unsavedChanges = false;
        state.lastSaved = new Date().toISOString();
        toast.success(action.payload.message);
      })
      .addCase(createResume.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // ── Update ────────────────────────────────
    builder
      .addCase(updateResume.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateResume.fulfilled, (state, action) => {
        state.isSaving = false;
        const updated = action.payload.data.resume;
        state.currentResume = updated;
        const idx = state.resumes.findIndex((r) => r._id === updated._id);
        if (idx !== -1) state.resumes[idx] = updated;
        state.unsavedChanges = false;
        state.lastSaved = new Date().toISOString();
      })
      .addCase(updateResume.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // ── Delete ────────────────────────────────
    builder
      .addCase(deleteResume.pending, (state) => {
        state.isDeleting = true;
      })
      .addCase(deleteResume.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.resumes = state.resumes.filter((r) => r._id !== action.payload);
        if (state.currentResume?._id === action.payload) {
          state.currentResume = null;
        }
        toast.success("Resume deleted successfully.");
      })
      .addCase(deleteResume.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // ── Duplicate ─────────────────────────────
    builder
      .addCase(duplicateResume.fulfilled, (state, action) => {
        state.resumes.unshift(action.payload.data.resume);
        toast.success("Resume duplicated successfully.");
      })
      .addCase(duplicateResume.rejected, (state, action) => {
        toast.error(action.payload);
      });

    // ── Toggle Archive ────────────────────────
    builder
      .addCase(toggleArchiveResume.fulfilled, (state, action) => {
        const updated = action.payload.data.resume;
        const idx = state.resumes.findIndex((r) => r._id === updated._id);
        if (idx !== -1) state.resumes[idx] = updated;
        toast.success(action.payload.message);
      })
      .addCase(toggleArchiveResume.rejected, (state, action) => {
        toast.error(action.payload);
      });
  },
});

export const {
  setActiveResumeData,
  updateSection,
  updatePersonalInfo,
  updateSummary,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  addSkill,
  updateSkill,
  removeSkill,
  addProject,
  updateProject,
  removeProject,
  addCertification,
  removeCertification,
  updateCertification,
  addLanguage,
  removeLanguage,
  reorderSections,
  setTemplate,
  setColorScheme,
  setPreviewMode,
  setFilters,
  markSaved,
  resetActiveResume,
  loadResumeForEdit,
  updateATSScore,
  clearResumeError,
} = resumeSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectResumes = (state) => state.resume.resumes;
export const selectCurrentResume = (state) => state.resume.currentResume;
export const selectActiveResumeData = (state) => state.resume.activeResumeData;
export const selectResumeLoading = (state) => state.resume.isLoading;
export const selectResumeSaving = (state) => state.resume.isSaving;
export const selectResumeDeleting = (state) => state.resume.isDeleting;
export const selectResumeError = (state) => state.resume.error;
export const selectCurrentTemplate = (state) => state.resume.currentTemplate;
export const selectColorScheme = (state) => state.resume.colorScheme;
export const selectSectionOrder = (state) => state.resume.sectionOrder;
export const selectPreviewMode = (state) => state.resume.previewMode;
export const selectUnsavedChanges = (state) => state.resume.unsavedChanges;
export const selectLastSaved = (state) => state.resume.lastSaved;
export const selectPagination = (state) => state.resume.pagination;
export const selectFilters = (state) => state.resume.filters;

export default resumeSlice.reducer;
