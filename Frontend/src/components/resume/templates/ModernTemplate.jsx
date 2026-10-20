import { Mail, Phone, MapPin, Linkedin, Github, Globe, ExternalLink } from "lucide-react";

const Section = ({ title, children, color = "#6366f1" }) => (
  <div className="mb-5">
    <div className="flex items-center gap-3 mb-3">
      <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
        {title}
      </h2>
      <div className="flex-1 h-px" style={{ backgroundColor: color, opacity: 0.3 }} />
    </div>
    {children}
  </div>
);

const ModernTemplate = ({ data }) => {
  if (!data) return null;

  const {
    personalInfo = {}, summary, experience = [], education = [],
    skills = [], projects = [], certifications = [], languages = [],
    colorScheme = {}, sectionOrder = [],
  } = data;

  const primary = colorScheme.primary || "#6366f1";
  const secondary = colorScheme.secondary || "#8b5cf6";
  const textColor = colorScheme.text || "#1f2937";

  const renderSection = (key) => {
    switch (key) {
      case "summary":
        return summary ? (
          <Section key="summary" title="Professional Summary" color={primary}>
            <p className="text-xs leading-relaxed" style={{ color: textColor }}>{summary}</p>
          </Section>
        ) : null;

      case "experience":
        return experience.length > 0 ? (
          <Section key="experience" title="Work Experience" color={primary}>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: `${primary}30` }}>
                  <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
                  <div className="flex flex-wrap items-start justify-between gap-1 mb-1">
                    <div>
                      <h3 className="text-xs font-bold" style={{ color: textColor }}>{exp.position}</h3>
                      <p className="text-xs font-medium" style={{ color: primary }}>{exp.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500">
                        {exp.startDate} – {exp.isCurrentRole ? "Present" : exp.endDate}
                      </p>
                      {exp.location && <p className="text-[10px] text-slate-400">{exp.location}</p>}
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-[11px] text-slate-600 leading-relaxed mb-2">{exp.description}</p>
                  )}
                  {exp.achievements?.length > 0 && (
                    <ul className="space-y-0.5">
                      {exp.achievements.map((ach, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                          <span style={{ color: primary }} className="mt-0.5 flex-shrink-0">▸</span>
                          {ach}
                        </li>
                      ))}
                    </ul>
                  )}
                  {exp.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {exp.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 text-[9px] font-medium rounded"
                          style={{ backgroundColor: `${primary}15`, color: primary }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      case "education":
        return education.length > 0 ? (
          <Section key="education" title="Education" color={primary}>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="flex flex-wrap items-start justify-between gap-1">
                  <div>
                    <h3 className="text-xs font-bold" style={{ color: textColor }}>{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                    <p className="text-xs" style={{ color: primary }}>{edu.institution}</p>
                    {edu.gpa && <p className="text-[10px] text-slate-500">GPA: {edu.gpa}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500">{edu.startDate} – {edu.endDate}</p>
                    {edu.location && <p className="text-[10px] text-slate-400">{edu.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      case "skills":
        return skills.length > 0 ? (
          <Section key="skills" title="Skills" color={primary}>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-2 py-1 text-[10px] font-medium rounded-md"
                  style={{ backgroundColor: `${primary}12`, color: primary, border: `1px solid ${primary}25` }}
                >
                  {skill.name}
                  {skill.level !== "intermediate" && (
                    <span className="opacity-60 ml-1">· {skill.level}</span>
                  )}
                </span>
              ))}
            </div>
          </Section>
        ) : null;

      case "projects":
        return projects.length > 0 ? (
          <Section key="projects" title="Projects" color={primary}>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xs font-bold" style={{ color: textColor }}>{proj.name}</h3>
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} className="text-[10px]" style={{ color: primary }}>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-[11px] text-slate-600 leading-relaxed mb-1">{proj.description}</p>
                  )}
                  {proj.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.map((tech, i) => (
                        <span key={i} className="px-1.5 py-0.5 text-[9px] font-medium rounded"
                          style={{ backgroundColor: `${primary}15`, color: primary }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      case "certifications":
        return certifications.length > 0 ? (
          <Section key="certifications" title="Certifications" color={primary}>
            <div className="space-y-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-semibold" style={{ color: textColor }}>{cert.name}</h3>
                    <p className="text-[11px] text-slate-500">{cert.issuer}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 flex-shrink-0">{cert.date}</p>
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      case "languages":
        return languages.length > 0 ? (
          <Section key="languages" title="Languages" color={primary}>
            <div className="flex flex-wrap gap-3">
              {languages.map((lang) => (
                <div key={lang.id} className="flex items-center gap-1.5">
                  <span className="text-xs font-medium" style={{ color: textColor }}>{lang.name}</span>
                  <span className="text-[10px] text-slate-400 capitalize">· {lang.proficiency}</span>
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      default:
        return null;
    }
  };

  const defaultOrder = ["summary", "experience", "education", "skills", "projects", "certifications", "languages"];
  const order = sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  return (
    <div className="min-h-full" style={{ color: textColor, backgroundColor: colorScheme.background || "#ffffff" }}>
      {/* Header */}
      <div
        className="px-8 py-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

        <div className="relative flex items-start gap-5">
          {/* Profile image */}
          {personalInfo.profileImage && (
            <img
              src={personalInfo.profileImage}
              alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 flex-shrink-0"
            />
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-display leading-tight">
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>
            {personalInfo.jobTitle && (
              <p className="text-white/80 text-sm mt-2 font-medium" style={{ lineHeight: 1.2 }}>{personalInfo.jobTitle}</p>
            )}

            {/* Contact Info */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
              {personalInfo.email && (
                <span className="inline-flex items-center gap-1 text-[11px] text-white/75 leading-none">
                  <Mail className="w-3 h-3 flex-shrink-0" style={{ display: "block" }} />
                  <span>{personalInfo.email}</span>
                </span>
              )}
              {personalInfo.phone && (
                <span className="inline-flex items-center gap-1 text-[11px] text-white/75 leading-none">
                  <Phone className="w-3 h-3 flex-shrink-0" style={{ display: "block" }} />
                  <span>{personalInfo.phone}</span>
                </span>
              )}
              {personalInfo.location && (
                <span className="inline-flex items-center gap-1 text-[11px] text-white/75 leading-none">
                  <MapPin className="w-3 h-3 flex-shrink-0" style={{ display: "block" }} />
                  <span>{personalInfo.location}</span>
                </span>
              )}
              {personalInfo.linkedin && (
                <span className="inline-flex items-center gap-1 text-[11px] text-white/75 leading-none">
                  <Linkedin className="w-3 h-3 flex-shrink-0" style={{ display: "block" }} />
                  <span>{personalInfo.linkedin}</span>
                </span>
              )}
              {personalInfo.github && (
                <span className="inline-flex items-center gap-1 text-[11px] text-white/75 leading-none">
                  <Github className="w-3 h-3 flex-shrink-0" style={{ display: "block" }} />
                  <span>{personalInfo.github}</span>
                </span>
              )}
              {personalInfo.website && (
                <span className="inline-flex items-center gap-1 text-[11px] text-white/75 leading-none">
                  <Globe className="w-3 h-3 flex-shrink-0" style={{ display: "block" }} />
                  <span>{personalInfo.website}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-6">
        {order.map((key) => renderSection(key))}
      </div>
    </div>
  );
};

export default ModernTemplate;
