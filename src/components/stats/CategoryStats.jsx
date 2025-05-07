import React, { useState, useRef, useEffect } from 'react';
import { useCategories } from '@/context/CategoriesContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import 'chartjs-plugin-zoom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const CategoryStats = () => {
  const { categories } = useCategories();
  const [tasks] = useLocalStorage('tasks', []);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [trendGranularity, setTrendGranularity] = useState('week'); // 'week', '2weeks', 'month', 'quarter'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [compareCategories, setCompareCategories] = useState([]);
  const [drilldown, setDrilldown] = useState(null); // { category, period, tasks }
  const [pdfLoading, setPdfLoading] = useState(false);
  const analyticsRef = useRef(null);
  const [analyticsTheme, setAnalyticsTheme] = useState('dark'); // 'dark' or 'light'

  // Helper to check if a task is in the date range
  const isInRange = (task) => {
    if (!startDate && !endDate) return true;
    const created = task.createdAt ? task.createdAt.slice(0, 10) : '';
    if (startDate && created < startDate) return false;
    if (endDate && created > endDate) return false;
    return true;
  };

  // Helper to get period label from date
  const getPeriodLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (trendGranularity === 'month') {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (trendGranularity === 'quarter') {
      const q = Math.floor(date.getMonth() / 3) + 1;
      return `${date.getFullYear()}-Q${q}`;
    } else if (trendGranularity === '2weeks') {
      // Biweekly: get week number, then group by pairs
      const firstJan = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date - firstJan) / 86400000);
      const week = Math.ceil((days + firstJan.getDay() + 1) / 7);
      const biweek = Math.ceil(week / 2);
      return `${date.getFullYear()}-BW${String(biweek).padStart(2, '0')}`;
    } else {
      // Week: YYYY-WW
      const firstJan = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date - firstJan) / 86400000);
      const week = Math.ceil((days + firstJan.getDay() + 1) / 7);
      return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
    }
  };

  // Calculate stats
  const stats = categories.map(cat => {
    const filteredTasks = tasks.filter(t => t.category === cat.name && isInRange(t));
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.completed).length;
    const pending = total - completed;
    return { ...cat, total, completed, pending };
  });

  const maxTotal = Math.max(...stats.map(s => s.total), 1);

  // Gather all periods in range
  const completedTasks = tasks.filter(t => t.completed && isInRange(t));
  const allPeriodsSet = new Set(completedTasks.map(t => getPeriodLabel(t.completedAt || t.createdAt)));
  const allPeriods = Array.from(allPeriodsSet).sort();

  // Build data for each category
  const trendData = categories.map(cat => {
    const catTasks = completedTasks.filter(t => t.category === cat.name);
    const counts = {};
    allPeriods.forEach(period => { counts[period] = 0; });
    catTasks.forEach(t => {
      const period = getPeriodLabel(t.completedAt || t.createdAt);
      if (counts[period] !== undefined) counts[period]++;
    });
    return {
      label: `${cat.icon} ${cat.name}`,
      data: allPeriods.map(period => counts[period]),
      borderColor: cat.color,
      backgroundColor: cat.color,
      tension: 0.3,
    };
  });

  // Find selected category details
  const selectedCat = categories.find(cat => cat.name === selectedCategory);
  const selectedStats = stats.find(cat => cat.name === selectedCategory);
  const selectedTasks = tasks.filter(t => t.category === selectedCategory && isInRange(t));
  const selectedCompleted = selectedTasks.filter(t => t.completed);
  const selectedStreak = selectedCompleted.length > 0 ? selectedCompleted.reduce((max, t) => Math.max(max, t.streak || 0), 0) : 0;

  // Helper for best streak per category
  const getBestStreak = (catName) => {
    const catTasks = tasks.filter(t => t.category === catName && isInRange(t) && t.completed);
    return catTasks.length > 0 ? catTasks.reduce((max, t) => Math.max(max, t.streak || 0), 0) : 0;
  };

  // CSV export logic
  const exportCSV = () => {
    const header = ['Category', 'Icon', 'Color', 'Total Tasks', 'Completed', 'Pending'];
    const rows = stats.map(cat => [cat.name, cat.icon, cat.color, cat.total, cat.completed, cat.pending]);
    const csvContent = [header, ...rows]
      .map(row => row.map(String).map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'category-stats.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as image
  const exportImage = async () => {
    const node = document.getElementById('category-analytics-section');
    if (!node) return;
    const canvas = await html2canvas(node, { backgroundColor: null, scale: 2 });
    const link = document.createElement('a');
    link.download = 'category-analytics.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Export as PDF
  const exportPDF = async () => {
    const node = analyticsRef.current;
    if (!node) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(node, { backgroundColor: '#18181b', scale: 3, useCORS: true, windowWidth: node.scrollWidth, windowHeight: node.scrollHeight });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('category-analytics.pdf');
    } finally {
      setPdfLoading(false);
    }
  };

  // Drilldown handler for line chart
  const handleLineChartClick = (evt, elements, chart) => {
    if (elements.length > 0) {
      const point = elements[0];
      const catIdx = point.datasetIndex;
      const periodIdx = point.index;
      const cat = categories[catIdx];
      const period = allPeriods[periodIdx];
      // Find tasks for this category and period
      const periodTasks = tasks.filter(t =>
        t.category === cat.name &&
        isInRange(t) &&
        (t.completedAt || t.createdAt) &&
        getPeriodLabel(t.completedAt || t.createdAt) === period &&
        t.completed
      );
      setDrilldown({ category: cat, period, tasks: periodTasks });
    }
  };

  // Gradient color utility
  const getGradient = (ctx, color) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, analyticsTheme === 'dark' ? '#18181b' : '#fff');
    return gradient;
  };

  // Responsive theme class
  const themeClass = analyticsTheme === 'dark'
    ? 'bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 text-gray-100'
    : 'bg-gradient-to-br from-white via-purple-100 to-slate-100 text-gray-900';

  // Pie chart data with gradient
  const pieData = {
    labels: stats.map(cat => `${cat.icon} ${cat.name}`),
    datasets: [
      {
        data: stats.map(cat => cat.total),
        backgroundColor: stats.map((cat, i) => (ctx) => getGradient(ctx.chart.ctx, cat.color)),
        borderColor: '#22223b',
        borderWidth: 2,
        hoverOffset: 16,
      },
    ],
  };

  // Enhanced pie chart options with improved animations and accessibility
  const pieOptions = {
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} tasks (${percentage}%)`;
          },
        },
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        borderColor: '#4b5563',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6,
      },
    },
    onClick: (evt, elements, chart) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        setSelectedCategory(stats[idx].name);
      }
    },
    onHover: (evt, elements, chart) => {
      evt.native.target.style.cursor = elements.length ? 'pointer' : 'default';
    },
    responsive: true,
    maintainAspectRatio: false,
    accessibility: {
      enabled: true,
      description: 'Pie chart showing task distribution across categories',
    },
  };

  // Enhanced line chart options with zoom and pan
  const lineOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        labels: { 
          color: '#fff', 
          font: { size: 13 },
          usePointStyle: true,
          pointStyle: 'circle',
        },
        onClick: (e, legendItem, legend) => {
          setSelectedCategory(categories[legendItem.datasetIndex].name);
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} completed (${percentage}%)`;
          },
        },
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        borderColor: '#4b5563',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: 'ctrl',
        },
        zoom: {
          wheel: {
            enabled: true,
            modifierKey: 'ctrl',
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
      },
    },
    scales: {
      x: {
        ticks: { 
          color: '#fff',
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { 
          color: '#444',
          drawBorder: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#fff' },
        grid: { 
          color: '#444',
          drawBorder: false,
        },
      },
    },
    onClick: handleLineChartClick,
    onHover: (evt, elements, chart) => {
      evt.native.target.style.cursor = elements.length ? 'pointer' : 'default';
    },
    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
    },
    accessibility: {
      enabled: true,
      description: 'Line chart showing task completion trends over time',
    },
  };

  // Light/dark mode toggle effect
  useEffect(() => {
    document.body.classList.toggle('analytics-light', analyticsTheme === 'light');
    document.body.classList.toggle('analytics-dark', analyticsTheme === 'dark');
  }, [analyticsTheme]);

  return (
    <div 
      id="category-analytics-section" 
      ref={analyticsRef} 
      className={`${themeClass} border border-slate-700/40 rounded-2xl p-8 shadow-2xl mt-8 mb-8 w-full max-w-5xl mx-auto`}
      role="region"
      aria-label="Category Analytics Dashboard"
    >
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <h2 className="text-2xl font-extrabold mb-0 tracking-tight flex items-center gap-3">
          <span className="inline-block w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-lg text-3xl">📊</span>
          Category Analytics
        </h2>
        <div className="flex gap-2 items-center">
          <button
            className={`px-3 py-1 rounded ${analyticsTheme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-gray-900'} text-xs font-semibold shadow border border-slate-500`}
            onClick={() => setAnalyticsTheme(analyticsTheme === 'dark' ? 'light' : 'dark')}
          >
            {analyticsTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow"
            onClick={exportCSV}
          >
            Export CSV
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow"
            onClick={exportImage}
          >
            Export Image
          </button>
          <button
            className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow flex items-center gap-2"
            onClick={exportPDF}
            disabled={pdfLoading}
          >
            {pdfLoading ? (
              <svg className="animate-spin h-4 w-4 mr-1 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            ) : (
              <span className="font-bold">⭳</span>
            )}
            Download PDF
          </button>
        </div>
      </div>
      <hr className="my-6 border-slate-700/40" />
      {/* Date filter */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <label className="text-slate-300 text-sm flex items-center gap-2">
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-gray-100"
          />
        </label>
        <label className="text-slate-300 text-sm flex items-center gap-2">
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-gray-100"
          />
        </label>
        {(startDate || endDate) && (
          <button
            className="ml-2 px-3 py-1 rounded bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 text-xs"
            onClick={() => { setStartDate(''); setEndDate(''); }}
          >
            Clear Filter
          </button>
        )}
      </div>
      {/* Enhanced table with keyboard navigation */}
      <div className="overflow-x-auto mb-6">
        <table 
          className="min-w-full text-sm text-left text-gray-300"
          role="grid"
          aria-label="Category Statistics"
        >
          <thead>
            <tr className="bg-slate-700 text-purple-200">
              <th className="px-4 py-2" role="columnheader">Category</th>
              <th className="px-4 py-2" role="columnheader">Total Tasks</th>
              <th className="px-4 py-2" role="columnheader">Completed</th>
              <th className="px-4 py-2" role="columnheader">Pending</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(cat => (
              <tr 
                key={cat.name} 
                className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors duration-200"
                role="row"
                tabIndex={0}
                onClick={() => setSelectedCategory(cat.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedCategory(cat.name);
                  }
                }}
              >
                <td className="px-4 py-2 flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full" style={{ background: cat.color }} aria-hidden="true"></span>
                  <span className="text-lg" aria-hidden="true">{cat.icon}</span> 
                  <span>{cat.name}</span>
                </td>
                <td className="px-4 py-2 font-semibold">{cat.total}</td>
                <td className="px-4 py-2 text-green-400">{cat.completed}</td>
                <td className="px-4 py-2 text-yellow-300">{cat.pending}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Enhanced bar chart with animations */}
      <div className="flex items-end gap-4 h-32 mt-4 mb-8">
        {stats.map(cat => (
          <div 
            key={cat.name} 
            className="flex flex-col items-center w-16 group"
            role="button"
            tabIndex={0}
            onClick={() => setSelectedCategory(cat.name)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedCategory(cat.name);
              }
            }}
            aria-label={`${cat.name}: ${cat.total} tasks`}
          >
            <div
              className={`w-10 rounded-t-xl cursor-pointer transition-all duration-300 shadow-lg ${
                selectedCategory === cat.name 
                  ? 'ring-4 ring-purple-400 scale-110 z-10' 
                  : 'group-hover:ring-2 group-hover:ring-purple-300'
              }`}
              style={{
                height: `${(cat.total / maxTotal) * 100}%`,
                background: cat.color,
                minHeight: 8,
                transition: 'all 0.3s ease-out',
              }}
              title={`${cat.name}: ${cat.total} tasks`}
            ></div>
            <span 
              className="mt-2 text-sm text-center text-gray-100 truncate w-12 cursor-pointer font-bold" 
              title={cat.name}
            >
              {cat.icon}
            </span>
          </div>
        ))}
      </div>
      {/* Enhanced pie chart section */}
      <div className="mt-8 flex flex-col items-center justify-center">
        <div className="bg-slate-900/90 rounded-2xl shadow-xl p-6 flex flex-col items-center w-full max-w-lg">
          <div className="w-full h-80 flex items-center justify-center">
            <Pie data={pieData} options={pieOptions} />
          </div>
          {/* Enhanced custom legend with keyboard navigation */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {stats.map(cat => (
              <button
                key={cat.name}
                className={`flex items-center gap-2 px-3 py-1 rounded-full shadow border border-slate-700 text-sm font-semibold mb-2 transition-all duration-300 ${
                  selectedCategory === cat.name 
                    ? 'bg-purple-600 text-white scale-105' 
                    : 'bg-slate-800/80 text-gray-100 hover:bg-purple-700/60 hover:text-white'
                }`}
                onClick={() => setSelectedCategory(cat.name)}
                style={{ outline: selectedCategory === cat.name ? '2px solid #a78bfa' : 'none' }}
                aria-pressed={selectedCategory === cat.name}
                aria-label={`${cat.name} category: ${cat.total} tasks`}
              >
                <span className="inline-block w-5 h-5 rounded-full mr-1" style={{ background: cat.color }} aria-hidden="true"></span>
                <span className="text-lg mr-1" aria-hidden="true">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <hr className="my-8 border-slate-700/40" />
      {/* Enhanced trends line chart section */}
      <div className="mt-10">
        <div className="flex items-center gap-4 mb-2 flex-wrap">
          <h3 className="text-lg font-bold tracking-tight">Trends Over Time</h3>
          <div className="flex gap-2 items-center">
            <label className="text-slate-300 text-xs font-semibold" htmlFor="trendGranularity">Group by:</label>
            <select
              id="trendGranularity"
              value={trendGranularity}
              onChange={e => setTrendGranularity(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-gray-100"
              aria-label="Select time period grouping"
            >
              <option value="week">Week</option>
              <option value="2weeks">2 Weeks</option>
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
            </select>
          </div>
        </div>
        <div className="bg-slate-900/90 rounded-xl p-4 shadow-lg overflow-x-auto">
          <Line
            data={{
              labels: allPeriods,
              datasets: selectedCategory
                ? trendData.filter(d => d.label.endsWith(selectedCat ? selectedCat.name : ''))
                : trendData,
            }}
            options={lineOptions}
            height={320}
          />
        </div>
      </div>
      {/* Selected category details */}
      {selectedCat && (
        <div className="mt-8 bg-slate-900/90 rounded-xl p-6 border border-purple-700 shadow-lg">
          <h4 className="text-lg font-bold text-purple-300 mb-2 flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full" style={{ background: selectedCat.color }}></span>
            <span className="text-2xl">{selectedCat.icon}</span> {selectedCat.name} Details
          </h4>
          <div className="mb-2 text-slate-200 text-sm">
            <span className="mr-4">Total Tasks: <b>{selectedStats.total}</b></span>
            <span className="mr-4">Completed: <b className="text-green-400">{selectedStats.completed}</b></span>
            <span className="mr-4">Pending: <b className="text-yellow-300">{selectedStats.pending}</b></span>
            <span>Best Streak: <b className="text-blue-400">{selectedStreak}</b></span>
          </div>
          <div className="max-h-40 overflow-y-auto mt-2">
            <table className="min-w-full text-xs text-left text-gray-300">
              <thead>
                <tr className="bg-slate-800 text-purple-200">
                  <th className="px-2 py-1">Task</th>
                  <th className="px-2 py-1">Created</th>
                  <th className="px-2 py-1">Completed</th>
                  <th className="px-2 py-1">Streak</th>
                </tr>
              </thead>
              <tbody>
                {selectedTasks.map(task => (
                  <tr key={task.id} className="border-b border-slate-700">
                    <td className="px-2 py-1 truncate max-w-xs">{task.name}</td>
                    <td className="px-2 py-1">{task.createdAt ? task.createdAt.slice(0, 10) : '-'}</td>
                    <td className="px-2 py-1">{task.completed ? (task.completedAt ? task.completedAt.slice(0, 10) : '✓') : '-'}</td>
                    <td className="px-2 py-1">{task.streak || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Category comparison multi-select */}
      <div className="mt-8 mb-4">
        <label className="text-slate-300 text-sm font-semibold mr-2">Compare Categories:</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map(cat => (
            <button
              key={cat.name}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-150 ${compareCategories.includes(cat.name) ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'}`}
              onClick={() => setCompareCategories(compareCategories.includes(cat.name)
                ? compareCategories.filter(c => c !== cat.name)
                : [...compareCategories, cat.name])}
            >
              <span className="mr-1">{cat.icon}</span>{cat.name}
            </button>
          ))}
        </div>
      </div>
      {/* Comparison table */}
      {compareCategories.length > 0 && (
        <div className="overflow-x-auto mb-8 rounded-xl shadow-lg bg-slate-900/80 p-4">
          <h4 className="text-base font-bold text-purple-300 mb-4">Category Comparison</h4>
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead>
              <tr className="bg-slate-700 text-purple-200">
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Total Tasks</th>
                <th className="px-4 py-2">Completed</th>
                <th className="px-4 py-2">Pending</th>
                <th className="px-4 py-2">Best Streak</th>
              </tr>
            </thead>
            <tbody>
              {compareCategories.map(catName => {
                const cat = categories.find(c => c.name === catName);
                const stat = stats.find(s => s.name === catName);
                return (
                  <tr key={catName} className="border-b border-slate-700">
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full" style={{ background: cat.color }}></span>
                      <span className="text-lg">{cat.icon}</span> {cat.name}
                    </td>
                    <td className="px-4 py-2 font-semibold">{stat.total}</td>
                    <td className="px-4 py-2 text-green-400">{stat.completed}</td>
                    <td className="px-4 py-2 text-yellow-300">{stat.pending}</td>
                    <td className="px-4 py-2 text-blue-400">{getBestStreak(catName)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* Drilldown modal */}
      {drilldown && (
        <Dialog open={!!drilldown} onOpenChange={open => !open && setDrilldown(null)}>
          <DialogContent className="bg-slate-800 border-slate-700 text-gray-100 max-w-lg rounded-xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full" style={{ background: drilldown.category.color }}></span>
                <span className="text-xl">{drilldown.category.icon}</span> {drilldown.category.name}
                <span className="ml-2 text-purple-300 text-xs font-mono">{drilldown.period}</span>
              </DialogTitle>
              <DialogDescription>Tasks completed in this period</DialogDescription>
            </DialogHeader>
            <div className="max-h-60 overflow-y-auto mt-2">
              {drilldown.tasks.length === 0 ? (
                <div className="text-slate-400 text-sm text-center py-4">No tasks completed in this period.</div>
              ) : (
                <table className="min-w-full text-xs text-left text-gray-300">
                  <thead>
                    <tr className="bg-slate-800 text-purple-200">
                      <th className="px-2 py-1">Task</th>
                      <th className="px-2 py-1">Created</th>
                      <th className="px-2 py-1">Completed</th>
                      <th className="px-2 py-1">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drilldown.tasks.map(task => (
                      <tr key={task.id} className="border-b border-slate-700">
                        <td className="px-2 py-1 truncate max-w-xs">{task.name}</td>
                        <td className="px-2 py-1">{task.createdAt ? task.createdAt.slice(0, 10) : '-'}</td>
                        <td className="px-2 py-1">{task.completedAt ? task.completedAt.slice(0, 10) : '✓'}</td>
                        <td className="px-2 py-1">{task.streak || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button className="px-3 py-1 rounded bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 text-xs">Close</button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CategoryStats; 