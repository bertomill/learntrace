'use client'

import { useState } from 'react'
import AddContentForm from '../components/AddContentForm'
import ContentList from '../components/ContentList'
import CreateContent from '../components/CreateContent'
import Navbar from '../components/Navbar'

export default function Home() {
  const [activeTab, setActiveTab] = useState('form')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onTabChange={setActiveTab} />
      <main className="flex-1 container py-6">
        {activeTab === 'form' && <AddContentForm />}
        {activeTab === 'list' && <ContentList />}
        {activeTab === 'create' && <CreateContent />}
      </main>
    </div>
  )
} 