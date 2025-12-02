
'use client';

import Image from 'next/image';

export function LoginBackground() {
  return (
    <>
      <Image
        src="/background.jpg"
        alt="Background image"
        fill
        sizes="100vw"
        style={{
          objectFit: 'cover',
        }}
        className="-z-10"
        data-ai-hint="devops infrastructure"
      />
      <div className="absolute inset-0 bg-black/50 -z-10" />
    </>
  );
}
