import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getDaysOverdue(dueDate: Date | string): number {
  const due = new Date(dueDate).getTime();
  const now = new Date().getTime();
  const diffTime = now - due;
  if (diffTime <= 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDaysRemaining(dueDate: Date | string): number {
  const due = new Date(dueDate).getTime();
  const now = new Date().getTime();
  const diffTime = due - now;
  if (diffTime <= 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: Date | string, returnDate?: Date | string | null): boolean {
  if (returnDate) return false;
  return new Date(dueDate).getTime() < new Date().getTime();
}
