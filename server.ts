import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Workout & Membership Consultant Endpoint
  app.post('/api/ai/fitness-plan', async (req, res) => {
    try {
      const { goal, fitnessLevel, daysPerWeek, age, gender, specialNotes, gymPlans } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Return a realistic structured fallback if key isn't configured yet
        return res.json({
          success: true,
          plan: {
            title: `Customized ${goal || 'Strength & Conditioning'} Blueprint`,
            recommendedTier: 'Pro Athlete Plan',
            weeklySplit: [
              { day: 'Day 1', focus: 'Upper Body Power & Hypertrophy', exercises: ['Barbell Bench Press 4x8', 'Bent-Over Rows 4x10', 'Overhead Dumbbell Press 3x10', 'Core Plank 3x60s'] },
              { day: 'Day 2', focus: 'Lower Body Strength & Explosiveness', exercises: ['Barbell Back Squats 4x6', 'Romanian Deadlifts 3x10', 'Bulgarian Split Squats 3x12/leg', 'Calf Raises 4x15'] },
              { day: 'Day 3', focus: 'Active Recovery / Functional Cardio', exercises: ['Spinning or Rowing 30 mins (Zone 2)', 'Dynamic Mobility Routine 15 mins', 'Sauna / Steam Session'] },
              { day: 'Day 4', focus: 'Full Body Athletic Conditioning & Core', exercises: ['Trap Bar Deadlift 4x6', 'Pull-ups 3xMax', 'Kettlebell Swings 4x15', 'Hanging Leg Raises 3x12'] },
            ],
            nutritionAdvice: 'Focus on consuming 1.6 - 2.0g protein per kg of bodyweight. Maintain steady hydration (3L/day) with electrolytes before heavy lifting sessions.',
            trainerRecommendation: 'Strength & Conditioning Coach (Alex Rivera or Marcus Vance)',
            proTip: 'Consistency in progressive overload over 8 weeks will deliver compound visual and athletic results.'
          }
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the Head Master Trainer at Apex Elite Gym.
A gym visitor wants a personalized fitness recommendation.
Here is their profile:
- Goal: ${goal || 'General Fitness & Muscle Tone'}
- Fitness Level: ${fitnessLevel || 'Intermediate'}
- Days available per week: ${daysPerWeek || '4 days'}
- Age: ${age || 'Not specified'}
- Gender: ${gender || 'Not specified'}
- Notes: ${specialNotes || 'None'}
- Available Gym Membership Plans: ${JSON.stringify(gymPlans || ['Starter Pass', 'Pro Athlete', 'VIP Elite Black Card'])}

Generate a response in valid JSON format only, with no markdown code blocks. The JSON must match this structure:
{
  "title": "string (motivating plan title)",
  "recommendedTier": "string (name of the best matching gym plan)",
  "weeklySplit": [
    { "day": "Day 1", "focus": "string", "exercises": ["exercise 1 with sets/reps", "exercise 2 with sets/reps"] }
  ],
  "nutritionAdvice": "string (clear actionable dietary target)",
  "trainerRecommendation": "string (ideal coach focus)",
  "proTip": "string (expert tip for maximizing gym sessions)"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, plan: parsed });
      } catch (err) {
        return res.json({
          success: true,
          plan: {
            title: `${goal} Master Blueprint`,
            recommendedTier: 'Pro Athlete Plan',
            weeklySplit: [
              { day: 'Day 1', focus: 'Push Strength', exercises: ['Bench Press 4x8', 'Dumbbell Incline Press 3x10', 'Lateral Raises 4x12'] },
              { day: 'Day 2', focus: 'Pull & Back', exercises: ['Deadlifts 4x6', 'Lat Pulldowns 4x10', 'Facepulls 3x15'] },
              { day: 'Day 3', focus: 'Legs & Core', exercises: ['Squats 4x8', 'Leg Curls 3x12', 'Plank Variations 3x60s'] }
            ],
            nutritionAdvice: 'Target high protein intake, lean complex carbs around workouts, and 3L daily water.',
            trainerRecommendation: 'Master Strength Coach',
            proTip: 'Track workout weights each session in your logbook.'
          }
        });
      }
    } catch (error: any) {
      console.error('AI Fitness Plan error:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate plan' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gym website server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
