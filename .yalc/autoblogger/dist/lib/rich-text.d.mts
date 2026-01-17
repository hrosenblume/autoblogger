/**
 * Rich text conversion utilities for CMS adapters.
 * Converts markdown to Prismic, Contentful, and Sanity rich text formats.
 */
interface PrismicSpan {
    type: 'strong' | 'em' | 'hyperlink';
    start: number;
    end: number;
    data?: {
        url: string;
    };
}
interface PrismicRichTextNode {
    type: string;
    text?: string;
    spans?: PrismicSpan[];
    items?: PrismicRichTextNode[];
    alt?: string;
    url?: string;
    dimensions?: {
        width: number;
        height: number;
    };
}
/**
 * Convert markdown to Prismic rich text format.
 * @see https://prismic.io/docs/rich-text
 */
declare function markdownToPrismicRichText(markdown: string): PrismicRichTextNode[];
interface ContentfulNode {
    nodeType: string;
    content?: ContentfulNode[];
    value?: string;
    data?: Record<string, unknown>;
    marks?: Array<{
        type: string;
    }>;
}
interface ContentfulDocument {
    nodeType: 'document';
    data: Record<string, unknown>;
    content: ContentfulNode[];
}
/**
 * Convert markdown to Contentful rich text format.
 * @see https://www.contentful.com/developers/docs/concepts/rich-text/
 */
declare function markdownToContentfulRichText(markdown: string): ContentfulDocument;
interface PortableTextSpan {
    _type: 'span';
    _key: string;
    text: string;
    marks?: string[];
}
interface PortableTextBlock {
    _type: 'block';
    _key: string;
    style: string;
    markDefs?: Array<{
        _type: string;
        _key: string;
        href?: string;
    }>;
    children: PortableTextSpan[];
    listItem?: 'bullet' | 'number';
    level?: number;
}
type PortableTextNode = PortableTextBlock | {
    _type: 'image';
    _key: string;
    asset: {
        url: string;
    };
    alt?: string;
};
/**
 * Convert markdown to Sanity Portable Text format.
 * @see https://www.sanity.io/docs/block-content
 */
declare function markdownToPortableText(markdown: string): PortableTextNode[];

export { type ContentfulDocument, type ContentfulNode, type PortableTextBlock, type PortableTextNode, type PortableTextSpan, type PrismicRichTextNode, type PrismicSpan, markdownToContentfulRichText, markdownToPortableText, markdownToPrismicRichText };
