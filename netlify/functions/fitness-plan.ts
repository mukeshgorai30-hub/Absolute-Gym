import { GoogleGenAI } from '@google/genai';

export const handler = async (event: { httpMethod: string; body?: string | null }) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { goal, fitnessLevel, daysPerWeek, age, gender, specialNotes, gymPlans } = JSON.parse(event.body || '{}');
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      };
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
    const parsed = JSON.parse(responseText);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, plan: parsed }),
    };
  } catch (error: any) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        plan: {
          title: `Customized Athletic Protocol`,
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
      }),
    };
  }
};
