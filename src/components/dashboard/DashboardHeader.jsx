
    import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Progress } from '@/components/ui/progress';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { CalendarDays, Award, PlusCircle, Target as TargetIcon } from 'lucide-react';
    import { motion } from 'framer-motion';

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
    };

    const DashboardHeader = ({ 
      userPoints, 
      tasks,
      onQuickAddTask,
      dailyTaskGoal,
      onSetDailyTaskGoal,
      completedTasksCount
    }) => {
      const [quickTaskName, setQuickTaskName] = useState('');
      const [goalInput, setGoalInput] = useState(dailyTaskGoal || 0);

      const handleQuickAdd = (e) => {
        e.preventDefault();
        if (quickTaskName.trim()) {
          onQuickAddTask(quickTaskName.trim());
          setQuickTaskName('');
        }
      };

      const handleGoalSet = () => {
        const newGoal = parseInt(goalInput, 10);
        if (!isNaN(newGoal) && newGoal >= 0) {
          onSetDailyTaskGoal(newGoal);
        }
      };
      
      const completionPercentage = tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0;
      const goalProgress = dailyTaskGoal > 0 ? (completedTasksCount / dailyTaskGoal) * 100 : 0;


      return (
        <Card className="bg-slate-800/60 border-slate-700/40 backdrop-blur-md shadow-2xl overflow-hidden">
          <CardHeader className="p-6 bg-gradient-to-r from-purple-600/80 via-pink-600/80 to-orange-500/80">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-bold text-white">
                  {getGreeting()}, User!
                </CardTitle>
                <CardDescription className="text-purple-200 mt-1">
                  Ready to conquer your day? Let's get things done.
                </CardDescription>
              </div>
              <CalendarDays className="w-12 h-12 text-white/70" />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Quick Add Task */}
            <motion.form 
              onSubmit={handleQuickAdd} 
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            >
              <Input
                type="text"
                value={quickTaskName}
                onChange={(e) => setQuickTaskName(e.target.value)}
                placeholder="Quick add a new task..."
                className="flex-grow bg-slate-700/80 border-slate-600/70 placeholder-slate-400 text-white"
              />
              <Button type="submit" size="icon" className="bg-purple-500 hover:bg-purple-600 text-white flex-shrink-0">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </motion.form>

            {/* Daily Progress */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium text-gray-300">Overall Daily Progress</h3>
                <span className="text-xs font-semibold text-purple-300">{Math.round(completionPercentage)}% Complete</span>
              </div>
              <Progress value={completionPercentage} className="w-full h-2 bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-orange-400" />
            </div>
            
            {/* Daily Goal */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="daily-goal" className="text-sm text-gray-300 whitespace-nowrap">Daily Task Goal:</Label>
                <Input 
                  type="number" 
                  id="daily-goal"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  min="0"
                  className="w-20 h-8 bg-slate-700/80 border-slate-600/70 text-white text-sm p-1"
                />
                <Button onClick={handleGoalSet} size="sm" variant="outline" className="h-8 text-xs border-slate-600 text-slate-300 hover:bg-slate-700/90">Set Goal</Button>
              </div>
              {dailyTaskGoal > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                     <h3 className="text-sm font-medium text-gray-300 flex items-center">
                        <TargetIcon className="w-4 h-4 mr-1 text-green-400"/>Goal Progress ({completedTasksCount}/{dailyTaskGoal})
                    </h3>
                    <span className="text-xs font-semibold text-green-300">{Math.round(goalProgress)}%</span>
                  </div>
                  <Progress value={goalProgress} className="w-full h-2 bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-teal-400" />
                </div>
              )}
            </div>

            {/* Points Earned */}
            <div className="flex justify-between items-center">
               <h3 className="text-lg font-medium text-gray-200">Points Earned</h3>
               <span className="text-lg font-bold text-yellow-400 flex items-center">
                  <Award className="w-5 h-5 mr-1" /> {userPoints}
               </span>
            </div>
          </CardContent>
        </Card>
      );
    };

    export default DashboardHeader;
  