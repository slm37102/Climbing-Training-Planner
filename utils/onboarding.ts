import type { TrainingPlan } from '../types';
import type { OnboardingProfile } from '../types';

/**
 * Returns the YYYY-MM-DD of the upcoming Monday (same day if `from` is a Monday).
 * Uses local-time components so the returned date string matches the user's calendar.
 */
export function nextMondayISO(from: Date): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const dow = d.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const daysUntilMonday = dow === 1 ? 0 : (1 - dow + 7) % 7;
  d.setDate(d.getDate() + daysUntilMonday);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Case-insensitive substring match against plan.name. */
function findPlanByNameSubstring(
  trainingPlans: TrainingPlan[],
  needle: string
): TrainingPlan | null {
  const n = needle.toLowerCase();
  return trainingPlans.find((p) => p.name.toLowerCase().includes(n)) || null;
}

/**
 * Maps an onboarding profile to a training plan per issue #8's mapping table.
 * Falls back to "Just Climb" for low frequency / "Intro Strength" otherwise.
 */
export function pickPlanForPersona(
  profile: OnboardingProfile,
  trainingPlans: TrainingPlan[]
): TrainingPlan | null {
  const goal = profile.primaryGoal;
  const freq = profile.frequencyPerWeek ?? 0;

  if (goal === 'injury') {
    return findPlanByNameSubstring(trainingPlans, 'post-injury return');
  }

  if (goal === 'compete') {
    return findPlanByNameSubstring(trainingPlans, 'comp prep');
  }

  if (goal === 'fun') {
    return findPlanByNameSubstring(trainingPlans, 'just climb');
  }

  if (goal === 'plateau' && freq >= 3 && freq <= 4) {
    return findPlanByNameSubstring(trainingPlans, 'break v5');
  }

  if (goal === 'project' && freq === 4) {
    return findPlanByNameSubstring(trainingPlans, 'send your project');
  }

  // Fallbacks
  if (freq === 2) {
    return findPlanByNameSubstring(trainingPlans, 'just climb');
  }
  if (freq >= 3) {
    return findPlanByNameSubstring(trainingPlans, 'intro strength');
  }

  return null;
}
