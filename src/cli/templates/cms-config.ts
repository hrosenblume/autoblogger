export const CMS_CONFIG_TEMPLATE = `import { createAutoblogger } from 'autoblogger'

// TODO: Update this import to match your Prisma client location
// Common locations:
//   import { prisma } from '@/lib/db'
//   import { prisma } from '@/lib/prisma'
//   import { db as prisma } from '@/server/db'
//   import prisma from '@/lib/prisma'
//
// If you don't have a Prisma client file yet, create one:
//   // lib/db.ts
//   import { PrismaClient } from '@prisma/client'
//   export const prisma = new PrismaClient()
import { prisma } from '@/lib/db'

// TODO: Import your auth function
// import { auth } from '@/lib/auth'

export const cms = createAutoblogger({
  // Required: Your Prisma client instance
  prisma,
  
  // Required: Authentication configuration
  auth: {
    // TODO: Replace with your auth function
    getSession: async () => {
      // Example for NextAuth:
      // return auth()
      
      // For now, return a mock session (remove in production!)
      return {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          name: 'Admin',
          role: 'admin',
        }
      }
    },
    
    // Check if user is an admin
    isAdmin: (session) => session?.user?.role === 'admin',
    
    // Check if user can publish posts
    canPublish: (session) => ['admin', 'writer'].includes(session?.user?.role ?? ''),
  },
  
  // Optional: AI configuration
  ai: {
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
  },
  
  // Optional: File upload handler
  // storage: {
  //   upload: async (file: File) => {
  //     const url = await uploadToYourStorage(file)
  //     return { url }
  //   }
  // },
})
`
