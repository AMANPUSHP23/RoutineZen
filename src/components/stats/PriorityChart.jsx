import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PriorityChart = ({ tasks }) => {
  const [highlight, setHighlight] = useState(null);
  const [theme, setTheme] = useState('dark');

  const priorityData = [
    { name: 'High', count: tasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', count: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', count: tasks.filter(t => t.priority === 'low').length },
  ];

  const themeClass = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 text-gray-100'
    : 'bg-gradient-to-br from-white via-purple-100 to-slate-100 text-gray-900';

  const barColors = {
    High: '#a855f7',
    Medium: '#ec4899',
    Low: '#38bdf8',
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = priorityData.reduce((sum, item) => sum + item.count, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-slate-800/95 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{label} Priority</p>
          <p className="text-purple-300">
            {payload[0].value} tasks ({percentage}%)
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
            Task Priority Distribution
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
          Overview of tasks by priority level.
        </CardDescription>
        <hr className="my-3 border-slate-700/40" />
      </CardHeader>
      <CardContent>
        {priorityData.some(p => p.count > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={priorityData} 
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }} 
              barCategoryGap={32}
              role="img"
              aria-label="Task Priority Distribution Chart"
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
                allowDecimals={false}
                axisLine={{ stroke: theme === 'dark' ? '#4b5563' : '#d1d5db' }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
              />
              <Legend
                wrapperStyle={{ 
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280', 
                  fontWeight: 600, 
                  fontSize: 14 
                }}
                onClick={e => setHighlight(highlight === e.value ? null : e.value)}
                payload={priorityData.map(p => ({ 
                  value: p.name, 
                  type: 'rect', 
                  color: barColors[p.name], 
                  id: p.name 
                }))}
              />
              {priorityData.map(p => (
                <Bar
                  key={p.name}
                  dataKey="count"
                  name={p.name}
                  fill={barColors[p.name]}
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  opacity={highlight && highlight !== p.name ? 0.3 : 1}
                  data={priorityData.filter(d => !highlight || d.name === highlight)}
                  role="img"
                  aria-label={`${p.name} priority: ${p.count} tasks`}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 py-10">
            No priority data available. Add some tasks!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PriorityChart;
  