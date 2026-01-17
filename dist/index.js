"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
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
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// node_modules/@prismicio/client/dist/types/value/richText.js
var RichTextNodeType;
var init_richText = __esm({
  "node_modules/@prismicio/client/dist/types/value/richText.js"() {
    "use strict";
    RichTextNodeType = {
      heading1: "heading1",
      heading2: "heading2",
      heading3: "heading3",
      heading4: "heading4",
      heading5: "heading5",
      heading6: "heading6",
      paragraph: "paragraph",
      preformatted: "preformatted",
      strong: "strong",
      em: "em",
      listItem: "list-item",
      oListItem: "o-list-item",
      list: "group-list-item",
      oList: "group-o-list-item",
      image: "image",
      embed: "embed",
      hyperlink: "hyperlink",
      label: "label",
      span: "span"
    };
  }
});

// node_modules/@prismicio/client/dist/helpers/mapSliceZone.js
function mapSliceZone(sliceZone2, mappers, context) {
  return Promise.all(sliceZone2.map(async (slice, index, slices) => {
    const isRestSliceType = "slice_type" in slice;
    const sliceType = isRestSliceType ? slice.slice_type : slice.type;
    const mapper = mappers[sliceType];
    if (!mapper) return slice;
    const mapperArgs = {
      slice,
      slices,
      index,
      context
    };
    let result = await mapper(mapperArgs);
    if (mapper.length < 1 && (typeof result === "function" || typeof result === "object" && "default" in result)) {
      result = "default" in result ? result.default : result;
      result = await result(mapperArgs);
    }
    if (isRestSliceType) return {
      __mapped: true,
      id: slice.id,
      slice_type: sliceType,
      ...result
    };
    else return {
      __mapped: true,
      type: sliceType,
      ...result
    };
  }));
}
var init_mapSliceZone = __esm({
  "node_modules/@prismicio/client/dist/helpers/mapSliceZone.js"() {
    "use strict";
  }
});

// node_modules/@prismicio/client/dist/filter.js
var formatValue, pathWithArgsFilter, pathFilter, argsFilter, filter;
var init_filter = __esm({
  "node_modules/@prismicio/client/dist/filter.js"() {
    "use strict";
    formatValue = (value) => {
      if (Array.isArray(value)) return `[${value.map(formatValue).join(", ")}]`;
      if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
      if (value instanceof Date) return `${value.getTime()}`;
      return `${value}`;
    };
    pathWithArgsFilter = (name2) => {
      const fn = (path, ...args) => {
        const formattedArgs = args.map(formatValue).join(", ");
        return `[${name2}(${path}${path && args.length ? ", " : ""}${formattedArgs})]`;
      };
      return fn;
    };
    pathFilter = (name2) => {
      const filterFn = pathWithArgsFilter(name2);
      const fn = (path) => {
        return filterFn(path);
      };
      return fn;
    };
    argsFilter = (name2) => {
      const filterFn = pathWithArgsFilter(name2);
      const fn = (...args) => {
        return filterFn("", ...args);
      };
      return fn;
    };
    filter = {
      at: pathWithArgsFilter("at"),
      not: pathWithArgsFilter("not"),
      any: pathWithArgsFilter("any"),
      in: pathWithArgsFilter("in"),
      fulltext: pathWithArgsFilter("fulltext"),
      has: pathFilter("has"),
      missing: pathFilter("missing"),
      similar: argsFilter("similar"),
      geopointNear: pathWithArgsFilter("geopoint.near"),
      numberLessThan: pathWithArgsFilter("number.lt"),
      numberGreaterThan: pathWithArgsFilter("number.gt"),
      numberInRange: pathWithArgsFilter("number.inRange"),
      dateAfter: pathWithArgsFilter("date.after"),
      dateBefore: pathWithArgsFilter("date.before"),
      dateBetween: pathWithArgsFilter("date.between"),
      dateDayOfMonth: pathWithArgsFilter("date.day-of-month"),
      dateDayOfMonthAfter: pathWithArgsFilter("date.day-of-month-after"),
      dateDayOfMonthBefore: pathWithArgsFilter("date.day-of-month-before"),
      dateDayOfWeek: pathWithArgsFilter("date.day-of-week"),
      dateDayOfWeekAfter: pathWithArgsFilter("date.day-of-week-after"),
      dateDayOfWeekBefore: pathWithArgsFilter("date.day-of-week-before"),
      dateMonth: pathWithArgsFilter("date.month"),
      dateMonthAfter: pathWithArgsFilter("date.month-after"),
      dateMonthBefore: pathWithArgsFilter("date.month-before"),
      dateYear: pathWithArgsFilter("date.year"),
      dateHour: pathWithArgsFilter("date.hour"),
      dateHourAfter: pathWithArgsFilter("date.hour-after"),
      dateHourBefore: pathWithArgsFilter("date.hour-before")
    };
  }
});

// node_modules/@prismicio/client/dist/_virtual/rolldown_runtime.js
var __defProp2, __export2;
var init_rolldown_runtime = __esm({
  "node_modules/@prismicio/client/dist/_virtual/rolldown_runtime.js"() {
    "use strict";
    __defProp2 = Object.defineProperty;
    __export2 = (all) => {
      let target = {};
      for (var name2 in all) __defProp2(target, name2, {
        get: all[name2],
        enumerable: true
      });
      return target;
    };
  }
});

// node_modules/@prismicio/client/dist/cookie.js
var cookie_exports, preview;
var init_cookie = __esm({
  "node_modules/@prismicio/client/dist/cookie.js"() {
    "use strict";
    init_rolldown_runtime();
    cookie_exports = /* @__PURE__ */ __export2({ preview: () => preview });
    preview = "io.prismic.preview";
  }
});

// node_modules/@prismicio/client/dist/errors.js
var PrismicError, ForbiddenError, NotFoundError, RepositoryNotFoundError, ParsingError, InvalidDataError, RefExpiredError, RefNotFoundError, PreviewTokenExpiredError;
var init_errors = __esm({
  "node_modules/@prismicio/client/dist/errors.js"() {
    "use strict";
    PrismicError = class extends Error {
      constructor(message = "An invalid API response was returned", url, response) {
        super(message);
        __publicField(this, "url");
        __publicField(this, "response");
        this.url = url;
        this.response = response;
      }
    };
    ForbiddenError = class extends PrismicError {
    };
    NotFoundError = class extends PrismicError {
    };
    RepositoryNotFoundError = class extends NotFoundError {
    };
    ParsingError = class extends PrismicError {
    };
    InvalidDataError = class extends PrismicError {
    };
    RefExpiredError = class extends ForbiddenError {
    };
    RefNotFoundError = class extends ForbiddenError {
    };
    PreviewTokenExpiredError = class extends ForbiddenError {
    };
  }
});

// node_modules/@prismicio/client/dist/types/value/link.js
var LinkType;
var init_link = __esm({
  "node_modules/@prismicio/client/dist/types/value/link.js"() {
    "use strict";
    LinkType = {
      Any: "Any",
      Document: "Document",
      Media: "Media",
      Web: "Web"
    };
  }
});

// node_modules/@prismicio/client/dist/helpers/documentToLinkField.js
var documentToLinkField;
var init_documentToLinkField = __esm({
  "node_modules/@prismicio/client/dist/helpers/documentToLinkField.js"() {
    "use strict";
    init_link();
    documentToLinkField = (prismicDocument2) => {
      var _prismicDocument$slug;
      return {
        link_type: LinkType.Document,
        id: prismicDocument2.id,
        uid: prismicDocument2.uid || void 0,
        type: prismicDocument2.type,
        tags: prismicDocument2.tags,
        lang: prismicDocument2.lang,
        url: prismicDocument2.url == null ? void 0 : prismicDocument2.url,
        slug: (_prismicDocument$slug = prismicDocument2.slugs) === null || _prismicDocument$slug === void 0 ? void 0 : _prismicDocument$slug[0],
        ...prismicDocument2.data && Object.keys(prismicDocument2.data).length > 0 ? { data: prismicDocument2.data } : {}
      };
    };
  }
});

// node_modules/@prismicio/client/dist/helpers/asLink.js
var asLink;
var init_asLink = __esm({
  "node_modules/@prismicio/client/dist/helpers/asLink.js"() {
    "use strict";
    init_link();
    init_documentToLinkField();
    asLink = (linkFieldOrDocument, ...configObjectOrTuple) => {
      if (!linkFieldOrDocument) return null;
      const linkField = "link_type" in linkFieldOrDocument ? linkFieldOrDocument : documentToLinkField(linkFieldOrDocument);
      const [configObjectOrLinkResolver] = configObjectOrTuple;
      let config;
      if (typeof configObjectOrLinkResolver === "function" || configObjectOrLinkResolver == null) config = { linkResolver: configObjectOrLinkResolver };
      else config = { ...configObjectOrLinkResolver };
      switch (linkField.link_type) {
        case LinkType.Media:
        case LinkType.Web:
          return "url" in linkField ? linkField.url : null;
        case LinkType.Document:
          if ("id" in linkField && config.linkResolver) {
            const resolvedURL = config.linkResolver(linkField);
            if (resolvedURL != null) return resolvedURL;
          }
          if ("url" in linkField && linkField.url) return linkField.url;
          return null;
        case LinkType.Any:
        default:
          return null;
      }
    };
  }
});

// node_modules/@prismicio/client/dist/package.js
var name, version;
var init_package = __esm({
  "node_modules/@prismicio/client/dist/package.js"() {
    "use strict";
    name = "@prismicio/client";
    version = "7.21.3";
  }
});

// node_modules/@prismicio/client/dist/lib/devMsg.js
var devMsg;
var init_devMsg = __esm({
  "node_modules/@prismicio/client/dist/lib/devMsg.js"() {
    "use strict";
    init_package();
    devMsg = (slug) => {
      return `https://prismic.dev/msg/client/v${version}/${slug}`;
    };
  }
});

// node_modules/@prismicio/client/dist/buildQueryURL.js
function castArray(a) {
  return Array.isArray(a) ? a : [a];
}
var PRISMIC_DEV_PARAM, PRISMIC_CLIENT_VERSION_PARAM, RENAMED_PARAMS, castOrderingToString, buildQueryURL;
var init_buildQueryURL = __esm({
  "node_modules/@prismicio/client/dist/buildQueryURL.js"() {
    "use strict";
    init_package();
    init_devMsg();
    PRISMIC_DEV_PARAM = "x-d";
    PRISMIC_CLIENT_VERSION_PARAM = "x-c";
    RENAMED_PARAMS = { accessToken: "access_token" };
    castOrderingToString = (ordering) => {
      if (typeof ordering === "string") {
        if (process.env.NODE_ENV === "development") {
          const [field, direction] = ordering.split(" ");
          const objectForm = direction === "desc" ? `{ field: "${field}", direction: "desc" }` : `{ field: "${field}" }`;
          console.warn(`[@prismicio/client] A string value was provided to the \`orderings\` query parameter. Strings are deprecated. Please convert it to the object form: ${objectForm}. For more details, see ${devMsg("orderings-must-be-an-array-of-objects")}`);
        }
        return ordering;
      }
      return ordering.direction === "desc" ? `${ordering.field} desc` : ordering.field;
    };
    buildQueryURL = (endpoint, args) => {
      const { filters, predicates, ...params } = args;
      if (!endpoint.endsWith("/")) endpoint += "/";
      const url = new URL(`documents/search`, endpoint);
      if (filters) {
        if (process.env.NODE_ENV === "development" && !Array.isArray(filters)) console.warn(`[@prismicio/client] A non-array value was provided to the \`filters\` query parameter (\`${filters}\`). Non-array values are deprecated. Please convert it to an array. For more details, see ${devMsg("filters-must-be-an-array")}`);
        for (const filter2 of castArray(filters)) url.searchParams.append("q", `[${filter2}]`);
      }
      if (predicates) for (const predicate2 of castArray(predicates)) url.searchParams.append("q", `[${predicate2}]`);
      for (const k in params) {
        const name2 = RENAMED_PARAMS[k] || k;
        let value = params[k];
        if (name2 === "orderings") {
          const scopedValue = params[name2];
          if (scopedValue != null) {
            if (process.env.NODE_ENV === "development" && typeof scopedValue === "string") console.warn(`[@prismicio/client] A string value was provided to the \`orderings\` query parameter. Strings are deprecated. Please convert it to an array of objects. For more details, see ${devMsg("orderings-must-be-an-array-of-objects")}`);
            value = `[${castArray(scopedValue).map((ordering) => castOrderingToString(ordering)).join(",")}]`;
          }
        } else if (name2 === "routes") {
          if (typeof params[name2] === "object") value = JSON.stringify(castArray(params[name2]));
        }
        if (value != null) url.searchParams.set(name2, castArray(value).join(","));
      }
      url.searchParams.set(PRISMIC_CLIENT_VERSION_PARAM, `js-${version}`);
      if (process.env.NODE_ENV === "development") url.searchParams.set(PRISMIC_DEV_PARAM, "1");
      return url.toString();
    };
  }
});

// node_modules/@prismicio/client/dist/isRepositoryName.js
var isRepositoryName;
var init_isRepositoryName = __esm({
  "node_modules/@prismicio/client/dist/isRepositoryName.js"() {
    "use strict";
    isRepositoryName = (input) => {
      return /^[a-zA-Z0-9][-a-zA-Z0-9]{2,}[a-zA-Z0-9]$/.test(input);
    };
  }
});

// node_modules/@prismicio/client/dist/getRepositoryEndpoint.js
var getRepositoryEndpoint;
var init_getRepositoryEndpoint = __esm({
  "node_modules/@prismicio/client/dist/getRepositoryEndpoint.js"() {
    "use strict";
    init_errors();
    init_isRepositoryName();
    getRepositoryEndpoint = (repositoryName) => {
      if (isRepositoryName(repositoryName)) return `https://${repositoryName}.cdn.prismic.io/api/v2`;
      else throw new PrismicError(`An invalid Prismic repository name was given: ${repositoryName}`, void 0, void 0);
    };
  }
});

// node_modules/@prismicio/client/dist/getRepositoryName.js
var getRepositoryName;
var init_getRepositoryName = __esm({
  "node_modules/@prismicio/client/dist/getRepositoryName.js"() {
    "use strict";
    init_errors();
    getRepositoryName = (repositoryEndpoint) => {
      try {
        const hostname = new URL(repositoryEndpoint).hostname;
        if (hostname.endsWith("prismic.io") || hostname.endsWith("wroom.io") || hostname.endsWith("wroom.test")) return hostname.split(".")[0];
      } catch {
      }
      throw new PrismicError(`An invalid Prismic Document API endpoint was provided: ${repositoryEndpoint}`, void 0, void 0);
    };
  }
});

// node_modules/@prismicio/client/dist/isRepositoryEndpoint.js
var isRepositoryEndpoint;
var init_isRepositoryEndpoint = __esm({
  "node_modules/@prismicio/client/dist/isRepositoryEndpoint.js"() {
    "use strict";
    isRepositoryEndpoint = (input) => {
      try {
        new URL(input);
        return true;
      } catch {
        return false;
      }
    };
  }
});

// node_modules/@prismicio/client/dist/lib/getPreviewCookie.js
var readValue, getPreviewCookie;
var init_getPreviewCookie = __esm({
  "node_modules/@prismicio/client/dist/lib/getPreviewCookie.js"() {
    "use strict";
    init_cookie();
    readValue = (value) => {
      return value.replace(/%3B/g, ";");
    };
    getPreviewCookie = (cookieJar) => {
      const cookies = cookieJar.split("; ");
      let value;
      for (const cookie of cookies) {
        const parts = cookie.split("=");
        if (readValue(parts[0]).replace(/%3D/g, "=") === preview) {
          value = readValue(parts.slice(1).join("="));
          break;
        }
      }
      return value;
    };
  }
});

// node_modules/@prismicio/client/dist/lib/pLimit.js
var sleep, pLimit;
var init_pLimit = __esm({
  "node_modules/@prismicio/client/dist/lib/pLimit.js"() {
    "use strict";
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    pLimit = ({ interval } = {}) => {
      const queue = [];
      let busy = false;
      let lastCompletion = 0;
      const resumeNext = () => {
        if (!busy && queue.length > 0) {
          var _queue$shift;
          (_queue$shift = queue.shift()) === null || _queue$shift === void 0 || _queue$shift();
          busy = true;
        }
      };
      const next = () => {
        busy = false;
        resumeNext();
      };
      const run3 = async (function_, resolve, arguments_) => {
        const timeSinceLastCompletion = Date.now() - lastCompletion;
        if (interval && timeSinceLastCompletion < interval) await sleep(interval - timeSinceLastCompletion);
        const result = (async () => function_(...arguments_))();
        resolve(result);
        try {
          await result;
        } catch {
        }
        lastCompletion = Date.now();
        next();
      };
      const enqueue = (function_, resolve, arguments_) => {
        new Promise((internalResolve) => {
          queue.push(internalResolve);
        }).then(run3.bind(void 0, function_, resolve, arguments_));
        (async () => {
          await Promise.resolve();
          if (!busy) resumeNext();
        })();
      };
      return ((function_, ...arguments_) => new Promise((resolve) => {
        enqueue(function_, resolve, arguments_);
      }));
    };
  }
});

// node_modules/@prismicio/client/dist/lib/request.js
async function request(url, init, fetchFn) {
  const stringURL = url.toString();
  let job;
  if (init === null || init === void 0 ? void 0 : init.body) {
    var _url$hostname;
    job = (THROTTLED_RUNNERS[_url$hostname = url.hostname] || (THROTTLED_RUNNERS[_url$hostname] = pLimit({ interval: DEFAULT_RETRY_AFTER })))(() => fetchFn(stringURL, init));
  } else {
    var _DEDUPLICATED_JOBS$st;
    const existingJob = (_DEDUPLICATED_JOBS$st = DEDUPLICATED_JOBS[stringURL]) === null || _DEDUPLICATED_JOBS$st === void 0 ? void 0 : _DEDUPLICATED_JOBS$st.get(init === null || init === void 0 ? void 0 : init.signal);
    if (existingJob) job = existingJob;
    else {
      job = fetchFn(stringURL, init).finally(() => {
        var _DEDUPLICATED_JOBS$st2, _DEDUPLICATED_JOBS$st3;
        (_DEDUPLICATED_JOBS$st2 = DEDUPLICATED_JOBS[stringURL]) === null || _DEDUPLICATED_JOBS$st2 === void 0 || _DEDUPLICATED_JOBS$st2.delete(init === null || init === void 0 ? void 0 : init.signal);
        if (((_DEDUPLICATED_JOBS$st3 = DEDUPLICATED_JOBS[stringURL]) === null || _DEDUPLICATED_JOBS$st3 === void 0 ? void 0 : _DEDUPLICATED_JOBS$st3.size) === 0) delete DEDUPLICATED_JOBS[stringURL];
      });
      (DEDUPLICATED_JOBS[stringURL] || (DEDUPLICATED_JOBS[stringURL] = /* @__PURE__ */ new Map())).set(init === null || init === void 0 ? void 0 : init.signal, job);
    }
  }
  const response = await job;
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("retry-after"));
    const resolvedRetryAfter = Number.isNaN(retryAfter) ? DEFAULT_RETRY_AFTER : retryAfter * 1e3;
    await new Promise((resolve) => setTimeout(resolve, resolvedRetryAfter));
    return request(url, init, fetchFn);
  }
  return response.clone();
}
var DEFAULT_RETRY_AFTER, THROTTLED_RUNNERS, DEDUPLICATED_JOBS;
var init_request = __esm({
  "node_modules/@prismicio/client/dist/lib/request.js"() {
    "use strict";
    init_pLimit();
    DEFAULT_RETRY_AFTER = 1500;
    THROTTLED_RUNNERS = {};
    DEDUPLICATED_JOBS = {};
  }
});

// node_modules/@prismicio/client/dist/lib/throttledWarn.js
var THROTTLE_THRESHOLD_MS, lastMessage, lastCalledAt, throttledWarn;
var init_throttledWarn = __esm({
  "node_modules/@prismicio/client/dist/lib/throttledWarn.js"() {
    "use strict";
    THROTTLE_THRESHOLD_MS = 5e3;
    lastCalledAt = 0;
    throttledWarn = (message) => {
      if (message === lastMessage && Date.now() - lastCalledAt < THROTTLE_THRESHOLD_MS) {
        lastCalledAt = Date.now();
        return;
      }
      lastCalledAt = Date.now();
      lastMessage = message;
      console.warn(message);
    };
  }
});

// node_modules/@prismicio/client/dist/Client.js
function appendFilters(params = {}, ...filters) {
  return {
    ...params,
    filters: [...params.filters ?? [], ...filters]
  };
}
var MAX_PAGE_SIZE, REPOSITORY_CACHE_TTL, GET_ALL_QUERY_DELAY, MAX_INVALID_REF_RETRY_ATTEMPTS, _repositoryName, _getRef, _autoPreviews, _autoPreviewsRequest, _cachedRepository, _cachedRepositoryExpiration, _Client_instances, getResolvedRef_fn, internalGet_fn, throwContentAPIError_fn, request_fn, _a, Client;
var init_Client = __esm({
  "node_modules/@prismicio/client/dist/Client.js"() {
    "use strict";
    init_filter();
    init_devMsg();
    init_getPreviewCookie();
    init_request();
    init_throttledWarn();
    init_errors();
    init_asLink();
    init_buildQueryURL();
    init_getRepositoryEndpoint();
    init_getRepositoryName();
    init_isRepositoryEndpoint();
    MAX_PAGE_SIZE = 100;
    REPOSITORY_CACHE_TTL = 5e3;
    GET_ALL_QUERY_DELAY = 500;
    MAX_INVALID_REF_RETRY_ATTEMPTS = 3;
    Client = (_a = class {
      /**
      * @param repositoryNameOrEndpoint - The Prismic repository name or full
      *   Content API endpoint for the repository.
      * @param config - Client configuration.
      */
      constructor(repositoryNameOrEndpoint, config = {}) {
        __privateAdd(this, _Client_instances);
        /**
        * The client's Content API endpoint.
        *
        * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#config-options}
        */
        __publicField(this, "documentAPIEndpoint");
        /**
        * The secure token used for the Content API.
        *
        * @see {@link https://prismic.io/docs/fetch-content#content-visibility}
        */
        __publicField(this, "accessToken");
        /**
        * A list of route resolver objects that define how a document's `url`
        * property is resolved.
        *
        * @see {@link https://prismic.io/docs/routes}
        * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#config-options}
        */
        __publicField(this, "routes");
        /**
        * The URL used for link or content relationship fields that point to an
        * archived or deleted page.
        *
        * @see {@link https://prismic.io/docs/routes}
        * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#config-options}
        */
        __publicField(this, "brokenRoute");
        /**
        * Default parameters sent with each Content API request. These parameters can
        * be overridden on each method.
        *
        * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#config-options}
        */
        __publicField(this, "defaultParams");
        /**
        * The `fetch` function used to make network requests.
        *
        * @default The global `fetch` function.
        *
        * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#config-options}
        */
        __publicField(this, "fetchFn");
        /**
        * The default `fetch` options sent with each Content API request. These
        * parameters can be overriden on each method.
        *
        * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#config-options}
        */
        __publicField(this, "fetchOptions");
        __privateAdd(this, _repositoryName);
        __privateAdd(this, _getRef);
        __privateAdd(this, _autoPreviews, true);
        __privateAdd(this, _autoPreviewsRequest);
        __privateAdd(this, _cachedRepository);
        __privateAdd(this, _cachedRepositoryExpiration, 0);
        var _globalThis$fetch;
        const { documentAPIEndpoint, accessToken, ref, routes, brokenRoute, defaultParams, fetchOptions = {}, fetch: fetch2 = (_globalThis$fetch = globalThis.fetch) === null || _globalThis$fetch === void 0 ? void 0 : _globalThis$fetch.bind(globalThis) } = config;
        if (isRepositoryEndpoint(repositoryNameOrEndpoint)) {
          try {
            this.repositoryName = getRepositoryName(repositoryNameOrEndpoint);
          } catch {
            console.warn(`[@prismicio/client] A repository name could not be inferred from the provided endpoint (\`${repositoryNameOrEndpoint}\`). Some methods will be disabled. Create the client using a repository name to prevent this warning. For more details, see ${devMsg("prefer-repository-name")}`);
          }
          this.documentAPIEndpoint = documentAPIEndpoint || repositoryNameOrEndpoint;
        } else {
          this.repositoryName = repositoryNameOrEndpoint;
          this.documentAPIEndpoint = documentAPIEndpoint || getRepositoryEndpoint(repositoryNameOrEndpoint);
        }
        if (!fetch2) throw new PrismicError("A valid fetch implementation was not provided. In environments where fetch is not available, a fetch implementation must be provided via a polyfill or the `fetch` option.", void 0, void 0);
        if (typeof fetch2 !== "function") throw new PrismicError(`fetch must be a function, but received: ${typeof fetch2}`, void 0, void 0);
        if (!isRepositoryEndpoint(this.documentAPIEndpoint)) throw new PrismicError(`documentAPIEndpoint is not a valid URL: ${documentAPIEndpoint}`, void 0, void 0);
        if (isRepositoryEndpoint(repositoryNameOrEndpoint) && documentAPIEndpoint && repositoryNameOrEndpoint !== documentAPIEndpoint) console.warn(`[@prismicio/client] Multiple incompatible endpoints were provided. Create the client using a repository name to prevent this error. For more details, see ${devMsg("prefer-repository-name")}`);
        if (process.env.NODE_ENV === "development" && /\.prismic\.io\/(?!api\/v2\/?)/i.test(this.documentAPIEndpoint)) throw new PrismicError("@prismicio/client only supports Prismic Rest API V2. Please provide only the repository name to the first createClient() parameter or use the getRepositoryEndpoint() helper to generate a valid Rest API V2 endpoint URL.", void 0, void 0);
        if (process.env.NODE_ENV === "development" && /(?<!\.cdn)\.prismic\.io$/i.test(new URL(this.documentAPIEndpoint).hostname)) console.warn(`[@prismicio/client] The client was created with a non-CDN endpoint. Convert it to the CDN endpoint for better performance. For more details, see ${devMsg("endpoint-must-use-cdn")}`);
        this.accessToken = accessToken;
        this.routes = routes;
        this.brokenRoute = brokenRoute;
        this.defaultParams = defaultParams;
        this.fetchOptions = fetchOptions;
        this.fetchFn = fetch2;
        this.graphQLFetch = this.graphQLFetch.bind(this);
        if (ref) this.queryContentFromRef(ref);
      }
      /** The Prismic repository's name. */
      set repositoryName(value) {
        __privateSet(this, _repositoryName, value);
      }
      /** The Prismic repository's name. */
      get repositoryName() {
        if (!__privateGet(this, _repositoryName)) throw new PrismicError(`A repository name is required for this method but one could not be inferred from the provided API endpoint (\`${this.documentAPIEndpoint}\`). To fix this error, provide a repository name when creating the client. For more details, see ${devMsg("prefer-repository-name")}`, void 0, void 0);
        return __privateGet(this, _repositoryName);
      }
      /** @deprecated Replace with `documentAPIEndpoint`. */
      set endpoint(value) {
        this.documentAPIEndpoint = value;
      }
      /** @deprecated Replace with `documentAPIEndpoint`. */
      get endpoint() {
        return this.documentAPIEndpoint;
      }
      /**
      * Enables the client to automatically query content from a preview session.
      *
      * @example
      *
      * ```ts
      * client.enableAutoPreviews()
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#enableautopreviews}
      */
      enableAutoPreviews() {
        __privateSet(this, _autoPreviews, true);
      }
      /**
      * Enables the client to automatically query content from a preview session
      * using an HTTP request object.
      *
      * @example
      *
      * ```ts
      * client.enableAutoPreviewsFromReq(req)
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#enableautopreviewsfromreq}
      */
      enableAutoPreviewsFromReq(request$1) {
        this.enableAutoPreviews();
        __privateSet(this, _autoPreviewsRequest, request$1);
      }
      /**
      * Disables the client from automatically querying content from a preview
      * session.
      *
      * @example
      *
      * ```ts
      * client.disableAutoPreviews()
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#disableautopreviews}
      */
      disableAutoPreviews() {
        __privateSet(this, _autoPreviews, false);
        __privateSet(this, _autoPreviewsRequest, void 0);
      }
      /**
      * Fetches pages based on the `params` argument. Results are paginated.
      *
      * @example
      *
      * ```ts
      * const response = await client.get({ pageSize: 10 })
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#get}
      */
      async get(params) {
        return await (await __privateMethod(this, _Client_instances, internalGet_fn).call(this, params)).json();
      }
      /**
      * Fetches the first page returned based on the `params` argument.
      *
      * @example
      *
      * ```ts
      * const page = await client.getFirst()
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getfirst}
      */
      async getFirst(params) {
        const actualParams = (params === null || params === void 0 ? void 0 : params.page) || (params === null || params === void 0 ? void 0 : params.pageSize) ? params : {
          ...params,
          pageSize: 1
        };
        const response = await __privateMethod(this, _Client_instances, internalGet_fn).call(this, actualParams);
        const { results } = await response.clone().json();
        if (results[0]) return results[0];
        throw new NotFoundError("No documents were returned", response.url, void 0);
      }
      /**
      * Fetches all pages based on the `params` argument. This method may make
      * multiple network requests to fetch all matching pages.
      *
      * @example
      *
      * ```ts
      * const pages = await client.dangerouslyGetAll()
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#dangerouslygetall}
      */
      async dangerouslyGetAll(params = {}) {
        var _this$defaultParams;
        const { limit = Infinity, ...actualParams } = params;
        const resolvedParams = {
          ...actualParams,
          pageSize: Math.min(limit, actualParams.pageSize || ((_this$defaultParams = this.defaultParams) === null || _this$defaultParams === void 0 ? void 0 : _this$defaultParams.pageSize) || MAX_PAGE_SIZE)
        };
        const documents = [];
        let latestResult;
        while ((!latestResult || latestResult.next_page) && documents.length < limit) {
          const page = latestResult ? latestResult.page + 1 : void 0;
          latestResult = await this.get({
            ...resolvedParams,
            page
          });
          documents.push(...latestResult.results);
          if (latestResult.next_page) await new Promise((res) => setTimeout(res, GET_ALL_QUERY_DELAY));
        }
        return documents.slice(0, limit);
      }
      /**
      * Fetches a page with a specific ID.
      *
      * @example
      *
      * ```ts
      * const page = await client.getByID("WW4bKScAAMAqmluX")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbyid}
      */
      async getByID(id, params) {
        return await this.getFirst(appendFilters(params, filter.at("document.id", id)));
      }
      /**
      * Fetches pages with specific IDs. Results are paginated.
      *
      * @example
      *
      * ```ts
      * const response = await client.getByIDs([
      * 	"WW4bKScAAMAqmluX",
      * 	"U1kTRgEAAC8A5ldS",
      * ])
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbyids}
      */
      async getByIDs(ids, params) {
        return await this.get(appendFilters(params, filter.in("document.id", ids)));
      }
      /**
      * Fetches pages with specific IDs. This method may make multiple network
      * requests to fetch all matching pages.
      *
      * @example
      *
      * ```ts
      * const pages = await client.getAllByIDs([
      * 	"WW4bKScAAMAqmluX",
      * 	"U1kTRgEAAC8A5ldS",
      * ])
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getallbyids}
      */
      async getAllByIDs(ids, params) {
        return await this.dangerouslyGetAll(appendFilters(params, filter.in("document.id", ids)));
      }
      /**
      * Fetches a page with a specific UID and type.
      *
      * @example
      *
      * ```ts
      * const page = await client.getByUID("blog_post", "my-first-post")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbyuid}
      */
      async getByUID(documentType, uid, params) {
        return await this.getFirst(appendFilters(params, filter.at("document.type", documentType), filter.at(`my.${documentType}.uid`, uid)));
      }
      /**
      * Fetches pages with specific UIDs and a specific type. Results are
      * paginated.
      *
      * @example
      *
      * ```ts
      * const response = await client.getByUIDs("blog_post", [
      * 	"my-first-post",
      * 	"my-second-post",
      * ])
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbyuids}
      */
      async getByUIDs(documentType, uids, params) {
        return await this.get(appendFilters(params, filter.at("document.type", documentType), filter.in(`my.${documentType}.uid`, uids)));
      }
      /**
      * Fetches pages with specific UIDs and a specific type. This method may make
      * multiple network requests to fetch all matching pages.
      *
      * @example
      *
      * ```ts
      * const pages = await client.getAllByUIDs("blog_post", [
      * 	"my-first-post",
      * 	"my-second-post",
      * ])
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getallbyuids}
      */
      async getAllByUIDs(documentType, uids, params) {
        return await this.dangerouslyGetAll(appendFilters(params, filter.at("document.type", documentType), filter.in(`my.${documentType}.uid`, uids)));
      }
      /**
      * Fetches a specific single type page.
      *
      * @example
      *
      * ```ts
      * const page = await client.getSingle("settings")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getsingle}
      */
      async getSingle(documentType, params) {
        return await this.getFirst(appendFilters(params, filter.at("document.type", documentType)));
      }
      /**
      * Fetches pages with a specific type. Results are paginated.
      *
      * @example
      *
      * ```ts
      * const response = await client.getByType("blog_post")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbytype}
      */
      async getByType(documentType, params) {
        return await this.get(appendFilters(params, filter.at("document.type", documentType)));
      }
      /**
      * Fetches pages with a specific type. This method may make multiple network
      * requests to fetch all matching documents.
      *
      * @example
      *
      * ```ts
      * const pages = await client.getAllByType("blog_post")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getallbytype}
      */
      async getAllByType(documentType, params) {
        return await this.dangerouslyGetAll(appendFilters(params, filter.at("document.type", documentType)));
      }
      /**
      * Fetches pages with a specific tag. Results are paginated.
      *
      * @example
      *
      * ```ts
      * const response = await client.getByTag("featured")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbytag}
      */
      async getByTag(tag, params) {
        return await this.get(appendFilters(params, filter.any("document.tags", [tag])));
      }
      /**
      * Fetches pages with a specific tag. This method may make multiple network
      * requests to fetch all matching documents.
      *
      * @example
      *
      * ```ts
      * const pages = await client.getAllByTag("featured")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getallbytag}
      */
      async getAllByTag(tag, params) {
        return await this.dangerouslyGetAll(appendFilters(params, filter.any("document.tags", [tag])));
      }
      /**
      * Fetches pages with every tag from a list of tags. Results are paginated.
      *
      * @example
      *
      * ```ts
      * const response = await client.getByEveryTag(["featured", "homepage"])
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbyeverytag}
      */
      async getByEveryTag(tags, params) {
        return await this.get(appendFilters(params, filter.at("document.tags", tags)));
      }
      /**
      * Fetches pages with every tag from a list of tags. This method may make
      * multiple network requests to fetch all matching pages.
      *
      * @example
      *
      * ```ts
      * const pages = await client.getAllByEveryTag(["featured", "homepage"])
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getallbyeverytag}
      */
      async getAllByEveryTag(tags, params) {
        return await this.dangerouslyGetAll(appendFilters(params, filter.at("document.tags", tags)));
      }
      /**
      * Fetches pages with at least one tag from a list of tags. Results are
      * paginated.
      *
      * @example
      *
      * ```ts
      * const response = await client.getBySomeTags(["featured", "homepage"])
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getbysometags}
      */
      async getBySomeTags(tags, params) {
        return await this.get(appendFilters(params, filter.any("document.tags", tags)));
      }
      /**
      * Fetches pages with at least one tag from a list of tags. This method may
      * make multiple network requests to fetch all matching documents.
      *
      * @example
      *
      * ```ts
      * const pages = await client.getAllBySomeTags(["featured", "homepage"])
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getallbysometags}
      */
      async getAllBySomeTags(tags, params) {
        return await this.dangerouslyGetAll(appendFilters(params, filter.any("document.tags", tags)));
      }
      /**
      * Fetches metadata about the client's Prismic repository.
      *
      * @example
      *
      * ```ts
      * const repository = await client.getRepository()
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getrepository}
      */
      async getRepository(params) {
        if (__privateGet(this, _cachedRepository) && __privateGet(this, _cachedRepositoryExpiration) > Date.now()) return __privateGet(this, _cachedRepository);
        const url = new URL(this.documentAPIEndpoint);
        const accessToken = (params === null || params === void 0 ? void 0 : params.accessToken) || this.accessToken;
        if (accessToken) url.searchParams.set("access_token", accessToken);
        const response = await __privateMethod(this, _Client_instances, request_fn).call(this, url, params);
        if (response.ok) {
          __privateSet(this, _cachedRepository, await response.json());
          __privateSet(this, _cachedRepositoryExpiration, Date.now() + REPOSITORY_CACHE_TTL);
          return __privateGet(this, _cachedRepository);
        }
        if (response.status === 404) throw new RepositoryNotFoundError(`Prismic repository not found. Check that "${this.documentAPIEndpoint}" is pointing to the correct repository.`, url.toString(), void 0);
        return await __privateMethod(this, _Client_instances, throwContentAPIError_fn).call(this, response, url.toString());
      }
      /**
      * Fetches the repository's active refs.
      *
      * @example
      *
      * ```ts
      * const refs = await client.getRefs()
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getrefs}
      */
      async getRefs(params) {
        return (await this.getRepository(params)).refs;
      }
      /**
      * Fetches a ref by its ID.
      *
      * @example
      *
      * ```ts
      * const ref = await client.getRefByID("YhE3YhEAACIA4321")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getrefbyid}
      */
      async getRefByID(id, params) {
        const ref = (await this.getRefs(params)).find((ref$1) => ref$1.id === id);
        if (!ref) throw new PrismicError(`Ref with ID "${id}" could not be found.`, void 0, void 0);
        return ref;
      }
      /**
      * Fetches a ref by its label. A release ref's label is its name shown in the
      * Page Builder.
      *
      * @example
      *
      * ```ts
      * const ref = await client.getRefByLabel("My Release")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getrefbylabel}
      */
      async getRefByLabel(label, params) {
        const ref = (await this.getRefs(params)).find((ref$1) => ref$1.label === label);
        if (!ref) throw new PrismicError(`Ref with label "${label}" could not be found.`, void 0, void 0);
        return ref;
      }
      /**
      * Fetches the repository's master ref.
      *
      * @example
      *
      * ```ts
      * const masterRef = await client.getMasterRef()
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getmasterref}
      */
      async getMasterRef(params) {
        const ref = (await this.getRefs(params)).find((ref$1) => ref$1.isMasterRef);
        if (!ref) throw new PrismicError("Master ref could not be found.", void 0, void 0);
        return ref;
      }
      /**
      * Fetches the repository's active releases.
      *
      * @example
      *
      * ```ts
      * const releases = await client.getReleases()
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getreleases}
      */
      async getReleases(params) {
        return (await this.getRefs(params)).filter((ref) => !ref.isMasterRef);
      }
      /**
      * Fetches a release with a specific ID.
      *
      * @example
      *
      * ```ts
      * const release = await client.getReleaseByID("YhE3YhEAACIA4321")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getreleasebyid}
      */
      async getReleaseByID(id, params) {
        const release = (await this.getReleases(params)).find((ref) => ref.id === id);
        if (!release) throw new PrismicError(`Release with ID "${id}" could not be found.`, void 0, void 0);
        return release;
      }
      /**
      * Fetches a release by its label. A release ref's label is its name shown in
      * the Page Builder.
      *
      * @example
      *
      * ```ts
      * const release = await client.getReleaseByLabel("My Release")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#getreleasebylabel}
      */
      async getReleaseByLabel(label, params) {
        const release = (await this.getReleases(params)).find((ref) => ref.label === label);
        if (!release) throw new PrismicError(`Release with label "${label}" could not be found.`, void 0, void 0);
        return release;
      }
      /**
      * Fetches the repository's page tags.
      *
      * @example
      *
      * ```ts
      * const tags = await client.getTags()
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#gettags}
      */
      async getTags(params) {
        const repository = await this.getRepository(params);
        const form = repository.forms.tags;
        if (form) {
          const url = new URL(form.action);
          if (this.accessToken) url.searchParams.set("access_token", this.accessToken);
          const response = await __privateMethod(this, _Client_instances, request_fn).call(this, url, params);
          if (response.ok) return await response.json();
        }
        return repository.tags;
      }
      /**
      * Builds a Content API query URL with a set of parameters.
      *
      * @example
      *
      * ```ts
      * const url = await client.buildQueryURL({
      * 	filters: [filter.at("document.type", "blog_post")],
      * })
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#buildqueryurl}
      */
      async buildQueryURL({ signal, fetchOptions, ...params } = {}) {
        const ref = params.ref || await __privateMethod(this, _Client_instances, getResolvedRef_fn).call(this, {
          accessToken: params.accessToken,
          signal,
          fetchOptions
        });
        const integrationFieldsRef = params.integrationFieldsRef || (await this.getRepository({
          accessToken: params.accessToken,
          signal,
          fetchOptions
        })).integrationFieldsRef || void 0;
        return buildQueryURL(this.documentAPIEndpoint, {
          ...this.defaultParams,
          ...params,
          ref,
          integrationFieldsRef,
          routes: params.routes || this.routes,
          brokenRoute: params.brokenRoute || this.brokenRoute,
          accessToken: params.accessToken || this.accessToken
        });
      }
      /**
      * Fetches a previewed page's URL using a preview token and page ID.
      *
      * @example
      *
      * ```ts
      * const url = await client.resolvePreviewURL({
      * 	linkResolver,
      * 	defaultURL: "/",
      * })
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#resolvepreviewurl}
      */
      async resolvePreviewURL(args) {
        let documentID = args.documentID;
        let previewToken = args.previewToken;
        if (typeof globalThis.location !== "undefined") {
          const searchParams = new URLSearchParams(globalThis.location.search);
          documentID = documentID || searchParams.get("documentId");
          previewToken = previewToken || searchParams.get("token");
        } else if (__privateGet(this, _autoPreviewsRequest)) {
          if ("query" in __privateGet(this, _autoPreviewsRequest)) {
            var _this$autoPreviewsReq, _this$autoPreviewsReq2;
            documentID = documentID || ((_this$autoPreviewsReq = __privateGet(this, _autoPreviewsRequest).query) === null || _this$autoPreviewsReq === void 0 ? void 0 : _this$autoPreviewsReq.documentId);
            previewToken = previewToken || ((_this$autoPreviewsReq2 = __privateGet(this, _autoPreviewsRequest).query) === null || _this$autoPreviewsReq2 === void 0 ? void 0 : _this$autoPreviewsReq2.token);
          } else if ("url" in __privateGet(this, _autoPreviewsRequest) && __privateGet(this, _autoPreviewsRequest).url) {
            const searchParams = new URL(__privateGet(this, _autoPreviewsRequest).url, "missing-host://").searchParams;
            documentID = documentID || searchParams.get("documentId");
            previewToken = previewToken || searchParams.get("token");
          }
        }
        if (documentID != null && previewToken != null) {
          const url = asLink(await this.getByID(documentID, {
            ref: previewToken,
            lang: "*",
            signal: args.signal,
            fetchOptions: args.fetchOptions
          }), { linkResolver: args.linkResolver });
          if (typeof url === "string") return url;
        }
        return args.defaultURL;
      }
      /**
      * Configures the client to query the latest published content. This is the
      * client's default mode.
      *
      * @example
      *
      * ```ts
      * client.queryLatestContent()
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#querylatestcontent}
      */
      queryLatestContent() {
        __privateSet(this, _getRef, void 0);
      }
      /**
      * Configures the client to query content from a release with a specific ID.
      *
      * @example
      *
      * ```ts
      * client.queryContentFromReleaseByID("YhE3YhEAACIA4321")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#querycontentfromreleasebyid}
      */
      queryContentFromReleaseByID(id) {
        __privateSet(this, _getRef, async (params) => {
          return (await this.getReleaseByID(id, params)).ref;
        });
      }
      /**
      * Configures the client to query content from a release with a specific
      * label.
      *
      * @example
      *
      * ```ts
      * client.queryContentFromReleaseByLabel("My Release")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#querycontentfromreleasebylabel}
      */
      queryContentFromReleaseByLabel(label) {
        __privateSet(this, _getRef, async (params) => {
          return (await this.getReleaseByLabel(label, params)).ref;
        });
      }
      /**
      * Configures the client to query content from a specific ref.
      *
      * @example
      *
      * ```ts
      * client.queryContentFromRef("my-ref")
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#querycontentfromref}
      */
      queryContentFromRef(ref) {
        __privateSet(this, _getRef, typeof ref === "string" ? () => ref : ref);
      }
      /**
      * A preconfigured `fetch()` function for Prismic's GraphQL API that can be
      * provided to GraphQL clients.
      *
      * @example
      *
      * ```ts
      * import { createClient, getGraphQLEndpoint } from "@prismicio/client"
      *
      * const client = createClient("example-prismic-repo")
      * const graphQLClient = new ApolloClient({
      * 	link: new HttpLink({
      * 		uri: getGraphQLEndpoint(client.repositoryName),
      * 		// Provide `client.graphQLFetch` as the fetch implementation.
      * 		fetch: client.graphQLFetch,
      * 		// Using GET is required.
      * 		useGETForQueries: true,
      * 	}),
      * 	cache: new InMemoryCache(),
      * })
      * ```
      *
      * @see {@link https://prismic.io/docs/technical-reference/prismicio-client/v7#graphqlfetch}
      */
      async graphQLFetch(input, init) {
        const params = {
          accessToken: this.accessToken,
          fetchOptions: this.fetchOptions
        };
        const repository = await this.getRepository(params);
        const ref = await __privateMethod(this, _Client_instances, getResolvedRef_fn).call(this, params);
        const headers = {};
        headers["prismic-ref"] = ref;
        if (this.accessToken) headers["authorization"] = `Token ${this.accessToken}`;
        if (repository.integrationFieldsRef) headers["prismic-integration-field-ref"] = repository.integrationFieldsRef;
        for (const [key, value] of Object.entries((init === null || init === void 0 ? void 0 : init.headers) ?? {})) headers[key.toLowerCase()] = value;
        const url = new URL(typeof input === "string" ? input : input.url);
        const query = (url.searchParams.get("query") ?? "").replace(/(\n| )*( |{|})(\n| )*/gm, (_chars, _spaces, brackets) => brackets);
        url.searchParams.set("query", query);
        url.searchParams.set("ref", ref);
        return await this.fetchFn(url.toString(), {
          ...init,
          headers
        });
      }
    }, _repositoryName = new WeakMap(), _getRef = new WeakMap(), _autoPreviews = new WeakMap(), _autoPreviewsRequest = new WeakMap(), _cachedRepository = new WeakMap(), _cachedRepositoryExpiration = new WeakMap(), _Client_instances = new WeakSet(), getResolvedRef_fn = async function(params) {
      var _this$getRef;
      if (__privateGet(this, _autoPreviews)) {
        var _this$autoPreviewsReq3, _globalThis$document;
        const previewRef = getPreviewCookie((((_this$autoPreviewsReq3 = __privateGet(this, _autoPreviewsRequest)) === null || _this$autoPreviewsReq3 === void 0 ? void 0 : _this$autoPreviewsReq3.headers) ? "get" in __privateGet(this, _autoPreviewsRequest).headers ? __privateGet(this, _autoPreviewsRequest).headers.get("cookie") : __privateGet(this, _autoPreviewsRequest).headers.cookie : (_globalThis$document = globalThis.document) === null || _globalThis$document === void 0 ? void 0 : _globalThis$document.cookie) ?? "");
        if (previewRef) return previewRef;
      }
      const ref = await ((_this$getRef = __privateGet(this, _getRef)) === null || _this$getRef === void 0 ? void 0 : _this$getRef.call(this, params));
      if (ref) return ref;
      return (await this.getMasterRef(params)).ref;
    }, internalGet_fn = async function(params, attempt = 1) {
      const url = await this.buildQueryURL(params);
      const response = await __privateMethod(this, _Client_instances, request_fn).call(this, new URL(url), params);
      if (response.ok) return response;
      try {
        return await __privateMethod(this, _Client_instances, throwContentAPIError_fn).call(this, response, url);
      } catch (error) {
        if ((error instanceof RefNotFoundError || error instanceof RefExpiredError) && attempt < MAX_INVALID_REF_RETRY_ATTEMPTS) {
          var _error$message$match;
          if (!(params === null || params === void 0 ? void 0 : params.ref)) __privateSet(this, _cachedRepository, void 0);
          const masterRef = (_error$message$match = error.message.match(/master ref is: (?<ref>.*)$/i)) === null || _error$message$match === void 0 || (_error$message$match = _error$message$match.groups) === null || _error$message$match === void 0 ? void 0 : _error$message$match.ref;
          if (!masterRef) throw error;
          throttledWarn(`[@prismicio/client] The ref (${new URL(url).searchParams.get("ref")}) was ${error instanceof RefNotFoundError ? "invalid" : "expired"}. Now retrying with the latest master ref (${masterRef}). If you were previewing content, the response will not include draft content.`);
          return await __privateMethod(this, _Client_instances, internalGet_fn).call(this, {
            ...params,
            ref: masterRef
          }, attempt + 1);
        }
        throw error;
      }
    }, throwContentAPIError_fn = async function(response, url) {
      switch (response.status) {
        case 400: {
          const json = await response.clone().json();
          throw new ParsingError(json.message, url, json);
        }
        case 401: {
          const json = await response.clone().json();
          throw new ForbiddenError(json.message, url, json);
        }
        case 404: {
          const json = await response.clone().json();
          switch (json.type) {
            case "api_notfound_error":
              throw new RefNotFoundError(json.message, url, json);
            case "api_security_error":
              if (/preview token.*expired/i.test(json.message)) throw new PreviewTokenExpiredError(json.message, url, json);
            default:
              throw new NotFoundError(json.message, url, json);
          }
        }
        case 410: {
          const json = await response.clone().json();
          throw new RefExpiredError(json.message, url, json);
        }
        default:
          throw new PrismicError(void 0, url, await response.text());
      }
    }, request_fn = async function(url, params) {
      var _this$fetchOptions, _params$fetchOptions, _params$fetchOptions2, _this$fetchOptions2;
      return await request(url, {
        ...this.fetchOptions,
        ...params === null || params === void 0 ? void 0 : params.fetchOptions,
        headers: {
          ...(_this$fetchOptions = this.fetchOptions) === null || _this$fetchOptions === void 0 ? void 0 : _this$fetchOptions.headers,
          ...params === null || params === void 0 || (_params$fetchOptions = params.fetchOptions) === null || _params$fetchOptions === void 0 ? void 0 : _params$fetchOptions.headers
        },
        signal: (params === null || params === void 0 || (_params$fetchOptions2 = params.fetchOptions) === null || _params$fetchOptions2 === void 0 ? void 0 : _params$fetchOptions2.signal) || (params === null || params === void 0 ? void 0 : params.signal) || ((_this$fetchOptions2 = this.fetchOptions) === null || _this$fetchOptions2 === void 0 ? void 0 : _this$fetchOptions2.signal)
      }, this.fetchFn);
    }, _a);
  }
});

// node_modules/@prismicio/client/dist/createClient.js
var createClient;
var init_createClient = __esm({
  "node_modules/@prismicio/client/dist/createClient.js"() {
    "use strict";
    init_Client();
    createClient = (repositoryNameOrEndpoint, options) => new Client(repositoryNameOrEndpoint, options);
  }
});

// node_modules/@prismicio/client/dist/types/migration/Asset.js
var PrismicMigrationAsset;
var init_Asset = __esm({
  "node_modules/@prismicio/client/dist/types/migration/Asset.js"() {
    "use strict";
    PrismicMigrationAsset = class {
      /**
      * Creates a migration asset used with the Prismic Migration API.
      *
      * @param config - Configuration of the asset.
      * @param initialField - The initial field value if any.
      *
      * @returns A migration asset instance.
      */
      constructor(config, initialField) {
        /**
        * Asset object from Prismic, available once created.
        */
        __publicField(this, "asset");
        /**
        * Configuration of the asset.
        */
        __publicField(this, "config");
        /**
        * The initial field value this migration field was created with.
        */
        __publicField(this, "originalField");
        this.config = config;
        this.originalField = initialField;
      }
    };
  }
});

// node_modules/@prismicio/client/dist/types/migration/Document.js
var PrismicMigrationDocument;
var init_Document = __esm({
  "node_modules/@prismicio/client/dist/types/migration/Document.js"() {
    "use strict";
    PrismicMigrationDocument = class {
      /**
      * Creates a Prismic migration document instance.
      *
      * @param document - The document to be sent to the Migration API.
      * @param title - The name of the document displayed in the editor.
      * @param params - Parameters to create/update the document with on the
      *   Migration API.
      *
      * @returns A Prismic migration document instance.
      */
      constructor(document2, title2, params) {
        /**
        * The document to be sent to the Migration API.
        */
        __publicField(this, "document");
        /**
        * The name of the document displayed in the editor.
        */
        __publicField(this, "title");
        /**
        * The link to the master language document to relate the document to if any.
        */
        __publicField(this, "masterLanguageDocument");
        /**
        * Original Prismic document when the migration document came from another
        * Prismic repository.
        *
        * @remarks
        * When migrating a document from another repository, one might want to alter
        * it with migration specific types, hence accepting an
        * `ExistingPrismicDocument` instead of a regular `PrismicDocument`.
        */
        __publicField(this, "originalPrismicDocument");
        this.document = document2;
        this.title = title2;
        this.masterLanguageDocument = params === null || params === void 0 ? void 0 : params.masterLanguageDocument;
        this.originalPrismicDocument = params === null || params === void 0 ? void 0 : params.originalPrismicDocument;
      }
    };
  }
});

// node_modules/@prismicio/client/dist/helpers/isFilled.js
var isFilled_exports, isNonNullish, isNonEmptyArray, richText, title, imageThumbnail, image, link, linkToMedia, contentRelationship, date, timestamp, color, number, keyText, select, embed, geoPoint, table, integration, integrationField, integrationFields, repeatable, group, sliceZone;
var init_isFilled = __esm({
  "node_modules/@prismicio/client/dist/helpers/isFilled.js"() {
    "use strict";
    init_rolldown_runtime();
    isFilled_exports = /* @__PURE__ */ __export2({
      color: () => color,
      contentRelationship: () => contentRelationship,
      date: () => date,
      embed: () => embed,
      geoPoint: () => geoPoint,
      group: () => group,
      image: () => image,
      imageThumbnail: () => imageThumbnail,
      integration: () => integration,
      integrationField: () => integrationField,
      integrationFields: () => integrationFields,
      keyText: () => keyText,
      link: () => link,
      linkToMedia: () => linkToMedia,
      number: () => number,
      repeatable: () => repeatable,
      richText: () => richText,
      select: () => select,
      sliceZone: () => sliceZone,
      table: () => table,
      timestamp: () => timestamp,
      title: () => title
    });
    isNonNullish = (input) => {
      return input != null;
    };
    isNonEmptyArray = (input) => {
      return !!input.length;
    };
    richText = (field) => {
      if (!isNonNullish(field)) return false;
      else if (field.length === 1 && "text" in field[0]) return !!field[0].text;
      else return !!field.length;
    };
    title = richText;
    imageThumbnail = (thumbnail) => {
      return isNonNullish(thumbnail) && !!thumbnail.url;
    };
    image = imageThumbnail;
    link = (field) => {
      return isNonNullish(field) && ("id" in field || "url" in field);
    };
    linkToMedia = link;
    contentRelationship = link;
    date = isNonNullish;
    timestamp = isNonNullish;
    color = isNonNullish;
    number = isNonNullish;
    keyText = (field) => {
      return !!field;
    };
    select = isNonNullish;
    embed = (field) => {
      return isNonNullish(field) && !!field.embed_url;
    };
    geoPoint = (field) => {
      return isNonNullish(field) && "longitude" in field;
    };
    table = isNonNullish;
    integration = isNonNullish;
    integrationField = integration;
    integrationFields = integration;
    repeatable = (repeatable$1) => {
      return isNonNullish(repeatable$1) && isNonEmptyArray(repeatable$1);
    };
    group = (group$1) => {
      return isNonNullish(group$1) && isNonEmptyArray(group$1);
    };
    sliceZone = (slices) => {
      return isNonNullish(slices) && isNonEmptyArray(slices);
    };
  }
});

// node_modules/@prismicio/client/dist/lib/isValue.js
var filledLinkToMedia, imageLike, filledImage, rtImageNode, filledContentRelationship, prismicDocument;
var init_isValue = __esm({
  "node_modules/@prismicio/client/dist/lib/isValue.js"() {
    "use strict";
    init_richText();
    init_link();
    filledLinkToMedia = (value) => {
      if (value && typeof value === "object" && !("version" in value)) {
        if ("link_type" in value && value.link_type === LinkType.Media && "id" in value && "name" in value && "kind" in value && "url" in value && "size" in value) return true;
      }
      return false;
    };
    imageLike = (value) => {
      if (value && typeof value === "object" && (!("version" in value) || typeof value.version === "object")) {
        if ("id" in value && "url" in value && typeof value.url === "string" && "dimensions" in value && "edit" in value && "alt" in value && "copyright" in value) return true;
      }
      return false;
    };
    filledImage = (value) => {
      if (imageLike(value) && (!("type" in value) || value.type !== RichTextNodeType.image)) return true;
      return false;
    };
    rtImageNode = (value) => {
      if (imageLike(value) && "type" in value && value.type === RichTextNodeType.image) return true;
      return false;
    };
    filledContentRelationship = (value) => {
      if (value && typeof value === "object" && !("version" in value)) {
        if ("link_type" in value && value.link_type === LinkType.Document && "id" in value && "type" in value && "tags" in value && "lang" in value) return true;
      }
      return false;
    };
    prismicDocument = (value) => {
      try {
        return typeof value === "object" && value !== null && "id" in value && "href" in value && typeof value.href === "string" && new URL(value.href) && "type" in value && "lang" in value && "tags" in value && Array.isArray(value.tags);
      } catch {
        return false;
      }
    };
  }
});

// node_modules/@prismicio/client/dist/lib/isMigrationValue.js
var contentRelationship2, image2, linkToMedia2, rtImageNode2;
var init_isMigrationValue = __esm({
  "node_modules/@prismicio/client/dist/lib/isMigrationValue.js"() {
    "use strict";
    init_richText();
    init_link();
    init_Asset();
    init_Document();
    init_isValue();
    contentRelationship2 = (value) => {
      return value instanceof PrismicMigrationDocument || prismicDocument(value) || typeof value === "object" && value !== null && "link_type" in value && value.link_type === LinkType.Document && "id" in value && (contentRelationship2(value.id) || typeof value.id === "function");
    };
    image2 = (value) => {
      return value instanceof PrismicMigrationAsset || typeof value === "object" && value !== null && "id" in value && Object.values(value).every((maybeThumbnail) => maybeThumbnail instanceof PrismicMigrationAsset);
    };
    linkToMedia2 = (value) => {
      return typeof value === "object" && value !== null && "id" in value && value.id instanceof PrismicMigrationAsset && "link_type" in value && value.link_type === LinkType.Media;
    };
    rtImageNode2 = (value) => {
      return typeof value === "object" && value !== null && "id" in value && value.id instanceof PrismicMigrationAsset && "type" in value && value.type === RichTextNodeType.image;
    };
  }
});

// node_modules/@prismicio/client/dist/lib/getOptionalLinkProperties.js
var getOptionalLinkProperties;
var init_getOptionalLinkProperties = __esm({
  "node_modules/@prismicio/client/dist/lib/getOptionalLinkProperties.js"() {
    "use strict";
    getOptionalLinkProperties = (input) => {
      const res = {};
      if ("text" in input) res.text = input.text;
      if ("variant" in input) res.variant = input.variant;
      return res;
    };
  }
});

// node_modules/@prismicio/client/dist/lib/resolveMigrationDocumentData.js
async function resolveMigrationContentRelationship(relation) {
  if (typeof relation === "function") return resolveMigrationContentRelationship(await relation());
  if (relation instanceof PrismicMigrationDocument) return relation.document.id ? {
    link_type: LinkType.Document,
    id: relation.document.id
  } : { link_type: LinkType.Any };
  const optionalLinkProperties = relation && "link_type" in relation ? getOptionalLinkProperties(relation) : void 0;
  if (relation) {
    if (contentRelationship2(relation.id) || typeof relation.id !== "string") return {
      ...optionalLinkProperties,
      ...await resolveMigrationContentRelationship(relation.id)
    };
    return {
      ...optionalLinkProperties,
      link_type: LinkType.Document,
      id: relation.id
    };
  }
  return {
    ...optionalLinkProperties,
    link_type: LinkType.Any
  };
}
async function resolveMigrationDocumentData(input, migration) {
  if (contentRelationship2(input)) return resolveMigrationContentRelationship(input);
  if (image2(input)) return resolveMigrationImage(input, migration, true);
  if (linkToMedia2(input)) return resolveMigrationLinkToMedia(input, migration);
  if (rtImageNode2(input)) return resolveMigrationRTImageNode(input, migration);
  if (typeof input === "function") return await resolveMigrationDocumentData(await input(), migration);
  if (Array.isArray(input)) {
    const res = [];
    for (const element of input) res.push(await resolveMigrationDocumentData(element, migration));
    return res.filter(Boolean);
  }
  if (input && typeof input === "object") {
    const res = {};
    for (const key in input) res[key] = await resolveMigrationDocumentData(input[key], migration);
    return res;
  }
  return input;
}
var resolveMigrationImage, resolveMigrationRTImageNode, resolveMigrationLinkToMedia;
var init_resolveMigrationDocumentData = __esm({
  "node_modules/@prismicio/client/dist/lib/resolveMigrationDocumentData.js"() {
    "use strict";
    init_richText();
    init_link();
    init_Asset();
    init_Document();
    init_isFilled();
    init_isMigrationValue();
    init_getOptionalLinkProperties();
    resolveMigrationImage = (image$1, migration, withThumbnails) => {
      var _migration$_assets$ge;
      const { id: master, ...thumbnails } = image$1 instanceof PrismicMigrationAsset ? { id: image$1 } : image$1;
      const asset = (_migration$_assets$ge = migration._assets.get(master.config.id)) === null || _migration$_assets$ge === void 0 ? void 0 : _migration$_assets$ge.asset;
      const maybeInitialField = master.originalField;
      if (asset) {
        const parameters = ((maybeInitialField === null || maybeInitialField === void 0 ? void 0 : maybeInitialField.url) || asset.url).split("?")[1];
        const url = `${asset.url.split("?")[0]}${parameters ? `?${parameters}` : ""}`;
        const dimensions = {
          width: asset.width,
          height: asset.height
        };
        const edit = maybeInitialField && "edit" in maybeInitialField ? maybeInitialField === null || maybeInitialField === void 0 ? void 0 : maybeInitialField.edit : {
          x: 0,
          y: 0,
          zoom: 1,
          background: "transparent"
        };
        const alt = master.config.alt || asset.alt || null;
        const resolvedThumbnails = {};
        if (withThumbnails) for (const [name2, thumbnail] of Object.entries(thumbnails)) {
          const resolvedThumbnail = resolveMigrationImage(thumbnail, migration);
          if (resolvedThumbnail) resolvedThumbnails[name2] = resolvedThumbnail;
        }
        return {
          id: asset.id,
          url,
          dimensions,
          edit,
          alt,
          copyright: asset.credits || null,
          ...resolvedThumbnails
        };
      }
    };
    resolveMigrationRTImageNode = async (rtImageNode$1, migration) => {
      const image$1 = resolveMigrationImage(rtImageNode$1.id, migration);
      if (image$1) {
        const linkTo = await resolveMigrationDocumentData(rtImageNode$1.linkTo, migration);
        return {
          ...image$1,
          type: RichTextNodeType.image,
          linkTo: link(linkTo) ? linkTo : void 0
        };
      }
    };
    resolveMigrationLinkToMedia = (linkToMedia$1, migration) => {
      var _migration$_assets$ge2;
      const asset = (_migration$_assets$ge2 = migration._assets.get(linkToMedia$1.id.config.id)) === null || _migration$_assets$ge2 === void 0 ? void 0 : _migration$_assets$ge2.asset;
      const optionalLinkProperties = getOptionalLinkProperties(linkToMedia$1);
      if (asset) return {
        ...optionalLinkProperties,
        id: asset.id,
        link_type: LinkType.Media
      };
      return {
        ...optionalLinkProperties,
        link_type: LinkType.Any
      };
    };
  }
});

// node_modules/@prismicio/client/dist/WriteClient.js
var CLIENT_IDENTIFIER, _WriteClient_instances, request_fn2, handleAssetAPIError_fn, handleMigrationAPIError_fn, _a2, WriteClient;
var init_WriteClient = __esm({
  "node_modules/@prismicio/client/dist/WriteClient.js"() {
    "use strict";
    init_package();
    init_devMsg();
    init_pLimit();
    init_request();
    init_errors();
    init_Client();
    init_resolveMigrationDocumentData();
    CLIENT_IDENTIFIER = `${name.replace("@", "").replace("/", "-")}/${version}`;
    WriteClient = (_a2 = class extends Client {
      /**
      * Creates a Prismic client that can be used to query and write content to a
      * repository.
      *
      * If used in an environment where a global `fetch` function is unavailable,
      * such as in some Node.js versions, the `fetch` option must be provided as
      * part of the `options` parameter.
      *
      * @param repositoryName - The Prismic repository name for the repository.
      * @param options - Configuration that determines how content will be queried
      *   from and written to the Prismic repository.
      *
      * @returns A client that can query and write content to the repository.
      */
      constructor(repositoryName, options) {
        super(repositoryName, options);
        __privateAdd(this, _WriteClient_instances);
        __publicField(this, "writeToken");
        __publicField(this, "assetAPIEndpoint", "https://asset-api.prismic.io/");
        __publicField(this, "migrationAPIEndpoint", "https://migration.prismic.io/");
        /**
        * {@link resolveAssetTagIDs} rate limiter.
        */
        __publicField(this, "_resolveAssetTagIDsLimit", pLimit());
        if (typeof globalThis.window !== "undefined") console.warn(`[@prismicio/client] Prismic write client appears to be running in a browser environment. This is not recommended as it exposes your write token. Consider using Prismic write client in a server environment only, preferring the regular client for browser environment. For more details, see ${devMsg("avoid-write-client-in-browser")}`);
        this.writeToken = options.writeToken;
        if (options.assetAPIEndpoint) this.assetAPIEndpoint = `${options.assetAPIEndpoint}/`;
        if (options.migrationAPIEndpoint) this.migrationAPIEndpoint = `${options.migrationAPIEndpoint}/`;
      }
      /**
      * Creates a migration release on the Prismic repository based on the provided
      * prepared migration.
      *
      * @param migration - A migration prepared with {@link createMigration}.
      * @param params - An event listener and additional fetch parameters.
      *
      * @see Prismic Migration API technical reference: {@link https://prismic.io/docs/migration-api-technical-reference}
      */
      async migrate(migration, params = {}) {
        var _params$reporter, _params$reporter2;
        (_params$reporter = params.reporter) === null || _params$reporter === void 0 || _params$reporter.call(params, {
          type: "start",
          data: { pending: {
            documents: migration._documents.length,
            assets: migration._assets.size
          } }
        });
        await this.migrateCreateAssets(migration, params);
        await this.migrateCreateDocuments(migration, params);
        await this.migrateUpdateDocuments(migration, params);
        (_params$reporter2 = params.reporter) === null || _params$reporter2 === void 0 || _params$reporter2.call(params, {
          type: "end",
          data: { migrated: {
            documents: migration._documents.length,
            assets: migration._assets.size
          } }
        });
      }
      /**
      * Creates assets in the Prismic repository's media library.
      *
      * @param migration - A migration prepared with {@link createMigration}.
      * @param params - An event listener and additional fetch parameters.
      *
      * @internal This method is one of the step performed by the {@link migrate} method.
      */
      async migrateCreateAssets(migration, { reporter, ...fetchParams } = {}) {
        let created = 0;
        for (const [_, migrationAsset] of migration._assets) {
          reporter === null || reporter === void 0 || reporter({
            type: "assets:creating",
            data: {
              current: ++created,
              remaining: migration._assets.size - created,
              total: migration._assets.size,
              asset: migrationAsset
            }
          });
          const { file, filename, notes, credits, alt, tags } = migrationAsset.config;
          let resolvedFile;
          if (typeof file === "string") {
            let url;
            try {
              url = new URL(file);
            } catch {
            }
            if (url) resolvedFile = await this.fetchForeignAsset(url.toString(), fetchParams);
            else resolvedFile = file;
          } else if (file instanceof URL) resolvedFile = await this.fetchForeignAsset(file.toString(), fetchParams);
          else resolvedFile = file;
          migrationAsset.asset = await this.createAsset(resolvedFile, filename, {
            notes,
            credits,
            alt,
            tags,
            ...fetchParams
          });
        }
        reporter === null || reporter === void 0 || reporter({
          type: "assets:created",
          data: { created }
        });
      }
      /**
      * Creates documents in the Prismic repository's migration release.
      *
      * @param migration - A migration prepared with {@link createMigration}.
      * @param params - An event listener and additional fetch parameters.
      *
      * @internal This method is one of the step performed by the {@link migrate} method.
      */
      async migrateCreateDocuments(migration, { reporter, ...fetchParams } = {}) {
        const masterLocale = (await this.getRepository(fetchParams)).languages[0].id;
        reporter === null || reporter === void 0 || reporter({
          type: "documents:masterLocale",
          data: { masterLocale }
        });
        const documentsToCreate = [];
        for (const doc of migration._documents) if (!doc.document.id) if (doc.document.lang === masterLocale) documentsToCreate.unshift(doc);
        else documentsToCreate.push(doc);
        let created = 0;
        for (const doc of documentsToCreate) {
          reporter === null || reporter === void 0 || reporter({
            type: "documents:creating",
            data: {
              current: ++created,
              remaining: documentsToCreate.length - created,
              total: documentsToCreate.length,
              document: doc
            }
          });
          let masterLanguageDocumentID;
          if (doc.masterLanguageDocument) {
            const masterLanguageDocument = await resolveMigrationContentRelationship(doc.masterLanguageDocument);
            masterLanguageDocumentID = "id" in masterLanguageDocument ? masterLanguageDocument.id : void 0;
          } else if (doc.originalPrismicDocument) {
            var _doc$originalPrismicD;
            const maybeOriginalID = (_doc$originalPrismicD = doc.originalPrismicDocument.alternate_languages.find(({ lang }) => lang === masterLocale)) === null || _doc$originalPrismicD === void 0 ? void 0 : _doc$originalPrismicD.id;
            if (maybeOriginalID) {
              var _migration$_getByOrig;
              masterLanguageDocumentID = (_migration$_getByOrig = migration._getByOriginalID(maybeOriginalID)) === null || _migration$_getByOrig === void 0 ? void 0 : _migration$_getByOrig.document.id;
            }
          }
          const { id } = await this.createDocument({
            ...doc.document,
            data: {}
          }, doc.title, {
            masterLanguageDocumentID,
            ...fetchParams
          });
          doc.document.id = id;
        }
        reporter === null || reporter === void 0 || reporter({
          type: "documents:created",
          data: { created }
        });
      }
      /**
      * Updates documents in the Prismic repository's migration release with their
      * patched data.
      *
      * @param migration - A migration prepared with {@link createMigration}.
      * @param params - An event listener and additional fetch parameters.
      *
      * @internal This method is one of the step performed by the {@link migrate} method.
      */
      async migrateUpdateDocuments(migration, { reporter, ...fetchParams } = {}) {
        let i = 0;
        for (const doc of migration._documents) {
          reporter === null || reporter === void 0 || reporter({
            type: "documents:updating",
            data: {
              current: ++i,
              remaining: migration._documents.length - i,
              total: migration._documents.length,
              document: doc
            }
          });
          await this.updateDocument(doc.document.id, {
            ...doc.document,
            documentTitle: doc.title,
            data: await resolveMigrationDocumentData(doc.document.data, migration)
          }, fetchParams);
        }
        reporter === null || reporter === void 0 || reporter({
          type: "documents:updated",
          data: { updated: migration._documents.length }
        });
      }
      /**
      * Creates an asset in the Prismic media library.
      *
      * @param file - The file to upload as an asset.
      * @param filename - The filename of the asset.
      * @param params - Additional asset data and fetch parameters.
      *
      * @returns The created asset.
      */
      async createAsset(file, filename, { notes, credits, alt, tags, ...params } = {}) {
        const url = new URL("assets", this.assetAPIEndpoint);
        const formData = new FormData();
        formData.append("file", new File([file], filename, { type: file instanceof File ? file.type : void 0 }));
        if (notes) formData.append("notes", notes);
        if (credits) formData.append("credits", credits);
        if (alt) formData.append("alt", alt);
        const response = await __privateMethod(this, _WriteClient_instances, request_fn2).call(this, url, params, {
          method: "POST",
          body: formData
        });
        switch (response.status) {
          case 200: {
            const asset = await response.json();
            if (tags && tags.length) return this.updateAsset(asset.id, { tags });
            return asset;
          }
          default:
            return await __privateMethod(this, _WriteClient_instances, handleAssetAPIError_fn).call(this, response);
        }
      }
      /**
      * Updates an asset in the Prismic media library.
      *
      * @param id - The ID of the asset to update.
      * @param params - The asset data to update and additional fetch parameters.
      *
      * @returns The updated asset.
      */
      async updateAsset(id, { notes, credits, alt, filename, tags, ...params } = {}) {
        const url = new URL(`assets/${id}`, this.assetAPIEndpoint);
        if (tags && tags.length) tags = await this.resolveAssetTagIDs(tags, {
          createTags: true,
          ...params
        });
        const response = await __privateMethod(this, _WriteClient_instances, request_fn2).call(this, url, params, {
          method: "PATCH",
          body: JSON.stringify({
            notes,
            credits,
            alt,
            filename,
            tags
          }),
          headers: { "content-type": "application/json" }
        });
        switch (response.status) {
          case 200:
            return await response.json();
          default:
            return await __privateMethod(this, _WriteClient_instances, handleAssetAPIError_fn).call(this, response);
        }
      }
      /**
      * Fetches a foreign asset from a URL.
      *
      * @param url - The URL of the asset to fetch.
      * @param params - Additional fetch parameters.
      *
      * @returns A file representing the fetched asset.
      */
      async fetchForeignAsset(url, params = {}) {
        const res = await __privateMethod(this, _WriteClient_instances, request_fn2).call(this, new URL(url), params);
        if (!res.ok) throw new PrismicError("Could not fetch foreign asset", url, void 0);
        const blob = await res.blob();
        return new File([blob], "", { type: res.headers.get("content-type") || void 0 });
      }
      /**
      * Resolves asset tag IDs from tag names.
      *
      * @param tagNames - An array of tag names to resolve.
      * @param params - Whether or not missing tags should be created and
      *   additional fetch parameters.
      *
      * @returns An array of resolved tag IDs.
      */
      async resolveAssetTagIDs(tagNames = [], { createTags, ...params } = {}) {
        return this._resolveAssetTagIDsLimit(async () => {
          const existingTags = await this.getAssetTags(params);
          const existingTagMap = {};
          for (const tag of existingTags) existingTagMap[tag.name] = tag;
          const resolvedTagIDs = [];
          for (const tagName of tagNames) {
            if (!existingTagMap[tagName] && createTags) existingTagMap[tagName] = await this.createAssetTag(tagName, params);
            if (existingTagMap[tagName]) resolvedTagIDs.push(existingTagMap[tagName].id);
          }
          return resolvedTagIDs;
        });
      }
      /**
      * Creates a tag in the Asset API.
      *
      * @remarks
      * Tags should be at least 3 characters long and 20 characters at most.
      *
      * @param name - The name of the tag to create.
      * @param params - Additional fetch parameters.
      *
      * @returns The created tag.
      */
      async createAssetTag(name$1, params) {
        const url = new URL("tags", this.assetAPIEndpoint);
        const response = await __privateMethod(this, _WriteClient_instances, request_fn2).call(this, url, params, {
          method: "POST",
          body: JSON.stringify({ name: name$1 }),
          headers: { "content-type": "application/json" }
        });
        switch (response.status) {
          case 201:
            return await response.json();
          default:
            return await __privateMethod(this, _WriteClient_instances, handleAssetAPIError_fn).call(this, response);
        }
      }
      /**
      * Queries existing tags from the Asset API.
      *
      * @param params - Additional fetch parameters.
      *
      * @returns An array of existing tags.
      */
      async getAssetTags(params) {
        const url = new URL("tags", this.assetAPIEndpoint);
        const response = await __privateMethod(this, _WriteClient_instances, request_fn2).call(this, url, params);
        switch (response.status) {
          case 200:
            return (await response.json()).items;
          default:
            return await __privateMethod(this, _WriteClient_instances, handleAssetAPIError_fn).call(this, response);
        }
      }
      /**
      * Creates a document in the repository's migration release.
      *
      * @typeParam TType - Type of Prismic documents to create.
      *
      * @param document - The document to create.
      * @param documentTitle - The title of the document to create which will be
      *   displayed in the editor.
      * @param params - Document master language document ID and additional fetch
      *   parameters.
      *
      * @returns The ID of the created document.
      *
      * @see Prismic Migration API technical reference: {@link https://prismic.io/docs/migration-api-technical-reference}
      */
      async createDocument(document2, documentTitle, { masterLanguageDocumentID, ...params } = {}) {
        const url = new URL("documents", this.migrationAPIEndpoint);
        const response = await __privateMethod(this, _WriteClient_instances, request_fn2).call(this, url, params, {
          method: "POST",
          body: JSON.stringify({
            title: documentTitle,
            type: document2.type,
            uid: document2.uid || void 0,
            lang: document2.lang,
            alternate_language_id: masterLanguageDocumentID,
            tags: document2.tags,
            data: document2.data
          }),
          headers: {
            "content-type": "application/json",
            "x-client": CLIENT_IDENTIFIER
          }
        });
        switch (response.status) {
          case 201:
            return { id: (await response.json()).id };
          default:
            return await __privateMethod(this, _WriteClient_instances, handleMigrationAPIError_fn).call(this, response);
        }
      }
      /**
      * Updates an existing document in the repository's migration release.
      *
      * @typeParam TType - Type of Prismic documents to update.
      *
      * @param id - The ID of the document to update.
      * @param document - The document content to update.
      * @param params - Additional fetch parameters.
      *
      * @see Prismic Migration API technical reference: {@link https://prismic.io/docs/migration-api-technical-reference}
      */
      async updateDocument(id, document2, params) {
        const url = new URL(`documents/${id}`, this.migrationAPIEndpoint);
        const response = await __privateMethod(this, _WriteClient_instances, request_fn2).call(this, url, params, {
          method: "PUT",
          body: JSON.stringify({
            title: document2.documentTitle,
            uid: document2.uid || void 0,
            tags: document2.tags,
            data: document2.data
          }),
          headers: {
            "content-type": "application/json",
            "x-client": CLIENT_IDENTIFIER
          }
        });
        switch (response.status) {
          case 200:
            return;
          default:
            await __privateMethod(this, _WriteClient_instances, handleMigrationAPIError_fn).call(this, response);
        }
      }
    }, _WriteClient_instances = new WeakSet(), request_fn2 = async function(url, params, init) {
      var _this$fetchOptions, _params$fetchOptions, _params$fetchOptions2, _this$fetchOptions2;
      return await request(url, {
        ...this.fetchOptions,
        ...params === null || params === void 0 ? void 0 : params.fetchOptions,
        ...init,
        headers: {
          ...(_this$fetchOptions = this.fetchOptions) === null || _this$fetchOptions === void 0 ? void 0 : _this$fetchOptions.headers,
          ...params === null || params === void 0 || (_params$fetchOptions = params.fetchOptions) === null || _params$fetchOptions === void 0 ? void 0 : _params$fetchOptions.headers,
          ...init === null || init === void 0 ? void 0 : init.headers,
          repository: this.repositoryName,
          authorization: `Bearer ${this.writeToken}`
        },
        signal: (params === null || params === void 0 || (_params$fetchOptions2 = params.fetchOptions) === null || _params$fetchOptions2 === void 0 ? void 0 : _params$fetchOptions2.signal) || (params === null || params === void 0 ? void 0 : params.signal) || ((_this$fetchOptions2 = this.fetchOptions) === null || _this$fetchOptions2 === void 0 ? void 0 : _this$fetchOptions2.signal)
      }, this.fetchFn);
    }, handleAssetAPIError_fn = async function(response) {
      const json = await response.json();
      switch (response.status) {
        case 401:
        case 403:
          throw new ForbiddenError(json.error, response.url, json);
        case 404:
          throw new NotFoundError(json.error, response.url, json);
        case 400:
          throw new InvalidDataError(json.error, response.url, json);
        case 500:
        case 503:
        default:
          throw new PrismicError(json.error, response.url, json);
      }
    }, handleMigrationAPIError_fn = async function(response) {
      const payload = await response.json();
      const message = payload.message;
      switch (response.status) {
        case 400:
          throw new InvalidDataError(message, response.url, payload);
        case 401:
          throw new ForbiddenError(message, response.url, payload);
        case 403:
          throw new ForbiddenError(message ?? payload.Message, response.url, payload);
        case 404:
          throw new NotFoundError(message, response.url, payload);
        case 500:
        default:
          throw new PrismicError(message, response.url, payload);
      }
    }, _a2);
  }
});

// node_modules/@prismicio/client/dist/createWriteClient.js
var createWriteClient;
var init_createWriteClient = __esm({
  "node_modules/@prismicio/client/dist/createWriteClient.js"() {
    "use strict";
    init_WriteClient();
    createWriteClient = (repositoryName, options) => new WriteClient(repositoryName, options);
  }
});

// node_modules/@prismicio/client/dist/lib/validateAssetMetadata.js
var ASSET_NOTES_MAX_LENGTH, ASSET_CREDITS_MAX_LENGTH, ASSET_ALT_MAX_LENGTH, ASSET_TAG_MIN_LENGTH, ASSET_TAG_MAX_LENGTH, validateAssetMetadata;
var init_validateAssetMetadata = __esm({
  "node_modules/@prismicio/client/dist/lib/validateAssetMetadata.js"() {
    "use strict";
    init_errors();
    ASSET_NOTES_MAX_LENGTH = 500;
    ASSET_CREDITS_MAX_LENGTH = 500;
    ASSET_ALT_MAX_LENGTH = 500;
    ASSET_TAG_MIN_LENGTH = 3;
    ASSET_TAG_MAX_LENGTH = 20;
    validateAssetMetadata = ({ notes, credits, alt, tags }) => {
      const errors = [];
      if (notes && notes.length > ASSET_NOTES_MAX_LENGTH) errors.push(`\`notes\` must be at most ${ASSET_NOTES_MAX_LENGTH} characters`);
      if (credits && credits.length > ASSET_CREDITS_MAX_LENGTH) errors.push(`\`credits\` must be at most ${ASSET_CREDITS_MAX_LENGTH} characters`);
      if (alt && alt.length > ASSET_ALT_MAX_LENGTH) errors.push(`\`alt\` must be at most ${ASSET_ALT_MAX_LENGTH} characters`);
      if (tags && tags.length && tags.some((tag) => tag.length < ASSET_TAG_MIN_LENGTH || tag.length > ASSET_TAG_MAX_LENGTH)) errors.push(`tags must be at least 3 characters long and 20 characters at most`);
      if (errors.length) throw new PrismicError(`Errors validating asset metadata: ${errors.join(", ")}`, void 0, {
        notes,
        credits,
        alt,
        tags
      });
    };
  }
});

// node_modules/@prismicio/client/dist/Migration.js
var _Migration_instances, migratePrismicDocumentData_fn, _a3, Migration;
var init_Migration = __esm({
  "node_modules/@prismicio/client/dist/Migration.js"() {
    "use strict";
    init_richText();
    init_link();
    init_Asset();
    init_Document();
    init_isValue();
    init_getOptionalLinkProperties();
    init_validateAssetMetadata();
    Migration = (_a3 = class {
      constructor() {
        __privateAdd(this, _Migration_instances);
        /**
        * Assets registered in the migration.
        *
        * @internal
        */
        __publicField(this, "_assets", /* @__PURE__ */ new Map());
        /**
        * Documents registered in the migration.
        *
        * @internal
        */
        __publicField(this, "_documents", []);
      }
      /**
      * Registers an asset to be created in the migration from a file, an asset
      * object, or an image or link to media field.
      *
      * @remarks
      * This method does not create the asset in Prismic media library right away.
      * Instead, it registers it in your migration. The asset will be created when
      * the migration is executed through the `writeClient.migrate()` method.
      *
      * @returns A migration asset field instance.
      */
      createAsset(fileOrAssetOrField, filename, { notes, credits, alt, tags } = {}) {
        let config;
        let maybeInitialField;
        if (typeof fileOrAssetOrField === "object" && "url" in fileOrAssetOrField) if ("dimensions" in fileOrAssetOrField || "link_type" in fileOrAssetOrField) {
          const url = fileOrAssetOrField.url.split("?")[0];
          const filename$1 = "name" in fileOrAssetOrField ? fileOrAssetOrField.name : url.split("/").pop().split("_").pop();
          const credits$1 = "copyright" in fileOrAssetOrField && fileOrAssetOrField.copyright ? fileOrAssetOrField.copyright : void 0;
          const alt$1 = "alt" in fileOrAssetOrField && fileOrAssetOrField.alt ? fileOrAssetOrField.alt : void 0;
          if ("dimensions" in fileOrAssetOrField) maybeInitialField = fileOrAssetOrField;
          config = {
            id: fileOrAssetOrField.id,
            file: url,
            filename: filename$1,
            notes: void 0,
            credits: credits$1,
            alt: alt$1,
            tags: void 0
          };
        } else {
          var _fileOrAssetOrField$t;
          config = {
            id: fileOrAssetOrField.id,
            file: fileOrAssetOrField.url,
            filename: fileOrAssetOrField.filename,
            notes: fileOrAssetOrField.notes,
            credits: fileOrAssetOrField.credits,
            alt: fileOrAssetOrField.alt,
            tags: (_fileOrAssetOrField$t = fileOrAssetOrField.tags) === null || _fileOrAssetOrField$t === void 0 ? void 0 : _fileOrAssetOrField$t.map(({ name: name2 }) => name2)
          };
        }
        else config = {
          id: fileOrAssetOrField,
          file: fileOrAssetOrField,
          filename,
          notes,
          credits,
          alt,
          tags
        };
        validateAssetMetadata(config);
        const migrationAsset = new PrismicMigrationAsset(config, maybeInitialField);
        const maybeAsset = this._assets.get(config.id);
        if (maybeAsset) {
          maybeAsset.config.notes = maybeAsset.config.notes || config.notes;
          maybeAsset.config.credits = maybeAsset.config.credits || config.credits;
          maybeAsset.config.alt = maybeAsset.config.alt || config.alt;
          maybeAsset.config.tags = Array.from(/* @__PURE__ */ new Set([...maybeAsset.config.tags || [], ...config.tags || []]));
        } else this._assets.set(config.id, migrationAsset);
        return migrationAsset;
      }
      /**
      * Registers a document to be created in the migration.
      *
      * @remarks
      * This method does not create the document in Prismic right away. Instead, it
      * registers it in your migration. The document will be created when the
      * migration is executed through the `writeClient.migrate()` method.
      *
      * @typeParam TType - Type of the Prismic document to create.
      *
      * @param document - The document to create.
      * @param title - The title of the document to create which will be displayed
      *   in the editor.
      * @param params - Document master language document ID.
      *
      * @returns A migration document instance.
      */
      createDocument(document2, title2, params) {
        const doc = new PrismicMigrationDocument(document2, title2, params);
        this._documents.push(doc);
        return doc;
      }
      /**
      * Registers an existing document to be updated in the migration.
      *
      * @remarks
      * This method does not update the document in Prismic right away. Instead, it
      * registers it in your migration. The document will be updated when the
      * migration is executed through the `writeClient.migrate()` method.
      *
      * @typeParam TType - Type of Prismic documents to update.
      *
      * @param document - The document to update.
      * @param title - The title of the document to update which will be displayed
      *   in the editor.
      *
      * @returns A migration document instance.
      */
      updateDocument(document2, title2) {
        const doc = new PrismicMigrationDocument(document2, title2);
        this._documents.push(doc);
        return doc;
      }
      /**
      * Registers a document from another Prismic repository to be created in the
      * migration.
      *
      * @remarks
      * This method does not create the document in Prismic right away. Instead, it
      * registers it in your migration. The document will be created when the
      * migration is executed through the `writeClient.migrate()` method.
      *
      * @param document - The document from Prismic to create.
      * @param title - The title of the document to create which will be displayed
      *   in the editor.
      *
      * @returns A migration document instance.
      */
      createDocumentFromPrismic(document2, title2) {
        const doc = new PrismicMigrationDocument(__privateMethod(this, _Migration_instances, migratePrismicDocumentData_fn).call(this, {
          type: document2.type,
          lang: document2.lang,
          uid: document2.uid,
          tags: document2.tags,
          data: document2.data
        }), title2, { originalPrismicDocument: document2 });
        this._documents.push(doc);
        return doc;
      }
      /**
      * Queries a document from the migration instance with a specific UID and
      * custom type.
      *
      * @example
      *
      * ```ts
      * const contentRelationship = migration.createContentRelationship(() =>
      * 	migration.getByUID("blog_post", "my-first-post"),
      * )
      * ```
      *
      * @typeParam TType - Type of the Prismic document returned.
      *
      * @param type - The API ID of the document's custom type.
      * @param uid - The UID of the document.
      *
      * @returns The migration document instance with a UID matching the `uid`
      *   parameter, if a matching document is found.
      */
      getByUID(type, uid) {
        return this._documents.find((doc) => doc.document.type === type && doc.document.uid === uid);
      }
      /**
      * Queries a singleton document from the migration instance for a specific
      * custom type.
      *
      * @example
      *
      * ```ts
      * const contentRelationship = migration.createContentRelationship(() =>
      * 	migration.getSingle("settings"),
      * )
      * ```
      *
      * @typeParam TType - Type of the Prismic document returned.
      *
      * @param type - The API ID of the singleton custom type.
      *
      * @returns The migration document instance for the custom type, if a matching
      *   document is found.
      */
      getSingle(type) {
        return this._documents.find((doc) => doc.document.type === type);
      }
      /**
      * Queries a document from the migration instance for a specific original ID.
      *
      * @example
      *
      * ```ts
      * const contentRelationship = migration.createContentRelationship(() =>
      * 	migration._getByOriginalID("YhdrDxIAACgAcp_b"),
      * )
      * ```
      *
      * @typeParam TType - Type of the Prismic document returned.
      *
      * @param id - The original ID of the Prismic document.
      *
      * @returns The migration document instance for the original ID, if a matching
      *   document is found.
      *
      * @internal
      */
      _getByOriginalID(id) {
        return this._documents.find((doc) => {
          var _doc$originalPrismicD;
          return ((_doc$originalPrismicD = doc.originalPrismicDocument) === null || _doc$originalPrismicD === void 0 ? void 0 : _doc$originalPrismicD.id) === id;
        });
      }
    }, _Migration_instances = new WeakSet(), /**
    * Migrates a Prismic document data from another repository so that it can be
    * created through the current repository's Migration API.
    *
    * @param input - The Prismic document data to migrate.
    *
    * @returns The migrated Prismic document data.
    */
    migratePrismicDocumentData_fn = function(input) {
      if (filledContentRelationship(input)) {
        const optionalLinkProperties = getOptionalLinkProperties(input);
        if (input.isBroken) return {
          ...optionalLinkProperties,
          link_type: LinkType.Document,
          id: "_____broken_____",
          isBroken: true
        };
        return {
          ...optionalLinkProperties,
          link_type: LinkType.Document,
          id: () => this._getByOriginalID(input.id)
        };
      }
      if (filledLinkToMedia(input)) return {
        ...getOptionalLinkProperties(input),
        link_type: LinkType.Media,
        id: this.createAsset(input)
      };
      if (rtImageNode(input)) {
        const rtImageNode$1 = {
          type: RichTextNodeType.image,
          id: this.createAsset(input)
        };
        if (input.linkTo) rtImageNode$1.linkTo = __privateMethod(this, _Migration_instances, migratePrismicDocumentData_fn).call(this, input.linkTo);
        return rtImageNode$1;
      }
      if (filledImage(input)) {
        const image3 = { id: this.createAsset(input) };
        const { id: _id, url: _url, dimensions: _dimensions, edit: _edit, alt: _alt, copyright: _copyright, ...thumbnails } = input;
        for (const name2 in thumbnails) if (filledImage(thumbnails[name2])) image3[name2] = this.createAsset(thumbnails[name2]);
        return image3;
      }
      if (Array.isArray(input)) return input.map((element) => __privateMethod(this, _Migration_instances, migratePrismicDocumentData_fn).call(this, element));
      if (input && typeof input === "object") {
        const res = {};
        for (const key in input) res[key] = __privateMethod(this, _Migration_instances, migratePrismicDocumentData_fn).call(this, input[key]);
        return res;
      }
      return input;
    }, _a3);
  }
});

// node_modules/@prismicio/client/dist/createMigration.js
var createMigration;
var init_createMigration = __esm({
  "node_modules/@prismicio/client/dist/createMigration.js"() {
    "use strict";
    init_Migration();
    createMigration = () => new Migration();
  }
});

// node_modules/@prismicio/client/dist/getGraphQLEndpoint.js
var getGraphQLEndpoint;
var init_getGraphQLEndpoint = __esm({
  "node_modules/@prismicio/client/dist/getGraphQLEndpoint.js"() {
    "use strict";
    init_errors();
    init_isRepositoryName();
    getGraphQLEndpoint = (repositoryName) => {
      if (isRepositoryName(repositoryName)) return `https://${repositoryName}.cdn.prismic.io/graphql`;
      else throw new PrismicError(`An invalid Prismic repository name was given: ${repositoryName}`, void 0, void 0);
    };
  }
});

// node_modules/@prismicio/client/dist/getToolbarSrc.js
var getToolbarSrc;
var init_getToolbarSrc = __esm({
  "node_modules/@prismicio/client/dist/getToolbarSrc.js"() {
    "use strict";
    init_errors();
    init_isRepositoryName();
    getToolbarSrc = (repositoryName) => {
      if (isRepositoryName(repositoryName)) return `https://static.cdn.prismic.io/prismic.js?new=true&repo=${repositoryName}`;
      else throw new PrismicError(`An invalid Prismic repository name was given: ${repositoryName}`, void 0, void 0);
    };
  }
});

// node_modules/@prismicio/client/dist/helpers/asDate.js
var asDate;
var init_asDate = __esm({
  "node_modules/@prismicio/client/dist/helpers/asDate.js"() {
    "use strict";
    asDate = (dateOrTimestampField) => {
      if (!dateOrTimestampField) return null;
      if (dateOrTimestampField.length === 24)
        return new Date(dateOrTimestampField.replace(/(\+|-)(\d{2})(\d{2})$/, ".000$1$2:$3"));
      else return new Date(dateOrTimestampField);
    };
  }
});

// node_modules/@prismicio/client/dist/lib/isInternalURL.js
var isInternalURL;
var init_isInternalURL = __esm({
  "node_modules/@prismicio/client/dist/lib/isInternalURL.js"() {
    "use strict";
    isInternalURL = (url) => {
      const isInternal = /^(\/(?!\/)|#)/.test(url);
      const isSpecialLink = !isInternal && !/^https?:\/\//.test(url);
      return isInternal && !isSpecialLink;
    };
  }
});

// node_modules/@prismicio/client/dist/helpers/asLinkAttrs.js
var asLinkAttrs;
var init_asLinkAttrs = __esm({
  "node_modules/@prismicio/client/dist/helpers/asLinkAttrs.js"() {
    "use strict";
    init_asLink();
    init_isFilled();
    init_isInternalURL();
    asLinkAttrs = (linkFieldOrDocument, config = {}) => {
      if (linkFieldOrDocument && ("link_type" in linkFieldOrDocument ? link(linkFieldOrDocument) : linkFieldOrDocument)) {
        const target = "target" in linkFieldOrDocument ? linkFieldOrDocument.target : void 0;
        const rawHref = asLink(linkFieldOrDocument, config.linkResolver);
        const href = rawHref == null ? void 0 : rawHref;
        const isExternal = typeof href === "string" ? !isInternalURL(href) : false;
        const rel = config.rel ? config.rel({
          href,
          isExternal,
          target
        }) : isExternal ? "noreferrer" : void 0;
        return {
          href,
          target,
          rel: rel == null ? void 0 : rel
        };
      }
      return {};
    };
  }
});

// node_modules/@prismicio/client/dist/richtext/asText.js
var asText;
var init_asText = __esm({
  "node_modules/@prismicio/client/dist/richtext/asText.js"() {
    "use strict";
    asText = (richTextField, separator = " ") => {
      let result = "";
      for (let i = 0; i < richTextField.length; i++) if ("text" in richTextField[i]) result += (result ? separator : "") + richTextField[i].text;
      return result;
    };
  }
});

// node_modules/@prismicio/client/dist/helpers/asText.js
var asText$1;
var init_asText2 = __esm({
  "node_modules/@prismicio/client/dist/helpers/asText.js"() {
    "use strict";
    init_asText();
    asText$1 = (richTextField, ...configObjectOrTuple) => {
      if (richTextField) {
        const [configObjectOrSeparator] = configObjectOrTuple;
        let config;
        if (typeof configObjectOrSeparator === "string") config = { separator: configObjectOrSeparator };
        else config = { ...configObjectOrSeparator };
        return asText(richTextField, config.separator);
      } else return null;
    };
  }
});

// node_modules/@prismicio/client/dist/lib/escapeHTML.js
var matchHtmlRegExp, escapeHTML;
var init_escapeHTML = __esm({
  "node_modules/@prismicio/client/dist/lib/escapeHTML.js"() {
    "use strict";
    matchHtmlRegExp = /["'&<>]/;
    escapeHTML = (string) => {
      const str = "" + string;
      const match = matchHtmlRegExp.exec(str);
      if (!match) return str;
      let escape;
      let html = "";
      let index = 0;
      let lastIndex = 0;
      for (index = match.index; index < str.length; index++) {
        switch (str.charCodeAt(index)) {
          case 34:
            escape = "&quot;";
            break;
          case 38:
            escape = "&amp;";
            break;
          case 39:
            escape = "&#39;";
            break;
          case 60:
            escape = "&lt;";
            break;
          case 62:
            escape = "&gt;";
            break;
          default:
            continue;
        }
        if (lastIndex !== index) html += str.substring(lastIndex, index);
        lastIndex = index + 1;
        html += escape;
      }
      return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
    };
  }
});

// node_modules/@prismicio/client/dist/lib/serializerHelpers.js
var formatAttributes, getGeneralAttributes, serializeStandardTag, serializePreFormatted, serializeImage, serializeEmbed, serializeHyperlink, serializeSpan;
var init_serializerHelpers = __esm({
  "node_modules/@prismicio/client/dist/lib/serializerHelpers.js"() {
    "use strict";
    init_link();
    init_asLink();
    init_escapeHTML();
    formatAttributes = (node, attributes) => {
      const _attributes = { ...attributes };
      if ("direction" in node && node.direction === "rtl") _attributes.dir = node.direction;
      if ("data" in node && "label" in node.data && node.data.label) _attributes.class = _attributes.class ? `${_attributes.class} ${node.data.label}` : node.data.label;
      const result = [];
      for (const key in _attributes) {
        const value = _attributes[key];
        if (value) if (typeof value === "boolean") result.push(key);
        else result.push(`${key}="${escapeHTML(value)}"`);
      }
      if (result.length) result.unshift("");
      return result.join(" ");
    };
    getGeneralAttributes = (serializerOrShorthand) => {
      return serializerOrShorthand && typeof serializerOrShorthand !== "function" ? serializerOrShorthand : {};
    };
    serializeStandardTag = (tag, serializerOrShorthand) => {
      const generalAttributes = getGeneralAttributes(serializerOrShorthand);
      return (({ node, children }) => {
        return `<${tag}${formatAttributes(node, generalAttributes)}>${children}</${tag}>`;
      });
    };
    serializePreFormatted = (serializerOrShorthand) => {
      const generalAttributes = getGeneralAttributes(serializerOrShorthand);
      return ({ node }) => {
        return `<pre${formatAttributes(node, generalAttributes)}>${escapeHTML(node.text)}</pre>`;
      };
    };
    serializeImage = (linkResolver, serializerOrShorthand) => {
      const generalAttributes = getGeneralAttributes(serializerOrShorthand);
      return ({ node }) => {
        let imageTag = `<img${formatAttributes(node, {
          ...generalAttributes,
          src: node.url,
          alt: node.alt,
          copyright: node.copyright
        })} />`;
        if (node.linkTo) imageTag = serializeHyperlink(linkResolver)({
          type: "hyperlink",
          node: {
            type: "hyperlink",
            data: node.linkTo,
            start: 0,
            end: 0
          },
          text: "",
          children: imageTag,
          key: ""
        });
        return `<p class="block-img">${imageTag}</p>`;
      };
    };
    serializeEmbed = (serializerOrShorthand) => {
      const generalAttributes = getGeneralAttributes(serializerOrShorthand);
      return ({ node }) => {
        return `<div${formatAttributes(node, {
          ...generalAttributes,
          ["data-oembed"]: node.oembed.embed_url,
          ["data-oembed-type"]: node.oembed.type,
          ["data-oembed-provider"]: node.oembed.provider_name
        })}>${node.oembed.html}</div>`;
      };
    };
    serializeHyperlink = (linkResolver, serializerOrShorthand) => {
      const generalAttributes = getGeneralAttributes(serializerOrShorthand);
      return ({ node, children }) => {
        const attributes = { ...generalAttributes };
        if (node.data.link_type === LinkType.Web) {
          attributes.href = node.data.url;
          attributes.target = node.data.target;
          attributes.rel = "noopener noreferrer";
        } else if (node.data.link_type === LinkType.Document) attributes.href = asLink(node.data, { linkResolver });
        else if (node.data.link_type === LinkType.Media) attributes.href = node.data.url;
        return `<a${formatAttributes(node, attributes)}>${children}</a>`;
      };
    };
    serializeSpan = () => {
      return ({ text }) => {
        return text ? escapeHTML(text).replace(/\n/g, "<br />") : "";
      };
    };
  }
});

// node_modules/@prismicio/client/dist/richtext/asTree.js
var uuid, asTree, createTreeNode, createTextTreeNode, prepareNodes, nodeToTreeNode, textNodeSpansToTreeNodeChildren;
var init_asTree = __esm({
  "node_modules/@prismicio/client/dist/richtext/asTree.js"() {
    "use strict";
    init_richText();
    uuid = () => {
      return (++uuid.i).toString();
    };
    uuid.i = 0;
    asTree = (nodes) => {
      const preparedNodes = prepareNodes(nodes);
      const children = [];
      for (let i = 0; i < preparedNodes.length; i++) children.push(nodeToTreeNode(preparedNodes[i]));
      return {
        key: uuid(),
        children
      };
    };
    createTreeNode = (node, children = []) => {
      return {
        key: uuid(),
        type: node.type,
        text: "text" in node ? node.text : void 0,
        node,
        children
      };
    };
    createTextTreeNode = (text) => {
      return createTreeNode({
        type: RichTextNodeType.span,
        text,
        spans: []
      });
    };
    prepareNodes = (nodes) => {
      const mutNodes = nodes.slice(0);
      for (let i = 0; i < mutNodes.length; i++) {
        const node = mutNodes[i];
        if (node.type === RichTextNodeType.listItem || node.type === RichTextNodeType.oListItem) {
          const items = [node];
          while (mutNodes[i + 1] && mutNodes[i + 1].type === node.type) {
            items.push(mutNodes[i + 1]);
            mutNodes.splice(i, 1);
          }
          if (node.type === RichTextNodeType.listItem) mutNodes[i] = {
            type: RichTextNodeType.list,
            items
          };
          else mutNodes[i] = {
            type: RichTextNodeType.oList,
            items
          };
        }
      }
      return mutNodes;
    };
    nodeToTreeNode = (node) => {
      if ("text" in node) return createTreeNode(node, textNodeSpansToTreeNodeChildren(node.spans, node));
      if ("items" in node) {
        const children = [];
        for (let i = 0; i < node.items.length; i++) children.push(nodeToTreeNode(node.items[i]));
        return createTreeNode(node, children);
      }
      return createTreeNode(node);
    };
    textNodeSpansToTreeNodeChildren = (spans, node, parentSpan) => {
      if (!spans.length) return [createTextTreeNode(node.text)];
      const mutSpans = spans.slice(0);
      mutSpans.sort((a, b) => a.start - b.start || b.end - a.end);
      const children = [];
      for (let i = 0; i < mutSpans.length; i++) {
        const span = mutSpans[i];
        const parentSpanStart = parentSpan && parentSpan.start || 0;
        const spanStart = span.start - parentSpanStart;
        const spanEnd = span.end - parentSpanStart;
        const text = node.text.slice(spanStart, spanEnd);
        const childSpans = [];
        for (let j = i; j < mutSpans.length; j++) {
          const siblingSpan = mutSpans[j];
          if (siblingSpan !== span) {
            if (siblingSpan.start >= span.start && siblingSpan.end <= span.end) {
              childSpans.push(siblingSpan);
              mutSpans.splice(j, 1);
              j--;
            } else if (siblingSpan.start < span.end && siblingSpan.end > span.start) {
              childSpans.push({
                ...siblingSpan,
                end: span.end
              });
              mutSpans[j] = {
                ...siblingSpan,
                start: span.end
              };
            }
          }
        }
        if (i === 0 && spanStart > 0) children.push(createTextTreeNode(node.text.slice(0, spanStart)));
        const spanWithText = {
          ...span,
          text
        };
        children.push(createTreeNode(spanWithText, textNodeSpansToTreeNodeChildren(childSpans, {
          ...node,
          text
        }, span)));
        if (spanEnd < node.text.length) children.push(createTextTreeNode(node.text.slice(spanEnd, mutSpans[i + 1] ? mutSpans[i + 1].start - parentSpanStart : void 0)));
      }
      return children;
    };
  }
});

// node_modules/@prismicio/client/dist/richtext/serialize.js
var serialize, serializeTreeNodes;
var init_serialize = __esm({
  "node_modules/@prismicio/client/dist/richtext/serialize.js"() {
    "use strict";
    init_asTree();
    serialize = (richTextField, serializer) => {
      return serializeTreeNodes(asTree(richTextField).children, serializer);
    };
    serializeTreeNodes = (nodes, serializer) => {
      const serializedTreeNodes = [];
      for (let i = 0; i < nodes.length; i++) {
        const treeNode = nodes[i];
        const serializedTreeNode = serializer(treeNode.type, treeNode.node, treeNode.text, serializeTreeNodes(treeNode.children, serializer), treeNode.key);
        if (serializedTreeNode != null) serializedTreeNodes.push(serializedTreeNode);
      }
      return serializedTreeNodes;
    };
  }
});

// node_modules/@prismicio/client/dist/richtext/types.js
var RichTextReversedNodeType;
var init_types = __esm({
  "node_modules/@prismicio/client/dist/richtext/types.js"() {
    "use strict";
    init_richText();
    RichTextReversedNodeType = {
      [RichTextNodeType.listItem]: "listItem",
      [RichTextNodeType.oListItem]: "oListItem",
      [RichTextNodeType.list]: "list",
      [RichTextNodeType.oList]: "oList"
    };
  }
});

// node_modules/@prismicio/client/dist/richtext/wrapMapSerializer.js
var wrapMapSerializer;
var init_wrapMapSerializer = __esm({
  "node_modules/@prismicio/client/dist/richtext/wrapMapSerializer.js"() {
    "use strict";
    init_types();
    wrapMapSerializer = (mapSerializer) => {
      return (type, node, text, children, key) => {
        const tagSerializer = mapSerializer[RichTextReversedNodeType[type] || type];
        if (tagSerializer) return tagSerializer({
          type,
          node,
          text,
          children,
          key
        });
      };
    };
  }
});

// node_modules/@prismicio/client/dist/richtext/composeSerializers.js
var composeSerializers;
var init_composeSerializers = __esm({
  "node_modules/@prismicio/client/dist/richtext/composeSerializers.js"() {
    "use strict";
    composeSerializers = (...serializers) => {
      return (...args) => {
        for (let i = 0; i < serializers.length; i++) {
          const serializer = serializers[i];
          if (serializer) {
            const res = serializer(...args);
            if (res != null) return res;
          }
        }
      };
    };
  }
});

// node_modules/@prismicio/client/dist/helpers/asHTML.js
var createHTMLRichTextSerializer, wrapMapSerializerWithStringChildren, asHTML;
var init_asHTML = __esm({
  "node_modules/@prismicio/client/dist/helpers/asHTML.js"() {
    "use strict";
    init_serializerHelpers();
    init_serialize();
    init_wrapMapSerializer();
    init_composeSerializers();
    createHTMLRichTextSerializer = (linkResolver, serializer) => {
      const useSerializerOrDefault = (nodeSerializerOrShorthand, defaultWithShorthand) => {
        if (typeof nodeSerializerOrShorthand === "function") return ((payload) => {
          return (nodeSerializerOrShorthand === null || nodeSerializerOrShorthand === void 0 ? void 0 : nodeSerializerOrShorthand(payload)) || defaultWithShorthand(payload);
        });
        return defaultWithShorthand;
      };
      return wrapMapSerializerWithStringChildren({
        heading1: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.heading1, serializeStandardTag("h1", serializer === null || serializer === void 0 ? void 0 : serializer.heading1)),
        heading2: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.heading2, serializeStandardTag("h2", serializer === null || serializer === void 0 ? void 0 : serializer.heading2)),
        heading3: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.heading3, serializeStandardTag("h3", serializer === null || serializer === void 0 ? void 0 : serializer.heading3)),
        heading4: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.heading4, serializeStandardTag("h4", serializer === null || serializer === void 0 ? void 0 : serializer.heading4)),
        heading5: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.heading5, serializeStandardTag("h5", serializer === null || serializer === void 0 ? void 0 : serializer.heading5)),
        heading6: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.heading6, serializeStandardTag("h6", serializer === null || serializer === void 0 ? void 0 : serializer.heading6)),
        paragraph: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.paragraph, serializeStandardTag("p", serializer === null || serializer === void 0 ? void 0 : serializer.paragraph)),
        preformatted: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.preformatted, serializePreFormatted(serializer === null || serializer === void 0 ? void 0 : serializer.preformatted)),
        strong: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.strong, serializeStandardTag("strong", serializer === null || serializer === void 0 ? void 0 : serializer.strong)),
        em: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.em, serializeStandardTag("em", serializer === null || serializer === void 0 ? void 0 : serializer.em)),
        listItem: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.listItem, serializeStandardTag("li", serializer === null || serializer === void 0 ? void 0 : serializer.listItem)),
        oListItem: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.oListItem, serializeStandardTag("li", serializer === null || serializer === void 0 ? void 0 : serializer.oListItem)),
        list: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.list, serializeStandardTag("ul", serializer === null || serializer === void 0 ? void 0 : serializer.list)),
        oList: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.oList, serializeStandardTag("ol", serializer === null || serializer === void 0 ? void 0 : serializer.oList)),
        image: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.image, serializeImage(linkResolver, serializer === null || serializer === void 0 ? void 0 : serializer.image)),
        embed: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.embed, serializeEmbed(serializer === null || serializer === void 0 ? void 0 : serializer.embed)),
        hyperlink: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.hyperlink, serializeHyperlink(linkResolver, serializer === null || serializer === void 0 ? void 0 : serializer.hyperlink)),
        label: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.label, serializeStandardTag("span", serializer === null || serializer === void 0 ? void 0 : serializer.label)),
        span: useSerializerOrDefault(serializer === null || serializer === void 0 ? void 0 : serializer.span, serializeSpan())
      });
    };
    wrapMapSerializerWithStringChildren = (mapSerializer) => {
      const modifiedMapSerializer = {};
      for (const tag in mapSerializer) {
        const tagSerializer = mapSerializer[tag];
        if (tagSerializer) modifiedMapSerializer[tag] = (payload) => {
          return tagSerializer({
            ...payload,
            children: payload.children.join("")
          });
        };
      }
      return wrapMapSerializer(modifiedMapSerializer);
    };
    asHTML = (richTextField, ...configObjectOrTuple) => {
      if (richTextField) {
        const [configObjectOrLinkResolver, maybeSerializer] = configObjectOrTuple;
        let config;
        if (typeof configObjectOrLinkResolver === "function" || configObjectOrLinkResolver == null) config = {
          linkResolver: configObjectOrLinkResolver,
          serializer: maybeSerializer
        };
        else config = { ...configObjectOrLinkResolver };
        let serializer;
        if (config.serializer) if (typeof config.serializer === "function") serializer = composeSerializers((type, node, text, children, key) => config.serializer(type, node, text, children.join(""), key), createHTMLRichTextSerializer(config.linkResolver));
        else serializer = createHTMLRichTextSerializer(config.linkResolver, config.serializer);
        else serializer = createHTMLRichTextSerializer(config.linkResolver);
        return serialize(richTextField, serializer).join("");
      } else return null;
    };
  }
});

// node_modules/imgix-url-builder/dist/buildURL.js
var camelCaseToParamCase, buildURL;
var init_buildURL = __esm({
  "node_modules/imgix-url-builder/dist/buildURL.js"() {
    "use strict";
    camelCaseToParamCase = (input) => {
      return input.replace(/[A-Z]/g, (match) => {
        return `-${match.toLowerCase()}`;
      });
    };
    buildURL = (url, params) => {
      const instance = new URL(url);
      for (const camelCasedParamKey in params) {
        const paramKey = camelCaseToParamCase(camelCasedParamKey);
        const paramValue = params[camelCasedParamKey];
        if (paramValue === void 0) {
          instance.searchParams.delete(paramKey);
        } else if (Array.isArray(paramValue)) {
          instance.searchParams.set(paramKey, paramValue.join(","));
        } else {
          instance.searchParams.set(paramKey, `${paramValue}`);
        }
      }
      const s = instance.searchParams.get("s");
      if (s) {
        instance.searchParams.delete("s");
        instance.searchParams.append("s", s);
      }
      return instance.toString();
    };
  }
});

// node_modules/imgix-url-builder/dist/buildPixelDensitySrcSet.js
var buildPixelDensitySrcSet;
var init_buildPixelDensitySrcSet = __esm({
  "node_modules/imgix-url-builder/dist/buildPixelDensitySrcSet.js"() {
    "use strict";
    init_buildURL();
    buildPixelDensitySrcSet = (url, { pixelDensities, ...params }) => {
      return pixelDensities.map((dpr) => {
        return `${buildURL(url, { ...params, dpr })} ${dpr}x`;
      }).join(", ");
    };
  }
});

// node_modules/imgix-url-builder/dist/buildWidthSrcSet.js
var buildWidthSrcSet;
var init_buildWidthSrcSet = __esm({
  "node_modules/imgix-url-builder/dist/buildWidthSrcSet.js"() {
    "use strict";
    init_buildURL();
    buildWidthSrcSet = (url, { widths, ...params }) => {
      return widths.map((width) => {
        return `${buildURL(url, { ...params, w: void 0, h: void 0, height: void 0, width })} ${width}w`;
      }).join(", ");
    };
  }
});

// node_modules/imgix-url-builder/dist/index.js
var init_dist = __esm({
  "node_modules/imgix-url-builder/dist/index.js"() {
    "use strict";
    init_buildURL();
    init_buildWidthSrcSet();
    init_buildPixelDensitySrcSet();
  }
});

// node_modules/@prismicio/client/dist/helpers/asImageSrc.js
var asImageSrc;
var init_asImageSrc = __esm({
  "node_modules/@prismicio/client/dist/helpers/asImageSrc.js"() {
    "use strict";
    init_isFilled();
    init_dist();
    asImageSrc = (field, config = {}) => {
      if (field && imageThumbnail(field)) return buildURL(field.url, config);
      else return null;
    };
  }
});

// node_modules/@prismicio/client/dist/helpers/asImageWidthSrcSet.js
var DEFAULT_WIDTHS, asImageWidthSrcSet;
var init_asImageWidthSrcSet = __esm({
  "node_modules/@prismicio/client/dist/helpers/asImageWidthSrcSet.js"() {
    "use strict";
    init_isFilled();
    init_dist();
    DEFAULT_WIDTHS = [
      640,
      828,
      1200,
      2048,
      3840
    ];
    asImageWidthSrcSet = (field, config = {}) => {
      if (field && imageThumbnail(field)) {
        let { widths = DEFAULT_WIDTHS, ...imgixParams } = config;
        const { url, dimensions, id: _id, alt: _alt, copyright: _copyright, edit: _edit, ...responsiveViews } = field;
        const responsiveViewObjects = Object.values(responsiveViews);
        if (widths === "thumbnails" && responsiveViewObjects.length < 1) widths = DEFAULT_WIDTHS;
        return {
          src: buildURL(url, imgixParams),
          srcset: widths === "thumbnails" ? [buildWidthSrcSet(url, {
            ...imgixParams,
            widths: [dimensions.width]
          }), ...responsiveViewObjects.map((thumbnail) => {
            return buildWidthSrcSet(thumbnail.url, {
              ...imgixParams,
              widths: [thumbnail.dimensions.width]
            });
          })].join(", ") : buildWidthSrcSet(field.url, {
            ...imgixParams,
            widths
          })
        };
      } else return null;
    };
  }
});

// node_modules/@prismicio/client/dist/helpers/asImagePixelDensitySrcSet.js
var DEFAULT_PIXEL_DENSITIES, asImagePixelDensitySrcSet;
var init_asImagePixelDensitySrcSet = __esm({
  "node_modules/@prismicio/client/dist/helpers/asImagePixelDensitySrcSet.js"() {
    "use strict";
    init_isFilled();
    init_dist();
    DEFAULT_PIXEL_DENSITIES = [
      1,
      2,
      3
    ];
    asImagePixelDensitySrcSet = (field, config = {}) => {
      if (field && imageThumbnail(field)) {
        const { pixelDensities = DEFAULT_PIXEL_DENSITIES, ...imgixParams } = config;
        return {
          src: buildURL(field.url, imgixParams),
          srcset: buildPixelDensitySrcSet(field.url, {
            ...imgixParams,
            pixelDensities
          })
        };
      } else return null;
    };
  }
});

// node_modules/@prismicio/client/dist/types/value/embed.js
var OEmbedType;
var init_embed = __esm({
  "node_modules/@prismicio/client/dist/types/value/embed.js"() {
    "use strict";
    OEmbedType = {
      Photo: "photo",
      Video: "video",
      Link: "link",
      Rich: "rich"
    };
  }
});

// node_modules/@prismicio/client/dist/types/model/types.js
var CustomTypeModelFieldType;
var init_types2 = __esm({
  "node_modules/@prismicio/client/dist/types/model/types.js"() {
    "use strict";
    CustomTypeModelFieldType = {
      Boolean: "Boolean",
      Color: "Color",
      Date: "Date",
      Embed: "Embed",
      GeoPoint: "GeoPoint",
      Group: "Group",
      Image: "Image",
      Integration: "IntegrationFields",
      Link: "Link",
      Number: "Number",
      Select: "Select",
      Slices: "Slices",
      StructuredText: "StructuredText",
      Table: "Table",
      Text: "Text",
      Timestamp: "Timestamp",
      UID: "UID",
      IntegrationFields: "IntegrationFields",
      Range: "Range",
      Separator: "Separator",
      LegacySlices: "Choice"
    };
  }
});

// node_modules/@prismicio/client/dist/types/model/link.js
var CustomTypeModelLinkSelectType;
var init_link2 = __esm({
  "node_modules/@prismicio/client/dist/types/model/link.js"() {
    "use strict";
    CustomTypeModelLinkSelectType = {
      Document: "document",
      Media: "media",
      Web: "web"
    };
  }
});

// node_modules/@prismicio/client/dist/types/model/sliceZone.js
var CustomTypeModelSliceType;
var init_sliceZone = __esm({
  "node_modules/@prismicio/client/dist/types/model/sliceZone.js"() {
    "use strict";
    CustomTypeModelSliceType = {
      Slice: "Slice",
      SharedSlice: "SharedSlice"
    };
  }
});

// node_modules/@prismicio/client/dist/types/model/slice.js
var CustomTypeModelSliceDisplay;
var init_slice = __esm({
  "node_modules/@prismicio/client/dist/types/model/slice.js"() {
    "use strict";
    CustomTypeModelSliceDisplay = {
      List: "list",
      Grid: "grid"
    };
  }
});

// node_modules/@prismicio/client/dist/types/webhook/types.js
var WebhookType;
var init_types3 = __esm({
  "node_modules/@prismicio/client/dist/types/webhook/types.js"() {
    "use strict";
    WebhookType = {
      APIUpdate: "api-update",
      TestTrigger: "test-trigger"
    };
  }
});

// node_modules/@prismicio/client/dist/index.js
var dist_exports = {};
__export(dist_exports, {
  Client: () => Client,
  CustomTypeModelFieldType: () => CustomTypeModelFieldType,
  CustomTypeModelLinkSelectType: () => CustomTypeModelLinkSelectType,
  CustomTypeModelSliceDisplay: () => CustomTypeModelSliceDisplay,
  CustomTypeModelSliceType: () => CustomTypeModelSliceType,
  Element: () => Element,
  ForbiddenError: () => ForbiddenError,
  InvalidDataError: () => InvalidDataError,
  LinkType: () => LinkType,
  Migration: () => Migration,
  NotFoundError: () => NotFoundError,
  OEmbedType: () => OEmbedType,
  ParsingError: () => ParsingError,
  PreviewTokenExpiredError: () => PreviewTokenExpiredError,
  PrismicError: () => PrismicError,
  PrismicMigrationAsset: () => PrismicMigrationAsset,
  PrismicMigrationDocument: () => PrismicMigrationDocument,
  RefExpiredError: () => RefExpiredError,
  RefNotFoundError: () => RefNotFoundError,
  RepositoryNotFoundError: () => RepositoryNotFoundError,
  RichTextNodeType: () => RichTextNodeType,
  WebhookType: () => WebhookType,
  WriteClient: () => WriteClient,
  asDate: () => asDate,
  asHTML: () => asHTML,
  asImagePixelDensitySrcSet: () => asImagePixelDensitySrcSet,
  asImageSrc: () => asImageSrc,
  asImageWidthSrcSet: () => asImageWidthSrcSet,
  asLink: () => asLink,
  asLinkAttrs: () => asLinkAttrs,
  asText: () => asText$1,
  buildQueryURL: () => buildQueryURL,
  cookie: () => cookie_exports,
  createClient: () => createClient,
  createMigration: () => createMigration,
  createWriteClient: () => createWriteClient,
  documentToLinkField: () => documentToLinkField,
  filter: () => filter,
  getGraphQLEndpoint: () => getGraphQLEndpoint,
  getRepositoryEndpoint: () => getRepositoryEndpoint,
  getRepositoryName: () => getRepositoryName,
  getToolbarSrc: () => getToolbarSrc,
  isFilled: () => isFilled_exports,
  isRepositoryEndpoint: () => isRepositoryEndpoint,
  isRepositoryName: () => isRepositoryName,
  mapSliceZone: () => mapSliceZone,
  predicate: () => predicate,
  unstable_mapSliceZone: () => unstable_mapSliceZone
});
var predicate, unstable_mapSliceZone, Element;
var init_dist2 = __esm({
  "node_modules/@prismicio/client/dist/index.js"() {
    "use strict";
    init_richText();
    init_mapSliceZone();
    init_filter();
    init_cookie();
    init_errors();
    init_link();
    init_documentToLinkField();
    init_asLink();
    init_buildQueryURL();
    init_isRepositoryName();
    init_getRepositoryEndpoint();
    init_getRepositoryName();
    init_isRepositoryEndpoint();
    init_Client();
    init_createClient();
    init_Asset();
    init_Document();
    init_isFilled();
    init_WriteClient();
    init_createWriteClient();
    init_Migration();
    init_createMigration();
    init_getGraphQLEndpoint();
    init_getToolbarSrc();
    init_asDate();
    init_asLinkAttrs();
    init_asText2();
    init_asHTML();
    init_asImageSrc();
    init_asImageWidthSrcSet();
    init_asImagePixelDensitySrcSet();
    init_embed();
    init_types2();
    init_link2();
    init_sliceZone();
    init_slice();
    init_types3();
    predicate = filter;
    unstable_mapSliceZone = mapSliceZone;
    Element = RichTextNodeType;
  }
});

// src/ai/prompts.ts
var DEFAULT_GENERATE_TEMPLATE, DEFAULT_CHAT_TEMPLATE, DEFAULT_REWRITE_TEMPLATE, DEFAULT_AUTO_DRAFT_TEMPLATE, DEFAULT_PLAN_TEMPLATE, DEFAULT_PLAN_RULES, DEFAULT_AGENT_TEMPLATE, DEFAULT_EXPAND_PLAN_TEMPLATE, DEFAULT_SEARCH_ONLY_PROMPT;
var init_prompts = __esm({
  "src/ai/prompts.ts"() {
    "use strict";
    DEFAULT_GENERATE_TEMPLATE = `<system>
<role>Expert essay writer creating engaging, thoughtful content</role>

<critical>
ALWAYS output a complete essay. NEVER respond conversationally.
- Do NOT ask questions or request clarification
- Do NOT say "Here is your essay" or similar preamble
- Do NOT explain what you're going to write
- If the prompt is vague, make creative choices and proceed
- Output ONLY the essay in markdown format
</critical>

<rules>
{{RULES}}
</rules>

<style_reference>
{{STYLE_EXAMPLES}}
</style_reference>

<constraints>
<word_count>{{WORD_COUNT}}</word_count>
</constraints>

<output_format>
CRITICAL: Your response MUST start with exactly this format:

Line 1: # [Your Title Here]
Line 2: *[Your subtitle here]*
Line 3: (blank line)
Line 4+: Essay body in markdown

<title_guidelines>
- Be SPECIFIC, not generic (avoid "The Power of", "Why X Matters", "A Guide to")
- Include a concrete detail, angle, or unexpected element
- Create curiosity or make a bold claim
- 5-12 words ideal
</title_guidelines>

<subtitle_guidelines>
- One sentence that hooks the reader
- Tease the main argument or reveal a key insight
- Create tension, curiosity, or promise value
- Make readers want to continue reading
</subtitle_guidelines>
</output_format>
</system>`;
    DEFAULT_CHAT_TEMPLATE = `<system>
<role>Helpful writing assistant for essay creation and editing</role>

<chat_rules>
{{CHAT_RULES}}
</chat_rules>

<writing_rules>
{{RULES}}
</writing_rules>

<style_reference>
{{STYLE_EXAMPLES}}
</style_reference>

<context>
{{ESSAY_CONTEXT}}
</context>

<behavior>
- Be concise and actionable
- When suggesting edits, be specific about what to change
- Match the author's voice and style when writing
- Ask clarifying questions if the request is ambiguous
</behavior>
</system>`;
    DEFAULT_REWRITE_TEMPLATE = `<system>
<role>Writing assistant that improves text quality</role>

<rewrite_rules>
{{REWRITE_RULES}}
</rewrite_rules>

<writing_rules>
{{RULES}}
</writing_rules>

<style_reference>
{{STYLE_EXAMPLES}}
</style_reference>

<behavior>
- Preserve the original meaning exactly
- Improve clarity, flow, and readability
- Fix grammar and punctuation issues
- Maintain the author's voice and tone
- Output only the improved text, no explanations
</behavior>
</system>`;
    DEFAULT_AUTO_DRAFT_TEMPLATE = `<system>
<role>Expert essay writer creating engaging content from news articles</role>

<auto_draft_rules>
{{AUTO_DRAFT_RULES}}
</auto_draft_rules>

<writing_rules>
{{RULES}}
</writing_rules>

<style_reference>
{{STYLE_EXAMPLES}}
</style_reference>

<source_article>
<topic>{{TOPIC_NAME}}</topic>
<title>{{ARTICLE_TITLE}}</title>
<summary>{{ARTICLE_SUMMARY}}</summary>
<url>{{ARTICLE_URL}}</url>
</source_article>

<constraints>
<word_count>{{AUTO_DRAFT_WORD_COUNT}}</word_count>
</constraints>

<output_format>
CRITICAL: Your response MUST start with exactly this format:

Line 1: # [Your Title Here]
Line 2: *[Your subtitle here]*
Line 3: (blank line)
Line 4+: Essay body in markdown

<title_guidelines>
- Be SPECIFIC about the news angle, not generic
- Include a concrete detail or unexpected element
- Create curiosity or make a bold claim
- 5-12 words ideal
</title_guidelines>

<subtitle_guidelines>
- One sentence that hooks the reader
- Tease the main argument or unique perspective
- Create tension, curiosity, or promise value
</subtitle_guidelines>
</output_format>
</system>`;
    DEFAULT_PLAN_TEMPLATE = `<system>
<role>Writing assistant that creates essay outlines</role>

<critical>
Wrap your ENTIRE response in <plan> tags. Output NOTHING outside the tags.
</critical>

<rules>
{{PLAN_RULES}}
</rules>

<style_reference>
{{STYLE_EXAMPLES}}
</style_reference>
</system>`;
    DEFAULT_PLAN_RULES = `<format>
STRICT LIMIT: Maximum 3 bullets per section. Most sections should have 1-2 bullets.

<plan>
# Essay Title
*One-line subtitle*

## Section Name
- Key point

## Section Name
- Key point
- Another point

## Section Name
- Key point
</plan>
</format>

<constraints>
- 4-6 section headings (## lines)
- 1-3 bullets per section \u2014 NEVER 4 or more
- Bullets are short phrases, not sentences
- No prose, no paragraphs, no explanations
- When revising, output the complete updated plan
</constraints>

<title_guidelines>
- Be SPECIFIC about the essay's angle
- Include a concrete detail or unexpected element
- Avoid generic patterns like "The Power of", "Why X Matters"
- 5-12 words ideal
</title_guidelines>

<subtitle_guidelines>
- One sentence that previews the main argument
- Create curiosity or make a bold claim
</subtitle_guidelines>`;
    DEFAULT_AGENT_TEMPLATE = `<agent_mode>
You are in AGENT MODE - you can directly edit the essay. Wrap edits in :::edit and ::: tags with a JSON object.

EDIT COMMANDS (use valid JSON):

1. Replace specific text:
:::edit
{"type": "replace_section", "find": "exact text to find", "replace": "replacement text"}
:::

2. Replace entire essay:
:::edit
{"type": "replace_all", "title": "New Title", "subtitle": "New subtitle", "markdown": "Full essay content..."}
:::

3. Insert text:
:::edit
{"type": "insert", "position": "after", "find": "text to find", "replace": "text to insert"}
:::
(position can be: "before", "after", "start", "end")

4. Delete text:
:::edit
{"type": "delete", "find": "text to delete"}
:::

RULES:
- Use EXACT text matches for "find" - copy precisely from the essay
- One edit block per change
- You can include multiple edit blocks in one response
- Add brief explanation before/after edit blocks
- Edits are applied automatically - the user will see the changes
</agent_mode>`;
    DEFAULT_EXPAND_PLAN_TEMPLATE = `<system>
<role>Writing assistant that expands essay outlines into full drafts</role>

<writing_rules>
{{RULES}}
</writing_rules>

<style_reference>
{{STYLE_EXAMPLES}}
</style_reference>

<plan_to_expand>
{{PLAN}}
</plan_to_expand>

<output_format>
CRITICAL: Your response MUST start with exactly this format:

Line 1: # [Title from plan, refined if needed]
Line 2: *[Subtitle from plan, refined if needed]*
Line 3: (blank line)
Line 4+: Essay body with ## section headings

<requirements>
- Use the section headers from the plan as H2 headings
- Expand each section's bullet points into full paragraphs
- Match the author's voice and style from the examples
- Output ONLY markdown \u2014 no preamble, no "Here is...", no explanations
</requirements>

<title_refinement>
If the plan title is generic, improve it to be:
- More specific and concrete
- Curiosity-inducing or bold
- 5-12 words
</title_refinement>
</output_format>
</system>`;
    DEFAULT_SEARCH_ONLY_PROMPT = `You are a research assistant helping a writer gather facts and information.

Your task is to provide accurate, well-sourced information to help with essay writing.

Guidelines:
- Focus on facts, data, and specific examples
- Include dates, names, and sources when relevant
- Present information clearly and concisely
- Note any conflicting information or debates
- Suggest interesting angles or perspectives the writer might explore

Do NOT write the essay - just provide research findings.`;
  }
});

// src/ai/models.ts
function getModel(id) {
  return AI_MODELS.find((m) => m.id === id);
}
function getDefaultModel() {
  return AI_MODELS[0];
}
async function resolveModel(providedModelId, getDefaultModelId) {
  let modelId = providedModelId;
  if (!modelId) {
    modelId = await getDefaultModelId() || "claude-sonnet";
  }
  const model = getModel(modelId);
  if (!model) {
    throw new Error(`Unknown model: ${modelId}. Available: ${AI_MODELS.map((m) => m.id).join(", ")}`);
  }
  return model;
}
function toModelOption(model) {
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    hasNativeSearch: model.searchModel === "native"
  };
}
function getModelOptions() {
  return AI_MODELS.map(toModelOption);
}
var AI_MODELS;
var init_models = __esm({
  "src/ai/models.ts"() {
    "use strict";
    AI_MODELS = [
      {
        id: "claude-sonnet",
        name: "Sonnet 4.5",
        provider: "anthropic",
        modelId: "claude-sonnet-4-5-20250929",
        description: "Fast, capable, best value",
        searchModel: null
        // No native search, uses search-first flow
      },
      {
        id: "claude-opus",
        name: "Opus 4.5",
        provider: "anthropic",
        modelId: "claude-opus-4-5-20251101",
        description: "Highest quality, slower",
        searchModel: null
      },
      {
        id: "gpt-5.2",
        name: "GPT-5.2",
        provider: "openai",
        modelId: "gpt-5.2",
        description: "Latest OpenAI flagship",
        searchModel: "native"
        // Uses tools-based web search
      },
      {
        id: "gpt-5-mini",
        name: "GPT-5 Mini",
        provider: "openai",
        modelId: "gpt-5-mini",
        description: "Fast and cost-efficient",
        searchModel: "native"
        // Uses tools-based web search
      }
    ];
  }
});

// src/ai/provider.ts
var provider_exports = {};
__export(provider_exports, {
  createStream: () => createStream,
  generate: () => generate,
  getApiKey: () => getApiKey
});
async function getApiKey(provider, prisma) {
  if (prisma?.aISettings) {
    try {
      const settings = await prisma.aISettings.findUnique({
        where: { id: "default" }
      });
      if (provider === "anthropic" && settings?.anthropicKey) {
        return settings.anthropicKey;
      }
      if (provider === "openai" && settings?.openaiKey) {
        return settings.openaiKey;
      }
    } catch {
    }
  }
  if (provider === "anthropic") {
    return process.env.ANTHROPIC_API_KEY || null;
  }
  return process.env.OPENAI_API_KEY || null;
}
async function fetchSearchResults(query, openaiKey) {
  const timeoutMs = 3e4;
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Search timeout after 30s")), timeoutMs);
  });
  try {
    console.log("[Web Search] Fetching search results for:", query.slice(0, 100));
    const apiKey = openaiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("[Web Search] No OpenAI API key available for search");
      return null;
    }
    const openai = new import_openai.default({
      apiKey
    });
    const response = await Promise.race([
      openai.responses.create({
        model: "gpt-4o-mini",
        input: `You are a research assistant. Provide a concise summary of the most relevant and recent information from the web about the following query. Include key facts, dates, and sources when available. Keep your response under 500 words.

Query: ${query}`,
        tools: [{ type: "web_search" }]
      }),
      timeoutPromise
    ]);
    if (!response) {
      console.warn("[Web Search] No response received");
      return null;
    }
    const result = response.output_text || null;
    console.log("[Web Search] Got results:", result ? `${result.length} chars` : "null");
    return result;
  } catch (error) {
    console.error("[Web Search] Failed:", error);
    return null;
  }
}
function extractSearchQuery(messages) {
  const userMessages = messages.filter((m) => m.role === "user");
  return userMessages[userMessages.length - 1]?.content || "";
}
async function generate(modelId, systemPrompt, userPrompt, options = {}) {
  const model = getModel(modelId);
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`);
  }
  if (model.provider === "anthropic") {
    return generateWithAnthropic(model.modelId, systemPrompt, userPrompt, options);
  }
  return generateWithOpenAI(model.modelId, systemPrompt, userPrompt, options);
}
async function generateWithAnthropic(modelId, systemPrompt, userPrompt, options) {
  const anthropic = new import_sdk.default({
    ...options.anthropicKey && { apiKey: options.anthropicKey }
  });
  const response = await anthropic.messages.create({
    model: modelId,
    max_tokens: options.maxTokens || 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }]
  });
  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in response");
  }
  return {
    text: textContent.text,
    inputTokens: response.usage?.input_tokens,
    outputTokens: response.usage?.output_tokens
  };
}
async function generateWithOpenAI(modelId, systemPrompt, userPrompt, options) {
  const openai = new import_openai.default({
    ...options.openaiKey && { apiKey: options.openaiKey }
  });
  if (options.useWebSearch) {
    const response2 = await openai.responses.create({
      model: modelId,
      instructions: systemPrompt,
      input: userPrompt,
      max_output_tokens: options.maxTokens || 4096,
      tools: [{ type: "web_search" }]
    });
    const textOutput = response2.output?.find((item) => item.type === "message");
    const content2 = textOutput?.content?.find((c) => c.type === "output_text")?.text;
    if (!content2) {
      throw new Error("No content in response");
    }
    return {
      text: content2,
      inputTokens: response2.usage?.input_tokens,
      outputTokens: response2.usage?.output_tokens
    };
  }
  const response = await openai.chat.completions.create({
    model: modelId,
    max_completion_tokens: options.maxTokens || 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });
  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content in response");
  }
  return {
    text: content,
    inputTokens: response.usage?.prompt_tokens,
    outputTokens: response.usage?.completion_tokens
  };
}
async function createStream(options) {
  const modelConfig = getModel(options.model);
  if (!modelConfig) {
    throw new Error(`Unknown model: ${options.model}`);
  }
  let searchContext = "";
  if (options.useWebSearch && modelConfig.provider === "anthropic") {
    const query = extractSearchQuery(options.messages);
    if (query) {
      try {
        const searchResults = await fetchSearchResults(query, options.openaiKey);
        if (searchResults) {
          searchContext = `

<web_search_results>
${searchResults}
</web_search_results>

Use the search results above to inform your response with current, accurate information.`;
        } else {
          searchContext = `

<web_search_status>Web search was requested but returned no results. Answer based on your training knowledge and note any information that may be outdated.</web_search_status>`;
        }
      } catch (err) {
        console.error("[createStream] Search failed, continuing without:", err);
        searchContext = `

<web_search_status>Web search encountered an error. Answer based on your training knowledge.</web_search_status>`;
      }
    }
  }
  if (modelConfig.provider === "anthropic") {
    return createAnthropicStream(options, modelConfig.modelId, searchContext);
  } else {
    return createOpenAIStream(options, modelConfig.modelId, options.useWebSearch);
  }
}
function safeEnqueue(controller, data) {
  try {
    controller.enqueue(data);
    return true;
  } catch {
    return false;
  }
}
function safeClose(controller) {
  try {
    controller.close();
  } catch {
  }
}
async function createAnthropicStream(options, modelId, searchContext = "") {
  const anthropic = new import_sdk.default({
    ...options.anthropicKey && { apiKey: options.anthropicKey }
  });
  const systemMessage = (options.messages.find((m) => m.role === "system")?.content || "") + searchContext;
  const chatMessages = options.messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content }));
  const requestParams = {
    model: modelId,
    max_tokens: options.maxTokens || 4096,
    system: systemMessage,
    messages: chatMessages
  };
  if (options.useThinking && (modelId.includes("claude-sonnet") || modelId.includes("claude-opus"))) {
    requestParams.thinking = {
      type: "enabled",
      budget_tokens: 1e4
    };
    requestParams.max_tokens = Math.max(requestParams.max_tokens, 16e3);
  }
  try {
    const stream = await anthropic.messages.stream(requestParams);
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta") {
              const delta = event.delta;
              if (delta.type === "text_delta" && delta.text) {
                if (!safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ text: delta.text })}

`))) {
                  return;
                }
              } else if (delta.type === "thinking_delta" && delta.thinking) {
                if (!safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ thinking: delta.thinking })}

`))) {
                  return;
                }
              }
            }
          }
          safeEnqueue(controller, new TextEncoder().encode("data: [DONE]\n\n"));
          safeClose(controller);
        } catch (streamError) {
          const errorMessage = streamError instanceof Error ? streamError.message : "Stream error";
          console.error("[Anthropic Stream Error]", streamError);
          safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}

`));
          safeClose(controller);
        }
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Anthropic API error";
    console.error("[Anthropic API Error]", error);
    throw new Error(errorMessage);
  }
}
async function createOpenAIStream(options, modelId, useWebSearch = false) {
  const openai = new import_openai.default({
    ...options.openaiKey && { apiKey: options.openaiKey }
  });
  if (useWebSearch) {
    return createOpenAIResponsesStream(openai, options, modelId);
  }
  const requestParams = {
    model: modelId,
    messages: options.messages,
    max_completion_tokens: options.maxTokens || 4096,
    stream: true
  };
  try {
    const stream = await openai.chat.completions.create(requestParams);
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              if (!safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ text })}

`))) {
                return;
              }
            }
          }
          safeEnqueue(controller, new TextEncoder().encode("data: [DONE]\n\n"));
          safeClose(controller);
        } catch (streamError) {
          const errorMessage = streamError instanceof Error ? streamError.message : "Stream error";
          console.error("[OpenAI Stream Error]", streamError);
          safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}

`));
          safeClose(controller);
        }
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "OpenAI API error";
    console.error("[OpenAI API Error]", error);
    throw new Error(errorMessage);
  }
}
async function createOpenAIResponsesStream(openai, options, modelId) {
  const systemMessage = options.messages.find((m) => m.role === "system")?.content || "";
  const conversationMessages = options.messages.filter((m) => m.role !== "system");
  const lastUserMessage = conversationMessages[conversationMessages.length - 1]?.content || "";
  const conversationContext = conversationMessages.slice(0, -1).map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");
  const fullInput = conversationContext ? `${systemMessage}

Previous conversation:
${conversationContext}

User: ${lastUserMessage}` : `${systemMessage}

${lastUserMessage}`;
  try {
    const response = await openai.responses.create({
      model: modelId,
      input: fullInput,
      tools: [{ type: "web_search" }],
      stream: true
    });
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const event of response) {
            if (event.type === "response.output_text.delta") {
              const text = event.delta;
              if (text) {
                if (!safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ text })}

`))) {
                  return;
                }
              }
            }
          }
          safeEnqueue(controller, new TextEncoder().encode("data: [DONE]\n\n"));
          safeClose(controller);
        } catch (streamError) {
          const errorMessage = streamError instanceof Error ? streamError.message : "Stream error";
          console.error("[OpenAI Responses Stream Error]", streamError);
          safeEnqueue(controller, new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}

`));
          safeClose(controller);
        }
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "OpenAI Responses API error";
    console.error("[OpenAI Responses API Error]", error);
    throw new Error(errorMessage);
  }
}
var import_sdk, import_openai;
var init_provider = __esm({
  "src/ai/provider.ts"() {
    "use strict";
    import_sdk = __toESM(require("@anthropic-ai/sdk"));
    import_openai = __toESM(require("openai"));
    init_models();
  }
});

// src/ai/builders.ts
var builders_exports = {};
__export(builders_exports, {
  buildAutoDraftPrompt: () => buildAutoDraftPrompt,
  buildChatPrompt: () => buildChatPrompt,
  buildExpandPlanPrompt: () => buildExpandPlanPrompt,
  buildGeneratePrompt: () => buildGeneratePrompt,
  buildPlanPrompt: () => buildPlanPrompt,
  buildRewritePrompt: () => buildRewritePrompt
});
function buildGeneratePrompt(options) {
  const template = options.template || DEFAULT_GENERATE_TEMPLATE;
  return template.replace("{{RULES}}", options.rules || "").replace("{{WORD_COUNT}}", String(options.wordCount || 800)).replace("{{STYLE_EXAMPLES}}", options.styleExamples || "");
}
function buildChatPrompt(options) {
  const template = options.template || DEFAULT_CHAT_TEMPLATE;
  let essaySection = "";
  if (options.essayContext) {
    essaySection = `
Current essay being edited:
Title: ${options.essayContext.title}
${options.essayContext.subtitle ? `Subtitle: ${options.essayContext.subtitle}` : ""}

Content:
${options.essayContext.markdown}
`;
  }
  return template.replace("{{CHAT_RULES}}", options.chatRules || "").replace("{{RULES}}", options.rules || "").replace("{{ESSAY_CONTEXT}}", essaySection).replace("{{STYLE_EXAMPLES}}", options.styleExamples || "");
}
function buildExpandPlanPrompt(options) {
  const template = options.template || DEFAULT_EXPAND_PLAN_TEMPLATE;
  return template.replace("{{RULES}}", options.rules || "").replace("{{STYLE_EXAMPLES}}", options.styleExamples || "").replace("{{PLAN}}", options.plan);
}
function buildPlanPrompt(options) {
  const template = options.template || DEFAULT_PLAN_TEMPLATE;
  const rules = options.planRules || DEFAULT_PLAN_RULES;
  return template.replace("{{PLAN_RULES}}", rules).replace("{{STYLE_EXAMPLES}}", options.styleExamples || "");
}
function buildRewritePrompt(options) {
  const template = options.template || DEFAULT_REWRITE_TEMPLATE;
  return template.replace("{{REWRITE_RULES}}", options.rewriteRules || "").replace("{{RULES}}", options.rules || "").replace("{{STYLE_EXAMPLES}}", options.styleExamples || "");
}
function buildAutoDraftPrompt(options) {
  const template = options.template || DEFAULT_AUTO_DRAFT_TEMPLATE;
  return template.replace("{{AUTO_DRAFT_RULES}}", options.autoDraftRules || "").replace("{{RULES}}", options.rules || "").replace("{{AUTO_DRAFT_WORD_COUNT}}", String(options.wordCount || 800)).replace("{{STYLE_EXAMPLES}}", options.styleExamples || "").replace("{{TOPIC_NAME}}", options.topicName || "").replace("{{ARTICLE_TITLE}}", options.articleTitle || "").replace("{{ARTICLE_SUMMARY}}", options.articleSummary || "").replace("{{ARTICLE_URL}}", options.articleUrl || "");
}
var init_builders = __esm({
  "src/ai/builders.ts"() {
    "use strict";
    init_prompts();
  }
});

// src/lib/url-extractor.ts
var url_extractor_exports = {};
__export(url_extractor_exports, {
  buildUrlContext: () => buildUrlContext,
  extractAndFetchUrls: () => extractAndFetchUrls,
  extractUrls: () => extractUrls,
  fetchUrlContent: () => fetchUrlContent
});
function isServerlessEnvironment() {
  return !!(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL || process.env.NETLIFY || process.env.AWS_EXECUTION_ENV);
}
function extractUrls(text) {
  const urls = [];
  const withProtocol = text.match(URL_WITH_PROTOCOL);
  if (withProtocol) urls.push(...withProtocol);
  const wwwUrls = text.match(URL_WITHOUT_PROTOCOL);
  if (wwwUrls) {
    for (const url of wwwUrls) {
      const normalized = `https://${url}`;
      if (!urls.some((u) => u.includes(url))) {
        urls.push(normalized);
      }
    }
  }
  const bareUrls = text.match(DOMAIN_ONLY);
  if (bareUrls) {
    for (const url of bareUrls) {
      const normalized = `https://${url}`;
      if (!urls.some((u) => u.includes(url.split("/")[0]))) {
        urls.push(normalized);
      }
    }
  }
  return [...new Set(urls)];
}
function extractTextFromHtml(html, url) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title2 = titleMatch ? titleMatch[1].trim() : void 0;
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "").replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "").replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "").replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<(p|div|br|h[1-6]|li|tr)[^>]*>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").replace(/\n\s+/g, "\n").replace(/\n+/g, "\n").trim();
  if (text.length > 4e3) {
    text = text.slice(0, 4e3) + "\n\n[Content truncated...]";
  }
  if (text.length < 50) {
    return { url, content: "", error: "Could not extract meaningful content" };
  }
  return { url, title: title2, content: text };
}
async function parseWithReadability(html, url) {
  try {
    const { JSDOM } = await import("jsdom");
    const { Readability } = await import("@mozilla/readability");
    const doc = new JSDOM(html, {
      url,
      resources: void 0,
      // Don't load ANY external resources (stylesheets, etc.)
      runScripts: void 0
      // Don't run any scripts
    });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();
    if (!article || !article.textContent) {
      console.log("[Readability] No article content, falling back to simple extraction");
      return extractTextFromHtml(html, url);
    }
    let content = article.textContent.trim();
    if (content.length > 4e3) {
      content = content.slice(0, 4e3) + "\n\n[Content truncated...]";
    }
    return {
      url,
      title: article.title || void 0,
      content
    };
  } catch (error) {
    console.error("[JSDOM] Failed, using simple extraction:", error instanceof Error ? error.message : error);
    return extractTextFromHtml(html, url);
  }
}
async function fetchWithPuppeteer(url) {
  let browser = null;
  const isServerless = isServerlessEnvironment();
  try {
    console.log(`[Puppeteer] Launching browser for: ${url} (serverless: ${isServerless})`);
    if (isServerless) {
      const chromium = await import("@sparticuz/chromium");
      const puppeteerCore = await import("puppeteer-core");
      const executablePath = await chromium.default.executablePath();
      browser = await puppeteerCore.default.launch({
        args: chromium.default.args,
        defaultViewport: chromium.default.defaultViewport,
        executablePath,
        headless: chromium.default.headless
      });
    } else {
      try {
        const puppeteer = await import("puppeteer");
        browser = await puppeteer.default.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu"
          ]
        });
      } catch (puppeteerImportError) {
        console.error("[Puppeteer] Import/launch failed:", puppeteerImportError);
        return { url, content: "", error: "Puppeteer unavailable - falling back to simple fetch" };
      }
    }
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: PUPPETEER_TIMEOUT
    });
    await new Promise((resolve) => setTimeout(resolve, CONTENT_WAIT_TIME));
    const html = await page.content();
    await browser.close();
    browser = null;
    console.log("[Puppeteer] Got HTML, parsing with Readability...");
    return await parseWithReadability(html, url);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Puppeteer error";
    console.error("[Puppeteer] Failed:", errorMessage);
    return { url, content: "", error: `Puppeteer: ${errorMessage}` };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
      }
    }
  }
}
async function fetchWithSimpleRequest(url) {
  try {
    console.log("[SimpleFetch] Fetching:", url);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    if (!res.ok) {
      return { url, content: "", error: `HTTP ${res.status}` };
    }
    const html = await res.text();
    return parseWithReadability(html, url);
  } catch (error) {
    return {
      url,
      content: "",
      error: error instanceof Error ? error.message : "Failed to fetch"
    };
  }
}
async function fetchUrlContent(url) {
  console.log("[URL Extractor] Fetching content from:", url);
  const puppeteerResult = await fetchWithPuppeteer(url);
  if (!puppeteerResult.error && puppeteerResult.content && puppeteerResult.content.length > 100) {
    console.log("[URL Extractor] Puppeteer succeeded, got", puppeteerResult.content.length, "chars");
    return puppeteerResult;
  }
  console.log("[URL Extractor] Puppeteer failed or got minimal content, trying simple fetch...");
  const simpleResult = await fetchWithSimpleRequest(url);
  if (simpleResult.content && simpleResult.content.length > (puppeteerResult.content?.length || 0)) {
    console.log("[URL Extractor] Simple fetch got more content:", simpleResult.content.length, "chars");
    return simpleResult;
  }
  if (puppeteerResult.content && puppeteerResult.content.length > 0) {
    return puppeteerResult;
  }
  return simpleResult.error ? simpleResult : puppeteerResult;
}
async function extractAndFetchUrls(text) {
  const urls = extractUrls(text);
  if (urls.length === 0) return [];
  const toFetch = urls.slice(0, 3);
  const results = await Promise.all(toFetch.map((url) => fetchUrlContent(url)));
  return results;
}
function buildUrlContext(fetched) {
  const successful = fetched.filter((f) => !f.error && f.content);
  if (successful.length === 0) return "";
  return `
<referenced_urls>
${successful.map(
    (f) => `<url src="${f.url}"${f.title ? ` title="${f.title}"` : ""}>
${f.content}
</url>`
  ).join("\n\n")}
</referenced_urls>

Use the content from these URLs when relevant to the conversation.`;
}
var URL_WITH_PROTOCOL, URL_WITHOUT_PROTOCOL, DOMAIN_ONLY, PUPPETEER_TIMEOUT, CONTENT_WAIT_TIME;
var init_url_extractor = __esm({
  "src/lib/url-extractor.ts"() {
    "use strict";
    URL_WITH_PROTOCOL = /https?:\/\/[^\s<>\[\]()]+(?:\([^\s<>\[\]()]*\))?[^\s<>\[\]().,;:!?"']*(?<![.,;:!?"'])/gi;
    URL_WITHOUT_PROTOCOL = /(?:www\.)[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z]{2,})+(?:\/[^\s<>\[\]()]*)?/gi;
    DOMAIN_ONLY = /(?<![/@])(?:[a-zA-Z0-9][-a-zA-Z0-9]*\.)+(?:com|org|net|edu|gov|io|co|app|dev|news|info)(?:\/[^\s<>\[\]()]*)?(?![a-zA-Z])/gi;
    PUPPETEER_TIMEOUT = 15e3;
    CONTENT_WAIT_TIME = 2e3;
  }
});

// src/ai/generate.ts
var generate_exports = {};
__export(generate_exports, {
  expandPlanStream: () => expandPlanStream,
  generateStream: () => generateStream
});
async function generateStream(options) {
  const systemPrompt = buildGeneratePrompt({
    rules: options.rules,
    template: options.template,
    wordCount: options.wordCount,
    styleExamples: options.styleExamples
  });
  let enrichedPrompt = options.prompt;
  if (options.useWebSearch) {
    try {
      const fetched = await extractAndFetchUrls(options.prompt);
      const successful = fetched.filter((f) => !f.error && f.content);
      if (successful.length > 0) {
        enrichedPrompt = `${options.prompt}

<source_material>
${successful.map(
          (f) => `Source: ${f.url}${f.title ? ` (${f.title})` : ""}
${f.content}`
        ).join("\n\n---\n\n")}
</source_material>

Use the source material above as reference for the essay.`;
      }
    } catch (err) {
      console.warn("URL extraction failed:", err);
    }
  }
  return createStream({
    model: options.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: enrichedPrompt }
    ],
    anthropicKey: options.anthropicKey,
    openaiKey: options.openaiKey,
    maxTokens: options.useThinking ? 16e3 : 8192,
    useWebSearch: options.useWebSearch,
    useThinking: options.useThinking
  });
}
async function expandPlanStream(options) {
  const systemPrompt = buildExpandPlanPrompt({
    rules: options.rules,
    template: options.template,
    plan: options.plan,
    styleExamples: options.styleExamples
  });
  return createStream({
    model: options.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Write the essay now." }
    ],
    anthropicKey: options.anthropicKey,
    openaiKey: options.openaiKey,
    maxTokens: 8192
  });
}
var init_generate = __esm({
  "src/ai/generate.ts"() {
    "use strict";
    init_provider();
    init_builders();
    init_url_extractor();
  }
});

// src/ai/chat.ts
var chat_exports = {};
__export(chat_exports, {
  chatStream: () => chatStream
});
async function chatStream(options) {
  const systemPrompt = options.mode === "plan" ? buildPlanPrompt({
    planRules: options.planRules,
    template: options.planTemplate,
    styleExamples: options.styleExamples
  }) : buildChatPrompt({
    chatRules: options.chatRules,
    rules: options.rules,
    template: options.template,
    essayContext: options.essayContext,
    styleExamples: options.styleExamples
  });
  let urlContext = "";
  let urlExtractionStatus = "";
  if (options.useWebSearch) {
    const lastUserMsg = [...options.messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      try {
        const { extractUrls: extractUrls2 } = await Promise.resolve().then(() => (init_url_extractor(), url_extractor_exports));
        const detectedUrls = extractUrls2(lastUserMsg.content);
        if (detectedUrls.length > 0) {
          console.log("[URL Extraction] Detected URLs:", detectedUrls);
          const fetched = await extractAndFetchUrls(lastUserMsg.content);
          if (fetched.length > 0) {
            const successful = fetched.filter((f) => !f.error && f.content);
            const failed = fetched.filter((f) => f.error || !f.content);
            if (successful.length > 0) {
              urlContext = buildUrlContext(fetched);
              console.log("[URL Extraction] Successfully fetched:", successful.map((f) => f.url));
            }
            if (failed.length > 0) {
              console.warn("[URL Extraction] Failed to fetch:", failed.map((f) => ({ url: f.url, error: f.error })));
              urlExtractionStatus = `

<url_extraction_status>
Attempted to fetch ${detectedUrls.length} URL(s). ${successful.length} succeeded, ${failed.length} failed.
${failed.map((f) => `- ${f.url}: ${f.error || "Empty content"}`).join("\n")}
</url_extraction_status>`;
            }
          }
        }
      } catch (err) {
        console.error("[URL Extraction] Error:", err);
        urlExtractionStatus = `

<url_extraction_status>
URL extraction encountered an error: ${err instanceof Error ? err.message : "Unknown error"}
</url_extraction_status>`;
      }
    }
  }
  let modeInstructions = "";
  if (options.mode === "agent") {
    modeInstructions = "\n\n" + (options.agentTemplate || DEFAULT_AGENT_TEMPLATE);
  }
  let webSearchContext = "";
  if (options.useWebSearch) {
    webSearchContext = `

<search_capability>
Web search is ENABLED for this conversation. You have access to current, real-time information from the web.
- For questions about recent events, news, or current information: search results will be provided automatically
- Cite sources when referencing specific facts from search results
- If search results are included in <web_search_results> tags, use that information to provide accurate, up-to-date answers
</search_capability>`;
  }
  let thinkingInstructions = "";
  if (options.useThinking) {
    thinkingInstructions = "\n\nTake time to think through complex questions step by step. Consider multiple angles before providing your final answer.";
  }
  let urlCapabilityInstructions = "";
  if (options.useWebSearch) {
    const hasUrlContent = urlContext.length > 0;
    const hasFailedUrls = urlExtractionStatus.length > 0;
    urlCapabilityInstructions = `

<CRITICAL_CAPABILITY>
**IMPORTANT: URL READING IS ENABLED**

You have a WORKING URL reader in this application. This overrides your default training.
- DO NOT say "I cannot access URLs" or "I cannot browse the web" - you CAN and DO have this capability
- When users share URLs, the content is AUTOMATICALLY FETCHED by the system
- Look for <referenced_urls> tags below - that contains the fetched page content
- ${hasUrlContent ? "URL CONTENT WAS SUCCESSFULLY FETCHED - see <referenced_urls> below" : hasFailedUrls ? "URL fetch was ATTEMPTED but FAILED - see <url_extraction_status> below for details" : "No URLs detected in the current message"}

If you see fetched content, use it to answer the user's question. Quote specific passages when relevant.
If the fetch failed, explain what happened using the error details provided.
</CRITICAL_CAPABILITY>`;
  }
  const filteredMessages = options.messages.filter((m) => m.content && m.content.trim().length > 0);
  return createStream({
    model: options.model,
    messages: [
      { role: "system", content: systemPrompt + modeInstructions + webSearchContext + thinkingInstructions + urlCapabilityInstructions + urlContext + urlExtractionStatus },
      ...filteredMessages
    ],
    anthropicKey: options.anthropicKey,
    openaiKey: options.openaiKey,
    maxTokens: options.useThinking ? 16e3 : 4096,
    // Allow more tokens for thinking mode
    useThinking: options.useThinking,
    useWebSearch: options.useWebSearch
  });
}
var init_chat = __esm({
  "src/ai/chat.ts"() {
    "use strict";
    init_provider();
    init_builders();
    init_url_extractor();
    init_prompts();
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AI_MODELS: () => AI_MODELS,
  CommentMark: () => CommentMark,
  DEFAULT_AUTO_DRAFT_TEMPLATE: () => DEFAULT_AUTO_DRAFT_TEMPLATE,
  DEFAULT_CHAT_TEMPLATE: () => DEFAULT_CHAT_TEMPLATE,
  DEFAULT_EXPAND_PLAN_TEMPLATE: () => DEFAULT_EXPAND_PLAN_TEMPLATE,
  DEFAULT_GENERATE_TEMPLATE: () => DEFAULT_GENERATE_TEMPLATE,
  DEFAULT_PLAN_RULES: () => DEFAULT_PLAN_RULES,
  DEFAULT_PLAN_TEMPLATE: () => DEFAULT_PLAN_TEMPLATE,
  DEFAULT_REWRITE_TEMPLATE: () => DEFAULT_REWRITE_TEMPLATE,
  addCommentMark: () => addCommentMark,
  applyCommentMarks: () => applyCommentMarks,
  buildAutoDraftPrompt: () => buildAutoDraftPrompt,
  buildChatPrompt: () => buildChatPrompt,
  buildExpandPlanPrompt: () => buildExpandPlanPrompt,
  buildGeneratePrompt: () => buildGeneratePrompt,
  buildPlanPrompt: () => buildPlanPrompt,
  buildRewritePrompt: () => buildRewritePrompt,
  canDeleteComment: () => canDeleteComment,
  canEditComment: () => canEditComment,
  createAPIHandler: () => createAPIHandler,
  createAutoblogger: () => createAutoblogger,
  createCommentsClient: () => createCommentsClient,
  createCrudData: () => createCrudData,
  createDestinationDispatcher: () => createDestinationDispatcher,
  fetchRssFeeds: () => fetchRssFeeds,
  filterByKeywords: () => filterByKeywords,
  formatDate: () => formatDate,
  generate: () => generate,
  generateSlug: () => generateSlug,
  getDefaultModel: () => getDefaultModel,
  getModel: () => getModel,
  getSeoValues: () => getSeoValues,
  htmlToMarkdown: () => htmlToMarkdown,
  markdownToHtml: () => markdownToHtml,
  parseGeneratedContent: () => parseGeneratedContent,
  parseMarkdown: () => parseMarkdown,
  removeCommentMark: () => removeCommentMark,
  renderMarkdown: () => renderMarkdown,
  renderMarkdownSanitized: () => renderMarkdownSanitized,
  resolveModel: () => resolveModel,
  runAutoDraft: () => runAutoDraft,
  scrollToComment: () => scrollToComment,
  truncate: () => truncate,
  validateSchema: () => validateSchema,
  wordCount: () => wordCount
});
module.exports = __toCommonJS(src_exports);

// src/destinations/prismic.ts
function mapPostToStub(_post) {
  return {};
}
function createPrismicDestination(config) {
  const masterLocale = config.masterLocale || "en-us";
  const syncMode = config.syncMode || "stub";
  const getDocumentId = config.getDocumentId || ((post) => `autoblogger-${post.id}`);
  return {
    name: `prismic:${config.repository}`,
    async onPublish(post) {
      try {
        const prismic = await Promise.resolve().then(() => (init_dist2(), dist_exports));
        const writeClient = prismic.createWriteClient(config.repository, {
          writeToken: config.writeToken
        });
        const readClient = prismic.createClient(config.repository);
        const migration = prismic.createMigration();
        const documentId = getDocumentId(post);
        const documentData = mapPostToStub(post);
        let existingDoc = null;
        try {
          existingDoc = await readClient.getByUID(config.documentType, post.slug, {
            lang: masterLocale
          });
        } catch {
        }
        if (existingDoc) {
          const updatedDoc = {
            ...existingDoc,
            uid: post.slug,
            data: { ...existingDoc.data, ...documentData }
          };
          if (config.autoRename) {
            migration.updateDocument(updatedDoc, post.title);
            console.log(`[prismic:${config.repository}] Updating document with new title for post "${post.slug}"`);
          } else {
            migration.updateDocument(updatedDoc);
            console.log(`[prismic:${config.repository}] Updating existing document for post "${post.slug}"`);
          }
        } else {
          migration.createDocument(
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
        console.log(`[prismic:${config.repository}] Synced stub for post "${post.slug}"`);
        return {
          success: true,
          externalId: documentId
        };
      } catch (error) {
        console.error(`[prismic:${config.repository}] Failed to sync post "${post.slug}":`, error);
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

// src/data/posts.ts
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
async function generateUniqueSlug(prisma, baseSlug, excludeId) {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.post.findFirst({
      where: {
        slug,
        ...excludeId ? { NOT: { id: excludeId } } : {}
      }
    });
    if (!existing) return slug;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}
async function fireDynamicPrismicDestination(prisma, post, event, envWriteToken) {
  try {
    const settings = await prisma.integrationSettings.findUnique({
      where: { id: "default" }
    });
    if (!settings?.prismicEnabled || !settings?.prismicRepository) {
      return;
    }
    const writeToken = settings.prismicWriteToken || envWriteToken;
    if (!writeToken) {
      console.warn("[autoblogger] Prismic enabled but no write token configured");
      return;
    }
    const prismicDest = createPrismicDestination({
      repository: settings.prismicRepository,
      writeToken,
      documentType: settings.prismicDocumentType || "autoblog",
      syncMode: settings.prismicSyncMode || "stub",
      masterLocale: settings.prismicLocale || "en-us",
      autoRename: settings.prismicAutoRename ?? false
    });
    if (event === "publish") {
      await prismicDest.onPublish(post);
    } else if (event === "unpublish") {
      await prismicDest.onUnpublish(post);
    } else if (event === "delete") {
      await prismicDest.onDelete(post);
    }
  } catch (error) {
    console.error("[autoblogger] Failed to fire dynamic Prismic destination:", error);
  }
}
function createPostsData(prisma, hooks, dispatcher, prismicEnvToken) {
  return {
    async count(where) {
      return prisma.post.count({ where });
    },
    async findPublished() {
      return prisma.post.findMany({
        where: { status: "published" },
        orderBy: { publishedAt: "desc" }
      });
    },
    async findBySlug(slug) {
      return prisma.post.findUnique({
        where: { slug },
        include: { tags: { include: { tag: true } } }
      });
    },
    async findById(id) {
      return prisma.post.findUnique({
        where: { id },
        include: { tags: { include: { tag: true } } }
      });
    },
    async findDrafts() {
      return prisma.post.findMany({
        where: { status: "draft" },
        orderBy: { updatedAt: "desc" }
      });
    },
    async findAll(options) {
      return prisma.post.findMany({
        where: options?.status ? { status: options.status } : void 0,
        orderBy: options?.orderBy || { updatedAt: "desc" },
        include: {
          tags: { include: { tag: true } },
          ...options?.includeRevisionCount ? { _count: { select: { revisions: true } } } : {}
        },
        skip: options?.skip,
        take: options?.take
      });
    },
    async create(data) {
      const { tagIds, ...postData } = data;
      const slug = postData.slug ? await generateUniqueSlug(prisma, postData.slug) : await generateUniqueSlug(prisma, slugify(postData.title));
      const post = await prisma.post.create({
        data: {
          ...postData,
          slug,
          markdown: postData.markdown || "",
          status: postData.status || "draft"
        }
      });
      if (tagIds?.length) {
        await prisma.postTag.createMany({
          data: tagIds.map((tagId) => ({ postId: post.id, tagId }))
        });
      }
      const result = await prisma.post.findUnique({
        where: { id: post.id },
        include: { tags: { include: { tag: true } } }
      });
      if (hooks?.afterSave) {
        await hooks.afterSave(result);
      }
      return result;
    },
    async update(id, data) {
      const {
        tagIds,
        tags,
        revisions,
        topic,
        topicId,
        // Handle separately as relation
        id: _id,
        // Don't update the ID
        createdAt: _createdAt,
        // Don't update createdAt
        wordCount: _wordCount,
        // Computed field, don't save
        ...postData
      } = data;
      let isPublishing = false;
      let isUnpublishing = false;
      let isUpdatingPublished = false;
      const existing = await prisma.post.findUnique({ where: { id } });
      const hasDestinationChanges = existing && (postData.title !== void 0 && postData.title !== existing.title || postData.slug !== void 0 && postData.slug !== existing.slug || postData.markdown !== void 0 && postData.markdown !== existing.markdown);
      const hasSlugChange = existing && postData.slug !== void 0 && postData.slug !== existing.slug;
      const hasTitleChange = existing && postData.title !== void 0 && postData.title !== existing.title;
      if (postData.status === "published") {
        if (existing?.status !== "published") {
          postData.publishedAt = /* @__PURE__ */ new Date();
          isPublishing = true;
          if (hooks?.beforePublish) {
            await hooks.beforePublish(existing);
          }
        } else if (hasDestinationChanges) {
          isUpdatingPublished = true;
        }
      } else if (postData.status === "draft") {
        if (existing?.status === "published") {
          isUnpublishing = true;
        }
      } else if (postData.status === void 0 && existing?.status === "published" && hasDestinationChanges) {
        isUpdatingPublished = true;
      }
      if (postData.slug) {
        postData.slug = await generateUniqueSlug(prisma, postData.slug, id);
      }
      const updatePayload = { ...postData };
      if (topicId !== void 0) {
        updatePayload.topic = topicId ? { connect: { id: topicId } } : { disconnect: true };
      }
      const post = await prisma.post.update({
        where: { id },
        data: updatePayload
      });
      if (tagIds !== void 0) {
        await prisma.postTag.deleteMany({ where: { postId: id } });
        if (tagIds.length) {
          await prisma.postTag.createMany({
            data: tagIds.map((tagId) => ({ postId: id, tagId }))
          });
        }
      }
      const result = await prisma.post.findUnique({
        where: { id },
        include: { tags: { include: { tag: true } } }
      });
      if (hooks?.afterSave) {
        await hooks.afterSave(result);
      }
      const oldSlug = existing?.slug;
      const newSlug = postData.slug;
      const slugChanged = oldSlug && newSlug && newSlug !== oldSlug;
      const wasPublished = existing?.publishedAt !== null;
      if (slugChanged && wasPublished && hooks?.onSlugChange) {
        hooks.onSlugChange({
          postId: id,
          oldSlug,
          newSlug
        }).catch((err) => {
          console.error("[autoblogger] Failed to handle slug change:", err);
        });
      }
      if (isPublishing || isUnpublishing || isUpdatingPublished) {
        if (dispatcher) {
          if (isPublishing || isUpdatingPublished) {
            dispatcher.publish(result).catch((err) => {
              console.error("[autoblogger] Failed to dispatch publish event:", err);
            });
          } else if (isUnpublishing) {
            dispatcher.unpublish(result).catch((err) => {
              console.error("[autoblogger] Failed to dispatch unpublish event:", err);
            });
          }
        }
      }
      if (isPublishing || isUnpublishing || isUpdatingPublished && (hasSlugChange || hasTitleChange)) {
        const event = isUnpublishing ? "unpublish" : "publish";
        fireDynamicPrismicDestination(prisma, result, event, prismicEnvToken);
      }
      return result;
    },
    async delete(id) {
      const existing = await prisma.post.findUnique({
        where: { id },
        include: { tags: { include: { tag: true } } }
      });
      const result = await prisma.post.update({
        where: { id },
        data: { status: "deleted" }
      });
      if (existing?.status === "published") {
        if (dispatcher) {
          dispatcher.delete(existing).catch((err) => {
            console.error("[autoblogger] Failed to dispatch delete event:", err);
          });
        }
        fireDynamicPrismicDestination(prisma, existing, "delete", prismicEnvToken);
      }
      return result;
    },
    async getPreviewUrl(id, basePath = "/e") {
      const token = crypto.randomUUID();
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      const post = await prisma.post.update({
        where: { id },
        data: { previewToken: token, previewExpiry: expiry }
      });
      return `${basePath}/${post.slug}?preview=${token}`;
    },
    async findByPreviewToken(token) {
      const post = await prisma.post.findFirst({
        where: {
          previewToken: token,
          previewExpiry: { gt: /* @__PURE__ */ new Date() }
        }
      });
      return post;
    }
  };
}

// src/data/comments.ts
function createCommentsData(prisma, config) {
  const mode = config?.mode || "authenticated";
  return {
    async count() {
      if (mode === "disabled") return 0;
      return prisma.comment.count();
    },
    // Public blog comments (original simple system)
    async findByPost(postId) {
      if (mode === "disabled") return [];
      return prisma.comment.findMany({
        where: { postId, approved: true },
        orderBy: { createdAt: "desc" }
      });
    },
    async findAll(options) {
      if (mode === "disabled") return { data: [], total: 0, page: 1, totalPages: 1 };
      const page = options?.page || 1;
      const limit = options?.limit || 25;
      const skip = (page - 1) * limit;
      const where = {
        ...options?.postId ? { postId: options.postId } : {},
        ...options?.approved !== void 0 ? { approved: options.approved } : {}
      };
      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            post: { select: { id: true, title: true, slug: true } },
            user: { select: { id: true, name: true, email: true } }
          }
        }),
        prisma.comment.count({ where })
      ]);
      return {
        data: comments,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    },
    async create(data) {
      if (mode === "disabled") {
        throw new Error("Comments are disabled");
      }
      return prisma.comment.create({
        data: {
          ...data,
          approved: mode === "authenticated"
        }
      });
    },
    async approve(id) {
      return prisma.comment.update({
        where: { id },
        data: { approved: true }
      });
    },
    async delete(id) {
      return prisma.comment.delete({ where: { id } });
    },
    getMode() {
      return mode;
    },
    // ========================================
    // Editor comments (with quotedText, replies, resolve)
    // ========================================
    /**
     * Find all editor comments for a post with nested replies.
     */
    async findEditorComments(postId, userId) {
      if (mode === "disabled") return [];
      const allComments = await prisma.comment.findMany({
        where: {
          postId,
          deletedAt: null
        },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      const topLevel = allComments.filter((c) => !c.parentId);
      const replies = allComments.filter((c) => c.parentId);
      return topLevel.map((comment) => ({
        ...comment,
        replies: replies.filter((r) => r.parentId === comment.id)
      }));
    },
    /**
     * Create an editor comment (with quotedText and optional parentId for replies).
     */
    async createEditorComment(postId, userId, data) {
      if (mode === "disabled") {
        throw new Error("Comments are disabled");
      }
      const comment = await prisma.comment.create({
        data: {
          postId,
          userId,
          quotedText: data.quotedText || "",
          content: data.content,
          parentId: data.parentId || null,
          resolved: false
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      return { ...comment, replies: [] };
    },
    /**
     * Update a comment's content.
     */
    async updateEditorComment(commentId, content, userId) {
      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: { content },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      return comment;
    },
    /**
     * Soft delete a comment.
     */
    async deleteEditorComment(commentId) {
      const hasDeletedAt = await prisma.comment.findFirst({
        where: { id: commentId },
        select: { id: true }
      });
      if (hasDeletedAt) {
        try {
          await prisma.comment.update({
            where: { id: commentId },
            data: { deletedAt: /* @__PURE__ */ new Date() }
          });
        } catch {
          await prisma.comment.delete({ where: { id: commentId } });
        }
      }
    },
    /**
     * Toggle resolved status.
     */
    async toggleResolve(commentId) {
      const current = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { resolved: true }
      });
      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: { resolved: !current?.resolved },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      return comment;
    },
    /**
     * Resolve all open comments for a post.
     */
    async resolveAll(postId) {
      const result = await prisma.comment.updateMany({
        where: {
          postId,
          resolved: false,
          parentId: null
          // Only top-level comments
        },
        data: { resolved: true }
      });
      return { resolved: result.count };
    }
  };
}

// src/data/factory.ts
function createCrudData(prisma, options) {
  const delegate = prisma[options.model];
  return {
    async findAll(opts) {
      return delegate.findMany({
        orderBy: options.defaultOrderBy,
        include: options.defaultInclude,
        ...opts
      });
    },
    async findById(id) {
      return delegate.findUnique({
        where: { id },
        include: options.defaultInclude
      });
    },
    async count(where) {
      return delegate.count({ where });
    },
    async create(data) {
      return delegate.create({ data });
    },
    async update(id, data) {
      return delegate.update({
        where: { id },
        data
      });
    },
    async delete(id) {
      return delegate.delete({ where: { id } });
    }
  };
}

// src/data/tags.ts
function createTagsData(prisma) {
  const base = createCrudData(prisma, {
    model: "tag",
    defaultOrderBy: { name: "asc" },
    defaultInclude: { _count: { select: { posts: true } } }
  });
  return {
    ...base,
    // Alias for backward compatibility
    async findAllWithCounts() {
      return base.findAll();
    },
    async findByName(name2) {
      return prisma.tag.findUnique({ where: { name: name2 } });
    },
    // Override create to accept string directly
    async create(name2) {
      return prisma.tag.create({ data: { name: name2 } });
    },
    // Override update to accept name directly
    async update(id, name2) {
      return prisma.tag.update({ where: { id }, data: { name: name2 } });
    },
    async addToPost(postId, tagId) {
      return prisma.postTag.create({
        data: { postId, tagId }
      });
    },
    async removeFromPost(postId, tagId) {
      return prisma.postTag.deleteMany({
        where: { postId, tagId }
      });
    },
    async getPostTags(postId) {
      const postTags = await prisma.postTag.findMany({
        where: { postId },
        include: { tag: true }
      });
      return postTags.map((pt) => pt.tag);
    }
  };
}

// src/data/revisions.ts
function createRevisionsData(prisma) {
  return {
    async findAll(options) {
      return prisma.revision.findMany({
        where: options?.postId ? { postId: options.postId } : {},
        orderBy: { createdAt: "desc" },
        skip: options?.skip,
        take: options?.take,
        include: {
          post: { select: { id: true, title: true, slug: true, markdown: true } }
        }
      });
    },
    async count(where) {
      return prisma.revision.count({ where });
    },
    async findByPost(postId) {
      return prisma.revision.findMany({
        where: { postId },
        orderBy: { createdAt: "desc" }
      });
    },
    async findById(id) {
      return prisma.revision.findUnique({
        where: { id },
        include: {
          post: { select: { id: true, title: true, slug: true, markdown: true } }
        }
      });
    },
    async create(postId, data) {
      return prisma.revision.create({
        data: { postId, ...data }
      });
    },
    async restore(revisionId) {
      const revision = await prisma.revision.findUnique({ where: { id: revisionId } });
      if (!revision) throw new Error("Revision not found");
      return prisma.post.update({
        where: { id: revision.postId },
        data: {
          title: revision.title,
          subtitle: revision.subtitle,
          markdown: revision.markdown
        }
      });
    },
    async compare(revisionId1, revisionId2) {
      const [rev1, rev2] = await Promise.all([
        prisma.revision.findUnique({ where: { id: revisionId1 } }),
        prisma.revision.findUnique({ where: { id: revisionId2 } })
      ]);
      if (!rev1 || !rev2) throw new Error("Revision not found");
      return {
        older: rev1.createdAt < rev2.createdAt ? rev1 : rev2,
        newer: rev1.createdAt < rev2.createdAt ? rev2 : rev1
      };
    },
    async pruneOldest(postId, keepCount) {
      const revisions = await prisma.revision.findMany({
        where: { postId },
        orderBy: { createdAt: "desc" },
        skip: keepCount,
        select: { id: true }
      });
      if (revisions.length > 0) {
        await prisma.revision.deleteMany({
          where: { id: { in: revisions.map((r) => r.id) } }
        });
      }
      return revisions.length;
    },
    async delete(id) {
      return prisma.revision.delete({ where: { id } });
    }
  };
}

// src/data/ai-settings.ts
function createAISettingsData(prisma) {
  const DEFAULT_ID = "default";
  return {
    async get() {
      let settings = await prisma.aISettings.findUnique({ where: { id: DEFAULT_ID } });
      if (!settings) {
        settings = await prisma.aISettings.create({
          data: { id: DEFAULT_ID }
        });
      }
      return settings;
    },
    async update(data) {
      return prisma.aISettings.upsert({
        where: { id: DEFAULT_ID },
        create: { id: DEFAULT_ID, ...data },
        update: data
      });
    }
  };
}

// src/data/topics.ts
function createTopicsData(prisma) {
  return {
    async findAll() {
      return prisma.topicSubscription.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { posts: true, newsItems: true } }
        }
      });
    },
    async count() {
      return prisma.topicSubscription.count();
    },
    async findActive() {
      return prisma.topicSubscription.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
      });
    },
    async findById(id) {
      return prisma.topicSubscription.findUnique({
        where: { id },
        include: { posts: true, newsItems: true }
      });
    },
    async create(data) {
      return prisma.topicSubscription.create({
        data: {
          name: data.name,
          keywords: JSON.stringify(data.keywords || []),
          rssFeeds: JSON.stringify(data.rssFeeds || []),
          isActive: data.isActive ?? true,
          useKeywordFilter: data.useKeywordFilter ?? true,
          frequency: data.frequency || "daily",
          maxPerPeriod: data.maxPerPeriod || 3,
          essayFocus: data.essayFocus
        }
      });
    },
    async update(id, data) {
      const updateData = { ...data };
      if (data.keywords) {
        updateData.keywords = JSON.stringify(data.keywords);
      }
      if (data.rssFeeds) {
        updateData.rssFeeds = JSON.stringify(data.rssFeeds);
      }
      return prisma.topicSubscription.update({
        where: { id },
        data: updateData
      });
    },
    async delete(id) {
      return prisma.topicSubscription.delete({ where: { id } });
    },
    async markRun(id) {
      return prisma.topicSubscription.update({
        where: { id },
        data: { lastRunAt: /* @__PURE__ */ new Date() }
      });
    }
  };
}

// src/data/news-items.ts
function createNewsItemsData(prisma) {
  return {
    async findPending() {
      return prisma.newsItem.findMany({
        where: { status: "pending" },
        orderBy: { createdAt: "desc" },
        include: { topic: true }
      });
    },
    async findByTopic(topicId) {
      return prisma.newsItem.findMany({
        where: { topicId },
        orderBy: { createdAt: "desc" }
      });
    },
    async findById(id) {
      return prisma.newsItem.findUnique({
        where: { id },
        include: { topic: true, post: true }
      });
    },
    async create(data) {
      const existing = await prisma.newsItem.findUnique({
        where: { url: data.url }
      });
      if (existing) {
        return existing;
      }
      return prisma.newsItem.create({ data });
    },
    async skip(id) {
      return prisma.newsItem.update({
        where: { id },
        data: { status: "skipped" }
      });
    },
    async markGenerated(id, postId) {
      return prisma.newsItem.update({
        where: { id },
        data: { status: "generated", postId }
      });
    },
    async delete(id) {
      return prisma.newsItem.delete({ where: { id } });
    },
    // This would be called by the auto-draft system
    async generateDraft(id, createPost) {
      const newsItem = await prisma.newsItem.findUnique({
        where: { id },
        include: { topic: true }
      });
      if (!newsItem) throw new Error("News item not found");
      const post = await createPost({
        title: newsItem.title,
        markdown: newsItem.summary || "",
        status: "suggested",
        sourceUrl: newsItem.url,
        topicId: newsItem.topicId
      });
      await prisma.newsItem.update({
        where: { id },
        data: { status: "generated", postId: post.id }
      });
      return post;
    }
  };
}

// src/data/users.ts
function createUsersData(prisma) {
  const base = createCrudData(prisma, {
    model: "user",
    defaultOrderBy: { createdAt: "desc" }
  });
  return {
    ...base,
    async findByEmail(email) {
      return prisma.user.findUnique({ where: { email } });
    },
    // Override create with proper defaults
    async create(data) {
      return prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          role: data.role || "writer"
        }
      });
    },
    // Override update with proper typing
    async update(id, data) {
      return prisma.user.update({
        where: { id },
        data
      });
    }
  };
}

// src/api/posts.ts
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function countWords(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}
function withWordCount(post) {
  return { ...post, wordCount: countWords(post.markdown) };
}
async function handlePostsAPI(req, cms, session, path, onMutate) {
  const method = req.method;
  const segments = path.split("/").filter(Boolean);
  const postId = segments[1];
  if (postId && segments[2] === "comments") {
    return handlePostCommentsAPI(req, cms, session, postId, segments.slice(3), onMutate);
  }
  if (method === "GET" && !postId) {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const all = url.searchParams.get("all") === "1";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "0", 10);
    const includeRevisionCount = url.searchParams.get("includeRevisionCount") === "1";
    const skip = limit > 0 ? (page - 1) * limit : void 0;
    const take = limit > 0 ? limit : void 0;
    const total = await cms.posts.count(all ? void 0 : { status: status || void 0 });
    const posts = await cms.posts.findAll({
      status: all ? void 0 : status || void 0,
      skip,
      take,
      includeRevisionCount
    });
    return jsonResponse({ data: posts.map(withWordCount), total });
  }
  if (method === "GET" && postId) {
    const post = await cms.posts.findById(postId);
    if (!post) return jsonResponse({ error: "Post not found" }, 404);
    return jsonResponse({ data: withWordCount(post) });
  }
  if (method === "POST") {
    const body = await req.json();
    const post = await cms.posts.create(body);
    if (onMutate) await onMutate("post", post);
    return jsonResponse({ data: post }, 201);
  }
  if (method === "PATCH" && postId) {
    const body = await req.json();
    if (body.status === "published" && !cms.config.auth.canPublish(session)) {
      return jsonResponse({ error: "Not authorized to publish" }, 403);
    }
    const contentChanging = body.title !== void 0 || body.subtitle !== void 0 || body.markdown !== void 0;
    if (contentChanging) {
      const existingPost = await cms.posts.findById(postId);
      if (existingPost && existingPost.markdown) {
        const recentRevisions = await cms.revisions.findByPost(postId);
        const lastRevision = recentRevisions[0];
        const contentIsDifferent = !lastRevision || lastRevision.markdown !== existingPost.markdown || lastRevision.title !== existingPost.title || lastRevision.subtitle !== existingPost.subtitle;
        if (contentIsDifferent) {
          await cms.revisions.create(postId, {
            title: existingPost.title,
            subtitle: existingPost.subtitle,
            markdown: existingPost.markdown
          });
          await cms.revisions.pruneOldest(postId, 50);
        }
      }
    }
    const post = await cms.posts.update(postId, body);
    if (onMutate) await onMutate("post", post);
    return jsonResponse({ data: post });
  }
  if (method === "DELETE" && postId) {
    if (!cms.config.auth.isAdmin(session)) {
      return jsonResponse({ error: "Admin required" }, 403);
    }
    await cms.posts.delete(postId);
    if (onMutate) await onMutate("post", { id: postId });
    return jsonResponse({ data: { success: true } });
  }
  return jsonResponse({ error: "Method not allowed" }, 405);
}
async function handlePostCommentsAPI(req, cms, session, postId, segments, onMutate) {
  const method = req.method;
  const commentId = segments[0];
  const action = segments[1];
  const userId = session?.user?.id;
  if (!userId) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }
  if (method === "GET" && !commentId) {
    const comments = await cms.comments.findEditorComments(postId, userId);
    return jsonResponse({ data: comments });
  }
  if (method === "POST" && !commentId) {
    const body = await req.json();
    const comment = await cms.comments.createEditorComment(postId, userId, {
      postId,
      quotedText: body.quotedText || "",
      content: body.content,
      parentId: body.parentId
    });
    if (onMutate) await onMutate("comment", comment);
    return jsonResponse({ data: comment }, 201);
  }
  if (method === "POST" && commentId === "resolve-all") {
    const result = await cms.comments.resolveAll(postId);
    return jsonResponse({ data: result });
  }
  if (method === "PATCH" && commentId && !action) {
    const body = await req.json();
    const comment = await cms.comments.updateEditorComment(commentId, body.content, userId);
    return jsonResponse({ data: comment });
  }
  if (method === "POST" && commentId && action === "resolve") {
    const comment = await cms.comments.toggleResolve(commentId);
    return jsonResponse({ data: comment });
  }
  if (method === "DELETE" && commentId) {
    await cms.comments.deleteEditorComment(commentId);
    return jsonResponse({ data: { success: true } });
  }
  return jsonResponse({ error: "Method not allowed" }, 405);
}

// src/api/utils.ts
function jsonResponse2(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function parsePath(path) {
  const segments = path.split("/").filter(Boolean);
  return {
    segments,
    resource: segments[0] || "",
    id: segments[1],
    subPath: segments.slice(2).join("/")
  };
}
function requireAdmin(cms, session) {
  if (!cms.config.auth.isAdmin(session)) {
    return jsonResponse2({ error: "Admin required" }, 403);
  }
  return null;
}
function requireAuth(session) {
  if (!session) {
    return jsonResponse2({ error: "Authentication required" }, 401);
  }
  return null;
}

// src/api/comments.ts
async function handleCommentsAPI(req, cms, session, path, onMutate) {
  const method = req.method;
  const { id: commentId, subPath } = parsePath(path);
  if (method === "GET") {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "25");
    const result = await cms.comments.findAll({
      postId: postId || void 0,
      page,
      limit
    });
    return jsonResponse2(result);
  }
  if (method === "POST") {
    const body = await req.json();
    const comment = await cms.comments.create({
      ...body,
      authorId: session?.user?.id
    });
    if (onMutate) await onMutate("comment", comment);
    return jsonResponse2({ data: comment }, 201);
  }
  if (method === "PATCH" && commentId && subPath === "approve") {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    const comment = await cms.comments.approve(commentId);
    return jsonResponse2({ data: comment });
  }
  if (method === "DELETE" && commentId) {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    await cms.comments.delete(commentId);
    return jsonResponse2({ data: { success: true } });
  }
  return jsonResponse2({ error: "Method not allowed" }, 405);
}

// src/api/tags.ts
async function handleTagsAPI(req, cms, session, path, onMutate) {
  const method = req.method;
  const { id: tagId } = parsePath(path);
  if (method === "GET" && !tagId) {
    const tags = await cms.tags.findAll();
    return jsonResponse2({ data: tags });
  }
  if (method === "POST") {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    const body = await req.json();
    const tag = await cms.tags.create(body.name);
    if (onMutate) await onMutate("tag", tag);
    return jsonResponse2({ data: tag }, 201);
  }
  if (method === "PATCH" && tagId) {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    const body = await req.json();
    const tag = await cms.tags.update(tagId, body.name);
    return jsonResponse2({ data: tag });
  }
  if (method === "DELETE" && tagId) {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    await cms.tags.delete(tagId);
    return jsonResponse2({ data: { success: true } });
  }
  return jsonResponse2({ error: "Method not allowed" }, 405);
}

// src/api/ai.ts
init_prompts();
init_models();
async function handleAIAPI(req, cms, session, path) {
  const method = req.method;
  const authError = requireAuth(session);
  if (authError) return authError;
  if (method === "GET" && path === "/ai/settings") {
    const settings = await cms.aiSettings.get();
    const hasAnthropicEnvKey = !!(cms.config.ai?.anthropicKey || process.env.ANTHROPIC_API_KEY);
    const hasOpenaiEnvKey = !!(cms.config.ai?.openaiKey || process.env.OPENAI_API_KEY);
    return jsonResponse2({
      data: {
        ...settings,
        // Don't expose actual env keys, just indicate they exist
        hasAnthropicEnvKey,
        hasOpenaiEnvKey,
        defaultGenerateTemplate: DEFAULT_GENERATE_TEMPLATE,
        defaultChatTemplate: DEFAULT_CHAT_TEMPLATE,
        defaultRewriteTemplate: DEFAULT_REWRITE_TEMPLATE,
        defaultAutoDraftTemplate: DEFAULT_AUTO_DRAFT_TEMPLATE,
        defaultPlanTemplate: DEFAULT_PLAN_TEMPLATE,
        defaultExpandPlanTemplate: DEFAULT_EXPAND_PLAN_TEMPLATE,
        defaultAgentTemplate: DEFAULT_AGENT_TEMPLATE,
        defaultPlanRules: DEFAULT_PLAN_RULES,
        availableModels: getModelOptions()
      }
    });
  }
  if (method === "PATCH" && path === "/ai/settings") {
    const adminError = requireAdmin(cms, session);
    if (adminError) return adminError;
    const body = await req.json();
    const settings = await cms.aiSettings.update(body);
    return jsonResponse2({ data: settings });
  }
  if (method === "POST" && path === "/ai/generate") {
    const body = await req.json();
    const { prompt, model, wordCount: wordCount2, mode, plan, styleExamples: clientStyleExamples, useWebSearch, useThinking } = body;
    const settings = await cms.aiSettings.get();
    try {
      let stream;
      const anthropicKey = cms.config.ai?.anthropicKey || settings.anthropicKey;
      const openaiKey = cms.config.ai?.openaiKey || settings.openaiKey;
      if (mode === "expand_plan" && plan) {
        let styleExamples = clientStyleExamples || "";
        if (!styleExamples) {
          styleExamples = await fetchStyleExamples(cms);
        }
        const { expandPlanStream: expandPlanStream2 } = await Promise.resolve().then(() => (init_generate(), generate_exports));
        stream = await expandPlanStream2({
          plan,
          model: model || settings.defaultModel,
          rules: settings.rules,
          template: settings.expandPlanTemplate,
          styleExamples,
          anthropicKey,
          openaiKey
        });
      } else {
        let styleExamples = clientStyleExamples || "";
        if (!styleExamples) {
          styleExamples = await fetchStyleExamples(cms);
        }
        const { generateStream: generateStream2 } = await Promise.resolve().then(() => (init_generate(), generate_exports));
        stream = await generateStream2({
          prompt,
          model: model || settings.defaultModel,
          wordCount: wordCount2,
          rules: settings.rules,
          template: settings.generateTemplate,
          styleExamples,
          anthropicKey,
          openaiKey,
          useWebSearch,
          useThinking
        });
      }
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    } catch (error) {
      console.error("[AI Generate Error]", error);
      return jsonResponse2({
        error: error instanceof Error ? error.message : "Generation failed"
      }, 500);
    }
  }
  if (method === "POST" && path === "/ai/chat") {
    const body = await req.json();
    const { messages, model, essayContext, mode, useWebSearch, useThinking } = body;
    const settings = await cms.aiSettings.get();
    const anthropicKey = cms.config.ai?.anthropicKey || settings.anthropicKey;
    const openaiKey = cms.config.ai?.openaiKey || settings.openaiKey;
    if (mode === "search") {
      try {
        const { generate: generate2 } = await Promise.resolve().then(() => (init_provider(), provider_exports));
        const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
        if (!lastUserMessage) {
          return jsonResponse2({ error: "No user message found" }, 400);
        }
        const result = await generate2(
          model || settings.defaultModel,
          DEFAULT_SEARCH_ONLY_PROMPT,
          lastUserMessage.content,
          {
            anthropicKey,
            openaiKey,
            maxTokens: 4096,
            useWebSearch: true
            // Always use web search in search mode
          }
        );
        return jsonResponse2({
          content: result.text,
          usage: {
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens
          }
        });
      } catch (error) {
        console.error("[AI Search Error]", error);
        return jsonResponse2({
          error: error instanceof Error ? error.message : "Search failed"
        }, 500);
      }
    }
    let styleExamples = "";
    try {
      const publishedPosts = await cms.posts.findPublished();
      const MAX_STYLE_EXAMPLES = 5;
      const MAX_WORDS_PER_EXAMPLE = 500;
      if (publishedPosts.length > 0) {
        const examples = publishedPosts.slice(0, MAX_STYLE_EXAMPLES).map((post) => {
          const words = post.markdown.split(/\s+/);
          const truncatedContent = words.length > MAX_WORDS_PER_EXAMPLE ? words.slice(0, MAX_WORDS_PER_EXAMPLE).join(" ") + "..." : post.markdown;
          return `## ${post.title}
${post.subtitle ? `*${post.subtitle}*
` : ""}
${truncatedContent}`;
        }).join("\n\n---\n\n");
        styleExamples = `<published_essays>
The following are examples of the author's published work. Use these to match their voice, tone, and writing style:

${examples}
</published_essays>`;
      }
    } catch (err) {
      console.error("[AI Chat] Failed to fetch published essays:", err);
    }
    const { chatStream: chatStream2 } = await Promise.resolve().then(() => (init_chat(), chat_exports));
    try {
      const stream = await chatStream2({
        messages,
        model: model || settings.defaultModel,
        essayContext,
        mode,
        chatRules: settings.chatRules,
        rules: settings.rules,
        template: settings.chatTemplate,
        // Plan mode specific settings
        planTemplate: settings.planTemplate,
        planRules: settings.planRules,
        // Agent mode specific settings
        agentTemplate: settings.agentTemplate,
        styleExamples,
        anthropicKey,
        openaiKey,
        useWebSearch,
        useThinking
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    } catch (error) {
      console.error("[AI Chat Error]", error);
      return jsonResponse2({
        error: error instanceof Error ? error.message : "Chat failed"
      }, 500);
    }
  }
  if (method === "POST" && path === "/ai/rewrite") {
    const body = await req.json();
    const { text } = body;
    if (!text || typeof text !== "string") {
      return jsonResponse2({ error: "Text is required" }, 400);
    }
    const settings = await cms.aiSettings.get();
    const anthropicKey = cms.config.ai?.anthropicKey || settings.anthropicKey;
    const openaiKey = cms.config.ai?.openaiKey || settings.openaiKey;
    let styleExamples = "";
    try {
      const publishedPosts = await cms.posts.findPublished();
      const MAX_STYLE_EXAMPLES = 3;
      const MAX_WORDS_PER_EXAMPLE = 300;
      if (publishedPosts.length > 0) {
        const examples = publishedPosts.slice(0, MAX_STYLE_EXAMPLES).map((post) => {
          const words = post.markdown.split(/\s+/);
          const truncatedContent = words.length > MAX_WORDS_PER_EXAMPLE ? words.slice(0, MAX_WORDS_PER_EXAMPLE).join(" ") + "..." : post.markdown;
          return `## ${post.title}
${truncatedContent}`;
        }).join("\n\n---\n\n");
        styleExamples = examples;
      }
    } catch (err) {
      console.error("[AI Rewrite] Failed to fetch published essays:", err);
    }
    const { buildRewritePrompt: buildRewritePrompt3 } = await Promise.resolve().then(() => (init_builders(), builders_exports));
    const { createStream: createStream2 } = await Promise.resolve().then(() => (init_provider(), provider_exports));
    try {
      const systemPrompt = buildRewritePrompt3({
        rewriteRules: settings.rewriteRules,
        rules: settings.rules,
        template: settings.rewriteTemplate,
        styleExamples
      });
      const stream = await createStream2({
        model: settings.defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Rewrite the following text, preserving meaning but improving clarity and style:

${text}` }
        ],
        anthropicKey,
        openaiKey,
        maxTokens: 2048
      });
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let rewrittenText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                rewrittenText += parsed.text;
              }
            } catch {
            }
          }
        }
      }
      return jsonResponse2({ text: rewrittenText.trim() });
    } catch (error) {
      console.error("[AI Rewrite Error]", error);
      return jsonResponse2({
        error: error instanceof Error ? error.message : "Rewrite failed"
      }, 500);
    }
  }
  return jsonResponse2({ error: "Not found" }, 404);
}
async function fetchStyleExamples(cms) {
  try {
    const publishedPosts = await cms.posts.findPublished();
    const MAX_STYLE_EXAMPLES = 5;
    const MAX_WORDS_PER_EXAMPLE = 500;
    if (publishedPosts.length > 0) {
      const examples = publishedPosts.slice(0, MAX_STYLE_EXAMPLES).map((post) => {
        const words = post.markdown.split(/\s+/);
        const truncatedContent = words.length > MAX_WORDS_PER_EXAMPLE ? words.slice(0, MAX_WORDS_PER_EXAMPLE).join(" ") + "..." : post.markdown;
        return `## ${post.title}
${post.subtitle ? `*${post.subtitle}*
` : ""}
${truncatedContent}`;
      }).join("\n\n---\n\n");
      return `The following are examples of the author's published work. Use these to match their voice, tone, and writing style:

${examples}`;
    }
  } catch (err) {
    console.error("[AI] Failed to fetch published essays:", err);
  }
  return "";
}

// src/api/upload.ts
async function handleUploadAPI(req, cms, session) {
  if (req.method !== "POST") {
    return jsonResponse2({ error: "Method not allowed" }, 405);
  }
  const authError = requireAuth(session);
  if (authError) return authError;
  if (!cms.config.storage?.upload) {
    return jsonResponse2({
      error: "Image uploads not configured. Add storage.upload to your autoblogger config."
    }, 400);
  }
  try {
    const formData = await req.formData();
    const file = formData.get("image") || formData.get("file");
    if (!file) {
      return jsonResponse2({ error: "No file provided" }, 400);
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return jsonResponse2({
        error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP"
      }, 400);
    }
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      return jsonResponse2({ error: "File too large. Maximum size: 4MB" }, 400);
    }
    const result = await cms.config.storage.upload(file);
    return jsonResponse2({ data: result });
  } catch (error) {
    return jsonResponse2({
      error: error instanceof Error ? error.message : "Upload failed"
    }, 500);
  }
}

// src/api/topics.ts
async function handleTopicsAPI(req, cms, session, path, onMutate) {
  const method = req.method;
  const { id: topicId, subPath } = parsePath(path);
  const authError = requireAdmin(cms, session);
  if (authError) return authError;
  if (method === "GET" && !topicId) {
    const topics = await cms.topics.findAll();
    return jsonResponse2({ data: topics });
  }
  if (method === "GET" && topicId) {
    const topic = await cms.topics.findById(topicId);
    if (!topic) return jsonResponse2({ error: "Topic not found" }, 404);
    return jsonResponse2({ data: topic });
  }
  if (method === "POST" && !topicId) {
    const body = await req.json();
    const topic = await cms.topics.create(body);
    if (onMutate) await onMutate("topic", topic);
    return jsonResponse2({ data: topic }, 201);
  }
  if (method === "POST" && topicId && subPath === "generate") {
    await cms.topics.markRun(topicId);
    return jsonResponse2({
      data: {
        success: true,
        message: "Generation triggered. Implement generation logic in your application."
      }
    });
  }
  if (method === "PATCH" && topicId) {
    const body = await req.json();
    const topic = await cms.topics.update(topicId, body);
    return jsonResponse2({ data: topic });
  }
  if (method === "DELETE" && topicId) {
    await cms.topics.delete(topicId);
    return jsonResponse2({ data: { success: true } });
  }
  return jsonResponse2({ error: "Method not allowed" }, 405);
}

// src/api/users.ts
function normalizeEmail(email) {
  return email.toLowerCase().trim();
}
async function handleUsersAPI(req, cms, session, path) {
  const method = req.method;
  const { id: userId } = parsePath(path);
  const authError = requireAdmin(cms, session);
  if (authError) return authError;
  if (method === "GET" && !userId) {
    const users = await cms.users.findAll();
    return jsonResponse2({ data: users });
  }
  if (method === "GET" && userId) {
    const user = await cms.users.findById(userId);
    if (!user) return jsonResponse2({ error: "User not found" }, 404);
    return jsonResponse2({ data: user });
  }
  if (method === "POST") {
    const body = await req.json();
    if (!body.email) {
      return jsonResponse2({ error: "Email required" }, 400);
    }
    const email = normalizeEmail(body.email);
    const existing = await cms.users.findByEmail(email);
    if (existing) {
      return jsonResponse2({ error: "User with this email already exists" }, 400);
    }
    const user = await cms.users.create({
      ...body,
      email
      // Use normalized email
    });
    return jsonResponse2({ data: user }, 201);
  }
  if (method === "PATCH" && userId) {
    const body = await req.json();
    const user = await cms.users.update(userId, body);
    return jsonResponse2({ data: user });
  }
  if (method === "DELETE" && userId) {
    await cms.users.delete(userId);
    return jsonResponse2({ data: { success: true } });
  }
  return jsonResponse2({ error: "Method not allowed" }, 405);
}

// src/api/admin.ts
async function handleAdminAPI(req, cms, session, path) {
  const method = req.method;
  const authError = requireAdmin(cms, session);
  if (authError) return authError;
  if (method === "GET" && path === "/admin/counts") {
    const [users, posts, tags, topics] = await Promise.all([
      cms.users.count(),
      cms.posts.findAll().then((p) => p.length),
      cms.tags.findAll().then((t) => t.length),
      cms.topics.findAll().then((t) => t.length)
    ]);
    return jsonResponse2({
      data: { users, posts, tags, topics }
    });
  }
  return jsonResponse2({ error: "Not found" }, 404);
}

// src/api/settings.ts
function maskToken(token) {
  if (!token) return "";
  if (token.length <= 8) return "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
  return token.slice(0, 4) + "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" + token.slice(-4);
}
async function handleSettingsAPI(req, cms, session, path) {
  const method = req.method;
  const prisma = cms.config.prisma;
  const authError = requireAuth(session);
  if (authError) return authError;
  if (method === "GET" && path === "/settings") {
    const integrationSettings = await prisma.integrationSettings.findUnique({
      where: { id: "default" }
    });
    return jsonResponse2({
      data: {
        autoDraftEnabled: integrationSettings?.autoDraftEnabled ?? false,
        postUrlPattern: integrationSettings?.postUrlPattern ?? "/e/{slug}"
      }
    });
  }
  if (method === "PATCH" && path === "/settings") {
    const adminError = requireAdmin(cms, session);
    if (adminError) return adminError;
    const body = await req.json();
    const updateData = {};
    if (typeof body.autoDraftEnabled === "boolean") {
      updateData.autoDraftEnabled = body.autoDraftEnabled;
    }
    if (typeof body.postUrlPattern === "string") {
      updateData.postUrlPattern = body.postUrlPattern;
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.integrationSettings.upsert({
        where: { id: "default" },
        create: { id: "default", ...updateData },
        update: updateData
      });
    }
    const integrationSettings = await prisma.integrationSettings.findUnique({
      where: { id: "default" }
    });
    return jsonResponse2({
      data: {
        autoDraftEnabled: integrationSettings?.autoDraftEnabled ?? false,
        postUrlPattern: integrationSettings?.postUrlPattern ?? "/e/{slug}"
      }
    });
  }
  if (method === "GET" && path === "/settings/integrations") {
    const integrationSettings = await prisma.integrationSettings.findUnique({
      where: { id: "default" }
    });
    const configRepo = cms.config.prismic?.repository;
    const hasEnvToken = !!cms.config.prismic?.writeToken;
    const hasDbToken = !!integrationSettings?.prismicWriteToken;
    return jsonResponse2({
      data: {
        prismic: {
          enabled: integrationSettings?.prismicEnabled ?? false,
          repository: integrationSettings?.prismicRepository ?? "",
          configRepository: configRepo ?? null,
          writeToken: maskToken(integrationSettings?.prismicWriteToken),
          hasWriteToken: hasDbToken,
          hasEnvToken,
          documentType: integrationSettings?.prismicDocumentType ?? "autoblog",
          syncMode: integrationSettings?.prismicSyncMode ?? "stub",
          locale: integrationSettings?.prismicLocale ?? "en-us",
          autoRename: integrationSettings?.prismicAutoRename ?? false
        }
      }
    });
  }
  if (method === "PATCH" && path === "/settings/integrations") {
    const adminError = requireAdmin(cms, session);
    if (adminError) return adminError;
    const body = await req.json();
    const updateData = {};
    if (typeof body.prismicEnabled === "boolean") {
      updateData.prismicEnabled = body.prismicEnabled;
    }
    if (typeof body.prismicRepository === "string") {
      updateData.prismicRepository = body.prismicRepository || null;
    }
    if (typeof body.prismicWriteToken === "string") {
      if (!body.prismicWriteToken.includes("\u2022\u2022\u2022\u2022")) {
        updateData.prismicWriteToken = body.prismicWriteToken || null;
      }
    }
    if (typeof body.prismicDocumentType === "string") {
      updateData.prismicDocumentType = body.prismicDocumentType || "autoblog";
    }
    if (typeof body.prismicSyncMode === "string" && ["stub", "full"].includes(body.prismicSyncMode)) {
      updateData.prismicSyncMode = body.prismicSyncMode;
    }
    if (typeof body.prismicLocale === "string") {
      updateData.prismicLocale = body.prismicLocale || "en-us";
    }
    if (typeof body.prismicAutoRename === "boolean") {
      updateData.prismicAutoRename = body.prismicAutoRename;
    }
    if (updateData.prismicEnabled === true) {
      const current = await prisma.integrationSettings.findUnique({
        where: { id: "default" }
      });
      const repo = updateData.prismicRepository ?? current?.prismicRepository;
      const hasDbToken = !!(updateData.prismicWriteToken ?? current?.prismicWriteToken);
      const hasEnvToken = !!cms.config.prismic?.writeToken;
      if (!repo) {
        return jsonResponse2({ error: "Repository name is required to enable Prismic" }, 400);
      }
      if (!hasDbToken && !hasEnvToken) {
        return jsonResponse2({ error: "Write token is required to enable Prismic (set PRISMIC_WRITE_TOKEN in config or enter in field)" }, 400);
      }
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.integrationSettings.upsert({
        where: { id: "default" },
        create: { id: "default", ...updateData },
        update: updateData
      });
    }
    const integrationSettings = await prisma.integrationSettings.findUnique({
      where: { id: "default" }
    });
    return jsonResponse2({
      data: {
        prismic: {
          enabled: integrationSettings?.prismicEnabled ?? false,
          repository: integrationSettings?.prismicRepository ?? "",
          writeToken: maskToken(integrationSettings?.prismicWriteToken),
          hasWriteToken: !!integrationSettings?.prismicWriteToken,
          documentType: integrationSettings?.prismicDocumentType ?? "autoblog",
          syncMode: integrationSettings?.prismicSyncMode ?? "stub",
          locale: integrationSettings?.prismicLocale ?? "en-us",
          autoRename: integrationSettings?.prismicAutoRename ?? false
        }
      }
    });
  }
  return jsonResponse2({ error: "Not found" }, 404);
}

// src/api/revisions.ts
async function handleRevisionsAPI(req, cms, session, path, onMutate) {
  const method = req.method;
  const url = new URL(req.url);
  const { id: revisionId, subPath } = parsePath(path);
  if (method === "GET" && !revisionId) {
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "25");
    const postId = url.searchParams.get("postId");
    const where = postId ? { postId } : {};
    const [revisions, total] = await Promise.all([
      cms.revisions.findAll({ ...where, skip: (page - 1) * limit, take: limit }),
      cms.revisions.count(where)
    ]);
    return jsonResponse2({
      data: revisions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  }
  if (method === "GET" && revisionId) {
    const revision = await cms.revisions.findById(revisionId);
    if (!revision) return jsonResponse2({ error: "Revision not found" }, 404);
    return jsonResponse2({ data: revision });
  }
  if (method === "POST" && revisionId && subPath === "restore") {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    const post = await cms.revisions.restore(revisionId);
    if (onMutate) await onMutate("post", post);
    return jsonResponse2({ data: post });
  }
  if (method === "DELETE" && revisionId) {
    const authError = requireAdmin(cms, session);
    if (authError) return authError;
    await cms.revisions.delete(revisionId);
    return jsonResponse2({ data: { success: true } });
  }
  return jsonResponse2({ error: "Method not allowed" }, 405);
}

// src/api/chat-history.ts
async function handleChatHistoryAPI(req, prisma, isAuthenticated) {
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const method = req.method;
  const hasChatMessage = !!prisma.chatMessage;
  try {
    if (method === "GET") {
      if (!hasChatMessage) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      const messages = await prisma.chatMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 50
      });
      return new Response(JSON.stringify(messages.reverse()), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (method === "POST") {
      if (!hasChatMessage) {
        return new Response(JSON.stringify({ id: "temp", role: "user", content: "" }), {
          status: 201,
          headers: { "Content-Type": "application/json" }
        });
      }
      const body = await req.json();
      if (!body.role || !body.content) {
        return new Response(JSON.stringify({ error: "Missing role or content" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const message = await prisma.chatMessage.create({
        data: {
          role: body.role,
          content: body.content
        }
      });
      return new Response(JSON.stringify(message), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (method === "DELETE") {
      if (!hasChatMessage) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      await prisma.chatMessage.deleteMany({});
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[Chat History API Error]", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// src/api/index.ts
function extractPath(pathname, basePath) {
  const normalized = pathname.replace(/\/$/, "");
  const base = basePath.replace(/\/$/, "");
  if (normalized === base) return "/";
  if (normalized.startsWith(base + "/")) {
    return normalized.slice(base.length);
  }
  return "/";
}
function jsonResponse3(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function createAPIHandler(cms, options = {}) {
  const basePath = options.basePath || "/api/cms";
  return async (req) => {
    const path = extractPath(req.nextUrl.pathname, basePath);
    const method = req.method;
    let session = null;
    try {
      session = await cms.config.auth.getSession();
    } catch {
    }
    const isPublicRoute = path.startsWith("/posts") && method === "GET";
    if (!isPublicRoute && !session) {
      return jsonResponse3({ error: "Unauthorized" }, 401);
    }
    try {
      if (path.startsWith("/posts")) {
        return handlePostsAPI(req, cms, session, path, options.onMutate);
      }
      if (path.startsWith("/comments")) {
        return handleCommentsAPI(req, cms, session, path, options.onMutate);
      }
      if (path.startsWith("/tags")) {
        return handleTagsAPI(req, cms, session, path, options.onMutate);
      }
      if (path.startsWith("/ai")) {
        return handleAIAPI(req, cms, session, path);
      }
      if (path.startsWith("/upload")) {
        return handleUploadAPI(req, cms, session);
      }
      if (path.startsWith("/topics")) {
        return handleTopicsAPI(req, cms, session, path, options.onMutate);
      }
      if (path.startsWith("/users")) {
        return handleUsersAPI(req, cms, session, path);
      }
      if (path.startsWith("/admin")) {
        return handleAdminAPI(req, cms, session, path);
      }
      if (path.startsWith("/settings")) {
        return handleSettingsAPI(req, cms, session, path);
      }
      if (path.startsWith("/revisions")) {
        return handleRevisionsAPI(req, cms, session, path, options.onMutate);
      }
      if (path.startsWith("/chat/history")) {
        return handleChatHistoryAPI(req, cms.config.prisma, !!session);
      }
      return jsonResponse3({ error: "Not found" }, 404);
    } catch (error) {
      console.error("API error:", error);
      return jsonResponse3({
        error: error instanceof Error ? error.message : "Internal server error"
      }, 500);
    }
  };
}

// src/auto-draft/rss.ts
var import_rss_parser = __toESM(require("rss-parser"));
var parser = new import_rss_parser.default({
  timeout: 1e4,
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  }
});
async function fetchRssFeeds(feedUrls) {
  const articles = [];
  for (const url of feedUrls) {
    try {
      const feed = await parser.parseURL(url);
      for (const item of feed.items) {
        if (!item.title || !item.link) continue;
        articles.push({
          title: item.title,
          url: item.link,
          summary: item.contentSnippet || item.content || null,
          publishedAt: item.pubDate ? new Date(item.pubDate) : null
        });
      }
    } catch (error) {
      console.error(`Failed to fetch RSS feed: ${url}`, error);
    }
  }
  return articles;
}

// src/auto-draft/keywords.ts
function filterByKeywords(articles, keywords) {
  if (keywords.length === 0) return articles;
  const lowerKeywords = keywords.map((k) => k.toLowerCase().trim());
  return articles.filter((article) => {
    const searchText = `${article.title} ${article.summary || ""}`.toLowerCase();
    return lowerKeywords.some((keyword) => searchText.includes(keyword));
  });
}

// src/ai/index.ts
init_models();
init_provider();
init_generate();
init_chat();
init_builders();
init_prompts();

// src/ai/parse.ts
function parseGeneratedContent(markdown) {
  const lines = markdown.trim().split("\n");
  let title2 = "";
  let subtitle = "";
  let bodyStartIndex = 0;
  if (lines[0]?.startsWith("# ")) {
    title2 = lines[0].replace(/^#\s+/, "").trim();
    bodyStartIndex = 1;
  }
  for (let i = bodyStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;
    const italicMatch = line.match(/^\*(.+)\*$/) || line.match(/^_(.+)_$/);
    if (italicMatch) {
      subtitle = italicMatch[1].trim();
      bodyStartIndex = i + 1;
    }
    break;
  }
  while (bodyStartIndex < lines.length && lines[bodyStartIndex].trim() === "") {
    bodyStartIndex++;
  }
  const body = lines.slice(bodyStartIndex).join("\n").trim();
  return { title: title2, subtitle, body };
}

// src/lib/markdown.ts
var import_marked = require("marked");
var import_turndown = __toESM(require("turndown"));
var import_sanitize_html = __toESM(require("sanitize-html"));
import_marked.marked.setOptions({
  gfm: true,
  breaks: false
});
function renderMarkdown(markdown) {
  return import_marked.marked.parse(markdown);
}
function markdownToHtml(markdown) {
  return import_marked.marked.parse(markdown, { gfm: true, breaks: true });
}
function createStyledRenderer() {
  const renderer = new import_marked.Renderer();
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
function parseMarkdown(markdown) {
  return import_marked.marked.lexer(markdown);
}
var turndownService = new import_turndown.default({
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
function generateSlug(title2) {
  return title2.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 60);
}
function renderMarkdownSanitized(markdown) {
  const html = renderMarkdown(markdown);
  return (0, import_sanitize_html.default)(html, {
    allowedTags: import_sanitize_html.default.defaults.allowedTags.concat(["img", "h1", "h2"]),
    allowedAttributes: {
      ...import_sanitize_html.default.defaults.allowedAttributes,
      img: ["src", "alt", "title"],
      a: ["href", "target", "rel"]
    }
  });
}

// src/auto-draft/runner.ts
async function getStyleContext(prisma) {
  const settings = await prisma.aISettings.findUnique({ where: { id: "default" } });
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    select: { title: true, subtitle: true, markdown: true },
    orderBy: { publishedAt: "desc" },
    take: 10
  });
  const styleExamples = posts.map(
    (p) => `# ${p.title}
${p.subtitle ? `*${p.subtitle}*

` : ""}${p.markdown}`
  ).join("\n\n---\n\n");
  return {
    rules: settings?.rules || "",
    autoDraftRules: settings?.autoDraftRules || "",
    styleExamples
  };
}
function shouldRunTopic(topic) {
  if (topic.frequency === "manual") return false;
  if (!topic.lastRunAt) return true;
  const now = /* @__PURE__ */ new Date();
  const lastRun = new Date(topic.lastRunAt);
  const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1e3 * 60 * 60);
  if (topic.frequency === "daily") return hoursSinceLastRun >= 23;
  if (topic.frequency === "weekly") return hoursSinceLastRun >= 167;
  return true;
}
async function deduplicateArticles(prisma, articles) {
  const articleUrls = articles.map((a) => a.url);
  const existingUrls = await prisma.newsItem.findMany({
    where: { url: { in: articleUrls } },
    select: { url: true }
  });
  const urlSet = new Set(existingUrls.map((n) => n.url));
  return articles.filter((a) => !urlSet.has(a.url));
}
async function generateUniqueSlug2(prisma, title2) {
  const baseSlug = generateSlug(title2);
  const existing = await prisma.post.findUnique({ where: { slug: baseSlug } });
  if (!existing) return baseSlug;
  let suffix = 2;
  while (suffix < 100) {
    const candidateSlug = `${baseSlug}-${suffix}`;
    const exists = await prisma.post.findUnique({ where: { slug: candidateSlug } });
    if (!exists) return candidateSlug;
    suffix++;
  }
  return `${baseSlug}-${Date.now()}`;
}
async function generateEssayFromArticle(config, article, topicName, essayFocus) {
  const context = await getStyleContext(config.prisma);
  const systemPrompt = buildAutoDraftPrompt({
    autoDraftRules: context.autoDraftRules,
    rules: context.rules,
    wordCount: 800,
    styleExamples: context.styleExamples,
    topicName,
    articleTitle: article.title,
    articleSummary: article.summary || "",
    articleUrl: article.url
  });
  const model = await resolveModel(void 0, async () => {
    const settings = await config.prisma.aISettings.findUnique({ where: { id: "default" } });
    return settings?.defaultModel || null;
  });
  const userPrompt = essayFocus ? `Write the essay now. Focus on: ${essayFocus}` : "Write the essay now.";
  const result = await generate(model.id, systemPrompt, userPrompt, {
    maxTokens: 4096,
    anthropicKey: config.anthropicKey,
    openaiKey: config.openaiKey
  });
  const parsed = parseGeneratedContent(result.text);
  return {
    title: parsed.title || article.title,
    subtitle: parsed.subtitle || null,
    markdown: parsed.body
  };
}
async function runAutoDraft(config, topicId, skipFrequencyCheck = false) {
  const { prisma } = config;
  const integrationSettings = await prisma.integrationSettings.findUnique({
    where: { id: "default" }
  });
  if (!integrationSettings?.autoDraftEnabled) {
    console.log("Auto-draft is disabled. Skipping.");
    return [];
  }
  const topics = topicId ? await prisma.topicSubscription.findMany({ where: { id: topicId, isActive: true } }) : await prisma.topicSubscription.findMany({ where: { isActive: true } });
  const results = [];
  for (const topic of topics) {
    if (!skipFrequencyCheck && !shouldRunTopic(topic)) {
      continue;
    }
    try {
      const feedUrls = JSON.parse(topic.rssFeeds);
      const articles = await fetchRssFeeds(feedUrls);
      const keywords = JSON.parse(topic.keywords);
      const relevant = topic.useKeywordFilter ? filterByKeywords(articles, keywords) : articles;
      const newArticles = await deduplicateArticles(prisma, relevant);
      const toGenerate = newArticles.slice(0, topic.maxPerPeriod);
      let generated = 0;
      for (const article of toGenerate) {
        try {
          const newsItem = await prisma.newsItem.create({
            data: {
              topicId: topic.id,
              url: article.url,
              title: article.title,
              summary: article.summary,
              publishedAt: article.publishedAt,
              status: "pending"
            }
          });
          const essay = await generateEssayFromArticle(config, article, topic.name, topic.essayFocus);
          const slug = await generateUniqueSlug2(prisma, essay.title);
          const extraFields = config.onPostCreate ? await config.onPostCreate(article, essay) : {};
          const post = await prisma.post.create({
            data: {
              title: essay.title,
              subtitle: essay.subtitle,
              slug,
              markdown: essay.markdown,
              status: "suggested",
              sourceUrl: article.url,
              topicId: topic.id,
              ...extraFields
            }
          });
          await prisma.newsItem.update({
            where: { id: newsItem.id },
            data: { postId: post.id, status: "generated" }
          });
          generated++;
        } catch (articleError) {
          console.error(`Failed to process article: ${article.title}`, articleError);
        }
      }
      await prisma.topicSubscription.update({
        where: { id: topic.id },
        data: { lastRunAt: /* @__PURE__ */ new Date() }
      });
      results.push({
        topicId: topic.id,
        topicName: topic.name,
        generated,
        skipped: relevant.length - generated
      });
    } catch (topicError) {
      console.error(`Failed to process topic: ${topic.name}`, topicError);
      results.push({
        topicId: topic.id,
        topicName: topic.name,
        generated: 0,
        skipped: 0
      });
    }
  }
  return results;
}

// src/destinations/dispatcher.ts
function createDestinationDispatcher(config) {
  const { destinations = [], webhooks = [], onPublish, onUnpublish, onDelete } = config;
  async function fireWebhook(url, event) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
      });
      if (!response.ok) {
        return {
          url,
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      return { url, success: true };
    } catch (error) {
      return {
        url,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  async function fireDestination(destination, method, post) {
    try {
      const result = await destination[method](post);
      return { name: destination.name, result };
    } catch (error) {
      return {
        name: destination.name,
        result: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  async function dispatch(type, post, callback) {
    const event = {
      type,
      post,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    const method = type === "publish" ? "onPublish" : type === "unpublish" ? "onUnpublish" : "onDelete";
    const destinationPromises = destinations.map((dest) => fireDestination(dest, method, post));
    const webhookPromises = webhooks.map((url) => fireWebhook(url, event));
    const callbackPromise = callback ? callback(post).catch((err) => {
      console.error(`[autoblogger] ${type} callback error:`, err);
    }) : Promise.resolve();
    const [destinationResults, webhookResults] = await Promise.all([
      Promise.all(destinationPromises),
      Promise.all(webhookPromises),
      callbackPromise
    ]);
    const allSucceeded = destinationResults.every((r) => r.result.success) && webhookResults.every((r) => r.success);
    for (const { name: name2, result } of destinationResults) {
      if (!result.success) {
        console.error(`[autoblogger] Destination "${name2}" failed:`, result.error);
      }
    }
    for (const { url, success, error } of webhookResults) {
      if (!success) {
        console.error(`[autoblogger] Webhook "${url}" failed:`, error);
      }
    }
    return {
      destinations: destinationResults,
      webhooks: webhookResults,
      allSucceeded
    };
  }
  return {
    /**
     * Dispatch a publish event to all destinations
     */
    async publish(post) {
      return dispatch("publish", post, onPublish);
    },
    /**
     * Dispatch an unpublish event to all destinations
     */
    async unpublish(post) {
      return dispatch("unpublish", post, onUnpublish);
    },
    /**
     * Dispatch a delete event to all destinations
     */
    async delete(post) {
      return dispatch("delete", post, onDelete);
    },
    /**
     * Check if any destinations or webhooks are configured
     */
    get hasDestinations() {
      return destinations.length > 0 || webhooks.length > 0 || !!onPublish || !!onUnpublish || !!onDelete;
    }
  };
}

// src/types/config.ts
var DEFAULT_STYLES = {
  container: "max-w-ab-content mx-auto px-ab-content-padding",
  title: "text-ab-title font-bold",
  subtitle: "text-ab-h2 text-muted-foreground",
  byline: "text-sm text-muted-foreground",
  prose: "prose"
};

// src/server.ts
function createAutoblogger(config) {
  const prisma = config.prisma;
  const mergedStyles = {
    ...DEFAULT_STYLES,
    ...config.styles
  };
  const dispatcher = createDestinationDispatcher({
    destinations: config.destinations,
    webhooks: config.webhooks,
    onPublish: config.onPublish,
    onUnpublish: config.onUnpublish,
    onDelete: config.onDelete
  });
  const baseServer = {
    config: {
      ...config,
      styles: mergedStyles
    },
    posts: createPostsData(prisma, config.hooks, dispatcher, config.prismic?.writeToken),
    comments: createCommentsData(prisma, config.comments),
    tags: createTagsData(prisma),
    revisions: createRevisionsData(prisma),
    aiSettings: createAISettingsData(prisma),
    topics: createTopicsData(prisma),
    newsItems: createNewsItemsData(prisma),
    users: createUsersData(prisma)
  };
  const server = {
    ...baseServer,
    handleRequest: async () => new Response("Not initialized", { status: 500 }),
    autoDraft: {
      run: async (topicId, skipFrequencyCheck) => {
        const autoDraftConfig = {
          prisma,
          anthropicKey: config.ai?.anthropicKey,
          openaiKey: config.ai?.openaiKey,
          onPostCreate: config.hooks?.onAutoDraftPostCreate
        };
        return runAutoDraft(autoDraftConfig, topicId, skipFrequencyCheck);
      }
    }
  };
  const apiHandler = createAPIHandler(server);
  server.handleRequest = async (req, path) => {
    const normalizedPath = "/" + path.replace(/^\//, "");
    const originalUrl = new URL(req.url);
    const newUrl = new URL(originalUrl.origin + "/api/cms" + normalizedPath);
    originalUrl.searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value);
    });
    const handlerReq = new Request(newUrl.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : void 0,
      // @ts-ignore - duplex is needed for streaming bodies
      duplex: req.method !== "GET" && req.method !== "HEAD" ? "half" : void 0
    });
    Object.defineProperty(handlerReq, "nextUrl", {
      value: newUrl,
      writable: false
    });
    return apiHandler(handlerReq);
  };
  return server;
}

// src/schema.ts
var REQUIRED_TABLES = [
  "Post",
  "Revision",
  "Comment",
  "Tag",
  "PostTag",
  "AISettings",
  "TopicSubscription",
  "NewsItem"
];
async function validateSchema(prisma) {
  const p = prisma;
  const missingTables = [];
  for (const table2 of REQUIRED_TABLES) {
    const modelName = table2.charAt(0).toLowerCase() + table2.slice(1);
    try {
      if (!p[modelName]) {
        missingTables.push(table2);
      } else {
        await p[modelName].findFirst({ take: 1 }).catch(() => {
          missingTables.push(table2);
        });
      }
    } catch {
      missingTables.push(table2);
    }
  }
  return {
    valid: missingTables.length === 0,
    missingTables
  };
}

// src/lib/format.ts
function formatDate(date2, options) {
  const d = typeof date2 === "string" ? new Date(date2) : date2;
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  return d.toLocaleDateString("en-US", options || defaultOptions);
}
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

// src/lib/comments.ts
function canDeleteComment(comment, currentUserEmail, isAdmin) {
  return comment.user.email === currentUserEmail || isAdmin;
}
function canEditComment(comment, currentUserEmail) {
  return comment.user.email === currentUserEmail;
}
function createCommentsClient(apiBasePath = "/api/cms") {
  return {
    async fetchComments(postId) {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const json = await res.json();
      return json.data || json;
    },
    async createComment(postId, data) {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create comment");
      }
      const json = await res.json();
      return json.data || json;
    },
    async updateComment(postId, commentId, content) {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update comment");
      }
      const json = await res.json();
      return json.data || json;
    },
    async deleteComment(postId, commentId) {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments/${commentId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete comment");
      }
    },
    async toggleResolve(postId, commentId) {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments/${commentId}/resolve`, {
        method: "POST"
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to toggle resolve");
      }
      const json = await res.json();
      return json.data || json;
    },
    async resolveAllComments(postId) {
      const res = await fetch(`${apiBasePath}/posts/${postId}/comments/resolve-all`, {
        method: "POST"
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to resolve all comments");
      }
      const json = await res.json();
      return json.data || json;
    }
  };
}

// node_modules/@tiptap/core/dist/index.js
var import_transform = require("@tiptap/pm/transform");
var import_commands = require("@tiptap/pm/commands");
var import_state = require("@tiptap/pm/state");
var import_commands2 = require("@tiptap/pm/commands");
var import_commands3 = require("@tiptap/pm/commands");
var import_state2 = require("@tiptap/pm/state");
var import_state3 = require("@tiptap/pm/state");
var import_state4 = require("@tiptap/pm/state");
var import_model = require("@tiptap/pm/model");
var import_model2 = require("@tiptap/pm/model");
var import_state5 = require("@tiptap/pm/state");
var import_transform2 = require("@tiptap/pm/transform");
var import_commands4 = require("@tiptap/pm/commands");
var import_transform3 = require("@tiptap/pm/transform");
var import_transform4 = require("@tiptap/pm/transform");
var import_commands5 = require("@tiptap/pm/commands");
var import_commands6 = require("@tiptap/pm/commands");
var import_commands7 = require("@tiptap/pm/commands");
var import_commands8 = require("@tiptap/pm/commands");
var import_schema_list = require("@tiptap/pm/schema-list");
var import_commands9 = require("@tiptap/pm/commands");
var import_state6 = require("@tiptap/pm/state");
var import_commands10 = require("@tiptap/pm/commands");
var import_commands11 = require("@tiptap/pm/commands");
var import_commands12 = require("@tiptap/pm/commands");
var import_commands13 = require("@tiptap/pm/commands");
var import_commands14 = require("@tiptap/pm/commands");
var import_transform5 = require("@tiptap/pm/transform");
var import_model3 = require("@tiptap/pm/model");
var import_model4 = require("@tiptap/pm/model");
var import_model5 = require("@tiptap/pm/model");
var import_model6 = require("@tiptap/pm/model");
var import_model7 = require("@tiptap/pm/model");
var import_state7 = require("@tiptap/pm/state");
var import_commands15 = require("@tiptap/pm/commands");
var import_state8 = require("@tiptap/pm/state");
var import_state9 = require("@tiptap/pm/state");
var import_schema_list2 = require("@tiptap/pm/schema-list");
var import_state10 = require("@tiptap/pm/state");
var import_transform6 = require("@tiptap/pm/transform");
var import_model8 = require("@tiptap/pm/model");
var import_state11 = require("@tiptap/pm/state");
var import_transform7 = require("@tiptap/pm/transform");
var import_transform8 = require("@tiptap/pm/transform");
var import_commands16 = require("@tiptap/pm/commands");
var import_schema_list3 = require("@tiptap/pm/schema-list");
var import_state12 = require("@tiptap/pm/state");
var import_view = require("@tiptap/pm/view");
var import_keymap = require("@tiptap/pm/keymap");
var import_model9 = require("@tiptap/pm/model");
var import_state13 = require("@tiptap/pm/state");
var import_model10 = require("@tiptap/pm/model");
var import_state14 = require("@tiptap/pm/state");
var import_state15 = require("@tiptap/pm/state");
var import_transform9 = require("@tiptap/pm/transform");
var import_state16 = require("@tiptap/pm/state");
var import_state17 = require("@tiptap/pm/state");
var import_state18 = require("@tiptap/pm/state");
var import_state19 = require("@tiptap/pm/state");
var import_state20 = require("@tiptap/pm/state");
var import_state21 = require("@tiptap/pm/state");
var import_state22 = require("@tiptap/pm/state");
var import_transform10 = require("@tiptap/pm/transform");
var import_state23 = require("@tiptap/pm/state");
var import_state24 = require("@tiptap/pm/state");
var __defProp3 = Object.defineProperty;
var __export3 = (target, all) => {
  for (var name2 in all)
    __defProp3(target, name2, { get: all[name2], enumerable: true });
};
function createChainableState(config) {
  const { state, transaction } = config;
  let { selection } = transaction;
  let { doc } = transaction;
  let { storedMarks } = transaction;
  return {
    ...state,
    apply: state.apply.bind(state),
    applyTransaction: state.applyTransaction.bind(state),
    plugins: state.plugins,
    schema: state.schema,
    reconfigure: state.reconfigure.bind(state),
    toJSON: state.toJSON.bind(state),
    get storedMarks() {
      return storedMarks;
    },
    get selection() {
      return selection;
    },
    get doc() {
      return doc;
    },
    get tr() {
      selection = transaction.selection;
      doc = transaction.doc;
      storedMarks = transaction.storedMarks;
      return transaction;
    }
  };
}
var CommandManager = class {
  constructor(props) {
    this.editor = props.editor;
    this.rawCommands = this.editor.extensionManager.commands;
    this.customState = props.state;
  }
  get hasCustomState() {
    return !!this.customState;
  }
  get state() {
    return this.customState || this.editor.state;
  }
  get commands() {
    const { rawCommands, editor, state } = this;
    const { view } = editor;
    const { tr } = state;
    const props = this.buildProps(tr);
    return Object.fromEntries(
      Object.entries(rawCommands).map(([name2, command2]) => {
        const method = (...args) => {
          const callback = command2(...args)(props);
          if (!tr.getMeta("preventDispatch") && !this.hasCustomState) {
            view.dispatch(tr);
          }
          return callback;
        };
        return [name2, method];
      })
    );
  }
  get chain() {
    return () => this.createChain();
  }
  get can() {
    return () => this.createCan();
  }
  createChain(startTr, shouldDispatch = true) {
    const { rawCommands, editor, state } = this;
    const { view } = editor;
    const callbacks = [];
    const hasStartTransaction = !!startTr;
    const tr = startTr || state.tr;
    const run3 = () => {
      if (!hasStartTransaction && shouldDispatch && !tr.getMeta("preventDispatch") && !this.hasCustomState) {
        view.dispatch(tr);
      }
      return callbacks.every((callback) => callback === true);
    };
    const chain = {
      ...Object.fromEntries(
        Object.entries(rawCommands).map(([name2, command2]) => {
          const chainedCommand = (...args) => {
            const props = this.buildProps(tr, shouldDispatch);
            const callback = command2(...args)(props);
            callbacks.push(callback);
            return chain;
          };
          return [name2, chainedCommand];
        })
      ),
      run: run3
    };
    return chain;
  }
  createCan(startTr) {
    const { rawCommands, state } = this;
    const dispatch = false;
    const tr = startTr || state.tr;
    const props = this.buildProps(tr, dispatch);
    const formattedCommands = Object.fromEntries(
      Object.entries(rawCommands).map(([name2, command2]) => {
        return [name2, (...args) => command2(...args)({ ...props, dispatch: void 0 })];
      })
    );
    return {
      ...formattedCommands,
      chain: () => this.createChain(tr, dispatch)
    };
  }
  buildProps(tr, shouldDispatch = true) {
    const { rawCommands, editor, state } = this;
    const { view } = editor;
    const props = {
      tr,
      editor,
      view,
      state: createChainableState({
        state,
        transaction: tr
      }),
      dispatch: shouldDispatch ? () => void 0 : void 0,
      chain: () => this.createChain(tr, shouldDispatch),
      can: () => this.createCan(tr),
      get commands() {
        return Object.fromEntries(
          Object.entries(rawCommands).map(([name2, command2]) => {
            return [name2, (...args) => command2(...args)(props)];
          })
        );
      }
    };
    return props;
  }
};
var commands_exports = {};
__export3(commands_exports, {
  blur: () => blur,
  clearContent: () => clearContent,
  clearNodes: () => clearNodes,
  command: () => command,
  createParagraphNear: () => createParagraphNear,
  cut: () => cut,
  deleteCurrentNode: () => deleteCurrentNode,
  deleteNode: () => deleteNode,
  deleteRange: () => deleteRange,
  deleteSelection: () => deleteSelection,
  enter: () => enter,
  exitCode: () => exitCode,
  extendMarkRange: () => extendMarkRange,
  first: () => first,
  focus: () => focus,
  forEach: () => forEach,
  insertContent: () => insertContent,
  insertContentAt: () => insertContentAt,
  joinBackward: () => joinBackward,
  joinDown: () => joinDown,
  joinForward: () => joinForward,
  joinItemBackward: () => joinItemBackward,
  joinItemForward: () => joinItemForward,
  joinTextblockBackward: () => joinTextblockBackward,
  joinTextblockForward: () => joinTextblockForward,
  joinUp: () => joinUp,
  keyboardShortcut: () => keyboardShortcut,
  lift: () => lift,
  liftEmptyBlock: () => liftEmptyBlock,
  liftListItem: () => liftListItem,
  newlineInCode: () => newlineInCode,
  resetAttributes: () => resetAttributes,
  scrollIntoView: () => scrollIntoView,
  selectAll: () => selectAll,
  selectNodeBackward: () => selectNodeBackward,
  selectNodeForward: () => selectNodeForward,
  selectParentNode: () => selectParentNode,
  selectTextblockEnd: () => selectTextblockEnd,
  selectTextblockStart: () => selectTextblockStart,
  setContent: () => setContent,
  setMark: () => setMark,
  setMeta: () => setMeta,
  setNode: () => setNode,
  setNodeSelection: () => setNodeSelection,
  setTextDirection: () => setTextDirection,
  setTextSelection: () => setTextSelection,
  sinkListItem: () => sinkListItem,
  splitBlock: () => splitBlock,
  splitListItem: () => splitListItem,
  toggleList: () => toggleList,
  toggleMark: () => toggleMark,
  toggleNode: () => toggleNode,
  toggleWrap: () => toggleWrap,
  undoInputRule: () => undoInputRule,
  unsetAllMarks: () => unsetAllMarks,
  unsetMark: () => unsetMark,
  unsetTextDirection: () => unsetTextDirection,
  updateAttributes: () => updateAttributes,
  wrapIn: () => wrapIn,
  wrapInList: () => wrapInList
});
var blur = () => ({ editor, view }) => {
  requestAnimationFrame(() => {
    var _a4;
    if (!editor.isDestroyed) {
      ;
      view.dom.blur();
      (_a4 = window == null ? void 0 : window.getSelection()) == null ? void 0 : _a4.removeAllRanges();
    }
  });
  return true;
};
var clearContent = (emitUpdate = true) => ({ commands }) => {
  return commands.setContent("", { emitUpdate });
};
var clearNodes = () => ({ state, tr, dispatch }) => {
  const { selection } = tr;
  const { ranges } = selection;
  if (!dispatch) {
    return true;
  }
  ranges.forEach(({ $from, $to }) => {
    state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
      if (node.type.isText) {
        return;
      }
      const { doc, mapping } = tr;
      const $mappedFrom = doc.resolve(mapping.map(pos));
      const $mappedTo = doc.resolve(mapping.map(pos + node.nodeSize));
      const nodeRange = $mappedFrom.blockRange($mappedTo);
      if (!nodeRange) {
        return;
      }
      const targetLiftDepth = (0, import_transform.liftTarget)(nodeRange);
      if (node.type.isTextblock) {
        const { defaultType } = $mappedFrom.parent.contentMatchAt($mappedFrom.index());
        tr.setNodeMarkup(nodeRange.start, defaultType);
      }
      if (targetLiftDepth || targetLiftDepth === 0) {
        tr.lift(nodeRange, targetLiftDepth);
      }
    });
  });
  return true;
};
var command = (fn) => (props) => {
  return fn(props);
};
var createParagraphNear = () => ({ state, dispatch }) => {
  return (0, import_commands.createParagraphNear)(state, dispatch);
};
var cut = (originRange, targetPos) => ({ editor, tr }) => {
  const { state } = editor;
  const contentSlice = state.doc.slice(originRange.from, originRange.to);
  tr.deleteRange(originRange.from, originRange.to);
  const newPos = tr.mapping.map(targetPos);
  tr.insert(newPos, contentSlice.content);
  tr.setSelection(new import_state.TextSelection(tr.doc.resolve(Math.max(newPos - 1, 0))));
  return true;
};
var deleteCurrentNode = () => ({ tr, dispatch }) => {
  const { selection } = tr;
  const currentNode = selection.$anchor.node();
  if (currentNode.content.size > 0) {
    return false;
  }
  const $pos = tr.selection.$anchor;
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type === currentNode.type) {
      if (dispatch) {
        const from = $pos.before(depth);
        const to = $pos.after(depth);
        tr.delete(from, to).scrollIntoView();
      }
      return true;
    }
  }
  return false;
};
function getNodeType(nameOrType, schema) {
  if (typeof nameOrType === "string") {
    if (!schema.nodes[nameOrType]) {
      throw Error(`There is no node type named '${nameOrType}'. Maybe you forgot to add the extension?`);
    }
    return schema.nodes[nameOrType];
  }
  return nameOrType;
}
var deleteNode = (typeOrName) => ({ tr, state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema);
  const $pos = tr.selection.$anchor;
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type === type) {
      if (dispatch) {
        const from = $pos.before(depth);
        const to = $pos.after(depth);
        tr.delete(from, to).scrollIntoView();
      }
      return true;
    }
  }
  return false;
};
var deleteRange = (range) => ({ tr, dispatch }) => {
  const { from, to } = range;
  if (dispatch) {
    tr.delete(from, to);
  }
  return true;
};
var deleteSelection = () => ({ state, dispatch }) => {
  return (0, import_commands2.deleteSelection)(state, dispatch);
};
var enter = () => ({ commands }) => {
  return commands.keyboardShortcut("Enter");
};
var exitCode = () => ({ state, dispatch }) => {
  return (0, import_commands3.exitCode)(state, dispatch);
};
function isRegExp(value) {
  return Object.prototype.toString.call(value) === "[object RegExp]";
}
function objectIncludes(object1, object2, options = { strict: true }) {
  const keys = Object.keys(object2);
  if (!keys.length) {
    return true;
  }
  return keys.every((key) => {
    if (options.strict) {
      return object2[key] === object1[key];
    }
    if (isRegExp(object2[key])) {
      return object2[key].test(object1[key]);
    }
    return object2[key] === object1[key];
  });
}
function findMarkInSet(marks, type, attributes = {}) {
  return marks.find((item) => {
    return item.type === type && objectIncludes(
      // Only check equality for the attributes that are provided
      Object.fromEntries(Object.keys(attributes).map((k) => [k, item.attrs[k]])),
      attributes
    );
  });
}
function isMarkInSet(marks, type, attributes = {}) {
  return !!findMarkInSet(marks, type, attributes);
}
function getMarkRange($pos, type, attributes) {
  var _a4;
  if (!$pos || !type) {
    return;
  }
  let start = $pos.parent.childAfter($pos.parentOffset);
  if (!start.node || !start.node.marks.some((mark2) => mark2.type === type)) {
    start = $pos.parent.childBefore($pos.parentOffset);
  }
  if (!start.node || !start.node.marks.some((mark2) => mark2.type === type)) {
    return;
  }
  attributes = attributes || ((_a4 = start.node.marks[0]) == null ? void 0 : _a4.attrs);
  const mark = findMarkInSet([...start.node.marks], type, attributes);
  if (!mark) {
    return;
  }
  let startIndex = start.index;
  let startPos = $pos.start() + start.offset;
  let endIndex = startIndex + 1;
  let endPos = startPos + start.node.nodeSize;
  while (startIndex > 0 && isMarkInSet([...$pos.parent.child(startIndex - 1).marks], type, attributes)) {
    startIndex -= 1;
    startPos -= $pos.parent.child(startIndex).nodeSize;
  }
  while (endIndex < $pos.parent.childCount && isMarkInSet([...$pos.parent.child(endIndex).marks], type, attributes)) {
    endPos += $pos.parent.child(endIndex).nodeSize;
    endIndex += 1;
  }
  return {
    from: startPos,
    to: endPos
  };
}
function getMarkType(nameOrType, schema) {
  if (typeof nameOrType === "string") {
    if (!schema.marks[nameOrType]) {
      throw Error(`There is no mark type named '${nameOrType}'. Maybe you forgot to add the extension?`);
    }
    return schema.marks[nameOrType];
  }
  return nameOrType;
}
var extendMarkRange = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  const type = getMarkType(typeOrName, state.schema);
  const { doc, selection } = tr;
  const { $from, from, to } = selection;
  if (dispatch) {
    const range = getMarkRange($from, type, attributes);
    if (range && range.from <= from && range.to >= to) {
      const newSelection = import_state2.TextSelection.create(doc, range.from, range.to);
      tr.setSelection(newSelection);
    }
  }
  return true;
};
var first = (commands) => (props) => {
  const items = typeof commands === "function" ? commands(props) : commands;
  for (let i = 0; i < items.length; i += 1) {
    if (items[i](props)) {
      return true;
    }
  }
  return false;
};
function isTextSelection(value) {
  return value instanceof import_state3.TextSelection;
}
function minMax(value = 0, min = 0, max = 0) {
  return Math.min(Math.max(value, min), max);
}
function resolveFocusPosition(doc, position = null) {
  if (!position) {
    return null;
  }
  const selectionAtStart = import_state4.Selection.atStart(doc);
  const selectionAtEnd = import_state4.Selection.atEnd(doc);
  if (position === "start" || position === true) {
    return selectionAtStart;
  }
  if (position === "end") {
    return selectionAtEnd;
  }
  const minPos = selectionAtStart.from;
  const maxPos = selectionAtEnd.to;
  if (position === "all") {
    return import_state4.TextSelection.create(doc, minMax(0, minPos, maxPos), minMax(doc.content.size, minPos, maxPos));
  }
  return import_state4.TextSelection.create(doc, minMax(position, minPos, maxPos), minMax(position, minPos, maxPos));
}
function isAndroid() {
  return navigator.platform === "Android" || /android/i.test(navigator.userAgent);
}
function isiOS() {
  return ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) || // iPad on iOS 13 detection
  navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function isSafari() {
  return typeof navigator !== "undefined" ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : false;
}
var focus = (position = null, options = {}) => ({ editor, view, tr, dispatch }) => {
  options = {
    scrollIntoView: true,
    ...options
  };
  const delayedFocus = () => {
    if (isiOS() || isAndroid()) {
      ;
      view.dom.focus();
    }
    if (isSafari() && !isiOS() && !isAndroid()) {
      ;
      view.dom.focus({ preventScroll: true });
    }
    requestAnimationFrame(() => {
      if (!editor.isDestroyed) {
        view.focus();
        if (options == null ? void 0 : options.scrollIntoView) {
          editor.commands.scrollIntoView();
        }
      }
    });
  };
  if (view.hasFocus() && position === null || position === false) {
    return true;
  }
  if (dispatch && position === null && !isTextSelection(editor.state.selection)) {
    delayedFocus();
    return true;
  }
  const selection = resolveFocusPosition(tr.doc, position) || editor.state.selection;
  const isSameSelection = editor.state.selection.eq(selection);
  if (dispatch) {
    if (!isSameSelection) {
      tr.setSelection(selection);
    }
    if (isSameSelection && tr.storedMarks) {
      tr.setStoredMarks(tr.storedMarks);
    }
    delayedFocus();
  }
  return true;
};
var forEach = (items, fn) => (props) => {
  return items.every((item, index) => fn(item, { ...props, index }));
};
var insertContent = (value, options) => ({ tr, commands }) => {
  return commands.insertContentAt({ from: tr.selection.from, to: tr.selection.to }, value, options);
};
var removeWhitespaces = (node) => {
  const children = node.childNodes;
  for (let i = children.length - 1; i >= 0; i -= 1) {
    const child = children[i];
    if (child.nodeType === 3 && child.nodeValue && /^(\n\s\s|\n)$/.test(child.nodeValue)) {
      node.removeChild(child);
    } else if (child.nodeType === 1) {
      removeWhitespaces(child);
    }
  }
  return node;
};
function elementFromString(value) {
  if (typeof window === "undefined") {
    throw new Error("[tiptap error]: there is no window object available, so this function cannot be used");
  }
  const wrappedValue = `<body>${value}</body>`;
  const html = new window.DOMParser().parseFromString(wrappedValue, "text/html").body;
  return removeWhitespaces(html);
}
function createNodeFromContent(content, schema, options) {
  if (content instanceof import_model2.Node || content instanceof import_model2.Fragment) {
    return content;
  }
  options = {
    slice: true,
    parseOptions: {},
    ...options
  };
  const isJSONContent = typeof content === "object" && content !== null;
  const isTextContent = typeof content === "string";
  if (isJSONContent) {
    try {
      const isArrayContent = Array.isArray(content) && content.length > 0;
      if (isArrayContent) {
        return import_model2.Fragment.fromArray(content.map((item) => schema.nodeFromJSON(item)));
      }
      const node = schema.nodeFromJSON(content);
      if (options.errorOnInvalidContent) {
        node.check();
      }
      return node;
    } catch (error) {
      if (options.errorOnInvalidContent) {
        throw new Error("[tiptap error]: Invalid JSON content", { cause: error });
      }
      console.warn("[tiptap warn]: Invalid content.", "Passed value:", content, "Error:", error);
      return createNodeFromContent("", schema, options);
    }
  }
  if (isTextContent) {
    if (options.errorOnInvalidContent) {
      let hasInvalidContent = false;
      let invalidContent = "";
      const contentCheckSchema = new import_model2.Schema({
        topNode: schema.spec.topNode,
        marks: schema.spec.marks,
        // Prosemirror's schemas are executed such that: the last to execute, matches last
        // This means that we can add a catch-all node at the end of the schema to catch any content that we don't know how to handle
        nodes: schema.spec.nodes.append({
          __tiptap__private__unknown__catch__all__node: {
            content: "inline*",
            group: "block",
            parseDOM: [
              {
                tag: "*",
                getAttrs: (e) => {
                  hasInvalidContent = true;
                  invalidContent = typeof e === "string" ? e : e.outerHTML;
                  return null;
                }
              }
            ]
          }
        })
      });
      if (options.slice) {
        import_model2.DOMParser.fromSchema(contentCheckSchema).parseSlice(elementFromString(content), options.parseOptions);
      } else {
        import_model2.DOMParser.fromSchema(contentCheckSchema).parse(elementFromString(content), options.parseOptions);
      }
      if (options.errorOnInvalidContent && hasInvalidContent) {
        throw new Error("[tiptap error]: Invalid HTML content", {
          cause: new Error(`Invalid element found: ${invalidContent}`)
        });
      }
    }
    const parser2 = import_model2.DOMParser.fromSchema(schema);
    if (options.slice) {
      return parser2.parseSlice(elementFromString(content), options.parseOptions).content;
    }
    return parser2.parse(elementFromString(content), options.parseOptions);
  }
  return createNodeFromContent("", schema, options);
}
function selectionToInsertionEnd(tr, startLen, bias) {
  const last = tr.steps.length - 1;
  if (last < startLen) {
    return;
  }
  const step = tr.steps[last];
  if (!(step instanceof import_transform2.ReplaceStep || step instanceof import_transform2.ReplaceAroundStep)) {
    return;
  }
  const map = tr.mapping.maps[last];
  let end = 0;
  map.forEach((_from, _to, _newFrom, newTo) => {
    if (end === 0) {
      end = newTo;
    }
  });
  tr.setSelection(import_state5.Selection.near(tr.doc.resolve(end), bias));
}
var isFragment = (nodeOrFragment) => {
  return !("type" in nodeOrFragment);
};
var insertContentAt = (position, value, options) => ({ tr, dispatch, editor }) => {
  var _a4;
  if (dispatch) {
    options = {
      parseOptions: editor.options.parseOptions,
      updateSelection: true,
      applyInputRules: false,
      applyPasteRules: false,
      ...options
    };
    let content;
    const emitContentError = (error) => {
      editor.emit("contentError", {
        editor,
        error,
        disableCollaboration: () => {
          if ("collaboration" in editor.storage && typeof editor.storage.collaboration === "object" && editor.storage.collaboration) {
            ;
            editor.storage.collaboration.isDisabled = true;
          }
        }
      });
    };
    const parseOptions = {
      preserveWhitespace: "full",
      ...options.parseOptions
    };
    if (!options.errorOnInvalidContent && !editor.options.enableContentCheck && editor.options.emitContentError) {
      try {
        createNodeFromContent(value, editor.schema, {
          parseOptions,
          errorOnInvalidContent: true
        });
      } catch (e) {
        emitContentError(e);
      }
    }
    try {
      content = createNodeFromContent(value, editor.schema, {
        parseOptions,
        errorOnInvalidContent: (_a4 = options.errorOnInvalidContent) != null ? _a4 : editor.options.enableContentCheck
      });
    } catch (e) {
      emitContentError(e);
      return false;
    }
    let { from, to } = typeof position === "number" ? { from: position, to: position } : { from: position.from, to: position.to };
    let isOnlyTextContent = true;
    let isOnlyBlockContent = true;
    const nodes = isFragment(content) ? content : [content];
    nodes.forEach((node) => {
      node.check();
      isOnlyTextContent = isOnlyTextContent ? node.isText && node.marks.length === 0 : false;
      isOnlyBlockContent = isOnlyBlockContent ? node.isBlock : false;
    });
    if (from === to && isOnlyBlockContent) {
      const { parent } = tr.doc.resolve(from);
      const isEmptyTextBlock = parent.isTextblock && !parent.type.spec.code && !parent.childCount;
      if (isEmptyTextBlock) {
        from -= 1;
        to += 1;
      }
    }
    let newContent;
    if (isOnlyTextContent) {
      if (Array.isArray(value)) {
        newContent = value.map((v) => v.text || "").join("");
      } else if (value instanceof import_model.Fragment) {
        let text = "";
        value.forEach((node) => {
          if (node.text) {
            text += node.text;
          }
        });
        newContent = text;
      } else if (typeof value === "object" && !!value && !!value.text) {
        newContent = value.text;
      } else {
        newContent = value;
      }
      tr.insertText(newContent, from, to);
    } else {
      newContent = content;
      const $from = tr.doc.resolve(from);
      const $fromNode = $from.node();
      const fromSelectionAtStart = $from.parentOffset === 0;
      const isTextSelection2 = $fromNode.isText || $fromNode.isTextblock;
      const hasContent = $fromNode.content.size > 0;
      if (fromSelectionAtStart && isTextSelection2 && hasContent) {
        from = Math.max(0, from - 1);
      }
      tr.replaceWith(from, to, newContent);
    }
    if (options.updateSelection) {
      selectionToInsertionEnd(tr, tr.steps.length - 1, -1);
    }
    if (options.applyInputRules) {
      tr.setMeta("applyInputRules", { from, text: newContent });
    }
    if (options.applyPasteRules) {
      tr.setMeta("applyPasteRules", { from, text: newContent });
    }
  }
  return true;
};
var joinUp = () => ({ state, dispatch }) => {
  return (0, import_commands4.joinUp)(state, dispatch);
};
var joinDown = () => ({ state, dispatch }) => {
  return (0, import_commands4.joinDown)(state, dispatch);
};
var joinBackward = () => ({ state, dispatch }) => {
  return (0, import_commands4.joinBackward)(state, dispatch);
};
var joinForward = () => ({ state, dispatch }) => {
  return (0, import_commands4.joinForward)(state, dispatch);
};
var joinItemBackward = () => ({ state, dispatch, tr }) => {
  try {
    const point = (0, import_transform3.joinPoint)(state.doc, state.selection.$from.pos, -1);
    if (point === null || point === void 0) {
      return false;
    }
    tr.join(point, 2);
    if (dispatch) {
      dispatch(tr);
    }
    return true;
  } catch {
    return false;
  }
};
var joinItemForward = () => ({ state, dispatch, tr }) => {
  try {
    const point = (0, import_transform4.joinPoint)(state.doc, state.selection.$from.pos, 1);
    if (point === null || point === void 0) {
      return false;
    }
    tr.join(point, 2);
    if (dispatch) {
      dispatch(tr);
    }
    return true;
  } catch {
    return false;
  }
};
var joinTextblockBackward = () => ({ state, dispatch }) => {
  return (0, import_commands5.joinTextblockBackward)(state, dispatch);
};
var joinTextblockForward = () => ({ state, dispatch }) => {
  return (0, import_commands6.joinTextblockForward)(state, dispatch);
};
function isMacOS() {
  return typeof navigator !== "undefined" ? /Mac/.test(navigator.platform) : false;
}
function normalizeKeyName(name2) {
  const parts = name2.split(/-(?!$)/);
  let result = parts[parts.length - 1];
  if (result === "Space") {
    result = " ";
  }
  let alt;
  let ctrl;
  let shift;
  let meta;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod)) {
      meta = true;
    } else if (/^a(lt)?$/i.test(mod)) {
      alt = true;
    } else if (/^(c|ctrl|control)$/i.test(mod)) {
      ctrl = true;
    } else if (/^s(hift)?$/i.test(mod)) {
      shift = true;
    } else if (/^mod$/i.test(mod)) {
      if (isiOS() || isMacOS()) {
        meta = true;
      } else {
        ctrl = true;
      }
    } else {
      throw new Error(`Unrecognized modifier name: ${mod}`);
    }
  }
  if (alt) {
    result = `Alt-${result}`;
  }
  if (ctrl) {
    result = `Ctrl-${result}`;
  }
  if (meta) {
    result = `Meta-${result}`;
  }
  if (shift) {
    result = `Shift-${result}`;
  }
  return result;
}
var keyboardShortcut = (name2) => ({ editor, view, tr, dispatch }) => {
  const keys = normalizeKeyName(name2).split(/-(?!$)/);
  const key = keys.find((item) => !["Alt", "Ctrl", "Meta", "Shift"].includes(item));
  const event = new KeyboardEvent("keydown", {
    key: key === "Space" ? " " : key,
    altKey: keys.includes("Alt"),
    ctrlKey: keys.includes("Ctrl"),
    metaKey: keys.includes("Meta"),
    shiftKey: keys.includes("Shift"),
    bubbles: true,
    cancelable: true
  });
  const capturedTransaction = editor.captureTransaction(() => {
    view.someProp("handleKeyDown", (f) => f(view, event));
  });
  capturedTransaction == null ? void 0 : capturedTransaction.steps.forEach((step) => {
    const newStep = step.map(tr.mapping);
    if (newStep && dispatch) {
      tr.maybeStep(newStep);
    }
  });
  return true;
};
function isNodeActive(state, typeOrName, attributes = {}) {
  const { from, to, empty } = state.selection;
  const type = typeOrName ? getNodeType(typeOrName, state.schema) : null;
  const nodeRanges = [];
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isText) {
      return;
    }
    const relativeFrom = Math.max(from, pos);
    const relativeTo = Math.min(to, pos + node.nodeSize);
    nodeRanges.push({
      node,
      from: relativeFrom,
      to: relativeTo
    });
  });
  const selectionRange = to - from;
  const matchedNodeRanges = nodeRanges.filter((nodeRange) => {
    if (!type) {
      return true;
    }
    return type.name === nodeRange.node.type.name;
  }).filter((nodeRange) => objectIncludes(nodeRange.node.attrs, attributes, { strict: false }));
  if (empty) {
    return !!matchedNodeRanges.length;
  }
  const range = matchedNodeRanges.reduce((sum, nodeRange) => sum + nodeRange.to - nodeRange.from, 0);
  return range >= selectionRange;
}
var lift = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema);
  const isActive2 = isNodeActive(state, type, attributes);
  if (!isActive2) {
    return false;
  }
  return (0, import_commands7.lift)(state, dispatch);
};
var liftEmptyBlock = () => ({ state, dispatch }) => {
  return (0, import_commands8.liftEmptyBlock)(state, dispatch);
};
var liftListItem = (typeOrName) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema);
  return (0, import_schema_list.liftListItem)(type)(state, dispatch);
};
var newlineInCode = () => ({ state, dispatch }) => {
  return (0, import_commands9.newlineInCode)(state, dispatch);
};
function getSchemaTypeNameByName(name2, schema) {
  if (schema.nodes[name2]) {
    return "node";
  }
  if (schema.marks[name2]) {
    return "mark";
  }
  return null;
}
function deleteProps(obj, propOrProps) {
  const props = typeof propOrProps === "string" ? [propOrProps] : propOrProps;
  return Object.keys(obj).reduce((newObj, prop) => {
    if (!props.includes(prop)) {
      newObj[prop] = obj[prop];
    }
    return newObj;
  }, {});
}
var resetAttributes = (typeOrName, attributes) => ({ tr, state, dispatch }) => {
  let nodeType = null;
  let markType = null;
  const schemaType = getSchemaTypeNameByName(
    typeof typeOrName === "string" ? typeOrName : typeOrName.name,
    state.schema
  );
  if (!schemaType) {
    return false;
  }
  if (schemaType === "node") {
    nodeType = getNodeType(typeOrName, state.schema);
  }
  if (schemaType === "mark") {
    markType = getMarkType(typeOrName, state.schema);
  }
  let canReset = false;
  tr.selection.ranges.forEach((range) => {
    state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
      if (nodeType && nodeType === node.type) {
        canReset = true;
        if (dispatch) {
          tr.setNodeMarkup(pos, void 0, deleteProps(node.attrs, attributes));
        }
      }
      if (markType && node.marks.length) {
        node.marks.forEach((mark) => {
          if (markType === mark.type) {
            canReset = true;
            if (dispatch) {
              tr.addMark(pos, pos + node.nodeSize, markType.create(deleteProps(mark.attrs, attributes)));
            }
          }
        });
      }
    });
  });
  return canReset;
};
var scrollIntoView = () => ({ tr, dispatch }) => {
  if (dispatch) {
    tr.scrollIntoView();
  }
  return true;
};
var selectAll = () => ({ tr, dispatch }) => {
  if (dispatch) {
    const selection = new import_state6.AllSelection(tr.doc);
    tr.setSelection(selection);
  }
  return true;
};
var selectNodeBackward = () => ({ state, dispatch }) => {
  return (0, import_commands10.selectNodeBackward)(state, dispatch);
};
var selectNodeForward = () => ({ state, dispatch }) => {
  return (0, import_commands11.selectNodeForward)(state, dispatch);
};
var selectParentNode = () => ({ state, dispatch }) => {
  return (0, import_commands12.selectParentNode)(state, dispatch);
};
var selectTextblockEnd = () => ({ state, dispatch }) => {
  return (0, import_commands13.selectTextblockEnd)(state, dispatch);
};
var selectTextblockStart = () => ({ state, dispatch }) => {
  return (0, import_commands14.selectTextblockStart)(state, dispatch);
};
function createDocument(content, schema, parseOptions = {}, options = {}) {
  return createNodeFromContent(content, schema, {
    slice: false,
    parseOptions,
    errorOnInvalidContent: options.errorOnInvalidContent
  });
}
var setContent = (content, { errorOnInvalidContent, emitUpdate = true, parseOptions = {} } = {}) => ({ editor, tr, dispatch, commands }) => {
  const { doc } = tr;
  if (parseOptions.preserveWhitespace !== "full") {
    const document2 = createDocument(content, editor.schema, parseOptions, {
      errorOnInvalidContent: errorOnInvalidContent != null ? errorOnInvalidContent : editor.options.enableContentCheck
    });
    if (dispatch) {
      tr.replaceWith(0, doc.content.size, document2).setMeta("preventUpdate", !emitUpdate);
    }
    return true;
  }
  if (dispatch) {
    tr.setMeta("preventUpdate", !emitUpdate);
  }
  return commands.insertContentAt({ from: 0, to: doc.content.size }, content, {
    parseOptions,
    errorOnInvalidContent: errorOnInvalidContent != null ? errorOnInvalidContent : editor.options.enableContentCheck
  });
};
function getMarkAttributes(state, typeOrName) {
  const type = getMarkType(typeOrName, state.schema);
  const { from, to, empty } = state.selection;
  const marks = [];
  if (empty) {
    if (state.storedMarks) {
      marks.push(...state.storedMarks);
    }
    marks.push(...state.selection.$head.marks());
  } else {
    state.doc.nodesBetween(from, to, (node) => {
      marks.push(...node.marks);
    });
  }
  const mark = marks.find((markItem) => markItem.type.name === type.name);
  if (!mark) {
    return {};
  }
  return { ...mark.attrs };
}
function combineTransactionSteps(oldDoc, transactions) {
  const transform = new import_transform5.Transform(oldDoc);
  transactions.forEach((transaction) => {
    transaction.steps.forEach((step) => {
      transform.step(step);
    });
  });
  return transform;
}
function defaultBlockAt(match) {
  for (let i = 0; i < match.edgeCount; i += 1) {
    const { type } = match.edge(i);
    if (type.isTextblock && !type.hasRequiredAttrs()) {
      return type;
    }
  }
  return null;
}
function findParentNodeClosestToPos($pos, predicate2) {
  for (let i = $pos.depth; i > 0; i -= 1) {
    const node = $pos.node(i);
    if (predicate2(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node
      };
    }
  }
}
function findParentNode(predicate2) {
  return (selection) => findParentNodeClosestToPos(selection.$from, predicate2);
}
function getExtensionField(extension, field, context) {
  if (extension.config[field] === void 0 && extension.parent) {
    return getExtensionField(extension.parent, field, context);
  }
  if (typeof extension.config[field] === "function") {
    const value = extension.config[field].bind({
      ...context,
      parent: extension.parent ? getExtensionField(extension.parent, field, context) : null
    });
    return value;
  }
  return extension.config[field];
}
function flattenExtensions(extensions) {
  return extensions.map((extension) => {
    const context = {
      name: extension.name,
      options: extension.options,
      storage: extension.storage
    };
    const addExtensions = getExtensionField(extension, "addExtensions", context);
    if (addExtensions) {
      return [extension, ...flattenExtensions(addExtensions())];
    }
    return extension;
  }).flat(10);
}
function getHTMLFromFragment(fragment, schema) {
  const documentFragment = import_model4.DOMSerializer.fromSchema(schema).serializeFragment(fragment);
  const temporaryDocument = document.implementation.createHTMLDocument();
  const container = temporaryDocument.createElement("div");
  container.appendChild(documentFragment);
  return container.innerHTML;
}
function isFunction(value) {
  return typeof value === "function";
}
function callOrReturn(value, context = void 0, ...props) {
  if (isFunction(value)) {
    if (context) {
      return value.bind(context)(...props);
    }
    return value(...props);
  }
  return value;
}
function isEmptyObject(value = {}) {
  return Object.keys(value).length === 0 && value.constructor === Object;
}
function splitExtensions(extensions) {
  const baseExtensions = extensions.filter((extension) => extension.type === "extension");
  const nodeExtensions = extensions.filter((extension) => extension.type === "node");
  const markExtensions = extensions.filter((extension) => extension.type === "mark");
  return {
    baseExtensions,
    nodeExtensions,
    markExtensions
  };
}
function getAttributesFromExtensions(extensions) {
  const extensionAttributes = [];
  const { nodeExtensions, markExtensions } = splitExtensions(extensions);
  const nodeAndMarkExtensions = [...nodeExtensions, ...markExtensions];
  const defaultAttribute = {
    default: null,
    validate: void 0,
    rendered: true,
    renderHTML: null,
    parseHTML: null,
    keepOnSplit: true,
    isRequired: false
  };
  extensions.forEach((extension) => {
    const context = {
      name: extension.name,
      options: extension.options,
      storage: extension.storage,
      extensions: nodeAndMarkExtensions
    };
    const addGlobalAttributes = getExtensionField(
      extension,
      "addGlobalAttributes",
      context
    );
    if (!addGlobalAttributes) {
      return;
    }
    const globalAttributes = addGlobalAttributes();
    globalAttributes.forEach((globalAttribute) => {
      globalAttribute.types.forEach((type) => {
        Object.entries(globalAttribute.attributes).forEach(([name2, attribute]) => {
          extensionAttributes.push({
            type,
            name: name2,
            attribute: {
              ...defaultAttribute,
              ...attribute
            }
          });
        });
      });
    });
  });
  nodeAndMarkExtensions.forEach((extension) => {
    const context = {
      name: extension.name,
      options: extension.options,
      storage: extension.storage
    };
    const addAttributes = getExtensionField(
      extension,
      "addAttributes",
      context
    );
    if (!addAttributes) {
      return;
    }
    const attributes = addAttributes();
    Object.entries(attributes).forEach(([name2, attribute]) => {
      const mergedAttr = {
        ...defaultAttribute,
        ...attribute
      };
      if (typeof (mergedAttr == null ? void 0 : mergedAttr.default) === "function") {
        mergedAttr.default = mergedAttr.default();
      }
      if ((mergedAttr == null ? void 0 : mergedAttr.isRequired) && (mergedAttr == null ? void 0 : mergedAttr.default) === void 0) {
        delete mergedAttr.default;
      }
      extensionAttributes.push({
        type: extension.name,
        name: name2,
        attribute: mergedAttr
      });
    });
  });
  return extensionAttributes;
}
function mergeAttributes(...objects) {
  return objects.filter((item) => !!item).reduce((items, item) => {
    const mergedAttributes = { ...items };
    Object.entries(item).forEach(([key, value]) => {
      const exists = mergedAttributes[key];
      if (!exists) {
        mergedAttributes[key] = value;
        return;
      }
      if (key === "class") {
        const valueClasses = value ? String(value).split(" ") : [];
        const existingClasses = mergedAttributes[key] ? mergedAttributes[key].split(" ") : [];
        const insertClasses = valueClasses.filter((valueClass) => !existingClasses.includes(valueClass));
        mergedAttributes[key] = [...existingClasses, ...insertClasses].join(" ");
      } else if (key === "style") {
        const newStyles = value ? value.split(";").map((style2) => style2.trim()).filter(Boolean) : [];
        const existingStyles = mergedAttributes[key] ? mergedAttributes[key].split(";").map((style2) => style2.trim()).filter(Boolean) : [];
        const styleMap = /* @__PURE__ */ new Map();
        existingStyles.forEach((style2) => {
          const [property, val] = style2.split(":").map((part) => part.trim());
          styleMap.set(property, val);
        });
        newStyles.forEach((style2) => {
          const [property, val] = style2.split(":").map((part) => part.trim());
          styleMap.set(property, val);
        });
        mergedAttributes[key] = Array.from(styleMap.entries()).map(([property, val]) => `${property}: ${val}`).join("; ");
      } else {
        mergedAttributes[key] = value;
      }
    });
    return mergedAttributes;
  }, {});
}
function getRenderedAttributes(nodeOrMark, extensionAttributes) {
  return extensionAttributes.filter((attribute) => attribute.type === nodeOrMark.type.name).filter((item) => item.attribute.rendered).map((item) => {
    if (!item.attribute.renderHTML) {
      return {
        [item.name]: nodeOrMark.attrs[item.name]
      };
    }
    return item.attribute.renderHTML(nodeOrMark.attrs) || {};
  }).reduce((attributes, attribute) => mergeAttributes(attributes, attribute), {});
}
function fromString(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (value.match(/^[+-]?(?:\d*\.)?\d+$/)) {
    return Number(value);
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return value;
}
function injectExtensionAttributesToParseRule(parseRule, extensionAttributes) {
  if ("style" in parseRule) {
    return parseRule;
  }
  return {
    ...parseRule,
    getAttrs: (node) => {
      const oldAttributes = parseRule.getAttrs ? parseRule.getAttrs(node) : parseRule.attrs;
      if (oldAttributes === false) {
        return false;
      }
      const newAttributes = extensionAttributes.reduce((items, item) => {
        const value = item.attribute.parseHTML ? item.attribute.parseHTML(node) : fromString(node.getAttribute(item.name));
        if (value === null || value === void 0) {
          return items;
        }
        return {
          ...items,
          [item.name]: value
        };
      }, {});
      return { ...oldAttributes, ...newAttributes };
    }
  };
}
function cleanUpSchemaItem(data) {
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(data).filter(([key, value]) => {
      if (key === "attrs" && isEmptyObject(value)) {
        return false;
      }
      return value !== null && value !== void 0;
    })
  );
}
function buildAttributeSpec(extensionAttribute) {
  var _a4, _b;
  const spec = {};
  if (!((_a4 = extensionAttribute == null ? void 0 : extensionAttribute.attribute) == null ? void 0 : _a4.isRequired) && "default" in ((extensionAttribute == null ? void 0 : extensionAttribute.attribute) || {})) {
    spec.default = extensionAttribute.attribute.default;
  }
  if (((_b = extensionAttribute == null ? void 0 : extensionAttribute.attribute) == null ? void 0 : _b.validate) !== void 0) {
    spec.validate = extensionAttribute.attribute.validate;
  }
  return [extensionAttribute.name, spec];
}
function getSchemaByResolvedExtensions(extensions, editor) {
  var _a4;
  const allAttributes = getAttributesFromExtensions(extensions);
  const { nodeExtensions, markExtensions } = splitExtensions(extensions);
  const topNode = (_a4 = nodeExtensions.find((extension) => getExtensionField(extension, "topNode"))) == null ? void 0 : _a4.name;
  const nodes = Object.fromEntries(
    nodeExtensions.map((extension) => {
      const extensionAttributes = allAttributes.filter((attribute) => attribute.type === extension.name);
      const context = {
        name: extension.name,
        options: extension.options,
        storage: extension.storage,
        editor
      };
      const extraNodeFields = extensions.reduce((fields, e) => {
        const extendNodeSchema = getExtensionField(e, "extendNodeSchema", context);
        return {
          ...fields,
          ...extendNodeSchema ? extendNodeSchema(extension) : {}
        };
      }, {});
      const schema = cleanUpSchemaItem({
        ...extraNodeFields,
        content: callOrReturn(getExtensionField(extension, "content", context)),
        marks: callOrReturn(getExtensionField(extension, "marks", context)),
        group: callOrReturn(getExtensionField(extension, "group", context)),
        inline: callOrReturn(getExtensionField(extension, "inline", context)),
        atom: callOrReturn(getExtensionField(extension, "atom", context)),
        selectable: callOrReturn(getExtensionField(extension, "selectable", context)),
        draggable: callOrReturn(getExtensionField(extension, "draggable", context)),
        code: callOrReturn(getExtensionField(extension, "code", context)),
        whitespace: callOrReturn(getExtensionField(extension, "whitespace", context)),
        linebreakReplacement: callOrReturn(
          getExtensionField(extension, "linebreakReplacement", context)
        ),
        defining: callOrReturn(getExtensionField(extension, "defining", context)),
        isolating: callOrReturn(getExtensionField(extension, "isolating", context)),
        attrs: Object.fromEntries(extensionAttributes.map(buildAttributeSpec))
      });
      const parseHTML = callOrReturn(getExtensionField(extension, "parseHTML", context));
      if (parseHTML) {
        schema.parseDOM = parseHTML.map(
          (parseRule) => injectExtensionAttributesToParseRule(parseRule, extensionAttributes)
        );
      }
      const renderHTML = getExtensionField(extension, "renderHTML", context);
      if (renderHTML) {
        schema.toDOM = (node) => renderHTML({
          node,
          HTMLAttributes: getRenderedAttributes(node, extensionAttributes)
        });
      }
      const renderText = getExtensionField(extension, "renderText", context);
      if (renderText) {
        schema.toText = renderText;
      }
      return [extension.name, schema];
    })
  );
  const marks = Object.fromEntries(
    markExtensions.map((extension) => {
      const extensionAttributes = allAttributes.filter((attribute) => attribute.type === extension.name);
      const context = {
        name: extension.name,
        options: extension.options,
        storage: extension.storage,
        editor
      };
      const extraMarkFields = extensions.reduce((fields, e) => {
        const extendMarkSchema = getExtensionField(e, "extendMarkSchema", context);
        return {
          ...fields,
          ...extendMarkSchema ? extendMarkSchema(extension) : {}
        };
      }, {});
      const schema = cleanUpSchemaItem({
        ...extraMarkFields,
        inclusive: callOrReturn(getExtensionField(extension, "inclusive", context)),
        excludes: callOrReturn(getExtensionField(extension, "excludes", context)),
        group: callOrReturn(getExtensionField(extension, "group", context)),
        spanning: callOrReturn(getExtensionField(extension, "spanning", context)),
        code: callOrReturn(getExtensionField(extension, "code", context)),
        attrs: Object.fromEntries(extensionAttributes.map(buildAttributeSpec))
      });
      const parseHTML = callOrReturn(getExtensionField(extension, "parseHTML", context));
      if (parseHTML) {
        schema.parseDOM = parseHTML.map(
          (parseRule) => injectExtensionAttributesToParseRule(parseRule, extensionAttributes)
        );
      }
      const renderHTML = getExtensionField(extension, "renderHTML", context);
      if (renderHTML) {
        schema.toDOM = (mark) => renderHTML({
          mark,
          HTMLAttributes: getRenderedAttributes(mark, extensionAttributes)
        });
      }
      return [extension.name, schema];
    })
  );
  return new import_model5.Schema({
    topNode,
    nodes,
    marks
  });
}
function findDuplicates(items) {
  const filtered = items.filter((el, index) => items.indexOf(el) !== index);
  return Array.from(new Set(filtered));
}
function sortExtensions(extensions) {
  const defaultPriority = 100;
  return extensions.sort((a, b) => {
    const priorityA = getExtensionField(a, "priority") || defaultPriority;
    const priorityB = getExtensionField(b, "priority") || defaultPriority;
    if (priorityA > priorityB) {
      return -1;
    }
    if (priorityA < priorityB) {
      return 1;
    }
    return 0;
  });
}
function resolveExtensions(extensions) {
  const resolvedExtensions = sortExtensions(flattenExtensions(extensions));
  const duplicatedNames = findDuplicates(resolvedExtensions.map((extension) => extension.name));
  if (duplicatedNames.length) {
    console.warn(
      `[tiptap warn]: Duplicate extension names found: [${duplicatedNames.map((item) => `'${item}'`).join(", ")}]. This can lead to issues.`
    );
  }
  return resolvedExtensions;
}
function getTextBetween(startNode, range, options) {
  const { from, to } = range;
  const { blockSeparator = "\n\n", textSerializers = {} } = options || {};
  let text = "";
  startNode.nodesBetween(from, to, (node, pos, parent, index) => {
    var _a4;
    if (node.isBlock && pos > from) {
      text += blockSeparator;
    }
    const textSerializer = textSerializers == null ? void 0 : textSerializers[node.type.name];
    if (textSerializer) {
      if (parent) {
        text += textSerializer({
          node,
          pos,
          parent,
          index,
          range
        });
      }
      return false;
    }
    if (node.isText) {
      text += (_a4 = node == null ? void 0 : node.text) == null ? void 0 : _a4.slice(Math.max(from, pos) - pos, to - pos);
    }
  });
  return text;
}
function getTextSerializersFromSchema(schema) {
  return Object.fromEntries(
    Object.entries(schema.nodes).filter(([, node]) => node.spec.toText).map(([name2, node]) => [name2, node.spec.toText])
  );
}
function removeDuplicates(array, by = JSON.stringify) {
  const seen = {};
  return array.filter((item) => {
    const key = by(item);
    return Object.prototype.hasOwnProperty.call(seen, key) ? false : seen[key] = true;
  });
}
function simplifyChangedRanges(changes) {
  const uniqueChanges = removeDuplicates(changes);
  return uniqueChanges.length === 1 ? uniqueChanges : uniqueChanges.filter((change, index) => {
    const rest = uniqueChanges.filter((_, i) => i !== index);
    return !rest.some((otherChange) => {
      return change.oldRange.from >= otherChange.oldRange.from && change.oldRange.to <= otherChange.oldRange.to && change.newRange.from >= otherChange.newRange.from && change.newRange.to <= otherChange.newRange.to;
    });
  });
}
function getChangedRanges(transform) {
  const { mapping, steps } = transform;
  const changes = [];
  mapping.maps.forEach((stepMap, index) => {
    const ranges = [];
    if (!stepMap.ranges.length) {
      const { from, to } = steps[index];
      if (from === void 0 || to === void 0) {
        return;
      }
      ranges.push({ from, to });
    } else {
      stepMap.forEach((from, to) => {
        ranges.push({ from, to });
      });
    }
    ranges.forEach(({ from, to }) => {
      const newStart = mapping.slice(index).map(from, -1);
      const newEnd = mapping.slice(index).map(to);
      const oldStart = mapping.invert().map(newStart, -1);
      const oldEnd = mapping.invert().map(newEnd);
      changes.push({
        oldRange: {
          from: oldStart,
          to: oldEnd
        },
        newRange: {
          from: newStart,
          to: newEnd
        }
      });
    });
  });
  return simplifyChangedRanges(changes);
}
function getSchemaTypeByName(name2, schema) {
  return schema.nodes[name2] || schema.marks[name2] || null;
}
function getSplittedAttributes(extensionAttributes, typeName, attributes) {
  return Object.fromEntries(
    Object.entries(attributes).filter(([name2]) => {
      const extensionAttribute = extensionAttributes.find((item) => {
        return item.type === typeName && item.name === name2;
      });
      if (!extensionAttribute) {
        return false;
      }
      return extensionAttribute.attribute.keepOnSplit;
    })
  );
}
var getTextContentFromNodes = ($from, maxMatch = 500) => {
  let textBefore = "";
  const sliceEndPos = $from.parentOffset;
  $from.parent.nodesBetween(Math.max(0, sliceEndPos - maxMatch), sliceEndPos, (node, pos, parent, index) => {
    var _a4, _b;
    const chunk = ((_b = (_a4 = node.type.spec).toText) == null ? void 0 : _b.call(_a4, {
      node,
      pos,
      parent,
      index
    })) || node.textContent || "%leaf%";
    textBefore += node.isAtom && !node.isText ? chunk : chunk.slice(0, Math.max(0, sliceEndPos - pos));
  });
  return textBefore;
};
function isMarkActive(state, typeOrName, attributes = {}) {
  const { empty, ranges } = state.selection;
  const type = typeOrName ? getMarkType(typeOrName, state.schema) : null;
  if (empty) {
    return !!(state.storedMarks || state.selection.$from.marks()).filter((mark) => {
      if (!type) {
        return true;
      }
      return type.name === mark.type.name;
    }).find((mark) => objectIncludes(mark.attrs, attributes, { strict: false }));
  }
  let selectionRange = 0;
  const markRanges = [];
  ranges.forEach(({ $from, $to }) => {
    const from = $from.pos;
    const to = $to.pos;
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isText && !node.marks.length) {
        return;
      }
      const relativeFrom = Math.max(from, pos);
      const relativeTo = Math.min(to, pos + node.nodeSize);
      const range2 = relativeTo - relativeFrom;
      selectionRange += range2;
      markRanges.push(
        ...node.marks.map((mark) => ({
          mark,
          from: relativeFrom,
          to: relativeTo
        }))
      );
    });
  });
  if (selectionRange === 0) {
    return false;
  }
  const matchedRange = markRanges.filter((markRange) => {
    if (!type) {
      return true;
    }
    return type.name === markRange.mark.type.name;
  }).filter((markRange) => objectIncludes(markRange.mark.attrs, attributes, { strict: false })).reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);
  const excludedRange = markRanges.filter((markRange) => {
    if (!type) {
      return true;
    }
    return markRange.mark.type !== type && markRange.mark.type.excludes(type);
  }).reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);
  const range = matchedRange > 0 ? matchedRange + excludedRange : matchedRange;
  return range >= selectionRange;
}
function isExtensionRulesEnabled(extension, enabled) {
  if (Array.isArray(enabled)) {
    return enabled.some((enabledExtension) => {
      const name2 = typeof enabledExtension === "string" ? enabledExtension : enabledExtension.name;
      return name2 === extension.name;
    });
  }
  return enabled;
}
function isList(name2, extensions) {
  const { nodeExtensions } = splitExtensions(extensions);
  const extension = nodeExtensions.find((item) => item.name === name2);
  if (!extension) {
    return false;
  }
  const context = {
    name: extension.name,
    options: extension.options,
    storage: extension.storage
  };
  const group2 = callOrReturn(getExtensionField(extension, "group", context));
  if (typeof group2 !== "string") {
    return false;
  }
  return group2.split(" ").includes("list");
}
function isNodeEmpty(node, {
  checkChildren = true,
  ignoreWhitespace = false
} = {}) {
  var _a4;
  if (ignoreWhitespace) {
    if (node.type.name === "hardBreak") {
      return true;
    }
    if (node.isText) {
      return /^\s*$/m.test((_a4 = node.text) != null ? _a4 : "");
    }
  }
  if (node.isText) {
    return !node.text;
  }
  if (node.isAtom || node.isLeaf) {
    return false;
  }
  if (node.content.childCount === 0) {
    return true;
  }
  if (checkChildren) {
    let isContentEmpty = true;
    node.content.forEach((childNode) => {
      if (isContentEmpty === false) {
        return;
      }
      if (!isNodeEmpty(childNode, { ignoreWhitespace, checkChildren })) {
        isContentEmpty = false;
      }
    });
    return isContentEmpty;
  }
  return false;
}
function canSetMark(state, tr, newMarkType) {
  var _a4;
  const { selection } = tr;
  let cursor = null;
  if (isTextSelection(selection)) {
    cursor = selection.$cursor;
  }
  if (cursor) {
    const currentMarks = (_a4 = state.storedMarks) != null ? _a4 : cursor.marks();
    const parentAllowsMarkType = cursor.parent.type.allowsMarkType(newMarkType);
    return parentAllowsMarkType && (!!newMarkType.isInSet(currentMarks) || !currentMarks.some((mark) => mark.type.excludes(newMarkType)));
  }
  const { ranges } = selection;
  return ranges.some(({ $from, $to }) => {
    let someNodeSupportsMark = $from.depth === 0 ? state.doc.inlineContent && state.doc.type.allowsMarkType(newMarkType) : false;
    state.doc.nodesBetween($from.pos, $to.pos, (node, _pos, parent) => {
      if (someNodeSupportsMark) {
        return false;
      }
      if (node.isInline) {
        const parentAllowsMarkType = !parent || parent.type.allowsMarkType(newMarkType);
        const currentMarksAllowMarkType = !!newMarkType.isInSet(node.marks) || !node.marks.some((otherMark) => otherMark.type.excludes(newMarkType));
        someNodeSupportsMark = parentAllowsMarkType && currentMarksAllowMarkType;
      }
      return !someNodeSupportsMark;
    });
    return someNodeSupportsMark;
  });
}
var setMark = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  const { selection } = tr;
  const { empty, ranges } = selection;
  const type = getMarkType(typeOrName, state.schema);
  if (dispatch) {
    if (empty) {
      const oldAttributes = getMarkAttributes(state, type);
      tr.addStoredMark(
        type.create({
          ...oldAttributes,
          ...attributes
        })
      );
    } else {
      ranges.forEach((range) => {
        const from = range.$from.pos;
        const to = range.$to.pos;
        state.doc.nodesBetween(from, to, (node, pos) => {
          const trimmedFrom = Math.max(pos, from);
          const trimmedTo = Math.min(pos + node.nodeSize, to);
          const someHasMark = node.marks.find((mark) => mark.type === type);
          if (someHasMark) {
            node.marks.forEach((mark) => {
              if (type === mark.type) {
                tr.addMark(
                  trimmedFrom,
                  trimmedTo,
                  type.create({
                    ...mark.attrs,
                    ...attributes
                  })
                );
              }
            });
          } else {
            tr.addMark(trimmedFrom, trimmedTo, type.create(attributes));
          }
        });
      });
    }
  }
  return canSetMark(state, tr, type);
};
var setMeta = (key, value) => ({ tr }) => {
  tr.setMeta(key, value);
  return true;
};
var setNode = (typeOrName, attributes = {}) => ({ state, dispatch, chain }) => {
  const type = getNodeType(typeOrName, state.schema);
  let attributesToCopy;
  if (state.selection.$anchor.sameParent(state.selection.$head)) {
    attributesToCopy = state.selection.$anchor.parent.attrs;
  }
  if (!type.isTextblock) {
    console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.');
    return false;
  }
  return chain().command(({ commands }) => {
    const canSetBlock = (0, import_commands15.setBlockType)(type, { ...attributesToCopy, ...attributes })(state);
    if (canSetBlock) {
      return true;
    }
    return commands.clearNodes();
  }).command(({ state: updatedState }) => {
    return (0, import_commands15.setBlockType)(type, { ...attributesToCopy, ...attributes })(updatedState, dispatch);
  }).run();
};
var setNodeSelection = (position) => ({ tr, dispatch }) => {
  if (dispatch) {
    const { doc } = tr;
    const from = minMax(position, 0, doc.content.size);
    const selection = import_state8.NodeSelection.create(doc, from);
    tr.setSelection(selection);
  }
  return true;
};
var setTextDirection = (direction, position) => ({ tr, state, dispatch }) => {
  const { selection } = state;
  let from;
  let to;
  if (typeof position === "number") {
    from = position;
    to = position;
  } else if (position && "from" in position && "to" in position) {
    from = position.from;
    to = position.to;
  } else {
    from = selection.from;
    to = selection.to;
  }
  if (dispatch) {
    tr.doc.nodesBetween(from, to, (node, pos) => {
      if (node.isText) {
        return;
      }
      tr.setNodeMarkup(pos, void 0, {
        ...node.attrs,
        dir: direction
      });
    });
  }
  return true;
};
var setTextSelection = (position) => ({ tr, dispatch }) => {
  if (dispatch) {
    const { doc } = tr;
    const { from, to } = typeof position === "number" ? { from: position, to: position } : position;
    const minPos = import_state9.TextSelection.atStart(doc).from;
    const maxPos = import_state9.TextSelection.atEnd(doc).to;
    const resolvedFrom = minMax(from, minPos, maxPos);
    const resolvedEnd = minMax(to, minPos, maxPos);
    const selection = import_state9.TextSelection.create(doc, resolvedFrom, resolvedEnd);
    tr.setSelection(selection);
  }
  return true;
};
var sinkListItem = (typeOrName) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema);
  return (0, import_schema_list2.sinkListItem)(type)(state, dispatch);
};
function ensureMarks(state, splittableMarks) {
  const marks = state.storedMarks || state.selection.$to.parentOffset && state.selection.$from.marks();
  if (marks) {
    const filteredMarks = marks.filter((mark) => splittableMarks == null ? void 0 : splittableMarks.includes(mark.type.name));
    state.tr.ensureMarks(filteredMarks);
  }
}
var splitBlock = ({ keepMarks = true } = {}) => ({ tr, state, dispatch, editor }) => {
  const { selection, doc } = tr;
  const { $from, $to } = selection;
  const extensionAttributes = editor.extensionManager.attributes;
  const newAttributes = getSplittedAttributes(extensionAttributes, $from.node().type.name, $from.node().attrs);
  if (selection instanceof import_state10.NodeSelection && selection.node.isBlock) {
    if (!$from.parentOffset || !(0, import_transform6.canSplit)(doc, $from.pos)) {
      return false;
    }
    if (dispatch) {
      if (keepMarks) {
        ensureMarks(state, editor.extensionManager.splittableMarks);
      }
      tr.split($from.pos).scrollIntoView();
    }
    return true;
  }
  if (!$from.parent.isBlock) {
    return false;
  }
  const atEnd = $to.parentOffset === $to.parent.content.size;
  const deflt = $from.depth === 0 ? void 0 : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)));
  let types = atEnd && deflt ? [
    {
      type: deflt,
      attrs: newAttributes
    }
  ] : void 0;
  let can = (0, import_transform6.canSplit)(tr.doc, tr.mapping.map($from.pos), 1, types);
  if (!types && !can && (0, import_transform6.canSplit)(tr.doc, tr.mapping.map($from.pos), 1, deflt ? [{ type: deflt }] : void 0)) {
    can = true;
    types = deflt ? [
      {
        type: deflt,
        attrs: newAttributes
      }
    ] : void 0;
  }
  if (dispatch) {
    if (can) {
      if (selection instanceof import_state10.TextSelection) {
        tr.deleteSelection();
      }
      tr.split(tr.mapping.map($from.pos), 1, types);
      if (deflt && !atEnd && !$from.parentOffset && $from.parent.type !== deflt) {
        const first2 = tr.mapping.map($from.before());
        const $first = tr.doc.resolve(first2);
        if ($from.node(-1).canReplaceWith($first.index(), $first.index() + 1, deflt)) {
          tr.setNodeMarkup(tr.mapping.map($from.before()), deflt);
        }
      }
    }
    if (keepMarks) {
      ensureMarks(state, editor.extensionManager.splittableMarks);
    }
    tr.scrollIntoView();
  }
  return can;
};
var splitListItem = (typeOrName, overrideAttrs = {}) => ({ tr, state, dispatch, editor }) => {
  var _a4;
  const type = getNodeType(typeOrName, state.schema);
  const { $from, $to } = state.selection;
  const node = state.selection.node;
  if (node && node.isBlock || $from.depth < 2 || !$from.sameParent($to)) {
    return false;
  }
  const grandParent = $from.node(-1);
  if (grandParent.type !== type) {
    return false;
  }
  const extensionAttributes = editor.extensionManager.attributes;
  if ($from.parent.content.size === 0 && $from.node(-1).childCount === $from.indexAfter(-1)) {
    if ($from.depth === 2 || $from.node(-3).type !== type || $from.index(-2) !== $from.node(-2).childCount - 1) {
      return false;
    }
    if (dispatch) {
      let wrap = import_model8.Fragment.empty;
      const depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3;
      for (let d = $from.depth - depthBefore; d >= $from.depth - 3; d -= 1) {
        wrap = import_model8.Fragment.from($from.node(d).copy(wrap));
      }
      const depthAfter = (
        // eslint-disable-next-line no-nested-ternary
        $from.indexAfter(-1) < $from.node(-2).childCount ? 1 : $from.indexAfter(-2) < $from.node(-3).childCount ? 2 : 3
      );
      const newNextTypeAttributes2 = {
        ...getSplittedAttributes(extensionAttributes, $from.node().type.name, $from.node().attrs),
        ...overrideAttrs
      };
      const nextType2 = ((_a4 = type.contentMatch.defaultType) == null ? void 0 : _a4.createAndFill(newNextTypeAttributes2)) || void 0;
      wrap = wrap.append(import_model8.Fragment.from(type.createAndFill(null, nextType2) || void 0));
      const start = $from.before($from.depth - (depthBefore - 1));
      tr.replace(start, $from.after(-depthAfter), new import_model8.Slice(wrap, 4 - depthBefore, 0));
      let sel = -1;
      tr.doc.nodesBetween(start, tr.doc.content.size, (n, pos) => {
        if (sel > -1) {
          return false;
        }
        if (n.isTextblock && n.content.size === 0) {
          sel = pos + 1;
        }
      });
      if (sel > -1) {
        tr.setSelection(import_state11.TextSelection.near(tr.doc.resolve(sel)));
      }
      tr.scrollIntoView();
    }
    return true;
  }
  const nextType = $to.pos === $from.end() ? grandParent.contentMatchAt(0).defaultType : null;
  const newTypeAttributes = {
    ...getSplittedAttributes(extensionAttributes, grandParent.type.name, grandParent.attrs),
    ...overrideAttrs
  };
  const newNextTypeAttributes = {
    ...getSplittedAttributes(extensionAttributes, $from.node().type.name, $from.node().attrs),
    ...overrideAttrs
  };
  tr.delete($from.pos, $to.pos);
  const types = nextType ? [
    { type, attrs: newTypeAttributes },
    { type: nextType, attrs: newNextTypeAttributes }
  ] : [{ type, attrs: newTypeAttributes }];
  if (!(0, import_transform7.canSplit)(tr.doc, $from.pos, 2)) {
    return false;
  }
  if (dispatch) {
    const { selection, storedMarks } = state;
    const { splittableMarks } = editor.extensionManager;
    const marks = storedMarks || selection.$to.parentOffset && selection.$from.marks();
    tr.split($from.pos, 2, types).scrollIntoView();
    if (!marks || !dispatch) {
      return true;
    }
    const filteredMarks = marks.filter((mark) => splittableMarks.includes(mark.type.name));
    tr.ensureMarks(filteredMarks);
  }
  return true;
};
var joinListBackwards = (tr, listType) => {
  const list = findParentNode((node) => node.type === listType)(tr.selection);
  if (!list) {
    return true;
  }
  const before = tr.doc.resolve(Math.max(0, list.pos - 1)).before(list.depth);
  if (before === void 0) {
    return true;
  }
  const nodeBefore = tr.doc.nodeAt(before);
  const canJoinBackwards = list.node.type === (nodeBefore == null ? void 0 : nodeBefore.type) && (0, import_transform8.canJoin)(tr.doc, list.pos);
  if (!canJoinBackwards) {
    return true;
  }
  tr.join(list.pos);
  return true;
};
var joinListForwards = (tr, listType) => {
  const list = findParentNode((node) => node.type === listType)(tr.selection);
  if (!list) {
    return true;
  }
  const after = tr.doc.resolve(list.start).after(list.depth);
  if (after === void 0) {
    return true;
  }
  const nodeAfter = tr.doc.nodeAt(after);
  const canJoinForwards = list.node.type === (nodeAfter == null ? void 0 : nodeAfter.type) && (0, import_transform8.canJoin)(tr.doc, after);
  if (!canJoinForwards) {
    return true;
  }
  tr.join(after);
  return true;
};
var toggleList = (listTypeOrName, itemTypeOrName, keepMarks, attributes = {}) => ({ editor, tr, state, dispatch, chain, commands, can }) => {
  const { extensions, splittableMarks } = editor.extensionManager;
  const listType = getNodeType(listTypeOrName, state.schema);
  const itemType = getNodeType(itemTypeOrName, state.schema);
  const { selection, storedMarks } = state;
  const { $from, $to } = selection;
  const range = $from.blockRange($to);
  const marks = storedMarks || selection.$to.parentOffset && selection.$from.marks();
  if (!range) {
    return false;
  }
  const parentList = findParentNode((node) => isList(node.type.name, extensions))(selection);
  if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
    if (parentList.node.type === listType) {
      return commands.liftListItem(itemType);
    }
    if (isList(parentList.node.type.name, extensions) && listType.validContent(parentList.node.content) && dispatch) {
      return chain().command(() => {
        tr.setNodeMarkup(parentList.pos, listType);
        return true;
      }).command(() => joinListBackwards(tr, listType)).command(() => joinListForwards(tr, listType)).run();
    }
  }
  if (!keepMarks || !marks || !dispatch) {
    return chain().command(() => {
      const canWrapInList = can().wrapInList(listType, attributes);
      if (canWrapInList) {
        return true;
      }
      return commands.clearNodes();
    }).wrapInList(listType, attributes).command(() => joinListBackwards(tr, listType)).command(() => joinListForwards(tr, listType)).run();
  }
  return chain().command(() => {
    const canWrapInList = can().wrapInList(listType, attributes);
    const filteredMarks = marks.filter((mark) => splittableMarks.includes(mark.type.name));
    tr.ensureMarks(filteredMarks);
    if (canWrapInList) {
      return true;
    }
    return commands.clearNodes();
  }).wrapInList(listType, attributes).command(() => joinListBackwards(tr, listType)).command(() => joinListForwards(tr, listType)).run();
};
var toggleMark = (typeOrName, attributes = {}, options = {}) => ({ state, commands }) => {
  const { extendEmptyMarkRange = false } = options;
  const type = getMarkType(typeOrName, state.schema);
  const isActive2 = isMarkActive(state, type, attributes);
  if (isActive2) {
    return commands.unsetMark(type, { extendEmptyMarkRange });
  }
  return commands.setMark(type, attributes);
};
var toggleNode = (typeOrName, toggleTypeOrName, attributes = {}) => ({ state, commands }) => {
  const type = getNodeType(typeOrName, state.schema);
  const toggleType = getNodeType(toggleTypeOrName, state.schema);
  const isActive2 = isNodeActive(state, type, attributes);
  let attributesToCopy;
  if (state.selection.$anchor.sameParent(state.selection.$head)) {
    attributesToCopy = state.selection.$anchor.parent.attrs;
  }
  if (isActive2) {
    return commands.setNode(toggleType, attributesToCopy);
  }
  return commands.setNode(type, { ...attributesToCopy, ...attributes });
};
var toggleWrap = (typeOrName, attributes = {}) => ({ state, commands }) => {
  const type = getNodeType(typeOrName, state.schema);
  const isActive2 = isNodeActive(state, type, attributes);
  if (isActive2) {
    return commands.lift(type);
  }
  return commands.wrapIn(type, attributes);
};
var undoInputRule = () => ({ state, dispatch }) => {
  const plugins = state.plugins;
  for (let i = 0; i < plugins.length; i += 1) {
    const plugin = plugins[i];
    let undoable;
    if (plugin.spec.isInputRules && (undoable = plugin.getState(state))) {
      if (dispatch) {
        const tr = state.tr;
        const toUndo = undoable.transform;
        for (let j = toUndo.steps.length - 1; j >= 0; j -= 1) {
          tr.step(toUndo.steps[j].invert(toUndo.docs[j]));
        }
        if (undoable.text) {
          const marks = tr.doc.resolve(undoable.from).marks();
          tr.replaceWith(undoable.from, undoable.to, state.schema.text(undoable.text, marks));
        } else {
          tr.delete(undoable.from, undoable.to);
        }
      }
      return true;
    }
  }
  return false;
};
var unsetAllMarks = () => ({ tr, dispatch }) => {
  const { selection } = tr;
  const { empty, ranges } = selection;
  if (empty) {
    return true;
  }
  if (dispatch) {
    ranges.forEach((range) => {
      tr.removeMark(range.$from.pos, range.$to.pos);
    });
  }
  return true;
};
var unsetMark = (typeOrName, options = {}) => ({ tr, state, dispatch }) => {
  var _a4;
  const { extendEmptyMarkRange = false } = options;
  const { selection } = tr;
  const type = getMarkType(typeOrName, state.schema);
  const { $from, empty, ranges } = selection;
  if (!dispatch) {
    return true;
  }
  if (empty && extendEmptyMarkRange) {
    let { from, to } = selection;
    const attrs = (_a4 = $from.marks().find((mark) => mark.type === type)) == null ? void 0 : _a4.attrs;
    const range = getMarkRange($from, type, attrs);
    if (range) {
      from = range.from;
      to = range.to;
    }
    tr.removeMark(from, to, type);
  } else {
    ranges.forEach((range) => {
      tr.removeMark(range.$from.pos, range.$to.pos, type);
    });
  }
  tr.removeStoredMark(type);
  return true;
};
var unsetTextDirection = (position) => ({ tr, state, dispatch }) => {
  const { selection } = state;
  let from;
  let to;
  if (typeof position === "number") {
    from = position;
    to = position;
  } else if (position && "from" in position && "to" in position) {
    from = position.from;
    to = position.to;
  } else {
    from = selection.from;
    to = selection.to;
  }
  if (dispatch) {
    tr.doc.nodesBetween(from, to, (node, pos) => {
      if (node.isText) {
        return;
      }
      const newAttrs = { ...node.attrs };
      delete newAttrs.dir;
      tr.setNodeMarkup(pos, void 0, newAttrs);
    });
  }
  return true;
};
var updateAttributes = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  let nodeType = null;
  let markType = null;
  const schemaType = getSchemaTypeNameByName(
    typeof typeOrName === "string" ? typeOrName : typeOrName.name,
    state.schema
  );
  if (!schemaType) {
    return false;
  }
  if (schemaType === "node") {
    nodeType = getNodeType(typeOrName, state.schema);
  }
  if (schemaType === "mark") {
    markType = getMarkType(typeOrName, state.schema);
  }
  let canUpdate = false;
  tr.selection.ranges.forEach((range) => {
    const from = range.$from.pos;
    const to = range.$to.pos;
    let lastPos;
    let lastNode;
    let trimmedFrom;
    let trimmedTo;
    if (tr.selection.empty) {
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (nodeType && nodeType === node.type) {
          canUpdate = true;
          trimmedFrom = Math.max(pos, from);
          trimmedTo = Math.min(pos + node.nodeSize, to);
          lastPos = pos;
          lastNode = node;
        }
      });
    } else {
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (pos < from && nodeType && nodeType === node.type) {
          canUpdate = true;
          trimmedFrom = Math.max(pos, from);
          trimmedTo = Math.min(pos + node.nodeSize, to);
          lastPos = pos;
          lastNode = node;
        }
        if (pos >= from && pos <= to) {
          if (nodeType && nodeType === node.type) {
            canUpdate = true;
            if (dispatch) {
              tr.setNodeMarkup(pos, void 0, {
                ...node.attrs,
                ...attributes
              });
            }
          }
          if (markType && node.marks.length) {
            node.marks.forEach((mark) => {
              if (markType === mark.type) {
                canUpdate = true;
                if (dispatch) {
                  const trimmedFrom2 = Math.max(pos, from);
                  const trimmedTo2 = Math.min(pos + node.nodeSize, to);
                  tr.addMark(
                    trimmedFrom2,
                    trimmedTo2,
                    markType.create({
                      ...mark.attrs,
                      ...attributes
                    })
                  );
                }
              }
            });
          }
        }
      });
    }
    if (lastNode) {
      if (lastPos !== void 0 && dispatch) {
        tr.setNodeMarkup(lastPos, void 0, {
          ...lastNode.attrs,
          ...attributes
        });
      }
      if (markType && lastNode.marks.length) {
        lastNode.marks.forEach((mark) => {
          if (markType === mark.type && dispatch) {
            tr.addMark(
              trimmedFrom,
              trimmedTo,
              markType.create({
                ...mark.attrs,
                ...attributes
              })
            );
          }
        });
      }
    }
  });
  return canUpdate;
};
var wrapIn = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema);
  return (0, import_commands16.wrapIn)(type, attributes)(state, dispatch);
};
var wrapInList = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema);
  return (0, import_schema_list3.wrapInList)(type, attributes)(state, dispatch);
};
var inputRuleMatcherHandler = (text, find) => {
  if (isRegExp(find)) {
    return find.exec(text);
  }
  const inputRuleMatch = find(text);
  if (!inputRuleMatch) {
    return null;
  }
  const result = [inputRuleMatch.text];
  result.index = inputRuleMatch.index;
  result.input = text;
  result.data = inputRuleMatch.data;
  if (inputRuleMatch.replaceWith) {
    if (!inputRuleMatch.text.includes(inputRuleMatch.replaceWith)) {
      console.warn('[tiptap warn]: "inputRuleMatch.replaceWith" must be part of "inputRuleMatch.text".');
    }
    result.push(inputRuleMatch.replaceWith);
  }
  return result;
};
function run(config) {
  var _a4;
  const { editor, from, to, text, rules, plugin } = config;
  const { view } = editor;
  if (view.composing) {
    return false;
  }
  const $from = view.state.doc.resolve(from);
  if (
    // check for code node
    $from.parent.type.spec.code || // check for code mark
    !!((_a4 = $from.nodeBefore || $from.nodeAfter) == null ? void 0 : _a4.marks.find((mark) => mark.type.spec.code))
  ) {
    return false;
  }
  let matched = false;
  const textBefore = getTextContentFromNodes($from) + text;
  rules.forEach((rule) => {
    if (matched) {
      return;
    }
    const match = inputRuleMatcherHandler(textBefore, rule.find);
    if (!match) {
      return;
    }
    const tr = view.state.tr;
    const state = createChainableState({
      state: view.state,
      transaction: tr
    });
    const range = {
      from: from - (match[0].length - text.length),
      to
    };
    const { commands, chain, can } = new CommandManager({
      editor,
      state
    });
    const handler = rule.handler({
      state,
      range,
      match,
      commands,
      chain,
      can
    });
    if (handler === null || !tr.steps.length) {
      return;
    }
    if (rule.undoable) {
      tr.setMeta(plugin, {
        transform: tr,
        from,
        to,
        text
      });
    }
    view.dispatch(tr);
    matched = true;
  });
  return matched;
}
function inputRulesPlugin(props) {
  const { editor, rules } = props;
  const plugin = new import_state13.Plugin({
    state: {
      init() {
        return null;
      },
      apply(tr, prev, state) {
        const stored = tr.getMeta(plugin);
        if (stored) {
          return stored;
        }
        const simulatedInputMeta = tr.getMeta("applyInputRules");
        const isSimulatedInput = !!simulatedInputMeta;
        if (isSimulatedInput) {
          setTimeout(() => {
            let { text } = simulatedInputMeta;
            if (typeof text === "string") {
              text = text;
            } else {
              text = getHTMLFromFragment(import_model9.Fragment.from(text), state.schema);
            }
            const { from } = simulatedInputMeta;
            const to = from + text.length;
            run({
              editor,
              from,
              to,
              text,
              rules,
              plugin
            });
          });
        }
        return tr.selectionSet || tr.docChanged ? null : prev;
      }
    },
    props: {
      handleTextInput(view, from, to, text) {
        return run({
          editor,
          from,
          to,
          text,
          rules,
          plugin
        });
      },
      handleDOMEvents: {
        compositionend: (view) => {
          setTimeout(() => {
            const { $cursor } = view.state.selection;
            if ($cursor) {
              run({
                editor,
                from: $cursor.pos,
                to: $cursor.pos,
                text: "",
                rules,
                plugin
              });
            }
          });
          return false;
        }
      },
      // add support for input rules to trigger on enter
      // this is useful for example for code blocks
      handleKeyDown(view, event) {
        if (event.key !== "Enter") {
          return false;
        }
        const { $cursor } = view.state.selection;
        if ($cursor) {
          return run({
            editor,
            from: $cursor.pos,
            to: $cursor.pos,
            text: "\n",
            rules,
            plugin
          });
        }
        return false;
      }
    },
    // @ts-ignore
    isInputRules: true
  });
  return plugin;
}
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}
function isPlainObject(value) {
  if (getType(value) !== "Object") {
    return false;
  }
  return value.constructor === Object && Object.getPrototypeOf(value) === Object.prototype;
}
function mergeDeep(target, source) {
  const output = { ...target };
  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isPlainObject(source[key]) && isPlainObject(target[key])) {
        output[key] = mergeDeep(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}
var Extendable = class {
  constructor(config = {}) {
    this.type = "extendable";
    this.parent = null;
    this.child = null;
    this.name = "";
    this.config = {
      name: this.name
    };
    this.config = {
      ...this.config,
      ...config
    };
    this.name = this.config.name;
  }
  get options() {
    return {
      ...callOrReturn(
        getExtensionField(this, "addOptions", {
          name: this.name
        })
      ) || {}
    };
  }
  get storage() {
    return {
      ...callOrReturn(
        getExtensionField(this, "addStorage", {
          name: this.name,
          options: this.options
        })
      ) || {}
    };
  }
  configure(options = {}) {
    const extension = this.extend({
      ...this.config,
      addOptions: () => {
        return mergeDeep(this.options, options);
      }
    });
    extension.name = this.name;
    extension.parent = this.parent;
    return extension;
  }
  extend(extendedConfig = {}) {
    const extension = new this.constructor({ ...this.config, ...extendedConfig });
    extension.parent = this;
    this.child = extension;
    extension.name = "name" in extendedConfig ? extendedConfig.name : extension.parent.name;
    return extension;
  }
};
var Mark = class _Mark extends Extendable {
  constructor() {
    super(...arguments);
    this.type = "mark";
  }
  /**
   * Create a new Mark instance
   * @param config - Mark configuration object or a function that returns a configuration object
   */
  static create(config = {}) {
    const resolvedConfig = typeof config === "function" ? config() : config;
    return new _Mark(resolvedConfig);
  }
  static handleExit({ editor, mark }) {
    const { tr } = editor.state;
    const currentPos = editor.state.selection.$from;
    const isAtEnd = currentPos.pos === currentPos.end();
    if (isAtEnd) {
      const currentMarks = currentPos.marks();
      const isInMark = !!currentMarks.find((m) => (m == null ? void 0 : m.type.name) === mark.name);
      if (!isInMark) {
        return false;
      }
      const removeMark = currentMarks.find((m) => (m == null ? void 0 : m.type.name) === mark.name);
      if (removeMark) {
        tr.removeStoredMark(removeMark);
      }
      tr.insertText(" ", currentPos.pos);
      editor.view.dispatch(tr);
      return true;
    }
    return false;
  }
  configure(options) {
    return super.configure(options);
  }
  extend(extendedConfig) {
    const resolvedConfig = typeof extendedConfig === "function" ? extendedConfig() : extendedConfig;
    return super.extend(resolvedConfig);
  }
};
function isNumber(value) {
  return typeof value === "number";
}
var pasteRuleMatcherHandler = (text, find, event) => {
  if (isRegExp(find)) {
    return [...text.matchAll(find)];
  }
  const matches = find(text, event);
  if (!matches) {
    return [];
  }
  return matches.map((pasteRuleMatch) => {
    const result = [pasteRuleMatch.text];
    result.index = pasteRuleMatch.index;
    result.input = text;
    result.data = pasteRuleMatch.data;
    if (pasteRuleMatch.replaceWith) {
      if (!pasteRuleMatch.text.includes(pasteRuleMatch.replaceWith)) {
        console.warn('[tiptap warn]: "pasteRuleMatch.replaceWith" must be part of "pasteRuleMatch.text".');
      }
      result.push(pasteRuleMatch.replaceWith);
    }
    return result;
  });
};
function run2(config) {
  const { editor, state, from, to, rule, pasteEvent, dropEvent } = config;
  const { commands, chain, can } = new CommandManager({
    editor,
    state
  });
  const handlers = [];
  state.doc.nodesBetween(from, to, (node, pos) => {
    var _a4, _b, _c, _d, _e;
    if (((_b = (_a4 = node.type) == null ? void 0 : _a4.spec) == null ? void 0 : _b.code) || !(node.isText || node.isTextblock || node.isInline)) {
      return;
    }
    const contentSize = (_e = (_d = (_c = node.content) == null ? void 0 : _c.size) != null ? _d : node.nodeSize) != null ? _e : 0;
    const resolvedFrom = Math.max(from, pos);
    const resolvedTo = Math.min(to, pos + contentSize);
    if (resolvedFrom >= resolvedTo) {
      return;
    }
    const textToMatch = node.isText ? node.text || "" : node.textBetween(resolvedFrom - pos, resolvedTo - pos, void 0, "\uFFFC");
    const matches = pasteRuleMatcherHandler(textToMatch, rule.find, pasteEvent);
    matches.forEach((match) => {
      if (match.index === void 0) {
        return;
      }
      const start = resolvedFrom + match.index + 1;
      const end = start + match[0].length;
      const range = {
        from: state.tr.mapping.map(start),
        to: state.tr.mapping.map(end)
      };
      const handler = rule.handler({
        state,
        range,
        match,
        commands,
        chain,
        can,
        pasteEvent,
        dropEvent
      });
      handlers.push(handler);
    });
  });
  const success = handlers.every((handler) => handler !== null);
  return success;
}
var tiptapDragFromOtherEditor = null;
var createClipboardPasteEvent = (text) => {
  var _a4;
  const event = new ClipboardEvent("paste", {
    clipboardData: new DataTransfer()
  });
  (_a4 = event.clipboardData) == null ? void 0 : _a4.setData("text/html", text);
  return event;
};
function pasteRulesPlugin(props) {
  const { editor, rules } = props;
  let dragSourceElement = null;
  let isPastedFromProseMirror = false;
  let isDroppedFromProseMirror = false;
  let pasteEvent = typeof ClipboardEvent !== "undefined" ? new ClipboardEvent("paste") : null;
  let dropEvent;
  try {
    dropEvent = typeof DragEvent !== "undefined" ? new DragEvent("drop") : null;
  } catch {
    dropEvent = null;
  }
  const processEvent = ({
    state,
    from,
    to,
    rule,
    pasteEvt
  }) => {
    const tr = state.tr;
    const chainableState = createChainableState({
      state,
      transaction: tr
    });
    const handler = run2({
      editor,
      state: chainableState,
      from: Math.max(from - 1, 0),
      to: to.b - 1,
      rule,
      pasteEvent: pasteEvt,
      dropEvent
    });
    if (!handler || !tr.steps.length) {
      return;
    }
    try {
      dropEvent = typeof DragEvent !== "undefined" ? new DragEvent("drop") : null;
    } catch {
      dropEvent = null;
    }
    pasteEvent = typeof ClipboardEvent !== "undefined" ? new ClipboardEvent("paste") : null;
    return tr;
  };
  const plugins = rules.map((rule) => {
    return new import_state14.Plugin({
      // we register a global drag handler to track the current drag source element
      view(view) {
        const handleDragstart = (event) => {
          var _a4;
          dragSourceElement = ((_a4 = view.dom.parentElement) == null ? void 0 : _a4.contains(event.target)) ? view.dom.parentElement : null;
          if (dragSourceElement) {
            tiptapDragFromOtherEditor = editor;
          }
        };
        const handleDragend = () => {
          if (tiptapDragFromOtherEditor) {
            tiptapDragFromOtherEditor = null;
          }
        };
        window.addEventListener("dragstart", handleDragstart);
        window.addEventListener("dragend", handleDragend);
        return {
          destroy() {
            window.removeEventListener("dragstart", handleDragstart);
            window.removeEventListener("dragend", handleDragend);
          }
        };
      },
      props: {
        handleDOMEvents: {
          drop: (view, event) => {
            isDroppedFromProseMirror = dragSourceElement === view.dom.parentElement;
            dropEvent = event;
            if (!isDroppedFromProseMirror) {
              const dragFromOtherEditor = tiptapDragFromOtherEditor;
              if (dragFromOtherEditor == null ? void 0 : dragFromOtherEditor.isEditable) {
                setTimeout(() => {
                  const selection = dragFromOtherEditor.state.selection;
                  if (selection) {
                    dragFromOtherEditor.commands.deleteRange({ from: selection.from, to: selection.to });
                  }
                }, 10);
              }
            }
            return false;
          },
          paste: (_view, event) => {
            var _a4;
            const html = (_a4 = event.clipboardData) == null ? void 0 : _a4.getData("text/html");
            pasteEvent = event;
            isPastedFromProseMirror = !!(html == null ? void 0 : html.includes("data-pm-slice"));
            return false;
          }
        }
      },
      appendTransaction: (transactions, oldState, state) => {
        const transaction = transactions[0];
        const isPaste = transaction.getMeta("uiEvent") === "paste" && !isPastedFromProseMirror;
        const isDrop = transaction.getMeta("uiEvent") === "drop" && !isDroppedFromProseMirror;
        const simulatedPasteMeta = transaction.getMeta("applyPasteRules");
        const isSimulatedPaste = !!simulatedPasteMeta;
        if (!isPaste && !isDrop && !isSimulatedPaste) {
          return;
        }
        if (isSimulatedPaste) {
          let { text } = simulatedPasteMeta;
          if (typeof text === "string") {
            text = text;
          } else {
            text = getHTMLFromFragment(import_model10.Fragment.from(text), state.schema);
          }
          const { from: from2 } = simulatedPasteMeta;
          const to2 = from2 + text.length;
          const pasteEvt = createClipboardPasteEvent(text);
          return processEvent({
            rule,
            state,
            from: from2,
            to: { b: to2 },
            pasteEvt
          });
        }
        const from = oldState.doc.content.findDiffStart(state.doc.content);
        const to = oldState.doc.content.findDiffEnd(state.doc.content);
        if (!isNumber(from) || !to || from === to.b) {
          return;
        }
        return processEvent({
          rule,
          state,
          from,
          to,
          pasteEvt: pasteEvent
        });
      }
    });
  });
  return plugins;
}
var ExtensionManager = class {
  constructor(extensions, editor) {
    this.splittableMarks = [];
    this.editor = editor;
    this.baseExtensions = extensions;
    this.extensions = resolveExtensions(extensions);
    this.schema = getSchemaByResolvedExtensions(this.extensions, editor);
    this.setupExtensions();
  }
  /**
   * Get all commands from the extensions.
   * @returns An object with all commands where the key is the command name and the value is the command function
   */
  get commands() {
    return this.extensions.reduce((commands, extension) => {
      const context = {
        name: extension.name,
        options: extension.options,
        storage: this.editor.extensionStorage[extension.name],
        editor: this.editor,
        type: getSchemaTypeByName(extension.name, this.schema)
      };
      const addCommands = getExtensionField(extension, "addCommands", context);
      if (!addCommands) {
        return commands;
      }
      return {
        ...commands,
        ...addCommands()
      };
    }, {});
  }
  /**
   * Get all registered Prosemirror plugins from the extensions.
   * @returns An array of Prosemirror plugins
   */
  get plugins() {
    const { editor } = this;
    const extensions = sortExtensions([...this.extensions].reverse());
    const allPlugins = extensions.flatMap((extension) => {
      const context = {
        name: extension.name,
        options: extension.options,
        storage: this.editor.extensionStorage[extension.name],
        editor,
        type: getSchemaTypeByName(extension.name, this.schema)
      };
      const plugins = [];
      const addKeyboardShortcuts = getExtensionField(
        extension,
        "addKeyboardShortcuts",
        context
      );
      let defaultBindings = {};
      if (extension.type === "mark" && getExtensionField(extension, "exitable", context)) {
        defaultBindings.ArrowRight = () => Mark.handleExit({ editor, mark: extension });
      }
      if (addKeyboardShortcuts) {
        const bindings = Object.fromEntries(
          Object.entries(addKeyboardShortcuts()).map(([shortcut, method]) => {
            return [shortcut, () => method({ editor })];
          })
        );
        defaultBindings = { ...defaultBindings, ...bindings };
      }
      const keyMapPlugin = (0, import_keymap.keymap)(defaultBindings);
      plugins.push(keyMapPlugin);
      const addInputRules = getExtensionField(extension, "addInputRules", context);
      if (isExtensionRulesEnabled(extension, editor.options.enableInputRules) && addInputRules) {
        const rules = addInputRules();
        if (rules && rules.length) {
          const inputResult = inputRulesPlugin({
            editor,
            rules
          });
          const inputPlugins = Array.isArray(inputResult) ? inputResult : [inputResult];
          plugins.push(...inputPlugins);
        }
      }
      const addPasteRules = getExtensionField(extension, "addPasteRules", context);
      if (isExtensionRulesEnabled(extension, editor.options.enablePasteRules) && addPasteRules) {
        const rules = addPasteRules();
        if (rules && rules.length) {
          const pasteRules = pasteRulesPlugin({ editor, rules });
          plugins.push(...pasteRules);
        }
      }
      const addProseMirrorPlugins = getExtensionField(
        extension,
        "addProseMirrorPlugins",
        context
      );
      if (addProseMirrorPlugins) {
        const proseMirrorPlugins = addProseMirrorPlugins();
        plugins.push(...proseMirrorPlugins);
      }
      return plugins;
    });
    return allPlugins;
  }
  /**
   * Get all attributes from the extensions.
   * @returns An array of attributes
   */
  get attributes() {
    return getAttributesFromExtensions(this.extensions);
  }
  /**
   * Get all node views from the extensions.
   * @returns An object with all node views where the key is the node name and the value is the node view function
   */
  get nodeViews() {
    const { editor } = this;
    const { nodeExtensions } = splitExtensions(this.extensions);
    return Object.fromEntries(
      nodeExtensions.filter((extension) => !!getExtensionField(extension, "addNodeView")).map((extension) => {
        const extensionAttributes = this.attributes.filter((attribute) => attribute.type === extension.name);
        const context = {
          name: extension.name,
          options: extension.options,
          storage: this.editor.extensionStorage[extension.name],
          editor,
          type: getNodeType(extension.name, this.schema)
        };
        const addNodeView = getExtensionField(extension, "addNodeView", context);
        if (!addNodeView) {
          return [];
        }
        const nodeViewResult = addNodeView();
        if (!nodeViewResult) {
          return [];
        }
        const nodeview = (node, view, getPos, decorations, innerDecorations) => {
          const HTMLAttributes = getRenderedAttributes(node, extensionAttributes);
          return nodeViewResult({
            // pass-through
            node,
            view,
            getPos,
            decorations,
            innerDecorations,
            // tiptap-specific
            editor,
            extension,
            HTMLAttributes
          });
        };
        return [extension.name, nodeview];
      })
    );
  }
  /**
   * Get the composed dispatchTransaction function from all extensions.
   * @param baseDispatch The base dispatch function (e.g. from the editor or user props)
   * @returns A composed dispatch function
   */
  dispatchTransaction(baseDispatch) {
    const { editor } = this;
    const extensions = sortExtensions([...this.extensions].reverse());
    return extensions.reduceRight((next, extension) => {
      const context = {
        name: extension.name,
        options: extension.options,
        storage: this.editor.extensionStorage[extension.name],
        editor,
        type: getSchemaTypeByName(extension.name, this.schema)
      };
      const dispatchTransaction = getExtensionField(
        extension,
        "dispatchTransaction",
        context
      );
      if (!dispatchTransaction) {
        return next;
      }
      return (transaction) => {
        dispatchTransaction.call(context, { transaction, next });
      };
    }, baseDispatch);
  }
  get markViews() {
    const { editor } = this;
    const { markExtensions } = splitExtensions(this.extensions);
    return Object.fromEntries(
      markExtensions.filter((extension) => !!getExtensionField(extension, "addMarkView")).map((extension) => {
        const extensionAttributes = this.attributes.filter((attribute) => attribute.type === extension.name);
        const context = {
          name: extension.name,
          options: extension.options,
          storage: this.editor.extensionStorage[extension.name],
          editor,
          type: getMarkType(extension.name, this.schema)
        };
        const addMarkView = getExtensionField(extension, "addMarkView", context);
        if (!addMarkView) {
          return [];
        }
        const markView = (mark, view, inline) => {
          const HTMLAttributes = getRenderedAttributes(mark, extensionAttributes);
          return addMarkView()({
            // pass-through
            mark,
            view,
            inline,
            // tiptap-specific
            editor,
            extension,
            HTMLAttributes,
            updateAttributes: (attrs) => {
              updateMarkViewAttributes(mark, editor, attrs);
            }
          });
        };
        return [extension.name, markView];
      })
    );
  }
  /**
   * Go through all extensions, create extension storages & setup marks
   * & bind editor event listener.
   */
  setupExtensions() {
    const extensions = this.extensions;
    this.editor.extensionStorage = Object.fromEntries(
      extensions.map((extension) => [extension.name, extension.storage])
    );
    extensions.forEach((extension) => {
      var _a4;
      const context = {
        name: extension.name,
        options: extension.options,
        storage: this.editor.extensionStorage[extension.name],
        editor: this.editor,
        type: getSchemaTypeByName(extension.name, this.schema)
      };
      if (extension.type === "mark") {
        const keepOnSplit = (_a4 = callOrReturn(getExtensionField(extension, "keepOnSplit", context))) != null ? _a4 : true;
        if (keepOnSplit) {
          this.splittableMarks.push(extension.name);
        }
      }
      const onBeforeCreate = getExtensionField(extension, "onBeforeCreate", context);
      const onCreate = getExtensionField(extension, "onCreate", context);
      const onUpdate = getExtensionField(extension, "onUpdate", context);
      const onSelectionUpdate = getExtensionField(
        extension,
        "onSelectionUpdate",
        context
      );
      const onTransaction = getExtensionField(extension, "onTransaction", context);
      const onFocus = getExtensionField(extension, "onFocus", context);
      const onBlur = getExtensionField(extension, "onBlur", context);
      const onDestroy = getExtensionField(extension, "onDestroy", context);
      if (onBeforeCreate) {
        this.editor.on("beforeCreate", onBeforeCreate);
      }
      if (onCreate) {
        this.editor.on("create", onCreate);
      }
      if (onUpdate) {
        this.editor.on("update", onUpdate);
      }
      if (onSelectionUpdate) {
        this.editor.on("selectionUpdate", onSelectionUpdate);
      }
      if (onTransaction) {
        this.editor.on("transaction", onTransaction);
      }
      if (onFocus) {
        this.editor.on("focus", onFocus);
      }
      if (onBlur) {
        this.editor.on("blur", onBlur);
      }
      if (onDestroy) {
        this.editor.on("destroy", onDestroy);
      }
    });
  }
};
ExtensionManager.resolve = resolveExtensions;
ExtensionManager.sort = sortExtensions;
ExtensionManager.flatten = flattenExtensions;
var extensions_exports = {};
__export3(extensions_exports, {
  ClipboardTextSerializer: () => ClipboardTextSerializer,
  Commands: () => Commands,
  Delete: () => Delete,
  Drop: () => Drop,
  Editable: () => Editable,
  FocusEvents: () => FocusEvents,
  Keymap: () => Keymap,
  Paste: () => Paste,
  Tabindex: () => Tabindex,
  TextDirection: () => TextDirection,
  focusEventsPluginKey: () => focusEventsPluginKey
});
var Extension = class _Extension extends Extendable {
  constructor() {
    super(...arguments);
    this.type = "extension";
  }
  /**
   * Create a new Extension instance
   * @param config - Extension configuration object or a function that returns a configuration object
   */
  static create(config = {}) {
    const resolvedConfig = typeof config === "function" ? config() : config;
    return new _Extension(resolvedConfig);
  }
  configure(options) {
    return super.configure(options);
  }
  extend(extendedConfig) {
    const resolvedConfig = typeof extendedConfig === "function" ? extendedConfig() : extendedConfig;
    return super.extend(resolvedConfig);
  }
};
var ClipboardTextSerializer = Extension.create({
  name: "clipboardTextSerializer",
  addOptions() {
    return {
      blockSeparator: void 0
    };
  },
  addProseMirrorPlugins() {
    return [
      new import_state15.Plugin({
        key: new import_state15.PluginKey("clipboardTextSerializer"),
        props: {
          clipboardTextSerializer: () => {
            const { editor } = this;
            const { state, schema } = editor;
            const { doc, selection } = state;
            const { ranges } = selection;
            const from = Math.min(...ranges.map((range2) => range2.$from.pos));
            const to = Math.max(...ranges.map((range2) => range2.$to.pos));
            const textSerializers = getTextSerializersFromSchema(schema);
            const range = { from, to };
            return getTextBetween(doc, range, {
              ...this.options.blockSeparator !== void 0 ? { blockSeparator: this.options.blockSeparator } : {},
              textSerializers
            });
          }
        }
      })
    ];
  }
});
var Commands = Extension.create({
  name: "commands",
  addCommands() {
    return {
      ...commands_exports
    };
  }
});
var Delete = Extension.create({
  name: "delete",
  onUpdate({ transaction, appendedTransactions }) {
    var _a4, _b, _c;
    const callback = () => {
      var _a22, _b2, _c2, _d;
      if ((_d = (_c2 = (_b2 = (_a22 = this.editor.options.coreExtensionOptions) == null ? void 0 : _a22.delete) == null ? void 0 : _b2.filterTransaction) == null ? void 0 : _c2.call(_b2, transaction)) != null ? _d : transaction.getMeta("y-sync$")) {
        return;
      }
      const nextTransaction = combineTransactionSteps(transaction.before, [transaction, ...appendedTransactions]);
      const changes = getChangedRanges(nextTransaction);
      changes.forEach((change) => {
        if (nextTransaction.mapping.mapResult(change.oldRange.from).deletedAfter && nextTransaction.mapping.mapResult(change.oldRange.to).deletedBefore) {
          nextTransaction.before.nodesBetween(change.oldRange.from, change.oldRange.to, (node, from) => {
            const to = from + node.nodeSize - 2;
            const isFullyWithinRange = change.oldRange.from <= from && to <= change.oldRange.to;
            this.editor.emit("delete", {
              type: "node",
              node,
              from,
              to,
              newFrom: nextTransaction.mapping.map(from),
              newTo: nextTransaction.mapping.map(to),
              deletedRange: change.oldRange,
              newRange: change.newRange,
              partial: !isFullyWithinRange,
              editor: this.editor,
              transaction,
              combinedTransform: nextTransaction
            });
          });
        }
      });
      const mapping = nextTransaction.mapping;
      nextTransaction.steps.forEach((step, index) => {
        var _a32, _b3;
        if (step instanceof import_transform9.RemoveMarkStep) {
          const newStart = mapping.slice(index).map(step.from, -1);
          const newEnd = mapping.slice(index).map(step.to);
          const oldStart = mapping.invert().map(newStart, -1);
          const oldEnd = mapping.invert().map(newEnd);
          const foundBeforeMark = (_a32 = nextTransaction.doc.nodeAt(newStart - 1)) == null ? void 0 : _a32.marks.some((mark) => mark.eq(step.mark));
          const foundAfterMark = (_b3 = nextTransaction.doc.nodeAt(newEnd)) == null ? void 0 : _b3.marks.some((mark) => mark.eq(step.mark));
          this.editor.emit("delete", {
            type: "mark",
            mark: step.mark,
            from: step.from,
            to: step.to,
            deletedRange: {
              from: oldStart,
              to: oldEnd
            },
            newRange: {
              from: newStart,
              to: newEnd
            },
            partial: Boolean(foundAfterMark || foundBeforeMark),
            editor: this.editor,
            transaction,
            combinedTransform: nextTransaction
          });
        }
      });
    };
    if ((_c = (_b = (_a4 = this.editor.options.coreExtensionOptions) == null ? void 0 : _a4.delete) == null ? void 0 : _b.async) != null ? _c : true) {
      setTimeout(callback, 0);
    } else {
      callback();
    }
  }
});
var Drop = Extension.create({
  name: "drop",
  addProseMirrorPlugins() {
    return [
      new import_state16.Plugin({
        key: new import_state16.PluginKey("tiptapDrop"),
        props: {
          handleDrop: (_, e, slice, moved) => {
            this.editor.emit("drop", {
              editor: this.editor,
              event: e,
              slice,
              moved
            });
          }
        }
      })
    ];
  }
});
var Editable = Extension.create({
  name: "editable",
  addProseMirrorPlugins() {
    return [
      new import_state17.Plugin({
        key: new import_state17.PluginKey("editable"),
        props: {
          editable: () => this.editor.options.editable
        }
      })
    ];
  }
});
var focusEventsPluginKey = new import_state18.PluginKey("focusEvents");
var FocusEvents = Extension.create({
  name: "focusEvents",
  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      new import_state18.Plugin({
        key: focusEventsPluginKey,
        props: {
          handleDOMEvents: {
            focus: (view, event) => {
              editor.isFocused = true;
              const transaction = editor.state.tr.setMeta("focus", { event }).setMeta("addToHistory", false);
              view.dispatch(transaction);
              return false;
            },
            blur: (view, event) => {
              editor.isFocused = false;
              const transaction = editor.state.tr.setMeta("blur", { event }).setMeta("addToHistory", false);
              view.dispatch(transaction);
              return false;
            }
          }
        }
      })
    ];
  }
});
var Keymap = Extension.create({
  name: "keymap",
  addKeyboardShortcuts() {
    const handleBackspace = () => this.editor.commands.first(({ commands }) => [
      () => commands.undoInputRule(),
      // maybe convert first text block node to default node
      () => commands.command(({ tr }) => {
        const { selection, doc } = tr;
        const { empty, $anchor } = selection;
        const { pos, parent } = $anchor;
        const $parentPos = $anchor.parent.isTextblock && pos > 0 ? tr.doc.resolve(pos - 1) : $anchor;
        const parentIsIsolating = $parentPos.parent.type.spec.isolating;
        const parentPos = $anchor.pos - $anchor.parentOffset;
        const isAtStart = parentIsIsolating && $parentPos.parent.childCount === 1 ? parentPos === $anchor.pos : import_state19.Selection.atStart(doc).from === pos;
        if (!empty || !parent.type.isTextblock || parent.textContent.length || !isAtStart || isAtStart && $anchor.parent.type.name === "paragraph") {
          return false;
        }
        return commands.clearNodes();
      }),
      () => commands.deleteSelection(),
      () => commands.joinBackward(),
      () => commands.selectNodeBackward()
    ]);
    const handleDelete = () => this.editor.commands.first(({ commands }) => [
      () => commands.deleteSelection(),
      () => commands.deleteCurrentNode(),
      () => commands.joinForward(),
      () => commands.selectNodeForward()
    ]);
    const handleEnter = () => this.editor.commands.first(({ commands }) => [
      () => commands.newlineInCode(),
      () => commands.createParagraphNear(),
      () => commands.liftEmptyBlock(),
      () => commands.splitBlock()
    ]);
    const baseKeymap = {
      Enter: handleEnter,
      "Mod-Enter": () => this.editor.commands.exitCode(),
      Backspace: handleBackspace,
      "Mod-Backspace": handleBackspace,
      "Shift-Backspace": handleBackspace,
      Delete: handleDelete,
      "Mod-Delete": handleDelete,
      "Mod-a": () => this.editor.commands.selectAll()
    };
    const pcKeymap = {
      ...baseKeymap
    };
    const macKeymap = {
      ...baseKeymap,
      "Ctrl-h": handleBackspace,
      "Alt-Backspace": handleBackspace,
      "Ctrl-d": handleDelete,
      "Ctrl-Alt-Backspace": handleDelete,
      "Alt-Delete": handleDelete,
      "Alt-d": handleDelete,
      "Ctrl-a": () => this.editor.commands.selectTextblockStart(),
      "Ctrl-e": () => this.editor.commands.selectTextblockEnd()
    };
    if (isiOS() || isMacOS()) {
      return macKeymap;
    }
    return pcKeymap;
  },
  addProseMirrorPlugins() {
    return [
      // With this plugin we check if the whole document was selected and deleted.
      // In this case we will additionally call `clearNodes()` to convert e.g. a heading
      // to a paragraph if necessary.
      // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
      // with many other commands.
      new import_state19.Plugin({
        key: new import_state19.PluginKey("clearDocument"),
        appendTransaction: (transactions, oldState, newState) => {
          if (transactions.some((tr2) => tr2.getMeta("composition"))) {
            return;
          }
          const docChanges = transactions.some((transaction) => transaction.docChanged) && !oldState.doc.eq(newState.doc);
          const ignoreTr = transactions.some((transaction) => transaction.getMeta("preventClearDocument"));
          if (!docChanges || ignoreTr) {
            return;
          }
          const { empty, from, to } = oldState.selection;
          const allFrom = import_state19.Selection.atStart(oldState.doc).from;
          const allEnd = import_state19.Selection.atEnd(oldState.doc).to;
          const allWasSelected = from === allFrom && to === allEnd;
          if (empty || !allWasSelected) {
            return;
          }
          const isEmpty = isNodeEmpty(newState.doc);
          if (!isEmpty) {
            return;
          }
          const tr = newState.tr;
          const state = createChainableState({
            state: newState,
            transaction: tr
          });
          const { commands } = new CommandManager({
            editor: this.editor,
            state
          });
          commands.clearNodes();
          if (!tr.steps.length) {
            return;
          }
          return tr;
        }
      })
    ];
  }
});
var Paste = Extension.create({
  name: "paste",
  addProseMirrorPlugins() {
    return [
      new import_state20.Plugin({
        key: new import_state20.PluginKey("tiptapPaste"),
        props: {
          handlePaste: (_view, e, slice) => {
            this.editor.emit("paste", {
              editor: this.editor,
              event: e,
              slice
            });
          }
        }
      })
    ];
  }
});
var Tabindex = Extension.create({
  name: "tabindex",
  addProseMirrorPlugins() {
    return [
      new import_state21.Plugin({
        key: new import_state21.PluginKey("tabindex"),
        props: {
          attributes: () => this.editor.isEditable ? { tabindex: "0" } : {}
        }
      })
    ];
  }
});
var TextDirection = Extension.create({
  name: "textDirection",
  addOptions() {
    return {
      direction: void 0
    };
  },
  addGlobalAttributes() {
    if (!this.options.direction) {
      return [];
    }
    const { nodeExtensions } = splitExtensions(this.extensions);
    return [
      {
        types: nodeExtensions.filter((extension) => extension.name !== "text").map((extension) => extension.name),
        attributes: {
          dir: {
            default: this.options.direction,
            parseHTML: (element) => {
              const dir = element.getAttribute("dir");
              if (dir && (dir === "ltr" || dir === "rtl" || dir === "auto")) {
                return dir;
              }
              return this.options.direction;
            },
            renderHTML: (attributes) => {
              if (!attributes.dir) {
                return {};
              }
              return {
                dir: attributes.dir
              };
            }
          }
        }
      }
    ];
  },
  addProseMirrorPlugins() {
    return [
      new import_state22.Plugin({
        key: new import_state22.PluginKey("textDirection"),
        props: {
          attributes: () => {
            const direction = this.options.direction;
            if (!direction) {
              return {};
            }
            return {
              dir: direction
            };
          }
        }
      })
    ];
  }
});
var markdown_exports = {};
__export3(markdown_exports, {
  createAtomBlockMarkdownSpec: () => createAtomBlockMarkdownSpec,
  createBlockMarkdownSpec: () => createBlockMarkdownSpec,
  createInlineMarkdownSpec: () => createInlineMarkdownSpec,
  parseAttributes: () => parseAttributes,
  parseIndentedBlocks: () => parseIndentedBlocks,
  renderNestedMarkdownContent: () => renderNestedMarkdownContent,
  serializeAttributes: () => serializeAttributes
});
function parseAttributes(attrString) {
  if (!(attrString == null ? void 0 : attrString.trim())) {
    return {};
  }
  const attributes = {};
  const quotedStrings = [];
  const tempString = attrString.replace(/["']([^"']*)["']/g, (match) => {
    quotedStrings.push(match);
    return `__QUOTED_${quotedStrings.length - 1}__`;
  });
  const classMatches = tempString.match(/(?:^|\s)\.([a-zA-Z][\w-]*)/g);
  if (classMatches) {
    const classes = classMatches.map((match) => match.trim().slice(1));
    attributes.class = classes.join(" ");
  }
  const idMatch = tempString.match(/(?:^|\s)#([a-zA-Z][\w-]*)/);
  if (idMatch) {
    attributes.id = idMatch[1];
  }
  const kvRegex = /([a-zA-Z][\w-]*)\s*=\s*(__QUOTED_\d+__)/g;
  const kvMatches = Array.from(tempString.matchAll(kvRegex));
  kvMatches.forEach(([, key, quotedRef]) => {
    var _a4;
    const quotedIndex = parseInt(((_a4 = quotedRef.match(/__QUOTED_(\d+)__/)) == null ? void 0 : _a4[1]) || "0", 10);
    const quotedValue = quotedStrings[quotedIndex];
    if (quotedValue) {
      attributes[key] = quotedValue.slice(1, -1);
    }
  });
  const cleanString = tempString.replace(/(?:^|\s)\.([a-zA-Z][\w-]*)/g, "").replace(/(?:^|\s)#([a-zA-Z][\w-]*)/g, "").replace(/([a-zA-Z][\w-]*)\s*=\s*__QUOTED_\d+__/g, "").trim();
  if (cleanString) {
    const booleanAttrs = cleanString.split(/\s+/).filter(Boolean);
    booleanAttrs.forEach((attr) => {
      if (attr.match(/^[a-zA-Z][\w-]*$/)) {
        attributes[attr] = true;
      }
    });
  }
  return attributes;
}
function serializeAttributes(attributes) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return "";
  }
  const parts = [];
  if (attributes.class) {
    const classes = String(attributes.class).split(/\s+/).filter(Boolean);
    classes.forEach((cls) => parts.push(`.${cls}`));
  }
  if (attributes.id) {
    parts.push(`#${attributes.id}`);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "class" || key === "id") {
      return;
    }
    if (value === true) {
      parts.push(key);
    } else if (value !== false && value != null) {
      parts.push(`${key}="${String(value)}"`);
    }
  });
  return parts.join(" ");
}
function createAtomBlockMarkdownSpec(options) {
  const {
    nodeName,
    name: markdownName,
    parseAttributes: parseAttributes2 = parseAttributes,
    serializeAttributes: serializeAttributes2 = serializeAttributes,
    defaultAttributes = {},
    requiredAttributes = [],
    allowedAttributes
  } = options;
  const blockName = markdownName || nodeName;
  const filterAttributes = (attrs) => {
    if (!allowedAttributes) {
      return attrs;
    }
    const filtered = {};
    allowedAttributes.forEach((key) => {
      if (key in attrs) {
        filtered[key] = attrs[key];
      }
    });
    return filtered;
  };
  return {
    parseMarkdown: (token, h2) => {
      const attrs = { ...defaultAttributes, ...token.attributes };
      return h2.createNode(nodeName, attrs, []);
    },
    markdownTokenizer: {
      name: nodeName,
      level: "block",
      start(src) {
        var _a4;
        const regex = new RegExp(`^:::${blockName}(?:\\s|$)`, "m");
        const index = (_a4 = src.match(regex)) == null ? void 0 : _a4.index;
        return index !== void 0 ? index : -1;
      },
      tokenize(src, _tokens, _lexer) {
        const regex = new RegExp(`^:::${blockName}(?:\\s+\\{([^}]*)\\})?\\s*:::(?:\\n|$)`);
        const match = src.match(regex);
        if (!match) {
          return void 0;
        }
        const attrString = match[1] || "";
        const attributes = parseAttributes2(attrString);
        const missingRequired = requiredAttributes.find((required) => !(required in attributes));
        if (missingRequired) {
          return void 0;
        }
        return {
          type: nodeName,
          raw: match[0],
          attributes
        };
      }
    },
    renderMarkdown: (node) => {
      const filteredAttrs = filterAttributes(node.attrs || {});
      const attrs = serializeAttributes2(filteredAttrs);
      const attrString = attrs ? ` {${attrs}}` : "";
      return `:::${blockName}${attrString} :::`;
    }
  };
}
function createBlockMarkdownSpec(options) {
  const {
    nodeName,
    name: markdownName,
    getContent,
    parseAttributes: parseAttributes2 = parseAttributes,
    serializeAttributes: serializeAttributes2 = serializeAttributes,
    defaultAttributes = {},
    content = "block",
    allowedAttributes
  } = options;
  const blockName = markdownName || nodeName;
  const filterAttributes = (attrs) => {
    if (!allowedAttributes) {
      return attrs;
    }
    const filtered = {};
    allowedAttributes.forEach((key) => {
      if (key in attrs) {
        filtered[key] = attrs[key];
      }
    });
    return filtered;
  };
  return {
    parseMarkdown: (token, h2) => {
      let nodeContent;
      if (getContent) {
        const contentResult = getContent(token);
        nodeContent = typeof contentResult === "string" ? [{ type: "text", text: contentResult }] : contentResult;
      } else if (content === "block") {
        nodeContent = h2.parseChildren(token.tokens || []);
      } else {
        nodeContent = h2.parseInline(token.tokens || []);
      }
      const attrs = { ...defaultAttributes, ...token.attributes };
      return h2.createNode(nodeName, attrs, nodeContent);
    },
    markdownTokenizer: {
      name: nodeName,
      level: "block",
      start(src) {
        var _a4;
        const regex = new RegExp(`^:::${blockName}`, "m");
        const index = (_a4 = src.match(regex)) == null ? void 0 : _a4.index;
        return index !== void 0 ? index : -1;
      },
      tokenize(src, _tokens, lexer) {
        var _a4;
        const openingRegex = new RegExp(`^:::${blockName}(?:\\s+\\{([^}]*)\\})?\\s*\\n`);
        const openingMatch = src.match(openingRegex);
        if (!openingMatch) {
          return void 0;
        }
        const [openingTag, attrString = ""] = openingMatch;
        const attributes = parseAttributes2(attrString);
        let level = 1;
        const position = openingTag.length;
        let matchedContent = "";
        const blockPattern = /^:::([\w-]*)(\s.*)?/gm;
        const remaining = src.slice(position);
        blockPattern.lastIndex = 0;
        for (; ; ) {
          const match = blockPattern.exec(remaining);
          if (match === null) {
            break;
          }
          const matchPos = match.index;
          const blockType = match[1];
          if ((_a4 = match[2]) == null ? void 0 : _a4.endsWith(":::")) {
            continue;
          }
          if (blockType) {
            level += 1;
          } else {
            level -= 1;
            if (level === 0) {
              const rawContent = remaining.slice(0, matchPos);
              matchedContent = rawContent.trim();
              const fullMatch = src.slice(0, position + matchPos + match[0].length);
              let contentTokens = [];
              if (matchedContent) {
                if (content === "block") {
                  contentTokens = lexer.blockTokens(rawContent);
                  contentTokens.forEach((token) => {
                    if (token.text && (!token.tokens || token.tokens.length === 0)) {
                      token.tokens = lexer.inlineTokens(token.text);
                    }
                  });
                  while (contentTokens.length > 0) {
                    const lastToken = contentTokens[contentTokens.length - 1];
                    if (lastToken.type === "paragraph" && (!lastToken.text || lastToken.text.trim() === "")) {
                      contentTokens.pop();
                    } else {
                      break;
                    }
                  }
                } else {
                  contentTokens = lexer.inlineTokens(matchedContent);
                }
              }
              return {
                type: nodeName,
                raw: fullMatch,
                attributes,
                content: matchedContent,
                tokens: contentTokens
              };
            }
          }
        }
        return void 0;
      }
    },
    renderMarkdown: (node, h2) => {
      const filteredAttrs = filterAttributes(node.attrs || {});
      const attrs = serializeAttributes2(filteredAttrs);
      const attrString = attrs ? ` {${attrs}}` : "";
      const renderedContent = h2.renderChildren(node.content || [], "\n\n");
      return `:::${blockName}${attrString}

${renderedContent}

:::`;
    }
  };
}
function parseShortcodeAttributes(attrString) {
  if (!attrString.trim()) {
    return {};
  }
  const attributes = {};
  const regex = /(\w+)=(?:"([^"]*)"|'([^']*)')/g;
  let match = regex.exec(attrString);
  while (match !== null) {
    const [, key, doubleQuoted, singleQuoted] = match;
    attributes[key] = doubleQuoted || singleQuoted;
    match = regex.exec(attrString);
  }
  return attributes;
}
function serializeShortcodeAttributes(attrs) {
  return Object.entries(attrs).filter(([, value]) => value !== void 0 && value !== null).map(([key, value]) => `${key}="${value}"`).join(" ");
}
function createInlineMarkdownSpec(options) {
  const {
    nodeName,
    name: shortcodeName,
    getContent,
    parseAttributes: parseAttributes2 = parseShortcodeAttributes,
    serializeAttributes: serializeAttributes2 = serializeShortcodeAttributes,
    defaultAttributes = {},
    selfClosing = false,
    allowedAttributes
  } = options;
  const shortcode = shortcodeName || nodeName;
  const filterAttributes = (attrs) => {
    if (!allowedAttributes) {
      return attrs;
    }
    const filtered = {};
    allowedAttributes.forEach((attr) => {
      const attrName = typeof attr === "string" ? attr : attr.name;
      const skipIfDefault = typeof attr === "string" ? void 0 : attr.skipIfDefault;
      if (attrName in attrs) {
        const value = attrs[attrName];
        if (skipIfDefault !== void 0 && value === skipIfDefault) {
          return;
        }
        filtered[attrName] = value;
      }
    });
    return filtered;
  };
  const escapedShortcode = shortcode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    parseMarkdown: (token, h2) => {
      const attrs = { ...defaultAttributes, ...token.attributes };
      if (selfClosing) {
        return h2.createNode(nodeName, attrs);
      }
      const content = getContent ? getContent(token) : token.content || "";
      if (content) {
        return h2.createNode(nodeName, attrs, [h2.createTextNode(content)]);
      }
      return h2.createNode(nodeName, attrs, []);
    },
    markdownTokenizer: {
      name: nodeName,
      level: "inline",
      start(src) {
        const startPattern = selfClosing ? new RegExp(`\\[${escapedShortcode}\\s*[^\\]]*\\]`) : new RegExp(`\\[${escapedShortcode}\\s*[^\\]]*\\][\\s\\S]*?\\[\\/${escapedShortcode}\\]`);
        const match = src.match(startPattern);
        const index = match == null ? void 0 : match.index;
        return index !== void 0 ? index : -1;
      },
      tokenize(src, _tokens, _lexer) {
        const tokenPattern = selfClosing ? new RegExp(`^\\[${escapedShortcode}\\s*([^\\]]*)\\]`) : new RegExp(`^\\[${escapedShortcode}\\s*([^\\]]*)\\]([\\s\\S]*?)\\[\\/${escapedShortcode}\\]`);
        const match = src.match(tokenPattern);
        if (!match) {
          return void 0;
        }
        let content = "";
        let attrString = "";
        if (selfClosing) {
          const [, attrs] = match;
          attrString = attrs;
        } else {
          const [, attrs, contentMatch] = match;
          attrString = attrs;
          content = contentMatch || "";
        }
        const attributes = parseAttributes2(attrString.trim());
        return {
          type: nodeName,
          raw: match[0],
          content: content.trim(),
          attributes
        };
      }
    },
    renderMarkdown: (node) => {
      let content = "";
      if (getContent) {
        content = getContent(node);
      } else if (node.content && node.content.length > 0) {
        content = node.content.filter((child) => child.type === "text").map((child) => child.text).join("");
      }
      const filteredAttrs = filterAttributes(node.attrs || {});
      const attrs = serializeAttributes2(filteredAttrs);
      const attrString = attrs ? ` ${attrs}` : "";
      if (selfClosing) {
        return `[${shortcode}${attrString}]`;
      }
      return `[${shortcode}${attrString}]${content}[/${shortcode}]`;
    }
  };
}
function parseIndentedBlocks(src, config, lexer) {
  var _a4, _b, _c, _d;
  const lines = src.split("\n");
  const items = [];
  let totalRaw = "";
  let i = 0;
  const baseIndentSize = config.baseIndentSize || 2;
  while (i < lines.length) {
    const currentLine = lines[i];
    const itemMatch = currentLine.match(config.itemPattern);
    if (!itemMatch) {
      if (items.length > 0) {
        break;
      } else if (currentLine.trim() === "") {
        i += 1;
        totalRaw = `${totalRaw}${currentLine}
`;
        continue;
      } else {
        return void 0;
      }
    }
    const itemData = config.extractItemData(itemMatch);
    const { indentLevel, mainContent } = itemData;
    totalRaw = `${totalRaw}${currentLine}
`;
    const itemContent = [mainContent];
    i += 1;
    while (i < lines.length) {
      const nextLine = lines[i];
      if (nextLine.trim() === "") {
        const nextNonEmptyIndex = lines.slice(i + 1).findIndex((l) => l.trim() !== "");
        if (nextNonEmptyIndex === -1) {
          break;
        }
        const nextNonEmpty = lines[i + 1 + nextNonEmptyIndex];
        const nextIndent2 = ((_b = (_a4 = nextNonEmpty.match(/^(\s*)/)) == null ? void 0 : _a4[1]) == null ? void 0 : _b.length) || 0;
        if (nextIndent2 > indentLevel) {
          itemContent.push(nextLine);
          totalRaw = `${totalRaw}${nextLine}
`;
          i += 1;
          continue;
        } else {
          break;
        }
      }
      const nextIndent = ((_d = (_c = nextLine.match(/^(\s*)/)) == null ? void 0 : _c[1]) == null ? void 0 : _d.length) || 0;
      if (nextIndent > indentLevel) {
        itemContent.push(nextLine);
        totalRaw = `${totalRaw}${nextLine}
`;
        i += 1;
      } else {
        break;
      }
    }
    let nestedTokens;
    const nestedContent = itemContent.slice(1);
    if (nestedContent.length > 0) {
      const dedentedNested = nestedContent.map((nestedLine) => nestedLine.slice(indentLevel + baseIndentSize)).join("\n");
      if (dedentedNested.trim()) {
        if (config.customNestedParser) {
          nestedTokens = config.customNestedParser(dedentedNested);
        } else {
          nestedTokens = lexer.blockTokens(dedentedNested);
        }
      }
    }
    const token = config.createToken(itemData, nestedTokens);
    items.push(token);
  }
  if (items.length === 0) {
    return void 0;
  }
  return {
    items,
    raw: totalRaw
  };
}
function renderNestedMarkdownContent(node, h2, prefixOrGenerator, ctx) {
  if (!node || !Array.isArray(node.content)) {
    return "";
  }
  const prefix = typeof prefixOrGenerator === "function" ? prefixOrGenerator(ctx) : prefixOrGenerator;
  const [content, ...children] = node.content;
  const mainContent = h2.renderChildren([content]);
  const output = [`${prefix}${mainContent}`];
  if (children && children.length > 0) {
    children.forEach((child) => {
      const childContent = h2.renderChildren([child]);
      if (childContent) {
        const indentedChild = childContent.split("\n").map((line) => line ? h2.indent(line) : "").join("\n");
        output.push(indentedChild);
      }
    });
  }
  return output.join("\n");
}
function updateMarkViewAttributes(checkMark, editor, attrs = {}) {
  const { state } = editor;
  const { doc, tr } = state;
  const thisMark = checkMark;
  doc.descendants((node, pos) => {
    const from = tr.mapping.map(pos);
    const to = tr.mapping.map(pos) + node.nodeSize;
    let foundMark = null;
    node.marks.forEach((mark) => {
      if (mark !== thisMark) {
        return false;
      }
      foundMark = mark;
    });
    if (!foundMark) {
      return;
    }
    let needsUpdate = false;
    Object.keys(attrs).forEach((k) => {
      if (attrs[k] !== foundMark.attrs[k]) {
        needsUpdate = true;
      }
    });
    if (needsUpdate) {
      const updatedMark = checkMark.type.create({
        ...checkMark.attrs,
        ...attrs
      });
      tr.removeMark(from, to, checkMark.type);
      tr.addMark(from, to, updatedMark);
    }
  });
  if (tr.docChanged) {
    editor.view.dispatch(tr);
  }
}

// src/lib/comment-mark.ts
var import_state25 = require("@tiptap/pm/state");
var CommentMark = Mark.create({
  name: "comment",
  addOptions() {
    return {
      onCommentClick: void 0
    };
  },
  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-comment-id"),
        renderHTML: (attributes) => ({
          "data-comment-id": attributes.commentId
        })
      }
    };
  },
  parseHTML() {
    return [{ tag: "mark[data-comment-id]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "mark",
      mergeAttributes(HTMLAttributes, {
        class: "bg-yellow-200/50 dark:bg-yellow-500/30 dark:text-foreground cursor-pointer hover:bg-yellow-300/60 dark:hover:bg-yellow-500/40 transition-colors rounded-sm"
      }),
      0
    ];
  },
  addCommands() {
    return {
      setComment: (commentId) => ({ commands }) => {
        return commands.setMark(this.name, { commentId });
      },
      unsetComment: (commentId) => ({ tr, state }) => {
        const { doc } = state;
        let found = false;
        doc.descendants((node, pos) => {
          node.marks.forEach((mark) => {
            if (mark.type.name === this.name && mark.attrs.commentId === commentId) {
              tr.removeMark(pos, pos + node.nodeSize, mark.type);
              found = true;
            }
          });
        });
        return found;
      }
    };
  },
  addProseMirrorPlugins() {
    const { onCommentClick } = this.options;
    return [
      new import_state25.Plugin({
        key: new import_state25.PluginKey("commentClick"),
        props: {
          handleClick(view, pos) {
            if (!onCommentClick) return false;
            const { state } = view;
            const $pos = state.doc.resolve(pos);
            const marks = $pos.marks();
            const commentMark = marks.find((mark) => mark.type.name === "comment");
            if (commentMark && commentMark.attrs.commentId) {
              ;
              view.dom.blur();
              onCommentClick(commentMark.attrs.commentId);
              return true;
            }
            return false;
          }
        }
      })
    ];
  }
});
function addCommentMark(editor, commentId, from, to) {
  if (!editor.view || editor.isDestroyed) {
    console.warn("Cannot add comment mark: editor not ready");
    return;
  }
  editor.chain().setTextSelection({ from, to }).setComment(commentId).run();
}
function removeCommentMark(editor, commentId) {
  if (!editor.view || editor.isDestroyed) return;
  editor.chain().unsetComment(commentId).run();
}
function applyCommentMarks(editor, comments) {
  if (!editor.view || editor.isDestroyed) return;
  const { doc } = editor.state;
  const textContent = doc.textContent;
  comments.forEach((comment) => {
    if (!comment.quotedText || comment.parentId || comment.resolved) return;
    const index = textContent.indexOf(comment.quotedText);
    if (index === -1) return;
    let currentPos = 0;
    let startPos = null;
    let endPos = null;
    doc.descendants((node, pos) => {
      if (startPos !== null && endPos !== null) return false;
      if (node.isText && node.text) {
        const nodeStart = currentPos;
        const nodeEnd = currentPos + node.text.length;
        if (startPos === null && nodeEnd > index) {
          const offsetInNode = index - nodeStart;
          startPos = pos + offsetInNode;
        }
        if (startPos !== null && endPos === null) {
          const targetEnd = index + comment.quotedText.length;
          if (nodeEnd >= targetEnd) {
            const offsetInNode = targetEnd - nodeStart;
            endPos = pos + offsetInNode;
          }
        }
        currentPos = nodeEnd;
      }
      return true;
    });
    if (startPos !== null && endPos !== null) {
      editor.chain().setTextSelection({ from: startPos, to: endPos }).setComment(comment.id).setTextSelection(endPos).run();
    }
  });
}
function scrollToComment(editor, commentId) {
  if (!editor.view || editor.isDestroyed) return;
  const { doc } = editor.state;
  doc.descendants((node, pos) => {
    const commentMark = node.marks.find(
      (mark) => mark.type.name === "comment" && mark.attrs.commentId === commentId
    );
    if (commentMark) {
      editor.chain().setTextSelection(pos).run();
      const view = editor.view;
      const coords = view.coordsAtPos(pos);
      const editorRect = view.dom.getBoundingClientRect();
      if (coords.top < editorRect.top || coords.bottom > editorRect.bottom) {
        view.dom.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }
    return true;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AI_MODELS,
  CommentMark,
  DEFAULT_AUTO_DRAFT_TEMPLATE,
  DEFAULT_CHAT_TEMPLATE,
  DEFAULT_EXPAND_PLAN_TEMPLATE,
  DEFAULT_GENERATE_TEMPLATE,
  DEFAULT_PLAN_RULES,
  DEFAULT_PLAN_TEMPLATE,
  DEFAULT_REWRITE_TEMPLATE,
  addCommentMark,
  applyCommentMarks,
  buildAutoDraftPrompt,
  buildChatPrompt,
  buildExpandPlanPrompt,
  buildGeneratePrompt,
  buildPlanPrompt,
  buildRewritePrompt,
  canDeleteComment,
  canEditComment,
  createAPIHandler,
  createAutoblogger,
  createCommentsClient,
  createCrudData,
  createDestinationDispatcher,
  fetchRssFeeds,
  filterByKeywords,
  formatDate,
  generate,
  generateSlug,
  getDefaultModel,
  getModel,
  getSeoValues,
  htmlToMarkdown,
  markdownToHtml,
  parseGeneratedContent,
  parseMarkdown,
  removeCommentMark,
  renderMarkdown,
  renderMarkdownSanitized,
  resolveModel,
  runAutoDraft,
  scrollToComment,
  truncate,
  validateSchema,
  wordCount
});
//# sourceMappingURL=index.js.map