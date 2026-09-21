import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-paper-200 dark:bg-charcoal-50 p-1 rounded-full border border-paper-300 dark:border-charcoal-300">
      <button
        onClick={() => setTheme('light')}
        title="Light Mode"
        className={`p-1.5 rounded-full transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-charcoal-200 text-ink dark:text-paper-100 shadow-subtle'
            : 'text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100'
        }`}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        title="System Preference"
        className={`p-1.5 rounded-full transition-colors ${
          theme === 'system'
            ? 'bg-white dark:bg-charcoal-200 text-ink dark:text-paper-100 shadow-subtle'
            : 'text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100'
        }`}
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        title="Dark Mode"
        className={`p-1.5 rounded-full transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-charcoal-200 text-ink dark:text-paper-100 shadow-subtle'
            : 'text-ink-muted hover:text-ink dark:text-paper-400 dark:hover:text-paper-100'
        }`}
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
