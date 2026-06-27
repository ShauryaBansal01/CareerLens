const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add import APIKeySettings
code = code.replace(/import CoverLetter from '\.\/pages\/CoverLetter';/, "import CoverLetter from './pages/CoverLetter';\nimport APIKeySettings from './pages/APIKeySettings';");

// 2. Add Desktop Nav Link
code = code.replace(/<Link to="\/resume-latex" className=\{navLinkClass\('\/resume-latex'\)\}>\n\s*LaTeX Builder\n\s*<\/Link>/, "<Link to=\"/resume-latex\" className={navLinkClass('/resume-latex')}>\n                LaTeX Builder\n              </Link>\n              <Link to=\"/settings/keys\" className={navLinkClass('/settings/keys')}>\n                Keys\n              </Link>");

// 3. Add Mobile Nav Link
code = code.replace(/<Link to="\/resume-latex" onClick=\{closeMenu\} className=\{navLinkClass\('\/resume-latex'\)\}>\n\s*LaTeX Builder\n\s*<\/Link>/, "<Link to=\"/resume-latex\" onClick={closeMenu} className={navLinkClass('/resume-latex')}>\n                    LaTeX Builder\n                  </Link>\n                  <Link to=\"/settings/keys\" onClick={closeMenu} className={navLinkClass('/settings/keys')}>\n                    API Keys\n                  </Link>");

// 4. Add Route
code = code.replace(/<Route path="\/resume-latex" element=\{<PageWrapper><ResumeLatex \/><\/PageWrapper>\} \/>/, "<Route path=\"/resume-latex\" element={<PageWrapper><ResumeLatex /></PageWrapper>} />\n                <Route path=\"/settings/keys\" element={<PageWrapper><APIKeySettings /></PageWrapper>} />");

fs.writeFileSync(filePath, code);
console.log('Successfully refactored App.jsx');
