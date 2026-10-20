import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Share2, Palette, Settings2, Eye,
  ArrowLeft, ChevronLeft, ChevronRight, Sparkles,
  Maximize2, Minimize2,
} from "lucide-react";

import {
  fetchResume, loadResumeForEdit, resetActiveResume,
  selectCurrentResume, selectResumeLoading,
  selectActiveResumeData, setTemplate, setColorScheme,
} from "../../features/resume/resumeSlice.js";
import { exportToPDF, getResumeFilename } from "../../utils/pdfExport.js";
import { resumeService } from "../../services/resumeService.js";
import ResumeBuilder from "../../components/resume/ResumeBuilder.jsx";
import ResumePreview from "../../components/resume/ResumePreview.jsx";
import AIToolsPanel from "../../components/resume/AIToolsPanel.jsx";
import Button from "../../components/common/Button.jsx";
import Badge from "../../components/common/Badge.jsx";
import Modal from "../../components/common/Modal.jsx";
import Loader from "../../components/common/Loader.jsx";
import { TEMPLATES, COLOR_PRESETS } from "../../utils/constants.js";
import toast from "react-hot-toast";

const PREVIEW_SCALES = {
  sm: 0.4,
  md: 0.55,
  lg: 0.7,
};

const ResumeBuilderPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isNew = id === "new";
  const isAIMode = location.pathname.endsWith("/ai");
  const currentResume = useSelector(selectCurrentResume);
  const isLoading = useSelector(selectResumeLoading);
  const resumeData = useSelector(selectActiveResumeData);

  const [showPreview, setShowPreview] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showAI, setShowAI] = useState(isAIMode);
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState("sm");
  const [fullPreview, setFullPreview] = useState(false);
  const autoExportedRef = useRef(false);

  // Load resume
  useEffect(() => {
    if (!isNew) {
      dispatch(fetchResume(id)).then((result) => {
        if (fetchResume.fulfilled.match(result)) {
          dispatch(loadResumeForEdit(result.payload.data.resume));
        }
      });
    } else {
      dispatch(resetActiveResume());
    }
    return () => {};
  }, [id, isNew, dispatch]);

  // Handle AI mode
  useEffect(() => {
    setShowAI(isAIMode);
  }, [isAIMode]);

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const filename = getResumeFilename(resumeData);
      await exportToPDF("resume-preview", filename);
      if (!isNew) await resumeService.trackDownload(id);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, [id, isNew, resumeData]);

  useEffect(() => {
    const shouldExport = searchParams.get("export") === "true";
    const resumeLoaded = !isNew && currentResume?._id === id && !isLoading;

    if (!shouldExport || !resumeLoaded || autoExportedRef.current) return;

    autoExportedRef.current = true;
    handleExportPDF().finally(() => {
      navigate(`/resumes/${id}/edit`, { replace: true });
    });
  }, [searchParams, isNew, currentResume?._id, id, isLoading, navigate, handleExportPDF]);

  if (isLoading && !isNew) {
    return <Loader fullScreen message="Loading resume..." />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 z-30 shrink-0">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/resumes")}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-slate-800 text-sm">
              {isNew ? "New Resume" : (resumeData?.title || "Edit Resume")}
            </h1>
            <p className="text-xs text-slate-400">
              {resumeData?.template ? `${resumeData.template} template` : "Choose a template"}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Template chooser */}
          <button
            onClick={() => { setShowTemplates(true); setShowColors(false); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 text-sm font-medium transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline capitalize">{resumeData?.template || "Modern"}</span>
          </button>

          {/* Color chooser */}
          <button
            onClick={() => { setShowColors(true); setShowTemplates(false); }}
            className="p-2.5 rounded-xl border-2 border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* AI Button */}
          <button
            onClick={() => navigate(`/resumes/${id}/ai`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 text-violet-700 border-2 border-violet-200 text-sm font-medium hover:bg-violet-100 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Tools</span>
          </button>

          {/* Preview toggle (mobile) */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="lg:hidden p-2.5 rounded-xl border-2 border-slate-200 text-slate-500 hover:border-slate-300 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Export PDF */}
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            isLoading={isExporting}
            onClick={handleExportPDF}
          >
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div
          className={`
            shrink-0 overflow-hidden transition-all duration-300
            ${showPreview ? "w-full lg:w-[45%] xl:w-[40%]" : "w-full"}
            ${showPreview ? "hidden lg:block" : "block"}
            border-r border-slate-100
          `}
          style={{ display: !showPreview || window.innerWidth >= 1024 ? "flex" : "none", flexDirection: "column" }}
        >
          <ResumeBuilder
            resumeId={id}
            onPreviewToggle={() => setShowPreview(!showPreview)}
            showPreview={showPreview}
          />
        </div>

        {/* Preview Panel */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 overflow-auto bg-slate-200/50 flex flex-col"
            >
              {/* Preview controls */}
              <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Live Preview</span>
                  <Badge variant="success" size="xs">Real-time</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {/* Scale controls */}
                  <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden">
                    {Object.keys(PREVIEW_SCALES).map((scale) => (
                      <button
                        key={scale}
                        onClick={() => setPreviewScale(scale)}
                        className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          previewScale === scale
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {scale.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setFullPreview(!fullPreview)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {fullPreview ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Preview area */}
              <div className="flex-1 overflow-auto p-6 flex justify-center">
                <div style={{ transform: `scale(${PREVIEW_SCALES[previewScale]})`, transformOrigin: "top center" }}>
                  <ResumePreview scale={1} id="resume-preview" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Template Modal */}
      <Modal isOpen={showTemplates} onClose={() => setShowTemplates(false)} title="Choose Template" size="2xl">
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  dispatch(setTemplate(template.id));
                  setShowTemplates(false);
                }}
                className={`
                  cursor-pointer rounded-2xl overflow-hidden border-2 transition-all
                  ${resumeData?.template === template.id
                    ? "border-indigo-500 shadow-lg shadow-indigo-200/50"
                    : "border-slate-100 hover:border-indigo-200"
                  }
                `}
              >
                {/* Template preview */}
                <div
                  className="h-36 relative flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1] || template.colors[0]})`,
                  }}
                >
                  <div className="text-white/20 text-4xl font-bold font-display">
                    {template.name.charAt(0)}
                  </div>
                  {resumeData?.template === template.id && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Badge variant="gradient">Selected ✓</Badge>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-slate-800">{template.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{template.description}</p>
                  <div className="flex gap-1 mt-2">
                    {template.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="default" size="xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Color Scheme Modal */}
      <Modal isOpen={showColors} onClose={() => setShowColors(false)} title="Color Scheme" size="md">
        <div className="p-6 space-y-5">
          {/* Presets */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Color Presets</h3>
            <div className="grid grid-cols-2 gap-3">
              {COLOR_PRESETS.map((preset) => (
                <motion.button
                  key={preset.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    dispatch(setColorScheme({
                      primary: preset.primary,
                      secondary: preset.secondary,
                      accent: preset.accent || preset.primary,
                    }));
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-100 hover:border-slate-200 transition-all text-left"
                >
                  <div className="flex gap-1 shrink-0">
                    {[preset.primary, preset.secondary, preset.accent || preset.primary].map((color, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{preset.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom colors */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Custom Colors</h3>
            <div className="space-y-3">
              {[
                { key: "primary", label: "Primary Color" },
                { key: "secondary", label: "Secondary Color" },
                { key: "accent", label: "Accent Color" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={resumeData?.colorScheme?.[key] || "#6366f1"}
                    onChange={(e) => dispatch(setColorScheme({ [key]: e.target.value }))}
                    className="w-10 h-10 rounded-xl border-2 border-slate-200 cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400 uppercase">{resumeData?.colorScheme?.[key] || "#6366f1"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* AI Tools Modal */}
      <Modal isOpen={showAI} onClose={() => { setShowAI(false); navigate(`/resumes/${id}/edit`); }} title="" size="full">
        <div className="h-[90vh] overflow-hidden">
          <AIToolsPanel resumeId={id} onClose={() => { setShowAI(false); navigate(`/resumes/${id}/edit`); }} />
        </div>
      </Modal>
    </div>
  );
};

export default ResumeBuilderPage;
