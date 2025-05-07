
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
    import { PlusCircle, Trash } from 'lucide-react';
    import { motion } from 'framer-motion';

    const TaskActionControls = ({ onOpenTaskForm, onClearAllTasks, hasTasks }) => {
      return (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 py-4 border-t border-b border-slate-700/50 mb-6">
          <Button onClick={onOpenTaskForm} className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md flex items-center justify-center">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Detailed Task
          </Button>
          {hasTasks && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center justify-center">
                    <Trash className="mr-2 h-4 w-4" /> Clear All Tasks
                  </Button>
                </motion.div>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-800 border-slate-700 text-gray-100">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    This action cannot be undone. This will permanently delete all your tasks and reset your points.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onClearAllTasks} className="bg-red-600 hover:bg-red-700">
                    Yes, delete all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      );
    };

    export default TaskActionControls;
  