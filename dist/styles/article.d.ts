declare const ARTICLE_LAYOUT: {
    readonly maxWidth: 680;
    readonly padding: 24;
};
declare const ARTICLE_CLASSES: {
    readonly container: "max-w-[680px] mx-auto px-6";
    readonly title: "text-title font-bold";
    readonly subtitle: "text-h2 text-muted-foreground";
    readonly byline: "text-sm text-muted-foreground";
    readonly body: "text-body prose dark:prose-invert";
    readonly prose: "prose dark:prose-invert max-w-none";
};
type ArticleClasses = typeof ARTICLE_CLASSES;

export { ARTICLE_CLASSES, ARTICLE_LAYOUT, type ArticleClasses };
