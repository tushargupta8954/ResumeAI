import { Mail, Phone, MapPin, Linkedin, Github, Globe, ExternalLink, Award, Sparkles, Heart } from "lucide-react";

const Section = ({ title, children, color = "#f43f5e" }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color }} />
      <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color }}>
        {title}
      </h2>
    </div>
    {children}
  </div>
);

const CreativeTemplate = ({ data }) => {
  if (!data) return null;

  const {
    personalInfo = {}, summary, experience = [], education = [],
    skills = [], projects = [], certifications = [], languages = [],
    colorScheme = {}, sectionOrder = [],
  } = data;

  const primary = colorScheme.primary || "#f43f5e";
  const secondary = colorScheme.secondary || "#f97316";
  const accent = colorScheme.accent || "#8b5cf6";
  const textColor = colorScheme.text || "#1e293b";

  const renderSection = (key) => {
    switch (key) {
      case "summary":
        return summary ? (
          <Section key="summary" title="About Me" color={primary}>
            <div className="relative">
              <Sparkles className="absolute -top-1 -left-1 w-4 h-4" style={{ color: primary }} />
              <p className="text-sm leading-relaxed pl-5" style={{ color: textColor }}>{summary}</p>
            </div>
          </Section>
        ) : null;

      case "experience":
        return experience.length > 0 ? (
          <Section key="experience" title="Creative Journey" color={primary}>
            <div className="space-y-5">
              {experience.map((exp, idx) => (
                <div key={exp.id} className="relative">
                  <div className="absolute -left-1.5 top-5 w-2 h-2 rounded-full" style={{ backgroundColor: primary }} />
                  <div className="pl-5">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: textColor }}>{exp.position}</h3>
                        <p className="text-xs font-medium" style={{ color: secondary }}>{exp.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500">
                          {exp.startDate} – {exp.isCurrentRole ? "Present" : exp.endDate}
                        </p>
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">{exp.description}</p>
                    )}
                    {exp.achievements?.length > 0 && (
                      <ul className="space-y-1">
                        {exp.achievements.map((ach, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="text-sm flex-shrink-0">✦</span>
                            {ach}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      case "education":
        return education.length > 0 ? (
          <Section key="education" title="Learning Path" color={primary}>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="flex flex-wrap items-start justify-between gap-2 border-l-2 pl-3" style={{ borderColor: `${primary}30` }}>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: textColor }}>{edu.degree}</h3>
                    <p className="text-xs" style={{ color: secondary }}>{edu.institution}</p>
                    {edu.gpa && <p className="text-[10px] text-slate-500">GPA: {edu.gpa}</p>}
                  </div>
                  <p className="text-[10px] text-slate-500">{edu.startDate} – {edu.endDate}</p>
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      case "skills":
        return skills.length > 0 ? (
          <Section key="skills" title="Creative Arsenal" color={primary}>
            <div className="grid grid-cols-2 gap-2">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-2">
                  <Heart className="w-3 h-3" style={{ color: primary }} />
                  <span className="text-xs font-medium" style={{ color: textColor }}>{skill.name}</span>
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      case "projects":
        return projects.length > 0 ? (
          <Section key="projects" title="Featured Work" color={primary}>
            <div className="grid gap-3">
              {projects.map((proj) => (
                <div key={proj.id} className="p-3 rounded-lg" style={{ backgroundColor: `${primary}08`, borderLeft: `3px solid ${primary}` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold" style={{ color: textColor }}>{proj.name}</h3>
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} className="text-[10px]" style={{ color: primary }}>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">{proj.description}</p>
                  )}
                  {proj.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 text-[9px] font-medium rounded-full"
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
          <Section key="certifications" title="Badges & Awards" color={primary}>
            <div className="space-y-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-start gap-2">
                  <Award className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
                  <div>
                    <h3 className="text-xs font-semibold" style={{ color: textColor }}>{cert.name}</h3>
                    <p className="text-[10px] text-slate-500">{cert.issuer} · {cert.date}</p>
                  </div>
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
                <div key={lang.id} className="px-3 py-1 rounded-full" style={{ backgroundColor: `${primary}10`, border: `1px solid ${primary}20` }}>
                  <span className="text-xs font-medium" style={{ color: textColor }}>{lang.name}</span>
                  <span className="text-[10px] ml-1" style={{ color: secondary }}>· {lang.proficiency}</span>
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      default:
        return null;
    }
  };

  const defaultOrder = ["summary", "experience", "projects", "skills", "education", "certifications", "languages"];
  const order = sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  return (
    <div className="min-h-full" style={{ backgroundColor: colorScheme.background || "#fdf8f5" }}>
      {/* Creative Header */}
      <div className="relative px-8 py-8 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primary}10, ${secondary}05)` }} />
        
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ backgroundColor: primary }} />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: secondary }} />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {personalInfo.profileImage && (
            <div className="relative">
              <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(45deg, ${primary}, ${secondary})`, opacity: 0.3 }} />
              <img
                src={personalInfo.profileImage}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 relative z-10"
                style={{ borderColor: primary }}
              />
            </div>
          )}

          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold font-display" style={{ color: textColor }}>
              {personalInfo.firstName} <span style={{ color: primary }}>{personalInfo.lastName}</span>
            </h1>
            {personalInfo.jobTitle && (
              <p className="text-sm mt-2" style={{ color: secondary, lineHeight: 1.2 }}>{personalInfo.jobTitle}</p>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              {personalInfo.email && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 leading-none">
                  <Mail className="w-3 h-3 flex-shrink-0" style={{ color: primary, display: "block" }} />
                  <span>{personalInfo.email}</span>
                </span>
              )}
              {personalInfo.phone && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 leading-none">
                  <Phone className="w-3 h-3 flex-shrink-0" style={{ color: primary, display: "block" }} />
                  <span>{personalInfo.phone}</span>
                </span>
              )}
              {personalInfo.location && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 leading-none">
                  <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: primary, display: "block" }} />
                  <span>{personalInfo.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {order.map((key) => renderSection(key))}
      </div>
    </div>
  );
};

export default CreativeTemplate;
