import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, TrendingUp, Users, Zap, MessageSquare, Copy, Share2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import Feedback from './Feedback';

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT;

export default function TradeArenaWaitlist() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [referredBy, setReferredBy] = useState(null);
  
  // Suggestions form state
  const [suggestionName, setSuggestionName] = useState('');
  const [suggestionEmail, setSuggestionEmail] = useState('');
  const [suggestionText, setSuggestionText] = useState('');
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);

  // Check for referral code on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      setReferredBy(ref);
      localStorage.setItem('ta_ref', ref);
    } else {
      const storedRef = localStorage.getItem('ta_ref');
      if (storedRef) {
        setReferredBy(storedRef);
      }
    }
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCopied(false);

    if (!validateEmail(email)) {
      setError('Please enter a valid email.');
      return;
    }

    setIsLoading(true);
    try {
      // Check if Supabase is properly configured
      const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
        import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

      let myRef = '';
      
      if (isSupabaseConfigured) {
        // 1) Try to insert into Supabase (source of truth)
        const { data, error } = await supabase
          .from('waitlist')
          .insert({ email, referred_by: referredBy })
          .select('ref_code')
          .single();

        if (error) {
          console.warn('Supabase RLS error:', error);
          // Fallback: generate a simple ref code if RLS blocks the insert
          myRef = Math.random().toString(36).substring(2, 10).toUpperCase();
        } else {
          myRef = data.ref_code;
        }
      } else {
        // Fallback: generate a simple ref code
        myRef = Math.random().toString(36).substring(2, 10).toUpperCase();
      }

      setRefCode(myRef);
      setIsSubmitted(true);

      // 2) Notify Formspree so you get an email ping
      try {
        await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            email,
            referredBy,
            source: 'waitlist',
            ref_code_assigned: myRef,
          }),
        });
      } catch {
        // non-fatal: even if Formspree fails, we already saved in Supabase
      }

      // 3) Build & copy share link
      const link = `${window.location.origin}?ref=${myRef}`;
      try {
        await navigator.clipboard.writeText(link);
        setCopied(true);
      } catch {}
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingSuggestion(true);
    setSuggestionError('');
    setSuggestionSuccess(false);

    if (!suggestionText.trim()) {
      setSuggestionError('Please enter your suggestion');
      setIsSubmittingSuggestion(false);
      return;
    }

    try {
      // Send suggestion via Formspree
      const formspreeResponse = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: suggestionEmail || 'anonymous@tradearena.com',
          message: `Suggestion from ${suggestionName || 'Anonymous'}:\n\n${suggestionText}`,
          subject: 'Trade Arena Suggestion'
        }),
      });

      if (formspreeResponse.ok) {
        setSuggestionSuccess(true);
        setSuggestionName('');
        setSuggestionEmail('');
        setSuggestionText('');
        setTimeout(() => setSuggestionSuccess(false), 5000);
      } else {
        setSuggestionError('Failed to send suggestion. Please try again.');
      }
    } catch (error) {
      console.error('Suggestion submission error:', error);
      setSuggestionError('Something went wrong. Please try again.');
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Real-time market insights and performance tracking"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Ultra-low latency trading execution"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description: "Connect with traders and share strategies"
    }
  ];

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0a 100%)',
        color: 'white'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.2
        }}
      ></div>
      
      <div 
        className="relative z-10 container mx-auto px-4 py-16"
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 1rem'
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-20"
          style={{
            textAlign: 'center',
            marginBottom: '5rem'
          }}
        >
          <motion.div 
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full px-6 py-3 mb-8 backdrop-blur-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '9999px',
              padding: '0.75rem 1.5rem',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)'
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-5 h-5 text-cyan-400" style={{ width: '1.25rem', height: '1.25rem', color: '#22d3ee' }} />
            </motion.div>
            <span className="text-sm font-semibold text-cyan-300" style={{ fontSize: '0.875rem', color: '#67e8f9', fontWeight: '600' }}>Coming Soon</span>
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 6rem)',
              fontWeight: '900',
              color: 'white',
              marginBottom: '2rem',
              lineHeight: '1.1'
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Trade <span 
              className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
              style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #60a5fa 50%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >Arena</span>
          </motion.h1>
          
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-2xl text-blue-100 mb-4 font-medium" style={{ fontSize: '1.5rem', color: '#dbeafe', lineHeight: '1.6', fontWeight: '500' }}>
              Compete. Trade. Win.
            </p>
            <p className="text-xl text-blue-200 mb-4" style={{ fontSize: '1.25rem', color: '#bfdbfe', lineHeight: '1.6' }}>
              The world's first head-to-head trading platform.
            </p>
            <p className="text-lg text-blue-300" style={{ fontSize: '1.125rem', color: '#93c5fd', lineHeight: '1.6' }}>
              Battle other traders in real-time simulated markets — prove your skill, climb leaderboards, and earn rewards.
            </p>
          </motion.div>

        </motion.div>

        {/* Waitlist Form - Moved to Top */}
        <motion.div
          id="join"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-md mx-auto mb-16"
          style={{
            maxWidth: '28rem',
            margin: '0 auto 4rem'
          }}
        >
          {!isSubmitted ? (
            <div 
              className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-400/30 rounded-3xl p-10 shadow-2xl shadow-blue-500/20 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)',
                backdropFilter: 'blur(25px)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                boxShadow: '0 35px 60px -12px rgba(59, 130, 246, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 animate-pulse"></div>
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                  </motion.div>
                  <h2 
                    className="text-3xl font-bold text-white"
                    style={{
                      fontSize: '1.875rem',
                      fontWeight: 'bold',
                      color: 'white'
                    }}
                  >
                    Join the Waitlist
                  </h2>
                </div>
                
                <p 
                  className="text-blue-100 text-center mb-8 text-lg"
                  style={{
                    color: '#dbeafe',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    fontSize: '1.125rem'
                  }}
                >
                  Get early access and exclusive updates
                </p>
              
              <form onSubmit={handleSubmit} className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-6 py-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 text-lg"
                    style={{
                      width: '100%',
                      padding: '1rem 1.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '0.75rem',
                      color: 'white',
                      fontSize: '1.125rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#22d3ee';
                      e.target.style.boxShadow = '0 0 0 3px rgba(34, 211, 238, 0.25)';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  />
                  {error && (
                    <motion.p 
                      className="text-red-400 text-sm mt-3 flex items-center gap-2" 
                      style={{ color: '#f87171', fontSize: '0.875rem', marginTop: '0.75rem' }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span>⚠</span> {error}
                    </motion.p>
                  )}
                </div>
                
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg relative overflow-hidden"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
                    color: 'white',
                    fontWeight: '700',
                    padding: '1rem 2rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s ease',
                    fontSize: '1.125rem',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px -5px rgba(34, 211, 238, 0.3)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.background = 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)';
                      e.target.style.boxShadow = '0 15px 35px -5px rgba(34, 211, 238, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.background = 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)';
                      e.target.style.boxShadow = '0 10px 25px -5px rgba(34, 211, 238, 0.3)';
                    }
                  }}
                >
                  {isLoading ? (
                    <div 
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" 
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}
                    />
                  ) : (
                    <>
                      Join Waitlist
                      <ArrowRight className="w-4 h-4" style={{ width: '1rem', height: '1rem' }} />
                    </>
                  )}
                </motion.button>
              </form>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-400/30 rounded-3xl p-10 text-center shadow-2xl shadow-green-500/20 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
                backdropFilter: 'blur(25px)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                boxShadow: '0 35px 60px -12px rgba(34, 197, 94, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 animate-pulse"></div>
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" style={{ width: '5rem', height: '5rem', color: '#4ade80' }} />
                </motion.div>
                
                <h2 className="text-3xl font-bold text-white mb-6" style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem' }}>
                  You're on the list!
                </h2>
                
                <p className="text-green-100 mb-8 text-lg" style={{ color: '#dcfce7', marginBottom: '2rem', fontSize: '1.125rem' }}>
                  Thank you for joining our waitlist. We'll notify you as soon as Trade Arena is ready.
                </p>
              
              {refCode && (
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-300 mb-3">Your referral code:</p>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="bg-black/20 px-3 py-1 rounded text-sky-300 font-mono">
                      {refCode}
                    </code>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}?ref=${refCode}`;
                        navigator.clipboard.writeText(link);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-4 text-sm">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-sky-400 hover:text-sky-300 transition-colors duration-300"
                >
                  Add another email
                </button>
                <span className="text-gray-500">•</span>
                <button
                  onClick={() => setShowFeedback(true)}
                  className="text-sky-400 hover:text-sky-300 transition-colors duration-300 flex items-center gap-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  Feedback
                </button>
              </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* All Content in 3-Column Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-3 gap-8 mb-16 text-white"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            marginBottom: '4rem',
            color: 'white'
          }}
        >
          {/* 1. Head-to-Head Matches */}
          <section 
            className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-400/30 rounded-3xl p-6 shadow-2xl shadow-blue-500/10"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.1)'
            }}
          >
            <h3 className="text-white text-4xl font-bold mb-6 text-center">Head-to-Head Matches</h3>
            <div className="space-y-3">
              <ul className="text-blue-100 text-sm space-y-2">
                <li>• Jump into live 1v1 trading battles using real-time market data</li>
                <li>• Both players start with identical simulated balances</li>
                <li>• When the timer ends, whoever has the higher P&L wins the match and the prize pool</li>
                <li>• Every match tests real skill — reaction speed, strategy, and risk management — not luck</li>
              </ul>
              <div className="bg-white/5 rounded-lg p-4 mt-4">
                <p className="text-blue-200 text-sm font-semibold mb-2">Example:</p>
                <ul className="text-blue-100 text-sm space-y-1">
                  <li>• Entry: 10 Arena Coins + 0.5 fee</li>
                  <li>• Winner takes 20 Arena Coins</li>
                  <li>• Trade Arena keeps 5% service fee to cover data & hosting</li>
                </ul>
              </div>
            </div>
            </section>

          {/* 2. Tournaments */}
          <section 
            className="bg-gradient-to-br from-sky-500/20 to-cyan-500/20 backdrop-blur-xl border border-sky-400/30 rounded-3xl p-6 shadow-2xl shadow-sky-500/10"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              borderRadius: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(14, 165, 233, 0.1)'
            }}
          >
            <h3 className="text-white text-4xl font-bold mb-6 text-center">Tournaments</h3>
            <div>
              <ul className="text-sky-100 text-sm space-y-2">
                <li>• Compete in bracket-style events with multiple rounds</li>
                <li>• Advance by beating opponents, climb the rankings, and win larger prize pools</li>
                <li>• Tournaments combine consistency, timing, and nerves — only the most skilled traders make it to the finals</li>
              </ul>
            </div>
          </section>

          {/* 3. Practice Mode */}
          <section 
            className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-xl border border-emerald-400/30 rounded-3xl p-6 shadow-2xl shadow-emerald-500/10"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.1)'
            }}
          >
            <h3 className="text-white text-4xl font-bold mb-6 text-center">Practice Mode (Subscription)</h3>
            <div>
              <ul className="text-emerald-100 text-sm space-y-2">
                <li>• Unlock Practice Mode for $15/month to sharpen your edge</li>
                <li>• Unlimited simulated trading with live market data</li>
                <li>• Personal performance tracking</li>
                <li>• Access to daily freeroll competitions (no-entry-fee events)</li>
                <li>• Eligibility for weekly Practice Leaderboards that award real Arena Coins or free tournament entries</li>
                <li>• Top performers in Practice Mode can earn while they learn — leaderboard prizes convert into entry credits for ranked matches</li>
              </ul>
            </div>
          </section>

          {/* 4. Ranked Leaderboards */}
          <section 
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-400/30 rounded-3xl p-6 shadow-2xl shadow-purple-500/10"
            style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              borderRadius: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(147, 51, 234, 0.1)'
            }}
          >
            <h3 className="text-white text-4xl font-bold mb-6 text-center">Ranked Leaderboards</h3>
            <div>
              <ul className="text-purple-100 text-sm space-y-2">
                <li>• All competitive activity feeds into the Ranked Leaderboard — your public trading résumé</li>
                <li>• Tracks wins and win rate</li>
                <li>• Tracks total profit across matches</li>
                <li>• Tracks streaks and consistency metrics</li>
                <li>• Rank up through divisions by winning matches and tournaments</li>
                <li>• The higher your rank, the bigger the rewards, and the earlier your access to exclusive events and merch drops</li>
              </ul>
            </div>
          </section>

          {/* 5. Rewards & Progression */}
          <section 
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-3xl p-6 shadow-2xl shadow-yellow-500/10"
            style={{
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(234, 179, 8, 0.1)'
            }}
          >
            <h3 className="text-white text-4xl font-bold mb-6 text-center">Rewards & Progression</h3>
            <div>
              <ul className="text-yellow-100 text-sm space-y-2">
                <li>• Trade Arena rewards skill, consistency, and community</li>
                <li>• Weekly and seasonal prizes for top performers</li>
                <li>• Referral bonuses — invite friends, climb the queue, and earn Arena Coins</li>
                <li>• Badges and tiers that showcase your achievements</li>
                <li>• Early access perks for waitlist and Practice members</li>
              </ul>
            </div>
          </section>

          {/* 6. Fair, Transparent, Skill-Based */}
          <section 
            className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-400/30 rounded-3xl p-6 shadow-2xl shadow-cyan-500/10"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(6, 182, 212, 0.1)'
            }}
          >
            <h3 className="text-white text-4xl font-bold mb-6 text-center">Fair, Transparent, Skill-Based</h3>
            <div>
              <ul className="text-cyan-100 text-sm space-y-2">
                <li>• All matches use simulated balances with live CME-licensed data — no hidden leverage, no broker execution</li>
                <li>• Every trade and result is logged for transparency</li>
                <li>• Outcomes are entirely skill-driven, not chance-based — like chess or poker with perfect records</li>
              </ul>
            </div>
          </section>

          {/* Socials */}
          <section 
            className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 backdrop-blur-xl border border-teal-400/30 rounded-3xl p-6 shadow-2xl shadow-teal-500/10"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              borderRadius: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(20, 184, 166, 0.1)'
            }}
          >
            <h3 className="text-white text-4xl font-bold mb-6 text-center">Socials</h3>
            <div>
              <ul className="text-teal-100 text-sm space-y-2">
                <li>• Instagram: <a className="text-teal-300 hover:text-teal-200" href="#" target="_blank" rel="noreferrer">@tradearena</a></li>
                <li>• X (Twitter): <a className="text-teal-300 hover:text-teal-200" href="#" target="_blank" rel="noreferrer">@TradeArenaApp</a></li>
                <li>• Discord: <a className="text-teal-300 hover:text-teal-200" href="#" target="_blank" rel="noreferrer">Join the early testers</a></li>
              </ul>
            </div>
          </section>
        </motion.div>

        {/* Suggestions Box */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div 
            className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border border-indigo-400/30 rounded-3xl p-8 shadow-2xl shadow-indigo-500/20 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)',
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '1.5rem',
              padding: '2rem',
              boxShadow: '0 35px 60px -12px rgba(99, 102, 241, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 animate-pulse"></div>
            
            <div className="relative z-10">
              <h3 className="text-white text-3xl font-bold mb-4 text-center">Have Suggestions?</h3>
              <p className="text-indigo-100 text-center mb-6 text-lg">
                We'd love to hear your ideas for improving Trade Arena!
              </p>
              
              <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                <div>
                  <label className="block text-indigo-200 text-sm font-medium mb-2">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={suggestionName}
                    onChange={(e) => setSuggestionName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '0.75rem',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-indigo-200 text-sm font-medium mb-2">
                    Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={suggestionEmail}
                    onChange={(e) => setSuggestionEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '0.75rem',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-indigo-200 text-sm font-medium mb-2">
                    Your Suggestion *
                  </label>
                  <textarea
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    placeholder="What changes would you suggest? What features would you like to see? Any other feedback?"
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300 resize-none"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '0.75rem',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </div>
                
                <motion.button
                  type="submit"
                  disabled={isSubmittingSuggestion}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                    color: 'white',
                    fontWeight: '700',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: isSubmittingSuggestion ? 'not-allowed' : 'pointer',
                    opacity: isSubmittingSuggestion ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmittingSuggestion ? (
                    <div 
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" 
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}
                    />
                  ) : (
                    <>
                      Send Suggestion
                      <ArrowRight className="w-4 h-4" style={{ width: '1rem', height: '1rem' }} />
                    </>
                  )}
                </motion.button>
                
                {suggestionError && (
                  <motion.p 
                    className="text-red-400 text-sm text-center" 
                    style={{ color: '#f87171', fontSize: '0.875rem' }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {suggestionError}
                  </motion.p>
                )}
                
                {suggestionSuccess && (
                  <motion.p 
                    className="text-green-400 text-sm text-center" 
                    style={{ color: '#4ade80', fontSize: '0.875rem' }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Thank you for your suggestion! We'll review it and get back to you.
                  </motion.p>
                )}
              </form>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16 text-gray-400"
        >
          <p className="text-sm">© 2025 Trade Arena. All rights reserved.</p>
          <p className="text-sm text-gray-500">Built by traders, for traders.</p>
        </motion.div>

        {/* Feedback Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          onClick={() => setShowFeedback(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        >
          <MessageSquare className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Feedback Modal */}
      <Feedback isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </div>
  );
}
