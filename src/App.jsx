import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, NavLink } from 'react-router-dom';
import { Home, BarChart2, Settings, Sun, Moon } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import DashboardPage from '@/pages/DashboardPage';
import StatsPage from '@/pages/StatsPage'; 
import { motion } from 'framer-motion';
import { CategoriesProvider } from '@/context/CategoriesContext';

const App = () => {
  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <CategoriesProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-100">
          <header className="p-4 shadow-lg bg-slate-800/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
              <Link to="/" className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                Routine<span className="text-purple-300">Zen</span>
              </Link>
              <nav className="flex items-center space-x-2 sm:space-x-4">
                <NavLink to="/" className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-purple-600/70 ${isActive ? 'bg-purple-600 text-white' : 'text-gray-300'}`}>
                  <Home className="w-5 h-5 mr-2" /> Dashboard
                </NavLink>
                <NavLink to="/stats" className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-purple-600/70 ${isActive ? 'bg-purple-600 text-white' : 'text-gray-300'}`}>
                  <BarChart2 className="w-5 h-5 mr-2" /> Stats
                </NavLink>
                <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-gray-300 hover:text-white hover:bg-purple-600/70">
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
              </nav>
            </div>
          </header>

          <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/stats" element={<StatsPage />} />
              </Routes>
            </motion.div>
          </main>

          <footer className="p-4 text-center text-sm text-gray-400 bg-slate-800/50 backdrop-blur-md">
            <p>© {new Date().getFullYear()} RoutineZen. Stay Productive!</p>
           
            <p class="text-sm tracking-widest uppercase font-mono">
     <span class="text-ellipsis font-semibold">Developed by Aman Pushp.</span> All rights reserved.
  </p>
          </footer>
          <Toaster />
        </div>
      </Router>
    </CategoriesProvider>
  );
};

export default App;
  