'use client'

import { useState } from 'react'
import type { ContentType } from '@/types/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AddContentForm() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Article')
  const [excerpt, setExcerpt] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)

    if (newUrl) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/scrape?url=${encodeURIComponent(newUrl)}`)
        const data = await response.json()
        setTitle(data.title || '')
        setExcerpt(data.excerpt || '')
      } catch (error) {
        console.error('Error fetching page data:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: type as ContentType,
          title,
          url,
          notes,
          excerpt,
          dateAdded: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save content')
      }

      // Clear form
      setUrl('')
      setTitle('')
      setType('Article')
      setExcerpt('')
      setNotes('')

      // TODO: Show success message
      alert('Content saved successfully!')
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save content')
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Content</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              URL
            </label>
            <Input
              type="url"
              id="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Content Type
            </label>
            <Select value={type} onValueChange={(value) => setType(value as ContentType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Article">Article</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="Paper">Paper</SelectItem>
                <SelectItem value="Book">Book</SelectItem>
                <SelectItem value="Podcast">Podcast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
              Source Excerpt
            </label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Paste relevant excerpts from the source here..."
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Your Notes
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your thoughts and notes about this content..."
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Loading...' : 'Add Content'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 