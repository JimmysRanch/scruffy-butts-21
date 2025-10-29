import { useEffect, useState } from 'react';

export function SupabaseCheck() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupabase = () => {
      try {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!url) {
          setError('Missing VITE_SUPABASE_URL environment variable');
          setStatus('error');
          return;
        }

        if (!anonKey) {
          setError('Missing VITE_SUPABASE_ANON_KEY environment variable');
          setStatus('error');
          return;
        }

        // Environment variables are present
        setStatus('ok');

        // Optional: Add a sample query test here in the future
        // Example:
        // import { supabase } from '@/lib/supabase';
        // const { error } = await supabase.from('test_table').select('*').limit(1);
        // if (error) {
        //   setError(`Supabase connection test failed: ${error.message}`);
        //   setStatus('error');
        // }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus('error');
      }
    };

    checkSupabase();
  }, []);

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 bg-card/80 backdrop-blur-md border border-border rounded-lg px-4 py-2 shadow-lg">
        <p className="text-sm text-muted-foreground">Checking Supabase connection...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-destructive/10 backdrop-blur-md border border-destructive rounded-lg px-4 py-2 shadow-lg max-w-md">
        <p className="text-sm font-semibold text-destructive mb-1">Supabase Configuration Error</p>
        <p className="text-xs text-destructive/80">{error}</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-lg px-4 py-2 shadow-lg">
      <p className="text-sm text-primary font-medium">✓ Supabase OK</p>
    </div>
  );
}
