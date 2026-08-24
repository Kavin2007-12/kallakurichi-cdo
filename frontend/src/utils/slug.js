// SEO Slug Generator for News and Public Links
export const createNewsSlug = (title, id) => {
  if (!title || typeof title !== 'string') return String(id || '');
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || String(id || '');
};
