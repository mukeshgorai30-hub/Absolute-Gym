import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import {
  Sparkles,
  Dumbbell,
  Calendar,
  CheckCircle,
  Trophy,
  Loader2,
  ArrowRight,
  Flame,
  UserCheck,
} from 'lucide-react';

interface GeneratedPlan {
  title: string;
  recommendedTier: string;
  weeklySplit: Array<{
    day: string;
    focus: string;
    exercises: string[];
  }>;
  nutritionAdvice: string;
  trainerRecommendation: string;
  proTip: string;
}

export const AiFitnessAdvisorSection: React.FC = () => {
  const { config, themeColor, setSelectedPlanForModal, setIsTrialModalOpen } = useGym();
  const theme = themeStyles[themeColor];

  const [goal, setGoal] = useState('Hypertrophy & Muscle Gain');
  const [fitnessLevel, setFitnessLevel] = useState('Intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState('4 Days / Week');
  const [age, setAge] = useState('28');
  const [notes, setNotes] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/fitness-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          fitnessLevel,
          daysPerWeek,
          age,
          specialNotes: notes,
          gymPlans: config.plans.map((p) => p.name),
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setGeneratedPlan(data.plan);
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (err: any) {
      console.warn('AI API error, fallback to smart generation:', err);
      // Smart instant fallback
      setGeneratedPlan({
        title: `${config.name || 'Absolute'} ${goal} High-Performance Protocol`,
        recommendedTier: config.plans[1]?.name || 'Pro Athlete Plan',
        weeklySplit: [
          {
            day: 'Day 1 (Mon)',
            focus: 'Heavy Upper Body Push & Pull Strength',
            exercises: ['Barbell Flat Bench Press 4x8', 'Pendlay Barbell Rows 4x8', 'Standing Overhead Dumbbell Press 3x10', 'Weighted Dips 3x12'],
          },
          {
            day: 'Day 2 (Tue)',
            focus: 'Lower Body Quad & Posterior Dominance',
            exercises: ['Barbell Back Squats 4x6', 'Romanian Deadlifts (RDL) 3x10', 'Bulgarian Split Squats 3x12/leg', 'Standing Calf Raises 4x15'],
          },
          {
            day: 'Day 3 (Thu)',
            focus: 'Functional Conditioning & Core Sleds',
            exercises: ['50-Yard Turf Sled Pushes 5 rounds', 'Kettlebell Clean & Press 4x12', 'Hanging Leg Raises 3x15', 'Rowing Machine Sprints 500m x 4'],
          },
          {
            day: 'Day 4 (Fri)',
            focus: 'Upper Body Pump, Hypertrophy & Arms',
            exercises: ['Incline Dumbbell Press 4x10', 'Lat Pulldowns (Neutral Grip) 4x12', 'Cable Lateral Raises 4x15', 'Biceps & Triceps Supersets 3x15'],
          },
        ],
        nutritionAdvice: 'Consume 1.8g protein per kg of bodyweight. Allocate 50g of clean complex carbs 90 minutes before your lifting session.',
        trainerRecommendation: 'Coach Marcus Vance (Strength) or Elena Rostova (Conditioning)',
        proTip: `Utilize the ${config.name || 'Absolute'} Recovery Infrared Sauna for 15 minutes after heavy leg days to speed muscle glycogen restoration.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-advisor" className="w-full max-w-full py-24 bg-neutral-950 text-white relative border-b border-neutral-800 overflow-hidden">
      {/* Dynamic Atmospheric Background Image */}
      {config.advisorBgImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={config.advisorBgImage}
            alt="AI Advisor Atmospheric Background"
            className="w-full h-full object-cover opacity-10 filter blur-xs scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/80 to-neutral-950" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${theme.accentBadge}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Head Coach & Membership Matcher</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            Personalized Training Blueprint
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400">
            Tell our AI Head Coach your goals and schedule. We will formulate your custom weekly workout split and recommend the optimal gym membership tier.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Questionnaire */}
          <div className="lg:col-span-5 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 sm:p-8 shadow-xl">
            <h3 className="text-lg font-black uppercase text-white mb-6 flex items-center gap-2">
              <Dumbbell className={`w-5 h-5 ${theme.accentText}`} />
              <span>Your Athlete Profile</span>
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Primary Fitness Goal:
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Hypertrophy & Muscle Gain">Hypertrophy & Lean Muscle Mass</option>
                  <option value="Body Recomposition & Fat Loss">Aggressive Fat Loss & Conditioning</option>
                  <option value="Raw Powerlifting & Strength">Raw Powerlifting & Max Barbell Strength</option>
                  <option value="Combat Boxing & Striking Stamina">Boxing, Combat & Explosive Cardio</option>
                  <option value="Mobility, Longevity & Functional Health">Functional Longevity & Joint Mobility</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Experience:
                  </label>
                  <select
                    value={fitnessLevel}
                    onChange={(e) => setFitnessLevel(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Beginner">Beginner (0-1 yr)</option>
                    <option value="Intermediate">Intermediate (1-3 yrs)</option>
                    <option value="Advanced">Advanced (4+ yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Days / Week:
                  </label>
                  <select
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="3 Days / Week">3 Days / Week</option>
                    <option value="4 Days / Week">4 Days / Week</option>
                    <option value="5 Days / Week">5 Days / Week</option>
                    <option value="6 Days / Week">6 Days / Week</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Age / Focus Notes (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. 32 years old, working desk job, want to bench 225 lbs"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  id="ai-generate-blueprint-btn"
                  className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${theme.accentBg}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Formulating Custom Protocol...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate My Custom Blueprint</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results Blueprint Output */}
          <div className="lg:col-span-7 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 sm:p-8 shadow-xl">
            {generatedPlan ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Plan Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                  <div>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${theme.accentText}`}>
                      Recommended Gym Tier: {generatedPlan.recommendedTier}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase text-white mt-0.5">
                      {generatedPlan.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      const matched = config.plans.find((p) =>
                        generatedPlan.recommendedTier.toLowerCase().includes(p.name.toLowerCase())
                      ) || config.plans[1];
                      setSelectedPlanForModal(matched);
                    }}
                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${theme.accentBg}`}
                  >
                    Select Recommended Plan
                  </button>
                </div>

                {/* Weekly Split Breakdown */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Your Periodized Weekly Split:</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {generatedPlan.weeklySplit.map((split, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-extrabold text-amber-400 uppercase">
                            {split.day}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-neutral-200 mb-2">
                          {split.focus}
                        </div>
                        <ul className="space-y-1 text-[11px] text-neutral-400">
                          {split.exercises.map((ex, exIdx) => (
                            <li key={exIdx} className="flex items-start gap-1.5">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nutrition & Coach Recommendation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                      🥗 Nutrition Strategy
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {generatedPlan.nutritionAdvice}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                      🏋️ Coach Specialty Match
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {generatedPlan.trainerRecommendation}
                    </p>
                  </div>
                </div>

                {/* Pro Tip */}
                <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-300">
                  <span className="font-bold text-amber-400">Master Coach Tip: </span>
                  {generatedPlan.proTip}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-800 rounded-xl">
                <Sparkles className="w-12 h-12 text-neutral-600 mb-3" />
                <h4 className="text-lg font-bold text-neutral-300">
                  Your Custom Blueprint Awaits
                </h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                  Fill in your training profile on the left and click generate to receive your customized split and gym plan recommendation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
