import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import { X, Sparkles, Send, Bot, User, Loader2, ArrowRight } from 'lucide-react';

export const AiCoachModal: React.FC = () => {
  const { isAIModalOpen, setIsAIModalOpen, themeColor, config, setSelectedPlanForModal } = useGym();
  const theme = themeStyles[themeColor];

  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Hello! I'm the AI Head Coach at ${config.name}. What are your fitness goals? Tell me about your training routine, target physique, or any questions about our gym plans and equipment!`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAIModalOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isLoading) return;

    const userMessage = promptInput.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setPromptInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/fitness-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: userMessage,
          specialNotes: `User asked in quick coach chat: "${userMessage}"`,
          gymPlans: config.plans.map((p) => p.name),
        }),
      });
      const data = await res.json();
      if (data.plan) {
        const reply = `**${data.plan.title}**\n\n🎯 **Recommended Tier:** ${data.plan.recommendedTier}\n\n🥗 **Nutrition Advice:** ${data.plan.nutritionAdvice}\n\n💡 **Coaching Tip:** ${data.plan.proTip}\n\nOur certified coach (${data.plan.trainerRecommendation}) can guide you through this split at the gym!`;
        setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      } else {
        throw new Error('No plan returned');
      }
    } catch (err) {
      // Fallback response
      const fallbackReply = `Great question! For "${userMessage}", we recommend combining 4 days of progressive overload strength training with 2 sessions of HIIT conditioning. The **${config.plans[1]?.name || 'Pro Athlete Plan'}** includes unlimited boutique classes and recovery saunas to optimize this journey.`;
      setMessages((prev) => [...prev, { role: 'assistant', text: fallbackReply }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="ai-coach-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => setIsAIModalOpen(false)}
    >
      <div
        className="relative max-w-2xl w-full bg-neutral-900 rounded-3xl border border-neutral-800 p-6 shadow-2xl flex flex-col h-[600px] max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center ${theme.accentText}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase text-white">
                Absolute AI Fitness Consultant
              </h3>
              <p className="text-xs text-neutral-400">
                Instant advice on splits, diet targets, and membership recommendations
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAIModalOpen(false)}
            className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs sm:text-sm ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className={`w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 ${theme.accentText}`}>
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-4 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? `${theme.accentBg} text-black font-medium`
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-200'
                }`}
              >
                {m.text}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 text-white">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-neutral-400">
              <div className={`w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center ${theme.accentText}`}>
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-neutral-950 border border-neutral-800 px-4 py-2.5 rounded-2xl">
                Analyzing your question & training parameters...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="pt-3 border-t border-neutral-800 flex gap-2">
          <input
            type="text"
            placeholder="Ask anything (e.g., 'Best plan for beginner wanting to lose 15 lbs')..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={isLoading || !promptInput.trim()}
            className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
              !promptInput.trim() || isLoading
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : `${theme.accentBg}`
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
