// utils/pdfExport.js
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const UNSUPPORTED_COLOR_PATTERN = /(oklab|oklch|lab\(|color\()/i;

const isUnsupportedColor = (value) =>
  typeof value === "string" && UNSUPPORTED_COLOR_PATTERN.test(value);

const safeColorValue = (prop, value) => {
  if (!isUnsupportedColor(value)) return value;

  if (prop.toLowerCase().includes("backgroundimage")) return "none";
  if (prop.toLowerCase().includes("background")) return "#ffffff";
  if (prop.toLowerCase().includes("border") || prop.toLowerCase().includes("outline")) return "#e2e8f0";
  if (prop.toLowerCase().includes("shadow")) return "none";
  if (prop === "fill" || prop === "stroke") return "#1e293b";
  return "#1e293b";
};

const extractFirstColor = (value) => {
  if (typeof value !== "string") return null;

  const hexMatch = value.match(/#[0-9a-f]{3,8}/i);
  if (hexMatch) return hexMatch[0];

  const rgbMatch = value.match(/rgba?\([^)]+\)/i);
  if (rgbMatch) return rgbMatch[0];

  return null;
};

const isGradientText = (sourceEl, computedStyle) => {
  const className = String(sourceEl.className || "");
  const backgroundClip = computedStyle.webkitBackgroundClip || computedStyle.backgroundClip;

  return (
    className.includes("bg-clip-text") ||
    backgroundClip === "text" ||
    computedStyle.webkitTextFillColor === "transparent"
  );
};

const isBlurDecoration = (sourceEl) => {
  const className = String(sourceEl.className || "");
  const hasText = sourceEl.textContent?.trim();

  return (
    sourceEl.tagName === "DIV" &&
    !hasText &&
    className.includes("absolute") &&
    className.includes("blur-")
  );
};

const setImportantStyle = (el, prop, value) => {
  if (!el?.style) return;
  el.style.setProperty(prop, value, "important");
};

const normalizeResumeLayoutForExport = (root) => {
  if (!root) return;

  root.querySelectorAll("svg").forEach((svg) => {
    setImportantStyle(svg, "display", "block");
    setImportantStyle(svg, "flex-shrink", "0");
    setImportantStyle(svg, "vertical-align", "middle");
    setImportantStyle(svg, "position", "relative");
    setImportantStyle(svg, "top", "2px");
  });

  root.querySelectorAll("span, div").forEach((el) => {
    const directSvg = Array.from(el.children || []).find((child) => child.tagName === "svg");
    if (!directSvg) return;

    setImportantStyle(el, "display", "inline-flex");
    setImportantStyle(el, "align-items", "center");
    setImportantStyle(el, "gap", "4px");
    setImportantStyle(el, "line-height", "1");
    setImportantStyle(el, "vertical-align", "middle");
    setImportantStyle(el, "white-space", "nowrap");
  });

  root.querySelectorAll("h1").forEach((nameEl) => {
    const jobTitle = nameEl.nextElementSibling;
    if (!jobTitle || jobTitle.tagName !== "P") return;

    setImportantStyle(nameEl, "line-height", "1.12");
    setImportantStyle(nameEl, "margin-bottom", "0");
    setImportantStyle(jobTitle, "display", "block");
    setImportantStyle(jobTitle, "margin-top", "16px");
    setImportantStyle(jobTitle, "padding-top", "4px");
    setImportantStyle(jobTitle, "line-height", "1.25");

    const contactRow = jobTitle.nextElementSibling;
    if (contactRow) {
      setImportantStyle(contactRow, "margin-top", "18px");
      setImportantStyle(contactRow, "padding-top", "2px");
      setImportantStyle(contactRow, "align-items", "center");
    }
  });
};

const copyExportStyles = (sourceRoot, targetRoot) => {
  if (!sourceRoot || !targetRoot) return;

  const sourceElements = [sourceRoot, ...sourceRoot.querySelectorAll("*")];
  const targetElements = [targetRoot, ...targetRoot.querySelectorAll("*")];
  const propsToCopy = [
    "alignItems", "background", "backgroundColor", "backgroundImage", "backgroundPosition",
    "backgroundRepeat", "backgroundSize", "border", "borderBottom", "borderBottomColor",
    "borderBottomLeftRadius", "borderBottomRightRadius", "borderBottomStyle", "borderBottomWidth",
    "borderColor", "borderLeft", "borderLeftColor", "borderLeftStyle", "borderLeftWidth",
    "borderRadius", "borderRight", "borderRightColor", "borderRightStyle", "borderRightWidth",
    "borderStyle", "borderTop", "borderTopColor", "borderTopLeftRadius", "borderTopRightRadius",
    "borderTopStyle", "borderTopWidth", "borderWidth", "bottom", "boxShadow", "boxSizing",
    "color", "columnGap", "display", "fill", "flex", "flexBasis", "flexDirection", "flexGrow",
    "flexShrink", "flexWrap", "fontFamily", "fontSize", "fontStyle", "fontWeight", "gap",
    "gridTemplateColumns", "height", "justifyContent", "left", "letterSpacing", "lineHeight",
    "margin", "marginBottom", "marginLeft", "marginRight", "marginTop", "maxHeight", "maxWidth",
    "minHeight", "minWidth", "objectFit", "opacity", "outlineColor", "overflow", "padding",
    "paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "position", "right", "rowGap",
    "stroke", "textAlign", "textDecoration", "textTransform", "top", "transform", "transformOrigin",
    "verticalAlign", "WebkitBackgroundClip", "webkitBackgroundClip", "WebkitTextFillColor",
    "webkitTextFillColor", "whiteSpace", "width", "wordBreak", "zIndex",
  ];

  sourceElements.forEach((sourceEl, index) => {
    const targetEl = targetElements[index];
    if (!targetEl?.style) return;

    if (isBlurDecoration(sourceEl)) {
      targetEl.style.display = "none";
      return;
    }

    const computedStyle = window.getComputedStyle(sourceEl);
    propsToCopy.forEach((prop) => {
      const value = safeColorValue(prop, computedStyle[prop]);
      if (value) targetEl.style[prop] = value;
    });

    if (isGradientText(sourceEl, computedStyle)) {
      const fallbackColor = extractFirstColor(computedStyle.backgroundImage) || "#6366f1";
      targetEl.style.background = "none";
      targetEl.style.backgroundImage = "none";
      targetEl.style.color = fallbackColor;
      targetEl.style.webkitTextFillColor = fallbackColor;
      targetEl.style.webkitBackgroundClip = "initial";
      targetEl.style.backgroundClip = "initial";
    }

    targetEl.style.filter = "none";
    targetEl.style.backdropFilter = "none";
    targetEl.style.webkitBackdropFilter = "none";
    targetEl.style.transition = "none";
    targetEl.style.animation = "none";
    targetEl.style.webkitPrintColorAdjust = "exact";
    targetEl.style.printColorAdjust = "exact";
  });

  normalizeResumeLayoutForExport(targetRoot);
};

// Helper to sanitize colors before rendering
const sanitizeElementForExport = (element) => {
  if (!element) return null;
  
  const problematicStyles = [];
  
  // Recursively process all elements
  const processElement = (el) => {
    if (!el || !el.style) return;
    
    const computedStyle = window.getComputedStyle(el);
    const originalStyles = {};
    
    // Check for problematic color formats
    const colorProps = [
      'color', 'background', 'backgroundColor', 'backgroundImage',
      'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor',
      'borderLeftColor', 'outlineColor', 'boxShadow', 'textShadow', 'fill', 'stroke'
    ];
    
    colorProps.forEach(prop => {
      const value = computedStyle[prop];
      if (isUnsupportedColor(value)) {
        // Store original style
        originalStyles[prop] = el.style[prop];
        // Replace with safe fallback
        el.style[prop] = safeColorValue(prop, value);
        
        problematicStyles.push({ el, prop, original: originalStyles[prop] });
      }
    });
    
    // Recursively process children
    if (el.children) {
      Array.from(el.children).forEach(child => processElement(child));
    }
  };
  
  processElement(element);
  
  // Return cleanup function
  return () => {
    problematicStyles.forEach(({ el, prop, original }) => {
      if (original !== undefined) el.style[prop] = original;
      else el.style.removeProperty(prop);
    });
  };
};

export const exportToPDF = async (elementId, filename = "resume.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Resume element not found");
  }

  // Show loading indicator
  const loadingToast = showLoadingToast();
  let cloneContainer = null;
  let cleanup = null;
  
  try {
    // Clone the element to avoid modifying the original
    cloneContainer = document.createElement('div');
    cloneContainer.style.position = 'absolute';
    cloneContainer.style.left = '-9999px';
    cloneContainer.style.top = '0';
    cloneContainer.style.backgroundColor = '#ffffff';
    
    const clone = element.cloneNode(true);
    cloneContainer.appendChild(clone);
    document.body.appendChild(cloneContainer);
    normalizeResumeLayoutForExport(clone);
    
    // Sanitize the clone to remove problematic colors
    cleanup = sanitizeElementForExport(clone);
    
    // Add safe styles to the clone
    const safeStyles = document.createElement('style');
    safeStyles.textContent = `
      * {
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      [style*="oklab"], [style*="oklch"] {
        color: #1e293b !important;
        background-color: #ffffff !important;
        border-color: #e2e8f0 !important;
      }
    `;
    clone.appendChild(safeStyles);
    
    // Wait for any fonts or images to load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const canvas = await html2canvas(clone, {
      scale: 2.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
      onclone: (_clonedDoc, clonedElement) => {
        copyExportStyles(clone, clonedElement);
      }
    });
    
    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    
    let finalWidth = pdfWidth;
    let finalHeight = pdfWidth / ratio;
    
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    
    // Handle multi-page resumes
    if (finalHeight > pdfHeight) {
      let yPosition = 0;
      let pageNumber = 0;
      
      while (yPosition < finalHeight) {
        if (pageNumber > 0) {
          pdf.addPage();
        }
        
        const sourceY = (yPosition / finalHeight) * imgHeight;
        const sourceHeight = Math.min((pdfHeight / finalHeight) * imgHeight, imgHeight - sourceY);
        
        // Create a temporary canvas for this page
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;
        
        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          imgWidth,
          sourceHeight,
          0,
          0,
          imgWidth,
          sourceHeight
        );
        
        const pageImgData = pageCanvas.toDataURL("image/jpeg", 1.0);
        pdf.addImage(pageImgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        
        yPosition += pdfHeight;
        pageNumber++;
        
        // Clean up page canvas
        pageCanvas.remove();
      }
    } else {
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      // Center the content on the page if it's smaller
      const yOffset = (pdfHeight - finalHeight) / 2;
      pdf.addImage(imgData, "JPEG", 0, yOffset > 0 ? yOffset : 0, finalWidth, finalHeight);
    }
    
    pdf.save(filename);
    hideLoadingToast(loadingToast);
    return true;
  } catch (error) {
    console.error("PDF export error:", error);
    hideLoadingToast(loadingToast);
    throw new Error("Unable to export PDF. Please check the browser console for the export error.");
  } finally {
    if (cleanup) cleanup();
    if (cloneContainer?.parentNode) {
      cloneContainer.parentNode.removeChild(cloneContainer);
    }
  }
};

// Helper functions for loading toast
const showLoadingToast = () => {
  const toastId = setTimeout(() => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = 'Generating PDF...';
    document.body.appendChild(toast);
    window.__pdfToast = toast;
  }, 100);
  return toastId;
};

const hideLoadingToast = (toastId) => {
  clearTimeout(toastId);
  if (window.__pdfToast) {
    window.__pdfToast.remove();
    delete window.__pdfToast;
  }
};

export const getResumeFilename = (resume) => {
  try {
    let name = "resume";
    
    if (resume?.personalInfo) {
      const firstName = resume.personalInfo.firstName || "";
      const lastName = resume.personalInfo.lastName || "";
      name = `${firstName}_${lastName}`.trim();
    } else if (resume?.title) {
      name = resume.title;
    }
    
    const cleanName = name.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "resume";
    const date = new Date().toISOString().split("T")[0];
    return `${cleanName}_resume_${date}.pdf`;
  } catch (error) {
    return `resume_${Date.now()}.pdf`;
  }
};
