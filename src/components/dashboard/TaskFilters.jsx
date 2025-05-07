import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

const categories = ['All', 'Work', 'Personal', 'Fitness', 'Study', 'Chores', 'Learn', 'Other'];
const priorities = ['All', 'High', 'Medium', 'Low'];
const statuses = ['All', 'Completed', 'Pending'];

const TaskFilters = ({
  searchTerm,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange
}) => {
  return (
    <div className="mb-6 p-4 rounded-lg bg-slate-800/40 border border-slate-700/30 space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Search tasks by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-slate-700/80 border-slate-600/70 placeholder-slate-400 text-white flex-grow"
        />
        {searchTerm && (
          <Button variant="ghost" size="icon" onClick={() => onSearchChange('')} className="text-slate-400 hover:text-slate-200">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-5 w-5 text-slate-400 mr-1" />
        {/* Category */}
        <select
          value={activeCategory}
          onChange={e => onCategoryChange(e.target.value)}
          className="rounded px-2 py-1 bg-slate-700 border border-slate-600 text-slate-200 text-xs"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        {/* Priority */}
        <select
          value={priority}
          onChange={e => onPriorityChange(e.target.value)}
          className="rounded px-2 py-1 bg-slate-700 border border-slate-600 text-slate-200 text-xs"
        >
          {priorities.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {/* Status */}
        <select
          value={status}
          onChange={e => onStatusChange(e.target.value)}
          className="rounded px-2 py-1 bg-slate-700 border border-slate-600 text-slate-200 text-xs"
        >
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {/* Date range */}
        <span className="text-xs text-slate-400 ml-2">From</span>
        <input
          type="date"
          value={dateFrom}
          onChange={e => onDateFromChange(e.target.value)}
          className="rounded px-2 py-1 bg-slate-700 border border-slate-600 text-slate-200 text-xs"
        />
        <span className="text-xs text-slate-400">To</span>
        <input
          type="date"
          value={dateTo}
          onChange={e => onDateToChange(e.target.value)}
          className="rounded px-2 py-1 bg-slate-700 border border-slate-600 text-slate-200 text-xs"
        />
      </div>
    </div>
  );
};

export default TaskFilters;
  