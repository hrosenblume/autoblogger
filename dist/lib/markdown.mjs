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
  parseMarkdown,
  renderMarkdown
};
//# sourceMappingURL=markdown.mjs.map