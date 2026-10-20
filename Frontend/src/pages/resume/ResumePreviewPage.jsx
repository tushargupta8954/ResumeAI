import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  ArrowLeft, Download, Share2, Edit3,
  Eye, Lock, Globe, Copy, Check,
} from "lucide-react";

import {
  fetchResume, loadResumeForEdit, updateResume,
  selectCurrentResume, selectResumeLoading,
} from "../../features/resume/resumeSlice.js";
import { resumeService } from "../../services/resumeService.js";
import { exportToPDF, getResumeFilename } from "../../utils/pdfExport.js";
import { copyToClipboard } from "../../utils/helpers.js";
import ResumePreview from "../../components/resume/ResumePreview.jsx";
import Button from "../../components/common/Button.jsx";
import Badge from "../../components/common/Badge.jsx";
import Loader from "../../components/common/Loader.jsx";
import toast from "react-hot-toast";

const ResumePreviewPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const resume = useSelector(selectCurrentResume);
  const isLoading = useSelector(selectResumeLoading);

  const [isExporting, setIsExporting] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(0.65);

  useEffect(() => {
    dispatch(fetchResume(id)).then((result) => {
      if (fetchResume.fulfilled.match(result)) {
        dispatch(loadResumeForEdit(result.payload.data.resume));
      }
    });
  }, [id, dispatch]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filename = getResumeFilename(resume);
      await exportToPDF("resume-preview", filename);
      await resumeService.trackDownload(id);
      toast.success("PDF exported successfully! 📄");
    } catch {
      toast.error("Export failed. Try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleTogglePublic = async () => {
    setIsTogglingPublic(true);
    try {
      await dispatch(updateResume({ id, data: { isPublic: !resume?.isPublic } }));
      if (!resume?.isPublic) {
        toast.success("Resume is now public! Share the link. 🌍");
      } else {
        toast.success("Resume is now private.");
      }
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/resume/view/${resume?.slug}`;
    const copied = await copyToClipboard(link);
    if (copied) {
      setLinkCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  if (isLoading) return <Loader fullScreen message="Loading preview..." />;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/resumes/${id}/edit`)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-slate-800 text-sm">{resume?.title}</h1>
              <p className="text-xs text-slate-400 capitalize">
                {resume?.template} template ·{" "}
                {resume?.isPublic ? (
                  <span className="text-emerald-500">Public</span>
                ) : (
                  <span className="text-slate-400">Private</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-xl p-1">
              {[0.45, 0.65, 0.85].map((zoom) => (
                <button
                  key={zoom}
                  onClick={() => setPreviewZoom(zoom)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    previewZoom === zoom
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {Math.round(zoom * 100)}%
                </button>
              ))}
            </div>

            {/* Public toggle */}
            <Button
              variant={resume?.isPublic ? "success" : "secondary"}
              size="sm"
              icon={resume?.isPublic ? Globe : Lock}
              isLoading={isTogglingPublic}
              onClick={handleTogglePublic}
            >
              {resume?.isPublic ? "Public" : "Make Public"}
            </Button>

            {/* Share link (if public) */}
            {resume?.isPublic && (
              <Button
                variant="secondary"
                size="sm"
                icon={linkCopied ? Check : Copy}
                onClick={handleCopyLink}
              >
                {linkCopied ? "Copied!" : "Copy Link"}
              </Button>
            )}

            {/* Edit */}
            <Button
              variant="secondary"
              size="sm"
              icon={Edit3}
              onClick={() => navigate(`/resumes/${id}/edit`)}
            >
              Edit
            </Button>

            {/* Export */}
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              isLoading={isExporting}
              onClick={handleExport}
            >
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 flex items-start justify-center py-8 px-4 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ transform: `scale(${previewZoom})`, transformOrigin: "top center" }}
        >
          <div className="shadow-2xl rounded-xl overflow-hidden">
            <ResumePreview scale={1} id="resume-preview" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumePreviewPage;