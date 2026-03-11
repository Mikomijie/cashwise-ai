import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  userName?: string;
  userGoals?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Chat AI Function Started ===');
    const { contents, userName, userGoals } = await req.json() as ChatRequest;
    console.log('Request received:', { 
      contentsLength: contents?.length, 
      userName, 
      userGoals,
      firstMessage: contents?.[0]?.parts?.[0]?.text?.substring(0, 50)
    });

    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      console.error('ERROR: Invalid contents array');
      return new Response(
        JSON.stringify({ error: 'Invalid request: contents array is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the Featherless API key from environment
    console.log('Checking for FEATHERLESS_API_KEY in environment...');
    const apiKey = Deno.env.get('FEATHERLESS_API_KEY');
    
    if (!apiKey) {
      console.error('ERROR: FEATHERLESS_API_KEY not found in environment variables');
      console.error('Available env vars:', Object.keys(Deno.env.toObject()));
      return new Response(
        JSON.stringify({ 
          error: 'API configuration error',
          message: 'FEATHERLESS_API_KEY is not set in environment variables. Please check Supabase Edge Function secrets.'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✓ FEATHERLESS_API_KEY found (length:', apiKey.length, ')');

    // Convert Gemini format to OpenAI format
    console.log('Converting message format from Gemini to OpenAI...');
    const messages: Message[] = contents.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : (msg.role === 'user' ? 'user' : 'user'),
      content: msg.parts[0].text
    }));

    // Create CashWise AI system prompt with user context
    const systemPrompt = `You are CashWise AI, a smart and empathetic financial coach for young Africans. You have deep knowledge of personal finance, African financial tools like M-Pesa, SACCOs, mobile money and local markets.

Always use common financial sense — for example always prioritize essential bills like rent over personal debts. When comparing investments always present options fairly and ask about risk tolerance. Be warm, direct and practical. Only answer finance related questions.

If someone asks about non-financial topics, say: "I'm only here to help with your finances! 💰 Ask me anything about saving, budgeting or managing your money."

Keep responses concise (under 100 words when possible). Use short sentences, emojis, and line breaks for easy reading. Always end with complete sentences.

${userName ? `The user's name is ${userName}. Greet them by name when appropriate.` : 'Greet with "Hey! 👋" when appropriate.'}${userGoals ? ` Their financial goal: ${userGoals}.` : ''}`;

    // Prepend system message
    const fullMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    console.log('Prepared', fullMessages.length, 'messages for Featherless AI');
    console.log('System prompt:', systemPrompt.substring(0, 100) + '...');

    // Make request to Featherless AI API
    const featherlessUrl = 'https://api.featherless.ai/v1/chat/completions';
    console.log('Calling Featherless AI API:', featherlessUrl);
    
    const requestBody = {
      model: 'mistralai/Mistral-7B-Instruct-v0.3',
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2).substring(0, 500));

    const response = await fetch(featherlessUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Featherless AI response status:', response.status);
    console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ERROR: Featherless AI API returned error');
      console.error('Status:', response.status);
      console.error('Error body:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Featherless AI API error', 
          status: response.status,
          details: errorText,
          message: `API returned ${response.status}: ${errorText}`
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('✓ Featherless AI response received successfully');
    console.log('Response data structure:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasMessage: !!data.choices?.[0]?.message,
      messageRole: data.choices?.[0]?.message?.role,
      contentLength: data.choices?.[0]?.message?.content?.length
    });

    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('ERROR: Invalid response structure from Featherless AI');
      console.error('Response data:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from AI',
          message: 'The AI service returned an unexpected response format'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Convert OpenAI format back to Gemini-like format for frontend compatibility
    const geminiResponse = {
      candidates: [{
        content: {
          role: 'model',
          parts: [{
            text: data.choices[0].message.content
          }]
        },
        finishReason: data.choices[0].finish_reason === 'stop' ? 'STOP' : 'OTHER',
        index: 0
      }]
    };

    console.log('✓ Response converted to Gemini format');
    console.log('Response text preview:', data.choices[0].message.content.substring(0, 100));
    console.log('=== Chat AI Function Completed Successfully ===');

    return new Response(
      JSON.stringify(geminiResponse),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('=== FATAL ERROR in chat-ai function ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        type: error.constructor.name
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
