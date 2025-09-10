
'use client';
import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useQuickAction } from '@/contexts/quick-action-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUp, Bot, Loader2, Sparkles, User } from 'lucide-react';
import { getInsights } from '@/ai/flows/insights-flow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useUser } from '@/contexts/user-context';
import { Separator } from './ui/separator';
import type { MessagePart } from 'genkit';


interface Message {
    role: 'user' | 'model';
    content: MessagePart[];
}

export function InsightsPanel() {
    const { isInsightsPanelOpen, closeInsightsPanel } = useQuickAction();
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [input, setInput] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const { user } = useUser();
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages: Message[] = [...messages, { role: 'user', content: [{text: input}] }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const aiResponse = await getInsights(newMessages, input);
            setMessages(prev => [...prev, { role: 'model', content: [{text: aiResponse}] }]);
        } catch (error) {
            console.error("Error getting insights:", error);
            setMessages(prev => [...prev, { role: 'model', content: [{text: "Sorry, I encountered an error. Please try again."}] }]);
        } finally {
            setLoading(false);
        }
    };
    
    React.useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);
    
    const getInitials = (email: string) => {
        if (!email) return 'U';
        return email[0].toUpperCase();
    }

    return (
        <Sheet open={isInsightsPanelOpen} onOpenChange={closeInsightsPanel}>
            <SheetContent className="w-[500px] sm:max-w-none flex flex-col p-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span>Ask Insights360</span>
                    </SheetTitle>
                    <SheetDescription>Ask Insights360 questions about your engagements, tasks, and more...</SheetDescription>
                </SheetHeader>
                <div className="p-4 border-b">
                    <div className="relative">
                        <Input
                            placeholder="e.g., How many tasks are due this week?"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={loading}
                        />
                        <Button
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                        >
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                   <ScrollArea className="h-full" ref={scrollAreaRef}>
                        <div className="p-6 space-y-6">
                            {messages.map((message, index) => (
                                <div key={index} className={cn("flex items-start gap-3", message.role === 'user' && 'justify-end')}>
                                    {message.role === 'model' && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn(
                                        "max-w-[80%] p-3 rounded-lg prose dark:prose-invert prose-sm",
                                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                    )}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content[0].text}</ReactMarkdown>
                                    </div>
                                    {message.role === 'user' && user && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{getInitials(user.email || '')}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                                    </Avatar>
                                    <div className="max-w-[80%] p-3 rounded-lg bg-muted flex items-center">
                                       <Loader2 className="h-5 w-5 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>
                   </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    );
}
