import React, { createContext, useContext } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';

const defaultCategories = [
  { name: 'Work', color: '#6366f1', icon: '💼' },
  { name: 'Personal', color: '#f472b6', icon: '🏠' },
  { name: 'Fitness', color: '#34d399', icon: '🏋️' },
  { name: 'Study', color: '#fbbf24', icon: '📚' },
  { name: 'Chores', color: '#60a5fa', icon: '🧹' },
  { name: 'Learn', color: '#f59e42', icon: '🧠' },
  { name: 'Other', color: '#a3a3a3', icon: '🔖' },
];

const CategoriesContext = createContext();

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useLocalStorage('categories', defaultCategories);
  return (
    <CategoriesContext.Provider value={{ categories, setCategories }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) throw new Error('useCategories must be used within a CategoriesProvider');
  return context;
} 