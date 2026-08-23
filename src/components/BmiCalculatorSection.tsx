import React, { useState, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import {
  Activity,
  Calculator,
  Flame,
  Zap,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const BmiCalculatorSection: React.FC = () => {
  const { config, themeColor, setIsTrialModalOpen, setSelectedPlanForModal } = useGym();
  const theme = themeStyles[themeColor];

  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  
  // Metric inputs
  const [weightKg, setWeightKg] = useState<number>(75);
  const [heightCm, setHeightCm] = useState<number>(178);
  
  // Imperial inputs
  const [weightLbs, setWeightLbs] = useState<number>(165);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(10);

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<number>(1.55); // moderate exercise 3-5 days

  // BMI Calculation
  const bmiResult = useMemo(() => {
    let weight = weightKg;
    let heightM = heightCm / 100;

    if (unit === 'imperial') {
      weight = weightLbs * 0.453592;
      const totalInches = heightFt * 12 + heightIn;
      heightM = totalInches * 0.0254;
    }

    if (heightM <= 0 || weight <= 0) return 0;
    const bmi = weight / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  }, [unit, weightKg, heightCm, weightLbs, heightFt, heightIn]);

  // Calorie calculations
  const caloriesEstimate = useMemo(() => {
    let weight = weightKg;
    let height = heightCm;
    if (unit === 'imperial') {
      weight = weightLbs * 0.453592;
      height = (heightFt * 12 + heightIn) * 2.54;
    }
    const age = 28;
    // Mifflin-St Jeor Equation
    let bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161);
    const tdee = Math.round(bmr * activityLevel);
    return {
      maintenance: tdee,
      fatLoss: Math.round(tdee - 450),
      muscleGain: Math.round(tdee + 350),
    };
  }, [unit, weightKg, heightCm, weightLbs, heightFt, heightIn, gender, activityLevel]);

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) {
      return {
        label: 'Underweight',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        recommendation: `Target hypercaloric nutrition + heavy barbell compound strength training 4x/week at ${config.name || 'Absolute Gym'}.`,
      };
    } else if (bmi < 25) {
      return {
        label: 'Optimal Athletic Range',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        recommendation: 'Great baseline physique! Focus on progressive overload, HIIT athletic conditioning, and body recomposition.',
      };
    } else if (bmi < 30) {
      return {
        label: 'Overweight / Muscle Hypertrophy',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        recommendation: 'Combine high-energy HIIT & spin circuits with strength resistance splits to drop visceral fat while preserving lean muscle mass.',
      };
    } else {
      return {
        label: 'Elevated BMI Range',
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/30',
        recommendation: 'Structured coach assessment recommended. Focus on calorie deficit, joint-friendly cardio, and functional strength conditioning.',
      };
    }
  };

  const categoryInfo = getBmiCategory(bmiResult);

  return (
    <section id="calculator" className="w-full max-w-full py-24 bg-neutral-900/50 text-white relative border-b border-neutral-800 overflow-hidden">
      {/* Dynamic Atmospheric Background Image */}
      {config.bmiBgImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={config.bmiBgImage}
            alt="BMI Calculator Atmospheric Background"
            className="w-full h-full object-cover opacity-10 filter blur-xs scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-neutral-900/90 to-neutral-950" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${theme.accentBadge}`}>
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Health Analytics</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            BMI & Calorie Target Calculator
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400">
            Calculate your Body Mass Index and daily energy requirements to dial in your gym programming and nutrition.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Controls Card */}
          <div className="lg:col-span-6 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 sm:p-8 shadow-xl">
            {/* Metric / Imperial Unit Selector */}
            <div className="flex items-center justify-between pb-6 border-b border-neutral-800 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Measurement System:
              </span>
              <div className="inline-flex rounded-lg bg-neutral-950 p-1 border border-neutral-800">
                <button
                  id="bmi-unit-metric-btn"
                  onClick={() => setUnit('metric')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    unit === 'metric' ? theme.accentBg : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Metric (kg/cm)
                </button>
                <button
                  id="bmi-unit-imperial-btn"
                  onClick={() => setUnit('imperial')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    unit === 'imperial' ? theme.accentBg : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Imperial (lbs/ft)
                </button>
              </div>
            </div>

            {/* Gender Toggle */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Biological Focus:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGender('male')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition ${
                    gender === 'male'
                      ? 'bg-neutral-800 text-white border-neutral-600 shadow'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  Male Baseline
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition ${
                    gender === 'female'
                      ? 'bg-neutral-800 text-white border-neutral-600 shadow'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  Female Baseline
                </button>
              </div>
            </div>

            {/* Sliders / Inputs */}
            {unit === 'metric' ? (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-sm font-bold mb-2">
                    <span className="text-neutral-300">Weight</span>
                    <span className={`text-base ${theme.accentText}`}>{weightKg} kg</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                    <span>40 kg</span>
                    <span>110 kg</span>
                    <span>180 kg</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm font-bold mb-2">
                    <span className="text-neutral-300">Height</span>
                    <span className={`text-base ${theme.accentText}`}>{heightCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="130"
                    max="220"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                    <span>130 cm</span>
                    <span>175 cm</span>
                    <span>220 cm</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-sm font-bold mb-2">
                    <span className="text-neutral-300">Weight</span>
                    <span className={`text-base ${theme.accentText}`}>{weightLbs} lbs</span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="400"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                    <span>90 lbs</span>
                    <span>245 lbs</span>
                    <span>400 lbs</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-1">
                      Height (Feet): {heightFt} ft
                    </label>
                    <input
                      type="range"
                      min="4"
                      max="7"
                      value={heightFt}
                      onChange={(e) => setHeightFt(Number(e.target.value))}
                      className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-1">
                      Height (Inches): {heightIn} in
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="11"
                      value={heightIn}
                      onChange={(e) => setHeightIn(Number(e.target.value))}
                      className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Activity Level Selector */}
            <div className="mt-6 pt-6 border-t border-neutral-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Weekly Training Volume:
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
              >
                <option value={1.2}>Sedentary (Little or no workout)</option>
                <option value={1.375}>Light Active (1-3 days gym workouts)</option>
                <option value={1.55}>Moderately Active (3-5 days gym workouts)</option>
                <option value={1.725}>Very Active (6-7 days heavy training)</option>
                <option value={1.9}>Elite Athlete (2x per day heavy sessions)</option>
              </select>
            </div>
          </div>

          {/* Results Gauge & Targets Card */}
          <div className="lg:col-span-6 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 sm:p-8 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Body Metric Output:
                </span>
                <span className="text-xs text-neutral-500 font-mono">InBody Matrix Algorithm</span>
              </div>

              {/* Big BMI Number */}
              <div className="mt-6 text-center p-6 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Your Calculated BMI
                </div>
                <div className={`text-6xl sm:text-7xl font-black mt-2 font-sans tracking-tight ${theme.accentText}`}>
                  {bmiResult}
                </div>
                <div className={`inline-block mt-3 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${categoryInfo.bg} ${categoryInfo.color}`}>
                  {categoryInfo.label}
                </div>
              </div>

              {/* BMI Category Visual Scale */}
              <div className="mt-6">
                <div className="grid grid-cols-4 gap-1 text-[10px] font-bold text-center text-neutral-400 uppercase mb-1">
                  <span className="text-amber-400">&lt; 18.5</span>
                  <span className="text-emerald-400">18.5 - 24.9</span>
                  <span className="text-amber-400">25 - 29.9</span>
                  <span className="text-red-400">30+</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-800 flex overflow-hidden">
                  <div className="h-full w-1/4 bg-amber-400/80" />
                  <div className="h-full w-1/4 bg-emerald-400" />
                  <div className="h-full w-1/4 bg-amber-400/80" />
                  <div className="h-full w-1/4 bg-red-500" />
                </div>
              </div>

              {/* Daily Energy Targets */}
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Estimated Daily Calorie Targets:</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                    <div className="text-[10px] uppercase font-bold text-neutral-400">Fat Loss</div>
                    <div className="text-lg font-black text-amber-400 mt-1">
                      {caloriesEstimate.fatLoss}
                    </div>
                    <div className="text-[9px] text-neutral-500">kcal / day</div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                    <div className="text-[10px] uppercase font-bold text-neutral-400">Maintain</div>
                    <div className="text-lg font-black text-white mt-1">
                      {caloriesEstimate.maintenance}
                    </div>
                    <div className="text-[9px] text-neutral-500">kcal / day</div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                    <div className="text-[10px] uppercase font-bold text-neutral-400">Hypertrophy</div>
                    <div className="text-lg font-black text-emerald-400 mt-1">
                      {caloriesEstimate.muscleGain}
                    </div>
                    <div className="text-[9px] text-neutral-500">kcal / day</div>
                  </div>
                </div>
              </div>

              {/* Recommendation Note */}
              <div className="mt-4 p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
                <span className="font-bold text-white">Coaching Note: </span>
                {categoryInfo.recommendation}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
