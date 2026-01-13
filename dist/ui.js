"use client";
"use strict";
"use client";
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

// src/ui/index.ts
var ui_exports = {};
__export(ui_exports, {
  AutobloggerDashboard: () => AutobloggerDashboard,
  ChatContext: () => ChatContext,
  ChatPanel: () => ChatPanel,
  ChatProvider: () => ChatProvider,
  CommentThread: () => CommentThread,
  CommentsPanel: () => CommentsPanel,
  ControlButton: () => ControlButton,
  ModelSelector: () => ModelSelector,
  Navbar: () => Navbar,
  useAIModels: () => useAIModels,
  useChatContext: () => useChatContext,
  useChatContextOptional: () => useChatContextOptional,
  useComments: () => useComments,
  useDashboardContext: () => useDashboardContext
});
module.exports = __toCommonJS(ui_exports);

// src/ui/dashboard.tsx
var import_react20 = require("react");
var import_lucide_react13 = require("lucide-react");

// src/ui/context.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var DashboardContext = (0, import_react.createContext)(null);
function useDashboardContext() {
  const ctx = (0, import_react.useContext)(DashboardContext);
  if (!ctx) throw new Error("useDashboardContext must be used within DashboardProvider");
  return ctx;
}
var DEFAULT_STYLES = {
  container: "max-w-[680px] mx-auto px-6",
  title: "text-2xl font-bold",
  subtitle: "text-lg text-muted-foreground",
  byline: "text-sm text-muted-foreground",
  prose: "prose dark:prose-invert max-w-none"
};
function extractPath(pathname, basePath) {
  const normalized = pathname.replace(/\/$/, "");
  const base = basePath.replace(/\/$/, "");
  if (normalized === base) return "/";
  if (normalized.startsWith(base + "/")) return normalized.slice(base.length) || "/";
  return "/";
}
function DashboardProvider({
  basePath = "/writer",
  apiBasePath = "/api/cms",
  styles,
  fields = [],
  session = null,
  onEditorStateChange,
  onRegisterEditHandler,
  children
}) {
  const [currentPath, setCurrentPath] = (0, import_react.useState)("/");
  const [sharedData, setSharedData] = (0, import_react.useState)(null);
  const [sharedDataLoading, setSharedDataLoading] = (0, import_react.useState)(true);
  const [historyDepth, setHistoryDepth] = (0, import_react.useState)(0);
  const editorStateRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(extractPath(window.location.pathname, basePath));
      const handlePopState = () => {
        if (editorStateRef.current?.hasUnsavedChanges) {
          if (!editorStateRef.current.confirmLeave()) {
            const currentFullPath = basePath + (currentPath === "/" ? "" : currentPath);
            window.history.pushState({}, "", currentFullPath);
            return;
          }
        }
        setCurrentPath(extractPath(window.location.pathname, basePath));
        setHistoryDepth((d) => Math.max(0, d - 1));
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [basePath, currentPath]);
  const navigate = (0, import_react.useCallback)((path) => {
    if (editorStateRef.current?.hasUnsavedChanges) {
      if (!editorStateRef.current.confirmLeave()) {
        return;
      }
    }
    const fullPath = path.startsWith("/") ? basePath + path : basePath + "/" + path;
    window.history.pushState({}, "", fullPath);
    setCurrentPath(path.startsWith("/") ? path : "/" + path);
    setHistoryDepth((d) => d + 1);
  }, [basePath]);
  const goBack = (0, import_react.useCallback)(() => {
    if (historyDepth > 0) {
      window.history.back();
    } else {
      navigate("/");
    }
  }, [historyDepth, navigate]);
  const canGoBack = historyDepth > 0;
  const fetchSharedData = (0, import_react.useCallback)(async () => {
    setSharedDataLoading(true);
    try {
      const [countsRes, settingsRes, postsRes, aiSettingsRes] = await Promise.all([
        fetch(`${apiBasePath}/admin/counts`).then((r) => r.ok ? r.json() : null),
        fetch(`${apiBasePath}/settings`).then((r) => r.ok ? r.json() : null),
        fetch(`${apiBasePath}/posts`).then((r) => r.ok ? r.json() : null),
        fetch(`${apiBasePath}/ai/settings`).then((r) => r.ok ? r.json() : null)
      ]);
      const autoDraftEnabled = settingsRes?.data?.autoDraftEnabled ?? false;
      const postUrlPattern = settingsRes?.data?.postUrlPattern ?? "/e/{slug}";
      let suggestedPosts = [];
      if (autoDraftEnabled) {
        const suggestedRes = await fetch(`${apiBasePath}/posts?status=suggested`).then((r) => r.ok ? r.json() : null);
        suggestedPosts = suggestedRes?.data || [];
      }
      setSharedData({
        counts: countsRes?.data || {},
        settings: { autoDraftEnabled, postUrlPattern },
        posts: postsRes?.data || [],
        suggestedPosts,
        aiSettings: {
          defaultModel: aiSettingsRes?.data?.defaultModel || "claude-sonnet",
          availableModels: aiSettingsRes?.data?.availableModels || []
        }
      });
    } catch (err) {
      console.error("Failed to fetch shared data:", err);
      setSharedData({
        counts: {},
        settings: { autoDraftEnabled: false, postUrlPattern: "/e/{slug}" },
        posts: [],
        suggestedPosts: [],
        aiSettings: { defaultModel: "claude-sonnet", availableModels: [] }
      });
    } finally {
      setSharedDataLoading(false);
    }
  }, [apiBasePath]);
  (0, import_react.useEffect)(() => {
    fetchSharedData();
  }, [fetchSharedData]);
  const handleEditorStateChange = (0, import_react.useCallback)((state) => {
    editorStateRef.current = state;
    onEditorStateChange?.(state);
  }, [onEditorStateChange]);
  const mergedStyles = (0, import_react.useMemo)(
    () => ({ ...DEFAULT_STYLES, ...styles }),
    [styles]
  );
  const config = (0, import_react.useMemo)(
    () => ({ fields, styles: mergedStyles }),
    [fields, mergedStyles]
  );
  const contextValue = (0, import_react.useMemo)(() => ({
    basePath,
    apiBasePath,
    styles: mergedStyles,
    fields,
    currentPath,
    navigate,
    goBack,
    canGoBack,
    config,
    session,
    sharedData,
    sharedDataLoading,
    refetchSharedData: fetchSharedData,
    onEditorStateChange: handleEditorStateChange,
    onRegisterEditHandler
  }), [
    basePath,
    apiBasePath,
    mergedStyles,
    fields,
    currentPath,
    navigate,
    goBack,
    canGoBack,
    config,
    session,
    sharedData,
    sharedDataLoading,
    fetchSharedData,
    handleEditorStateChange,
    onRegisterEditHandler
  ]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardContext.Provider, { value: contextValue, children });
}

// src/ui/pages/WriterDashboard.tsx
var import_react4 = require("react");
var import_lucide_react2 = require("lucide-react");

// src/ui/components/ControlButton.tsx
var import_react2 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var ControlButton = (0, import_react2.forwardRef)(
  ({ className = "", active, disabled, children, type = "button", ...props }, ref) => {
    const baseClasses = "inline-flex items-center gap-1 text-sm transition-colors focus:outline-none";
    const stateClasses = disabled ? "text-muted-foreground/30 cursor-not-allowed" : active ? "text-blue-500 dark:text-blue-400" : "text-muted-foreground active:text-foreground md:hover:text-foreground";
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "button",
      {
        ref,
        type,
        disabled,
        className: `${baseClasses} ${stateClasses} ${className}`,
        ...props,
        children
      }
    );
  }
);
ControlButton.displayName = "ControlButton";

// src/ui/components/ModelSelector.tsx
var import_react3 = require("react");
var import_lucide_react = require("lucide-react");
var import_jsx_runtime3 = require("react/jsx-runtime");
function ModelSelector({
  models,
  selectedModel,
  onModelChange,
  currentModel
}) {
  const [open, setOpen] = (0, import_react3.useState)(false);
  const ref = (0, import_react3.useRef)(null);
  const displayModel = currentModel ?? models.find((m) => m.id === selectedModel);
  (0, import_react3.useEffect)(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { ref, className: "relative", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(ControlButton, { onClick: () => setOpen(!open), children: [
      displayModel?.name || "Select model",
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ChevronDown, { className: "w-3.5 h-3.5" })
    ] }),
    open && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "absolute bottom-full left-0 mb-1 min-w-[180px] bg-popover border border-border rounded-lg shadow-lg z-[100] py-1", children: models.map((model) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "button",
      {
        onClick: () => {
          onModelChange(model.id);
          setOpen(false);
        },
        className: "w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: model.name }),
          selectedModel === model.id && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Check, { className: "w-4 h-4" })
        ]
      },
      model.id
    )) })
  ] });
}

// src/lib/models.ts
var LENGTH_OPTIONS = [300, 500, 800, 1e3];
var DEFAULT_MODELS = [
  { id: "claude-sonnet", name: "Sonnet 4.5", description: "Fast, capable", hasNativeSearch: false },
  { id: "claude-opus", name: "Opus 4.5", description: "Highest quality", hasNativeSearch: false },
  { id: "gpt-5.2", name: "GPT-5.2", description: "Latest OpenAI", hasNativeSearch: true },
  { id: "gpt-5-mini", name: "GPT-5 Mini", description: "Fast and efficient", hasNativeSearch: true }
];

// src/lib/format.ts
var MINUTE = 6e4;
var HOUR = 36e5;
var DAY = 864e5;
function formatRelativeTime(isoDate) {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / MINUTE);
  const hours = Math.floor(diffMs / HOUR);
  const days = Math.floor(diffMs / DAY);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
function formatSavedTime(date) {
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1e3);
  const diffMins = Math.floor(diffMs / MINUTE);
  if (diffSecs < 10) return "just now";
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
function countWords(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

// src/ui/pages/WriterDashboard.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function WriterDashboard() {
  const { apiBasePath, navigate, sharedData, sharedDataLoading } = useDashboardContext();
  const [posts, setPosts] = (0, import_react4.useState)([]);
  const [loading, setLoading] = (0, import_react4.useState)(true);
  const [searchQuery, setSearchQuery] = (0, import_react4.useState)("");
  const [searchOpen, setSearchOpen] = (0, import_react4.useState)(false);
  const [activeTab, setActiveTab] = (0, import_react4.useState)("all");
  const [suggestedPosts, setSuggestedPosts] = (0, import_react4.useState)([]);
  const [autoDraftEnabled, setAutoDraftEnabled] = (0, import_react4.useState)(false);
  const [suggestedOpen, setSuggestedOpen] = (0, import_react4.useState)(false);
  const [actionLoading, setActionLoading] = (0, import_react4.useState)(null);
  const [models, setModels] = (0, import_react4.useState)(DEFAULT_MODELS);
  const [modelId, setModelId] = (0, import_react4.useState)("claude-sonnet");
  const [length, setLength] = (0, import_react4.useState)(500);
  const [webEnabled, setWebEnabled] = (0, import_react4.useState)(false);
  const [thinkingEnabled, setThinkingEnabled] = (0, import_react4.useState)(false);
  const [lengthOpen, setLengthOpen] = (0, import_react4.useState)(false);
  (0, import_react4.useEffect)(() => {
    if (sharedData) {
      setPosts(sharedData.posts);
      setSuggestedPosts(sharedData.suggestedPosts);
      setAutoDraftEnabled(sharedData.settings.autoDraftEnabled);
      if (sharedData.aiSettings.availableModels.length > 0) {
        setModels(sharedData.aiSettings.availableModels);
      }
      if (sharedData.aiSettings.defaultModel) {
        setModelId(sharedData.aiSettings.defaultModel);
      }
      setLoading(false);
    }
  }, [sharedData]);
  (0, import_react4.useEffect)(() => {
    if (!sharedDataLoading) {
      setLoading(false);
    }
  }, [sharedDataLoading]);
  const currentModel = models.find((m) => m.id === modelId);
  const draftCount = (0, import_react4.useMemo)(() => posts.filter((p) => p.status === "draft").length, [posts]);
  const publishedCount = (0, import_react4.useMemo)(() => posts.filter((p) => p.status === "published").length, [posts]);
  const filteredPosts = (0, import_react4.useMemo)(() => {
    let result = posts.filter((p) => p.status !== "suggested" && p.status !== "deleted");
    if (searchQuery) {
      result = result.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeTab === "drafts") result = result.filter((p) => p.status === "draft");
    else if (activeTab === "published") result = result.filter((p) => p.status === "published");
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [posts, searchQuery, activeTab]);
  async function handleDelete(id) {
    if (!confirm("Delete this post?")) return;
    await fetch(`${apiBasePath}/posts/${id}`, { method: "DELETE" });
    setPosts(posts.filter((p) => p.id !== id));
  }
  async function handlePublish(id) {
    await fetch(`${apiBasePath}/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" })
    });
    setPosts(posts.map((p) => p.id === id ? { ...p, status: "published" } : p));
  }
  async function handleUnpublish(id) {
    await fetch(`${apiBasePath}/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "draft" })
    });
    setPosts(posts.map((p) => p.id === id ? { ...p, status: "draft" } : p));
  }
  async function handleAcceptSuggested(post) {
    setActionLoading(post.id);
    try {
      const res = await fetch(`${apiBasePath}/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" })
      });
      if (res.ok) navigate(`/editor/${post.slug}`);
    } finally {
      setActionLoading(null);
    }
  }
  async function handleRejectSuggested(post) {
    if (!confirm(`Reject "${post.title}"?`)) return;
    setActionLoading(post.id);
    try {
      const res = await fetch(`${apiBasePath}/posts/${post.id}`, { method: "DELETE" });
      if (res.ok) setSuggestedPosts(suggestedPosts.filter((p) => p.id !== post.id));
    } finally {
      setActionLoading(null);
    }
  }
  function handleIdeaSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const idea = formData.get("idea")?.trim();
    if (idea) {
      const params = new URLSearchParams({
        idea,
        model: modelId,
        length: String(length),
        ...webEnabled && { web: "1" },
        ...thinkingEnabled && { thinking: "1" }
      });
      navigate(`/editor?${params}`);
    }
  }
  if (loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "max-w-5xl mx-auto px-6 py-8", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mt-4 mb-8", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-6 w-48 bg-muted rounded animate-pulse mb-4" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-24 w-full bg-muted rounded animate-pulse" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex border-b border-border mb-6 gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-10 w-16 bg-muted rounded animate-pulse" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-10 w-20 bg-muted rounded animate-pulse" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-10 w-24 bg-muted rounded animate-pulse" })
      ] }),
      [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-16 bg-muted rounded animate-pulse mb-2" }, i))
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "max-w-5xl mx-auto px-6 py-8 pb-16", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "button",
      {
        onClick: () => navigate("/editor"),
        className: "sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 bg-primary text-primary-foreground flex items-center justify-center",
        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.Plus, { className: "w-6 h-6" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mt-4 mb-8", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "text-lg font-semibold mb-4", children: "What's on your mind?" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("form", { onSubmit: handleIdeaSubmit, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "relative", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "textarea",
            {
              name: "idea",
              placeholder: "Describe your idea...",
              rows: 3,
              className: "w-full min-h-[100px] px-3 py-2 pr-14 border border-input rounded-md bg-transparent resize-none text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground",
              onKeyDown: (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "button",
            {
              type: "submit",
              className: "absolute bottom-3 right-3 rounded-full w-10 h-10 bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/80",
              children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.ArrowUp, { className: "w-5 h-5" })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "relative", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(ControlButton, { onClick: () => setLengthOpen(!lengthOpen), children: [
              length,
              " words",
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.ChevronDown, { className: "w-3.5 h-3.5" })
            ] }),
            lengthOpen && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "absolute top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-md z-50", children: LENGTH_OPTIONS.map((len) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
              "button",
              {
                onClick: () => {
                  setLength(len);
                  setLengthOpen(false);
                },
                className: "w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between min-w-[120px]",
                children: [
                  len,
                  " words",
                  length === len && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.Check, { className: "w-4 h-4" })
                ]
              },
              len
            )) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ControlButton, { onClick: () => setWebEnabled(!webEnabled), active: webEnabled, title: "Search the web (works with all models)", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.Globe, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ControlButton, { onClick: () => setThinkingEnabled(!thinkingEnabled), active: thinkingEnabled, title: "Enable thinking mode", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.Brain, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ModelSelector, { models, selectedModel: modelId, onModelChange: setModelId, currentModel })
        ] })
      ] })
    ] }),
    autoDraftEnabled && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "mb-8", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("button", { onClick: () => setSuggestedOpen(!suggestedOpen), className: "flex items-center gap-2 text-lg font-semibold mb-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.ChevronDown, { className: `h-4 w-4 text-muted-foreground transition-transform ${suggestedOpen ? "" : "-rotate-90"}` }),
        "Suggested",
        suggestedPosts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center", children: suggestedPosts.length })
      ] }),
      suggestedOpen && (suggestedPosts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "space-y-2", children: suggestedPosts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center justify-between gap-4 py-3 border-b border-border", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "font-medium truncate", children: post.title }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-3 text-sm text-muted-foreground", children: [
            post.topic && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "bg-muted px-2 py-0.5 rounded text-xs", children: post.topic.name }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: new Date(post.createdAt).toLocaleDateString() }),
            post.sourceUrl && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
              "a",
              {
                href: post.sourceUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "flex items-center gap-1 hover:text-foreground",
                onClick: (e) => e.stopPropagation(),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.ExternalLink, { className: "h-3 w-3" }),
                  "Source"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "button",
            {
              onClick: () => handleRejectSuggested(post),
              disabled: actionLoading === post.id,
              className: "p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md",
              children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.X, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            "button",
            {
              onClick: () => handleAcceptSuggested(post),
              disabled: actionLoading === post.id,
              className: "px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm flex items-center gap-1",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.Check, { className: "h-4 w-4" }),
                "Accept"
              ]
            }
          )
        ] })
      ] }, post.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { className: "text-muted-foreground text-sm", children: [
        "No suggested essays \u2014",
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            onClick: () => navigate("/settings/topics"),
            className: "text-primary hover:underline",
            children: "configure topics"
          }
        ),
        " ",
        "to generate drafts"
      ] }))
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "relative flex items-center justify-between border-b border-border mb-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: `flex ${searchOpen ? "invisible sm:visible" : ""}`, children: ["all", "drafts", "published"].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
        "button",
        {
          onClick: () => setActiveTab(tab),
          className: `px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: [
            tab.charAt(0).toUpperCase() + tab.slice(1),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "text-muted-foreground ml-1", children: [
              "(",
              tab === "all" ? posts.filter((p) => p.status !== "suggested" && p.status !== "deleted").length : tab === "drafts" ? draftCount : publishedCount,
              ")"
            ] })
          ]
        },
        tab
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: `flex items-center gap-2 pb-2 ${searchOpen ? "absolute inset-x-0 sm:relative" : ""}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: () => navigate("/editor"), className: "hidden sm:flex p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.Plus, { className: "w-4 h-4" }) }),
        searchOpen ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-2 flex-1 sm:flex-initial", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "input",
            {
              type: "search",
              placeholder: "Search...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              autoFocus: true,
              className: "flex-1 sm:w-48 px-3 py-1.5 text-base bg-background border border-border rounded-md outline-none focus-visible:border-ring"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: () => {
            setSearchOpen(false);
            setSearchQuery("");
          }, className: "p-2 text-muted-foreground hover:text-foreground sm:hidden", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.X, { className: "w-4 h-4" }) })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: () => setSearchOpen(true), className: "p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.Search, { className: "w-4 h-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("section", { children: filteredPosts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "space-y-0", children: filteredPosts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      PostItem,
      {
        post,
        onNavigate: () => navigate(`/editor/${post.slug}`),
        onDelete: () => handleDelete(post.id),
        onPublish: () => handlePublish(post.id),
        onUnpublish: () => handleUnpublish(post.id),
        showStatus: activeTab === "all"
      },
      post.id
    )) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "text-muted-foreground py-8 text-center", children: searchQuery ? "No matching articles" : "No articles yet" }) })
  ] });
}
function PostItem({ post, onNavigate, onDelete, onPublish, onUnpublish, showStatus }) {
  const [menuOpen, setMenuOpen] = (0, import_react4.useState)(false);
  const menuRef = (0, import_react4.useRef)(null);
  (0, import_react4.useEffect)(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center justify-between py-4 border-b border-border group", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("button", { onClick: onNavigate, className: "block text-left w-full", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "font-medium truncate group-hover:text-muted-foreground", children: post.title || "Untitled" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { className: "text-sm text-muted-foreground mt-1 flex items-center gap-2", children: [
        showStatus && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: `text-xs px-1.5 py-0.5 rounded uppercase font-medium ${post.status === "draft" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-green-500/20 text-green-600 dark:text-green-400"}`, children: post.status }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
          formatRelativeTime(post.updatedAt),
          post.wordCount ? ` \xB7 ${post.wordCount} words` : ""
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "relative", ref: menuRef, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          onClick: () => setMenuOpen(!menuOpen),
          className: "p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent",
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react2.MoreVertical, { className: "w-4 h-4" })
        }
      ),
      menuOpen && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-50 min-w-[12rem] md:min-w-[8rem] p-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            onClick: () => {
              onNavigate();
              setMenuOpen(false);
            },
            className: "w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm hover:bg-accent cursor-default",
            children: "Edit"
          }
        ),
        post.status === "draft" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            onClick: () => {
              onPublish();
              setMenuOpen(false);
            },
            className: "w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm hover:bg-accent cursor-default",
            children: "Publish"
          }
        ),
        post.status === "published" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            onClick: () => {
              onUnpublish();
              setMenuOpen(false);
            },
            className: "w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm hover:bg-accent cursor-default",
            children: "Unpublish"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-px bg-border my-1" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            onClick: () => {
              onDelete();
              setMenuOpen(false);
            },
            className: "w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm text-destructive hover:bg-accent cursor-default",
            children: "Delete"
          }
        )
      ] })
    ] })
  ] });
}

// src/ui/pages/EditorPage.tsx
var import_react17 = require("react");

// src/ui/components/EditorToolbar.tsx
var import_lucide_react8 = require("lucide-react");

// src/lib/cn.ts
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
}

// src/ui/components/Skeleton.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
function Skeleton({ className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: cn("animate-pulse bg-muted rounded", className) });
}

// src/ui/components/toolbar/ToolbarButton.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
function ToolbarButton({ onClick, active, disabled, children, title }) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "button",
    {
      type: "button",
      onClick,
      disabled,
      title,
      className: cn(
        "px-2.5 py-1.5 text-sm font-medium rounded transition-colors",
        "flex items-center justify-center",
        "active:bg-gray-100 md:hover:bg-gray-100 dark:active:bg-gray-800 dark:md:hover:bg-gray-800",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        active && "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white",
        !active && "text-gray-600 dark:text-gray-400"
      ),
      children
    }
  );
}
function Divider() {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" });
}
function SkeletonButton() {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Skeleton, { className: "h-7 w-7 shrink-0 bg-gray-200 dark:bg-gray-800" });
}

// src/ui/components/toolbar/FormatButtons.tsx
var import_react5 = require("react");
var import_lucide_react3 = require("lucide-react");

// src/lib/markdown-helpers.ts
function insertAtCursor(textarea, before, after, markdown, onMarkdownChange) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = markdown.substring(start, end);
  const newText = markdown.substring(0, start) + before + selected + after + markdown.substring(end);
  onMarkdownChange(newText);
  requestAnimationFrame(() => {
    textarea.focus();
    const newCursorPos = start + before.length + selected.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  });
}
function insertBlockAtCursor(textarea, prefix, markdown, onMarkdownChange) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  let lineStart = start;
  while (lineStart > 0 && markdown[lineStart - 1] !== "\n") {
    lineStart--;
  }
  let lineEnd = end;
  while (lineEnd < markdown.length && markdown[lineEnd] !== "\n") {
    lineEnd++;
  }
  const lineContent = markdown.substring(lineStart, lineEnd);
  if (lineContent.startsWith(prefix)) {
    const newText = markdown.substring(0, lineStart) + lineContent.substring(prefix.length) + markdown.substring(lineEnd);
    onMarkdownChange(newText);
  } else {
    const newText = markdown.substring(0, lineStart) + prefix + lineContent + markdown.substring(lineEnd);
    onMarkdownChange(newText);
  }
  requestAnimationFrame(() => {
    textarea.focus();
  });
}
function setHeadingAtCursor(textarea, level, markdown, onMarkdownChange) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  let lineStart = start;
  while (lineStart > 0 && markdown[lineStart - 1] !== "\n") {
    lineStart--;
  }
  let lineEnd = end;
  while (lineEnd < markdown.length && markdown[lineEnd] !== "\n") {
    lineEnd++;
  }
  const lineContent = markdown.substring(lineStart, lineEnd);
  const withoutHeading = lineContent.replace(/^#{1,6}\s*/, "");
  const newPrefix = "#".repeat(level) + " ";
  const currentHeadingMatch = lineContent.match(/^(#{1,6})\s/);
  if (currentHeadingMatch && currentHeadingMatch[1].length === level) {
    const newText = markdown.substring(0, lineStart) + withoutHeading + markdown.substring(lineEnd);
    onMarkdownChange(newText);
  } else {
    const newText = markdown.substring(0, lineStart) + newPrefix + withoutHeading + markdown.substring(lineEnd);
    onMarkdownChange(newText);
  }
  requestAnimationFrame(() => {
    textarea.focus();
  });
}
function clearMarkdownFormatting(textarea, markdown, onMarkdownChange) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  if (start === end) return;
  const selected = markdown.substring(start, end);
  const cleaned = selected.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/~~(.+?)~~/g, "$1").replace(/`(.+?)`/g, "$1").replace(/\[(.+?)\]\(.+?\)/g, "$1");
  const newText = markdown.substring(0, start) + cleaned + markdown.substring(end);
  onMarkdownChange(newText);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start, start + cleaned.length);
  });
}

// src/ui/components/toolbar/FormatButtons.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
function FormatButtons({ editor: editorProp, textareaRef, markdown, onMarkdownChange, aiGenerating, loading, apiBasePath = "/api/cms" }) {
  const editor = editorProp;
  const isMarkdownMode = !editor && textareaRef && markdown !== void 0 && onMarkdownChange;
  const [hasSelection, setHasSelection] = (0, import_react5.useState)(false);
  const [isRewriting, setIsRewriting] = (0, import_react5.useState)(false);
  (0, import_react5.useEffect)(() => {
    if (!editor) {
      setHasSelection(false);
      return;
    }
    const updateSelection = () => {
      const { from, to } = editor.state.selection;
      setHasSelection(from !== to);
    };
    editor.on("selectionUpdate", updateSelection);
    editor.on("transaction", updateSelection);
    return () => {
      editor.off("selectionUpdate", updateSelection);
      editor.off("transaction", updateSelection);
    };
  }, [editor]);
  const handleRewrite = (0, import_react5.useCallback)(async () => {
    if (!editor || isRewriting) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    if (!selectedText.trim()) return;
    setIsRewriting(true);
    try {
      const res = await fetch(`${apiBasePath}/ai/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Rewrite failed");
      }
      const result = await res.json();
      editor.chain().focus().deleteSelection().insertContent(result.text).run();
    } catch (err) {
      console.error("Rewrite error:", err);
      alert(err instanceof Error ? err.message : "Failed to rewrite text");
    } finally {
      setIsRewriting(false);
    }
  }, [editor, isRewriting, apiBasePath]);
  const setHeading = (level) => {
    if (textareaRef?.current && markdown !== void 0 && onMarkdownChange) {
      setHeadingAtCursor(textareaRef.current, level, markdown, onMarkdownChange);
    }
  };
  const wrapSelection = (before, after) => {
    if (editor) return;
    if (textareaRef?.current && markdown !== void 0 && onMarkdownChange) {
      insertAtCursor(textareaRef.current, before, after, markdown, onMarkdownChange);
    }
  };
  if (loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Divider, {}),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Divider, {}),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(SkeletonButton, {})
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      ToolbarButton,
      {
        onClick: () => editor ? editor.chain().focus().toggleHeading({ level: 1 }).run() : setHeading(1),
        active: editor?.isActive("heading", { level: 1 }),
        disabled: aiGenerating,
        title: "Heading 1",
        children: "H1"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      ToolbarButton,
      {
        onClick: () => editor ? editor.chain().focus().toggleHeading({ level: 2 }).run() : setHeading(2),
        active: editor?.isActive("heading", { level: 2 }),
        disabled: aiGenerating,
        title: "Heading 2",
        children: "H2"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      ToolbarButton,
      {
        onClick: () => editor ? editor.chain().focus().toggleHeading({ level: 3 }).run() : setHeading(3),
        active: editor?.isActive("heading", { level: 3 }),
        disabled: aiGenerating,
        title: "Heading 3",
        children: "H3"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Divider, {}),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      ToolbarButton,
      {
        onClick: () => editor ? editor.chain().focus().toggleBold().run() : wrapSelection("**", "**"),
        active: editor?.isActive("bold"),
        disabled: aiGenerating,
        title: "Bold (\u2318B)",
        children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "font-bold", children: "B" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      ToolbarButton,
      {
        onClick: () => editor ? editor.chain().focus().toggleItalic().run() : wrapSelection("*", "*"),
        active: editor?.isActive("italic"),
        disabled: aiGenerating,
        title: "Italic (\u2318I)",
        children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "italic", children: "I" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      ToolbarButton,
      {
        onClick: () => editor ? editor.chain().focus().toggleStrike().run() : wrapSelection("~~", "~~"),
        active: editor?.isActive("strike"),
        disabled: aiGenerating,
        title: "Strikethrough",
        children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "line-through", children: "S" })
      }
    ),
    !isMarkdownMode && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Divider, {}),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        ToolbarButton,
        {
          onClick: handleRewrite,
          disabled: !editor || !hasSelection || isRewriting || aiGenerating,
          title: !editor ? "Editor loading..." : hasSelection ? "Rewrite selection with AI" : "Select text to rewrite",
          children: isRewriting ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react3.Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react3.Wand2, { className: "w-4 h-4" })
        }
      )
    ] })
  ] });
}

// src/ui/components/toolbar/BlockButtons.tsx
var import_lucide_react4 = require("lucide-react");
var import_jsx_runtime8 = require("react/jsx-runtime");
function BlockButtons({ editor: editorProp, textareaRef, markdown, onMarkdownChange, aiGenerating, loading }) {
  const editor = editorProp;
  if (loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(SkeletonButton, {})
    ] });
  }
  const isMarkdownMode = !editor && textareaRef && markdown !== void 0 && onMarkdownChange;
  const insertBlock = (prefix) => {
    if (textareaRef?.current && markdown !== void 0 && onMarkdownChange) {
      insertBlockAtCursor(textareaRef.current, prefix, markdown, onMarkdownChange);
    }
  };
  const wrapSelection = (before, after) => {
    if (editor) return;
    if (textareaRef?.current && markdown !== void 0 && onMarkdownChange) {
      insertAtCursor(textareaRef.current, before, after, markdown, onMarkdownChange);
    }
  };
  const handleHorizontalRule = () => {
    if (editor) {
      editor.chain().focus().setHorizontalRule().run();
    } else if (isMarkdownMode && textareaRef?.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const newText = markdown.substring(0, start) + "\n---\n" + markdown.substring(start);
      onMarkdownChange(newText);
      requestAnimationFrame(() => textarea.focus());
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      ToolbarButton,
      {
        onClick: () => editor ? editor.chain().focus().toggleBulletList().run() : insertBlock("- "),
        active: editor?.isActive("bulletList"),
        disabled: aiGenerating,
        title: "Bullet list",
        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react4.List, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      ToolbarButton,
      {
        onClick: () => editor ? editor.chain().focus().toggleOrderedList().run() : insertBlock("1. "),
        active: editor?.isActive("orderedList"),
        disabled: aiGenerating,
        title: "Numbered list",
        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react4.ListOrdered, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      ToolbarButton,
      {
        onClick: () => editor ? editor.chain().focus().toggleBlockquote().run() : insertBlock("> "),
        active: editor?.isActive("blockquote"),
        disabled: aiGenerating,
        title: "Blockquote",
        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react4.Quote, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      ToolbarButton,
      {
        onClick: () => editor ? editor.chain().focus().toggleCodeBlock().run() : wrapSelection("```\n", "\n```"),
        active: editor?.isActive("codeBlock"),
        disabled: aiGenerating,
        title: "Code block",
        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react4.Code2, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ToolbarButton, { onClick: handleHorizontalRule, disabled: aiGenerating, title: "Horizontal rule", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react4.Minus, { className: "w-4 h-4" }) })
  ] });
}

// src/ui/components/toolbar/MediaButtons.tsx
var import_react6 = require("react");
var import_lucide_react5 = require("lucide-react");
var import_jsx_runtime9 = require("react/jsx-runtime");
function MediaButtons({ editor: editorProp, textareaRef, markdown, onMarkdownChange, aiGenerating, loading, apiBasePath = "/api/cms" }) {
  const editor = editorProp;
  const fileInputRef = (0, import_react6.useRef)(null);
  const isMarkdownMode = !editor && textareaRef && markdown !== void 0 && onMarkdownChange;
  const handleLinkClick = (0, import_react6.useCallback)(() => {
    if (editor) {
      if (editor.isActive("link")) {
        editor.chain().focus().unsetLink().run();
        return;
      }
      const url = window.prompt("Enter URL:");
      if (url) {
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }
    } else if (isMarkdownMode) {
      const url = window.prompt("Enter URL:");
      if (url && textareaRef?.current) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = markdown.substring(start, end) || "link text";
        const newText = markdown.substring(0, start) + `[${selected}](${url})` + markdown.substring(end);
        onMarkdownChange(newText);
        requestAnimationFrame(() => textarea.focus());
      }
    }
  }, [editor, isMarkdownMode, textareaRef, markdown, onMarkdownChange]);
  const handleImageUpload = (0, import_react6.useCallback)(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 4MB.`);
      e.target.value = "";
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert(`Invalid file type: ${file.type}. Supported types: JPEG, PNG, GIF, WebP.`);
      e.target.value = "";
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`${apiBasePath}/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to upload image");
        e.target.value = "";
        return;
      }
      const url = data.url || data.data?.url;
      if (url) {
        if (editor) {
          editor.chain().focus().setImage({ src: url }).run();
        } else if (isMarkdownMode && textareaRef?.current) {
          const textarea = textareaRef.current;
          const start = textarea.selectionStart;
          const newText = markdown.substring(0, start) + `![image](${url})` + markdown.substring(start);
          onMarkdownChange(newText);
          requestAnimationFrame(() => textarea.focus());
        }
      } else {
        alert("Upload succeeded but no URL returned");
      }
    } catch (err) {
      alert("Failed to upload image. Please try again.");
      console.error("Image upload error:", err);
    }
    e.target.value = "";
  }, [editor, isMarkdownMode, textareaRef, markdown, onMarkdownChange, apiBasePath]);
  const handleClearFormatting = (0, import_react6.useCallback)(() => {
    if (editor) {
      editor.chain().focus().unsetAllMarks().clearNodes().run();
    } else if (isMarkdownMode && textareaRef?.current && markdown && onMarkdownChange) {
      clearMarkdownFormatting(textareaRef.current, markdown, onMarkdownChange);
    }
  }, [editor, isMarkdownMode, textareaRef, markdown, onMarkdownChange]);
  if (loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SkeletonButton, {})
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      ToolbarButton,
      {
        onClick: handleLinkClick,
        active: editor?.isActive("link"),
        disabled: aiGenerating,
        title: "Insert link",
        children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react5.Link2, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ToolbarButton, { onClick: () => fileInputRef.current?.click(), disabled: aiGenerating, title: "Insert image", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react5.Image, { className: "w-4 h-4" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      "input",
      {
        ref: fileInputRef,
        type: "file",
        accept: "image/*",
        onChange: handleImageUpload,
        className: "hidden"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ToolbarButton, { onClick: handleClearFormatting, disabled: aiGenerating, title: "Clear formatting", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react5.RemoveFormatting, { className: "w-4 h-4" }) })
  ] });
}

// src/ui/components/toolbar/HistoryButtons.tsx
var import_react9 = require("react");
var import_lucide_react7 = require("lucide-react");

// src/ui/components/RevisionHistoryDropdown.tsx
var import_react8 = require("react");
var import_lucide_react6 = require("lucide-react");

// src/ui/components/Dropdown.tsx
var import_react7 = require("react");
var import_react_dom = require("react-dom");
var import_jsx_runtime10 = require("react/jsx-runtime");
var DropdownContext = (0, import_react7.createContext)(null);
function Dropdown({
  trigger,
  children,
  align = "right",
  className,
  open: controlledOpen,
  onOpenChange,
  disabled
}) {
  const [internalOpen, setInternalOpen] = (0, import_react7.useState)(false);
  const [position, setPosition] = (0, import_react7.useState)({ top: 0, left: 0, right: 0 });
  const [mounted, setMounted] = (0, import_react7.useState)(false);
  const triggerRef = (0, import_react7.useRef)(null);
  const menuRef = (0, import_react7.useRef)(null);
  const isControlled = controlledOpen !== void 0;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = (0, import_react7.useCallback)((value) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  }, [isControlled, onOpenChange]);
  (0, import_react7.useEffect)(() => {
    setMounted(true);
  }, []);
  const updatePosition = (0, import_react7.useCallback)(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        // 4px gap
        left: rect.left,
        right: window.innerWidth - rect.right
      });
    }
  }, []);
  (0, import_react7.useEffect)(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);
  (0, import_react7.useEffect)(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      const target = e.target;
      if (menuRef.current && !menuRef.current.contains(target) && triggerRef.current && !triggerRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, setOpen]);
  (0, import_react7.useEffect)(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen]);
  (0, import_react7.useEffect)(() => {
    if (!isOpen) return;
    const handleUpdate = () => updatePosition();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen, updatePosition]);
  const handleTriggerClick = () => {
    if (disabled) return;
    setOpen(!isOpen);
  };
  const close = (0, import_react7.useCallback)(() => setOpen(false), [setOpen]);
  const menu = isOpen && mounted ? (0, import_react_dom.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(DropdownContext.Provider, { value: { close }, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "div",
      {
        ref: menuRef,
        style: {
          position: "fixed",
          top: position.top,
          ...align === "right" ? { right: position.right } : { left: position.left }
        },
        className: cn(
          "z-50 min-w-[160px] bg-popover border border-border rounded-md shadow-lg p-1 overscroll-contain",
          className
        ),
        onWheel: (e) => e.stopPropagation(),
        children
      }
    ) }),
    document.body
  ) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { ref: triggerRef, onClick: handleTriggerClick, children: trigger }),
    menu
  ] });
}
function DropdownItem({
  onClick,
  destructive,
  disabled,
  children,
  className
}) {
  const context = (0, import_react7.useContext)(DropdownContext);
  const handleClick = () => {
    if (!disabled) {
      onClick?.();
      context?.close();
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
    "button",
    {
      type: "button",
      onClick: handleClick,
      disabled,
      className: cn(
        "w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0",
        "text-left text-sm rounded-sm cursor-default",
        "active:bg-accent md:hover:bg-accent focus:bg-accent focus:outline-none",
        destructive && "text-destructive",
        disabled && "opacity-50 cursor-not-allowed",
        className
      ),
      children
    }
  );
}
function DropdownDivider() {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "h-px bg-border my-1" });
}
function DropdownLabel({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "px-3 py-1.5 md:px-2 md:py-1 text-xs font-medium text-muted-foreground", children });
}

// src/ui/components/RevisionHistoryDropdown.tsx
var import_jsx_runtime11 = require("react/jsx-runtime");
function RevisionHistoryDropdown({
  revisions,
  loading,
  previewLoading,
  disabled,
  isPreviewMode,
  onOpen,
  onSelect
}) {
  const [open, setOpen] = (0, import_react8.useState)(false);
  const handleOpenChange = (isOpen) => {
    if (isOpen && !open) {
      onOpen();
    }
    setOpen(isOpen);
  };
  const trigger = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
    "button",
    {
      type: "button",
      disabled: disabled || isPreviewMode || previewLoading,
      title: disabled ? "Save post to enable history" : "Revision history",
      className: "px-2.5 py-1.5 text-sm font-medium rounded transition-colors flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400",
      children: previewLoading ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react6.Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react6.History, { className: "w-4 h-4" })
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
    Dropdown,
    {
      trigger,
      open,
      onOpenChange: handleOpenChange,
      disabled: disabled || isPreviewMode || previewLoading,
      align: "right",
      className: "w-64 max-h-80 overflow-y-auto p-0",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(DropdownLabel, { children: "Revision History" }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "border-t border-border" }),
        loading ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "flex items-center justify-center py-4", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react6.Loader2, { className: "h-4 w-4 animate-spin text-gray-500" }) }) : revisions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "py-4 text-center text-sm text-gray-500", children: "No revisions yet" }) : revisions.map((rev) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(DropdownItem, { onClick: () => onSelect(rev.id), children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "text-sm truncate", children: rev.title || "Untitled" }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "text-xs text-gray-500", children: formatRelativeTime(rev.createdAt) })
        ] }) }, rev.id))
      ]
    }
  );
}

// src/ui/components/toolbar/HistoryButtons.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
function HistoryButtons({
  editor: editorProp,
  textareaRef,
  showMarkdown,
  setShowMarkdown,
  postSlug,
  revisions,
  aiGenerating,
  loading
}) {
  const editor = editorProp;
  const handleUndo = (0, import_react9.useCallback)(() => {
    if (editor) {
      editor.chain().focus().undo().run();
    } else if (textareaRef?.current) {
      textareaRef.current.focus();
      document.execCommand("undo");
    }
  }, [editor, textareaRef]);
  const handleRedo = (0, import_react9.useCallback)(() => {
    if (editor) {
      editor.chain().focus().redo().run();
    } else if (textareaRef?.current) {
      textareaRef.current.focus();
      document.execCommand("redo");
    }
  }, [editor, textareaRef]);
  if (loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Divider, {}),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Divider, {}),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SkeletonButton, {})
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      ToolbarButton,
      {
        onClick: handleUndo,
        disabled: aiGenerating || (editor ? !editor.can().undo() : false),
        title: "Undo (\u2318Z)",
        children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_lucide_react7.Undo2, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      ToolbarButton,
      {
        onClick: handleRedo,
        disabled: aiGenerating || (editor ? !editor.can().redo() : false),
        title: "Redo (\u2318\u21E7Z)",
        children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_lucide_react7.Redo2, { className: "w-4 h-4" })
      }
    ),
    setShowMarkdown && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Divider, {}),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        ToolbarButton,
        {
          onClick: () => setShowMarkdown(!showMarkdown),
          active: showMarkdown,
          disabled: aiGenerating,
          title: showMarkdown ? "Switch to rich text editor" : "Switch to markdown mode",
          children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "font-mono text-xs", children: "MD" })
        }
      )
    ] }),
    revisions && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Divider, {}),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        RevisionHistoryDropdown,
        {
          revisions: revisions.list,
          loading: revisions.loading,
          previewLoading: revisions.previewLoading,
          disabled: aiGenerating || !postSlug,
          isPreviewMode: !!revisions.previewing,
          onOpen: revisions.fetch,
          onSelect: revisions.preview
        }
      )
    ] })
  ] });
}

// src/ui/components/EditorToolbar.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
function EditorToolbar({
  editor,
  textareaRef,
  markdown,
  onMarkdownChange,
  showMarkdown,
  setShowMarkdown,
  postSlug,
  revisions,
  aiGenerating,
  hasSelection,
  selectionHasComment,
  onAddComment,
  commentsCount,
  onViewComments,
  loading = false,
  apiBasePath = "/api/cms"
}) {
  if (loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "fixed top-[69px] left-0 right-0 z-40 flex items-center justify-start lg:justify-center gap-0.5 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-x-auto", children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(FormatButtons, { loading: true }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Divider, {}),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(BlockButtons, { loading: true }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Divider, {}),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(MediaButtons, { loading: true }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Divider, {}),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(HistoryButtons, { loading: true }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Divider, {}),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(SkeletonButton, {}),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(SkeletonButton, {})
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "fixed top-[69px] left-0 right-0 z-40 flex items-center justify-start lg:justify-center gap-0.5 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-x-auto", children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      FormatButtons,
      {
        editor,
        textareaRef,
        markdown,
        onMarkdownChange,
        aiGenerating,
        apiBasePath
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Divider, {}),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      BlockButtons,
      {
        editor,
        textareaRef,
        markdown,
        onMarkdownChange,
        aiGenerating
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Divider, {}),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      MediaButtons,
      {
        editor,
        textareaRef,
        markdown,
        onMarkdownChange,
        aiGenerating,
        apiBasePath
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Divider, {}),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      HistoryButtons,
      {
        editor,
        textareaRef,
        showMarkdown,
        setShowMarkdown,
        postSlug,
        revisions,
        aiGenerating
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Divider, {}),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      ToolbarButton,
      {
        onClick: onAddComment ?? (() => {
        }),
        disabled: aiGenerating || !hasSelection || !onAddComment,
        title: hasSelection ? "New comment (\u2318\u2325M)" : selectionHasComment ? "Text already has a comment" : "Select text to comment",
        children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_lucide_react8.MessageSquarePlus, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      ToolbarButton,
      {
        onClick: onViewComments ?? (() => {
        }),
        disabled: aiGenerating || !onViewComments,
        title: "View all comments",
        children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_lucide_react8.MessageSquare, { className: "w-4 h-4" }),
          commentsCount !== void 0 && commentsCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "text-xs tabular-nums", children: commentsCount })
        ] })
      }
    )
  ] });
}

// src/ui/components/TiptapEditor.tsx
var import_react10 = require("react");
var import_react11 = require("@tiptap/react");
var import_starter_kit = __toESM(require("@tiptap/starter-kit"));
var import_extension_placeholder = __toESM(require("@tiptap/extension-placeholder"));
var import_extension_link = __toESM(require("@tiptap/extension-link"));
var import_extension_image = __toESM(require("@tiptap/extension-image"));

// src/lib/markdown.ts
var import_marked = require("marked");
var import_turndown = __toESM(require("turndown"));
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
var turndownService = new import_turndown.default({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-"
});
function htmlToMarkdown(html) {
  return turndownService.turndown(html);
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
var __defProp2 = Object.defineProperty;
var __export2 = (target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
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
      Object.entries(rawCommands).map(([name, command2]) => {
        const method = (...args) => {
          const callback = command2(...args)(props);
          if (!tr.getMeta("preventDispatch") && !this.hasCustomState) {
            view.dispatch(tr);
          }
          return callback;
        };
        return [name, method];
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
        Object.entries(rawCommands).map(([name, command2]) => {
          const chainedCommand = (...args) => {
            const props = this.buildProps(tr, shouldDispatch);
            const callback = command2(...args)(props);
            callbacks.push(callback);
            return chain;
          };
          return [name, chainedCommand];
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
      Object.entries(rawCommands).map(([name, command2]) => {
        return [name, (...args) => command2(...args)({ ...props, dispatch: void 0 })];
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
          Object.entries(rawCommands).map(([name, command2]) => {
            return [name, (...args) => command2(...args)(props)];
          })
        );
      }
    };
    return props;
  }
};
var commands_exports = {};
__export2(commands_exports, {
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
    var _a;
    if (!editor.isDestroyed) {
      ;
      view.dom.blur();
      (_a = window == null ? void 0 : window.getSelection()) == null ? void 0 : _a.removeAllRanges();
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
  var _a;
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
  attributes = attributes || ((_a = start.node.marks[0]) == null ? void 0 : _a.attrs);
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
    const parser = import_model2.DOMParser.fromSchema(schema);
    if (options.slice) {
      return parser.parseSlice(elementFromString(content), options.parseOptions).content;
    }
    return parser.parse(elementFromString(content), options.parseOptions);
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
  var _a;
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
        errorOnInvalidContent: (_a = options.errorOnInvalidContent) != null ? _a : editor.options.enableContentCheck
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
function normalizeKeyName(name) {
  const parts = name.split(/-(?!$)/);
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
var keyboardShortcut = (name) => ({ editor, view, tr, dispatch }) => {
  const keys = normalizeKeyName(name).split(/-(?!$)/);
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
function getSchemaTypeNameByName(name, schema) {
  if (schema.nodes[name]) {
    return "node";
  }
  if (schema.marks[name]) {
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
function findParentNodeClosestToPos($pos, predicate) {
  for (let i = $pos.depth; i > 0; i -= 1) {
    const node = $pos.node(i);
    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node
      };
    }
  }
}
function findParentNode(predicate) {
  return (selection) => findParentNodeClosestToPos(selection.$from, predicate);
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
        Object.entries(globalAttribute.attributes).forEach(([name, attribute]) => {
          extensionAttributes.push({
            type,
            name,
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
    Object.entries(attributes).forEach(([name, attribute]) => {
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
        name,
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
  var _a, _b;
  const spec = {};
  if (!((_a = extensionAttribute == null ? void 0 : extensionAttribute.attribute) == null ? void 0 : _a.isRequired) && "default" in ((extensionAttribute == null ? void 0 : extensionAttribute.attribute) || {})) {
    spec.default = extensionAttribute.attribute.default;
  }
  if (((_b = extensionAttribute == null ? void 0 : extensionAttribute.attribute) == null ? void 0 : _b.validate) !== void 0) {
    spec.validate = extensionAttribute.attribute.validate;
  }
  return [extensionAttribute.name, spec];
}
function getSchemaByResolvedExtensions(extensions, editor) {
  var _a;
  const allAttributes = getAttributesFromExtensions(extensions);
  const { nodeExtensions, markExtensions } = splitExtensions(extensions);
  const topNode = (_a = nodeExtensions.find((extension) => getExtensionField(extension, "topNode"))) == null ? void 0 : _a.name;
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
    var _a;
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
      text += (_a = node == null ? void 0 : node.text) == null ? void 0 : _a.slice(Math.max(from, pos) - pos, to - pos);
    }
  });
  return text;
}
function getTextSerializersFromSchema(schema) {
  return Object.fromEntries(
    Object.entries(schema.nodes).filter(([, node]) => node.spec.toText).map(([name, node]) => [name, node.spec.toText])
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
function getSchemaTypeByName(name, schema) {
  return schema.nodes[name] || schema.marks[name] || null;
}
function getSplittedAttributes(extensionAttributes, typeName, attributes) {
  return Object.fromEntries(
    Object.entries(attributes).filter(([name]) => {
      const extensionAttribute = extensionAttributes.find((item) => {
        return item.type === typeName && item.name === name;
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
    var _a, _b;
    const chunk = ((_b = (_a = node.type.spec).toText) == null ? void 0 : _b.call(_a, {
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
      const name = typeof enabledExtension === "string" ? enabledExtension : enabledExtension.name;
      return name === extension.name;
    });
  }
  return enabled;
}
function isList(name, extensions) {
  const { nodeExtensions } = splitExtensions(extensions);
  const extension = nodeExtensions.find((item) => item.name === name);
  if (!extension) {
    return false;
  }
  const context = {
    name: extension.name,
    options: extension.options,
    storage: extension.storage
  };
  const group = callOrReturn(getExtensionField(extension, "group", context));
  if (typeof group !== "string") {
    return false;
  }
  return group.split(" ").includes("list");
}
function isNodeEmpty(node, {
  checkChildren = true,
  ignoreWhitespace = false
} = {}) {
  var _a;
  if (ignoreWhitespace) {
    if (node.type.name === "hardBreak") {
      return true;
    }
    if (node.isText) {
      return /^\s*$/m.test((_a = node.text) != null ? _a : "");
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
  var _a;
  const { selection } = tr;
  let cursor = null;
  if (isTextSelection(selection)) {
    cursor = selection.$cursor;
  }
  if (cursor) {
    const currentMarks = (_a = state.storedMarks) != null ? _a : cursor.marks();
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
  var _a;
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
      const nextType2 = ((_a = type.contentMatch.defaultType) == null ? void 0 : _a.createAndFill(newNextTypeAttributes2)) || void 0;
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
  var _a;
  const { extendEmptyMarkRange = false } = options;
  const { selection } = tr;
  const type = getMarkType(typeOrName, state.schema);
  const { $from, empty, ranges } = selection;
  if (!dispatch) {
    return true;
  }
  if (empty && extendEmptyMarkRange) {
    let { from, to } = selection;
    const attrs = (_a = $from.marks().find((mark) => mark.type === type)) == null ? void 0 : _a.attrs;
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
  var _a;
  const { editor, from, to, text, rules, plugin } = config;
  const { view } = editor;
  if (view.composing) {
    return false;
  }
  const $from = view.state.doc.resolve(from);
  if (
    // check for code node
    $from.parent.type.spec.code || // check for code mark
    !!((_a = $from.nodeBefore || $from.nodeAfter) == null ? void 0 : _a.marks.find((mark) => mark.type.spec.code))
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
    var _a, _b, _c, _d, _e;
    if (((_b = (_a = node.type) == null ? void 0 : _a.spec) == null ? void 0 : _b.code) || !(node.isText || node.isTextblock || node.isInline)) {
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
  var _a;
  const event = new ClipboardEvent("paste", {
    clipboardData: new DataTransfer()
  });
  (_a = event.clipboardData) == null ? void 0 : _a.setData("text/html", text);
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
          var _a;
          dragSourceElement = ((_a = view.dom.parentElement) == null ? void 0 : _a.contains(event.target)) ? view.dom.parentElement : null;
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
            var _a;
            const html = (_a = event.clipboardData) == null ? void 0 : _a.getData("text/html");
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
      var _a;
      const context = {
        name: extension.name,
        options: extension.options,
        storage: this.editor.extensionStorage[extension.name],
        editor: this.editor,
        type: getSchemaTypeByName(extension.name, this.schema)
      };
      if (extension.type === "mark") {
        const keepOnSplit = (_a = callOrReturn(getExtensionField(extension, "keepOnSplit", context))) != null ? _a : true;
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
__export2(extensions_exports, {
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
    var _a, _b, _c;
    const callback = () => {
      var _a2, _b2, _c2, _d;
      if ((_d = (_c2 = (_b2 = (_a2 = this.editor.options.coreExtensionOptions) == null ? void 0 : _a2.delete) == null ? void 0 : _b2.filterTransaction) == null ? void 0 : _c2.call(_b2, transaction)) != null ? _d : transaction.getMeta("y-sync$")) {
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
        var _a3, _b3;
        if (step instanceof import_transform9.RemoveMarkStep) {
          const newStart = mapping.slice(index).map(step.from, -1);
          const newEnd = mapping.slice(index).map(step.to);
          const oldStart = mapping.invert().map(newStart, -1);
          const oldEnd = mapping.invert().map(newEnd);
          const foundBeforeMark = (_a3 = nextTransaction.doc.nodeAt(newStart - 1)) == null ? void 0 : _a3.marks.some((mark) => mark.eq(step.mark));
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
    if ((_c = (_b = (_a = this.editor.options.coreExtensionOptions) == null ? void 0 : _a.delete) == null ? void 0 : _b.async) != null ? _c : true) {
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
__export2(markdown_exports, {
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
    var _a;
    const quotedIndex = parseInt(((_a = quotedRef.match(/__QUOTED_(\d+)__/)) == null ? void 0 : _a[1]) || "0", 10);
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
        var _a;
        const regex = new RegExp(`^:::${blockName}(?:\\s|$)`, "m");
        const index = (_a = src.match(regex)) == null ? void 0 : _a.index;
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
        var _a;
        const regex = new RegExp(`^:::${blockName}`, "m");
        const index = (_a = src.match(regex)) == null ? void 0 : _a.index;
        return index !== void 0 ? index : -1;
      },
      tokenize(src, _tokens, lexer) {
        var _a;
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
          if ((_a = match[2]) == null ? void 0 : _a.endsWith(":::")) {
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
  var _a, _b, _c, _d;
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
        const nextIndent2 = ((_b = (_a = nextNonEmpty.match(/^(\s*)/)) == null ? void 0 : _a[1]) == null ? void 0 : _b.length) || 0;
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
    if (!comment.quotedText || comment.parentId) return;
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

// src/ui/components/TiptapEditor.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
var DEFAULT_PROSE_CLASSES = "prose prose-gray dark:prose-invert max-w-none";
function TiptapEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  autoFocus = false,
  onEditorReady,
  onSelectionChange,
  onCommentClick,
  proseClasses = DEFAULT_PROSE_CLASSES
}) {
  const initialHtml = (0, import_react10.useMemo)(() => content ? renderMarkdown(content) : "", [content]);
  const extensions = (0, import_react10.useMemo)(() => [
    import_starter_kit.default.configure({
      heading: {
        levels: [1, 2, 3]
      }
    }),
    import_extension_placeholder.default.configure({
      placeholder
    }),
    import_extension_link.default.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-blue-600 dark:text-blue-400 underline"
      }
    }),
    import_extension_image.default.configure({
      HTMLAttributes: {
        class: "rounded-lg max-w-full"
      }
    }),
    CommentMark.configure({
      onCommentClick
    })
  ], [placeholder, onCommentClick]);
  const editor = (0, import_react11.useEditor)({
    immediatelyRender: false,
    // Prevent SSR hydration mismatch
    extensions,
    content: initialHtml,
    onUpdate: ({ editor: editor2 }) => {
      const html = editor2.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
    onSelectionUpdate: ({ editor: editor2 }) => {
      if (!onSelectionChange) return;
      const { from, to, empty } = editor2.state.selection;
      if (empty) {
        onSelectionChange(null);
      } else {
        const text = editor2.state.doc.textBetween(from, to, " ");
        let hasExistingComment = false;
        editor2.state.doc.nodesBetween(from, to, (node) => {
          if (node.marks.some((mark) => mark.type.name === "comment")) {
            hasExistingComment = true;
            return false;
          }
        });
        onSelectionChange({
          hasSelection: true,
          text,
          from,
          to,
          hasExistingComment
        });
      }
    },
    editorProps: {
      attributes: {
        class: `${proseClasses} min-h-[500px] outline-none`
      }
    }
  });
  (0, import_react10.useEffect)(() => {
    if (editor) {
      if (onEditorReady) {
        onEditorReady(editor);
      }
      if (autoFocus) {
        setTimeout(() => editor.commands.focus(), 0);
      }
    }
  }, [editor, onEditorReady, autoFocus]);
  (0, import_react10.useEffect)(() => {
    if (editor && content !== void 0) {
      const currentMarkdown = htmlToMarkdown(editor.getHTML());
      if (currentMarkdown !== content) {
        const html = content ? renderMarkdown(content) : "";
        editor.commands.setContent(html, { emitUpdate: false });
      }
    }
  }, [editor, content]);
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_react11.EditorContent, { editor });
}

// src/ui/components/CommentsPanel.tsx
var import_react13 = require("react");
var import_react_dom2 = require("react-dom");
var import_lucide_react10 = require("lucide-react");

// src/ui/components/CommentThread.tsx
var import_react12 = require("react");
var import_lucide_react9 = require("lucide-react");

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

// src/ui/components/CommentThread.tsx
var import_jsx_runtime15 = require("react/jsx-runtime");
function formatRelativeTime2(dateStr) {
  const date = new Date(dateStr);
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 6e4);
  const hours = Math.floor(diff / 36e5);
  const days = Math.floor(diff / 864e5);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
function CommentThread({
  comment,
  currentUserEmail,
  isAdmin,
  isActive,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onClick
}) {
  const [isReplying, setIsReplying] = (0, import_react12.useState)(false);
  const [isEditing, setIsEditing] = (0, import_react12.useState)(false);
  const [replyContent, setReplyContent] = (0, import_react12.useState)("");
  const [editContent, setEditContent] = (0, import_react12.useState)(comment.content);
  const [loading, setLoading] = (0, import_react12.useState)(false);
  const canEdit = canEditComment(comment, currentUserEmail);
  const canDelete = canDeleteComment(comment, currentUserEmail, isAdmin);
  const isOwn = comment.user.email === currentUserEmail;
  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setLoading(true);
    try {
      await onReply(replyContent.trim());
      setReplyContent("");
      setIsReplying(false);
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      await onEdit(editContent.trim());
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    setLoading(true);
    try {
      await onDelete();
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
    "div",
    {
      role: "button",
      tabIndex: 0,
      onClick,
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      },
      className: cn(
        "rounded-lg border p-3 transition-colors cursor-pointer",
        isActive ? "border-yellow-400 bg-yellow-50/50 dark:border-yellow-600 dark:bg-yellow-900/20" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
        comment.resolved && "opacity-60"
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "font-medium", children: isOwn ? "You" : comment.user.name || comment.user.email.split("@")[0] }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "text-gray-500 dark:text-gray-400", children: formatRelativeTime2(comment.createdAt) }),
            comment.resolved && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400", children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(import_lucide_react9.Check, { className: "w-3 h-3" }),
              "Resolved"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
            Dropdown,
            {
              trigger: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                "button",
                {
                  type: "button",
                  className: "w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500",
                  children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(import_lucide_react9.MoreHorizontal, { className: "w-4 h-4" })
                }
              ),
              align: "right",
              className: "min-w-[140px]",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(DropdownItem, { onClick: onResolve, children: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(import_lucide_react9.Check, { className: "w-4 h-4" }),
                  comment.resolved ? "Unresolve" : "Resolve"
                ] }) }),
                canEdit && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(DropdownItem, { onClick: () => setIsEditing(true), children: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(import_lucide_react9.Pencil, { className: "w-4 h-4" }),
                  "Edit"
                ] }) }),
                canDelete && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(DropdownDivider, {}),
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(DropdownItem, { onClick: handleDelete, destructive: true, children: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(import_lucide_react9.Trash2, { className: "w-4 h-4" }),
                    "Delete"
                  ] }) })
                ] })
              ]
            }
          ) })
        ] }),
        comment.quotedText && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "mb-2 px-2 py-1 bg-yellow-100/50 dark:bg-yellow-900/30 rounded text-sm italic text-gray-600 dark:text-gray-400 line-clamp-2", children: [
          '"',
          comment.quotedText,
          '"'
        ] }),
        isEditing ? /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "space-y-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
            "textarea",
            {
              value: editContent,
              onChange: (e) => {
                setEditContent(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              },
              onKeyDown: (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEdit();
                }
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setIsEditing(false);
                  setEditContent(comment.content);
                }
              },
              onClick: (e) => e.stopPropagation(),
              className: "w-full min-h-[60px] max-h-[120px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 resize-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex gap-2 justify-end", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                  setEditContent(comment.content);
                },
                disabled: loading,
                className: "px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  handleEdit();
                },
                disabled: loading || !editContent.trim(),
                className: "px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
                children: "Save"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "text-sm whitespace-pre-wrap", children: comment.content }),
        comment.replies && comment.replies.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "mt-3 pl-3 border-l-2 border-gray-200 dark:border-gray-700 space-y-3", children: comment.replies.map((reply) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
          ReplyItem,
          {
            reply,
            currentUserEmail
          },
          reply.id
        )) }),
        !isEditing && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "mt-3", children: isReplying ? /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "space-y-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
            "textarea",
            {
              value: replyContent,
              onChange: (e) => {
                setReplyContent(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              },
              onKeyDown: (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleReply();
                }
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setIsReplying(false);
                  setReplyContent("");
                }
              },
              placeholder: "Write a reply...",
              className: "w-full min-h-[60px] max-h-[120px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 resize-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-500",
              onClick: (e) => e.stopPropagation()
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex gap-2 justify-end", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  setIsReplying(false);
                  setReplyContent("");
                },
                disabled: loading,
                className: "px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  handleReply();
                },
                disabled: loading || !replyContent.trim(),
                className: "px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
                children: "Reply"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
          "button",
          {
            type: "button",
            onClick: (e) => {
              e.stopPropagation();
              setIsReplying(true);
            },
            className: "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(import_lucide_react9.Reply, { className: "w-3.5 h-3.5" }),
              "Reply"
            ]
          }
        ) })
      ]
    }
  );
}
function ReplyItem({
  reply,
  currentUserEmail
}) {
  const isOwn = reply.user.email === currentUserEmail;
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "text-sm", children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex items-center gap-2 mb-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "font-medium", children: isOwn ? "You" : reply.user.name || reply.user.email.split("@")[0] }),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "text-gray-500 dark:text-gray-400 text-xs", children: formatRelativeTime2(reply.createdAt) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "whitespace-pre-wrap text-gray-600 dark:text-gray-400", children: reply.content })
  ] });
}

// src/ui/components/CommentsPanel.tsx
var import_jsx_runtime16 = require("react/jsx-runtime");
function CommentsPanel({
  comments,
  currentUserEmail,
  isAdmin,
  selectedText,
  onCreateComment,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onCommentClick,
  activeCommentId,
  isOpen,
  onClose,
  onClearSelection
}) {
  const [newComment, setNewComment] = (0, import_react13.useState)("");
  const [isAnimating, setIsAnimating] = (0, import_react13.useState)(false);
  const [isVisible, setIsVisible] = (0, import_react13.useState)(false);
  const [mounted, setMounted] = (0, import_react13.useState)(false);
  const [creating, setCreating] = (0, import_react13.useState)(false);
  const [showResolved, setShowResolved] = (0, import_react13.useState)(false);
  const textareaRef = (0, import_react13.useRef)(null);
  const commentsEndRef = (0, import_react13.useRef)(null);
  const openComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);
  (0, import_react13.useEffect)(() => {
    setMounted(true);
  }, []);
  (0, import_react13.useEffect)(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  (0, import_react13.useEffect)(() => {
    if (selectedText && isOpen) {
      textareaRef.current?.focus();
    }
  }, [selectedText, isOpen]);
  (0, import_react13.useEffect)(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [newComment]);
  const handleCreateComment = (0, import_react13.useCallback)(async () => {
    if (!newComment.trim() || !selectedText) return;
    setCreating(true);
    try {
      await onCreateComment(newComment.trim());
      setNewComment("");
      onClearSelection();
    } finally {
      setCreating(false);
    }
  }, [newComment, selectedText, onCreateComment, onClearSelection]);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleCreateComment();
    }
    if (e.key === "Escape") {
      e.stopPropagation();
      if (selectedText) {
        onClearSelection();
        setNewComment("");
      } else {
        onClose();
      }
    }
  };
  if (!isVisible || !mounted) return null;
  return (0, import_react_dom2.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(import_jsx_runtime16.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
        "div",
        {
          className: cn(
            "fixed inset-0 h-[100dvh] bg-black/20 z-[60] transition-opacity duration-200",
            isAnimating ? "opacity-100" : "opacity-0"
          ),
          onClick: onClose
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
        "div",
        {
          role: "dialog",
          "aria-modal": "true",
          "aria-label": "Comments",
          className: cn(
            "fixed z-[70] flex flex-col bg-white dark:bg-gray-900 shadow-xl transition-transform duration-200 ease-out overflow-hidden",
            "inset-x-0 top-0 h-[100dvh]",
            "md:left-auto md:w-full md:max-w-[380px] md:border-l md:border-gray-200 md:dark:border-gray-700",
            isAnimating ? "translate-x-0" : "translate-x-full"
          ),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react10.MessageSquare, { className: "w-4 h-4 text-gray-500" }),
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("h2", { className: "font-medium", children: "Comments" }),
                openComments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "text-xs text-gray-500", children: [
                  "(",
                  openComments.length,
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                "button",
                {
                  type: "button",
                  onClick: onClose,
                  className: "w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500",
                  "aria-label": "Close comments",
                  children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react10.X, { className: "w-4 h-4" })
                }
              )
            ] }),
            selectedText && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-5 bg-gray-50/50 dark:bg-gray-800/30", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex-1 px-2 py-1 bg-yellow-100/50 dark:bg-yellow-900/30 rounded text-sm italic text-gray-600 dark:text-gray-400 line-clamp-2", children: [
                  '"',
                  selectedText,
                  '"'
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      onClearSelection();
                      setNewComment("");
                    },
                    disabled: creating,
                    className: "ml-2 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-50",
                    children: "Cancel"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex items-end gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                  "textarea",
                  {
                    ref: textareaRef,
                    value: newComment,
                    onChange: (e) => setNewComment(e.target.value),
                    onKeyDown: handleKeyDown,
                    placeholder: "Add a comment...",
                    className: "flex-1 min-h-[60px] max-h-[120px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 resize-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-500",
                    rows: 2,
                    enterKeyHint: "send"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: handleCreateComment,
                    disabled: creating || !newComment.trim(),
                    className: "w-10 h-10 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-700",
                    children: creating ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react10.Loader2, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react10.ArrowUp, { className: "h-5 w-5" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: cn("flex-1 overflow-y-auto", selectedText && "hidden"), children: comments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "h-full flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "text-center max-w-xs px-6", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react10.MessageSquare, { className: "w-8 h-8 mx-auto mb-2 text-gray-400" }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "text-gray-500 text-sm", children: "No comments yet. Select text and click the comment button to add one." })
            ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "p-4 space-y-3", children: [
              openComments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                CommentThread,
                {
                  comment,
                  currentUserEmail,
                  isAdmin,
                  isActive: activeCommentId === comment.id,
                  onReply: (content) => onReply(comment.id, content),
                  onEdit: (content) => onEdit(comment.id, content),
                  onDelete: () => onDelete(comment.id),
                  onResolve: () => onResolve(comment.id),
                  onClick: () => onCommentClick(comment.id)
                },
                comment.id
              )),
              resolvedComments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "pt-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowResolved(!showResolved),
                    className: "w-full text-left text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors py-2",
                    children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "inline-flex items-center gap-1", children: [
                      showResolved ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react10.ChevronDown, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react10.ChevronRight, { className: "w-4 h-4" }),
                      "Resolved (",
                      resolvedComments.length,
                      ")"
                    ] })
                  }
                ),
                showResolved && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "space-y-3 mt-2", children: resolvedComments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                  CommentThread,
                  {
                    comment,
                    currentUserEmail,
                    isAdmin,
                    isActive: activeCommentId === comment.id,
                    onReply: (content) => onReply(comment.id, content),
                    onEdit: (content) => onEdit(comment.id, content),
                    onDelete: () => onDelete(comment.id),
                    onResolve: () => onResolve(comment.id),
                    onClick: () => onCommentClick(comment.id)
                  },
                  comment.id
                )) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { ref: commentsEndRef })
            ] }) })
          ]
        }
      )
    ] }),
    document.body
  );
}

// src/ui/components/TagsSection.tsx
var import_react14 = require("react");
var import_jsx_runtime17 = require("react/jsx-runtime");
function TagsSection({
  tags,
  onTagsChange,
  apiBasePath,
  disabled = false
}) {
  const [isExpanded, setIsExpanded] = (0, import_react14.useState)(false);
  const [availableTags, setAvailableTags] = (0, import_react14.useState)([]);
  const [loading, setLoading] = (0, import_react14.useState)(false);
  const [dropdownOpen, setDropdownOpen] = (0, import_react14.useState)(false);
  const dropdownRef = (0, import_react14.useRef)(null);
  (0, import_react14.useEffect)(() => {
    if (isExpanded && availableTags.length === 0) {
      setLoading(true);
      fetch(`${apiBasePath}/tags`).then((res) => res.ok ? res.json() : Promise.reject()).then((data) => {
        setAvailableTags(data.data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isExpanded, availableTags.length, apiBasePath]);
  (0, import_react14.useEffect)(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [dropdownOpen]);
  const handleAddTag = (tagId) => {
    const tagToAdd = availableTags.find((t) => t.id === tagId);
    if (tagToAdd && !tags.some((t) => t.id === tagId)) {
      onTagsChange([...tags, tagToAdd]);
    }
    setDropdownOpen(false);
  };
  const handleRemoveTag = (tagId) => {
    onTagsChange(tags.filter((t) => t.id !== tagId));
  };
  const unselectedTags = availableTags.filter(
    (at) => !tags.some((t) => t.id === at.id)
  );
  const tagSummary = tags.length === 0 ? "no tags" : tags.length === 1 ? "1 tag" : `${tags.length} tags`;
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "border-t border-gray-200 dark:border-gray-800 pt-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
      "button",
      {
        type: "button",
        onClick: () => setIsExpanded(!isExpanded),
        className: "flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors w-full",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
            "svg",
            {
              className: `h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`,
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { children: "Tags" }),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "ml-auto text-xs text-gray-400", children: tagSummary })
        ]
      }
    ),
    isExpanded && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "mt-4 space-y-3 pl-6", children: [
      tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "flex flex-wrap gap-2", children: tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
        "span",
        {
          className: "inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm",
          children: [
            tag.name,
            !disabled && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
              "button",
              {
                type: "button",
                onClick: () => handleRemoveTag(tag.id),
                className: "hover:text-red-500 transition-colors",
                children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("svg", { className: "h-3 w-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
              }
            )
          ]
        },
        tag.id
      )) }),
      !disabled && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_jsx_runtime17.Fragment, { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("p", { className: "text-sm text-gray-500", children: "Loading tags..." }) : unselectedTags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "relative max-w-[200px]", ref: dropdownRef, children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
          "button",
          {
            type: "button",
            onClick: () => setDropdownOpen(!dropdownOpen),
            className: "w-full h-8 px-3 text-sm text-left border border-gray-200 dark:border-gray-700 rounded-md bg-transparent flex items-center justify-between",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "text-gray-500", children: "Add tag..." }),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("svg", { className: "h-4 w-4 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })
            ]
          }
        ),
        dropdownOpen && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
          "div",
          {
            className: "absolute z-50 top-full left-0 mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-auto overscroll-contain p-1",
            onWheel: (e) => e.stopPropagation(),
            children: unselectedTags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
              "button",
              {
                type: "button",
                onClick: () => handleAddTag(tag.id),
                className: "w-full px-3 py-2.5 md:px-2 md:py-1.5 min-h-[44px] md:min-h-0 text-left text-sm rounded-sm hover:bg-accent cursor-default",
                children: tag.name
              },
              tag.id
            ))
          }
        )
      ] }) : availableTags.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("p", { className: "text-sm text-gray-500", children: "No tags available. Create tags in Settings." }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("p", { className: "text-sm text-gray-500", children: "All tags added" }) })
    ] })
  ] });
}

// src/ui/hooks/useComments.ts
var import_react15 = require("react");
function useComments({
  postId: initialPostId,
  editor,
  apiBasePath = "/api/cms",
  onSave
}) {
  const [postId, setPostId] = (0, import_react15.useState)(initialPostId);
  const [comments, setComments] = (0, import_react15.useState)([]);
  const [loading, setLoading] = (0, import_react15.useState)(false);
  const [activeCommentId, setActiveCommentId] = (0, import_react15.useState)(null);
  const [selectedText, setSelectedText] = (0, import_react15.useState)(null);
  const client = createCommentsClient(apiBasePath);
  (0, import_react15.useEffect)(() => {
    setPostId(initialPostId);
  }, [initialPostId]);
  (0, import_react15.useEffect)(() => {
    if (!postId) {
      setComments([]);
      return;
    }
    setLoading(true);
    client.fetchComments(postId).then((data) => {
      setComments(data);
      if (editor) {
        applyCommentMarks(editor, data);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [postId, editor]);
  const createComment = (0, import_react15.useCallback)(async (content) => {
    if (!selectedText) return;
    let effectivePostId = postId;
    if (!effectivePostId && onSave) {
      effectivePostId = await onSave();
      if (effectivePostId) {
        setPostId(effectivePostId);
      }
    }
    if (!effectivePostId) {
      console.error("Cannot create comment: no post ID");
      return;
    }
    const comment = await client.createComment(effectivePostId, {
      quotedText: selectedText.text,
      content
    });
    if (editor) {
      addCommentMark(editor, comment.id, selectedText.from, selectedText.to);
    }
    setComments((prev) => [{ ...comment, replies: [] }, ...prev]);
    setSelectedText(null);
  }, [postId, selectedText, editor, onSave, client]);
  const replyToComment = (0, import_react15.useCallback)(async (parentId, content) => {
    if (!postId) return;
    const reply = await client.createComment(postId, {
      quotedText: "",
      content,
      parentId
    });
    setComments(
      (prev) => prev.map(
        (c) => c.id === parentId ? { ...c, replies: [...c.replies || [], reply] } : c
      )
    );
  }, [postId, client]);
  const editComment = (0, import_react15.useCallback)(async (commentId, content) => {
    if (!postId) return;
    const updated = await client.updateComment(postId, commentId, content);
    setComments(
      (prev) => prev.map((c) => {
        if (c.id === commentId) {
          return { ...c, ...updated };
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map(
              (r) => r.id === commentId ? { ...r, ...updated } : r
            )
          };
        }
        return c;
      })
    );
  }, [postId, client]);
  const removeComment = (0, import_react15.useCallback)(async (commentId) => {
    if (!postId) return;
    await client.deleteComment(postId, commentId);
    if (editor) {
      removeCommentMark(editor, commentId);
    }
    setComments((prev) => {
      const isTopLevel = prev.some((c) => c.id === commentId);
      if (isTopLevel) {
        return prev.filter((c) => c.id !== commentId);
      }
      return prev.map((c) => ({
        ...c,
        replies: c.replies?.filter((r) => r.id !== commentId)
      }));
    });
  }, [postId, editor, client]);
  const resolveComment = (0, import_react15.useCallback)(async (commentId) => {
    if (!postId) return;
    const updated = await client.toggleResolve(postId, commentId);
    if (editor) {
      const comment = comments.find((c) => c.id === commentId);
      if (updated.resolved) {
        removeCommentMark(editor, commentId);
      } else if (comment && selectedText) {
        addCommentMark(editor, commentId, selectedText.from, selectedText.to);
      }
    }
    setComments(
      (prev) => prev.map((c) => c.id === commentId ? { ...c, resolved: updated.resolved } : c)
    );
  }, [postId, editor, comments, selectedText, client]);
  const resolveAllComments = (0, import_react15.useCallback)(async () => {
    if (!postId) return;
    await client.resolveAllComments(postId);
    if (editor) {
      comments.filter((c) => !c.resolved && !c.parentId).forEach((c) => {
        removeCommentMark(editor, c.id);
      });
    }
    setComments(
      (prev) => prev.map((c) => ({ ...c, resolved: true }))
    );
  }, [postId, editor, comments, client]);
  const scrollToCommentMark = (0, import_react15.useCallback)((commentId) => {
    if (editor) {
      scrollToComment(editor, commentId);
    }
    setActiveCommentId(commentId);
  }, [editor]);
  const openCount = comments.filter((c) => !c.resolved && !c.parentId).length;
  return {
    list: comments,
    loading,
    activeId: activeCommentId,
    setActiveId: setActiveCommentId,
    selectedText,
    setSelectedText,
    postId,
    create: createComment,
    reply: replyToComment,
    edit: editComment,
    remove: removeComment,
    resolve: resolveComment,
    resolveAll: resolveAllComments,
    scrollTo: scrollToCommentMark,
    openCount
  };
}

// src/ui/hooks/useChat.tsx
var import_react16 = require("react");
var import_jsx_runtime18 = require("react/jsx-runtime");
var ChatContext = (0, import_react16.createContext)(null);
function parseEditBlocks(content) {
  const editRegex = /:::edit\s*([\s\S]*?)\s*:::/g;
  const edits = [];
  let cleanContent = content;
  let match;
  while ((match = editRegex.exec(content)) !== null) {
    try {
      const edit = JSON.parse(match[1]);
      edits.push(edit);
      cleanContent = cleanContent.replace(match[0], "");
    } catch {
      console.warn("Failed to parse edit block:", match[1]);
    }
  }
  cleanContent = cleanContent.replace(/\n{3,}/g, "\n\n").trim();
  return { edits, cleanContent };
}
function cleanPlanOutput(content) {
  let cleaned = content;
  const planMatch = cleaned.match(/<plan>([\s\S]*?)<\/plan>/i);
  if (planMatch) {
    cleaned = planMatch[1];
  } else {
    const openTagMatch = cleaned.match(/<plan>([\s\S]*)/i);
    if (openTagMatch) {
      cleaned = openTagMatch[1];
    }
  }
  const lines = cleaned.split("\n");
  let lastBulletIndex = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim().startsWith("- ")) {
      lastBulletIndex = i;
      break;
    }
  }
  if (lastBulletIndex === -1) {
    return cleaned.trim();
  }
  return lines.slice(0, lastBulletIndex + 1).join("\n").trim();
}
function ChatProvider({
  children,
  apiBasePath = "/api/cms",
  chatApiPath,
  historyApiPath = "/api/chat/history"
}) {
  const [messages, setMessages] = (0, import_react16.useState)([]);
  const [essayContext, setEssayContext] = (0, import_react16.useState)(null);
  const [isStreaming, setIsStreaming] = (0, import_react16.useState)(false);
  const [isOpen, setIsOpen] = (0, import_react16.useState)(false);
  const [mode, setMode] = (0, import_react16.useState)("ask");
  const [webSearchEnabled, setWebSearchEnabled] = (0, import_react16.useState)(false);
  const [thinkingEnabled, setThinkingEnabled] = (0, import_react16.useState)(false);
  const [selectedModel, setSelectedModel] = (0, import_react16.useState)("claude-sonnet");
  const editHandlerRef = (0, import_react16.useRef)(null);
  const expandPlanHandlerRef = (0, import_react16.useRef)(null);
  const historyLoadedRef = (0, import_react16.useRef)(false);
  const abortControllerRef = (0, import_react16.useRef)(null);
  const resolvedChatApiPath = chatApiPath || `${apiBasePath}/ai/chat`;
  const registerEditHandler = (0, import_react16.useCallback)((handler) => {
    editHandlerRef.current = handler;
  }, []);
  const registerExpandPlanHandler = (0, import_react16.useCallback)((handler) => {
    expandPlanHandlerRef.current = handler;
  }, []);
  const stopStreaming = (0, import_react16.useCallback)(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);
  (0, import_react16.useEffect)(() => {
    if (historyLoadedRef.current) return;
    historyLoadedRef.current = true;
    fetch(historyApiPath).then((res) => res.ok ? res.json() : []).then((data) => {
      if (data.length > 0) {
        setMessages(data.map((m) => ({ role: m.role, content: m.content })));
      }
    }).catch(() => {
    });
  }, [historyApiPath]);
  const saveMessage = (0, import_react16.useCallback)((role, content) => {
    fetch(historyApiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, content })
    }).catch(() => {
    });
  }, [historyApiPath]);
  const sendMessage = (0, import_react16.useCallback)(async (content) => {
    if (!content.trim() || isStreaming) return;
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    const userMessage = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsStreaming(true);
    saveMessage("user", content.trim());
    const assistantMessage = { role: "assistant", content: "", mode };
    setMessages([...newMessages, assistantMessage]);
    try {
      const response = await fetch(resolvedChatApiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          essayContext,
          mode,
          model: selectedModel,
          useWebSearch: webSearchEnabled,
          useThinking: thinkingEnabled
        }),
        signal
      });
      if (!response.ok) {
        if (response.status === 503) {
          throw new Error("AI service temporarily unavailable. Please try again.");
        }
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait before trying again.");
        }
        const errorText = await response.text();
        let errorMessage = `Server error (${response.status}). Please try again.`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch {
        }
        throw new Error(errorMessage);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let assistantContent = "";
      let appliedEdits = false;
      let buffer = "";
      while (true) {
        const { done, value: value2 } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value2, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                assistantContent += parsed.text;
              }
            } catch (parseError) {
              if (parseError instanceof Error && parseError.message !== "Unexpected token") {
                throw parseError;
              }
            }
          }
        }
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantContent, mode };
          return updated;
        });
      }
      if (mode === "agent" && editHandlerRef.current && essayContext) {
        const { edits, cleanContent } = parseEditBlocks(assistantContent);
        const previousState = {
          title: essayContext.title,
          subtitle: essayContext.subtitle || "",
          markdown: essayContext.markdown
        };
        for (const edit of edits) {
          const success = editHandlerRef.current(edit);
          if (success) appliedEdits = true;
        }
        if (edits.length > 0) {
          const finalContent = cleanContent || "Edit applied.";
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: finalContent,
              mode,
              appliedEdits,
              previousState: appliedEdits ? previousState : void 0
            };
            return updated;
          });
          saveMessage("assistant", finalContent);
        } else {
          saveMessage("assistant", assistantContent);
        }
      } else if (mode === "plan") {
        const cleanedContent = cleanPlanOutput(assistantContent);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: cleanedContent,
            mode
          };
          return updated;
        });
        saveMessage("assistant", cleanedContent);
      } else {
        saveMessage("assistant", assistantContent);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: `Error: ${errorMessage}` };
        return updated;
      });
    } finally {
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, [messages, isStreaming, essayContext, mode, webSearchEnabled, thinkingEnabled, selectedModel, saveMessage, resolvedChatApiPath]);
  const clearMessages = (0, import_react16.useCallback)(() => {
    setMessages([]);
  }, []);
  const addMessage = (0, import_react16.useCallback)((role, content) => {
    const message = { role, content };
    setMessages((prev) => [...prev, message]);
    saveMessage(role, content);
  }, [saveMessage]);
  const undoEdit = (0, import_react16.useCallback)((messageIndex) => {
    const message = messages[messageIndex];
    if (!message?.previousState || !editHandlerRef.current) return;
    const success = editHandlerRef.current({
      type: "replace_all",
      title: message.previousState.title,
      subtitle: message.previousState.subtitle,
      markdown: message.previousState.markdown
    });
    if (success) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[messageIndex] = {
          ...updated[messageIndex],
          appliedEdits: false,
          previousState: void 0
        };
        return updated;
      });
    }
  }, [messages]);
  const expandPlan = (0, import_react16.useCallback)((wordCount = 800) => {
    if (!expandPlanHandlerRef.current) return;
    const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistantMessage?.content) return;
    expandPlanHandlerRef.current(lastAssistantMessage.content, wordCount);
    setIsOpen(false);
  }, [messages]);
  const value = (0, import_react16.useMemo)(() => ({
    messages,
    essayContext,
    isStreaming,
    isOpen,
    mode,
    webSearchEnabled,
    thinkingEnabled,
    selectedModel,
    setEssayContext,
    sendMessage,
    stopStreaming,
    addMessage,
    clearMessages,
    setIsOpen,
    setMode,
    setWebSearchEnabled,
    setThinkingEnabled,
    setSelectedModel,
    registerEditHandler,
    undoEdit,
    registerExpandPlanHandler,
    expandPlan
  }), [
    messages,
    essayContext,
    isStreaming,
    isOpen,
    mode,
    webSearchEnabled,
    thinkingEnabled,
    selectedModel,
    sendMessage,
    stopStreaming,
    addMessage,
    clearMessages,
    registerEditHandler,
    undoEdit,
    registerExpandPlanHandler,
    expandPlan
  ]);
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(ChatContext.Provider, { value, children });
}
function useChatContext() {
  const context = (0, import_react16.useContext)(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
function useChatContextOptional() {
  return (0, import_react16.useContext)(ChatContext);
}

// src/ui/pages/EditorPage.tsx
var import_jsx_runtime19 = require("react/jsx-runtime");
function Skeleton2({ className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: `bg-gray-200 dark:bg-gray-800 animate-pulse rounded ${className || ""}` });
}
function ContentSkeleton({ styles }) {
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: `${styles.container} pt-12 pb-24 mx-auto`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "space-y-2 mb-8", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-8 w-4/5" }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-5 w-3/5" }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "!mt-4", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-3 w-24" }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "space-y-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-4 w-full" }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-4 w-full" }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-4 w-3/4" }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-4 w-full" }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-4 w-5/6" })
    ] })
  ] });
}
function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  disabled,
  className
}) {
  const ref = (0, import_react17.useRef)(null);
  (0, import_react17.useEffect)(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
    "textarea",
    {
      ref,
      value,
      onChange: (e) => onChange(e.target.value),
      placeholder,
      disabled,
      rows: 1,
      onKeyDown: (e) => {
        if (e.key === "Enter") e.preventDefault();
      },
      className: `resize-none overflow-hidden ${className || ""}`
    }
  );
}
function EditorPage({ slug, onEditorStateChange: onEditorStateChangeProp }) {
  const { apiBasePath, styles, fields, navigate, basePath, onRegisterEditHandler, sharedData } = useDashboardContext();
  const postUrlPattern = sharedData?.settings?.postUrlPattern ?? "/e/{slug}";
  const urlPrefix = postUrlPattern.split("{slug}")[0];
  const chatContext = useChatContextOptional();
  const onEditorStateChange = onEditorStateChangeProp;
  const [post, setPost] = (0, import_react17.useState)({
    title: "",
    subtitle: "",
    slug: "",
    markdown: "",
    status: "draft",
    tags: []
  });
  const [loading, setLoading] = (0, import_react17.useState)(!!slug);
  const [saving, setSaving] = (0, import_react17.useState)(false);
  const [savingAs, setSavingAs] = (0, import_react17.useState)(null);
  const [lastSaved, setLastSaved] = (0, import_react17.useState)(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = (0, import_react17.useState)(false);
  const [generating, setGenerating] = (0, import_react17.useState)(false);
  const abortControllerRef = (0, import_react17.useRef)(null);
  const savedContent = (0, import_react17.useRef)("");
  const textareaRef = (0, import_react17.useRef)(null);
  const hasTriggeredGeneration = (0, import_react17.useRef)(false);
  const [showMarkdown, setShowMarkdown] = (0, import_react17.useState)(false);
  const [editor, setEditor] = (0, import_react17.useState)(null);
  const [revisions, setRevisions] = (0, import_react17.useState)([]);
  const [revisionsLoading, setRevisionsLoading] = (0, import_react17.useState)(false);
  const [previewingRevision, setPreviewingRevision] = (0, import_react17.useState)(null);
  const [originalPost, setOriginalPost] = (0, import_react17.useState)(null);
  const [commentsOpen, setCommentsOpen] = (0, import_react17.useState)(false);
  const { session } = useDashboardContext();
  const currentUserEmail = session?.user?.email || "";
  const isAdmin = session?.user?.role === "admin";
  const savePost = (0, import_react17.useCallback)(async (silent = false) => {
    if (!silent) {
      setSaving(true);
      setSavingAs("draft");
    }
    try {
      const method = post.id ? "PATCH" : "POST";
      const url = post.id ? `${apiBasePath}/posts/${post.id}` : `${apiBasePath}/posts`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title || "Untitled Draft",
          subtitle: post.subtitle || null,
          slug: post.slug || void 0,
          markdown: post.markdown,
          status: post.status,
          tagIds: post.tags?.map((t) => t.id),
          ...Object.fromEntries(fields.map((f) => [f.name, post[f.name]]))
        })
      });
      const data = await res.json();
      if (data.data) {
        setPost((prev) => ({ ...prev, ...data.data }));
        savedContent.current = JSON.stringify({ title: data.data.title, subtitle: data.data.subtitle, markdown: data.data.markdown });
        setLastSaved(/* @__PURE__ */ new Date());
        setHasUnsavedChanges(false);
        if (!post.id && data.data.slug) {
          navigate(`/editor/${data.data.slug}`);
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
      throw err;
    } finally {
      if (!silent) {
        setSaving(false);
        setSavingAs(null);
      }
    }
  }, [post.id, post.title, post.subtitle, post.slug, post.markdown, post.status, post.tags, apiBasePath, fields, navigate]);
  const handlePublish = (0, import_react17.useCallback)(async () => {
    if (!confirm("Publish this essay?")) return;
    setSaving(true);
    setSavingAs("published");
    try {
      const method = post.id ? "PATCH" : "POST";
      const url = post.id ? `${apiBasePath}/posts/${post.id}` : `${apiBasePath}/posts`;
      let currentPost;
      setPost((p) => {
        currentPost = p;
        return p;
      });
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentPost,
          title: currentPost.title || "Untitled",
          status: "published",
          ...Object.fromEntries(fields.map((f) => [f.name, currentPost[f.name]]))
        })
      });
      if (res.ok) {
        navigate("/");
      }
    } finally {
      setSaving(false);
      setSavingAs(null);
    }
  }, [post.id, apiBasePath, fields, navigate]);
  const comments = useComments({
    postId: post.id || null,
    editor,
    apiBasePath,
    onSave: async () => {
      await savePost(true);
      return post.id || null;
    }
  });
  const [urlParams, setUrlParams] = (0, import_react17.useState)({});
  (0, import_react17.useEffect)(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setUrlParams({
        idea: params.get("idea") || void 0,
        model: params.get("model") || void 0,
        length: params.get("length") || void 0,
        web: params.get("web") || void 0,
        thinking: params.get("thinking") || void 0,
        comment: params.get("comment") || void 0,
        fromPlan: params.get("fromPlan") || void 0
      });
    }
  }, []);
  (0, import_react17.useEffect)(() => {
    if (urlParams.comment && !comments.loading && comments.list.length > 0) {
      setCommentsOpen(true);
      comments.setActiveId(urlParams.comment);
      setTimeout(() => {
        comments.scrollTo(urlParams.comment);
      }, 100);
    }
  }, [urlParams.comment, comments.loading, comments.list.length]);
  (0, import_react17.useEffect)(() => {
    if (slug) {
      fetch(`${apiBasePath}/posts`).then((r) => r.json()).then((d) => {
        const found = d.data?.find((p) => p.slug === slug);
        if (found) {
          setPost(found);
          savedContent.current = JSON.stringify({ title: found.title, subtitle: found.subtitle, markdown: found.markdown });
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [slug, apiBasePath]);
  (0, import_react17.useEffect)(() => {
    const current = JSON.stringify({ title: post.title, subtitle: post.subtitle, markdown: post.markdown });
    if (savedContent.current === "") {
      setHasUnsavedChanges(!!(post.title || post.subtitle || post.markdown));
    } else {
      setHasUnsavedChanges(current !== savedContent.current);
    }
  }, [post.title, post.subtitle, post.markdown]);
  const savePostRef = (0, import_react17.useRef)(savePost);
  const handlePublishRef = (0, import_react17.useRef)(handlePublish);
  const onEditorStateChangeRef = (0, import_react17.useRef)(onEditorStateChange);
  (0, import_react17.useEffect)(() => {
    savePostRef.current = savePost;
  }, [savePost]);
  (0, import_react17.useEffect)(() => {
    handlePublishRef.current = handlePublish;
  }, [handlePublish]);
  (0, import_react17.useEffect)(() => {
    onEditorStateChangeRef.current = onEditorStateChange;
  }, [onEditorStateChange]);
  (0, import_react17.useEffect)(() => {
    if (!onEditorStateChangeRef.current) return;
    const confirmLeave = () => {
      if (hasUnsavedChanges) {
        return confirm("You have unsaved changes. Leave anyway?");
      }
      return true;
    };
    onEditorStateChangeRef.current({
      hasUnsavedChanges,
      status: post.status,
      savingAs,
      onSave: (status) => {
        if (status === "draft") {
          savePostRef.current();
        } else {
          handlePublishRef.current();
        }
      },
      confirmLeave,
      // Include content for chat integration
      content: {
        title: post.title,
        subtitle: post.subtitle,
        markdown: post.markdown
      }
    });
    return () => {
      onEditorStateChangeRef.current?.(null);
    };
  }, [hasUnsavedChanges, post.status, savingAs, post.title, post.subtitle, post.markdown]);
  const handleEdit = (0, import_react17.useCallback)((edit) => {
    if (edit.type === "replace_all") {
      setPost((prev) => ({
        ...prev,
        title: edit.title ?? prev.title,
        subtitle: edit.subtitle ?? prev.subtitle,
        markdown: edit.markdown ?? prev.markdown
      }));
      return true;
    }
    if (edit.type === "replace_section" && edit.find && edit.replace !== void 0) {
      let found = false;
      setPost((prev) => {
        if (prev.markdown.includes(edit.find)) {
          found = true;
          return { ...prev, markdown: prev.markdown.replace(edit.find, edit.replace) };
        }
        return prev;
      });
      return found;
    }
    if (edit.type === "insert" && edit.replace !== void 0) {
      if (edit.position === "start") {
        setPost((prev) => ({ ...prev, markdown: edit.replace + prev.markdown }));
        return true;
      }
      if (edit.position === "end") {
        setPost((prev) => ({ ...prev, markdown: prev.markdown + edit.replace }));
        return true;
      }
      if (edit.find) {
        let found = false;
        setPost((prev) => {
          if (prev.markdown.includes(edit.find)) {
            found = true;
            const idx = prev.markdown.indexOf(edit.find);
            const insertPoint = edit.position === "before" ? idx : idx + edit.find.length;
            return {
              ...prev,
              markdown: prev.markdown.slice(0, insertPoint) + edit.replace + prev.markdown.slice(insertPoint)
            };
          }
          return prev;
        });
        return found;
      }
      return false;
    }
    if (edit.type === "delete" && edit.find) {
      let found = false;
      setPost((prev) => {
        if (prev.markdown.includes(edit.find)) {
          found = true;
          return { ...prev, markdown: prev.markdown.replace(edit.find, "") };
        }
        return prev;
      });
      return found;
    }
    return false;
  }, []);
  (0, import_react17.useEffect)(() => {
    if (!onRegisterEditHandler) return;
    onRegisterEditHandler(handleEdit);
    return () => {
      onRegisterEditHandler(null);
    };
  }, [handleEdit, onRegisterEditHandler]);
  const registerEditHandler = chatContext?.registerEditHandler;
  (0, import_react17.useEffect)(() => {
    if (!registerEditHandler) return;
    registerEditHandler(handleEdit);
    return () => {
      registerEditHandler(null);
    };
  }, [handleEdit, registerEditHandler]);
  const expandPlanToEssay = (0, import_react17.useCallback)(async (plan, wordCount = 800) => {
    if (generating) return;
    if (post.title || post.subtitle || post.markdown) {
      if (!confirm("This will replace your current content with a new essay. Continue?")) {
        return;
      }
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setGenerating(true);
    try {
      const res = await fetch(`${apiBasePath}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "expand_plan",
          plan,
          wordCount,
          model: chatContext?.selectedModel
        }),
        signal: abortController.signal
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Generation failed" }));
        console.error("Plan expansion failed:", error);
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let fullContent = "";
      let titleExtracted = false;
      let subtitleExtracted = false;
      let bodyStartIndex = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const sseLines = chunk.split("\n");
        for (const line of sseLines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullContent += parsed.text;
                if (!titleExtracted && fullContent.includes("\n")) {
                  const firstLine = fullContent.split("\n")[0];
                  if (firstLine.startsWith("# ")) {
                    const title = firstLine.slice(2).trim();
                    setPost((prev) => ({ ...prev, title }));
                    titleExtracted = true;
                    bodyStartIndex = firstLine.length + 1;
                  }
                }
                if (titleExtracted && !subtitleExtracted) {
                  const afterTitle = fullContent.slice(bodyStartIndex);
                  if (afterTitle.includes("\n")) {
                    const lines = afterTitle.split("\n");
                    let lineOffset = 0;
                    let rawSubtitleLine = "";
                    for (let i = 0; i < lines.length - 1; i++) {
                      if (lines[i].trim()) {
                        rawSubtitleLine = lines[i];
                        break;
                      }
                      lineOffset += lines[i].length + 1;
                    }
                    if (rawSubtitleLine) {
                      const subtitleLine = rawSubtitleLine.trim();
                      const italicMatch = subtitleLine.match(/^\*(.+)\*$/) || subtitleLine.match(/^_(.+)_$/);
                      if (italicMatch) {
                        const subtitle = italicMatch[1];
                        setPost((prev) => ({ ...prev, subtitle }));
                        subtitleExtracted = true;
                        bodyStartIndex += lineOffset + rawSubtitleLine.length + 1;
                      } else {
                        subtitleExtracted = true;
                        bodyStartIndex += lineOffset;
                      }
                    }
                  }
                }
                if (titleExtracted) {
                  const bodyContent = fullContent.slice(bodyStartIndex).trim();
                  setPost((prev) => ({ ...prev, markdown: bodyContent }));
                }
              }
            } catch {
            }
          }
        }
      }
      const finalBody = fullContent.slice(bodyStartIndex).trim();
      setPost((prev) => ({
        ...prev,
        markdown: finalBody
      }));
      if (chatContext?.addMessage) {
        chatContext.addMessage("assistant", "\u2713 Essay drafted from plan. You can now edit it or ask me questions about it.");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        if (chatContext?.addMessage) {
          chatContext.addMessage("assistant", "\u23F9 Generation stopped. You can continue editing what was generated.");
        }
      } else {
        console.error("Plan expansion error:", err);
      }
    } finally {
      setGenerating(false);
      abortControllerRef.current = null;
    }
  }, [generating, post.title, post.subtitle, post.markdown, apiBasePath, chatContext]);
  (0, import_react17.useEffect)(() => {
    if (!chatContext?.registerExpandPlanHandler) return;
    chatContext.registerExpandPlanHandler(expandPlanToEssay);
    return () => {
      chatContext.registerExpandPlanHandler(null);
    };
  }, [chatContext, expandPlanToEssay]);
  const hasTriggeredPlanExpansion = (0, import_react17.useRef)(false);
  (0, import_react17.useEffect)(() => {
    if (urlParams.fromPlan && !slug && !loading && !hasTriggeredPlanExpansion.current) {
      hasTriggeredPlanExpansion.current = true;
      const pendingPlan = sessionStorage.getItem("pendingPlan");
      if (pendingPlan) {
        sessionStorage.removeItem("pendingPlan");
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", `${basePath}/editor`);
        }
        expandPlanToEssay(pendingPlan, 800);
      }
    }
  }, [urlParams.fromPlan, slug, loading, basePath, expandPlanToEssay]);
  (0, import_react17.useEffect)(() => {
    if (!post.id || post.status === "published" || !hasUnsavedChanges || previewingRevision) return;
    const timeout = setTimeout(() => savePostRef.current(true), 3e3);
    return () => clearTimeout(timeout);
  }, [post.id, post.status, post.title, post.subtitle, post.markdown, hasUnsavedChanges, previewingRevision]);
  (0, import_react17.useEffect)(() => {
    const handler = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);
  (0, import_react17.useEffect)(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (previewingRevision) {
          cancelRevisionPreview();
          e.stopImmediatePropagation();
          return;
        }
        if (generating) {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          e.stopImmediatePropagation();
          return;
        }
        if (hasUnsavedChanges && !confirm("You have unsaved changes. Leave anyway?")) return;
        navigate("/");
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [hasUnsavedChanges, generating, navigate, previewingRevision]);
  (0, import_react17.useEffect)(() => {
    if (urlParams.idea && !slug && !loading && !hasTriggeredGeneration.current) {
      if (post.title || post.subtitle || post.markdown) {
        if (!confirm("This will replace your current content. Continue?")) {
          hasTriggeredGeneration.current = true;
          if (typeof window !== "undefined") {
            window.history.replaceState({}, "", `${basePath}/editor`);
          }
          return;
        }
      }
      hasTriggeredGeneration.current = true;
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      setGenerating(true);
      const generationPrompt = urlParams.idea;
      const wordCount = urlParams.length ? parseInt(urlParams.length) : 500;
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", `${basePath}/editor`);
      }
      const runGenerate = async () => {
        try {
          const res = await fetch(`${apiBasePath}/ai/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: urlParams.idea,
              wordCount,
              model: urlParams.model,
              useWebSearch: urlParams.web === "1",
              useThinking: urlParams.thinking === "1"
            }),
            signal: abortController.signal
          });
          if (!res.ok) {
            const error = await res.json().catch(() => ({ error: "Generation failed" }));
            console.error("Generation failed:", error);
            return;
          }
          const reader = res.body?.getReader();
          if (!reader) return;
          const decoder = new TextDecoder();
          let fullContent = "";
          let titleExtracted = false;
          let subtitleExtracted = false;
          let bodyStartIndex = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const sseLines = chunk.split("\n");
            for (const line of sseLines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    fullContent += parsed.text;
                    if (!titleExtracted && fullContent.includes("\n")) {
                      const firstLine = fullContent.split("\n")[0];
                      if (firstLine.startsWith("# ")) {
                        const title = firstLine.slice(2).trim();
                        setPost((prev) => ({ ...prev, title }));
                        titleExtracted = true;
                        bodyStartIndex = firstLine.length + 1;
                      }
                    }
                    if (titleExtracted && !subtitleExtracted) {
                      const afterTitle = fullContent.slice(bodyStartIndex);
                      if (afterTitle.includes("\n")) {
                        const lines = afterTitle.split("\n");
                        let lineOffset = 0;
                        let rawSubtitleLine = "";
                        for (let i = 0; i < lines.length - 1; i++) {
                          if (lines[i].trim()) {
                            rawSubtitleLine = lines[i];
                            break;
                          }
                          lineOffset += lines[i].length + 1;
                        }
                        if (rawSubtitleLine) {
                          const subtitleLine = rawSubtitleLine.trim();
                          const italicMatch = subtitleLine.match(/^\*(.+)\*$/) || subtitleLine.match(/^_(.+)_$/);
                          if (italicMatch) {
                            const subtitle = italicMatch[1];
                            setPost((prev) => ({ ...prev, subtitle }));
                            subtitleExtracted = true;
                            bodyStartIndex += lineOffset + rawSubtitleLine.length + 1;
                          } else {
                            subtitleExtracted = true;
                            bodyStartIndex += lineOffset;
                          }
                        }
                      }
                    }
                    if (titleExtracted) {
                      const bodyContent = fullContent.slice(bodyStartIndex).trim();
                      setPost((prev) => ({ ...prev, markdown: bodyContent }));
                    }
                  }
                } catch {
                }
              }
            }
          }
          const finalBody = fullContent.slice(bodyStartIndex).trim();
          setPost((prev) => ({
            ...prev,
            markdown: finalBody
          }));
          if (chatContext?.addMessage) {
            chatContext.addMessage("user", `Generate essay: ${generationPrompt}`);
            chatContext.addMessage("assistant", "\u2713 Essay generated successfully. You can now edit it in the editor or ask me questions about it.");
          }
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            if (chatContext?.addMessage) {
              chatContext.addMessage("user", `Generate essay: ${generationPrompt}`);
              chatContext.addMessage("assistant", "\u23F9 Generation stopped. You can continue editing what was generated.");
            }
          } else {
            console.error("Generation error:", err);
            if (chatContext?.addMessage) {
              chatContext.addMessage("user", `Generate essay: ${generationPrompt}`);
              chatContext.addMessage("assistant", "\u26A0 Generation started but was interrupted. You can try again or continue editing what was generated.");
            }
          }
        } finally {
          setGenerating(false);
          abortControllerRef.current = null;
        }
      };
      runGenerate();
    }
  }, [urlParams, slug, loading, apiBasePath, basePath, chatContext]);
  const fetchRevisions = (0, import_react17.useCallback)(async () => {
    if (!post.id) return;
    setRevisionsLoading(true);
    try {
      const res = await fetch(`${apiBasePath}/revisions?postId=${post.id}`);
      const data = await res.json();
      setRevisions(data.data || []);
    } catch (err) {
      console.error("Failed to fetch revisions:", err);
    } finally {
      setRevisionsLoading(false);
    }
  }, [post.id, apiBasePath]);
  const previewRevision = (0, import_react17.useCallback)(async (revisionId) => {
    const revision = revisions.find((r) => r.id === revisionId);
    if (!revision) return;
    if (!originalPost) {
      setOriginalPost({ ...post });
    }
    setPreviewingRevision(revision);
    setPost((prev) => ({
      ...prev,
      title: revision.title || prev.title,
      subtitle: revision.subtitle || prev.subtitle,
      markdown: revision.markdown
    }));
  }, [revisions, post, originalPost]);
  const cancelRevisionPreview = (0, import_react17.useCallback)(() => {
    if (originalPost) {
      setPost(originalPost);
      setOriginalPost(null);
    }
    setPreviewingRevision(null);
  }, [originalPost]);
  const restoreRevision = (0, import_react17.useCallback)(async () => {
    if (!previewingRevision) return;
    setOriginalPost(null);
    setPreviewingRevision(null);
    await savePost();
  }, [previewingRevision, savePost]);
  const handleUnpublish = async () => {
    if (!confirm("Unpublish this essay?")) return;
    await fetch(`${apiBasePath}/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "draft" })
    });
    setPost((prev) => ({ ...prev, status: "draft" }));
  };
  const words = countWords(post.markdown);
  const isPublished = post.status === "published";
  if (loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex flex-col h-full", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        EditorToolbar,
        {
          textareaRef,
          markdown: "",
          onMarkdownChange: () => {
          },
          loading: true
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("main", { className: "flex-1 overflow-auto pb-20 pt-[41px]", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(ContentSkeleton, { styles }) })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex flex-col h-full", children: [
    previewingRevision && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { className: "text-sm text-amber-800 dark:text-amber-200", children: [
        "Previewing revision from ",
        new Date(previewingRevision.createdAt).toLocaleString()
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          "button",
          {
            onClick: cancelRevisionPreview,
            className: "px-3 py-1 text-sm border border-amber-300 dark:border-amber-700 rounded hover:bg-amber-200 dark:hover:bg-amber-800",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          "button",
          {
            onClick: restoreRevision,
            className: "px-3 py-1 text-sm bg-amber-600 text-white rounded hover:bg-amber-700",
            children: "Restore"
          }
        )
      ] })
    ] }),
    !previewingRevision && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
      EditorToolbar,
      {
        editor: showMarkdown ? null : editor,
        textareaRef: showMarkdown ? textareaRef : void 0,
        markdown: post.markdown,
        onMarkdownChange: (md) => setPost((prev) => ({ ...prev, markdown: md })),
        showMarkdown,
        setShowMarkdown,
        aiGenerating: generating,
        postSlug: slug,
        revisions: post.id ? {
          list: revisions,
          loading: revisionsLoading,
          previewLoading: false,
          previewing: previewingRevision,
          fetch: fetchRevisions,
          preview: previewRevision,
          cancel: cancelRevisionPreview,
          restore: restoreRevision
        } : void 0,
        apiBasePath,
        hasSelection: !!comments.selectedText && !comments.selectedText.hasExistingComment,
        selectionHasComment: comments.selectedText?.hasExistingComment,
        onAddComment: () => setCommentsOpen(true),
        commentsCount: comments.list.filter((c) => !c.resolved).length,
        onViewComments: () => setCommentsOpen(true)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("main", { className: `flex-1 overflow-auto pb-20 overscroll-contain ${!previewingRevision ? "pt-[41px]" : ""}`, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("article", { className: `${styles.container} pt-12 pb-24 mx-auto`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("header", { className: "space-y-2 mb-8", children: [
        generating && !post.title ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-8 w-4/5" }) : /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          AutoResizeTextarea,
          {
            value: post.title,
            onChange: (val) => setPost((prev) => ({ ...prev, title: val })),
            placeholder: "Title",
            disabled: generating || !!previewingRevision,
            className: `${styles.title} w-full bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-700 ${generating || previewingRevision ? "opacity-60 cursor-not-allowed" : ""}`
          }
        ),
        generating && !post.subtitle ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-5 w-3/5" }) : /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          AutoResizeTextarea,
          {
            value: post.subtitle,
            onChange: (val) => setPost((prev) => ({ ...prev, subtitle: val })),
            placeholder: "Subtitle",
            disabled: generating || !!previewingRevision,
            className: `${styles.subtitle} w-full bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-700 ${generating || previewingRevision ? "opacity-60 cursor-not-allowed" : ""}`
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "!mt-4", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: `${styles.byline} underline ${generating ? "opacity-60" : ""}`, children: session?.user?.name || session?.user?.email || "Author" }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "mt-8", children: generating && !post.markdown ? /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "space-y-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-4 w-full" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-4 w-full" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-4 w-3/4" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-4 w-full" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Skeleton2, { className: "h-4 w-5/6" })
      ] }) : showMarkdown ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        "textarea",
        {
          ref: textareaRef,
          value: post.markdown,
          onChange: (e) => setPost((prev) => ({ ...prev, markdown: e.target.value })),
          placeholder: "Start writing...",
          disabled: generating || !!previewingRevision,
          className: `${styles.prose} w-full min-h-[400px] bg-transparent border-none outline-none resize-none placeholder-gray-400 leading-relaxed font-mono text-sm ${generating || previewingRevision ? "opacity-60 cursor-not-allowed" : ""}`
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        TiptapEditor,
        {
          content: post.markdown,
          onChange: (md) => setPost((prev) => ({ ...prev, markdown: md })),
          onEditorReady: setEditor,
          autoFocus: !slug,
          proseClasses: styles.prose,
          onSelectionChange: (sel) => {
            if (sel?.hasSelection) {
              comments.setSelectedText({
                text: sel.text,
                from: sel.from,
                to: sel.to,
                hasExistingComment: sel.hasExistingComment
              });
            } else {
              comments.setSelectedText(null);
            }
          },
          onCommentClick: (commentId) => {
            comments.setActiveId(commentId);
            setCommentsOpen(true);
          }
        }
      ) }),
      !previewingRevision && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 space-y-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "flex items-center justify-between text-sm", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "text-gray-500 w-14", children: "URL" }),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "text-gray-400", children: urlPrefix }),
          isPublished ? /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { className: "flex items-center gap-1.5 text-gray-600 dark:text-gray-400", children: [
            post.slug,
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("svg", { className: "w-3 h-3 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
            "input",
            {
              type: "text",
              value: post.slug,
              onChange: (e) => setPost((prev) => ({ ...prev, slug: e.target.value })),
              placeholder: "post-slug",
              className: "flex-1 bg-transparent border-none outline-none placeholder-gray-400 text-gray-600 dark:text-gray-400"
            }
          )
        ] }) }),
        fields.filter((f) => f.position === "footer").map((field) => {
          const handleFieldChange = (name, value) => {
            setPost((prev) => ({ ...prev, [name]: value }));
          };
          if (!field.label) {
            return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
              field.component,
              {
                value: post[field.name],
                onChange: (val) => setPost((prev) => ({ ...prev, [field.name]: val })),
                onFieldChange: handleFieldChange,
                post,
                disabled: saving || generating
              },
              field.name
            );
          }
          return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "flex items-center justify-between text-sm gap-2", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center gap-2 flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "text-gray-500 w-14 flex-shrink-0", children: field.label }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "flex-1", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
              field.component,
              {
                value: post[field.name],
                onChange: (val) => setPost((prev) => ({ ...prev, [field.name]: val })),
                onFieldChange: handleFieldChange,
                post,
                disabled: saving || generating
              }
            ) })
          ] }) }, field.name);
        }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          TagsSection,
          {
            tags: post.tags || [],
            onTagsChange: (tags) => setPost((prev) => ({ ...prev, tags })),
            apiBasePath,
            disabled: saving || generating
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "text-gray-500 w-14", children: "Status" }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: isPublished ? "text-green-600 dark:text-green-400" : "text-gray-500", children: isPublished ? "Published" : "Draft" })
          ] }),
          isPublished ? hasUnsavedChanges ? /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
            "button",
            {
              onClick: handlePublish,
              disabled: saving || generating,
              className: "px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 flex items-center gap-1",
              children: [
                savingAs === "published" && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("svg", { className: "w-3 h-3 animate-spin", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }),
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                ] }),
                "Update"
              ]
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
            "button",
            {
              onClick: handleUnpublish,
              className: "px-2.5 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-500 transition-colors",
              children: "Unpublish"
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
            "button",
            {
              onClick: handlePublish,
              disabled: saving || generating,
              className: "px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 flex items-center gap-1",
              children: [
                savingAs === "published" && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("svg", { className: "w-3 h-3 animate-spin", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }),
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                ] }),
                "Publish"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "text-sm text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-800", children: [
          words.toLocaleString(),
          " words \xB7 ~",
          Math.ceil(words / 200),
          " min read"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("footer", { className: "fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-black touch-none", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "flex items-center justify-end text-sm text-gray-500", children: generating ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("button", { className: "hover:text-gray-900 dark:hover:text-white transition-colors", children: "Press Esc to stop generating" }) : previewingRevision ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
      "button",
      {
        onClick: cancelRevisionPreview,
        className: "hover:text-gray-900 dark:hover:text-white transition-colors",
        children: "Press Esc to cancel"
      }
    ) : lastSaved ? /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { children: [
      "Saved ",
      formatSavedTime(lastSaved)
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { children: "Not saved yet" }) }) }),
    currentUserEmail && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
      CommentsPanel,
      {
        comments: comments.list,
        currentUserEmail,
        isAdmin,
        selectedText: comments.selectedText?.text ?? null,
        onCreateComment: comments.create,
        onReply: comments.reply,
        onEdit: comments.edit,
        onDelete: comments.remove,
        onResolve: comments.resolve,
        onCommentClick: comments.scrollTo,
        activeCommentId: comments.activeId,
        isOpen: commentsOpen,
        onClose: () => setCommentsOpen(false),
        onClearSelection: () => comments.setSelectedText(null)
      }
    )
  ] });
}

// src/ui/pages/SettingsPage.tsx
var import_react18 = require("react");
var import_lucide_react11 = require("lucide-react");
var import_jsx_runtime20 = require("react/jsx-runtime");
function SettingsPage({ subPath }) {
  const { navigate, sharedData, sharedDataLoading } = useDashboardContext();
  const counts = sharedData?.counts || {};
  const autoDraftEnabled = sharedData?.settings?.autoDraftEnabled ?? false;
  const loading = sharedDataLoading;
  const allSettingsLinks = [
    { path: "/settings/users", label: "Users", description: "Manage who can access the CMS", countKey: "users" },
    { path: "/settings/posts", label: "All Posts", description: "Manage all posts", countKey: "posts" },
    { path: "/settings/tags", label: "Tags", description: "Organize posts with tags", countKey: "tags" },
    { path: "/settings/ai", label: "AI Settings", description: "Configure AI models and rules" },
    { path: "/settings/revisions", label: "Revisions", description: "View revision history" },
    { path: "/settings/comments", label: "Comments", description: "Manage post comments" },
    { path: "/settings/topics", label: "Topics", description: "RSS subscriptions for auto-draft", countKey: "topics" },
    { path: "/settings/general", label: "General", description: "Post URLs and site settings" }
  ];
  const settingsLinks = autoDraftEnabled ? allSettingsLinks : allSettingsLinks.filter((link) => link.path !== "/settings/topics");
  if (!subPath || subPath === "/") {
    if (loading) {
      return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "max-w-5xl mx-auto px-6 py-8", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "h-7 w-24 bg-muted rounded animate-pulse mb-6" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4", children: [1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "p-4 sm:p-6 border border-border rounded-lg", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "h-4 w-16 bg-muted rounded animate-pulse" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "h-8 w-12 bg-muted rounded animate-pulse mt-2" })
        ] }, i)) })
      ] });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "max-w-5xl mx-auto px-6 py-8", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h2", { className: "text-lg font-semibold pb-4 mb-6 border-b border-border", children: "Settings" }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4", children: settingsLinks.map((item) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "button",
        {
          onClick: () => navigate(item.path),
          className: "p-4 sm:p-6 border border-border rounded-lg text-left hover:bg-accent transition-colors",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: item.label }),
            item.countKey ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-2xl font-bold mt-1", children: counts[item.countKey] ?? 0 }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground mt-1", children: "Configure \u2192" })
          ]
        },
        item.path
      )) })
    ] });
  }
  const pageName = subPath.slice(1);
  const revisionDetailMatch = pageName.match(/^revisions\/(.+)$/);
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "max-w-5xl mx-auto px-6 py-8", children: [
    pageName === "general" && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(GeneralSettingsContent, {}),
    pageName === "users" && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(UsersSettingsContent, {}),
    pageName === "ai" && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(AISettingsContent, {}),
    pageName === "tags" && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(TagsSettingsContent, {}),
    pageName === "topics" && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(TopicsSettingsContent, {}),
    pageName === "posts" && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(PostsSettingsContent, {}),
    pageName === "revisions" && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(RevisionsSettingsContent, {}),
    revisionDetailMatch && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(RevisionDetailContent, { revisionId: revisionDetailMatch[1] }),
    pageName === "comments" && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(CommentsSettingsContent, {})
  ] });
}
function UsersSettingsContent() {
  const { apiBasePath } = useDashboardContext();
  const [users, setUsers] = (0, import_react18.useState)([]);
  const [loading, setLoading] = (0, import_react18.useState)(true);
  const [showForm, setShowForm] = (0, import_react18.useState)(false);
  const [editingUser, setEditingUser] = (0, import_react18.useState)(null);
  const [formEmail, setFormEmail] = (0, import_react18.useState)("");
  const [formName, setFormName] = (0, import_react18.useState)("");
  const [formRole, setFormRole] = (0, import_react18.useState)("writer");
  const [formError, setFormError] = (0, import_react18.useState)("");
  const [saving, setSaving] = (0, import_react18.useState)(false);
  const [menuOpen, setMenuOpen] = (0, import_react18.useState)(null);
  (0, import_react18.useEffect)(() => {
    fetch(`${apiBasePath}/users`).then((res) => res.ok ? res.json() : Promise.reject()).then((res) => {
      setUsers(res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [apiBasePath]);
  function resetForm() {
    setFormEmail("");
    setFormName("");
    setFormRole("writer");
    setFormError("");
    setEditingUser(null);
  }
  function openNewForm() {
    resetForm();
    setShowForm(true);
  }
  function openEditForm(user) {
    setEditingUser(user);
    setFormEmail(user.email);
    setFormName(user.name || "");
    setFormRole(user.role);
    setFormError("");
    setShowForm(true);
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!formEmail) return;
    setSaving(true);
    setFormError("");
    const url = editingUser ? `${apiBasePath}/users/${editingUser.id}` : `${apiBasePath}/users`;
    const method = editingUser ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formEmail, name: formName || null, role: formRole })
    });
    if (res.ok) {
      const json = await res.json();
      if (editingUser) {
        setUsers(users.map((u) => u.id === editingUser.id ? json.data : u));
      } else {
        setUsers([json.data, ...users]);
      }
      setShowForm(false);
      resetForm();
    } else {
      const result = await res.json().catch(() => ({}));
      setFormError(result.error || `Failed to ${editingUser ? "update" : "create"} user`);
    }
    setSaving(false);
  }
  async function handleDeleteUser(id, email) {
    if (!confirm(`Delete user "${email}"?`)) return;
    const res = await fetch(`${apiBasePath}/users/${id}`, { method: "DELETE" });
    if (res.ok) setUsers(users.filter((u) => u.id !== id));
    setMenuOpen(null);
  }
  function getRoleBadgeClasses(role) {
    if (role === "admin") return "bg-primary text-primary-foreground";
    if (role === "drafter") return "border border-border text-foreground";
    return "bg-secondary text-secondary-foreground";
  }
  if (loading) return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "animate-pulse h-32 bg-muted rounded" });
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "space-y-6", children: showForm ? /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "max-w-md", children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "flex items-center justify-between mb-6", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h2", { className: "text-lg font-semibold", children: editingUser ? "Edit User" : "Add User" }) }),
    formError && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "bg-destructive/10 text-destructive p-3 rounded-lg text-sm mb-4", children: formError }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { htmlFor: "email", className: "block text-sm font-medium", children: "Email *" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "input",
          {
            type: "email",
            id: "email",
            value: formEmail,
            onChange: (e) => setFormEmail(e.target.value),
            required: true,
            placeholder: editingUser ? void 0 : "user@example.com",
            className: "w-full px-3 py-2 border border-input rounded-md bg-transparent"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { htmlFor: "name", className: "block text-sm font-medium", children: "Name" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "input",
          {
            type: "text",
            id: "name",
            value: formName,
            onChange: (e) => setFormName(e.target.value),
            placeholder: editingUser ? void 0 : "John Doe",
            className: "w-full px-3 py-2 border border-input rounded-md bg-transparent"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { htmlFor: "role", className: "block text-sm font-medium", children: "Role" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
          "select",
          {
            id: "role",
            value: formRole,
            onChange: (e) => setFormRole(e.target.value),
            className: "w-full px-3 py-2 border border-input rounded-md bg-transparent",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "drafter", children: "Drafter" }),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "writer", children: "Writer" }),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "admin", children: "Admin" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex gap-4 pt-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { type: "submit", disabled: saving, className: "px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50", children: saving ? editingUser ? "Saving..." : "Creating..." : editingUser ? "Save Changes" : "Create User" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { type: "button", onClick: () => {
          setShowForm(false);
          resetForm();
        }, className: "px-4 py-2 text-muted-foreground hover:text-foreground", children: "Cancel" })
      ] })
    ] })
  ] }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h2", { className: "text-lg font-semibold", children: "Users" }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { onClick: openNewForm, className: "px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm", children: "Add User" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "hidden md:block rounded-md border border-border", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("table", { className: "w-full", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("thead", { className: "bg-muted/50", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "px-4 py-3 text-left text-sm font-medium text-muted-foreground", children: "Email" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "px-4 py-3 text-left text-sm font-medium text-muted-foreground", children: "Name" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "px-4 py-3 text-left text-sm font-medium text-muted-foreground", children: "Role" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "px-4 py-3 text-left text-sm font-medium text-muted-foreground", children: "Created" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "px-4 py-3 text-right text-sm font-medium text-muted-foreground", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("tbody", { className: "divide-y divide-border", children: users.map((user) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "px-4 py-3 text-sm max-w-[250px] truncate", children: user.email }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "px-4 py-3 text-sm text-muted-foreground max-w-[150px] truncate", children: user.name || "\u2014" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "px-4 py-3 text-sm", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: `inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeClasses(user.role)}`, children: user.role }) }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "px-4 py-3 text-sm text-muted-foreground", children: new Date(user.createdAt).toLocaleDateString() }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "relative inline-block", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => setMenuOpen(menuOpen === user.id ? null : user.id),
                className: "p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-accent",
                children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.MoreVertical, { className: "h-4 w-4" })
              }
            ),
            menuOpen === user.id && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 min-w-[100px] py-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
                "button",
                {
                  onClick: () => {
                    openEditForm(user);
                    setMenuOpen(null);
                  },
                  className: "w-full px-3 py-2 text-left text-sm hover:bg-accent",
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "h-px bg-border my-1" }),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
                "button",
                {
                  onClick: () => handleDeleteUser(user.id, user.email),
                  className: "w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-accent",
                  children: "Delete"
                }
              )
            ] })
          ] }) })
        ] }, user.id)) })
      ] }),
      users.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "p-8 text-center text-muted-foreground", children: "No users yet. Add one to get started." })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "md:hidden divide-y divide-border rounded-md border border-border bg-background", children: [
      users.map((user) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between gap-4 px-4 py-5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "min-w-0 flex-1 space-y-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "font-medium truncate", children: user.email }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: `inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeClasses(user.role)}`, children: user.role })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { className: "text-sm text-muted-foreground truncate", children: [
            user.name || "No name",
            " \xB7 Created ",
            new Date(user.createdAt).toLocaleDateString()
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "relative", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "button",
            {
              onClick: () => setMenuOpen(menuOpen === user.id ? null : user.id),
              className: "p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-accent",
              children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.MoreVertical, { className: "h-4 w-4" })
            }
          ),
          menuOpen === user.id && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 min-w-[100px] py-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => {
                  openEditForm(user);
                  setMenuOpen(null);
                },
                className: "w-full px-3 py-2 text-left text-sm hover:bg-accent",
                children: "Edit"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "h-px bg-border my-1" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => handleDeleteUser(user.id, user.email),
                className: "w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-accent",
                children: "Delete"
              }
            )
          ] })
        ] })
      ] }, user.id)),
      users.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "p-8 text-center text-muted-foreground", children: "No users yet. Add one to get started." })
    ] })
  ] }) });
}
function CollapsibleTemplate({
  label,
  value,
  defaultValue,
  onChange,
  onReset,
  placeholders,
  disabled
}) {
  const [open, setOpen] = (0, import_react18.useState)(false);
  const isCustom = value !== null;
  const displayValue = value ?? defaultValue;
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "mt-2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
      "button",
      {
        type: "button",
        onClick: () => setOpen(!open),
        className: "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.ChevronDown, { className: `h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}` }),
          isCustom ? `Edit prompt template (customized)` : `Edit prompt template`
        ]
      }
    ),
    open && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "mt-2 space-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { className: "text-xs text-muted-foreground", children: [
          "Placeholders: ",
          placeholders
        ] }),
        isCustom && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("button", { type: "button", onClick: onReset, className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.RotateCcw, { className: "h-3 w-3" }),
          " Reset to default"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
        "textarea",
        {
          value: displayValue,
          onChange: (e) => onChange(e.target.value),
          rows: 10,
          className: "w-full px-3 py-2 border border-input rounded-md bg-transparent resize-none font-mono text-xs",
          disabled
        }
      )
    ] })
  ] });
}
function GeneralSettingsContent() {
  const { apiBasePath, sharedData, refetchSharedData } = useDashboardContext();
  const [postUrlPattern, setPostUrlPattern] = (0, import_react18.useState)(sharedData?.settings?.postUrlPattern ?? "/e/{slug}");
  const [saving, setSaving] = (0, import_react18.useState)(false);
  const [saved, setSaved] = (0, import_react18.useState)(false);
  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch(`${apiBasePath}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postUrlPattern })
    });
    setSaving(false);
    setSaved(true);
    await refetchSharedData();
    setTimeout(() => setSaved(false), 2e3);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h2", { className: "text-lg font-semibold", children: "General Settings" }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "Configure site-wide settings." })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "rounded-lg border bg-card text-card-foreground shadow-sm", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h3", { className: "text-base font-medium", children: "Post URLs" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "Configure the URL pattern for published posts." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { htmlFor: "postUrlPattern", className: "text-sm font-medium leading-none", children: "URL Pattern" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "input",
          {
            id: "postUrlPattern",
            type: "text",
            value: postUrlPattern,
            onChange: (e) => setPostUrlPattern(e.target.value),
            placeholder: "/e/{slug}",
            className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { className: "text-sm text-muted-foreground", children: [
          "Use ",
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("code", { className: "px-1 py-0.5 bg-muted rounded text-xs", children: "{slug}" }),
          " as a placeholder for the post slug. Example: ",
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("code", { className: "px-1 py-0.5 bg-muted rounded text-xs", children: [
            "/blog/",
            "{slug}"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "button",
        {
          onClick: handleSave,
          disabled: saving,
          className: "inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50",
          children: [
            saving && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            saving ? "Saving..." : "Save"
          ]
        }
      ),
      saved && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-sm text-green-600 dark:text-green-400", children: "Saved!" })
    ] })
  ] });
}
function AISettingsContent() {
  const { apiBasePath, navigate, refetchSharedData } = useDashboardContext();
  const [rules, setRules] = (0, import_react18.useState)("");
  const [chatRules, setChatRules] = (0, import_react18.useState)("");
  const [rewriteRules, setRewriteRules] = (0, import_react18.useState)("");
  const [autoDraftRules, setAutoDraftRules] = (0, import_react18.useState)("");
  const [planRules, setPlanRules] = (0, import_react18.useState)("");
  const [autoDraftWordCount, setAutoDraftWordCount] = (0, import_react18.useState)(800);
  const [autoDraftEnabled, setAutoDraftEnabled] = (0, import_react18.useState)(false);
  const [defaultModel, setDefaultModel] = (0, import_react18.useState)("claude-sonnet");
  const [models, setModels] = (0, import_react18.useState)([]);
  const [generateTemplate, setGenerateTemplate] = (0, import_react18.useState)(null);
  const [chatTemplate, setChatTemplate] = (0, import_react18.useState)(null);
  const [rewriteTemplate, setRewriteTemplate] = (0, import_react18.useState)(null);
  const [autoDraftTemplate, setAutoDraftTemplate] = (0, import_react18.useState)(null);
  const [planTemplate, setPlanTemplate] = (0, import_react18.useState)(null);
  const [expandPlanTemplate, setExpandPlanTemplate] = (0, import_react18.useState)(null);
  const [agentTemplate, setAgentTemplate] = (0, import_react18.useState)(null);
  const [defaultGenerateTemplate, setDefaultGenerateTemplate] = (0, import_react18.useState)("");
  const [defaultChatTemplate, setDefaultChatTemplate] = (0, import_react18.useState)("");
  const [defaultRewriteTemplate, setDefaultRewriteTemplate] = (0, import_react18.useState)("");
  const [defaultAutoDraftTemplate, setDefaultAutoDraftTemplate] = (0, import_react18.useState)("");
  const [defaultPlanRules, setDefaultPlanRules] = (0, import_react18.useState)("");
  const [defaultPlanTemplate, setDefaultPlanTemplate] = (0, import_react18.useState)("");
  const [defaultExpandPlanTemplate, setDefaultExpandPlanTemplate] = (0, import_react18.useState)("");
  const [defaultAgentTemplate, setDefaultAgentTemplate] = (0, import_react18.useState)("");
  const [anthropicKey, setAnthropicKey] = (0, import_react18.useState)("");
  const [openaiKey, setOpenaiKey] = (0, import_react18.useState)("");
  const [hasAnthropicEnvKey, setHasAnthropicEnvKey] = (0, import_react18.useState)(false);
  const [hasOpenaiEnvKey, setHasOpenaiEnvKey] = (0, import_react18.useState)(false);
  const [loading, setLoading] = (0, import_react18.useState)(true);
  const [saving, setSaving] = (0, import_react18.useState)(false);
  const [saved, setSaved] = (0, import_react18.useState)(false);
  (0, import_react18.useEffect)(() => {
    Promise.all([
      fetch(`${apiBasePath}/ai/settings`).then((res) => res.ok ? res.json() : Promise.reject()),
      fetch(`${apiBasePath}/settings`).then((res) => res.ok ? res.json() : Promise.reject())
    ]).then(([aiRes, settingsRes]) => {
      const data = aiRes.data || aiRes || {};
      setRules(data.rules || "");
      setChatRules(data.chatRules || "");
      setRewriteRules(data.rewriteRules || "");
      setAutoDraftRules(data.autoDraftRules || "");
      setPlanRules(data.planRules || "");
      setAutoDraftWordCount(data.autoDraftWordCount ?? 800);
      setDefaultModel(data.defaultModel || "claude-sonnet");
      setModels(data.availableModels || [
        { id: "claude-sonnet", name: "Sonnet 4.5", description: "Fast, capable, best value" },
        { id: "claude-opus", name: "Opus 4.5", description: "Highest quality, slower" },
        { id: "gpt-5.2", name: "GPT-5.2", description: "Latest OpenAI flagship" },
        { id: "gpt-5-mini", name: "GPT-5 Mini", description: "Fast and cost-efficient" }
      ]);
      setGenerateTemplate(data.generateTemplate ?? null);
      setChatTemplate(data.chatTemplate ?? null);
      setRewriteTemplate(data.rewriteTemplate ?? null);
      setAutoDraftTemplate(data.autoDraftTemplate ?? null);
      setPlanTemplate(data.planTemplate ?? null);
      setExpandPlanTemplate(data.expandPlanTemplate ?? null);
      setAgentTemplate(data.agentTemplate ?? null);
      setDefaultGenerateTemplate(data.defaultGenerateTemplate || "");
      setDefaultChatTemplate(data.defaultChatTemplate || "");
      setDefaultRewriteTemplate(data.defaultRewriteTemplate || "");
      setDefaultAutoDraftTemplate(data.defaultAutoDraftTemplate || "");
      setDefaultPlanRules(data.defaultPlanRules || "");
      setDefaultPlanTemplate(data.defaultPlanTemplate || "");
      setDefaultExpandPlanTemplate(data.defaultExpandPlanTemplate || "");
      setDefaultAgentTemplate(data.defaultAgentTemplate || "");
      setAnthropicKey(data.anthropicKey || "");
      setOpenaiKey(data.openaiKey || "");
      setHasAnthropicEnvKey(data.hasAnthropicEnvKey ?? false);
      setHasOpenaiEnvKey(data.hasOpenaiEnvKey ?? false);
      setAutoDraftEnabled(settingsRes.data?.autoDraftEnabled ?? false);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [apiBasePath]);
  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await Promise.all([
      fetch(`${apiBasePath}/ai/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rules,
          chatRules,
          rewriteRules,
          autoDraftRules,
          planRules,
          autoDraftWordCount,
          defaultModel,
          generateTemplate,
          chatTemplate,
          rewriteTemplate,
          autoDraftTemplate,
          planTemplate,
          expandPlanTemplate,
          agentTemplate,
          anthropicKey: anthropicKey || null,
          openaiKey: openaiKey || null
        })
      }),
      fetch(`${apiBasePath}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoDraftEnabled })
      })
    ]);
    setSaving(false);
    setSaved(true);
    await refetchSharedData();
    setTimeout(() => setSaved(false), 2e3);
  }
  if (loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h2", { className: "text-lg font-semibold", children: "AI Settings" }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "Configure your AI writing assistant." })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "rounded-lg border bg-card text-card-foreground shadow-sm", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h3", { className: "text-base font-medium", children: "Models" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "API keys and model configuration." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { htmlFor: "anthropicKey", className: "text-sm font-medium leading-none", children: "Anthropic API Key" }),
          hasAnthropicEnvKey && !anthropicKey ? /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-muted-foreground", children: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "ml-2 text-xs text-green-600 dark:text-green-400", children: "(from environment)" })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "input",
            {
              id: "anthropicKey",
              type: "password",
              value: anthropicKey,
              onChange: (e) => setAnthropicKey(e.target.value),
              placeholder: hasAnthropicEnvKey ? "Override env variable..." : "sk-ant-...",
              className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono",
              disabled: saving
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-xs text-muted-foreground", children: hasAnthropicEnvKey && !anthropicKey ? "Using ANTHROPIC_API_KEY from environment. Enter a value above to override." : "Required for Claude models (Sonnet, Opus)" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { htmlFor: "openaiKey", className: "text-sm font-medium leading-none", children: "OpenAI API Key" }),
          hasOpenaiEnvKey && !openaiKey ? /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-muted-foreground", children: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "ml-2 text-xs text-green-600 dark:text-green-400", children: "(from environment)" })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "input",
            {
              id: "openaiKey",
              type: "password",
              value: openaiKey,
              onChange: (e) => setOpenaiKey(e.target.value),
              placeholder: hasOpenaiEnvKey ? "Override env variable..." : "sk-...",
              className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono",
              disabled: saving
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-xs text-muted-foreground", children: hasOpenaiEnvKey && !openaiKey ? "Using OPENAI_API_KEY from environment. Enter a value above to override." : "Required for GPT models" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "text-sm font-medium leading-none shrink-0", children: "Default Model" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "relative max-w-sm flex-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "select",
            {
              value: defaultModel,
              onChange: (e) => setDefaultModel(e.target.value),
              className: "h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
              children: models.map((model) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("option", { value: model.id, children: [
                model.name,
                " \u2014 ",
                model.description
              ] }, model.id))
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.ChevronDown, { className: "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "rounded-lg border bg-card text-card-foreground shadow-sm", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h3", { className: "text-base font-medium", children: "Prompts" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "Rules and templates for AI-generated content." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "text-sm font-medium leading-none", children: "Essay Writing Rules" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "Style and format rules for generated essays. Applied when generating or rewriting content." }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "textarea",
          {
            value: rules,
            onChange: (e) => setRules(e.target.value),
            placeholder: `- Never use "utilize" \u2014 always say "use"
- Avoid passive voice
- Start with concrete scenes, not abstractions
- Short paragraphs (3-4 sentences max)
- Use em-dashes sparingly
- End with forward motion, not tidy conclusions`,
            className: "flex min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none",
            disabled: saving
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          CollapsibleTemplate,
          {
            label: "Generate",
            value: generateTemplate,
            defaultValue: defaultGenerateTemplate,
            onChange: setGenerateTemplate,
            onReset: () => setGenerateTemplate(null),
            placeholders: "{{RULES}}, {{STYLE_EXAMPLES}}",
            disabled: saving
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "text-sm font-medium leading-none", children: "Chat Behavior Rules" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "How the assistant should behave during brainstorming conversations. Controls personality and interaction style." }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "textarea",
          {
            value: chatRules,
            onChange: (e) => setChatRules(e.target.value),
            placeholder: `- Be direct and concise
- Push back on vague ideas
- Ask clarifying questions before drafting
- Challenge my assumptions`,
            className: "flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none",
            disabled: saving
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          CollapsibleTemplate,
          {
            label: "Chat",
            value: chatTemplate,
            defaultValue: defaultChatTemplate,
            onChange: setChatTemplate,
            onReset: () => setChatTemplate(null),
            placeholders: "{{RULES}}, {{CHAT_RULES}}, {{STYLE_EXAMPLES}}",
            disabled: saving
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "text-sm font-medium leading-none", children: "Rewrite Rules" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "Rules for cleaning up selected text with the rewrite tool." }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "textarea",
          {
            value: rewriteRules,
            onChange: (e) => setRewriteRules(e.target.value),
            placeholder: `- Keep the same meaning, improve clarity
- Maintain sentence length variety
- Remove filler words
- Don't add new ideas`,
            className: "flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none",
            disabled: saving
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          CollapsibleTemplate,
          {
            label: "Rewrite",
            value: rewriteTemplate,
            defaultValue: defaultRewriteTemplate,
            onChange: setRewriteTemplate,
            onReset: () => setRewriteTemplate(null),
            placeholders: "{{RULES}}, {{REWRITE_RULES}}, {{STYLE_EXAMPLES}}",
            disabled: saving
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "text-sm font-medium leading-none", children: "Auto-Draft Rules" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "Rules for generating essays from news articles via RSS feeds. Controls how topics are transformed into original essays." }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "textarea",
          {
            value: autoDraftRules,
            onChange: (e) => setAutoDraftRules(e.target.value),
            placeholder: `- Write original perspectives, don't summarize
- Take a contrarian angle when appropriate
- Include personal insights and experiences
- Focus on implications, not just facts`,
            className: "flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none",
            disabled: saving
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "flex items-center gap-4 pt-2", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "text-sm whitespace-nowrap", children: "Target word count:" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "input",
            {
              type: "number",
              min: 200,
              max: 3e3,
              value: autoDraftWordCount,
              onChange: (e) => setAutoDraftWordCount(parseInt(e.target.value) || 800),
              className: "flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              disabled: saving
            }
          )
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          CollapsibleTemplate,
          {
            label: "Auto-Draft",
            value: autoDraftTemplate,
            defaultValue: defaultAutoDraftTemplate,
            onChange: setAutoDraftTemplate,
            onReset: () => setAutoDraftTemplate(null),
            placeholders: "{{AUTO_DRAFT_RULES}}, {{AUTO_DRAFT_WORD_COUNT}}, {{RULES}}, {{STYLE_EXAMPLES}}, {{TOPIC_NAME}}, {{ARTICLE_TITLE}}, {{ARTICLE_SUMMARY}}, {{ARTICLE_URL}}",
            disabled: saving
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "text-sm font-medium leading-none", children: "Plan Format Rules" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "Rules for essay plan structure and format. Controls how outlines are organized in Plan mode." }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "flex items-center justify-end", children: planRules && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
          "button",
          {
            type: "button",
            onClick: () => setPlanRules(""),
            className: "inline-flex items-center justify-center rounded-md text-sm font-medium h-7 px-2 hover:bg-accent hover:text-accent-foreground",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.RotateCcw, { className: "h-3 w-3 mr-1" }),
              "Reset to default"
            ]
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "textarea",
          {
            value: planRules || defaultPlanRules,
            onChange: (e) => setPlanRules(e.target.value),
            className: "flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none",
            disabled: saving
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "text-sm font-medium leading-none", children: "Plan Mode Template" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "Prompt template for Plan mode in chat. Controls the full system prompt." }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          CollapsibleTemplate,
          {
            label: "Plan",
            value: planTemplate,
            defaultValue: defaultPlanTemplate,
            onChange: setPlanTemplate,
            onReset: () => setPlanTemplate(null),
            placeholders: "{{PLAN_RULES}}, {{STYLE_EXAMPLES}}",
            disabled: saving
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "text-sm font-medium leading-none", children: "Expand Plan Template" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "Prompt template for expanding a plan outline into a full essay draft." }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          CollapsibleTemplate,
          {
            label: "Expand Plan",
            value: expandPlanTemplate,
            defaultValue: defaultExpandPlanTemplate,
            onChange: setExpandPlanTemplate,
            onReset: () => setExpandPlanTemplate(null),
            placeholders: "{{RULES}}, {{STYLE_EXAMPLES}}, {{PLAN}}",
            disabled: saving
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "text-sm font-medium leading-none", children: "Agent Mode Template" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "Instructions for Agent mode in chat. Controls how the AI makes direct edits to essays." }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          CollapsibleTemplate,
          {
            label: "Agent",
            value: agentTemplate,
            defaultValue: defaultAgentTemplate,
            onChange: setAgentTemplate,
            onReset: () => setAgentTemplate(null),
            placeholders: "(no placeholders - appended to chat prompt)",
            disabled: saving
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "rounded-lg border bg-card text-card-foreground shadow-sm", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h3", { className: "text-base font-medium", children: "Features" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "Enable or disable AI features." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-0.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "text-sm font-medium leading-none", children: "Auto-Draft" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-muted-foreground", children: "Enable RSS topic subscriptions and automatic draft generation." })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "button",
          {
            type: "button",
            role: "switch",
            "aria-checked": autoDraftEnabled,
            onClick: () => setAutoDraftEnabled(!autoDraftEnabled),
            className: `relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${autoDraftEnabled ? "bg-primary" : "bg-input"}`,
            children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "span",
              {
                className: `pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${autoDraftEnabled ? "translate-x-5" : "translate-x-0"}`
              }
            )
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "button",
        {
          onClick: handleSave,
          disabled: saving,
          className: "inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50",
          children: [
            saving && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            saving ? "Saving..." : "Save"
          ]
        }
      ),
      saved && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-sm text-green-600 dark:text-green-400", children: "Saved!" })
    ] })
  ] });
}
function TagsSettingsContent() {
  const { apiBasePath } = useDashboardContext();
  const [tags, setTags] = (0, import_react18.useState)([]);
  const [loading, setLoading] = (0, import_react18.useState)(true);
  const [dialogOpen, setDialogOpen] = (0, import_react18.useState)(false);
  const [editingTag, setEditingTag] = (0, import_react18.useState)(null);
  const [tagName, setTagName] = (0, import_react18.useState)("");
  const [saving, setSaving] = (0, import_react18.useState)(false);
  const [error, setError] = (0, import_react18.useState)("");
  const [menuOpen, setMenuOpen] = (0, import_react18.useState)(null);
  (0, import_react18.useEffect)(() => {
    fetchTags();
  }, [apiBasePath]);
  async function fetchTags() {
    const res = await fetch(`${apiBasePath}/tags`);
    if (res.ok) {
      const json = await res.json();
      setTags(json.data || []);
    }
    setLoading(false);
  }
  function openCreateDialog() {
    setEditingTag(null);
    setTagName("");
    setError("");
    setDialogOpen(true);
  }
  function openEditDialog(tag) {
    setEditingTag(tag);
    setTagName(tag.name);
    setError("");
    setDialogOpen(true);
    setMenuOpen(null);
  }
  async function handleDelete(tag) {
    if (!confirm(`Delete tag "${tag.name}"? This will remove it from all posts.`)) return;
    const res = await fetch(`${apiBasePath}/tags/${tag.id}`, { method: "DELETE" });
    if (res.ok) {
      fetchTags();
    }
    setMenuOpen(null);
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!tagName.trim()) {
      setError("Tag name is required");
      return;
    }
    setSaving(true);
    setError("");
    const url = editingTag ? `${apiBasePath}/tags/${editingTag.id}` : `${apiBasePath}/tags`;
    const method = editingTag ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: tagName.trim() })
    });
    if (res.ok) {
      setDialogOpen(false);
      fetchTags();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save tag");
    }
    setSaving(false);
  }
  if (loading) return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "animate-pulse h-32 bg-muted rounded" });
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between mb-6 md:mb-8", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h2", { className: "text-lg font-semibold", children: "Tags" }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
        "button",
        {
          onClick: openCreateDialog,
          className: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90",
          children: "Add Tag"
        }
      )
    ] }),
    tags.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "py-8 text-center text-muted-foreground", children: "No tags yet. Create one to get started." }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "hidden md:block rounded-md border", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("table", { className: "w-full caption-bottom text-sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("thead", { className: "[&_tr]:border-b", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("tr", { className: "border-b", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Name" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Posts" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Created" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-right align-middle font-medium text-muted-foreground", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("tbody", { className: "[&_tr:last-child]:border-0", children: tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("tr", { className: "border-b", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "block truncate max-w-[250px]", children: tag.name }) }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle text-muted-foreground", children: tag._count?.posts ?? 0 }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle text-muted-foreground", children: tag.createdAt ? new Date(tag.createdAt).toLocaleDateString() : "\u2014" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle text-right", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "relative inline-block", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => setMenuOpen(menuOpen === tag.id ? null : tag.id),
                className: "inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent text-muted-foreground",
                children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.MoreVertical, { className: "h-4 w-4" })
              }
            ),
            menuOpen === tag.id && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 min-w-[8rem] py-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
                "button",
                {
                  onClick: () => openEditDialog(tag),
                  className: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left hover:bg-accent",
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "-mx-1 my-1 h-px bg-muted" }),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
                "button",
                {
                  onClick: () => handleDelete(tag),
                  className: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left text-destructive hover:bg-accent",
                  children: "Delete"
                }
              )
            ] })
          ] }) })
        ] }, tag.id)) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "md:hidden divide-y rounded-md border bg-background", children: tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between gap-4 px-4 py-5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "min-w-0 flex-1 space-y-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "font-medium truncate block", children: tag.name }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { className: "text-sm text-muted-foreground truncate", children: [
            tag._count?.posts ?? 0,
            " posts \xB7 Created ",
            tag.createdAt ? new Date(tag.createdAt).toLocaleDateString() : "\u2014"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "relative", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "button",
            {
              onClick: () => setMenuOpen(menuOpen === tag.id ? null : tag.id),
              className: "inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent text-muted-foreground",
              children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.MoreVertical, { className: "h-4 w-4" })
            }
          ),
          menuOpen === tag.id && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 min-w-[8rem] py-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => openEditDialog(tag),
                className: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left hover:bg-accent",
                children: "Edit"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "-mx-1 my-1 h-px bg-muted" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => handleDelete(tag),
                className: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left text-destructive hover:bg-accent",
                children: "Delete"
              }
            )
          ] })
        ] })
      ] }, tag.id)) })
    ] }),
    dialogOpen && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
        "div",
        {
          className: "fixed inset-0 bg-black/80",
          onClick: () => setDialogOpen(false)
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "relative z-50 w-full max-w-sm bg-background border border-border rounded-lg shadow-lg", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "flex flex-col space-y-1.5 p-6", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h3", { className: "text-lg font-semibold leading-none tracking-tight", children: editingTag ? "Edit Tag" : "Create Tag" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("form", { onSubmit: handleSubmit, children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "px-6 pb-4", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { htmlFor: "tagName", className: "text-sm font-medium leading-none", children: "Name" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "input",
              {
                id: "tagName",
                type: "text",
                value: tagName,
                onChange: (e) => setTagName(e.target.value),
                placeholder: "e.g. technology",
                autoFocus: true,
                className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              }
            ),
            error && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-sm text-destructive", children: error })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-end gap-2 p-6 pt-0", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                type: "button",
                onClick: () => setDialogOpen(false),
                disabled: saving,
                className: "inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                type: "submit",
                disabled: saving,
                className: "inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
                children: saving ? "Saving..." : editingTag ? "Save" : "Create"
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
}
function TopicsSettingsContent() {
  const { apiBasePath } = useDashboardContext();
  const [topics, setTopics] = (0, import_react18.useState)([]);
  const [loading, setLoading] = (0, import_react18.useState)(true);
  const [showForm, setShowForm] = (0, import_react18.useState)(false);
  const [editingTopic, setEditingTopic] = (0, import_react18.useState)(null);
  const [generating, setGenerating] = (0, import_react18.useState)(null);
  const [formName, setFormName] = (0, import_react18.useState)("");
  const [formKeywords, setFormKeywords] = (0, import_react18.useState)("");
  const [formFeeds, setFormFeeds] = (0, import_react18.useState)("");
  const [formFrequency, setFormFrequency] = (0, import_react18.useState)("daily");
  const [formMaxPerPeriod, setFormMaxPerPeriod] = (0, import_react18.useState)(3);
  const [formEssayFocus, setFormEssayFocus] = (0, import_react18.useState)("");
  const [formIsActive, setFormIsActive] = (0, import_react18.useState)(true);
  (0, import_react18.useEffect)(() => {
    fetchTopics();
  }, [apiBasePath]);
  async function fetchTopics() {
    const res = await fetch(`${apiBasePath}/topics`);
    if (res.ok) {
      const json = await res.json();
      setTopics(json.data || []);
    }
    setLoading(false);
  }
  function resetForm() {
    setFormName("");
    setFormKeywords("");
    setFormFeeds("");
    setFormFrequency("daily");
    setFormMaxPerPeriod(3);
    setFormEssayFocus("");
    setFormIsActive(true);
  }
  function openEditForm(topic) {
    setEditingTopic(topic);
    setFormName(topic.name);
    setFormKeywords(JSON.parse(topic.keywords).join(", "));
    setFormFeeds(JSON.parse(topic.rssFeeds).join("\n"));
    setFormFrequency(topic.frequency);
    setFormMaxPerPeriod(topic.maxPerPeriod);
    setFormEssayFocus(topic.essayFocus || "");
    setFormIsActive(topic.isActive);
    setShowForm(true);
  }
  function openNewForm() {
    setEditingTopic(null);
    resetForm();
    setShowForm(true);
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const data = {
      name: formName,
      keywords: formKeywords.split(",").map((k) => k.trim()).filter(Boolean),
      rssFeeds: formFeeds.split("\n").map((f) => f.trim()).filter(Boolean),
      frequency: formFrequency,
      maxPerPeriod: formMaxPerPeriod,
      essayFocus: formEssayFocus || null,
      isActive: formIsActive
    };
    const url = editingTopic ? `${apiBasePath}/topics/${editingTopic.id}` : `${apiBasePath}/topics`;
    const method = editingTopic ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      setShowForm(false);
      resetForm();
      setEditingTopic(null);
      fetchTopics();
    }
  }
  async function handleDelete(id) {
    if (!confirm("Delete this topic? This will also delete associated news items.")) return;
    const res = await fetch(`${apiBasePath}/topics/${id}`, { method: "DELETE" });
    if (res.ok) setTopics(topics.filter((t) => t.id !== id));
  }
  async function handleGenerate(topicId) {
    setGenerating(topicId);
    try {
      const res = await fetch(`${apiBasePath}/topics/${topicId}/generate`, { method: "POST" });
      if (res.ok) {
        fetchTopics();
      }
    } finally {
      setGenerating(null);
    }
  }
  if (loading) return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "animate-pulse h-32 bg-muted rounded" });
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h2", { className: "text-lg font-semibold", children: "Topics" }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("button", { onClick: openNewForm, className: "flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.Plus, { className: "h-4 w-4" }),
        " New Topic"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-muted-foreground text-sm -mt-2", children: "RSS topic subscriptions for auto-generating draft posts." }),
    showForm && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "border border-border rounded-lg p-4 space-y-4 bg-muted/30", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h3", { className: "font-medium", children: editingTopic ? "Edit Topic" : "New Topic" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { onClick: () => {
          setShowForm(false);
          resetForm();
          setEditingTopic(null);
        }, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Name" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "input",
            {
              type: "text",
              value: formName,
              onChange: (e) => setFormName(e.target.value),
              required: true,
              className: "w-full px-3 py-2 border border-input rounded-md bg-transparent",
              placeholder: "e.g. School Lunch Policy"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Keywords (comma-separated)" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "input",
            {
              type: "text",
              value: formKeywords,
              onChange: (e) => setFormKeywords(e.target.value),
              className: "w-full px-3 py-2 border border-input rounded-md bg-transparent",
              placeholder: "school lunch, USDA, nutrition"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "block text-sm font-medium mb-1", children: "RSS Feed URLs (one per line)" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "textarea",
            {
              value: formFeeds,
              onChange: (e) => setFormFeeds(e.target.value),
              rows: 3,
              className: "w-full px-3 py-2 border border-input rounded-md bg-transparent resize-none font-mono text-sm",
              placeholder: "https://example.com/feed.xml"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Frequency" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
              "select",
              {
                value: formFrequency,
                onChange: (e) => setFormFrequency(e.target.value),
                className: "w-full px-3 py-2 border border-input rounded-md bg-transparent",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "daily", children: "Daily" }),
                  /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "weekly", children: "Weekly" }),
                  /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "hourly", children: "Hourly" }),
                  /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("option", { value: "manual", children: "Manual" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Max per period" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "input",
              {
                type: "number",
                min: 1,
                max: 20,
                value: formMaxPerPeriod,
                onChange: (e) => setFormMaxPerPeriod(parseInt(e.target.value) || 3),
                className: "w-full px-3 py-2 border border-input rounded-md bg-transparent"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Essay Focus (optional)" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "textarea",
            {
              value: formEssayFocus,
              onChange: (e) => setFormEssayFocus(e.target.value),
              rows: 2,
              className: "w-full px-3 py-2 border border-input rounded-md bg-transparent resize-none",
              placeholder: "Specific angle or perspective for essays on this topic"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "input",
            {
              type: "checkbox",
              id: "isActive",
              checked: formIsActive,
              onChange: (e) => setFormIsActive(e.target.checked)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("label", { htmlFor: "isActive", className: "text-sm", children: "Active" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { type: "submit", className: "px-4 py-2 bg-primary text-primary-foreground rounded-md", children: editingTopic ? "Update" : "Create" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { type: "button", onClick: () => {
            setShowForm(false);
            resetForm();
            setEditingTopic(null);
          }, className: "px-4 py-2 border border-input rounded-md", children: "Cancel" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "border border-border rounded-lg divide-y divide-border", children: [
      topics.map((topic) => {
        const keywords = JSON.parse(topic.keywords);
        const feeds = JSON.parse(topic.rssFeeds);
        return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "p-4", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "font-medium", children: topic.name }),
              !topic.isActive && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-xs bg-muted px-1.5 py-0.5 rounded", children: "Paused" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { className: "text-sm text-muted-foreground mt-1", children: [
              keywords.slice(0, 3).join(", "),
              keywords.length > 3 && ` +${keywords.length - 3}`
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { className: "text-xs text-muted-foreground mt-1", children: [
              feeds.length,
              " feed",
              feeds.length !== 1 ? "s" : "",
              " \xB7 ",
              topic.frequency,
              " \xB7 ",
              topic._count?.posts ?? 0,
              " posts",
              topic.lastRunAt && ` \xB7 Last run: ${new Date(topic.lastRunAt).toLocaleDateString()}`
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => handleGenerate(topic.id),
                disabled: generating !== null,
                className: "p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-50",
                title: "Generate now",
                children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.Play, { className: `h-4 w-4 ${generating === topic.id ? "animate-pulse" : ""}` })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { onClick: () => openEditForm(topic), className: "p-1.5 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("button", { onClick: () => handleDelete(topic.id), className: "p-1.5 text-red-500 hover:text-red-600", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.Trash2, { className: "h-4 w-4" }) })
          ] })
        ] }) }, topic.id);
      }),
      topics.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "p-4 text-muted-foreground text-center", children: "No topics configured" })
    ] })
  ] });
}
var POSTS_PER_PAGE = 25;
function PostsSettingsContent() {
  const { apiBasePath, navigate, sharedData } = useDashboardContext();
  const postUrlPattern = sharedData?.settings?.postUrlPattern ?? "/e/{slug}";
  const getPostUrl = (slug) => postUrlPattern.replace("{slug}", slug);
  const [posts, setPosts] = (0, import_react18.useState)([]);
  const [totalCount, setTotalCount] = (0, import_react18.useState)(0);
  const [loading, setLoading] = (0, import_react18.useState)(true);
  const [currentPage, setCurrentPage] = (0, import_react18.useState)(1);
  const [totalPages, setTotalPages] = (0, import_react18.useState)(1);
  const [menuOpen, setMenuOpen] = (0, import_react18.useState)(null);
  (0, import_react18.useEffect)(() => {
    setLoading(true);
    fetch(`${apiBasePath}/posts?all=1&page=${currentPage}&limit=${POSTS_PER_PAGE}&includeRevisionCount=1`).then((res) => res.ok ? res.json() : Promise.reject()).then((res) => {
      setPosts(res.data || []);
      setTotalCount(res.total ?? res.data?.length ?? 0);
      setTotalPages(Math.ceil((res.total ?? res.data?.length ?? 0) / POSTS_PER_PAGE));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [apiBasePath, currentPage]);
  async function handleDelete(post) {
    if (!confirm(`Delete "${post.title || "Untitled"}"? This will also delete all revisions.`)) return;
    const res = await fetch(`${apiBasePath}/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts(posts.filter((p) => p.id !== post.id));
      setTotalCount((c) => c - 1);
    }
    setMenuOpen(null);
  }
  function getStatusBadgeClasses(status) {
    if (status === "published") return "bg-primary text-primary-foreground";
    if (status === "deleted") return "bg-destructive text-destructive-foreground";
    return "bg-secondary text-secondary-foreground";
  }
  const PaginationControls = ({ position }) => {
    if (totalPages <= 1) return null;
    const getPageNumbers = () => {
      const pages = [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        if (currentPage > 3) pages.push("ellipsis-start");
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) {
          if (!pages.includes(i)) pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("ellipsis-end");
        if (!pages.includes(totalPages)) pages.push(totalPages);
      }
      return pages;
    };
    const spacingClass = position === "bottom" ? "mt-4" : "";
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("nav", { role: "navigation", "aria-label": "pagination", className: `mx-auto flex w-full justify-end ${spacingClass}`, children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("ul", { className: "flex flex-row items-center gap-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "button",
        {
          onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
          disabled: currentPage <= 1,
          "aria-label": "Go to previous page",
          className: "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium h-9 px-2.5 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.ChevronLeft, { className: "h-4 w-4" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "hidden sm:block", children: "Previous" })
          ]
        }
      ) }),
      getPageNumbers().map(
        (page) => typeof page === "string" ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { "aria-hidden": true, className: "flex h-9 w-9 items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.MoreHorizontal, { className: "h-4 w-4" }) }) }, page) : /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "button",
          {
            onClick: () => setCurrentPage(page),
            "aria-current": page === currentPage ? "page" : void 0,
            className: `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 w-9 ${page === currentPage ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`,
            children: page
          }
        ) }, page)
      ),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "button",
        {
          onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
          disabled: currentPage >= totalPages,
          "aria-label": "Go to next page",
          className: "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium h-9 px-2.5 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "hidden sm:block", children: "Next" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.ChevronRight, { className: "h-4 w-4" })
          ]
        }
      ) })
    ] }) });
  };
  if (loading && posts.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "animate-pulse h-32 bg-muted rounded" });
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-end justify-between gap-4 mb-6 md:mb-8", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h1", { className: "text-lg font-bold", children: "Posts" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { className: "text-sm text-muted-foreground mt-1", children: [
          totalCount,
          " total post",
          totalCount !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(PaginationControls, { position: "top" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "button",
          {
            onClick: () => navigate("/editor"),
            className: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90",
            children: "New Post"
          }
        )
      ] })
    ] }),
    posts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "py-8 text-center text-muted-foreground", children: "No posts yet." }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "hidden md:block rounded-md border", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("table", { className: "w-full caption-bottom text-sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("thead", { className: "[&_tr]:border-b", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("tr", { className: "border-b", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Title" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Slug" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Status" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Revisions" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Updated" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-right align-middle font-medium text-muted-foreground", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("tbody", { className: "[&_tr:last-child]:border-0", children: posts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("tr", { className: "border-b", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "block truncate max-w-[200px]", children: post.title || "Untitled" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "block truncate max-w-[250px] text-muted-foreground font-mono", children: post.slug }) }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: `inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClasses(post.status)}`, children: post.status }) }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle text-muted-foreground", children: post._count?.revisions ?? 0 }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle text-muted-foreground", children: new Date(post.updatedAt).toLocaleDateString() }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle text-right", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "relative inline-block", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => setMenuOpen(menuOpen === post.id ? null : post.id),
                className: "inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent text-muted-foreground",
                children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.MoreVertical, { className: "h-4 w-4" })
              }
            ),
            menuOpen === post.id && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 min-w-[8rem] py-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
                "button",
                {
                  onClick: () => {
                    navigate(`/editor/${post.slug}`);
                    setMenuOpen(null);
                  },
                  className: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left hover:bg-accent",
                  children: "Edit"
                }
              ),
              post.status === "published" && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
                "a",
                {
                  href: getPostUrl(post.slug),
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left hover:bg-accent",
                  onClick: () => setMenuOpen(null),
                  children: "View"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "-mx-1 my-1 h-px bg-muted" }),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
                "button",
                {
                  onClick: () => handleDelete(post),
                  className: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left text-destructive hover:bg-accent",
                  children: "Delete"
                }
              )
            ] })
          ] }) })
        ] }, post.id)) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "md:hidden divide-y rounded-md border bg-background", children: posts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between gap-4 px-4 py-5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "min-w-0 flex-1 space-y-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "font-medium truncate", children: post.title || "Untitled" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: `inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold shrink-0 ${getStatusBadgeClasses(post.status)}`, children: post.status })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { className: "text-sm text-muted-foreground truncate", children: [
            post.slug,
            " \xB7 ",
            post._count?.revisions ?? 0,
            " rev \xB7 ",
            new Date(post.updatedAt).toLocaleDateString()
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "relative", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "button",
            {
              onClick: () => setMenuOpen(menuOpen === post.id ? null : post.id),
              className: "inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent text-muted-foreground",
              children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.MoreVertical, { className: "h-4 w-4" })
            }
          ),
          menuOpen === post.id && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 min-w-[8rem] py-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => {
                  navigate(`/editor/${post.slug}`);
                  setMenuOpen(null);
                },
                className: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left hover:bg-accent",
                children: "Edit"
              }
            ),
            post.status === "published" && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "a",
              {
                href: getPostUrl(post.slug),
                target: "_blank",
                rel: "noopener noreferrer",
                className: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left hover:bg-accent",
                onClick: () => setMenuOpen(null),
                children: "View"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "-mx-1 my-1 h-px bg-muted" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => handleDelete(post),
                className: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none w-full text-left text-destructive hover:bg-accent",
                children: "Delete"
              }
            )
          ] })
        ] })
      ] }, post.id)) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(PaginationControls, { position: "bottom" })
  ] });
}
var REVISIONS_PER_PAGE = 25;
function RevisionsSettingsContent() {
  const { apiBasePath, navigate } = useDashboardContext();
  const [revisions, setRevisions] = (0, import_react18.useState)([]);
  const [totalCount, setTotalCount] = (0, import_react18.useState)(0);
  const [loading, setLoading] = (0, import_react18.useState)(true);
  const [currentPage, setCurrentPage] = (0, import_react18.useState)(1);
  const [totalPages, setTotalPages] = (0, import_react18.useState)(1);
  (0, import_react18.useEffect)(() => {
    setLoading(true);
    fetch(`${apiBasePath}/revisions?page=${currentPage}&limit=${REVISIONS_PER_PAGE}`).then((res) => res.ok ? res.json() : Promise.reject()).then((res) => {
      setRevisions(res.data || []);
      setTotalCount(res.total ?? res.data?.length ?? 0);
      setTotalPages(res.totalPages || Math.ceil((res.total ?? res.data?.length ?? 0) / REVISIONS_PER_PAGE));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [apiBasePath, currentPage]);
  function getStatusBadgeClasses(isCurrent) {
    if (isCurrent) return "bg-primary text-primary-foreground";
    return "bg-secondary text-secondary-foreground";
  }
  const PaginationControls = ({ position }) => {
    if (totalPages <= 1) return null;
    const getPageNumbers = () => {
      const pages = [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        if (currentPage > 3) pages.push("ellipsis-start");
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) {
          if (!pages.includes(i)) pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("ellipsis-end");
        if (!pages.includes(totalPages)) pages.push(totalPages);
      }
      return pages;
    };
    const spacingClass = position === "bottom" ? "mt-4" : "";
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("nav", { role: "navigation", "aria-label": "pagination", className: `mx-auto flex w-full justify-end ${spacingClass}`, children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("ul", { className: "flex flex-row items-center gap-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "button",
        {
          onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
          disabled: currentPage <= 1,
          "aria-label": "Go to previous page",
          className: "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium h-9 px-2.5 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.ChevronLeft, { className: "h-4 w-4" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "hidden sm:block", children: "Previous" })
          ]
        }
      ) }),
      getPageNumbers().map(
        (page) => typeof page === "string" ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { "aria-hidden": true, className: "flex h-9 w-9 items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.MoreHorizontal, { className: "h-4 w-4" }) }) }, page) : /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "button",
          {
            onClick: () => setCurrentPage(page),
            "aria-current": page === currentPage ? "page" : void 0,
            className: `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 w-9 ${page === currentPage ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`,
            children: page
          }
        ) }, page)
      ),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "button",
        {
          onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
          disabled: currentPage >= totalPages,
          "aria-label": "Go to next page",
          className: "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium h-9 px-2.5 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "hidden sm:block", children: "Next" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.ChevronRight, { className: "h-4 w-4" })
          ]
        }
      ) })
    ] }) });
  };
  if (loading && revisions.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "animate-pulse h-32 bg-muted rounded" });
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-end justify-between gap-4 mb-6 md:mb-8", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h1", { className: "text-lg font-bold", children: "Revisions" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { className: "text-sm text-muted-foreground mt-1", children: [
          totalCount,
          " total revision",
          totalCount !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(PaginationControls, { position: "top" })
    ] }),
    revisions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "py-8 text-center text-muted-foreground", children: "No revisions yet." }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "hidden md:block rounded-md border", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("table", { className: "w-full caption-bottom text-sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("thead", { className: "[&_tr]:border-b", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("tr", { className: "border-b", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Post" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Content Preview" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Created" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Status" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-right align-middle font-medium text-muted-foreground", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("tbody", { className: "[&_tr:last-child]:border-0", children: revisions.map((revision) => {
          const isCurrent = revision.post.markdown === revision.markdown;
          return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("tr", { className: "border-b", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => navigate(`/editor/${revision.post.slug}`),
                className: "block truncate max-w-[200px] hover:underline text-left",
                children: revision.post.title || "Untitled"
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("span", { className: "block truncate max-w-[300px] text-muted-foreground", children: [
              revision.markdown.slice(0, 80),
              revision.markdown.length > 80 ? "..." : ""
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle text-muted-foreground", children: new Date(revision.createdAt).toLocaleString() }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: `inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClasses(isCurrent)}`, children: isCurrent ? "current" : "past" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle text-right", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => navigate(`/settings/revisions/${revision.id}`),
                className: "inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 hover:bg-accent text-muted-foreground hover:text-foreground",
                children: "View"
              }
            ) })
          ] }, revision.id);
        }) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "md:hidden divide-y rounded-md border bg-background", children: revisions.map((revision) => {
        const isCurrent = revision.post.markdown === revision.markdown;
        return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between gap-4 px-4 py-5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "min-w-0 flex-1 space-y-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "font-medium truncate", children: revision.post.title || "Untitled" }),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: `inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold shrink-0 ${getStatusBadgeClasses(isCurrent)}`, children: isCurrent ? "current" : "past" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { className: "text-sm text-muted-foreground truncate", children: [
              revision.markdown.slice(0, 40),
              revision.markdown.length > 40 ? "..." : "",
              " \xB7 ",
              new Date(revision.createdAt).toLocaleDateString()
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "button",
            {
              onClick: () => navigate(`/settings/revisions/${revision.id}`),
              className: "inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 hover:bg-accent text-muted-foreground hover:text-foreground shrink-0",
              children: "View"
            }
          )
        ] }, revision.id);
      }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(PaginationControls, { position: "bottom" })
  ] });
}
function RevisionDetailContent({ revisionId }) {
  const { apiBasePath, navigate } = useDashboardContext();
  const [revision, setRevision] = (0, import_react18.useState)(null);
  const [loading, setLoading] = (0, import_react18.useState)(true);
  const [restoring, setRestoring] = (0, import_react18.useState)(false);
  (0, import_react18.useEffect)(() => {
    fetch(`${apiBasePath}/revisions/${revisionId}`).then((res) => res.ok ? res.json() : Promise.reject()).then((res) => {
      setRevision(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [apiBasePath, revisionId]);
  async function handleRestore() {
    if (!revision) return;
    if (!confirm("Restore this revision? This will replace the current post content.")) return;
    setRestoring(true);
    const res = await fetch(`${apiBasePath}/revisions/${revisionId}/restore`, { method: "POST" });
    if (res.ok) {
      navigate(`/editor/${revision.post.slug}`);
    }
    setRestoring(false);
  }
  if (loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "h-6 w-32 bg-muted rounded animate-pulse" }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "h-64 bg-muted rounded animate-pulse" })
    ] });
  }
  if (!revision) {
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "button",
        {
          onClick: () => navigate("/settings/revisions"),
          className: "text-sm text-muted-foreground hover:text-foreground flex items-center gap-1",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.ChevronLeft, { className: "h-4 w-4" }),
            " Back to Revisions"
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-muted-foreground", children: "Revision not found." })
    ] });
  }
  const isCurrent = revision.post.markdown === revision.markdown;
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
          "button",
          {
            onClick: () => navigate("/settings/revisions"),
            className: "text-sm text-muted-foreground hover:text-foreground flex items-center gap-1",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.ChevronLeft, { className: "h-4 w-4" }),
              " Back to Revisions"
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h2", { className: "text-lg font-semibold", children: "Revision Detail" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "flex items-center gap-2", children: isCurrent ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground", children: "current" }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "button",
        {
          onClick: handleRestore,
          disabled: restoring,
          className: "inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.RotateCcw, { className: "h-4 w-4 mr-2" }),
            restoring ? "Restoring..." : "Restore This Revision"
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "rounded-lg border bg-card p-4 space-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-sm text-muted-foreground", children: "Post" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "button",
          {
            onClick: () => navigate(`/editor/${revision.post.slug}`),
            className: "text-sm hover:underline",
            children: revision.post.title || "Untitled"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-sm text-muted-foreground", children: "Title at revision" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-sm", children: revision.title || "\u2014" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-sm text-muted-foreground", children: "Created" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-sm", children: new Date(revision.createdAt).toLocaleString() })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "space-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h3", { className: "text-sm font-medium", children: "Content" }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "rounded-lg border bg-muted/30 p-4 max-h-96 overflow-auto", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("pre", { className: "text-sm whitespace-pre-wrap font-mono", children: revision.markdown }) })
    ] })
  ] });
}
var COMMENTS_PER_PAGE = 25;
function CommentsSettingsContent() {
  const { apiBasePath, navigate, basePath } = useDashboardContext();
  const [comments, setComments] = (0, import_react18.useState)([]);
  const [totalCount, setTotalCount] = (0, import_react18.useState)(0);
  const [loading, setLoading] = (0, import_react18.useState)(true);
  const [currentPage, setCurrentPage] = (0, import_react18.useState)(1);
  const [totalPages, setTotalPages] = (0, import_react18.useState)(1);
  (0, import_react18.useEffect)(() => {
    setLoading(true);
    fetch(`${apiBasePath}/comments?page=${currentPage}&limit=${COMMENTS_PER_PAGE}`).then((res) => res.ok ? res.json() : Promise.reject()).then((res) => {
      setComments(res.data || []);
      setTotalCount(res.total ?? res.data?.length ?? 0);
      setTotalPages(res.totalPages || Math.ceil((res.total ?? res.data?.length ?? 0) / COMMENTS_PER_PAGE));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [apiBasePath, currentPage]);
  function getStatusBadge(comment) {
    const isDeleted = comment.deletedAt !== null;
    const isResolved = comment.resolved;
    if (isDeleted) {
      return { label: "deleted", classes: "bg-destructive text-destructive-foreground" };
    }
    if (isResolved) {
      return { label: "resolved", classes: "bg-secondary text-secondary-foreground" };
    }
    return { label: "active", classes: "bg-primary text-primary-foreground" };
  }
  const PaginationControls = ({ position }) => {
    if (totalPages <= 1) return null;
    const getPageNumbers = () => {
      const pages = [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        if (currentPage > 3) pages.push("ellipsis-start");
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) {
          if (!pages.includes(i)) pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("ellipsis-end");
        if (!pages.includes(totalPages)) pages.push(totalPages);
      }
      return pages;
    };
    const spacingClass = position === "bottom" ? "mt-4" : "";
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("nav", { role: "navigation", "aria-label": "pagination", className: `mx-auto flex w-full justify-end ${spacingClass}`, children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("ul", { className: "flex flex-row items-center gap-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "button",
        {
          onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
          disabled: currentPage <= 1,
          "aria-label": "Go to previous page",
          className: "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium h-9 px-2.5 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.ChevronLeft, { className: "h-4 w-4" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "hidden sm:block", children: "Previous" })
          ]
        }
      ) }),
      getPageNumbers().map(
        (page) => typeof page === "string" ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { "aria-hidden": true, className: "flex h-9 w-9 items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.MoreHorizontal, { className: "h-4 w-4" }) }) }, page) : /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "button",
          {
            onClick: () => setCurrentPage(page),
            "aria-current": page === currentPage ? "page" : void 0,
            className: `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 w-9 ${page === currentPage ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`,
            children: page
          }
        ) }, page)
      ),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
        "button",
        {
          onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
          disabled: currentPage >= totalPages,
          "aria-label": "Go to next page",
          className: "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium h-9 px-2.5 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "hidden sm:block", children: "Next" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react11.ChevronRight, { className: "h-4 w-4" })
          ]
        }
      ) })
    ] }) });
  };
  if (loading && comments.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "animate-pulse h-32 bg-muted rounded" });
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-end justify-between gap-4 mb-6 md:mb-8", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h1", { className: "text-lg font-bold", children: "Comments" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { className: "text-sm text-muted-foreground mt-1", children: [
          totalCount,
          " total comment",
          totalCount !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(PaginationControls, { position: "top" })
    ] }),
    comments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "py-8 text-center text-muted-foreground", children: "No comments yet." }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "hidden md:block rounded-md border", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("table", { className: "w-full caption-bottom text-sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("thead", { className: "[&_tr]:border-b", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("tr", { className: "border-b", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground max-w-[200px]", children: "Post" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Author" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground max-w-[300px]", children: "Comment" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Created" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground", children: "Status" }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("th", { className: "h-12 px-4 text-right align-middle font-medium text-muted-foreground", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("tbody", { className: "[&_tr:last-child]:border-0", children: comments.map((comment) => {
          const status = getStatusBadge(comment);
          const isReply = comment.parentId !== null;
          const commentIdToOpen = comment.parentId || comment.id;
          return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("tr", { className: "border-b", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => navigate(`/editor/${comment.post.slug}`),
                className: "block truncate max-w-[200px] hover:underline text-left",
                children: comment.post.title || "Untitled"
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle text-muted-foreground", children: comment.user.name || comment.user.email }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("span", { className: "block truncate max-w-[300px] text-muted-foreground", children: [
              isReply && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-xs mr-1", children: "\u21B3" }),
              comment.content.slice(0, 60),
              comment.content.length > 60 ? "..." : ""
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle text-muted-foreground", children: new Date(comment.createdAt).toLocaleString() }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: `inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${status.classes}`, children: status.label }) }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("td", { className: "p-4 align-middle text-right", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                onClick: () => navigate(`/editor/${comment.post.slug}?comment=${commentIdToOpen}`),
                className: "inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 hover:bg-accent text-muted-foreground hover:text-foreground",
                children: "View"
              }
            ) })
          ] }, comment.id);
        }) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "md:hidden divide-y rounded-md border bg-background", children: comments.map((comment) => {
        const status = getStatusBadge(comment);
        const isReply = comment.parentId !== null;
        const commentIdToOpen = comment.parentId || comment.id;
        return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center justify-between gap-4 px-4 py-5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "min-w-0 flex-1 space-y-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("span", { className: "font-medium truncate", children: [
                isReply && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-xs mr-1", children: "\u21B3" }),
                comment.content.slice(0, 40),
                comment.content.length > 40 ? "..." : ""
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: `inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold shrink-0 ${status.classes}`, children: status.label })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("p", { className: "text-sm text-muted-foreground truncate", children: [
              comment.user.name || comment.user.email,
              " \xB7 ",
              new Date(comment.createdAt).toLocaleDateString()
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "button",
            {
              onClick: () => navigate(`/editor/${comment.post.slug}?comment=${commentIdToOpen}`),
              className: "inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 hover:bg-accent text-muted-foreground hover:text-foreground shrink-0",
              children: "View"
            }
          )
        ] }, comment.id);
      }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(PaginationControls, { position: "bottom" })
  ] });
}

// src/ui/components/Navbar.tsx
var import_lucide_react12 = require("lucide-react");
var import_jsx_runtime21 = require("react/jsx-runtime");
function Navbar({
  onSignOut,
  onThemeToggle,
  theme,
  rightSlot
}) {
  const { session, currentPath, navigate, goBack, basePath } = useDashboardContext();
  const isRoot = currentPath === "/" || currentPath === "";
  const isSettings = currentPath.startsWith("/settings");
  const handleBack = (e) => {
    e.currentTarget.blur();
    goBack();
  };
  const avatarTrigger = /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(
    "button",
    {
      type: "button",
      className: "relative w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground active:ring-2 md:hover:ring-2 active:ring-ring md:hover:ring-ring transition-shadow",
      children: [
        session?.user?.email?.charAt(0).toUpperCase() || "?",
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" })
      ]
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("header", { className: "sticky top-0 z-50 border-b border-border bg-background overscroll-none", children: /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "max-w-5xl mx-auto px-6 py-4 flex items-center justify-between", children: [
    isRoot ? /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("a", { href: basePath, className: "font-medium flex items-center gap-1.5", children: [
      "Writer",
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded", children: "AI" })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(
      "button",
      {
        type: "button",
        onClick: handleBack,
        className: "h-9 px-3 -ml-3 gap-1.5 inline-flex items-center justify-center text-sm font-medium rounded-md active:bg-accent md:hover:bg-accent active:text-accent-foreground md:hover:text-accent-foreground touch-manipulation",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_lucide_react12.ChevronLeft, { className: "h-4 w-4" }),
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "hidden sm:inline", children: "Back" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "flex items-center gap-2", children: [
      rightSlot,
      onThemeToggle && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
        "button",
        {
          type: "button",
          onClick: onThemeToggle,
          className: "w-9 h-9 rounded-md border border-border active:bg-accent md:hover:bg-accent text-muted-foreground flex items-center justify-center",
          "aria-label": "Toggle theme",
          children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_lucide_react12.Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_lucide_react12.Moon, { className: "h-4 w-4" })
        }
      ),
      session && /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(Dropdown, { trigger: avatarTrigger, align: "right", className: "min-w-[180px]", children: [
        session.user?.role === "admin" && /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(import_jsx_runtime21.Fragment, { children: [
          !isSettings ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(DropdownItem, { onClick: () => navigate("/settings"), children: "Go to settings" }) : /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(DropdownItem, { onClick: () => navigate("/"), children: "Back to writer" }),
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(DropdownDivider, {})
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(DropdownItem, { onClick: () => {
          window.location.href = "/";
        }, children: "Back to site" }),
        onSignOut && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(DropdownItem, { onClick: onSignOut, children: "Logout" })
      ] })
    ] })
  ] }) });
}

// src/ui/hooks/useKeyboard.ts
var import_react19 = require("react");
function useKeyboard(shortcuts, enabled = true) {
  const shortcutsRef = (0, import_react19.useRef)(shortcuts);
  shortcutsRef.current = shortcuts;
  (0, import_react19.useEffect)(() => {
    if (!enabled) return;
    function handleKeyDown(event) {
      const target = event.target;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isTyping) {
        const hasMeta = event.metaKey || event.ctrlKey;
        const isEscape = event.key === "Escape";
        const isNavShortcut = hasMeta && (event.key === "/" || event.key === "'");
        if (!isEscape && !isNavShortcut) {
          return;
        }
      }
      for (const shortcut of shortcutsRef.current) {
        const metaMatch = shortcut.metaKey ? event.metaKey || event.ctrlKey : true;
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : true;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        if (keyMatch && metaMatch && ctrlMatch && shiftMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
function useDashboardKeyboard(options) {
  const shortcuts = [
    {
      key: "/",
      metaKey: true,
      action: () => options.onToggleView?.(),
      description: "Toggle view"
    },
    {
      key: "'",
      metaKey: true,
      action: () => options.onToggleSettings?.(),
      description: "Toggle settings"
    },
    {
      key: "n",
      action: () => options.onNewPost?.(),
      description: "New post"
    },
    {
      key: "Escape",
      action: () => options.onEscape?.(),
      description: "Go back"
    }
  ];
  useKeyboard(shortcuts, true);
}

// src/ui/dashboard.tsx
var import_jsx_runtime22 = require("react/jsx-runtime");
function AutobloggerDashboard({
  basePath = "/writer",
  apiBasePath = "/api/cms",
  styles,
  fields = [],
  session = null,
  onEditorStateChange,
  onRegisterEditHandler,
  onToggleView,
  onSignOut,
  onThemeToggle,
  theme,
  navbarRightSlot
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(DashboardProvider, { basePath, apiBasePath, styles, fields, session, onEditorStateChange, onRegisterEditHandler, children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
    DashboardLayout,
    {
      onToggleView,
      onSignOut,
      onThemeToggle,
      theme,
      navbarRightSlot
    }
  ) });
}
function DashboardLayout({
  onToggleView,
  onSignOut,
  onThemeToggle,
  theme,
  navbarRightSlot
}) {
  const { basePath, currentPath, navigate, onEditorStateChange } = useDashboardContext();
  const [editorState, setEditorState] = (0, import_react20.useState)(null);
  const chatContext = useChatContextOptional();
  const editorSlug = currentPath.startsWith("/editor/") ? currentPath.replace("/editor/", "") : currentPath === "/editor" ? void 0 : void 0;
  const isEditorPage = currentPath.startsWith("/editor");
  const handleEditorStateChange = (state) => {
    setEditorState(state);
    onEditorStateChange?.(state);
  };
  const setEssayContext = chatContext?.setEssayContext;
  (0, import_react20.useEffect)(() => {
    if (!setEssayContext) return;
    if (isEditorPage && editorState?.content) {
      setEssayContext({
        title: editorState.content.title,
        subtitle: editorState.content.subtitle,
        markdown: editorState.content.markdown
      });
    } else {
      setEssayContext(null);
    }
  }, [isEditorPage, editorState?.content, setEssayContext]);
  useDashboardKeyboard({
    basePath,
    onToggleView: onToggleView ? () => onToggleView(currentPath, editorSlug) : void 0,
    onToggleSettings: () => {
      if (currentPath.startsWith("/settings")) navigate("/");
      else navigate("/settings");
    },
    onNewPost: () => {
      if (currentPath === "/" || currentPath === "") navigate("/editor");
    },
    onEscape: () => {
      if (currentPath !== "/" && currentPath !== "") navigate("/");
    }
  });
  const rightSlotWithSave = /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(import_jsx_runtime22.Fragment, { children: [
    isEditorPage && editorState && /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
      "button",
      {
        type: "button",
        onClick: () => editorState.onSave("draft"),
        disabled: !editorState.hasUnsavedChanges || !!editorState.savingAs,
        className: "w-9 h-9 rounded-md border border-border hover:bg-accent text-muted-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
        "aria-label": "Save",
        title: editorState.hasUnsavedChanges ? "Save changes (\u2318S)" : "No unsaved changes",
        children: editorState.savingAs ? /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_lucide_react13.Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_lucide_react13.Save, { className: "h-4 w-4" })
      }
    ),
    navbarRightSlot
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: "min-h-screen bg-background flex flex-col", children: [
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
      Navbar,
      {
        onSignOut,
        onThemeToggle,
        theme,
        rightSlot: rightSlotWithSave
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("main", { className: "flex-1", children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(DashboardRouter, { path: currentPath, onEditorStateChange: handleEditorStateChange }) })
  ] });
}
function DashboardRouter({ path, onEditorStateChange }) {
  const pathWithoutQuery = path.split("?")[0];
  if (pathWithoutQuery === "/" || pathWithoutQuery === "") return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(WriterDashboard, {});
  if (pathWithoutQuery.startsWith("/editor")) {
    const slug = pathWithoutQuery.replace("/editor/", "").replace("/editor", "");
    return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(EditorPage, { slug: slug || void 0, onEditorStateChange }, path);
  }
  if (pathWithoutQuery.startsWith("/settings")) return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(SettingsPage, { subPath: pathWithoutQuery.replace("/settings", "") });
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { className: "max-w-4xl mx-auto px-6 py-8", children: /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("p", { className: "text-muted-foreground", children: [
    "Page not found: ",
    path
  ] }) });
}

// src/ui/components/ChatPanel.tsx
var import_react22 = require("react");
var import_react_dom3 = require("react-dom");
var import_lucide_react14 = require("lucide-react");

// src/ui/hooks/useAIModels.ts
var import_react21 = require("react");
function useAIModels(options) {
  const [models, setModels] = (0, import_react21.useState)([]);
  const [internalSelectedModel, setInternalSelectedModel] = (0, import_react21.useState)("");
  const [isLoading, setIsLoading] = (0, import_react21.useState)(true);
  const selectedModel = options?.externalSelectedModel ?? internalSelectedModel;
  const setSelectedModel = options?.externalSetSelectedModel ?? setInternalSelectedModel;
  const apiPath = options?.apiPath ?? "/api/cms/ai/settings";
  (0, import_react21.useEffect)(() => {
    fetch(apiPath).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }).then((data) => {
      const settings = data.data || data;
      setModels(settings.availableModels || []);
      if (settings.defaultModel && !selectedModel) {
        setSelectedModel(settings.defaultModel);
      }
    }).catch(console.error).finally(() => setIsLoading(false));
  }, [apiPath]);
  const currentModel = models.find((m) => m.id === selectedModel);
  return {
    models,
    selectedModel,
    setSelectedModel,
    currentModel,
    isLoading
  };
}

// src/ui/components/ChatPanel.tsx
var import_jsx_runtime23 = require("react/jsx-runtime");
var DEFAULT_PROSE_CLASSES2 = "prose prose-gray dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:underline";
function stripPlanTags(content) {
  return content.replace(/<plan>/gi, "").replace(/<\/plan>/gi, "");
}
function ChatPanel({
  proseClasses = DEFAULT_PROSE_CLASSES2,
  onNavigate: onNavigateProp,
  isOnEditor: isOnEditorProp,
  modelsApiPath
}) {
  const {
    messages,
    isStreaming,
    isOpen: open,
    setIsOpen,
    sendMessage: contextSendMessage,
    stopStreaming,
    essayContext,
    mode,
    setMode,
    undoEdit,
    webSearchEnabled,
    setWebSearchEnabled,
    thinkingEnabled,
    setThinkingEnabled,
    selectedModel,
    setSelectedModel,
    expandPlan
  } = useChatContext();
  const dashboardContext = (0, import_react22.useContext)(DashboardContext);
  const onNavigate = onNavigateProp ?? dashboardContext?.navigate;
  const isOnEditor = isOnEditorProp ?? !!essayContext;
  const [input, setInput] = (0, import_react22.useState)("");
  const [isAnimating, setIsAnimating] = (0, import_react22.useState)(false);
  const [isVisible, setIsVisible] = (0, import_react22.useState)(false);
  const [mounted, setMounted] = (0, import_react22.useState)(false);
  const [copiedIndex, setCopiedIndex] = (0, import_react22.useState)(null);
  const [modeMenuOpen, setModeMenuOpen] = (0, import_react22.useState)(false);
  const modeMenuRef = (0, import_react22.useRef)(null);
  const messagesEndRef = (0, import_react22.useRef)(null);
  const messagesContainerRef = (0, import_react22.useRef)(null);
  const textareaRef = (0, import_react22.useRef)(null);
  const prevMessageCountRef = (0, import_react22.useRef)(0);
  const savedScrollPositionRef = (0, import_react22.useRef)(null);
  const lastUserMessageRef = (0, import_react22.useRef)(null);
  const { models, currentModel } = useAIModels({
    externalSelectedModel: selectedModel,
    externalSetSelectedModel: setSelectedModel,
    apiPath: modelsApiPath
  });
  const onClose = (0, import_react22.useCallback)(() => setIsOpen(false), [setIsOpen]);
  const copyToClipboard = (0, import_react22.useCallback)(async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2e3);
  }, []);
  const handleDraftEssay = (0, import_react22.useCallback)(() => {
    const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistantMessage?.content) return;
    if (isOnEditor) {
      expandPlan();
      setMode("agent");
    } else if (onNavigate) {
      sessionStorage.setItem("pendingPlan", lastAssistantMessage.content);
      setIsOpen(false);
      onNavigate("/editor?fromPlan=1");
    } else {
      sessionStorage.setItem("pendingPlan", lastAssistantMessage.content);
      setIsOpen(false);
      window.location.href = "/writer/editor?fromPlan=1";
    }
  }, [messages, isOnEditor, expandPlan, setIsOpen, setMode, onNavigate]);
  (0, import_react22.useEffect)(() => {
    function handleClick(e) {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target)) {
        setModeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  (0, import_react22.useEffect)(() => {
    setMounted(true);
  }, []);
  (0, import_react22.useEffect)(() => {
    if (open) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      setIsAnimating(false);
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);
  (0, import_react22.useEffect)(() => {
    if (isVisible && open && !isAnimating) {
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    }
  }, [isVisible, open, isAnimating]);
  (0, import_react22.useEffect)(() => {
    if (!open && messagesContainerRef.current) {
      savedScrollPositionRef.current = messagesContainerRef.current.scrollTop;
    }
  }, [open]);
  (0, import_react22.useEffect)(() => {
    if (!open || !isVisible) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    const prevCount = prevMessageCountRef.current;
    const currentCount = messages.length;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (currentCount > prevCount) {
          const behavior = prevCount === 0 ? "instant" : "smooth";
          messagesEndRef.current?.scrollIntoView({ behavior });
        } else if (savedScrollPositionRef.current !== null) {
          container.scrollTop = savedScrollPositionRef.current;
        }
        prevMessageCountRef.current = currentCount;
      });
    });
  }, [messages.length, open, isVisible]);
  (0, import_react22.useEffect)(() => {
    if (!isStreaming) return;
    const container = messagesContainerRef.current;
    const userMessage = lastUserMessageRef.current;
    if (!container || !userMessage) return;
    const containerRect = container.getBoundingClientRect();
    const messageRect = userMessage.getBoundingClientRect();
    const distanceFromTop = messageRect.top - containerRect.top;
    if (distanceFromTop > 10) {
      container.scrollTop += Math.min(distanceFromTop * 0.3, 30);
    }
  }, [messages, isStreaming]);
  (0, import_react22.useEffect)(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);
  const sendMessage = (0, import_react22.useCallback)(async () => {
    if (!input.trim() || isStreaming) return;
    const content = input.trim();
    setInput("");
    await contextSendMessage(content);
  }, [input, isStreaming, contextSendMessage]);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };
  (0, import_react22.useEffect)(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        if (essayContext) {
          if (!open) {
            setIsOpen(true);
          }
          setMode(mode === "agent" ? "ask" : "agent");
        } else {
          setIsOpen(!open);
          setMode("ask");
        }
      }
    };
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [open, setIsOpen, setMode, essayContext, mode]);
  if (!isVisible || !mounted) return null;
  return (0, import_react_dom3.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(import_jsx_runtime23.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
        "div",
        {
          className: `fixed inset-0 h-[100dvh] bg-black/20 z-[60] transition-opacity duration-200 ${isAnimating ? "opacity-100" : "opacity-0"}`,
          onClick: onClose
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
        "div",
        {
          role: "dialog",
          "aria-modal": "true",
          "aria-label": "Chat",
          className: `fixed z-[70] flex flex-col bg-background shadow-xl transition-transform duration-200 ease-out overflow-hidden inset-x-0 top-0 h-[100dvh] md:left-auto md:w-full md:max-w-[380px] md:border-l md:border-border ${isAnimating ? "translate-x-0" : "translate-x-full"}`,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "flex-shrink-0 border-b border-border px-4 py-3 flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("h2", { className: "font-medium", children: "Chat" }),
                essayContext && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 truncate max-w-[140px]", children: essayContext.title || "Untitled" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
                "button",
                {
                  onClick: onClose,
                  className: "w-8 h-8 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground",
                  "aria-label": "Close chat",
                  children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.X, { className: "w-4 h-4" })
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { ref: messagesContainerRef, className: "flex-1 overflow-y-auto", children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { className: "h-full flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { className: "text-center max-w-xs px-6", children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("p", { className: "text-muted-foreground text-sm", children: mode === "plan" ? "Describe your essay idea and I'll create a structured outline with section headers and key points." : essayContext ? "Chat about your essay \u2014 ask for feedback, discuss ideas, or get help with specific sections." : "Chat with AI to brainstorm ideas, get feedback, or explore topics." }) }) }) : /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "px-4 py-4 space-y-4", children: [
              messages.map((message, index) => {
                const isLastUserMessage = message.role === "user" && !messages.slice(index + 1).some((m) => m.role === "user");
                return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
                  "div",
                  {
                    ref: isLastUserMessage ? lastUserMessageRef : void 0,
                    className: `flex gap-3 group ${message.role === "user" ? "justify-end" : "justify-start"}`,
                    children: /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
                      "div",
                      {
                        className: `max-w-[85%] rounded-2xl px-3 py-2 text-sm relative ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`,
                        children: [
                          message.role === "assistant" ? /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
                            "div",
                            {
                              className: `${proseClasses} [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`,
                              dangerouslySetInnerHTML: { __html: markdownToHtml(stripPlanTags(message.content)) }
                            }
                          ) : /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { className: "whitespace-pre-wrap break-words", children: message.content }),
                          isStreaming && index === messages.length - 1 && message.role === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "inline-block w-1.5 h-3 bg-current ml-0.5 animate-pulse" }),
                          message.appliedEdits && message.previousState && /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "flex items-center gap-2 mt-1.5", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "flex items-center gap-1 text-xs text-green-600 dark:text-green-400", children: [
                              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.Pencil, { className: "w-3 h-3" }),
                              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { children: "Edit applied" })
                            ] }),
                            /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
                              "button",
                              {
                                onClick: () => undoEdit(index),
                                className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors",
                                "aria-label": "Undo edit",
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.Undo2, { className: "w-3 h-3" }),
                                  /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { children: "Undo" })
                                ]
                              }
                            )
                          ] }),
                          message.role === "assistant" && !isStreaming && /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "absolute -bottom-6 left-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
                              "button",
                              {
                                onClick: () => copyToClipboard(message.content, index),
                                className: "text-muted-foreground hover:text-foreground p-1 rounded",
                                "aria-label": "Copy message",
                                children: copiedIndex === index ? /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.Check, { className: "w-3.5 h-3.5 text-green-500" }) : /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.Copy, { className: "w-3.5 h-3.5" })
                              }
                            ),
                            message.mode === "plan" && index === messages.length - 1 && message.content && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
                              "button",
                              {
                                onClick: handleDraftEssay,
                                className: "text-xs text-muted-foreground hover:text-foreground px-1 rounded",
                                children: "Draft Essay"
                              }
                            )
                          ] })
                        ]
                      }
                    )
                  },
                  index
                );
              }),
              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { ref: messagesEndRef })
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
              "form",
              {
                onSubmit: (e) => {
                  e.preventDefault();
                  sendMessage();
                },
                className: "flex-shrink-0 border-t border-border bg-background p-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "mb-2 flex items-center gap-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { ref: modeMenuRef, className: "relative", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
                        "button",
                        {
                          type: "button",
                          onClick: () => setModeMenuOpen(!modeMenuOpen),
                          title: "Switch mode (\u2318\u21E7A)",
                          className: `inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${mode === "ask" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : mode === "agent" ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`,
                          children: [
                            mode === "ask" && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.MessageSquare, { className: "w-3 h-3" }),
                            mode === "agent" && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.Pencil, { className: "w-3 h-3" }),
                            mode === "plan" && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.List, { className: "w-3 h-3" }),
                            mode === "ask" ? "Ask" : mode === "agent" ? "Agent" : "Plan",
                            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.ChevronDown, { className: "w-2.5 h-2.5 opacity-60" })
                          ]
                        }
                      ),
                      modeMenuOpen && /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "absolute bottom-full left-0 mb-1 min-w-[160px] bg-popover border border-border rounded-lg shadow-lg z-[100] py-1", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
                          "button",
                          {
                            type: "button",
                            onClick: () => {
                              setMode("agent");
                              setModeMenuOpen(false);
                              textareaRef.current?.focus();
                            },
                            disabled: !essayContext,
                            className: "w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.Pencil, { className: "w-4 h-4" }),
                              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "flex-1", children: "Agent" }),
                              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "text-xs text-muted-foreground", children: "\u2318\u21E7A" }),
                              mode === "agent" && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.Check, { className: "w-4 h-4" })
                            ]
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
                          "button",
                          {
                            type: "button",
                            onClick: () => {
                              setMode("plan");
                              setModeMenuOpen(false);
                              textareaRef.current?.focus();
                            },
                            className: "w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.List, { className: "w-4 h-4" }),
                              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "flex-1", children: "Plan" }),
                              mode === "plan" && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.Check, { className: "w-4 h-4" })
                            ]
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
                          "button",
                          {
                            type: "button",
                            onClick: () => {
                              setMode("ask");
                              setModeMenuOpen(false);
                              textareaRef.current?.focus();
                            },
                            className: "w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.MessageSquare, { className: "w-4 h-4" }),
                              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "flex-1", children: "Ask" }),
                              mode === "ask" && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.Check, { className: "w-4 h-4" })
                            ]
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
                      ControlButton,
                      {
                        onClick: () => {
                          setWebSearchEnabled(!webSearchEnabled);
                          textareaRef.current?.focus();
                        },
                        active: webSearchEnabled,
                        title: webSearchEnabled ? "Web search enabled (works with all models)" : "Enable web search (works with all models)",
                        tabIndex: -1,
                        children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.Globe, { className: "w-4 h-4" })
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
                      ControlButton,
                      {
                        onClick: () => {
                          setThinkingEnabled(!thinkingEnabled);
                          textareaRef.current?.focus();
                        },
                        active: thinkingEnabled,
                        title: thinkingEnabled ? "Thinking mode enabled" : "Enable thinking mode",
                        tabIndex: -1,
                        children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.Brain, { className: "w-4 h-4" })
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
                      ModelSelector,
                      {
                        models,
                        selectedModel,
                        onModelChange: (id) => {
                          setSelectedModel(id);
                          textareaRef.current?.focus();
                        },
                        currentModel
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "flex items-end gap-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
                      "textarea",
                      {
                        ref: textareaRef,
                        value: input,
                        onChange: (e) => setInput(e.target.value),
                        onKeyDown: handleKeyDown,
                        placeholder: mode === "plan" ? "Describe your essay idea..." : mode === "agent" && essayContext ? "Ask me to edit your essay..." : essayContext ? "Ask about your essay..." : "Ask anything...",
                        className: "flex-1 min-h-[40px] max-h-[120px] resize-none px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none",
                        rows: 1,
                        autoFocus: true
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
                      "button",
                      {
                        type: isStreaming ? "button" : "submit",
                        onClick: isStreaming ? stopStreaming : void 0,
                        disabled: !isStreaming && !input.trim(),
                        className: "rounded-full w-10 h-10 flex-shrink-0 border border-input bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation",
                        children: isStreaming ? /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.Square, { className: "h-4 w-4 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_lucide_react14.ArrowUp, { className: "h-5 w-5" })
                      }
                    )
                  ] })
                ]
              }
            )
          ]
        }
      )
    ] }),
    document.body
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AutobloggerDashboard,
  ChatContext,
  ChatPanel,
  ChatProvider,
  CommentThread,
  CommentsPanel,
  ControlButton,
  ModelSelector,
  Navbar,
  useAIModels,
  useChatContext,
  useChatContextOptional,
  useComments,
  useDashboardContext
});
//# sourceMappingURL=ui.js.map