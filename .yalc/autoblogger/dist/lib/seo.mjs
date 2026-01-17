// src/lib/format.ts
function truncate(text, maxLength) {
  const stripped = text.replace(/#+\s/g, "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\n+/g, " ").trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength - 3).trim() + "...";
}

// src/lib/seo.ts
function getSeoValues(post) {
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.subtitle || truncate(post.markdown, 160),
    keywords: post.seoKeywords,
    noIndex: post.noIndex,
    ogImage: post.ogImage
  };
}
export {
  getSeoValues
};
//# sourceMappingURL=seo.mjs.map