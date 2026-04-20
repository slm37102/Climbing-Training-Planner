import React, { useState } from 'react';
import { AlertTriangle, X, HandMetal, Activity, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils';
import type { RehabGoal } from '../types';
import {
  PULLEY_TRIAGE_STEPS,
  TRIAGE_OUTCOME_COPY,
  TRIAGE_DISCLAIMER,
  type TriageOutcome,
  type TriageQuestion,
} from '../data/pulleyTriage';
import { REHAB_PROTOCOLS } from '../data/rehabProtocols';

interface PulleyPopModalProps {
  open: boolean;
  onClose: () => void;
  onCreateRehabGoal?: (phase: RehabGoal['phase']) => void;
}

type Step =
  | { kind: 'intro' }
  | { kind: 'question'; questionId: string }
  | { kind: 'outcome'; outcome: TriageOutcome };

const findQuestion = (id: string): TriageQuestion | undefined =>
  PULLEY_TRIAGE_STEPS.find(q => q.id === id);

const Disclaimer: React.FC = () => (
  <p
    className="text-[11px] leading-snug text-stone-400 italic px-4 py-2 border-t border-stone-800 bg-stone-950"
    data-testid="rehab-disclaimer"
  >
    {TRIAGE_DISCLAIMER}
  </p>
);

const WarningBanner: React.FC = () => (
  <div className="flex items-start gap-2 bg-red-500/10 border-b border-red-500/30 text-red-300 px-4 py-3">
    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
    <p className="text-sm font-medium leading-snug">
      Not medical advice — see a specialist after a suspected pulley injury.
    </p>
  </div>
);

export const PulleyPopModal: React.FC<PulleyPopModalProps> = ({
  open,
  onClose,
  onCreateRehabGoal,
}) => {
  const [step, setStep] = useState<Step>({ kind: 'intro' });
  const [history, setHistory] = useState<Step[]>([]);
  const [showProtocols, setShowProtocols] = useState(false);
  const [protocolPhase, setProtocolPhase] =
    useState<RehabGoal['phase']>('acute');

  if (!open) return null;

  const reset = () => {
    setStep({ kind: 'intro' });
    setHistory([]);
    setShowProtocols(false);
    setProtocolPhase('acute');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const goTo = (next: Step) => {
    setHistory(h => [...h, step]);
    setStep(next);
  };

  const goBack = () => {
    setHistory(h => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setStep(prev);
      return h.slice(0, -1);
    });
  };

  const currentProtocol = REHAB_PROTOCOLS.find(p => p.phase === protocolPhase)!;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pulley-pop-title"
    >
      <div className="bg-stone-900 w-full max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-hidden flex flex-col border border-stone-800">
        {/* Header */}
        <div className="sticky top-0 bg-stone-900 border-b border-stone-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandMetal className="w-5 h-5 text-amber-500" />
            <h2 id="pulley-pop-title" className="text-base font-bold text-white">
              Finger injury self-check
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-stone-800 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <WarningBanner />

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {step.kind === 'intro' && (
            <div className="p-4 space-y-4">
              <p className="text-stone-200 text-sm leading-relaxed">
                Use this quick self-check to decide whether you should see a
                specialist now or begin a conservative rest-and-rehab plan for a
                suspected A2 pulley strain.
              </p>
              <p className="text-stone-400 text-xs leading-relaxed">
                A few yes/no questions — it takes under a minute. If any answer
                is uncertain, err on the side of seeing a professional.
              </p>
              <Button
                onClick={() => goTo({ kind: 'question', questionId: 'pop' })}
                className="w-full py-3"
              >
                Start self-check <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {step.kind === 'question' && (() => {
            const q = findQuestion(step.questionId);
            if (!q) return null;
            return (
              <div className="p-4 space-y-4">
                <h3 className="text-stone-100 text-base font-semibold leading-snug">
                  {q.text}
                </h3>
                <div className="space-y-2">
                  {q.answers.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (a.outcome) {
                          goTo({ kind: 'outcome', outcome: a.outcome });
                        } else if (a.next) {
                          goTo({ kind: 'question', questionId: a.next });
                        }
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 hover:border-amber-500/50 text-stone-100 text-sm transition-colors flex items-center justify-between gap-2"
                    >
                      <span>{a.label}</span>
                      <ChevronRight className="w-4 h-4 text-stone-500 flex-shrink-0" />
                    </button>
                  ))}
                </div>
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={goBack}>
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                )}
              </div>
            );
          })()}

          {step.kind === 'outcome' && (() => {
            const copy = TRIAGE_OUTCOME_COPY[step.outcome];
            const canCreateGoal = step.outcome === 'likely-strain-start-acute';
            const isUrgent = step.outcome === 'see-doctor-now';
            return (
              <div className="p-4 space-y-4">
                <div
                  className={cn(
                    'rounded-lg p-4 border',
                    isUrgent
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-amber-500/10 border-amber-500/30',
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle
                      className={cn(
                        'w-5 h-5',
                        isUrgent ? 'text-red-400' : 'text-amber-400',
                      )}
                    />
                    <h3
                      className={cn(
                        'font-bold text-base',
                        isUrgent ? 'text-red-300' : 'text-amber-300',
                      )}
                    >
                      {copy.headline}
                    </h3>
                  </div>
                  <p className="text-stone-200 text-sm leading-relaxed">
                    {copy.body}
                  </p>
                </div>

                <p className="text-xs text-stone-400 italic leading-snug">
                  {copy.disclaimer}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProtocols(v => !v)}
                  >
                    <Activity className="w-4 h-4" />
                    {showProtocols ? 'Hide rehab phases' : 'Learn about rehab phases'}
                  </Button>
                  {canCreateGoal && onCreateRehabGoal && (
                    <Button
                      size="sm"
                      onClick={() => {
                        onCreateRehabGoal('acute');
                        handleClose();
                      }}
                    >
                      Create rehab goal
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleClose}>
                    Close
                  </Button>
                </div>

                {showProtocols && (
                  <div className="mt-2 border-t border-stone-800 pt-4 space-y-3">
                    <div className="flex gap-2 flex-wrap" role="tablist">
                      {REHAB_PROTOCOLS.map(p => (
                        <button
                          key={p.phase}
                          role="tab"
                          aria-selected={protocolPhase === p.phase}
                          onClick={() => setProtocolPhase(p.phase)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                            protocolPhase === p.phase
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-600',
                          )}
                        >
                          {p.phase}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-4 space-y-3">
                      <div>
                        <h4 className="text-stone-100 font-semibold text-sm">
                          {currentProtocol.title}
                        </h4>
                        <p className="text-stone-400 text-xs mt-0.5">
                          {currentProtocol.durationGuideline}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">
                          Goals
                        </p>
                        <ul className="list-disc pl-4 text-sm text-stone-200 space-y-0.5">
                          {currentProtocol.goals.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-emerald-400/80 mb-1">
                          Do
                        </p>
                        <ul className="list-disc pl-4 text-sm text-stone-200 space-y-0.5">
                          {currentProtocol.dos.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-red-400/80 mb-1">
                          Avoid
                        </p>
                        <ul className="list-disc pl-4 text-sm text-stone-200 space-y-0.5">
                          {currentProtocol.donts.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-xs text-stone-300 bg-stone-900 border border-stone-700 rounded px-3 py-2">
                        <span className="text-stone-500 uppercase tracking-wider text-[10px] mr-2">
                          Climbing load
                        </span>
                        {currentProtocol.climbingLoad}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Persistent disclaimer footer */}
        <Disclaimer />
      </div>
    </div>
  );
};
