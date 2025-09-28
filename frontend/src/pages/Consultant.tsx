import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Consultant() {
  const [prompt, setPrompt] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Use the environment variable for the API URL, with a fallback for local dev
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');
    setRecommendation('');

    try {
      const response = await fetch(`${API_URL}/api/consultant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || `API Error: ${response.statusText}`);
      }

      const data = await response.json();
      setRecommendation(data.recommendation);

    } catch (err: any) {
      setError(err.message || 'Sorry, something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Project Consultant</title>
        <meta name="description" content="Get a personalized stack of AI tools recommended for your project idea." />
        <link rel="canonical" href="/consultant" />
      </Helmet>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <section className="rounded-xl bg-gradient-primary glow p-6 text-center">
          <h1 className="text-3xl font-semibold">AI Project Consultant</h1>
          <p className="text-muted-foreground mt-2">Describe your project, and get a personalized AI tool stack recommendation.</p>
        </section>

        <section className="glass rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'I want to build an app that creates a short video from a blog post...'"
              className="min-h-[100px] bg-background/50"
              disabled={isLoading}
            />
            <div className="flex justify-end">
              <Button type="submit" variant="neon" disabled={isLoading || !prompt.trim()}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Get Recommendation
              </Button>
            </div>
          </form>
        </section>

        {(isLoading || error || recommendation) && (
          <section className="glass rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="text-neon" />
              AI Recommendation
            </h2>
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <Loader2 className="h-5 w-5 animate-spin" />
                Consulting the database and generating a response...
              </div>
            )}
            {error && <p className="text-red-400">{error}</p>}
            {recommendation && (
              // --- THIS IS THE FIX ---
              // The `prose` class from Tailwind Typography applies nice default
              // styling to markdown content (like dark text for light backgrounds).
              // We've removed `prose-invert` which was forcing the text to be white.
              <div className="prose max-w-none text-foreground">
                <ReactMarkdown>{recommendation}</ReactMarkdown>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}

