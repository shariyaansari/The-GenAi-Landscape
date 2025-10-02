import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Loader2, History, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Conversation } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Consultant() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const [prompt, setPrompt] = useState('');
  // Simplified state: we only need to manage the history array.
  const [history, setHistory] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Use import.meta.env for Vite environment variables
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/consultant/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data: Conversation[] = await response.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    fetchHistory();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !token) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/consultant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Something went wrong');
      }

      const data = await response.json();
      const newRecommendation = data.recommendation;
      
      const newConversation: Conversation = {
        prompt,
        recommendation: newRecommendation,
        timestamp: new Date().toISOString()
      };
      // Add the new conversation to the top of the history list.
      // The UI will now react to this single state update.
      setHistory(prevHistory => [newConversation, ...prevHistory]);
      setPrompt('');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // The latest recommendation is now simply the first item in the history array.
  const latestRecommendation = history[0];

  return (
    <>
      <Helmet>
        <title>AI Project Consultant</title>
        <meta name="description" content="Get a personalized stack of AI tools for your project." />
        <link rel="canonical" href="/consultant" />
      </Helmet>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="rounded-xl bg-gradient-primary glow p-6 text-center">
          <h1 className="text-3xl font-semibold">AI Project Consultant</h1>
          <p className="text-muted-foreground mt-2">Describe your project and get an instant AI tool stack recommendation.</p>
        </section>

        <section className="glass rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'An app that summarizes long technical articles and creates a short audio version...'"
              className="min-h-[120px] bg-background/50 text-base"
              disabled={isLoading}
            />
            <div className="flex justify-end">
              <Button type="submit" variant="neon" disabled={isLoading || !prompt.trim()}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Get Recommendation
              </Button>
            </div>
          </form>
        </section>
        
        {isLoading && (
            <div className="text-center text-muted-foreground animate-pulse">
                Consulting the database and generating a response...
            </div>
        )}
        {error && <p className="text-center text-red-400">{error}</p>}
        
        {/* Display the latest response if it exists */}
        {!isLoading && latestRecommendation && (
            <section className="glass rounded-xl p-6">
                 <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                    <Sparkles className="text-neon" />
                    Latest AI Recommendation
                </h2>
                <div className="prose max-w-none text-foreground">
                    <ReactMarkdown>{latestRecommendation.recommendation}</ReactMarkdown>
                </div>
            </section>
        )}

        {/* --- Collapsible History Section --- */}
        {history.length > 0 && (
          <section className="space-y-4 pt-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <History className="text-neon" />
                Your Recent Conversations
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className="text-muted-foreground">
                {showHistory ? 'Hide' : 'Show'}
                {showHistory ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
              </Button>
            </div>
            
            {showHistory && (
              <div className="space-y-6 pt-4">
                {history.map((conv, index) => (
                  <div key={index} className="glass rounded-xl p-4 animate-in fade-in-50">
                    <p className="font-semibold text-muted-foreground">You asked:</p>
                    <p className="mb-2 italic">"{conv.prompt}"</p>
                    <hr className="border-white/10 my-3" />
                    <p className="font-semibold text-muted-foreground">AI Recommended:</p>
                    <div className="prose max-w-none text-foreground">
                      <ReactMarkdown>{conv.recommendation}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}

