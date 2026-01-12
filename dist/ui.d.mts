import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import { ComponentType, ReactNode } from 'react';
import { Editor } from '@tiptap/react';

interface Post {
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
    post: Post;
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
    navigate: (path: string) => void;
    goBack: () => void;
    canGoBack: boolean;
    config: DashboardConfig;
    session: Session | null;
    sharedData: SharedData | null;
    sharedDataLoading: boolean;
    refetchSharedData: () => Promise<void>;
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
    onThemeToggle?: () => void;
    theme?: 'light' | 'dark';
    navbarRightSlot?: ReactNode;
}
declare function AutobloggerDashboard({ basePath, apiBasePath, styles, fields, session, onEditorStateChange, onRegisterEditHandler, onToggleView, onSignOut, onThemeToggle, theme, navbarRightSlot, }: AutobloggerDashboardProps): react_jsx_runtime.JSX.Element;

interface NavbarProps {
    onSignOut?: () => void;
    onThemeToggle?: () => void;
    theme?: 'light' | 'dark';
    rightSlot?: React.ReactNode;
}
declare function Navbar({ onSignOut, onThemeToggle, theme, rightSlot, }: NavbarProps): react_jsx_runtime.JSX.Element;

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
declare function CommentsPanel({ comments, currentUserEmail, isAdmin, selectedText, onCreateComment, onReply, onEdit, onDelete, onResolve, onCommentClick, activeCommentId, isOpen, onClose, onClearSelection, }: CommentsPanelProps): react.ReactPortal | null;

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
type ChatMode = 'ask' | 'agent' | 'plan';
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

export { AutobloggerDashboard, type AutobloggerDashboardProps, ChatContext, type EditHandler as ChatEditHandler, type EssayContext as ChatEssayContext, type Message as ChatMessage, type ChatMode, ChatProvider, CommentThread, CommentsPanel, type CommentsState, type CustomFieldConfig, type CustomFieldProps, type EditCommand, type EditHandler$1 as EditHandler, type EditorContent, type EditorState, type EssayEdit, type EssaySnapshot, type ExpandPlanHandler, Navbar, type NavbarProps, type Session, type SessionUser, type StylesConfig, useChatContext, useComments, useDashboardContext };
