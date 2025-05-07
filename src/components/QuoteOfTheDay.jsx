import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const FALLBACK_QUOTE = {
  text: "The best way to predict the future is to create it.",
  author: "Peter Drucker"
};

const QuoteOfTheDay = () => {
  const [quote, setQuote] = useState({ text: "Loading quote...", author: "" });
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('https://api.quotable.io/random?maxLength=100&tags=inspiration|motivation|life|wisdom');
        if (!response.ok) {
          throw new Error('Failed to fetch quote');
        }
        const data = await response.json();
        setQuote({ text: data.content, author: data.author });
        setError(false);
      } catch (error) {
        setQuote(FALLBACK_QUOTE);
        setError(true);
      }
    };
    fetchQuote();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="bg-slate-800/60 border-slate-700/40 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-gray-100 flex items-center">
            <Lightbulb className="w-6 h-6 mr-2 text-yellow-400" />
            Quote of the Day
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg italic text-gray-200">"{quote.text}"</p>
          {quote.author && <p className="text-sm text-purple-300 mt-2">- {quote.author}</p>}
          {error && (
            <p className="text-xs text-red-400 mt-2">Could not load a new quote. Showing a favorite instead!</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuoteOfTheDay;
  