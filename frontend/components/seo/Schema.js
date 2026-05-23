"use client";

import Script from "next/script";

export function Schema({ type, data }) {
  if (!data) return null;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <Script
      id={`schema-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
