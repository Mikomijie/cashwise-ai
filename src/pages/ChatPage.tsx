import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { createConversation, createMessage, getMessages, getUserProfile, getLatestConversation } from '@/db/api';
import type { ChatMessage, GeminiContent, UserProfile } from '@/types';

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateWelcomeMessage = (profile: UserProfile | null, userName?: string): string => {
    const name = profile?.name || userName;
    
    // If we have a name, use it in the greeting
    if (name) {
      return `Hello ${name}! 👋 I'm your AI financial coach. I'm here to help you manage your money, plan for your future, and achieve your financial goals. What would you like to talk about today?`;
    }
    
    // If no name provided, use default greeting
    return `Hello! 👋 I'm your AI financial coach. I'm here to help you manage your money, plan for your future, and achieve your financial goals. What would you like to talk about today?`;
  };

  const initializeConversation = async () => {
    const state = location.state as { 
      userProfileId?: string; 
      userName?: string;
      conversationId?: string;
      isNew?: boolean;
    } | null;
    let profile: UserProfile | null = null;

    // Load user profile if provided in state
    if (state?.userProfileId) {
      profile = await getUserProfile(state.userProfileId);
      setUserProfile(profile);
    } else {
      // Try to load the latest user profile from database
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (profiles && profiles.length > 0) {
        profile = profiles[0];
        setUserProfile(profile);
      }
    }

    let conversation: any = null;

    // If conversationId is provided in state, load that specific conversation
    if (state?.conversationId) {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', state.conversationId)
        .maybeSingle();
      
      conversation = data;
    } else {
      // Try to load existing conversation first
      conversation = await getLatestConversation(profile?.id);

      // If no existing conversation, create a new one
      if (!conversation) {
        conversation = await createConversation(
          'Financial Coaching Session',
          profile?.id || state?.userProfileId
        );
      }
    }

    if (conversation) {
      setConversationId(conversation.id);
      
      // Load existing messages if any
      const existingMessages = await getMessages(conversation.id);
      if (existingMessages.length > 0) {
        setMessages(existingMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })));
      } else {
        // Add personalized welcome message only for new conversations
        const welcomeMessage: ChatMessage = {
          role: 'model',
          content: generateWelcomeMessage(profile, state?.userName)
        };
        setMessages([welcomeMessage]);
        
        // Save welcome message to database
        await createMessage(conversation.id, 'model', welcomeMessage.content);
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!conversationId) return;

    const userMessage: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingMessage('');

    // Save user message to database
    await createMessage(conversationId, 'user', content);

    try {
      // Prepare conversation history for API
      const contents: GeminiContent[] = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // Add current user message
      contents.push({
        role: 'user',
        parts: [{ text: content }]
      });

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Prepare request body with user context
      const requestBody: {
        contents: GeminiContent[];
        userName?: string;
        userGoals?: string;
      } = { contents };

      if (userProfile) {
        requestBody.userName = userProfile.name;
        if (userProfile.financial_goal) {
          const goalLabels: Record<string, string> = {
            save_more: 'saving more money',
            get_out_debt: 'getting out of debt',
            start_business: 'starting a business',
            understand_money: 'understanding money better',
          };
          requestBody.userGoals = goalLabels[userProfile.financial_goal] || userProfile.financial_goal;
        }
      }

      console.log('Sending request to Edge Function:', { url: `${supabaseUrl}/functions/v1/chat-ai` });

      // Call Edge Function (non-streaming)
      const response = await fetch(
        `${supabaseUrl}/functions/v1/chat-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify(requestBody)
        }
      );

      console.log('Edge Function response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Edge function error:', errorData);
        
        let errorMessage = "I apologize, but I'm having trouble connecting to the AI service.";
        
        if (errorData.message) {
          errorMessage = `Error: ${errorData.message}`;
        } else if (errorData.details) {
          errorMessage = `AI service error: ${errorData.details}`;
        }
        
        throw new Error(errorMessage);
      }

      // Parse JSON response (non-streaming)
      const data = await response.json();
      console.log('Received data from Edge Function:', data);
      
      const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiContent) {
        const aiMessage: ChatMessage = { role: 'model', content: aiContent };
        setMessages(prev => [...prev, aiMessage]);
        await createMessage(conversationId, 'model', aiContent);
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        content: error instanceof Error ? error.message : "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold md:text-xl">AI Coach</h1>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <MessageBubble key={index} role={message.role} content={message.content} />
            ))}

            {/* Streaming Message */}
            {streamingMessage && (
              <MessageBubble role="model" content={streamingMessage} />
            )}

            {/* Loading Indicator */}
            {isLoading && !streamingMessage && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48 bg-muted" />
                  <Skeleton className="h-4 w-36 bg-muted" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-4xl px-4 py-4 pb-20 md:pb-4">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
