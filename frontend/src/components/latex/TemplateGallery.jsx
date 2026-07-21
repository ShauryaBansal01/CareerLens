import { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

const TEMPLATE_FALLBACKS = [
  { name: 'modern', label: 'Modern', description: 'Clean serif layout with moderate spacing.', bestFor: 'Tech & general use', features: ['11pt serif', '0.5in margins', 'Moderate spacing'] },
  { name: 'compact', label: 'Compact', description: 'Dense, space-efficient layout. Two-column skills.', bestFor: 'Extensive work history', features: ['10pt serif', '0.4in margins', 'Tight spacing'] },
];

const SIZE_MAP = {
  modern: { nameSize: 'text-base', sectionSize: 'text-sm', spacing: 'space-y-2', padding: 'p-4', headingRule: true },
  compact: { nameSize: 'text-sm', sectionSize: 'text-xs', spacing: 'space-y-1', padding: 'p-2.5', smallCaps: true },
};

function PreviewCard({ name, label, description, bestFor, features, selected, onSelect }) {
  const style = SIZE_MAP[name] || SIZE_MAP.modern;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col rounded-xl border-2 transition-all duration-200 text-left ${
        selected
          ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 shadow-md'
          : 'border-border-color bg-bg-card hover:border-accent-300 hover:shadow-sm'
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      <div className={`${style.padding} border-b border-border-color/50`}>
        <div className={`font-serif ${style.nameSize} font-bold text-text-main truncate`}>
          {label}
        </div>
        <div className={`font-serif text-text-muted ${style.spacing} mt-2`}>
          <div className={`${style.sectionSize} font-semibold ${style.uppercase ? 'uppercase' : ''} ${style.bold ? 'font-bold' : ''} ${style.smallCaps ? 'uppercase tracking-wider text-[10px]' : ''}`}>
            Experience
            {style.headingRule && <hr className="mt-0.5 border-border-color" />}
          </div>
          <div className={`${style.sectionSize} text-text-muted/80 ${style.spacing}`}>
            <p>Senior Engineer</p>
            <p>TechCorp Inc. · 2021–Present</p>
          </div>
          <div className={`${style.sectionSize} font-semibold ${style.uppercase ? 'uppercase' : ''} ${style.bold ? 'font-bold' : ''} mt-2`}>
            Education
            {style.headingRule && <hr className="mt-0.5 border-border-color" />}
          </div>
          <div className={`${style.sectionSize} text-text-muted/80`}>
            <p>B.S. Computer Science</p>
          </div>
        </div>
      </div>

      <div className={`${style.padding} space-y-1.5`}>
        <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">{description}</p>
        <p className="text-[10px] font-medium text-accent-600 dark:text-accent-400">{bestFor}</p>
        <div className="flex flex-wrap gap-1 pt-1">
          {features.map((f, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-text-muted">
              {f}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

export default function TemplateGallery({ selected, onSelect, templates }) {
  const [expanded, setExpanded] = useState(false);
  const list = templates && templates.length > 0 ? templates : TEMPLATE_FALLBACKS;
  const current = list.find(t => t.name === selected) || list[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-slate-100 dark:bg-dark-card text-text-main hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors border border-border-color"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
        {current.label}
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />
          <div className="absolute top-full mt-2 left-0 z-50 w-[600px] max-w-[90vw] bg-bg-card border border-border-color rounded-2xl shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text-main">Choose a Template</h3>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-[11px] text-text-muted hover:text-text-main transition-colors"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {list.map(t => (
                <PreviewCard
                  key={t.name}
                  {...t}
                  selected={selected === t.name}
                  onSelect={() => {
                    onSelect(t.name);
                    setExpanded(false);
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
