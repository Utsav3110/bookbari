import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

interface BookImageProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  iconClassName?: string;
  fallbackTitle?: string;
}

/**
 * Ensures public image URLs have proper protocol (https://) if omitted by user
 */
export const sanitizeImageUrl = (url?: string): string | undefined => {
  if (!url || typeof url !== 'string') return undefined;
  let trimmed = url.trim();
  if (!trimmed) return undefined;
  // If user pasted a URL without protocol like "images.unsplash.com/...", prepend https://
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed.replace(/^\/+/, '')}`;
  }
  return trimmed;
};

export const BookImage: React.FC<BookImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full flex flex-col items-center justify-center p-3 text-center text-ink-muted dark:text-paper-400 bg-paper-200 dark:bg-charcoal-50',
  iconClassName = 'w-10 h-10 opacity-30',
  fallbackTitle,
}) => {
  const [imageError, setImageError] = useState(false);
  const formattedUrl = sanitizeImageUrl(src);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  if (!formattedUrl || imageError) {
    return (
      <div className={containerClassName}>
        <BookOpen className={iconClassName} />
        {fallbackTitle && (
          <span className="mt-1 text-[11px] font-serif font-semibold line-clamp-2 px-1 opacity-80">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={formattedUrl}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};
