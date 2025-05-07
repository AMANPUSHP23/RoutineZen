import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Meh, Frown, Laugh, Angry, Annoyed as Tired } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const moodOptions = [
  { value: 'laugh', label: 'Awesome!', icon: <Laugh className="mr-2 h-5 w-5 text-green-400" /> },
  { value: 'smile', label: 'Good', icon: <Smile className="mr-2 h-5 w-5 text-lime-400" /> },
  { value: 'meh', label: 'Okay', icon: <Meh className="mr-2 h-5 w-5 text-yellow-400" /> },
  { value: 'frown', label: 'Not Great', icon: <Frown className="mr-2 h-5 w-5 text-orange-400" /> },
  { value: 'angry', label: 'Bad', icon: <Angry className="mr-2 h-5 w-5 text-red-400" /> },
  { value: 'tired', label: 'Tired', icon: <Tired className="mr-2 h-5 w-5 text-blue-400" /> },
];

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'var(--background-input)',
    borderColor: state.isFocused ? 'var(--ring)' : 'var(--border-input)',
    boxShadow: state.isFocused ? `0 0 0 1px var(--ring)` : 'none',
    '&:hover': {
      borderColor: 'var(--ring)',
    },
    color: 'var(--foreground-input)',
    borderRadius: '0.375rem', 
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--background-popover)',
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--accent)' : 'var(--background-popover)',
    color: state.isSelected ? 'var(--primary-foreground)' : 'var(--popover-foreground)',
    '&:hover': {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
    },
    display: 'flex',
    alignItems: 'center',
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: 'var(--foreground-input)',
    display: 'flex',
    alignItems: 'center',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--muted-foreground)',
     display: 'flex',
    alignItems: 'center',
  }),
  input: (provided) => ({
    ...provided,
    color: 'var(--foreground-input)',
  }),
};

const formatOptionLabel = ({ label, icon }) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    {icon}
    <span>{label}</span>
  </div>
);

const MoodTracker = () => {
  const [moodLog, setMoodLog] = useLocalStorage('moodLog', []);
  const [selectedMood, setSelectedMood] = useState(null);
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];
  const todaysMood = moodLog.find(log => log.date === today);

  useEffect(() => {
    if (todaysMood) {
      setSelectedMood(moodOptions.find(opt => opt.value === todaysMood.mood));
    } else {
      setSelectedMood(null);
    }
  }, [todaysMood]);
  
  const handleMoodSave = () => {
    if (!selectedMood) {
      toast({
        title: "No Mood Selected",
        description: "Please select your current mood.",
        variant: "destructive",
      });
      return;
    }
    const newLogEntry = { date: today, mood: selectedMood.value };
    const existingEntryIndex = moodLog.findIndex(log => log.date === today);

    if (existingEntryIndex > -1) {
      const updatedLog = [...moodLog];
      updatedLog[existingEntryIndex] = newLogEntry;
      setMoodLog(updatedLog);
    } else {
      setMoodLog([...moodLog, newLogEntry]);
    }
    toast({
      title: "Mood Logged!",
      description: `You're feeling ${selectedMood.label.toLowerCase()} today.`,
      className: "bg-blue-500 text-white dark:bg-blue-600",
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="bg-slate-800/60 border-slate-700/40 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-gray-100">How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedMood}
            onChange={setSelectedMood}
            options={moodOptions}
            styles={{
              ...customStyles,
              menuPortal: base => ({ ...base, zIndex: 99999 }),
            }}
            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
            placeholder={<div><Smile className="mr-2 h-5 w-5 text-slate-400" />Select your mood...</div>}
            formatOptionLabel={formatOptionLabel}
            getOptionValue={(option) => option.value}
            classNamePrefix="react-select"
          />
          <Button onClick={handleMoodSave} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
            {todaysMood ? 'Update Mood' : 'Log Mood'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MoodTracker;
  