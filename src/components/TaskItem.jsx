import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3, Clock, Zap, AlertTriangle, Flame, Target, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import CollaboratorInvite from './CollaboratorInvite';

const priorityStyles = {
  high: 'border-red-500 bg-red-500/10 text-red-400',
  medium: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
  low: 'border-green-500 bg-green-500/10 text-green-400',
};

const priorityIcons = {
  high: <AlertTriangle className="h-4 w-4 text-red-500" />,
  medium: <Zap className="h-4 w-4 text-yellow-500" />,
  low: <Clock className="h-4 w-4 text-green-500" />,
};

const TaskItem = ({ task, onToggleComplete, onDelete, onEdit, onFocus, collaborators = [], onCollaboratorInvite }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="mb-4"
    >
      <Card className={cn(
        "bg-slate-800/70 border-slate-700/50 backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-purple-500/30",
        task.completed && "bg-slate-700/50 border-slate-600/40 opacity-70"
      )}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-grow min-w-0">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="border-purple-400 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 flex-shrink-0"
            />
            <div className="flex-grow min-w-0">
              <label
                htmlFor={`task-${task.id}`}
                className={cn(
                  "text-lg font-medium text-gray-100 cursor-pointer block truncate",
                  task.completed && "line-through text-gray-400"
                )}
              >
                {task.name}
                {task.category && (
                  <span
                    className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold border align-middle flex items-center gap-1"
                    style={{
                      background: task.categoryColor || '#a3a3a3',
                      borderColor: task.categoryColor || '#a3a3a3',
                      color: '#fff',
                    }}
                  >
                    {task.categoryIcon || ''} {task.category}
                  </span>
                )}
              </label>
              <div className="flex items-center space-x-2 mt-1 flex-wrap">
                {task.timeSlot && (
                  <span className="text-xs text-slate-400 flex items-center whitespace-nowrap">
                    <Clock className="h-3 w-3 mr-1 text-purple-400" />
                    {task.timeSlot}
                  </span>
                )}
                {task.priority && (
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full flex items-center font-medium whitespace-nowrap",
                    priorityStyles[task.priority]
                  )}>
                    {priorityIcons[task.priority]}
                    <span className="ml-1 capitalize">{task.priority}</span>
                  </span>
                )}
                {task.streak > 0 && (
                   <span className="text-xs text-orange-400 flex items-center font-medium px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500 whitespace-nowrap">
                     <Flame className="h-3 w-3 mr-1" /> {task.streak} Day{task.streak > 1 ? 's' : ''}
                   </span>
                )}
              </div>
              {/* Collaborators section */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {collaborators.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {collaborators.map((c, i) => (
                      <span key={c + i} className="px-2 py-0.5 rounded-full bg-blue-700 text-white text-xs flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                {!task.completed && onCollaboratorInvite && (
                  <CollaboratorInvite
                    task={task}
                    onInvite={(email) => onCollaboratorInvite(task.id, email)}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {!task.completed && onFocus && (
              <Button variant="ghost" size="icon" onClick={() => onFocus(task)} className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/20">
                <Target className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20">
              <Edit3 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/20">
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TaskItem;
  