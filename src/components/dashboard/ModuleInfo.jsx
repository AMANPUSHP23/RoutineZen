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
    <div className="fixed top-20 right-4 z-50">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300"
      >
        <Info className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 right-0 w-80"
          >
            <Card className="bg-slate-800/90 backdrop-blur-md border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold text-purple-300">RoutineZen</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-purple-300 hover:text-purple-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Modules */}
                <div className="space-y-3">
                  {modules.map((module) => (
                    <motion.div
                      key={module.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/20"
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
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src="https://github.com/AMANPUSHP23.png"
                      alt="Aman Pushp"
                      className="w-10 h-10 rounded-full border-2 border-purple-500"
                    />
                    <div>
                      <h4 className="font-medium text-purple-300">Aman Pushp</h4>
                      <p className="text-sm text-purple-200/80">Full Stack Developer</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-purple-300 hover:text-purple-200 hover:bg-purple-600/20"
                      onClick={() => window.open('https://github.com/AMANPUSHP23', '_blank')}
                    >
                      <Github className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-purple-300 hover:text-purple-200 hover:bg-purple-600/20"
                      onClick={() => window.open('https://www.linkedin.com/in/aman-pushp-b1a501223/', '_blank')}
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-purple-300 hover:text-purple-200 hover:bg-purple-600/20"
                      onClick={() => window.open('https://www.instagram.com/aman_pushp23/', '_blank')}
                    >
                      <Instagram className="h-4 w-4" />
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