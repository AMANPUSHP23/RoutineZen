
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Award, TrendingUp, MessageSquare } from 'lucide-react';
    import { motion } from 'framer-motion';

    const DailySummary = ({ tasks, userPoints }) => {
      const completedTasks = tasks.filter(task => task.completed).length;
      const totalTasks = tasks.length;
      const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      let motivationalMessage = "Let's get started for the day!";
      if (totalTasks > 0) {
        if (completionPercentage === 100) {
          motivationalMessage = "Amazing! You've crushed all your goals today! 🎉";
        } else if (completionPercentage >= 80) {
          motivationalMessage = "Fantastic effort! You're so close to a perfect day!";
        } else if (completionPercentage >= 50) {
          motivationalMessage = "Great progress! Keep pushing through.";
        } else if (completionPercentage > 0) {
          motivationalMessage = "Good start! Every task completed is a step forward.";
        } else {
          motivationalMessage = "A fresh start! What will you accomplish today?";
        }
      }


      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-slate-800/60 border-slate-700/40 backdrop-blur-md shadow-xl transition-transform transform hover:scale-105">
            <CardHeader className>
              <CardTitle className="text-xl text-gray-100 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-pink-400" />
                Your Daily Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-gray-200">
                <span className="flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-green-400" />Tasks Completed:</span>
                <span>{completedTasks} / {totalTasks} ({completionPercentage.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center justify-between text-gray-200">
                <span className="flex items-center"><Award className="w-5 h-5 mr-2 text-yellow-400" />Total Points:</span>
                <span>{userPoints} ✨</span>
              </div>
              <CardDescription className="text-slate-300 pt-2 border-t border-slate-700">
                {motivationalMessage}
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default DailySummary;
  