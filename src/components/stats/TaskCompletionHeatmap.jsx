import React, { useMemo, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import 'react-calendar-heatmap/dist/styles.css';

const getDateString = date => date.toISOString().split('T')[0];

function getStreaks(values) {
  let current = 0, best = 0, temp = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i].count > 0) {
      temp++;
      if (temp > best) best = temp;
    } else {
      temp = 0;
    }
  }
  // Current streak: count from end
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i].count > 0) current++;
    else break;
  }
  return { current, best };
}

function generateFakeTasks() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 179);
  const fakeTasks = [];
  let completionsPerWeek = 0;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Always generate at least 1 completion every 3 days
    let count = 0;
    if (d.getDay() === 1 || d.getDay() === 4) { // Mondays and Thursdays always have completions
      count = Math.floor(Math.random() * 3) + 2; // 2-4 completions
    } else if (Math.random() < 0.7) {
      count = Math.floor(Math.random() * 2) + 1; // 1-2 completions
    }
    completionsPerWeek += count;
    for (let i = 0; i < count; i++) {
      fakeTasks.push({
        id: `${getDateString(d)}-fake-${i}`,
        name: `Demo Task ${i + 1}`,
        completed: true,
        completedAt: getDateString(new Date(d)),
        category: ['Work', 'Personal', 'Fitness', 'Study'][Math.floor(Math.random() * 4)],
      });
    }
    // If it's Sunday, ensure at least 3 completions this week
    if (d.getDay() === 0 && completionsPerWeek < 3) {
      for (let j = 0; j < 3 - completionsPerWeek; j++) {
        fakeTasks.push({
          id: `${getDateString(d)}-fake-extra-${j}`,
          name: `Demo Task Extra ${j + 1}`,
          completed: true,
          completedAt: getDateString(new Date(d)),
          category: ['Work', 'Personal', 'Fitness', 'Study'][Math.floor(Math.random() * 4)],
        });
      }
      completionsPerWeek = 0;
    }
    if (d.getDay() === 0) completionsPerWeek = 0;
  }
  // Safety: if for any reason no completions, add some for today
  if (fakeTasks.length === 0) {
    for (let i = 0; i < 5; i++) {
      fakeTasks.push({
        id: `${getDateString(endDate)}-fake-safety-${i}`,
        name: `Demo Task Safety ${i + 1}`,
        completed: true,
        completedAt: getDateString(new Date(endDate)),
        category: ['Work', 'Personal', 'Fitness', 'Study'][i % 4],
      });
    }
  }
  return fakeTasks;
}

const TaskCompletionHeatmap = ({ tasks = [] }) => {
  console.log('TaskCompletionHeatmap received tasks:', tasks);
  const [selectedDay, setSelectedDay] = useState(null);
  // Default to demo mode if no real completions exist
  const hasRealCompletions = tasks && tasks.some(t => t.completed && t.completedAt);
  console.log('Has real completions:', hasRealCompletions);
  const [demo, setDemo] = useState(!hasRealCompletions);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 179);
  const todayStr = getDateString(new Date());

  // Use fake data if demo mode is on
  const displayTasks = demo ? generateFakeTasks() : tasks;
  console.log('Display tasks:', displayTasks);

  // Map tasks to date counts
  const dateCount = {};
  const dateTasks = {};
  displayTasks.forEach(task => {
    if (task.completed && task.completedAt) {
      const date = getDateString(new Date(task.completedAt));
      dateCount[date] = (dateCount[date] || 0) + 1;
      if (!dateTasks[date]) dateTasks[date] = [];
      dateTasks[date].push(task);
    }
  });
  console.log('Date counts:', dateCount);

  // Build heatmap values
  const values = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = getDateString(d);
    values.push({
      date: dateStr,
      count: dateCount[dateStr] || 0,
    });
  }
  console.log('Heatmap values:', values);

  // Streaks
  const { current, best } = useMemo(() => getStreaks(values), [values]);

  // Color scale
  const getClassForValue = value => {
    if (!value) return 'color-empty';
    if (value.date === todayStr) return 'color-today';
    if (value.count >= 5) return 'color-scale-4';
    if (value.count >= 3) return 'color-scale-3';
    if (value.count >= 1) return 'color-scale-2';
    return 'color-empty';
  };

  // Tooltip
  const tooltipDataAttrs = value => {
    if (!value || !value.date) return null;
    return {
      'data-tip': `${value.date}: ${value.count} task${value.count === 1 ? '' : 's'} completed`,
    };
  };

  const handleCellClick = (value) => {
    if (value && value.count > 0) {
      setSelectedDay(value.date);
    }
  };

  // Smaller, more compact cells
  const transformCell = (rectProps, value) => {
    const { x, y, width, height, ...rest } = rectProps;
    const radius = 4;
    return (
      <rect
        x={x + 1}
        y={y + 1}
        width={width - 2}
        height={height - 2}
        rx={radius}
        ry={radius}
        className={getClassForValue(value)}
        style={{
          opacity: 0,
          animation: `fadeInCell 0.7s ${Math.random() * 0.5}s forwards`,
          cursor: value && value.count > 0 ? 'pointer' : 'default',
          stroke: value && value.date === todayStr ? '#a855f7' : undefined,
          strokeWidth: value && value.date === todayStr ? 2 : undefined,
        }}
        onClick={() => handleCellClick(value)}
        {...rest}
      />
    );
  };

  // Month labels on top
  const monthLabels = useMemo(() => {
    const months = [];
    let lastMonth = '';
    values.forEach((v, i) => {
      const month = new Date(v.date).toLocaleString('default', { month: 'short' });
      if (month !== lastMonth) {
        months.push({ month, index: i });
        lastMonth = month;
      }
    });
    return months;
  }, [values]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl p-6 my-8 border border-purple-700/30 max-w-3xl mx-auto overflow-x-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-2 gap-2">
        <h3 className="text-xl font-bold text-purple-200 flex items-center gap-2 mb-2 md:mb-0">
          <span className="inline-block w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-lg text-lg">📅</span>
          Task Completion Heatmap
        </h3>
        <div className="flex gap-4 text-sm text-slate-300 items-center">
          <span className="bg-slate-800/80 px-3 py-1 rounded-full border border-purple-700/40">🔥 Current Streak: <b className="text-green-400">{current}</b></span>
          <span className="bg-slate-800/80 px-3 py-1 rounded-full border border-purple-700/40">🏆 Best Streak: <b className="text-yellow-300">{best}</b></span>
        </div>
      </div>
      <div className="flex justify-end mb-2">
        <button
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-150 ${demo ? 'bg-purple-700 text-white border-purple-700' : 'bg-slate-800 text-purple-200 border-slate-700 hover:bg-purple-700/30'}`}
          onClick={() => setDemo(d => !d)}
        >
          {demo ? 'Show My Data' : 'Demo Mode'}
        </button>
      </div>
      <p className="text-slate-400 mb-4">See your daily task completion streaks over the last 6 months.</p>
      <div className="relative w-full overflow-x-auto pb-2 flex flex-col items-center">
        <div className="flex ml-12 mb-1" style={{ minWidth: 320 }}>
          {monthLabels.map((m, i) => (
            <span 
              key={m.month + m.index} 
              className="text-xs font-bold text-purple-300 mr-4" 
              style={{ 
                marginLeft: i === 0 ? `${Math.max(0, m.index * 10)}px` : '0',
                display: 'inline-block',
                minWidth: '40px'
              }}
            >
              {m.month}
            </span>
          ))}
        </div>
        <div style={{ maxWidth: 320 }}>
          <>
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={values}
              classForValue={getClassForValue}
              tooltipDataAttrs={tooltipDataAttrs}
              showWeekdayLabels={true}
              horizontal={false}
              gutterSize={1}
              rectRender={transformCell}
              transformDayElement={(element, value, index) => {
                if (!element) return null;
                return React.cloneElement(element, {
                  ...element.props,
                  style: {
                    ...element.props.style,
                    opacity: 0,
                    animation: `fadeInCell 0.7s ${Math.random() * 0.5}s forwards`,
                  },
                });
              }}
            />
            <Tooltip
              effect="solid"
              className="!bg-slate-800 !text-purple-200 !rounded-lg !px-3 !py-2 !text-xs !shadow-xl border border-purple-700/40"
              delayShow={100}
            />
          </>
        </div>
      </div>
      <div className="flex gap-2 mt-4 text-xs text-slate-300 items-center justify-center">
        <span>Less</span>
        <span className="w-4 h-4 rounded bg-slate-700 border border-slate-600"></span>
        <span className="w-4 h-4 rounded bg-green-400/30"></span>
        <span className="w-4 h-4 rounded bg-green-400/60"></span>
        <span className="w-4 h-4 rounded bg-green-400"></span>
        <span className="w-4 h-4 rounded bg-green-600"></span>
        <span>More</span>
      </div>
      {/* Drilldown modal for clicked day */}
      <Dialog open={!!selectedDay} onOpenChange={open => !open && setSelectedDay(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-gray-100 max-w-lg rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full bg-purple-600"></span>
              <span className="text-xl">{selectedDay}</span>
            </DialogTitle>
            <DialogDescription>Tasks completed on this day</DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto mt-2">
            {selectedDay && (!dateTasks[selectedDay] || dateTasks[selectedDay].length === 0) ? (
              <div className="text-slate-400 text-sm text-center py-4">No tasks completed on this day.</div>
            ) : (
              <ul className="list-disc pl-6">
                {selectedDay && dateTasks[selectedDay].map(task => (
                  <li key={task.id} className="mb-1">
                    <span className="font-semibold text-green-300">{task.name}</span>
                    {task.category && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: '#22223b', color: '#a78bfa' }}>{task.category}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-3 py-1 rounded bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 text-xs">Close</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <style>{`
        .color-empty { fill: #334155; transition: fill 0.3s; }
        .color-scale-1 { fill: #4ade80; transition: fill 0.3s; }
        .color-scale-2 { fill: #22c55e; transition: fill 0.3s; }
        .color-scale-3 { fill: #16a34a; transition: fill 0.3s; }
        .color-scale-4 { fill: #166534; transition: fill 0.3s; }
        .color-today { fill: #a855f7; stroke: #fff; stroke-width: 2; transition: fill 0.3s; }
        .react-calendar-heatmap .react-calendar-heatmap-weekday-label { fill: #a78bfa; font-weight: 600; }
        .react-calendar-heatmap text { font-size: 0.7rem; }
        @keyframes fadeInCell { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default TaskCompletionHeatmap; 