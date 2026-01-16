// src/lib/markdown.ts
import { marked, Renderer } from "marked";
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
function createStyledRenderer() {
  const renderer = new Renderer();
  renderer.heading = function(text, level) {
    const classes = {
      1: "text-[22px] leading-tight font-bold mb-4",
      2: "text-lg leading-snug font-bold mt-6 mb-3",
      3: "text-base leading-snug font-bold mt-4 mb-2",
      4: "text-sm leading-snug font-semibold mt-3 mb-1",
      5: "text-sm leading-snug font-semibold mt-2 mb-1",
      6: "text-sm leading-snug font-medium mt-2 mb-1"
    };
    return `<h${level} class="${classes[level] || ""}">${text}</h${level}>
`;
  };
  renderer.paragraph = function(text) {
    return `<p class="mb-3 leading-relaxed">${text}</p>
`;
  };
  renderer.list = function(body, ordered) {
    const tag = ordered ? "ol" : "ul";
    const listClass = ordered ? "list-decimal" : "list-disc";
    return `<${tag} class="${listClass} pl-5 mb-3 space-y-1">${body}</${tag}>
`;
  };
  renderer.listitem = function(text) {
    return `<li>${text}</li>
`;
  };
  renderer.code = function(code, language) {
    const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto mb-3 text-sm font-mono"><code class="language-${language || ""}">${escaped}</code></pre>
`;
  };
  renderer.codespan = function(text) {
    return `<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">${text}</code>`;
  };
  renderer.blockquote = function(quote) {
    return `<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-3">${quote}</blockquote>
`;
  };
  renderer.hr = function() {
    return `<hr class="my-6 border-t border-gray-200 dark:border-gray-700" />
`;
  };
  renderer.link = function(href, _title, text) {
    return `<a href="${href}" class="text-blue-600 dark:text-blue-400 underline">${text}</a>`;
  };
  renderer.image = function(href, _title, text) {
    return `<img src="${href}" alt="${text}" class="rounded-lg max-w-full my-3" />`;
  };
  renderer.strong = function(text) {
    return `<strong class="font-semibold">${text}</strong>`;
  };
  renderer.em = function(text) {
    return `<em class="italic">${text}</em>`;
  };
  renderer.table = function(header, body) {
    return `<table class="w-full border-collapse mb-3"><thead>${header}</thead><tbody>${body}</tbody></table>
`;
  };
  renderer.tablerow = function(content) {
    return `<tr>${content}</tr>
`;
  };
  renderer.tablecell = function(content, flags) {
    const tag = flags.header ? "th" : "td";
    const headerClass = flags.header ? " font-semibold bg-gray-50 dark:bg-gray-800" : "";
    const alignClass = flags.align ? ` text-${flags.align}` : " text-left";
    return `<${tag} class="border border-gray-200 dark:border-gray-700 px-3 py-2${alignClass}${headerClass}">${content}</${tag}>`;
  };
  return renderer;
}
var styledRenderer = createStyledRenderer();
function markdownToStyledHtml(markdown) {
  return marked.parse(markdown, {
    gfm: true,
    breaks: true,
    renderer: styledRenderer
  });
}
function parseMarkdown(markdown) {
  return marked.lexer(markdown);
}
var turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-"
});
turndownService.addRule("strikethrough", {
  filter: (node) => {
    const tagName = node.nodeName.toLowerCase();
    return tagName === "del" || tagName === "s" || tagName === "strike";
  },
  replacement: (content) => `~~${content}~~`
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
  markdownToStyledHtml,
  parseMarkdown,
  renderMarkdown,
  renderMarkdownSanitized,
  wordCount
};
//# sourceMappingURL=markdown.mjs.map