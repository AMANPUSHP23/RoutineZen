import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Use emoji for moods
const MOOD_EMOJIS = {
  laugh: '😂',
  smile: '😊',
  meh: '😐',
  frown: '🙁',
  angry: '😡',
  tired: '😩',
};

const MOOD_COLORS = {
  laugh: '#22c55e',
  smile: '#84cc16',
  meh: '#facc15',
  frown: '#f97316',
  angry: '#ef4444',
  tired: '#3b82f6',
};

// Mood to numeric value mapping
const MOOD_VALUES = {
  laugh: 5,
  smile: 4,
  meh: 3,
  frown: 2,
  angry: 1,
  tired: 2,
};

const MoodProductivityChart = ({ tasks, moodLog }) => {
  const moodChartData = moodLog.map(log => {
    const date = new Date(log.date);
    const tasksOnDate = tasks.filter(task => task.completedAt && new Date(task.completedAt).toISOString().split('T')[0] === log.date);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: log.mood,
      moodValue: MOOD_VALUES[log.mood] || 3, // Default to 'meh' if mood not found
      tasksCompleted: tasksOnDate.filter(t => t.completed).length,
    };
  }).sort((a,b) => new Date(a.date) - new Date(b.date)).slice(-7); // Last 7 days

  if (moodChartData.length === 0) {
    return (
      <Card className="bg-slate-800/60 border-slate-700/40 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-gray-100">Mood & Productivity Trend (Last 7 Days)</CardTitle>
          <CardDescription className="text-slate-400">Correlation between your mood and tasks completed.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-400 py-10">Log your mood daily to see trends here!</p>
        </CardContent>
      </Card>
    );
  }

  // Mood-colored emoji dot
  const MoodDot = ({ cx, cy, payload }) => (
    <g tabIndex={0} aria-label={payload.mood}>
      <circle cx={cx} cy={cy} r={22} fill={MOOD_COLORS[payload.mood]} opacity={0.18} />
      <circle cx={cx} cy={cy} r={14} fill={MOOD_COLORS[payload.mood]} opacity={0.35} />
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize="2.2rem"
        style={{ pointerEvents: 'none' }}
      >
        {MOOD_EMOJIS[payload.mood] || '❓'}
      </text>
    </g>
  );

  // Enhanced tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const mood = payload[1]?.payload?.mood;
      return (
        <div className="rounded-xl shadow-2xl border-2 p-5 flex flex-col items-center min-w-[140px]"
          style={{ background: `linear-gradient(135deg, ${MOOD_COLORS[mood]}22 0%, #18181b 100%)`, borderColor: MOOD_COLORS[mood] }}>
          <span className="text-5xl mb-2 drop-shadow-lg">{MOOD_EMOJIS[mood] || '❓'}</span>
          <span className="capitalize text-lg font-bold mb-1" style={{ color: MOOD_COLORS[mood] }}>{mood}</span>
          <span className="text-gray-100 text-base mb-1">{label}</span>
          <span className="text-green-400 text-base">Tasks Completed: <b>{payload[0]?.value}</b></span>
        </div>
      );
    }
    return null;
  };

  // Premium, scrollable, accessible legend
  const CustomLegend = () => (
    <div
      className="flex gap-3 justify-center mt-6 pb-2 w-full max-w-3xl mx-auto px-2"
      style={{
        overflowX: 'auto',
        flexWrap: window.innerWidth >= 640 ? 'wrap' : 'nowrap',
        scrollbarWidth: 'thin',
      }}
      role="list"
      aria-label="Mood legend"
    >
      {Object.keys(MOOD_EMOJIS).map(mood => (
        <span
          key={mood}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-base font-semibold border shadow border-slate-700/60 bg-slate-900/80 hover:scale-105 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400 min-w-[90px]"
          style={{ color: MOOD_COLORS[mood], borderColor: MOOD_COLORS[mood] + '99' }}
          tabIndex={0}
          role="listitem"
          aria-label={mood}
        >
          <span className="text-2xl mr-1" aria-hidden="true">{MOOD_EMOJIS[mood]}</span>
          <span className="capitalize">{mood}</span>
        </span>
      ))}
    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 text-gray-100 border-slate-700/40 rounded-3xl shadow-2xl p-2 sm:p-4 md:p-6 w-full max-w-full" style={{ boxShadow: '0 8px 32px 0 rgba(80,0,120,0.18), 0 1.5px 8px 0 #a855f7' }}>
      <CardHeader>
        <CardTitle className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <span className="inline-block w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-lg text-2xl">📈</span>
          Mood & Productivity Trend (Last 7 Days)
        </CardTitle>
        <CardDescription className="text-slate-300 text-lg mt-1">Correlation between your mood and tasks completed.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full min-w-0 overflow-x-auto">
          <ResponsiveContainer width="100%" height={370}>
            <LineChart data={moodChartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.18} stroke="#a855f7" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#e0e7ff', fontWeight: 600 }} 
                axisLine={{ stroke: '#a855f7' }} 
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fill: '#e0e7ff', fontWeight: 600 }} 
                axisLine={{ stroke: '#a855f7' }} 
                label={{ 
                  value: 'Tasks Completed', 
                  angle: -90, 
                  position: 'insideLeft', 
                  fill: '#a855f7', 
                  style: { textAnchor: 'middle', fontWeight: 700 } 
                }} 
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fill: '#e0e7ff', fontWeight: 600 }} 
                axisLine={{ stroke: '#a855f7' }} 
                label={{ 
                  value: 'Mood Level', 
                  angle: 90, 
                  position: 'insideRight', 
                  fill: '#a855f7', 
                  style: { textAnchor: 'middle', fontWeight: 700 } 
                }}
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#a855f7', strokeWidth: 2, opacity: 0.2 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="tasksCompleted"
                name="Tasks Completed"
                stroke="#82ca9d"
                strokeWidth={3}
                dot={{ r: 6, fill: '#82ca9d' }}
                activeDot={{ r: 9, fill: '#a855f7' }}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="moodValue"
                name="Mood"
                stroke="#8884d8"
                strokeWidth={3}
                dot={MoodDot}
                activeDot={MoodDot}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend />
      </CardContent>
    </Card>
  );
};

export default MoodProductivityChart;
  