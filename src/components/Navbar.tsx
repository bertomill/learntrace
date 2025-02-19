'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Navbar({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [activeTab, setActiveTab] = useState('form')

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
    onTabChange(tab)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-8">
          <a href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">LearnTrace</span>
          </a>
        </div>

        <div className="flex space-x-4">
          <Button
            variant={activeTab === 'form' ? 'default' : 'ghost'}
            onClick={() => handleTabClick('form')}
          >
            Add Content
          </Button>
          <Button
            variant={activeTab === 'list' ? 'default' : 'ghost'}
            onClick={() => handleTabClick('list')}
          >
            View Content
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'ghost'}
            onClick={() => handleTabClick('create')}
          >
            Create Content
          </Button>
        </div>
      </div>
    </nav>
  )
} 