import OpenAI from 'openai'
import { EXPENSE_CATEGORIES, CATEGORY_DESCRIPTIONS } from './config/expense-categories'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ExpenseAnalysis {
  category: string
  confidence: number
}

export async function analyzeExpense(
  title: string,
  description: string,
  amount: number
): Promise<ExpenseAnalysis> {
  try {
    const prompt = `
Categorize this expense for a comprehensive expense management app:

Title: ${title}
Description: ${description || 'No description'}
Amount: $${amount}

Available categories: ${EXPENSE_CATEGORIES.join(', ')}

Please respond with a JSON object containing:
1. category: One of the available categories (most appropriate match)
2. confidence: A number between 0 and 1 indicating confidence in the categorization

Category guidelines:
${Object.entries(CATEGORY_DESCRIPTIONS).map(([category, description]) => `- "${category}": ${description}`).join('\n')}

Focus on the most specific and accurate category. Consider the context and amount when making your decision.
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 100,
    })

    const responseContent = response.choices[0].message.content || '{}'
    
    // Handle markdown code blocks in response
    let jsonContent = responseContent
    if (responseContent.includes('```json')) {
      jsonContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    } else if (responseContent.includes('```')) {
      jsonContent = responseContent.replace(/```\n?/g, '').replace(/```\n?/g, '').trim()
    }
    
    const analysis = JSON.parse(jsonContent)
    
    return {
      category: analysis.category || 'Other',
      confidence: analysis.confidence || 0.5,
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    return {
      category: 'Other',
      confidence: 0.5,
    }
  }
}
