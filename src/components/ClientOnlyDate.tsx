
'use client';

import { useState, useEffect } from 'react';

interface ClientOnlyDateProps {
  date: string | Date;
}

export function ClientOnlyDate({ date }: ClientOnlyDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or null during server-side rendering and initial client render
    // to prevent hydration mismatch.
    return null;
  }

  const d = new Date(date);
  const dateString = d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
  });
  const timeString = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
  });


  return (
    <>
      {dateString}
      <br />
      {timeString}
    </>
  );
}

