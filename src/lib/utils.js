import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Very minimal HTML sanitizer for safe newsletter rendering on client:
// - strips <script> tags
// - strips inline event handlers (on*)
// This is NOT a full sanitizer but reduces common XSS vectors without
// introducing new dependencies.
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';
  let safe = html;
  // Remove script tags
  safe = safe.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  // Remove inline event handlers like onclick, onerror, etc.
  safe = safe.replace(/\son\w+="[^"]*"/gi, '');
  safe = safe.replace(/\son\w+='[^']*'/gi, '');
  return safe;
}

