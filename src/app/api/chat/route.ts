import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns' // Install with: npm install date-fns

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Define available functions
const functions = [
  {
    name: 'search_content',
    description: 'Search through saved content in the database',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to find relevant content'
        },
        content_type: {
          type: 'string',
          enum: ['article', 'video', 'paper', 'book', 'podcast'],
          description: 'Type of content to search for (optional)'
        },
        days_ago: {
          type: 'number',
          description: 'Number of days to look back (optional)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_recent_content',
    description: 'Get content from the last N days',
    parameters: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days to look back',
          default: 7
        }
      },
      required: ['days']
    }
  }
]

async function getRecentContent(days: number) {
  const startDate = subDays(new Date(), days)
  
  const results = await prisma.content.findMany({
    where: {
      date_added: {
        gte: startDate
      }
    },
    orderBy: {
      date_added: 'desc'
    }
  })

  // Truncate content to prevent context overflow
  return results.map(content => ({
    ...content,
    excerpt: content.excerpt?.substring(0, 250) + (content.excerpt?.length > 250 ? '...' : ''),
    notes: content.notes?.substring(0, 250) + (content.notes?.length > 250 ? '...' : '')
  }))
}

async function searchContent(query: string, contentType?: string, daysAgo?: number) {
  const whereClause: any = {
    OR: [
      { title: { contains: query } },
      { notes: { contains: query } },
      { excerpt: { contains: query } }
    ]
  }

  if (contentType) {
    whereClause.type = contentType
  }

  if (daysAgo) {
    whereClause.date_added = {
      gte: subDays(new Date(), daysAgo)
    }
  }

  const results = await prisma.content.findMany({
    where: whereClause,
    orderBy: {
      date_added: 'desc'
    },
    take: 5
  })

  return results.map(content => ({
    ...content,
    excerpt: content.excerpt?.substring(0, 250) + (content.excerpt?.length > 250 ? '...' : ''),
    notes: content.notes?.substring(0, 250) + (content.notes?.length > 250 ? '...' : '')
  }))
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()
    
    // Get the most recent content date for context
    const mostRecentContent = await prisma.content.findFirst({
      orderBy: {
        date_added: 'desc'
      }
    })

    const currentContextDate = mostRecentContent?.date_added || new Date()
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that can search through the user's saved content and provide relevant information. 
          The current context date is ${currentContextDate.toLocaleDateString()}.
          When summarizing multiple pieces of content, organize them by date and type.
          Format your responses using markdown:
          - Use ## for main headings
          - Use bullet points for listing content
          - Use bold for important terms
          - Include dates in a readable format
          Make your responses visually organized and easy to read.`
        },
        ...messages
      ],
      functions,
      function_call: "auto"
    })

    const responseMessage = response.choices[0].message

    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name
      const functionArgs = JSON.parse(responseMessage.function_call.arguments)

      let searchResults
      if (functionName === 'search_content') {
        searchResults = await searchContent(
          functionArgs.query,
          functionArgs.content_type,
          functionArgs.days_ago
        )
      } else if (functionName === 'get_recent_content') {
        searchResults = await getRecentContent(functionArgs.days)
      }

      const secondResponse = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: [
          ...messages,
          responseMessage,
          {
            role: "function",
            name: functionName,
            content: JSON.stringify(searchResults)
          }
        ]
      })

      return NextResponse.json({
        message: secondResponse.choices[0].message.content
      })
    }

    return NextResponse.json({
      message: responseMessage.content
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
} 