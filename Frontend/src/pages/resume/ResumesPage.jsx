import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, Grid3X3, List, FileText,
  Copy, Trash2, Archive, Edit3, Eye, Download,
  MoreVertical, Star, Clock, Target, ChevronDown,
  SlidersHorizontal,
} from "lucide-react";

import {
  fetchResumes, deleteResume, duplicateResume,
  toggleArchiveResume, selectResumes, selectResumeLoading,
  selectResumeDeleting, selectPagination, setFilters, selectFilters,
} from "../../features/resume/resumeSlice.js";
import { exportToPDF, getResumeFilename } from "../../utils/pdfExport.js";
import { resumeService } from "../../services/resumeService.js";
import Button from "../../components/common/Button.jsx";
import Badge from "../../components/common/Badge.jsx";
import Card from "../../components/common/Card.jsx";
import Loader from "../../components/common/Loader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Modal from "../../components/common/Modal.jsx";
import { TEMPLATES } from "../../utils/constants.js";
import { getATSColor, getATSLabel, formatDate, debounce } from "../../utils/helpers.js";

const ResumeCard = ({ resume, onDelete, onDuplicate, onArchive, viewMode }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const template = TEMPLATES.find((t) => t.id === resume.template);
  const atsColor = getATSColor(resume.atsScore?.overall || 0);
  const atsLabel = getATSLabel(resume.atsScore?.overall || 0);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await resumeService.trackDownload(resume._id);
      navigate(`/resumes/${resume._id}/edit?export=true`);
    } finally {
      setIsExporting(false);
    }
  };

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-medium hover:border-slate-200 transition-all group"
      >
        {/* Color indicator */}
        <div
          className="w-1 h-12 rounded-full flex-shrink-0"
          style={{ backgroundColor: resume.colorScheme?.primary || "#6366f1" }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 truncate">{resume.title}</h3>
            {resume.isDraft && <Badge variant="warning" size="xs">Draft</Badge>}
            {resume.isArchived && <Badge variant="default" size="xs">Archived</Badge>}
            {resume.isPublic && <Badge variant="success" size="xs">Public</Badge>}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDate(resume.updatedAt)}
            </span>
            <span className="text-xs text-slate-500 capitalize">{resume.template} template</span>
            <span className="text-xs text-slate-500">{resume.analytics?.views || 0} views</span>
          </div>
        </div>

        {/* ATS Score */}
        {resume.atsScore?.overall > 0 && (
          <div className="flex-shrink-0 text-center px-3 py-1.5 rounded-xl" style={{ backgroundColor: `${atsColor}15` }}>
            <div className="text-lg font-bold" style={{ color: atsColor }}>
              {resume.atsScore.overall}%
            </div>
            <div className="text-xs" style={{ color: atsColor }}>{atsLabel}</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => navigate(`/resumes/${resume._id}/edit`)}
            className="p-2 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={() => navigate(`/resumes/${resume._id}/preview`)}
            className="p-2 rounded-lg text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => onDuplicate(resume._id)}
            className="p-2 rounded-lg text-slate-500 hover:bg-violet-50 hover:text-violet-600 transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(resume._id)}
            className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative"
    >
      <Card className="overflow-hidden p-0">
        {/* Preview Area */}
        <div
          className="h-40 relative flex items-center justify-center overflow-hidden cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${resume.colorScheme?.primary || "#6366f1"}, ${resume.colorScheme?.secondary || "#8b5cf6"})` }}
          onClick={() => navigate(`/resumes/${resume._id}/edit`)}
        >
          <FileText className="w-12 h-12 text-white/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/resumes/${resume._id}/edit`); }}
              className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/resumes/${resume._id}/preview`); }}
              className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Top badges */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
            <Badge variant="dark" size="xs" className="bg-black/30 text-white capitalize backdrop-blur-sm">
              {resume.template}
            </Badge>
            {resume.atsScore?.overall > 0 && (
              <span className="text-xs font-bold text-white bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                {resume.atsScore.overall}% ATS
              </span>
            )}
          </div>

          {/* Status badges */}
          <div className="absolute bottom-2 left-2 flex gap-1.5">
            {resume.isDraft && <Badge variant="warning" size="xs">Draft</Badge>}
            {resume.isArchived && <Badge variant="default" size="xs">Archived</Badge>}
            {resume.isPublic && <Badge variant="success" size="xs">Public</Badge>}
          </div>
        </div>

        {/* Card footer */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-800 truncate text-sm">{resume.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDate(resume.updatedAt)}
              </p>
            </div>

            {/* Context Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -5 }}
                      className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-strong border border-slate-100 z-20 overflow-hidden"
                    >
                      {[
                        { icon: Edit3, label: "Edit Resume", action: () => navigate(`/resumes/${resume._id}/edit`), color: "" },
                        { icon: Eye, label: "Preview", action: () => navigate(`/resumes/${resume._id}/preview`), color: "" },
                        { icon: Copy, label: "Duplicate", action: () => { onDuplicate(resume._id); setMenuOpen(false); }, color: "" },
                        { icon: Download, label: "Export PDF", action: handleExport, color: "" },
                        { icon: Archive, label: resume.isArchived ? "Unarchive" : "Archive", action: () => { onArchive(resume._id); setMenuOpen(false); }, color: "" },
                        { icon: Trash2, label: "Delete", action: () => { onDelete(resume._id); setMenuOpen(false); }, color: "text-red-600 hover:bg-red-50" },
                      ].map(({ icon: Icon, label, action, color }) => (
                        <button
                          key={label}
                          onClick={action}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors ${color}`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Eye className="w-3 h-3" /> {resume.analytics?.views || 0}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Download className="w-3 h-3" /> {resume.analytics?.downloads || 0}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const ResumesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const resumes = useSelector(selectResumes);
  const isLoading = useSelector(selectResumeLoading);
  const isDeleting = useSelector(selectResumeDeleting);
  const pagination = useSelector(selectPagination);
  const filters = useSelector(selectFilters);

  const [viewMode, setViewMode] = useState("grid");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);

  const loadResumes = useCallback(() => {
    dispatch(fetchResumes({
      search: filters.search,
      template: filters.template,
      archived: filters.archived,
      sort: filters.sort,
    }));
  }, [dispatch, filters]);

  useEffect(() => { loadResumes(); }, [loadResumes]);

  const debouncedSearch = useCallback(
    debounce((value) => dispatch(setFilters({ search: value })), 400),
    [dispatch]
  );

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleDelete = async (id) => {
    await dispatch(deleteResume(id));
    setDeleteConfirm(null);
  };

  const handleDuplicate = (id) => dispatch(duplicateResume(id));
  const handleArchive = (id) => dispatch(toggleArchiveResume(id));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">My Resumes</h1>
          <p className="text-slate-500 text-sm mt-1">
            {pagination.total} resume{pagination.total !== 1 ? "s" : ""} · Build & manage your professional story
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate("/resumes/new")}
        >
          New Resume
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search resumes..."
            value={searchValue}
            onChange={handleSearch}
            className="input-base pl-10 w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => dispatch(setFilters({ sort: e.target.value }))}
              className="input-base pr-8 appearance-none cursor-pointer text-sm"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-updatedAt">Recently Updated</option>
              <option value="title">A–Z</option>
              <option value="-analytics.views">Most Viewed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border-2 transition-colors ${
              showFilters ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* View mode */}
          <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
            {[
              { mode: "grid", icon: Grid3X3 },
              { mode: "list", icon: List },
            ].map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2.5 transition-colors ${
                  viewMode === mode ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100"
          >
            <span className="text-sm font-medium text-slate-600 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter by:
            </span>

            {/* Template filter */}
            {["all", ...TEMPLATES.map((t) => t.id)].map((tmpl) => (
              <button
                key={tmpl}
                onClick={() => dispatch(setFilters({ template: tmpl === "all" ? "" : tmpl }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  (tmpl === "all" && !filters.template) || filters.template === tmpl
                    ? "bg-indigo-500 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                }`}
              >
                {tmpl.charAt(0).toUpperCase() + tmpl.slice(1)}
              </button>
            ))}

            {/* Archived filter */}
            <button
              onClick={() => dispatch(setFilters({ archived: !filters.archived }))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filters.archived ? "bg-indigo-500 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
              }`}
            >
              {filters.archived ? "Showing Archived" : "Show Archived"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {isLoading && resumes.length === 0 ? (
        <Loader variant="dots" message="Loading your resumes..." />
      ) : resumes.length === 0 ? (
        <EmptyState
          emoji="📄"
          title="No resumes yet"
          description="Create your first AI-powered resume and start landing more interviews. It only takes a few minutes!"
          actionLabel="Create My First Resume"
          onAction={() => navigate("/resumes/new")}
        />
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {/* New Resume Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/resumes/new")}
                className="h-full min-h-[280px] border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer group transition-colors hover:bg-indigo-50/30"
              >
                <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-indigo-200/50">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">New Resume</p>
                  <p className="text-xs text-slate-400 mt-0.5">Start from scratch</p>
                </div>
              </motion.div>

              {resumes.map((resume) => (
                <ResumeCard
                  key={resume._id}
                  resume={resume}
                  viewMode="grid"
                  onDelete={(id) => setDeleteConfirm(id)}
                  onDuplicate={handleDuplicate}
                  onArchive={handleArchive}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume._id}
                  resume={resume}
                  viewMode="list"
                  onDelete={(id) => setDeleteConfirm(id)}
                  onDuplicate={handleDuplicate}
                  onArchive={handleArchive}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Resume" size="sm">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Are you sure?</h3>
            <p className="text-slate-500 text-sm mt-2">
              This action cannot be undone. The resume will be permanently deleted.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              isLoading={isDeleting}
              onClick={() => handleDelete(deleteConfirm)}
            >
              Delete Resume
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResumesPage;