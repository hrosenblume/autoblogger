import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import { ComponentType, ReactNode } from 'react';
import { Editor } from '@tiptap/react';

interface Post$1 {
    id: string;
    title: string;
    subtitle?: string | null;
    slug: string;
    markdown: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    noIndex: boolean;
    ogImage?: string | null;
    previewToken?: string | null;
    previewExpiry?: Date | null;
    sourceUrl?: string | null;
    topicId?: string | null;
    [key: string]: unknown;
}

interface StylesConfig {
    container?: string;
    title?: string;
    subtitle?: string;
    byline?: string;
    prose?: string;
}
interface CustomFieldProps<T = unknown> {
    value: T;
    onChange: (value: T) => void;
    onFieldChange: (name: string, value: unknown) => void;
    post: Post$1;
    disabled?: boolean;
}
interface CustomFieldConfig {
    name: string;
    label?: string;
    component: ComponentType<CustomFieldProps<unknown>>;
    position?: 'footer' | 'sidebar';
}

interface DashboardConfig {
    fields: CustomFieldConfig[];
    styles: Required<StylesConfig>;
}
interface SessionUser {
    id?: string;
    name?: string | null;
    email?: string;
    role?: string;
}
interface Session {
    user?: SessionUser;
}
interface SharedData {
    counts: Record<string, number>;
    settings: {
        autoDraftEnabled: boolean;
        postUrlPattern: string;
    };
    posts: unknown[];
    suggestedPosts: unknown[];
    aiSettings: {
        defaultModel: string;
        availableModels: unknown[];
    };
}
interface EditorContent {
    title: string;
    subtitle: string;
    markdown: string;
}
interface EditCommand {
    type: 'replace_all' | 'replace_section' | 'insert' | 'delete';
    title?: string;
    subtitle?: string;
    markdown?: string;
    find?: string;
    replace?: string;
    position?: 'before' | 'after' | 'start' | 'end';
}
type EditHandler$1 = (edit: EditCommand) => boolean;
interface EditorState {
    hasUnsavedChanges: boolean;
    status: 'draft' | 'published';
    savingAs: 'draft' | 'published' | null;
    onSave: (status: 'draft' | 'published') => void;
    confirmLeave: () => boolean;
    content: EditorContent;
}
interface DashboardContextValue {
    basePath: string;
    apiBasePath: string;
    styles: Required<StylesConfig>;
    fields: CustomFieldConfig[];
    currentPath: string;
    navigate: (path: string, options?: {
        skipConfirmation?: boolean;
    }) => void;
    goBack: () => void;
    canGoBack: boolean;
    config: DashboardConfig;
    session: Session | null;
    sharedData: SharedData | null;
    sharedDataLoading: boolean;
    refetchSharedData: () => Promise<void>;
    updateSharedPost: (post: {
        id: string;
        [key: string]: unknown;
    }) => void;
    removeSharedPost: (postId: string) => void;
    onEditorStateChange?: (state: EditorState | null) => void;
    onRegisterEditHandler?: (handler: EditHandler$1 | null) => void;
}
declare function useDashboardContext(): DashboardContextValue;

interface AutobloggerDashboardProps {
    basePath?: string;
    apiBasePath?: string;
    styles?: StylesConfig;
    fields?: CustomFieldConfig[];
    session?: Session | null;
    onEditorStateChange?: (state: EditorState | null) => void;
    onRegisterEditHandler?: (handler: EditHandler$1 | null) => void;
    onToggleView?: (currentPath: string, slug?: string) => void;
    onSignOut?: () => void;
    navbarRightSlot?: ReactNode;
    chatApiPath?: string;
    historyApiPath?: string;
    proseClasses?: string;
}
declare function AutobloggerDashboard({ basePath, apiBasePath, styles, fields, session, onEditorStateChange, onRegisterEditHandler, onToggleView, onSignOut, navbarRightSlot, chatApiPath, historyApiPath, proseClasses, }: AutobloggerDashboardProps): react_jsx_runtime.JSX.Element;

interface NavbarProps {
    onSignOut?: () => void;
    rightSlot?: React.ReactNode;
}
declare function Navbar({ onSignOut, rightSlot, }: NavbarProps): react_jsx_runtime.JSX.Element;

interface ThemeToggleProps {
    className?: string;
}
declare function ThemeToggle({ className }: ThemeToggleProps): react_jsx_runtime.JSX.Element;

interface ThemeProviderProps {
    children: ReactNode;
    className?: string;
}
declare function ThemeProvider({ children, className }: ThemeProviderProps): react_jsx_runtime.JSX.Element;

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';
interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
}
declare function useAutobloggerTheme(): ThemeContextValue;
declare function useTheme(): ThemeContextValue;

interface IconProps {
    className?: string;
}
declare const ChatIcon: ({ className }: IconProps) => react_jsx_runtime.JSX.Element;
declare const SunIcon: ({ className }: IconProps) => react_jsx_runtime.JSX.Element;
declare const MoonIcon: ({ className }: IconProps) => react_jsx_runtime.JSX.Element;
declare const ChevronLeftIcon: ({ className }: IconProps) => react_jsx_runtime.JSX.Element;

/**
 * Comment types and client-side API helpers for the editor commenting system.
 * Used for collaborative inline comments on posts.
 */
interface CommentUser {
    id: string;
    name: string | null;
    email: string;
}
interface CommentWithUser {
    id: string;
    postId: string;
    userId: string;
    quotedText: string;
    content: string;
    parentId: string | null;
    resolved: boolean;
    createdAt: string;
    updatedAt: string;
    user: CommentUser;
    replies?: CommentWithUser[];
}
interface SelectionState {
    text: string;
    from: number;
    to: number;
    hasExistingComment?: boolean;
}

interface CommentsPanelProps {
    comments: CommentWithUser[];
    currentUserEmail: string;
    isAdmin: boolean;
    selectedText: string | null;
    onCreateComment: (content: string) => Promise<void>;
    onReply: (parentId: string, content: string) => Promise<void>;
    onEdit: (commentId: string, content: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    onResolve: (commentId: string) => Promise<void>;
    onCommentClick: (commentId: string) => void;
    activeCommentId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onClearSelection: () => void;
}
declare function CommentsPanel({ comments, currentUserEmail, isAdmin, selectedText, onCreateComment, onReply, onEdit, onDelete, onResolve, onCommentClick, activeCommentId, isOpen, onClose, onClearSelection, }: CommentsPanelProps): react_jsx_runtime.JSX.Element | null;

interface CommentThreadProps {
    comment: CommentWithUser;
    currentUserEmail: string;
    isAdmin: boolean;
    isActive: boolean;
    onReply: (content: string) => Promise<void>;
    onEdit: (content: string) => Promise<void>;
    onDelete: () => Promise<void>;
    onResolve: () => Promise<void>;
    onClick: () => void;
}
declare function CommentThread({ comment, currentUserEmail, isAdmin, isActive, onReply, onEdit, onDelete, onResolve, onClick, }: CommentThreadProps): react_jsx_runtime.JSX.Element;

interface UseCommentsOptions {
    postId: string | null;
    editor: Editor | null;
    apiBasePath?: string;
    onSave?: () => Promise<string | null>;
}
interface CommentsState {
    list: CommentWithUser[];
    loading: boolean;
    activeId: string | null;
    setActiveId: (id: string | null) => void;
    selectedText: SelectionState | null;
    setSelectedText: (selection: SelectionState | null) => void;
    postId: string | null;
    create: (content: string) => Promise<void>;
    reply: (parentId: string, content: string) => Promise<void>;
    edit: (commentId: string, content: string) => Promise<void>;
    remove: (commentId: string) => Promise<void>;
    resolve: (commentId: string) => Promise<void>;
    resolveAll: () => Promise<void>;
    scrollTo: (commentId: string) => void;
    openCount: number;
}
declare function useComments({ postId: initialPostId, editor, apiBasePath, onSave, }: UseCommentsOptions): CommentsState;

interface EssaySnapshot {
    title: string;
    subtitle: string;
    markdown: string;
}
interface Message {
    role: 'user' | 'assistant';
    content: string;
    mode?: ChatMode;
    appliedEdits?: boolean;
    previousState?: EssaySnapshot;
}
interface EssayContext {
    title: string;
    subtitle?: string;
    markdown: string;
}
type ChatMode = 'ask' | 'agent' | 'plan' | 'search';
interface EssayEdit {
    type: 'replace_all' | 'replace_section' | 'insert' | 'delete';
    title?: string;
    subtitle?: string;
    markdown?: string;
    find?: string;
    replace?: string;
    position?: 'before' | 'after' | 'start' | 'end';
}
type EditHandler = (edit: EssayEdit) => boolean;
type ExpandPlanHandler = (plan: string, wordCount: number) => void;
interface ChatContextValue {
    messages: Message[];
    essayContext: EssayContext | null;
    isStreaming: boolean;
    isOpen: boolean;
    mode: ChatMode;
    webSearchEnabled: boolean;
    thinkingEnabled: boolean;
    selectedModel: string;
    setEssayContext: (context: EssayContext | null) => void;
    sendMessage: (content: string) => Promise<void>;
    stopStreaming: () => void;
    addMessage: (role: 'user' | 'assistant', content: string) => void;
    clearMessages: () => void;
    setIsOpen: (open: boolean) => void;
    setMode: (mode: ChatMode) => void;
    setWebSearchEnabled: (enabled: boolean) => void;
    setThinkingEnabled: (enabled: boolean) => void;
    setSelectedModel: (modelId: string) => void;
    registerEditHandler: (handler: EditHandler | null) => void;
    undoEdit: (messageIndex: number) => void;
    registerExpandPlanHandler: (handler: ExpandPlanHandler | null) => void;
    expandPlan: (wordCount?: number) => void;
}
declare const ChatContext: react.Context<ChatContextValue | null>;
interface ChatProviderProps {
    children: ReactNode;
    apiBasePath?: string;
    chatApiPath?: string;
    historyApiPath?: string;
}
declare function ChatProvider({ children, apiBasePath, chatApiPath, historyApiPath, }: ChatProviderProps): react_jsx_runtime.JSX.Element;
declare function useChatContext(): ChatContextValue;
/** Optional chat context - returns null if not within ChatProvider */
declare function useChatContextOptional(): ChatContextValue | null;

interface ChatPanelProps {
    /** @deprecated Models are now fetched from DashboardContext */
    modelsApiPath?: string;
    /** Optional prose classes for message rendering */
    proseClasses?: string;
    /** Optional callback when navigating (e.g., for expandPlan navigation) */
    onNavigate?: (path: string) => void;
    /** Whether currently on an editor page (controls Draft Essay behavior) */
    isOnEditor?: boolean;
}
declare function ChatPanel({ proseClasses, onNavigate: onNavigateProp, isOnEditor: isOnEditorProp, }: ChatPanelProps): react_jsx_runtime.JSX.Element | null;

declare function ChatButton(): react_jsx_runtime.JSX.Element | null;

/** AI model option for UI dropdowns */
interface AIModelOption {
    id: string;
    name: string;
    description: string;
    hasNativeSearch: boolean;
}

interface UseAIModelsOptions {
    /** External selected model state (for context-managed selection) */
    externalSelectedModel?: string;
    /** External setter (for context-managed selection) */
    externalSetSelectedModel?: (id: string) => void;
    /** Custom API path for settings (defaults to /api/cms/ai/settings) */
    apiPath?: string;
}
interface UseAIModelsResult {
    models: AIModelOption[];
    selectedModel: string;
    setSelectedModel: (id: string) => void;
    currentModel: AIModelOption | undefined;
    isLoading: boolean;
}
/**
 * Hook to fetch available AI models and manage selection.
 * Fetches models from AI settings endpoint and sets default model on mount.
 *
 * Can use internal state (default) or external state (for context-managed selection).
 */
declare function useAIModels(options?: UseAIModelsOptions): UseAIModelsResult;

interface ModelSelectorProps {
    models: AIModelOption[];
    selectedModel: string;
    onModelChange: (id: string) => void;
    currentModel?: AIModelOption;
}
declare function ModelSelector({ models, selectedModel, onModelChange, currentModel, }: ModelSelectorProps): react_jsx_runtime.JSX.Element;

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
}
declare const ControlButton: react.ForwardRefExoticComponent<ControlButtonProps & react.RefAttributes<HTMLButtonElement>>;

interface KeyboardShortcut {
    key: string;
    metaKey?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    action: () => void;
    description?: string;
    allowInInput?: boolean;
}
declare function useKeyboard(shortcuts: KeyboardShortcut[], enabled?: boolean): void;
declare function useDashboardKeyboard(options: {
    basePath: string;
    onToggleView?: () => void;
    onToggleSettings?: () => void;
    onNewPost?: () => void;
    onEscape?: () => void;
}): void;

/**
 * Predefined keyboard shortcuts for the dashboard.
 * These can be used with useKeyboard() hook.
 */
declare const SHORTCUTS: {
    readonly THEME_TOGGLE: {
        readonly key: ".";
        readonly metaKey: true;
        readonly allowInInput: true;
    };
    readonly TOGGLE_VIEW: {
        readonly key: "/";
        readonly metaKey: true;
        readonly allowInInput: true;
    };
    readonly SETTINGS: {
        readonly key: ";";
        readonly metaKey: true;
        readonly allowInInput: true;
    };
    readonly CHAT_TOGGLE: {
        readonly key: "k";
        readonly metaKey: true;
        readonly allowInInput: true;
    };
    readonly NEW_ARTICLE: {
        readonly key: "n";
    };
    readonly PREV: {
        readonly key: "ArrowLeft";
    };
    readonly NEXT: {
        readonly key: "ArrowRight";
    };
    readonly ESCAPE_BACK: {
        readonly key: "Escape";
        readonly allowInInput: true;
    };
    readonly TOGGLE_CHAT_MODE: {
        readonly key: "a";
        readonly metaKey: true;
        readonly shiftKey: true;
        readonly allowInInput: true;
    };
};

interface GlobalShortcutsProps {
    /** Path to navigate to when Cmd+/ is pressed (default: /writer) */
    writerPath?: string;
}
/**
 * Global keyboard shortcuts for use outside the dashboard.
 * Add this to your root layout to enable Cmd+/ navigation to the writer.
 *
 * Zero-config: just add <GlobalShortcuts /> to your root layout.
 */
declare function GlobalShortcuts({ writerPath }?: GlobalShortcutsProps): null;

interface ExpandableSectionProps {
    /** Section title displayed in the header */
    title: string;
    /** Optional summary text displayed on the right side of the header */
    summary?: string;
    /** Whether the section is expanded by default */
    defaultExpanded?: boolean;
    /** Controlled expanded state (makes component controlled) */
    expanded?: boolean;
    /** Callback when expanded state changes */
    onExpandedChange?: (expanded: boolean) => void;
    /** Content to render when expanded */
    children: ReactNode;
    /** Additional className for the container */
    className?: string;
}
declare function ExpandableSection({ title, summary, defaultExpanded, expanded: controlledExpanded, onExpandedChange, children, className, }: ExpandableSectionProps): react_jsx_runtime.JSX.Element;

interface Post {
    title?: string;
    subtitle?: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    noIndex?: boolean;
}
interface SeoSectionProps {
    post: Post;
    onFieldChange: (name: string, value: unknown) => void;
    disabled?: boolean;
}
declare function SeoSection({ post, onFieldChange, disabled, }: SeoSectionProps): react_jsx_runtime.JSX.Element;

export { type AIModelOption, AutobloggerDashboard, type AutobloggerDashboardProps, ChatButton, ChatContext, type EditHandler as ChatEditHandler, type EssayContext as ChatEssayContext, ChatIcon, type Message as ChatMessage, type ChatMode, ChatPanel, ChatProvider, ChevronLeftIcon, CommentThread, CommentsPanel, type CommentsState, ControlButton, type CustomFieldConfig, type CustomFieldProps, type EditCommand, type EditHandler$1 as EditHandler, type EditorContent, type EditorState, type EssayEdit, type EssaySnapshot, type ExpandPlanHandler, ExpandableSection, GlobalShortcuts, ModelSelector, MoonIcon, Navbar, type NavbarProps, SHORTCUTS, SeoSection, type Session, type SessionUser, type StylesConfig, SunIcon, ThemeProvider, ThemeToggle, useAIModels, useAutobloggerTheme, useChatContext, useChatContextOptional, useComments, useDashboardContext, useDashboardKeyboard, useKeyboard, useTheme };
