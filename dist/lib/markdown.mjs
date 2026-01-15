// src/lib/markdown.ts
import { marked } from "marked";
import TurndownService from "turndown";
import sanitizeHtml from "sanitize-html";
marked.setOptions({
  gfm: true,
  breaks: false
});
function renderMarkdown(markdown) {
  return marked.parse(markdown);
}
function markdownToHtml(markdown) {
  return marked.parse(markdown, { gfm: true, breaks: true });
}
function parseMarkdown(markdown) {
  return marked.lexer(markdown);
}
var turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-"
});
function htmlToMarkdown(html) {
  return turndownService.turndown(html);
}
function wordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
function generateSlug(title) {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 60);
}
function renderMarkdownSanitized(markdown) {
  const html = renderMarkdown(markdown);
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title"],
      a: ["href", "target", "rel"]
    }
  });
}
export {
  generateSlug,
  htmlToMarkdown,
  markdownToHtml,
  parseMarkdown,
  renderMarkdown,
  renderMarkdownSanitized,
  wordCount
};
//# sourceMappingURL=markdown.mjs.map