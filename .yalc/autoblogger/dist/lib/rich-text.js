"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib/rich-text.ts
var rich_text_exports = {};
__export(rich_text_exports, {
  markdownToContentfulRichText: () => markdownToContentfulRichText,
  markdownToPortableText: () => markdownToPortableText,
  markdownToPrismicRichText: () => markdownToPrismicRichText
});
module.exports = __toCommonJS(rich_text_exports);
var import_marked = require("marked");
function markdownToPrismicRichText(markdown) {
  const tokens = import_marked.marked.lexer(markdown);
  const result = [];
  function processInlineTokens(tokens2) {
    let text = "";
    const spans = [];
    for (const token of tokens2) {
      if (token.type === "text") {
        text += token.text;
      } else if (token.type === "strong") {
        const start = text.length;
        const inner = processInlineTokens(token.tokens || []);
        text += inner.text;
        spans.push({ type: "strong", start, end: text.length });
        spans.push(...inner.spans.map((s) => ({ ...s, start: s.start + start, end: s.end + start })));
      } else if (token.type === "em") {
        const start = text.length;
        const inner = processInlineTokens(token.tokens || []);
        text += inner.text;
        spans.push({ type: "em", start, end: text.length });
        spans.push(...inner.spans.map((s) => ({ ...s, start: s.start + start, end: s.end + start })));
      } else if (token.type === "link") {
        const start = text.length;
        const inner = processInlineTokens(token.tokens || []);
        text += inner.text;
        spans.push({ type: "hyperlink", start, end: text.length, data: { url: token.href } });
        spans.push(...inner.spans.map((s) => ({ ...s, start: s.start + start, end: s.end + start })));
      } else if (token.type === "codespan") {
        text += token.text;
      } else if (token.type === "br") {
        text += "\n";
      }
    }
    return { text, spans };
  }
  for (const token of tokens) {
    if (token.type === "heading") {
      const { text, spans } = processInlineTokens(token.tokens || []);
      result.push({
        type: `heading${token.depth}`,
        text,
        spans
      });
    } else if (token.type === "paragraph") {
      const { text, spans } = processInlineTokens(token.tokens || []);
      result.push({
        type: "paragraph",
        text,
        spans
      });
    } else if (token.type === "list") {
      const listType = token.ordered ? "o-list-item" : "list-item";
      for (const item of token.items) {
        const { text, spans } = processInlineTokens(item.tokens || []);
        result.push({
          type: listType,
          text,
          spans
        });
      }
    } else if (token.type === "blockquote") {
      for (const child of token.tokens || []) {
        if (child.type === "paragraph") {
          const { text, spans } = processInlineTokens(child.tokens || []);
          result.push({
            type: "preformatted",
            text,
            spans
          });
        }
      }
    } else if (token.type === "code") {
      result.push({
        type: "preformatted",
        text: token.text,
        spans: []
      });
    } else if (token.type === "image") {
      result.push({
        type: "image",
        url: token.href,
        alt: token.text || ""
      });
    } else if (token.type === "hr") {
    }
  }
  return result;
}
function markdownToContentfulRichText(markdown) {
  const tokens = import_marked.marked.lexer(markdown);
  const content = [];
  function processInlineTokens(tokens2) {
    const nodes = [];
    for (const token of tokens2) {
      if (token.type === "text") {
        nodes.push({
          nodeType: "text",
          value: token.text,
          marks: [],
          data: {}
        });
      } else if (token.type === "strong") {
        const inner = processInlineTokens(token.tokens || []);
        for (const node of inner) {
          if (node.nodeType === "text") {
            node.marks = [...node.marks || [], { type: "bold" }];
          }
          nodes.push(node);
        }
      } else if (token.type === "em") {
        const inner = processInlineTokens(token.tokens || []);
        for (const node of inner) {
          if (node.nodeType === "text") {
            node.marks = [...node.marks || [], { type: "italic" }];
          }
          nodes.push(node);
        }
      } else if (token.type === "link") {
        nodes.push({
          nodeType: "hyperlink",
          content: processInlineTokens(token.tokens || []),
          data: { uri: token.href }
        });
      } else if (token.type === "codespan") {
        nodes.push({
          nodeType: "text",
          value: token.text,
          marks: [{ type: "code" }],
          data: {}
        });
      } else if (token.type === "br") {
        nodes.push({
          nodeType: "text",
          value: "\n",
          marks: [],
          data: {}
        });
      }
    }
    return nodes;
  }
  for (const token of tokens) {
    if (token.type === "heading") {
      content.push({
        nodeType: `heading-${token.depth}`,
        content: processInlineTokens(token.tokens || []),
        data: {}
      });
    } else if (token.type === "paragraph") {
      content.push({
        nodeType: "paragraph",
        content: processInlineTokens(token.tokens || []),
        data: {}
      });
    } else if (token.type === "list") {
      const listType = token.ordered ? "ordered-list" : "unordered-list";
      content.push({
        nodeType: listType,
        content: token.items.map((item) => ({
          nodeType: "list-item",
          content: [
            {
              nodeType: "paragraph",
              content: processInlineTokens(item.tokens || []),
              data: {}
            }
          ],
          data: {}
        })),
        data: {}
      });
    } else if (token.type === "blockquote") {
      content.push({
        nodeType: "blockquote",
        content: (token.tokens || []).filter((t) => t.type === "paragraph").map((t) => ({
          nodeType: "paragraph",
          content: processInlineTokens(t.tokens || []),
          data: {}
        })),
        data: {}
      });
    } else if (token.type === "code") {
      content.push({
        nodeType: "paragraph",
        content: [
          {
            nodeType: "text",
            value: token.text,
            marks: [{ type: "code" }],
            data: {}
          }
        ],
        data: {}
      });
    } else if (token.type === "hr") {
      content.push({
        nodeType: "hr",
        content: [],
        data: {}
      });
    }
  }
  return {
    nodeType: "document",
    data: {},
    content
  };
}
var keyCounter = 0;
function generateKey() {
  return `k${++keyCounter}`;
}
function markdownToPortableText(markdown) {
  keyCounter = 0;
  const tokens = import_marked.marked.lexer(markdown);
  const result = [];
  function processInlineTokens(tokens2, markDefs) {
    const spans = [];
    for (const token of tokens2) {
      if (token.type === "text") {
        spans.push({
          _type: "span",
          _key: generateKey(),
          text: token.text,
          marks: []
        });
      } else if (token.type === "strong") {
        const inner = processInlineTokens(token.tokens || [], markDefs);
        for (const span of inner) {
          span.marks = [...span.marks || [], "strong"];
        }
        spans.push(...inner);
      } else if (token.type === "em") {
        const inner = processInlineTokens(token.tokens || [], markDefs);
        for (const span of inner) {
          span.marks = [...span.marks || [], "em"];
        }
        spans.push(...inner);
      } else if (token.type === "link") {
        const linkKey = generateKey();
        markDefs?.push({ _type: "link", _key: linkKey, href: token.href });
        const inner = processInlineTokens(token.tokens || [], markDefs);
        for (const span of inner) {
          span.marks = [...span.marks || [], linkKey];
        }
        spans.push(...inner);
      } else if (token.type === "codespan") {
        spans.push({
          _type: "span",
          _key: generateKey(),
          text: token.text,
          marks: ["code"]
        });
      } else if (token.type === "br") {
        spans.push({
          _type: "span",
          _key: generateKey(),
          text: "\n",
          marks: []
        });
      }
    }
    return spans;
  }
  function getStyle(token) {
    if (token.type === "heading") {
      return `h${token.depth}`;
    }
    if (token.type === "blockquote") {
      return "blockquote";
    }
    return "normal";
  }
  for (const token of tokens) {
    if (token.type === "heading" || token.type === "paragraph") {
      const markDefs = [];
      const children = processInlineTokens(token.tokens || [], markDefs);
      result.push({
        _type: "block",
        _key: generateKey(),
        style: getStyle(token),
        markDefs,
        children: children.length ? children : [{ _type: "span", _key: generateKey(), text: "", marks: [] }]
      });
    } else if (token.type === "list") {
      const listItem = token.ordered ? "number" : "bullet";
      for (const item of token.items) {
        const markDefs = [];
        const children = processInlineTokens(item.tokens || [], markDefs);
        result.push({
          _type: "block",
          _key: generateKey(),
          style: "normal",
          listItem,
          level: 1,
          markDefs,
          children: children.length ? children : [{ _type: "span", _key: generateKey(), text: "", marks: [] }]
        });
      }
    } else if (token.type === "blockquote") {
      for (const child of token.tokens || []) {
        if (child.type === "paragraph") {
          const markDefs = [];
          const children = processInlineTokens(child.tokens || [], markDefs);
          result.push({
            _type: "block",
            _key: generateKey(),
            style: "blockquote",
            markDefs,
            children: children.length ? children : [{ _type: "span", _key: generateKey(), text: "", marks: [] }]
          });
        }
      }
    } else if (token.type === "code") {
      result.push({
        _type: "block",
        _key: generateKey(),
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: generateKey(),
            text: token.text,
            marks: ["code"]
          }
        ]
      });
    } else if (token.type === "image") {
      result.push({
        _type: "image",
        _key: generateKey(),
        asset: { url: token.href },
        alt: token.text || void 0
      });
    }
  }
  return result;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  markdownToContentfulRichText,
  markdownToPortableText,
  markdownToPrismicRichText
});
//# sourceMappingURL=rich-text.js.map