# @autoblogger/prismic

Prismic destination adapter for [autoblogger](https://github.com/hrosenblume/autoblogger). Automatically syncs published posts to your Prismic repository.

## Installation

```bash
npm install @autoblogger/prismic
```

## Usage

```typescript
import { createAutoblogger } from 'autoblogger'
import { prismicDestination } from '@autoblogger/prismic'

export const cms = createAutoblogger({
  prisma,
  auth: { ... },
  
  destinations: [
    prismicDestination({
      repository: 'my-repo',
      writeToken: process.env.PRISMIC_WRITE_TOKEN!,
      documentType: 'blog_post',
    })
  ]
})
```

## Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `repository` | `string` | Yes | Your Prismic repository name |
| `writeToken` | `string` | Yes | Prismic write API token |
| `documentType` | `string` | Yes | Document type to create (e.g., 'blog_post') |
| `fieldMapping` | `FieldMapping` | No | Custom field mappings |
| `masterLocale` | `string` | No | Master locale (default: 'en-us') |
| `autoPublish` | `boolean` | No | Auto-publish after create/update |
| `getDocumentId` | `(post) => string` | No | Custom document ID resolver |

## Field Mapping

By default, autoblogger fields map to these Prismic fields:

| Autoblogger Field | Prismic Field | Type |
|-------------------|---------------|------|
| `title` | `title` | Rich Text |
| `subtitle` | `subtitle` | Rich Text |
| `markdown` | `body` | Rich Text |
| `slug` | `uid` | UID |
| `seoTitle` | `seo_title` | Key Text |
| `seoDescription` | `seo_description` | Key Text |
| `publishedAt` | `publish_date` | Date |

### Custom Field Mapping

```typescript
prismicDestination({
  repository: 'my-repo',
  writeToken: process.env.PRISMIC_WRITE_TOKEN!,
  documentType: 'blog_post',
  fieldMapping: {
    title: 'post_title',      // Map title to 'post_title' field
    content: 'content',       // Map markdown to 'content' field
    custom: {
      authorId: 'author',     // Map custom 'authorId' field
      category: 'category',   // Map custom 'category' field
    }
  }
})
```

## Prismic Setup

1. Create a custom type in Prismic with the fields you want to map
2. Get a write API token from Settings > API & Security
3. Configure the adapter with your repository name and token

## Limitations

- Uses Prismic's Migration API, which is designed for bulk imports
- Unpublish and delete operations log warnings but don't remove documents
- For full document lifecycle management, use Prismic's Document API directly

## License

MIT
