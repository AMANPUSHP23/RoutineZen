import React, { useState, useEffect, useRef } from 'react';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import MoodTracker from '@/components/MoodTracker';
import DailySummary from '@/components/DailySummary';
import QuoteOfTheDay from '@/components/QuoteOfTheDay';
import FocusModeView from '@/components/FocusModeView';
import ModuleInfo from '@/components/dashboard/ModuleInfo';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { CalendarDays, Award, Trash } from 'lucide-react';
import { useCategories } from '@/context/CategoriesContext';
import TaskFilters from '@/components/dashboard/TaskFilters';
import TaskItem from '@/components/TaskItem';

const POINTS_PER_TASK = 10;

const CATEGORIES = ['All', 'Work', 'Personal', 'Fitness', 'Study', 'Chores', 'Learn', 'Other'];

const DashboardPage = () => {
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [userPoints, setUserPoints] = useLocalStorage('userPoints', 0);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);
  const [focusTask, setFocusTask] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const { toast } = useToast();
  const { categories, setCategories } = useCategories();
  const notificationIntervalRef = useRef(null);
  // Advanced filter/search state
  const [searchTerm, setSearchTerm] = useState('');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const todayISO = new Date().toISOString().split('T')[0];

  const addTask = (task) => {
    const newTask = { 
      ...task, 
      createdAt: new Date().toISOString(), 
      streak: 0, 
      lastCompletedDate: null 
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const editTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? {...task, ...updatedTask} : task))
    );
    setTaskToEdit(null);
  };

  const handleEdit = (task) => {
    setTaskToEdit(task);
  };

  const handleFormSubmit = (taskData) => {
    if (taskToEdit) {
      editTask(taskData);
    } else {
      addTask(taskData);
    }
  };

  const toggleComplete = (taskId) => {
    let pointsChange = 0;
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const wasCompleted = task.completed;
          const isNowCompleted = !wasCompleted;
          let newStreak = task.streak || 0;
          let newLastCompletedDate = task.lastCompletedDate;

          if (isNowCompleted) {
            pointsChange = POINTS_PER_TASK;
            const yesterdayISO = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (task.lastCompletedDate === yesterdayISO) {
              newStreak += 1;
            } else if (task.lastCompletedDate !== todayISO) { 
              newStreak = 1; 
            }
            newLastCompletedDate = todayISO;
          } else {
            pointsChange = -POINTS_PER_TASK;
            if (task.lastCompletedDate === todayISO) {
               newStreak = Math.max(0, newStreak -1);
               
               const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
               if (newStreak === 0) newLastCompletedDate = null;
               else newLastCompletedDate = twoDaysAgo; 
            }
          }
          return { 
            ...task, 
            completed: isNowCompleted, 
            completedAt: isNowCompleted ? new Date().toISOString() : null,
            streak: newStreak,
            lastCompletedDate: newLastCompletedDate
          };
        }
        return task;
      })
    );
    
    setUserPoints(prevPoints => Math.max(0, prevPoints + pointsChange));

    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) { 
        toast({
            title: "Task Completed!",
            description: `"${task.name}" marked as complete. You earned ${POINTS_PER_TASK} points!`,
            className: "bg-green-500 text-white dark:bg-green-600",
        });
    } else if (task && task.completed) { 
         toast({
            title: "Task Incomplete",
            description: `"${task.name}" marked as incomplete. Points adjusted.`,
            className: "bg-yellow-500 text-white dark:bg-yellow-600",
        });
    }
  };

  const confirmDeleteTask = (taskId) => {
    setTaskToDeleteId(taskId);
    setShowDeleteConfirmation(true);
  };
  
  const deleteTask = () => {
    if (taskToDeleteId) {
      const task = tasks.find(t => t.id === taskToDeleteId);
      if (task && task.completed) { 
        setUserPoints(prevPoints => Math.max(0, prevPoints - POINTS_PER_TASK));
      }
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskToDeleteId));
      toast({
        title: "Task Deleted",
        description: `Task "${task?.name || 'Unknown'}" has been removed.`,
        variant: "destructive",
      });
    }
    setShowDeleteConfirmation(false);
    setTaskToDeleteId(null);
  };

  const clearAllTasks = () => {
    setTasks([]);
    setUserPoints(0); 
    toast({
      title: "All Tasks Cleared",
      description: "Your task list and points are now reset.",
      variant: "destructive",
    });
  };

  const startFocusMode = (task) => {
    setFocusTask(task);
  };

  const exitFocusMode = () => {
    setFocusTask(null);
  };

  // Filtering logic
  const filteredTasks = tasks.filter(task => {
    // Search
    if (searchTerm && !task.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    // Category
    if (activeCategory !== 'All' && task.category !== activeCategory) return false;
    // Priority
    if (priority !== 'All' && (task.priority || 'Medium').toLowerCase() !== priority.toLowerCase()) return false;
    // Status
    if (status === 'Completed' && !task.completed) return false;
    if (status === 'Pending' && task.completed) return false;
    // Date range (createdAt)
    if (dateFrom && (!task.createdAt || task.createdAt.slice(0, 10) < dateFrom)) return false;
    if (dateTo && (!task.createdAt || task.createdAt.slice(0, 10) > dateTo)) return false;
    return true;
  });
  const pendingTasks = filteredTasks.filter((task) => !task.completed);
  const completedTasks = filteredTasks.filter((task) => task.completed);

  const completionPercentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Helper to get color for a category
  const getCategoryColor = (cat) => {
    if (cat === 'All') return '#a78bfa'; // purple for All
    const found = categories.find(c => c.name === cat);
    return found ? found.color : '#a3a3a3';
  };

  // Helper to get icon for a category
  const getCategoryIcon = (cat) => {
    if (cat === 'All') return '📋';
    const foundCat = categories.find(c => c.name === cat);
    return foundCat && foundCat.icon ? foundCat.icon : '';
  };

  // Notification logic
  useEffect(() => {
    // Ask for notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    // Clear any previous interval
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }
    // Check for due reminders every minute
    notificationIntervalRef.current = setInterval(() => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const now = new Date();
      tasks.forEach(task => {
        if (
          task.reminderDateTime &&
          !task.completed &&
          !task.reminderNotified &&
          new Date(task.reminderDateTime) <= now
        ) {
          // Show notification
          new Notification("Task Reminder", {
            body: `⏰ ${task.name}`,
            icon: "/favicon.ico"
          });
          // Mark as notified (update in localStorage)
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, reminderNotified: true } : t));
        }
      });
    }, 60000); // every minute
    return () => clearInterval(notificationIntervalRef.current);
  }, [tasks, setTasks]);

  // Upcoming reminders (next 5, sorted)
  const upcomingReminders = tasks
    .filter(t => t.reminderDateTime && !t.completed && new Date(t.reminderDateTime) > new Date())
    .sort((a, b) => new Date(a.reminderDateTime) - new Date(b.reminderDateTime))
    .slice(0, 5);

  const handleCollaboratorInvite = (taskId, email) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              collaborators: [
                ...(task.collaborators || []),
                email
              ]
            }
          : task
      )
    );
    toast({
      title: 'Success',
      description: `Invitation (mock) sent to ${email}`
    });
  };

  if (focusTask) {
    return <FocusModeView task={focusTask} onExit={exitFocusMode} onToggleComplete={toggleComplete} />;
  }

  return (
    <>
      <ModuleInfo />
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 sm:space-y-8 px-2 sm:px-4 md:px-8 w-full max-w-full"
        >
          <Card className="w-full bg-slate-800/60 border-slate-700/40 backdrop-blur-md shadow-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-purple-600/80 via-pink-600/80 to-orange-500/80">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 w-full">
                <div>
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                    {getGreeting()}, User!
                  </CardTitle>
                  <CardDescription className="text-purple-200 mt-1 text-base sm:text-lg">
                    Ready to conquer your day? Let's get things done.
                  </CardDescription>
                </div>
                <CalendarDays className="w-10 h-10 sm:w-12 sm:h-12 text-white/70" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2 w-full">
                <h3 className="text-base sm:text-lg font-medium text-gray-200">Daily Progress</h3>
                <span className="text-sm font-semibold text-purple-300">{Math.round(completionPercentage)}% Complete</span>
              </div>
              <Progress value={completionPercentage} className="w-full h-3 bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-orange-400" />
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 w-full">
                 <h3 className="text-base sm:text-lg font-medium text-gray-200">Points Earned</h3>
                 <span className="text-lg font-bold text-yellow-400 flex items-center">
                    <Award className="w-5 h-5 mr-1" /> {userPoints}
                 </span>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                <TaskForm 
                  onSubmit={handleFormSubmit} 
                  taskToEdit={taskToEdit} 
                  onFormClose={() => setTaskToEdit(null)}
                  tasks={tasks}
                />
                {tasks.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="destructive" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-md">
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
                        <AlertDialogAction onClick={clearAllTasks} className="bg-red-600 hover:bg-red-700">
                          Yes, delete all
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full max-w-full">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
              <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="flex flex-wrap gap-2 mb-4">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      style={{
                        background: activeCategory === category ? getCategoryColor(category) : undefined,
                        borderColor: getCategoryColor(category),
                        color: activeCategory === category ? '#fff' : getCategoryColor(category),
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-150
                        ${activeCategory === category
                          ? ''
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700/70 hover:text-slate-100'}`}
                    >
                      <span className="mr-1">{getCategoryIcon(category)}</span>{category}
                    </button>
                  ))}
                </div>
                <TaskFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  priority={priority}
                  onPriorityChange={setPriority}
                  status={status}
                  onStatusChange={setStatus}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onDateFromChange={setDateFrom}
                  onDateToChange={setDateTo}
                />
                <div className="space-y-2">
                  {pendingTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={() => toggleComplete(task.id)}
                      onDelete={() => confirmDeleteTask(task.id)}
                      onEdit={() => handleEdit(task)}
                      onFocus={() => startFocusMode(task)}
                      collaborators={task.collaborators || []}
                      onCollaboratorInvite={handleCollaboratorInvite}
                    />
                  ))}
                </div>
              </motion.div>
              <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <div className="space-y-2 mt-8">
                  {completedTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={() => toggleComplete(task.id)}
                      onDelete={() => confirmDeleteTask(task.id)}
                      onEdit={() => handleEdit(task)}
                      onFocus={() => startFocusMode(task)}
                      collaborators={task.collaborators || []}
                      onCollaboratorInvite={handleCollaboratorInvite}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
            <div className="space-y-6 sm:space-y-8 relative z-0 w-full min-w-0">
              <div>
                <QuoteOfTheDay />
              </div>
              <div>
                <MoodTracker />
              </div>
              <div>
                <DailySummary tasks={tasks} userPoints={userPoints} />
              </div>
            </div>
          </div>
          
          {showDeleteConfirmation && (
             <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
              <AlertDialogContent className="bg-slate-800 border-slate-700 text-gray-100">
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    Are you sure you want to delete this task? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => {setShowDeleteConfirmation(false); setTaskToDeleteId(null);}} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={deleteTask} className="bg-red-600 hover:bg-red-700">
                    Delete Task
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Upcoming Reminders Section */}
          {upcomingReminders.length > 0 && (
            <Card className="bg-slate-800/60 border-slate-700/40 shadow-xl mb-4">
              <CardHeader>
                <CardTitle className="text-lg text-purple-300 flex items-center gap-2">
                  <span role="img" aria-label="reminder">⏰</span> Upcoming Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {upcomingReminders.map(task => (
                    <li key={task.id} className="flex items-center justify-between text-gray-200">
                      <span className="truncate font-medium">{task.name}</span>
                      <span className="ml-4 text-xs text-purple-200">
                        {new Date(task.reminderDateTime).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default DashboardPage;
  