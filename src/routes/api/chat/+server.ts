import OpenAI from 'openai';
import { json } from '@sveltejs/kit';
import { getLocalFirstContext } from '$lib/utils/localFirstContext';
import { env } from '$env/dynamic/private';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const openAI = new OpenAI({
  apiKey: env.GEMINI_API_KEY || '',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta'
});

const SYSTEM_PROMPT = getLocalFirstContext();

function mapRole(role: string): string {
  return role === 'model' ? 'assistant' : 'user';
}

export async function POST({ request }) {
  try {
    const { message, history } = await request.json();

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((msg: ChatMessage) => ({
        role: mapRole(msg.role),
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const result = await openAI.chat.completions.create({
      model: 'gemini-1.5-flash',
      messages
    });

    return json({ 
      success: true, 
      text: result.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error:', error);
    return json({ 
      success: false, 
      text: 'Sorry, I encountered an error. Please try again.' 
    }, { status: 500 });
  }
} 