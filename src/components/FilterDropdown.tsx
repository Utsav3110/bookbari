'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface FilterDropdownProps {
  name: string;
  options: string[];
  defaultValue?: string;
  placeholder: string;
}

export function FilterDropdown({
  name,
  options,
  defaultValue = '',
  placeholder,
}: FilterDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    params.set('page', '1'); // Reset pagination on filter change
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      name={name}
      defaultValue={defaultValue}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full px-3 py-2 bg-paper-100 dark:bg-charcoal-50 border border-paper-300 dark:border-charcoal-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-ink dark:text-paper-100 cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
