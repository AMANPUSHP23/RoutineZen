
    import React from 'react';
    import TaskItem from '@/components/TaskItem';
    import { AnimatePresence, motion } from 'framer-motion';
    import { Card, CardContent } from '@/components/ui/card';
    import { CheckCircle, ListChecks } from 'lucide-react';

    const TaskList = ({ tasks, onToggleComplete, onDelete, onEdit, onFocus, title, icon }) => {
      if (!tasks || tasks.length === 0) {
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10"
          >
            <Card className="bg-slate-800/50 border-slate-700/30 p-6 inline-block shadow-lg">
              <CardContent className="flex flex-col items-center text-slate-400">
                {icon === "pending" ? <ListChecks className="w-16 h-16 mb-4 text-purple-400" /> : <CheckCircle className="w-16 h-16 mb-4 text-green-400" />}
                <p className="text-xl font-semibold">{icon === "pending" ? "No pending tasks!" : "No completed tasks yet!"}</p>
                <p className="text-sm">{icon === "pending" ? "Add some tasks to get started." : "Complete some tasks to see them here."}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      }

      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }}>
          <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 flex items-center">
            {icon === "pending" ? <ListChecks className="w-7 h-7 mr-3 text-purple-400" /> : <CheckCircle className="w-7 h-7 mr-3 text-green-400" />}
            {title} ({tasks.length})
          </h2>
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
                onFocus={onFocus}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      );
    };

    export default TaskList;
  