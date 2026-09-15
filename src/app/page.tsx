import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 space-y-8 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-primary text-white flex items-center justify-center shadow-card">
        <BookOpen className="w-8 h-8" />
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-ink dark:text-paper-100 tracking-tight leading-tight">
          Welcome to Bookbari
        </h1>
        
        <p className="text-lg text-ink-muted dark:text-paper-400 max-w-xl mx-auto leading-relaxed">
          An intuitive in-house book lending library tracker. Easily search books, view current availabilities, and manage borrowings.
        </p>
      </div>

      <div className="pt-4 flex justify-center">
        <Link
          href="/books"
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-base shadow-card transition-all transform hover:-translate-y-0.5"
        >
          Go to Library <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
