
    import React from 'react';
    import { Card, CardContent } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { Activity, CheckSquare, ListTodo, TrendingUp } from 'lucide-react';

    const StatCard = ({ icon, value, label, colorClass }) => (
      <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
        <Card className="bg-slate-700/50 border-slate-600/30 text-center p-6 h-full">
          {React.cloneElement(icon, { className: `w-10 h-10 mx-auto mb-2 ${colorClass}` })}
          <p className="text-3xl font-bold text-gray-100">{value}</p>
          <p className="text-slate-300 text-sm">{label}</p>
        </Card>
      </motion.div>
    );

    const OverallStatsCards = ({ totalTasks, tasksCompleted, completionRate, userPoints }) => {
      return (
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<ListTodo />} value={totalTasks} label="Total Tasks" colorClass="text-purple-400" />
          <StatCard icon={<CheckSquare />} value={tasksCompleted} label="Tasks Completed" colorClass="text-green-400" />
          <StatCard icon={<Activity />} value={`${completionRate.toFixed(0)}%`} label="Completion Rate" colorClass="text-orange-400" />
          <StatCard icon={<TrendingUp />} value={userPoints} label="Total Points" colorClass="text-yellow-400" />
        </CardContent>
      );
    };

    export default OverallStatsCards;
  