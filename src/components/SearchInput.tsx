'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export function SearchInput({
  placeholder = 'Search...',
  defaultValue = '',
  className = '',
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [text, setText] = useState(defaultValue);

  useEffect(() => {
    setText(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (term: string) => {
    setText(term);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (term.trim()) {
        params.set('q', term.trim());
      } else {
        params.delete('q');
      }
      params.set('page', '1'); // Reset pagination to page 1 on new search

      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setText('');
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      params.set('page', '1');
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-4 h-4 absolute left-3 text-ink-muted dark:text-paper-400 pointer-events-none" />
      <input
        type="text"
        value={text}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 bg-white dark:bg-charcoal-200 border border-paper-300 dark:border-charcoal-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-ink dark:text-paper-100 shadow-subtle transition-all"
      />
      {isPending ? (
        <Loader2 className="w-4 h-4 absolute right-3 text-primary animate-spin" />
      ) : text ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100 p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  );
}
