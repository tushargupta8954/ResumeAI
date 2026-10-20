import { useSelector } from "react-redux";
import { selectActiveResumeData, selectCurrentTemplate } from "../../features/resume/resumeSlice.js";
import ModernTemplate from "./templates/ModernTemplate.jsx";
import ClassicTemplate from "./templates/ClassicTemplate.jsx";
import MinimalTemplate from "./templates/MinimalTemplate.jsx";
import CreativeTemplate from "./templates/CreativeTemplate.jsx";
import ExecutiveTemplate from "./templates/ExecutiveTemplate.jsx";
import TechTemplate from "./templates/TechTemplate.jsx";
import ElegantTemplate from "./templates/ElegantTemplate.jsx";




const templateMap = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  creative: CreativeTemplate,
  executive: ExecutiveTemplate,
  tech: TechTemplate,
  elegant: ElegantTemplate,
};

const ResumePreview = ({ scale = 1, id = "resume-preview" }) => {
  const resumeData = useSelector(selectActiveResumeData);
  const currentTemplate = useSelector(selectCurrentTemplate);

  const templateId = resumeData?.template || currentTemplate || "modern";
  const TemplateComponent = templateMap[templateId] || ModernTemplate;

  return (
    <div
      id={id}
      className="bg-white shadow-strong rounded-lg overflow-hidden"
      style={{
        width: "210mm",
        minHeight: "297mm",
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        fontFamily: resumeData?.font?.family || "Inter",
      }}
    >
      <TemplateComponent data={resumeData} />
    </div>
  );
};

export default ResumePreview;
