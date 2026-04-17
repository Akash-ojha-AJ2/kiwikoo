/**
 * DROP-IN REPLACEMENT for OpenAI chat.completions.create()
 * 
 * Provides the same interface as `getOpenAI().chat.completions.create()`
 * but uses Gemini 2.5 Flash under the hood.
 * 
 * Usage: Replace `import { getOpenAI } from '@/lib/openai'` with
 *        `import { getGeminiChat } from './gemini-chat'`
 *        Then replace `getOpenAI()` with `getGeminiChat()`
 */

import 'server-only'
import { geminiGenerateContent, geminiEmbedContent } from '@/lib/gemini/executor'

const GEMINI_CHAT_MODEL = 'gemini-2.5-flash'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: any // string or array of content parts
}

interface ChatCompletionOptions {
  model?: string
  messages: ChatMessage[]
  response_format?: { type: string }
  temperature?: number
  max_tokens?: number
  [key: string]: any
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string | null
    }
  }>
}

/**
 * Convert OpenAI-style messages to Gemini contents format
 */
function convertMessages(messages: ChatMessage[]): { systemInstruction?: string; contents: any[] } {
  let systemInstruction: string | undefined
  const contents: any[] = []

  for (const msg of messages) {
    if (msg.role === 'system') {
      // Gemini uses systemInstruction instead of system messages
      systemInstruction = typeof msg.content === 'string'
        ? msg.content
        : JSON.stringify(msg.content)
      continue
    }

    if (typeof msg.content === 'string') {
      contents.push(msg.content)
    } else if (Array.isArray(msg.content)) {
      // Handle OpenAI vision format: [{type: 'text', text: ...}, {type: 'image_url', image_url: {url: ...}}]
      for (const part of msg.content) {
        if (part.type === 'text') {
          contents.push(part.text)
        } else if (part.type === 'image_url' && part.image_url?.url) {
          const url = part.image_url.url
          // Extract base64 from data URI
          const match = url.match(/^data:image\/([a-z]+);base64,(.+)$/)
          if (match) {
            contents.push({
              inlineData: {
                data: match[2],
                mimeType: `image/${match[1]}`,
              },
            } as any)
          }
        }
      }
    }
  }

  return { systemInstruction, contents }
}

/**
 * Drop-in replacement chat completions interface backed by Gemini
 */
async function createChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
  const { systemInstruction, contents } = convertMessages(options.messages)

  const config: any = {
    temperature: options.temperature ?? 0.2,
    maxOutputTokens: options.max_tokens ?? 2048,
  }

  if (systemInstruction) {
    config.systemInstruction = systemInstruction
  }

  // Request JSON output if specified
  if (options.response_format?.type === 'json_object') {
    config.responseMimeType = 'application/json'
  }

  const response = await geminiGenerateContent({
    model: GEMINI_CHAT_MODEL,
    contents,
    config,
  })

  // Extract text from Gemini response
  let text: string | null = null
  if (response.text) {
    text = response.text
  } else if (response.candidates && response.candidates.length > 0) {
    const textPart = response.candidates[0]?.content?.parts?.find((p: any) => p.text)
    if (textPart && 'text' in textPart) {
      text = (textPart as any).text || null
    }
  }

  // Strip markdown fences if present (Gemini sometimes wraps JSON in ```json...```)
  if (text) {
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  }

  return {
    choices: [{ message: { content: text } }],
  }
}

/**
 * Drop-in replacement for OpenAI embeddings
 */
async function createEmbeddings(options: { input: string | string[], model?: string, [key: string]: any }) {
  const model = 'gemini-embedding-001'

  if (Array.isArray(options.input)) {
    const response = await geminiEmbedContent({ model, contents: options.input })
    const embeddings = Array.isArray((response as any)?.embeddings)
      ? (response as any).embeddings
      : Array.isArray(response)
        ? response
        : []
    return {
      data: embeddings.map((resp: any, i: number) => ({
        index: i,
        embedding: resp?.values ?? resp?.embedding?.values ?? []
      }))
    }
  } else {
    const response = await geminiEmbedContent({ model, contents: options.input })
    const embedding =
      (response as any)?.embeddings?.[0]?.values ??
      (response as any)?.embedding?.values ??
      []
    return {
      data: [{ index: 0, embedding }]
    }
  }
}

/**
 * Drop-in replacement for getOpenAI() — returns an object with
 * .chat.completions.create() and .embeddings.create() using Gemini.
 */
export function getGeminiChat() {
  return {
    chat: {
      completions: {
        create: createChatCompletion,
      },
    },
    embeddings: {
      create: createEmbeddings,
    }
  }
}
