import React from 'react';
import { GLOSSARY } from '../data/glossary';
import { Tooltip } from './Tooltip';

interface TermProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

// Wraps a term in visible copy with a tooltip showing its glossary definition.
// If the id is not in GLOSSARY, renders children untouched (graceful fallback).
export const Term: React.FC<TermProps> = ({ id, children, className }) => {
  const entry = GLOSSARY[id.toLowerCase()];
  if (!entry) return <>{children}</>;

  return (
    <Tooltip
      content={
        <span>
          <strong className="block text-amber-300 mb-0.5">{entry.term}</strong>
          <span>{entry.short}</span>
        </span>
      }
    >
      <button
        type="button"
        className={`inline underline decoration-dotted decoration-stone-500 underline-offset-2 hover:decoration-amber-400 focus:outline-none focus:decoration-amber-400 cursor-help bg-transparent p-0 text-inherit font-inherit ${className ?? ''}`}
        aria-label={`${entry.term}: ${entry.short}`}
      >
        {children}
      </button>
    </Tooltip>
  );
};
