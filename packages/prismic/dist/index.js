"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  prismicDestination: () => prismicDestination
});
module.exports = __toCommonJS(index_exports);

// src/destination.ts
var import_rich_text = require("autoblogger/rich-text");
var prismic = __toESM(require("@prismicio/client"));
var DEFAULT_FIELD_MAPPING = {
  title: "title",
  subtitle: "subtitle",
  content: "body",
  slug: "uid",
  seoTitle: "seo_title",
  seoDescription: "seo_description",
  publishDate: "publish_date"
};
function createMigrationClient(config) {
  const writeClient = prismic.createWriteClient(config.repository, {
    writeToken: config.writeToken
  });
  return writeClient;
}
function mapPostToStub(post) {
  return {
    title: post.title,
    autoblogger_id: post.id
  };
}
function mapPostToDocument(post, fieldMapping) {
  const mapping = { ...DEFAULT_FIELD_MAPPING, ...fieldMapping };
  const data = {};
  if (mapping.title && post.title) {
    data[mapping.title] = [{ type: "heading1", text: post.title, spans: [] }];
  }
  if (mapping.subtitle && post.subtitle) {
    data[mapping.subtitle] = [{ type: "paragraph", text: post.subtitle, spans: [] }];
  }
  if (mapping.content && post.markdown) {
    data[mapping.content] = (0, import_rich_text.markdownToPrismicRichText)(post.markdown);
  }
  if (mapping.seoTitle && post.seoTitle) {
    data[mapping.seoTitle] = post.seoTitle;
  }
  if (mapping.seoDescription && post.seoDescription) {
    data[mapping.seoDescription] = post.seoDescription;
  }
  if (mapping.publishDate && post.publishedAt) {
    data[mapping.publishDate] = post.publishedAt.toISOString().split("T")[0];
  }
  if (fieldMapping.custom) {
    for (const [postField, prismicField] of Object.entries(fieldMapping.custom)) {
      const value = post[postField];
      if (value !== void 0 && value !== null) {
        data[prismicField] = value;
      }
    }
  }
  return data;
}
function prismicDestination(config) {
  const fieldMapping = config.fieldMapping || {};
  const masterLocale = config.masterLocale || "en-us";
  const syncMode = config.syncMode || "full";
  const getDocumentId = config.getDocumentId || ((post) => `autoblogger-${post.id}`);
  return {
    name: `prismic:${config.repository}`,
    async onPublish(post) {
      try {
        const writeClient = createMigrationClient(config);
        const readClient = prismic.createClient(config.repository);
        const migration = prismic.createMigration();
        const documentId = getDocumentId(post);
        const documentData = syncMode === "stub" ? mapPostToStub(post) : mapPostToDocument(post, fieldMapping);
        const existingMapping = config.getExistingMapping ? await config.getExistingMapping(post.id) : null;
        let prismicDocumentId;
        let existingDoc = null;
        if (existingMapping) {
          try {
            existingDoc = await readClient.getByID(existingMapping.prismicDocumentId);
            prismicDocumentId = existingDoc?.id;
          } catch (fetchError) {
            console.warn(
              `[prismic:${config.repository}] Document not found by mapping ID, will check by UID:`,
              fetchError instanceof Error ? fetchError.message : fetchError
            );
          }
        }
        if (!existingDoc) {
          try {
            existingDoc = await readClient.getByUID(config.documentType, post.slug, {
              lang: masterLocale
            });
            prismicDocumentId = existingDoc?.id;
            console.log(`[prismic:${config.repository}] Found existing document by UID for post "${post.slug}"`);
          } catch {
          }
        }
        let migrationDoc = null;
        if (existingDoc) {
          const updatedDoc = {
            ...existingDoc,
            uid: post.slug,
            // Update UID if slug changed
            data: {
              ...existingDoc.data,
              ...documentData
              // Merge new data
            }
          };
          migration.updateDocument(updatedDoc, post.title);
          console.log(`[prismic:${config.repository}] Updating existing document for post "${post.slug}"`);
        } else {
          migrationDoc = migration.createDocument(
            {
              type: config.documentType,
              uid: post.slug,
              lang: masterLocale,
              data: documentData
            },
            post.title
          );
          console.log(`[prismic:${config.repository}] Creating new document for post "${post.slug}"`);
        }
        await writeClient.migrate(migration, {
          reporter: () => {
          }
          // Silent reporter
        });
        if (config.onSyncComplete) {
          if (migrationDoc?.document?.id) {
            prismicDocumentId = migrationDoc.document.id;
          }
          if (prismicDocumentId) {
            await config.onSyncComplete(post, prismicDocumentId);
            console.log(`[prismic:${config.repository}] Stored mapping for document ID: ${prismicDocumentId}`);
          } else {
            console.warn(`[prismic:${config.repository}] Could not get document ID after sync`);
          }
        }
        return {
          success: true,
          externalId: prismicDocumentId || documentId
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error publishing to Prismic"
        };
      }
    },
    async onUnpublish(post) {
      console.warn(
        `[prismic:${config.repository}] Unpublish not fully supported via Migration API. Document for post "${post.slug}" will remain in Prismic.`
      );
      return {
        success: true,
        externalId: getDocumentId(post)
      };
    },
    async onDelete(post) {
      console.warn(
        `[prismic:${config.repository}] Delete not fully supported via Migration API. Document for post "${post.slug}" will remain in Prismic.`
      );
      return {
        success: true,
        externalId: getDocumentId(post)
      };
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  prismicDestination
});
//# sourceMappingURL=index.js.map