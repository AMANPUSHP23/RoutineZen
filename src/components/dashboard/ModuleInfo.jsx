import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, Github, Linkedin, Globe, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const ModuleInfo = () => {
  const [isOpen, setIsOpen] = useState(false);

  const modules = [
    {
      title: 'Task Management',
      description: 'Create, edit, and track your daily tasks with ease',
      features: ['Priority levels', 'Categories', 'Due dates', 'Progress tracking']
    },
    {
      title: 'Focus Mode',
      description: 'Concentrate on one task at a time',
      features: ['Distraction-free interface', 'Timer', 'Progress tracking']
    },
    {
      title: 'Analytics',
      description: 'Track your productivity and progress',
      features: ['Task completion rates', 'Streak tracking', 'Points system']
    },
    {
      title: 'Mood Tracking',
      description: 'Monitor your daily mood and productivity',
      features: ['Daily mood logging', 'Productivity correlation', 'Trend analysis']
    }
  ];

  return (
    <div className="fixed z-[60] right-4 bottom-4 sm:top-20 sm:right-4 sm:bottom-auto">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-14 h-14 sm:w-10 sm:h-10"
      >
        <Info className="w-7 h-7 sm:w-5 sm:h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 w-full h-full z-[70] flex justify-end sm:top-0 sm:left-auto sm:right-0 sm:w-80 sm:h-auto sm:justify-center"
          >
            <Card className="bg-slate-800/90 backdrop-blur-md border-purple-500/20 h-full sm:h-auto overflow-y-auto w-full sm:w-80 max-w-full rounded-none sm:rounded-2xl p-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="text-xl font-bold text-purple-300">RoutineZen</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-12 w-12 sm:h-8 sm:w-8 text-purple-300 hover:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <X className="h-7 w-7 sm:h-4 sm:w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 min-w-0 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {/* Modules */}
                <div className="space-y-3">
                  {modules.map((module) => (
                    <motion.div
                      key={module.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/20 min-w-0"
                    >
                      <h3 className="font-semibold text-purple-300 mb-1">{module.title}</h3>
                      <p className="text-sm text-purple-200/80 mb-2">{module.description}</p>
                      <ul className="text-xs text-purple-200/60 space-y-1">
                        {module.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>

                {/* Developer Info */}
                <div className="pt-4 border-t border-purple-500/20">
                  <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
                    <img
                      src="https://github.com/AMANPUSHP23.png"
                      alt="Aman Pushp"
                      className="w-20 h-20 sm:w-10 sm:h-10 rounded-full border-2 border-purple-500"
                    />
                    <div className="text-center sm:text-left break-words max-w-full">
                      <h4 className="font-medium text-purple-300">Aman Pushp</h4>
                      <p className="text-sm text-purple-200/80">Full Stack Developer</p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 sm:h-8 sm:w-8 text-purple-300 hover:text-purple-200 hover:bg-purple-600/20"
                      onClick={() => window.open('https://github.com/AMANPUSHP23', '_blank')}
                    >
                      <Github className="h-5 w-5 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 sm:h-8 sm:w-8 text-purple-300 hover:text-purple-200 hover:bg-purple-600/20"
                      onClick={() => window.open('https://www.linkedin.com/in/aman-pushp-b1a501223/', '_blank')}
                    >
                      <Linkedin className="h-5 w-5 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 sm:h-8 sm:w-8 text-purple-300 hover:text-purple-200 hover:bg-purple-600/20"
                      onClick={() => window.open('https://www.instagram.com/aman_pushp23/', '_blank')}
                    >
                      <Instagram className="h-5 w-5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModuleInfo; 