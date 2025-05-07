import React, { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { motion, Reorder } from 'framer-motion';
import OverallStatsCards from '@/components/stats/OverallStatsCards';
import PriorityChart from '@/components/stats/PriorityChart';
import CompletionPieChart from '@/components/stats/CompletionPieChart';
import WeeklyCompletionChart from '@/components/stats/WeeklyCompletionChart';
import MoodProductivityChart from '@/components/stats/MoodProductivityChart';
import CategoryStats from '@/components/stats/CategoryStats';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const WIDGETS = [
  {
    id: 'overallStats',
    name: 'Overall Stats',
    component: (props) => <Card className="bg-slate-800/60 border-slate-700/40 backdrop-blur-md shadow-2xl"><CardHeader className="bg-gradient-to-r from-purple-600/80 via-pink-600/80 to-orange-500/80"><CardTitle className="text-3xl font-bold text-white">Productivity Insights</CardTitle><CardDescription className="text-purple-200">Track your progress and stay motivated.</CardDescription></CardHeader><OverallStatsCards {...props} /></Card>,
    default: true,
  },
  {
    id: 'categoryStats',
    name: 'Category Analytics',
    component: (props) => <CategoryStats {...props} />, // Already wrapped in Card
    default: true,
  },
  {
    id: 'priorityChart',
    name: 'Priority Chart',
    component: (props) => <PriorityChart {...props} />, // Already wrapped in Card
    default: true,
  },
  {
    id: 'completionPie',
    name: 'Completion Pie Chart',
    component: (props) => <CompletionPieChart {...props} />, // Already wrapped in Card
    default: true,
  },
  {
    id: 'weeklyCompletion',
    name: 'Weekly Completion Chart',
    component: (props) => <WeeklyCompletionChart {...props} />, // Already wrapped in Card
    default: true,
  },
  {
    id: 'moodProductivity',
    name: 'Mood & Productivity Chart',
    component: (props) => <MoodProductivityChart {...props} />, // Already wrapped in Card
    default: true,
  },
];

const StatsPage = () => {
  const [tasks] = useLocalStorage('tasks', []);
  const [moodLog] = useLocalStorage('moodLog', []);
  const [userPoints] = useLocalStorage('userPoints', 0);

  // Widget preferences (order and visibility)
  const [widgetPrefs, setWidgetPrefs] = useLocalStorage('dashboardWidgetPrefs', {
    order: WIDGETS.map(w => w.id),
    visible: Object.fromEntries(WIDGETS.map(w => [w.id, w.default]))
  });
  const [customizeOpen, setCustomizeOpen] = useState(false);

  // Keep widget order/visibility in sync with available widgets
  useEffect(() => {
    setWidgetPrefs(prev => {
      const newOrder = WIDGETS.map(w => w.id).filter(id => prev.order.includes(id)).concat(WIDGETS.map(w => w.id).filter(id => !prev.order.includes(id)));
      const newVisible = { ...Object.fromEntries(WIDGETS.map(w => [w.id, w.default])), ...prev.visible };
      return { order: newOrder, visible: newVisible };
    });
    // eslint-disable-next-line
  }, []);

  // Widget props
  const widgetProps = {
    tasks,
    moodLog,
    userPoints,
    totalTasks: tasks.length,
    tasksCompleted: tasks.filter(task => task.completed).length,
    completionRate: tasks.length > 0 ? (tasks.filter(task => task.completed).length / tasks.length) * 100 : 0,
  };

  // Rendered widgets
  const renderedWidgets = widgetPrefs.order
    .filter(id => widgetPrefs.visible[id])
    .map(id => {
      const widget = WIDGETS.find(w => w.id === id);
      return widget ? (
        <motion.div key={id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          {widget.component(widgetProps)}
        </motion.div>
      ) : null;
    });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 px-2 sm:px-4 md:px-8 w-full max-w-full"
    >
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 rounded-full bg-purple-700 text-white font-semibold shadow hover:bg-purple-800 transition w-full sm:w-auto"
          onClick={() => setCustomizeOpen(true)}
        >
          Customize Dashboard
        </button>
      </div>
      {/* Customize Modal */}
      {customizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-slate-900 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-md border border-purple-700/40 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-purple-200 mb-4">Customize Dashboard</h2>
            <p className="text-slate-400 mb-4">Show, hide, and reorder your analytics widgets.</p>
            <Reorder.Group axis="y" values={widgetPrefs.order} onReorder={newOrder => setWidgetPrefs(p => ({ ...p, order: newOrder }))} className="space-y-3 mb-6">
              {widgetPrefs.order.map(id => {
                const widget = WIDGETS.find(w => w.id === id);
                return (
                  <Reorder.Item key={id} value={id} className="flex items-center gap-3 bg-slate-800 rounded-lg px-4 py-2 shadow border border-slate-700 cursor-grab">
                    <input
                      type="checkbox"
                      checked={widgetPrefs.visible[id]}
                      onChange={e => setWidgetPrefs(p => ({ ...p, visible: { ...p.visible, [id]: e.target.checked } }))}
                      className="mr-2 accent-purple-500"
                      id={`widget-toggle-${id}`}
                    />
                    <label htmlFor={`widget-toggle-${id}`} className="flex-grow cursor-pointer text-lg text-gray-100">{widget.name}</label>
                    <span className="text-purple-400 text-xl">☰</span>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-slate-700 text-slate-200 hover:bg-slate-600"
                onClick={() => setCustomizeOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rendered widgets */}
      <div className="space-y-8 w-full max-w-full">
        {renderedWidgets}
      </div>
    </motion.div>
  );
};

export default StatsPage;
  