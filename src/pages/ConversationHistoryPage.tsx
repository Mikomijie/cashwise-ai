import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ArrowLeft, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { getConversations, getMessages, deleteConversation, createConversation, getLatestUserProfile } from '@/db/api';
import type { Conversation, Message } from '@/types';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';

interface ConversationWithPreview extends Conversation {
  preview: string;
  messageCount: number;
}

export default function ConversationHistoryPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationWithPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    const convos = await getConversations(100);
    
    // Load preview for each conversation
    const convosWithPreviews = await Promise.all(
      convos.map(async (convo) => {
        const messages = await getMessages(convo.id);
        const firstUserMessage = messages.find(m => m.role === 'user');
        const preview = firstUserMessage 
          ? firstUserMessage.content.slice(0, 80) + (firstUserMessage.content.length > 80 ? '...' : '')
          : 'No messages yet';
        
        return {
          ...convo,
          preview,
          messageCount: messages.length
        };
      })
    );

    setConversations(convosWithPreviews);
    setIsLoading(false);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    setDeletingId(id);
    const success = await deleteConversation(id);
    
    if (success) {
      setConversations(prev => prev.filter(c => c.id !== id));
    }
    
    setDeletingId(null);
  };

  const handleNewConversation = async () => {
    const profile = await getLatestUserProfile();
    const newConvo = await createConversation('New Conversation', profile?.id);
    
    if (newConvo) {
      navigate('/chat', { state: { conversationId: newConvo.id, isNew: true } });
    }
  };

  const handleOpenConversation = (conversationId: string) => {
    navigate('/chat', { state: { conversationId } });
  };

  const groupConversationsByDate = () => {
    const groups: {
      today: ConversationWithPreview[];
      yesterday: ConversationWithPreview[];
      thisWeek: ConversationWithPreview[];
      older: ConversationWithPreview[];
    } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    conversations.forEach(convo => {
      const date = parseISO(convo.updated_at);
      
      if (isToday(date)) {
        groups.today.push(convo);
      } else if (isYesterday(date)) {
        groups.yesterday.push(convo);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(convo);
      } else {
        groups.older.push(convo);
      }
    });

    return groups;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = parseISO(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE');
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  const renderConversationGroup = (title: string, convos: ConversationWithPreview[]) => {
    if (convos.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{title}</h2>
        <div className="space-y-2">
          {convos.map((convo) => (
            <Card
              key={convo.id}
              className="cursor-pointer border-2 transition-colors hover:border-primary hover:bg-muted/50"
              onClick={() => handleOpenConversation(convo.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(convo.updated_at)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({convo.messageCount} messages)
                      </span>
                    </div>
                    <p className="truncate text-sm font-medium">{convo.preview}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteConversation(convo.id, e)}
                    disabled={deletingId === convo.id}
                    className="shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background">
          <div className="container mx-auto flex h-16 items-center gap-4 px-4">
            <Skeleton className="h-10 w-10 bg-muted" />
            <Skeleton className="h-6 w-48 bg-muted" />
          </div>
        </header>
        <main className="container mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="mb-6 h-12 w-full bg-muted" />
          <Skeleton className="mb-4 h-32 w-full bg-muted" />
          <Skeleton className="mb-4 h-32 w-full bg-muted" />
          <Skeleton className="h-32 w-full bg-muted" />
        </main>
      </div>
    );
  }

  const groups = groupConversationsByDate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold md:text-xl">Conversation History</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8 pb-24 md:pb-8">
        {/* New Conversation Button */}
        <Button onClick={handleNewConversation} className="mb-6 w-full" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Start New Conversation
        </Button>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-semibold">No conversations yet</p>
              <p className="text-sm text-muted-foreground">
                Start a new conversation to chat with your AI financial coach! 💬
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {renderConversationGroup('Today', groups.today)}
            {renderConversationGroup('Yesterday', groups.yesterday)}
            {renderConversationGroup('This Week', groups.thisWeek)}
            {renderConversationGroup('Older', groups.older)}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
