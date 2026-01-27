import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const getDayNumber = (dateStr: string): number => {
  const date = new Date(dateStr);
  return date.getDate();
};

export const grades = [
  'VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'
];

export const rpeDescriptions = [
  '1 - Effortless', '2 - Very Easy', '3 - Easy', '4 - Moderate',
  '5 - Challenging', '6 - Hard', '7 - Very Hard', '8 - Near Limit',
  '9 - Limit', '10 - Failure'
];
