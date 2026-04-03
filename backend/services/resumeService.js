const { GoogleGenAI } = require('@google/genai');

const DEFAULT_LATEX_TEMPLATE = `
\\documentclass[letterpaper,11pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}
% Content goes here
\\end{document}
`;

exports.generateBaseLatex = async (resumeText) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are an expert resume writer and LaTeX coder. 
I am going to provide you with the extracted text from a user's resume.
Your job is to convert this text into a clean, well-formatted LaTeX resume using a standard professional template (like Jake's Resume).

Here is the extracted resume text:
"""
${resumeText}
"""

Please use the following standard LaTeX template structure as a guide (or something very similar that compiles perfectly):
"""
${DEFAULT_LATEX_TEMPLATE}
"""

Instructions:
1. Parse the unstructured text and identify the Name, Contact Info (Email, Phone, LinkedIn, GitHub), Education, Experience, Projects, and Skills.
2. Fill in the LaTeX template with the extracted information.
3. Use \\resumeSubheading for jobs and education, \\resumeProjectHeading for projects, and \\resumeItemListStart / \\resumeItem for bullet points.
4. Return ONLY the raw LaTeX code. Do not include markdown blocks like \`\`\`latex. Ensure it starts with \\documentclass and ends with \\end{document}.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Clean up potential markdown blocks if the model ignores the instruction
    let latexCode = response.text;
    if (latexCode.startsWith('\`\`\`latex')) {
      latexCode = latexCode.replace(/^\`\`\`latex\n/, '').replace(/\n\`\`\`$/, '');
    } else if (latexCode.startsWith('\`\`\`')) {
      latexCode = latexCode.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
    }

    return latexCode;
  } catch (error) {
    console.error('Error generating base LaTeX:', error);
    throw new Error('Failed to generate base LaTeX');
  }
};

exports.tailorLatex = async (baseLatex, jobDescription) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are an expert career coach and technical recruiter.
I will provide you with a user's resume in LaTeX format and a Job Description (JD).
Your task is to tailor the resume to the JD to maximize the applicant's chances of getting an interview.

Job Description:
"""
${jobDescription}
"""

User's Base LaTeX Resume:
"""
${baseLatex}
"""

Instructions:
1. Identify the key skills, technologies, and buzzwords in the Job Description.
2. Rewrite the bullet points in the "Experience" and "Projects" sections of the LaTeX resume to highlight relevant accomplishments and align with the JD's keywords. Use the STAR method (Situation, Task, Action, Result) where possible, focusing on impact and metrics.
3. Reorder the "Skills" section to put the most relevant skills for the JD first.
4. Modify the summary/objective (if one exists) to directly address the JD.
5. DO NOT hallucinate fake jobs or degrees. You may rephrase and emphasize existing experience.
6. PRESERVE the exact LaTeX formatting and macros (e.g., \\resumeSubheading, \\resumeItem). Ensure the code still compiles perfectly.
7. Return ONLY the complete, valid tailored LaTeX code. Do not include markdown blocks like \`\`\`latex. Ensure it starts with \\documentclass and ends with \\end{document}.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let tailoredLatexCode = response.text;
    if (tailoredLatexCode.startsWith('\`\`\`latex')) {
      tailoredLatexCode = tailoredLatexCode.replace(/^\`\`\`latex\n/, '').replace(/\n\`\`\`$/, '');
    } else if (tailoredLatexCode.startsWith('\`\`\`')) {
      tailoredLatexCode = tailoredLatexCode.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
    }

    return tailoredLatexCode;
  } catch (error) {
    console.error('Error tailoring LaTeX:', error);
    throw new Error('Failed to tailor LaTeX resume');
  }
};
