'use client'

import { useEffect, useState } from 'react'
import { Content } from '@/types/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

function ContentCard({ content }: { content: Content }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const excerptPreviewLength = 280 // About 2-3 lines of text

  const shouldTruncate = content.excerpt.length > excerptPreviewLength
  const displayedExcerpt = isExpanded 
    ? content.excerpt 
    : content.excerpt.slice(0, excerptPreviewLength) + (shouldTruncate ? '...' : '')

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          {content.title}
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="capitalize">{content.type}</span>
          <span className="mx-2">•</span>
          <time>
            {new Date(content.date_added).toLocaleDateString()}
          </time>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <a 
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline flex items-center gap-1 text-sm"
        >
          {content.url.length > 50 ? content.url.slice(0, 50) + '...' : content.url}
          <ExternalLink className="h-3 w-3" />
        </a>

        <div className="space-y-4">
          {/* Excerpt */}
          <div>
            <h4 className="text-sm font-medium mb-1">Excerpt</h4>
            <p className="text-sm text-gray-600">
              {displayedExcerpt}
            </p>
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-8 text-blue-500"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-1" />
                )}
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>

          {/* Notes */}
          {content.notes && (
            <div>
              <h4 className="text-sm font-medium mb-1">Notes</h4>
              <p className="text-sm text-gray-600">{content.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ContentList() {
  const [contents, setContents] = useState<Content[]>([])

  useEffect(() => {
    async function fetchContents() {
      try {
        const response = await fetch('/api/content')
        if (!response.ok) throw new Error('Failed to fetch content')
        const data = await response.json()
        setContents(data)
      } catch (error) {
        console.error('Error fetching content:', error)
      }
    }

    fetchContents()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Saved Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((content) => (
          <ContentCard key={content.id} content={content} />
        ))}
      </div>
    </div>
  )
} 