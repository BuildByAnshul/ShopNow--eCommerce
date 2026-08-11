import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User as UserIcon, Bot, RefreshCcw, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'model', content: "Hi! I'm ShopEase assistant. How can I help you today?" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingLimits, setRemainingLimits] = useState(null);
  
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const toggleRef = useRef(null);
  const navigate = useNavigate();

  // Maintain a persistent anonymous session ID
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('chatbot_session_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('chatbot_session_id', id);
    }
    return id;
  });

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        chatRef.current && 
        !chatRef.current.contains(e.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/chatbot/history?sessionId=${sessionId}`);
      if (res.data.messages && res.data.messages.length > 0) {
        setMessages(res.data.messages);
      }
      setRemainingLimits(res.data.remainingLimits);
    } catch (err) {
      console.error('Failed to load chat history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (remainingLimits !== null && remainingLimits <= 0) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `You have reached your daily limit of questions. Please ${isAuthenticated ? 'try again tomorrow' : 'log in for a higher limit'}.` 
      }]);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await api.post('/chatbot/ask', { message: userMessage, sessionId });
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: res.data.reply,
        products: res.data.products 
      }]);
      setRemainingLimits(res.data.remainingLimits);
    } catch (err) {
      let errorMsg = 'Sorry, something went wrong. Please try again.';
      if (err.response?.status === 429) {
        errorMsg = err.response.data.message;
        setRemainingLimits(0);
      } else if (err.response?.status === 503) {
        errorMsg = err.response.data.message; // "Chatbot service is currently unavailable (API Key missing)."
      }
      setMessages(prev => [...prev, { role: 'model', content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        ref={toggleRef}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-botanical-primary hover:bg-botanical-accent text-white rounded-full shadow-soft-lg flex items-center justify-center transition-transform hover:scale-110 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        ref={chatRef}
        className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-3xl shadow-soft-2xl border border-botanical-border flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} 
        style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}
      >
        
        {/* Header */}
        <div className="bg-botanical-primary p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-medium">ShopEase Assistant</h3>
              <p className="text-xs opacity-80 font-sans">
                {remainingLimits !== null ? `${remainingLimits} questions left today` : 'Connecting...'}
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-botanical-bg custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm font-sans leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-botanical-primary text-white rounded-br-none shadow-md' 
                  : 'bg-white border border-botanical-border text-botanical-text rounded-bl-none shadow-sm'
              }`}>
                {msg.content}
              </div>
              
              {/* Product Cards Rendering */}
              {msg.products && msg.products.length > 0 && (
                <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 pt-3 w-full max-w-[90%] snap-x">
                  {msg.products.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/products/${p.id}`);
                      }}
                      className="min-w-[140px] max-w-[140px] bg-white border border-botanical-border rounded-xl overflow-hidden cursor-pointer hover:border-botanical-primary hover:shadow-md transition-all snap-start flex flex-col group"
                    >
                      <div className="h-28 bg-botanical-surface relative overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-botanical-muted text-xs">No Image</div>
                        )}
                      </div>
                      <div className="p-2.5 flex flex-col flex-1 justify-between">
                        <h4 className="font-sans text-xs font-medium text-botanical-text line-clamp-2 leading-tight">{p.name}</h4>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-serif text-sm font-semibold text-botanical-primary">₹{p.price}</span>
                          <ChevronRight className="w-3 h-3 text-botanical-muted group-hover:text-botanical-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-botanical-border text-botanical-text rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-2">
                <RefreshCcw className="w-4 h-4 animate-spin text-botanical-primary" />
                <span className="text-sm font-sans">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-botanical-border">
          {remainingLimits === 0 && !isAuthenticated ? (
            <div className="text-center py-2">
              <p className="text-sm text-botanical-text mb-3 font-sans">You've reached your daily limit of 5 questions.</p>
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)} 
                className="inline-block bg-botanical-primary text-white text-sm font-medium py-2 px-6 rounded-full hover:bg-botanical-accent shadow-md transition-colors"
              >
                Login to Continue
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about our products..."
                  className="w-full bg-botanical-surface border border-botanical-border rounded-full py-3 pl-4 pr-12 text-sm font-sans focus:outline-none focus:border-botanical-primary focus:ring-1 focus:ring-botanical-primary transition-all text-botanical-text placeholder-botanical-muted"
                  disabled={loading || remainingLimits === 0}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading || remainingLimits === 0}
                  className="absolute right-2 w-8 h-8 flex items-center justify-center bg-botanical-primary text-white rounded-full hover:bg-botanical-accent transition-colors disabled:opacity-50 disabled:hover:bg-botanical-primary"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              {!isAuthenticated && (
                 <p className="text-center text-[10px] text-botanical-muted mt-2 font-sans">
                   Login to ask up to 50 questions per day.
                 </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Chatbot;
