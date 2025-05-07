import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeeklyCompletionChart = ({ tasks }) => {
  const [theme, setTheme] = useState('dark');
  const [highlight, setHighlight] = useState(null);

  const tasksByDay = tasks.reduce((acc, task) => {
    const dateKey = task.completedAt ? new Date(task.completedAt).toISOString().split('T')[0] : (task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : null);
    if (!dateKey) return acc;

    const day = new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short' });
    if (task.completed) {
      acc[day] = {
        ...acc[day],
        completed: (acc[day]?.completed || 0) + 1,
      };
    }
    return acc;
  }, {});

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyCompletionData = days.map(day => ({
    name: day,
    tasksDone: tasksByDay[day]?.completed || 0,
  }));

  const themeClass = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 text-gray-100'
    : 'bg-gradient-to-br from-white via-purple-100 to-slate-100 text-gray-900';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = weeklyCompletionData.reduce((sum, item) => sum + item.tasksDone, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-slate-800/95 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{label}</p>
          <p className="text-purple-300">
            {payload[0].value} tasks completed ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`${themeClass} border-slate-700/40 rounded-2xl shadow-xl`}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="inline-block w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-lg text-lg">📊</span>
            Weekly Task Completion
          </CardTitle>
          <button
            className={`px-2 py-1 rounded text-xs font-semibold border transition-colors duration-200 ${
              theme === 'dark' 
                ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                : 'bg-slate-200 hover:bg-slate-300 text-gray-900'
            } border-slate-500`}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
        <CardDescription className="text-slate-400">
          Tasks completed throughout the week.
        </CardDescription>
        <hr className="my-3 border-slate-700/40" />
      </CardHeader>
      <CardContent>
        {weeklyCompletionData.some(day => day.tasksDone > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={weeklyCompletionData} 
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
              role="img"
              aria-label="Weekly Task Completion Chart"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                strokeOpacity={0.2} 
                stroke="#4b5563"
              />
              <XAxis 
                dataKey="name" 
                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                axisLine={{ stroke: theme === 'dark' ? '#4b5563' : '#d1d5db' }}
              />
              <YAxis 
                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                axisLine={{ stroke: theme === 'dark' ? '#4b5563' : '#d1d5db' }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(130, 202, 157, 0.1)' }}
              />
              <Legend
                wrapperStyle={{ 
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280', 
                  fontWeight: 600, 
                  fontSize: 14 
                }}
                onClick={e => setHighlight(highlight === e.value ? null : e.value)}
                payload={[{ 
                  value: 'Tasks Completed', 
                  type: 'rect', 
                  color: '#82ca9d', 
                  id: 'tasksDone' 
                }]}
              />
              <Bar 
                dataKey="tasksDone" 
                name="Tasks Completed" 
                fill="url(#colorWeekly)" 
                radius={[8, 8, 0, 0]}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
                role="img"
                aria-label="Tasks completed per day"
              />
              <defs>
                <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00C49F" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 py-10">
            No task completion data available. Complete some tasks to see your weekly progress!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyCompletionChart;
  