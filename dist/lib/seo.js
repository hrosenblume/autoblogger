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

// src/lib/seo.ts
var seo_exports = {};
__export(seo_exports, {
  getSeoValues: () => getSeoValues
});
module.exports = __toCommonJS(seo_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getSeoValues
});
//# sourceMappingURL=seo.js.map