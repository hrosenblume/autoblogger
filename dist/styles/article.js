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

// src/styles/article.ts
var article_exports = {};
__export(article_exports, {
  ARTICLE_CLASSES: () => ARTICLE_CLASSES,
  ARTICLE_LAYOUT: () => ARTICLE_LAYOUT
});
module.exports = __toCommonJS(article_exports);
var ARTICLE_LAYOUT = {
  maxWidth: 680,
  padding: 24
};
var ARTICLE_CLASSES = {
  container: "max-w-ab-content mx-auto px-ab-content-padding",
  title: "text-ab-title font-bold",
  subtitle: "text-ab-h2 text-muted-foreground",
  byline: "text-sm text-muted-foreground",
  body: "text-ab-body prose dark:prose-invert",
  prose: "prose dark:prose-invert max-w-none"
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ARTICLE_CLASSES,
  ARTICLE_LAYOUT
});
//# sourceMappingURL=article.js.map