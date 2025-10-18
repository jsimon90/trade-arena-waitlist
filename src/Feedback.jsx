import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, X } from 'lucide-react';
import { supabase } from './lib/supabase';

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT;

export default function Feedback({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if Supabase is properly configured
      const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
        import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

      if (isSupabaseConfigured) {
        // Save to Supabase
        const { error } = await supabase
          .from('feedback')
          .insert({ email, message, rating });

        if (error) throw error;
      }

      // Notify Formspree (optional)
      try {
        await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email, message, rating, source: 'feedback' }),
        });
      } catch {
        // non-fatal: even if Formspree fails, we already saved in Supabase
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              <h3 className="text-xl font-semibold text-white">Share Feedback</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="your@email.com (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              <div>
                <textarea
                  placeholder="Tell us what you want, bugs, or ideas..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-lg px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full rounded-lg px-4 py-3 bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
                >
                  {[5, 4, 3, 2, 1].map(n => (
                    <option key={n} value={n} className="bg-slate-800">
                      {n} / 5 {n === 5 ? '⭐' : n >= 4 ? '👍' : n >= 3 ? '😐' : n >= 2 ? '👎' : '😞'}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Star className="w-4 h-4" />
                    Send Feedback
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Thanks for the feedback!</h3>
            <p className="text-gray-300 mb-4">
              Your input helps us build a better trading platform.
            </p>
            <button
              onClick={onClose}
              className="text-sky-400 hover:text-sky-300 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
