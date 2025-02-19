import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const contents = await prisma.content.findMany({
      orderBy: {
        date_added: 'desc'
      }
    })
    return NextResponse.json(contents)
  } catch (error) {
    console.error('Failed to fetch content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const content = await prisma.content.create({
      data: {
        type: body.type,
        title: body.title,
        url: body.url,
        notes: body.notes,
        excerpt: body.excerpt,
        tags: body.tags || []
      }
    })
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
} 