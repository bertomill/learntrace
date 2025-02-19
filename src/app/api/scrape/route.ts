import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    const html = await response.text()

    // Simple title extraction
    const titleMatch = html.match(/<title>(.*?)<\/title>/)
    const title = titleMatch ? titleMatch[1] : ''

    // You can add more complex scraping logic here

    return NextResponse.json({ title })
  } catch (error) {
    console.error('Error scraping URL:', error)
    return NextResponse.json({ error: 'Failed to scrape URL' }, { status: 500 })
  }
} 