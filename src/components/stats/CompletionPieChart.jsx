import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CompletionPieChart = ({ tasks }) => {
  const [highlight, setHighlight] = useState(null);
  const [theme, setTheme] = useState('dark');

  const tasksCompleted = tasks.filter(task => task.completed).length;
  const tasksPending = tasks.filter(task => !task.completed).length;
  const totalTasks = tasks.length;

  const completionData = [
    { name: 'Completed', value: tasksCompleted },
    { name: 'Pending', value: tasksPending },
  ];

  const themeClass = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 text-gray-100'
    : 'bg-gradient-to-br from-white via-purple-100 to-slate-100 text-gray-900';

  const COLORS = [
    '#22c55e', // Green for completed
    '#f59e42', // Orange for pending
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalTasks) * 100).toFixed(1);
      
      return (
        <div className="bg-slate-800/95 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{data.name} Tasks</p>
          <p className="text-purple-300">
            {data.value} tasks ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className={`${themeClass} border-slate-700/40 rounded-2xl shadow-xl`}> 
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="inline-block w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-lg text-lg">📊</span>
            Task Completion Status
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
          Overview of completed vs. pending tasks.
        </CardDescription>
        <hr className="my-3 border-slate-700/40" />
      </CardHeader>
      <CardContent>
        {totalTasks > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart role="img" aria-label="Task Completion Status Chart">
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
                role="img"
                aria-label="Task completion distribution"
              >
                {completionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={highlight && highlight !== entry.name ? 0.3 : 1}
                    onClick={() => setHighlight(highlight === entry.name ? null : entry.name)}
                    style={{ cursor: 'pointer' }}
                    role="img"
                    aria-label={`${entry.name} tasks: ${entry.value}`}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ 
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280', 
                  fontWeight: 600, 
                  fontSize: 14 
                }}
                onClick={e => setHighlight(highlight === e.value ? null : e.value)}
                payload={completionData.map((entry, index) => ({ 
                  value: entry.name, 
                  type: 'rect', 
                  color: COLORS[index % COLORS.length], 
                  id: entry.name 
                }))}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 py-10">
            No tasks to display. Start by adding a task!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CompletionPieChart;
  