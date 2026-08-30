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
  ArrowLeft,
  ChevronRight,
  Sparkles,
  PieChart,
  Dumbbell,
  Apple,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const BmiCalculatorPage: React.FC = () => {
  const { config, themeColor, setCurrentPage, setIsTrialModalOpen, setSelectedTrainerForModal, setIsTrainerModalOpen } = useGym();
  const theme = themeStyles[themeColor];

  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  // Metric inputs
  const [weightKg, setWeightKg] = useState<number>(75);
  const [heightCm, setHeightCm] = useState<number>(178);

  // Imperial inputs
  const [weightLbs, setWeightLbs] = useState<number>(165);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(10);

  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<number>(1.55); // moderate exercise 3-5 days
  const [selectedGoal, setSelectedGoal] = useState<'fat_loss' | 'maintenance' | 'muscle_gain'>('fat_loss');

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

  // Calorie calculations using Mifflin-St Jeor Equation
  const caloriesEstimate = useMemo(() => {
    let weight = weightKg;
    let height = heightCm;
    if (unit === 'imperial') {
      weight = weightLbs * 0.453592;
      height = (heightFt * 12 + heightIn) * 2.54;
    }
    const safeAge = age > 0 ? age : 25;
    let bmr = 10 * weight + 6.25 * height - 5 * safeAge + (gender === 'male' ? 5 : -161);
    const tdee = Math.round(bmr * activityLevel);
    return {
      bmr: Math.round(bmr),
      maintenance: tdee,
      fatLoss: Math.round(tdee - 450),
      muscleGain: Math.round(tdee + 350),
    };
  }, [unit, weightKg, heightCm, weightLbs, heightFt, heightIn, age, gender, activityLevel]);

  // Macro calculations based on selected goal
  const macroBreakdown = useMemo(() => {
    let targetCalories = caloriesEstimate.maintenance;
    let proteinMultiplier = 2.0; // g per kg of bodyweight
    let fatPercentage = 0.25; // 25% of calories from fat

    let normalizedWeightKg = weightKg;
    if (unit === 'imperial') {
      normalizedWeightKg = weightLbs * 0.453592;
    }

    if (selectedGoal === 'fat_loss') {
      targetCalories = caloriesEstimate.fatLoss;
      proteinMultiplier = 2.2; // higher protein for muscle retention during deficit
      fatPercentage = 0.25;
    } else if (selectedGoal === 'muscle_gain') {
      targetCalories = caloriesEstimate.muscleGain;
      proteinMultiplier = 2.0;
      fatPercentage = 0.25;
    }

    const proteinGrams = Math.round(normalizedWeightKg * proteinMultiplier);
    const proteinCalories = proteinGrams * 4;

    const fatCalories = targetCalories * fatPercentage;
    const fatGrams = Math.round(fatCalories / 9);

    const remainingCaloriesForCarbs = Math.max(0, targetCalories - (proteinCalories + fatCalories));
    const carbGrams = Math.round(remainingCaloriesForCarbs / 4);

    return {
      targetCalories,
      proteinGrams,
      carbGrams,
      fatGrams,
      proteinPct: Math.round((proteinCalories / targetCalories) * 100),
      carbPct: Math.round((remainingCaloriesForCarbs / targetCalories) * 100),
      fatPct: Math.round((fatCalories / targetCalories) * 100),
    };
  }, [selectedGoal, caloriesEstimate, weightKg, weightLbs, unit]);

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) {
      return {
        label: 'Underweight',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        recommendation: `Target a moderate hypercaloric surplus (+300 to +500 kcal) paired with heavy compound barbell strength splits (Squat, Bench, Deadlift, Overhead Press) 4x/week at ${config.name || 'Absolute Gym'}.`,
        routine: 'Strength & Hypertrophy Split: Push / Pull / Legs + 1 Functional Mobility Session.',
      };
    } else if (bmi < 25) {
      return {
        label: 'Optimal Athletic Range',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        recommendation: 'Outstanding baseline athletic composition! Focus on progressive overload, conditioning circuits, and targeted body recomposition.',
        routine: 'Athletic Performance: 4-day Upper/Lower or 5-day Split with 2x HIIT/Spin conditioning.',
      };
    } else if (bmi < 30) {
      return {
        label: 'Overweight / Muscular Mass',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        recommendation: 'Combine structured strength training with 25-30 min high-energy HIIT / Spin cardio to drop visceral body fat while preserving lean muscle.',
        routine: 'Fat Loss & Hypertrophy: 4x Resistance Training + 2x Studio HIIT/Zumba + 10k daily step target.',
      };
    } else {
      return {
        label: 'Elevated BMI Range',
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/30',
        recommendation: 'We recommend a 1-on-1 coach assessment. Start with joint-friendly cardiovascular conditioning, progressive bodyweight resistance, and a consistent 400-500 kcal deficit.',
        routine: 'Functional Conditioning: 3-4x Full Body Functional Resistance + Low-Impact Cardio + Steam Recovery.',
      };
    }
  };

  const categoryInfo = getBmiCategory(bmiResult);

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 pb-24">
      {/* Hero Banner Header */}
      <section className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 border-b border-neutral-800 overflow-hidden">
        {/* Dynamic Atmospheric Background Image */}
        {config.bmiBgImage && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <img
              src={config.bmiBgImage}
              alt="BMI Calculator Atmospheric Background"
              className="w-full h-full object-cover opacity-15 filter blur-xs scale-105"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/90 to-neutral-950" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-6">
            <button
              type="button"
              onClick={() => {
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-amber-400 font-bold">BMI & Nutrition Calculator</span>
          </div>

          <div className="max-w-3xl">
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 ${theme.accentBadge}`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Accurate Fitness Tools</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white">
              BMI & Nutrition <span className={theme.accentText}>Target Calculator</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-300 leading-relaxed">
              Calculate your BMI, daily calorie needs, and ideal protein, carb, and fat targets to match your workout and diet goals
            </p>
          </div>

          {/* Quick Stats Strip */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
              <div className="text-amber-400 font-black text-2xl sm:text-3xl">Accurate Formulas</div>
              <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
                Proven Calculation Methods
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
              <div className="text-amber-400 font-black text-2xl sm:text-3xl">TDEE & BMR</div>
              <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
                Total Calories Burned
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
              <div className="text-amber-400 font-black text-2xl sm:text-3xl">Macros (P/C/F)</div>
              <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
                Nutrient Grams
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
              <div className="text-amber-400 font-black text-2xl sm:text-3xl">100% Free</div>
              <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
                No Sign-Up Required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Calculator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Controls Card (Left Column) */}
          <div className="lg:col-span-6 bg-neutral-900 rounded-3xl border border-neutral-800 p-6 sm:p-8 shadow-xl">
            {/* Metric / Imperial Unit Selector */}
            <div className="flex items-center justify-between pb-6 border-b border-neutral-800 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Measurement System:
              </span>
              <div className="inline-flex rounded-xl bg-neutral-950 p-1 border border-neutral-800">
                <button
                  id="bmi-page-unit-metric-btn"
                  onClick={() => setUnit('metric')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    unit === 'metric' ? theme.accentBg : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Metric (kg/cm)
                </button>
                <button
                  id="bmi-page-unit-imperial-btn"
                  onClick={() => setUnit('imperial')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    unit === 'imperial' ? theme.accentBg : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Imperial (lbs/ft)
                </button>
              </div>
            </div>

            {/* Biological Focus & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Biological Focus:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGender('male')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition ${
                      gender === 'male'
                        ? 'bg-neutral-800 text-white border-neutral-600 shadow'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition ${
                      gender === 'female'
                        ? 'bg-neutral-800 text-white border-neutral-600 shadow'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Age (Years): {age}
                </label>
                <input
                  type="number"
                  min="14"
                  max="90"
                  value={age}
                  onChange={(e) => setAge(Math.max(14, Math.min(90, Number(e.target.value) || 25)))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            {/* Sliders / Inputs */}
            {unit === 'metric' ? (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-sm font-bold mb-2">
                    <span className="text-neutral-300">Weight</span>
                    <span className={`text-base font-mono font-bold ${theme.accentText}`}>{weightKg} kg</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
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
                    <span className={`text-base font-mono font-bold ${theme.accentText}`}>{heightCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="130"
                    max="220"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
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
                    <span className={`text-base font-mono font-bold ${theme.accentText}`}>{weightLbs} lbs</span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="400"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(Number(e.target.value))}
                    className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
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
                      className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
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
                      className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Activity Level Selector */}
            <div className="mt-6 pt-6 border-t border-neutral-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Weekly Training Activity Level:
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
              >
                <option value={1.2}>Sedentary (Desk job, minimal workout)</option>
                <option value={1.375}>Light Activity (1-3 days gym sessions / week)</option>
                <option value={1.55}>Moderate Activity (3-5 days gym workouts / week)</option>
                <option value={1.725}>High Activity (6-7 days intense strength / cardio)</option>
                <option value={1.9}>Elite Lifter / Athlete (2x heavy daily sessions)</option>
              </select>
            </div>

            {/* Goal Selector for Macro Tuning */}
            <div className="mt-6 pt-6 border-t border-neutral-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Current Physique & Training Objective:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGoal('fat_loss')}
                  className={`p-3 rounded-xl text-center border transition ${
                    selectedGoal === 'fat_loss'
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-black uppercase">Fat Loss</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Deficit (-450 kcal)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGoal('maintenance')}
                  className={`p-3 rounded-xl text-center border transition ${
                    selectedGoal === 'maintenance'
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-black uppercase">Recomp</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Maintain TDEE</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGoal('muscle_gain')}
                  className={`p-3 rounded-xl text-center border transition ${
                    selectedGoal === 'muscle_gain'
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-black uppercase">Hypertrophy</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Surplus (+350 kcal)</div>
                </button>
              </div>
            </div>
          </div>

          {/* Results Gauge & Macro Breakdown (Right Column) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Primary BMI Output Card */}
            <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Biometric Output:
                </span>
                <span className="text-xs text-neutral-500 font-mono">InBody Matrix Algorithm</span>
              </div>

              {/* Big BMI Value Display */}
              <div className="mt-5 text-center p-6 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Your Calculated BMI
                </div>
                <div className={`text-6xl sm:text-7xl font-black mt-2 font-sans tracking-tight ${theme.accentText}`}>
                  {bmiResult}
                </div>
                <div
                  className={`inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${categoryInfo.bg} ${categoryInfo.color}`}
                >
                  {categoryInfo.label}
                </div>
              </div>

              {/* BMI Scale Bar */}
              <div className="mt-6">
                <div className="grid grid-cols-4 gap-1 text-[10px] font-bold text-center text-neutral-400 uppercase mb-1.5">
                  <span className="text-amber-400">&lt; 18.5 (Under)</span>
                  <span className="text-emerald-400">18.5 - 24.9 (Normal)</span>
                  <span className="text-amber-400">25 - 29.9 (Over)</span>
                  <span className="text-red-400">30+ (Elevated)</span>
                </div>
                <div className="h-3 rounded-full bg-neutral-800 flex overflow-hidden p-0.5">
                  <div className="h-full w-1/4 bg-amber-400/80 rounded-l" />
                  <div className="h-full w-1/4 bg-emerald-400" />
                  <div className="h-full w-1/4 bg-amber-400/80" />
                  <div className="h-full w-1/4 bg-red-500 rounded-r" />
                </div>
              </div>

              {/* Daily Energy Targets */}
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Calculated Daily Energy Needs:</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
                    <div className="text-[10px] uppercase font-bold text-neutral-400">Fat Loss</div>
                    <div className="text-xl font-black text-amber-400 mt-1 font-mono">
                      {caloriesEstimate.fatLoss}
                    </div>
                    <div className="text-[9px] text-neutral-500">kcal / day</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
                    <div className="text-[10px] uppercase font-bold text-neutral-400">Maintenance (TDEE)</div>
                    <div className="text-xl font-black text-white mt-1 font-mono">
                      {caloriesEstimate.maintenance}
                    </div>
                    <div className="text-[9px] text-neutral-500">kcal / day</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
                    <div className="text-[10px] uppercase font-bold text-neutral-400">Hypertrophy</div>
                    <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
                      {caloriesEstimate.muscleGain}
                    </div>
                    <div className="text-[9px] text-neutral-500">kcal / day</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Macro Distribution Target Card */}
            <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Target Macro Distribution ({macroBreakdown.targetCalories} kcal)
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  {selectedGoal.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Protein */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase">
                    <span>Protein</span>
                    <span className="text-amber-400">{macroBreakdown.proteinPct}%</span>
                  </div>
                  <div className="text-2xl font-black text-white mt-2 font-mono">
                    {macroBreakdown.proteinGrams}g
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">High Bioavailability</div>
                </div>

                {/* Carbs */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase">
                    <span>Carbs</span>
                    <span className="text-blue-400">{macroBreakdown.carbPct}%</span>
                  </div>
                  <div className="text-2xl font-black text-white mt-2 font-mono">
                    {macroBreakdown.carbGrams}g
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Glycogen & Fuel</div>
                </div>

                {/* Healthy Fats */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase">
                    <span>Fats</span>
                    <span className="text-emerald-400">{macroBreakdown.fatPct}%</span>
                  </div>
                  <div className="text-2xl font-black text-white mt-2 font-mono">
                    {macroBreakdown.fatGrams}g
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Hormone Balance</div>
                </div>
              </div>

              {/* Coaching Routine Note */}
              <div className="mt-5 p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 text-xs text-neutral-300 space-y-2">
                <div>
                  <span className="font-black uppercase text-amber-400">Nutritional Strategy: </span>
                  {categoryInfo.recommendation}
                </div>
                <div className="pt-2 border-t border-neutral-800/80">
                  <span className="font-black uppercase text-white">Suggested Gym Split: </span>
                  {categoryInfo.routine}
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};
