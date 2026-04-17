import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Enabling pgvector...')
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;')
  
  console.log('Adding embedding_vec column...')
  await prisma.$executeRawUnsafe('ALTER TABLE "NoteEmbedding" ADD COLUMN IF NOT EXISTS embedding_vec vector(768);')
  
  console.log('Creating index...')
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS embedding_vec_idx ON "NoteEmbedding" 
    USING ivfflat (embedding_vec vector_cosine_ops) WITH (lists = 10);
  `)
  
  console.log('Done!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
