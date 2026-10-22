import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
    />
  </div>
);

export const MultiSelectDropdown: React.FC<{
  label: string;
  hint?: string;
  placeholder: string;
  options: Array<{ id: string; label: string }>;
  selected: string[];
  onToggle: (id: string) => void;
}> = ({ label, hint, placeholder, options, selected, onToggle }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const summary =
    selected.length === 0
      ? placeholder
      : selected
          .map((id) => options.find((option) => option.id === id)?.label)
          .filter(Boolean)
          .join('、');

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center justify-between mb-1">
        <label className="text-gray-700 font-medium">{label}</label>
        {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-1 focus:ring-[#1E5ABB]"
      >
        <span className={`truncate ${selected.length ? 'text-gray-800' : 'text-gray-400'}`}>{summary}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg p-1">
          {options.map((option) => {
            const checked = selected.includes(option.id);
            return (
              <label
                key={option.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
                  checked ? 'bg-blue-50 text-[#1E5ABB]' : 'hover:bg-slate-50 text-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(option.id)}
                  className="rounded text-[#1E5ABB] focus:ring-[#1E5ABB] w-3.5 h-3.5"
                />
                <span className="truncate">{option.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
