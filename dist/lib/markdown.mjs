// src/lib/markdown.ts
import { marked } from "marked";
import TurndownService from "turndown";
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
export {
  htmlToMarkdown,
  markdownToHtml,
  parseMarkdown,
  renderMarkdown
};
//# sourceMappingURL=markdown.mjs.map