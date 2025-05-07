
    import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Checkbox } from '@/components/ui/checkbox';
    import { XCircle, Play, Pause, RotateCcw, Zap, AlertTriangle, Clock as ClockIcon } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { cn } from '@/lib/utils';

    const priorityStyles = {
      high: 'text-red-400',
      medium: 'text-yellow-400',
      low: 'text-green-400',
    };
    
    const priorityIcons = {
      high: <AlertTriangle className="h-5 w-5" />,
      medium: <Zap className="h-5 w-5" />,
      low: <ClockIcon className="h-5 w-5" />,
    };

    const FocusModeView = ({ task, onExit, onToggleComplete }) => {
      const FOCUS_DURATION_MINUTES = 25;
      const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION_MINUTES * 60);
      const [isActive, setIsActive] = useState(false);

      useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
          interval = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
          }, 1000);
        } else if (timeLeft === 0 && isActive) {
          setIsActive(false);
          new Audio('/sounds/notification.mp3').play().catch(e => console.log("Audio play failed", e)); // Ensure you have a sound file here
        }
        return () => clearInterval(interval);
      }, [isActive, timeLeft]);

      const toggleTimer = () => setIsActive(!isActive);
      const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(FOCUS_DURATION_MINUTES * 60);
      };

      const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      };
      
      const handleToggleComplete = () => {
        onToggleComplete(task.id);
        onExit(); // Optionally exit focus mode on completion
      };

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 z-[100]"
        >
          <Card className="w-full max-w-md bg-slate-800/80 border-slate-700/60 text-gray-100 shadow-2xl">
            <CardHeader className="text-center relative">
              <Button variant="ghost" size="icon" onClick={onExit} className="absolute top-2 right-2 text-slate-400 hover:text-slate-200">
                <XCircle className="h-7 w-7" />
              </Button>
              <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 pt-8">
                Focus Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-8 py-10">
              <div className="text-center">
                <h2 className="text-4xl font-semibold mb-2 truncate max-w-xs sm:max-w-sm md:max-w-md">{task.name}</h2>
                <div className="flex items-center justify-center space-x-3 text-slate-400">
                  {task.priority && (
                    <span className={cn("flex items-center text-sm", priorityStyles[task.priority])}>
                      {React.cloneElement(priorityIcons[task.priority], {className: "h-4 w-4 mr-1"})}
                       {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </span>
                  )}
                  {task.timeSlot && (
                    <span className="flex items-center text-sm">
                      <ClockIcon className="h-4 w-4 mr-1 text-purple-400" />
                      {task.timeSlot}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-7xl font-mono font-bold text-purple-300 my-6">
                {formatTime(timeLeft)}
              </div>

              <div className="flex space-x-4">
                <Button onClick={toggleTimer} className={cn(
                  "px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300",
                  isActive ? "bg-yellow-500 hover:bg-yellow-600 text-slate-900" : "bg-green-500 hover:bg-green-600 text-white"
                )}>
                  {isActive ? <Pause className="mr-2 h-6 w-6" /> : <Play className="mr-2 h-6 w-6" />}
                  {isActive ? 'Pause' : 'Start'}
                </Button>
                <Button onClick={resetTimer} variant="outline" className="px-8 py-3 text-lg font-semibold rounded-lg border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100">
                  <RotateCcw className="mr-2 h-6 w-6" /> Reset
                </Button>
              </div>
              
              <div className="flex items-center space-x-3 pt-6">
                <Checkbox
                  id={`focus-complete-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={handleToggleComplete}
                  className="h-6 w-6 border-purple-400 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                />
                <label htmlFor={`focus-complete-${task.id}`} className="text-lg text-slate-200 cursor-pointer">
                  Mark as Completed
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default FocusModeView;
  