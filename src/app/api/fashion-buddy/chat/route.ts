import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { chatWithFashionBuddy } from '@/lib/openai'
import { z } from 'zod'

const chatSchema = z
  .object({
    message: z.string().trim().min(1).max(4000),
    history: z
      .array(
        z
          .object({
            role: z.enum(['user', 'assistant']),
            content: z.string().max(8000),
          })
          .strict()
      )
      .max(50)
      .optional(),
  })
  .strict()

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const { message, history } = chatSchema.parse(body)

    const response = await chatWithFashionBuddy(message, history)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Fashion buddy chat error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

