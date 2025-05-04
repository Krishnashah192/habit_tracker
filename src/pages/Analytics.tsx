import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { useHabits } from '../hooks/useHabits';
import { HabitType } from '../contexts/HabitContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Analytics: React.FC = () => {
  const { habits, habitLogs, getCompletionRate } = useHabits();
  const [selectedTimeframe, setSelectedTimeframe] = useState(30);
  
  // Add theme colors for the charts
  const typeColors: Record<HabitType, string> = {
    spiritual: '#8b5cf6',
    emotional: '#ec4899',
    economical: '#10b981',
    mental: '#3b82f6',
    general: '#6b7280',
    physical: '#ef4444',
  };
  
  // Calculate completion rate by type
  const habitTypeData = Object.values(
    habits.reduce((acc, habit) => {
      const type = habit.type;
      if (!acc[type]) {
        acc[type] = {
          type,
          count: 0,
          completed: 0,
          rate: 0,
        };
      }
      
      acc[type].count += 1;
      acc[type].completed += habitLogs.filter(
        log => log.habitId === habit.id && log.completed
      ).length;
      
      return acc;
    }, {} as Record<string, { type: string; count: number; completed: number; rate: number }>)
  ).map(item => ({
    ...item,
    rate: item.count > 0 ? (item.completed / (item.count * selectedTimeframe)) * 100 : 0,
  }));
  
  // Prepare data for pie chart - habits by type
  const habitsByTypeData = {
    labels: Object.keys(typeColors).map(type => 
      type.charAt(0).toUpperCase() + type.slice(1)
    ),
    datasets: [
      {
        data: Object.keys(typeColors).map(type => 
          habits.filter(habit => habit.type === type).length
        ),
        backgroundColor: Object.values(typeColors),
      },
    ],
  };
  
  // Prepare data for completion trend chart
  const today = new Date();
  const startDate = subDays(today, selectedTimeframe - 1);
  const dateRange = eachDayOfInterval({ start: startDate, end: today });
  
  const completionTrendData = {
    labels: dateRange.map(date => format(date, 'MMM d')),
    datasets: [
      {
        label: 'Completion Rate',
        data: dateRange.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const dailyLogs = habitLogs.filter(log => log.date === dateStr);
          
          if (dailyLogs.length === 0 || habits.length === 0) return 0;
          
          const completed = dailyLogs.filter(log => log.completed).length;
          return (completed / habits.length) * 100;
        }),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };
  
  // Prepare data for individual habit performance
  const habitPerformanceData = {
    labels: habits.map(habit => habit.name.length > 15 
      ? habit.name.substring(0, 15) + '...' 
      : habit.name
    ),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: habits.map(habit => getCompletionRate(habit.id, selectedTimeframe)),
        backgroundColor: habits.map(habit => typeColors[habit.type]),
      },
    ],
  };
  
  // Options for bar chart
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-600">Track your progress and gain insights</p>
      </div>
      
      <div className="flex justify-end">
        <select
          className="input max-w-xs"
          value={selectedTimeframe}
          onChange={e => setSelectedTimeframe(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>
      
      {habits.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">You need to create habits to see analytics.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Habits by Type</h2>
            <div className="w-full h-64">
              <Pie 
                data={habitsByTypeData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Performance by Habit Type</h2>
            <div className="w-full h-64 overflow-hidden">
              <Bar 
                data={{
                  labels: habitTypeData.map(item => 
                    item.type.charAt(0).toUpperCase() + item.type.slice(1)
                  ),
                  datasets: [
                    {
                      label: 'Completion Rate (%)',
                      data: habitTypeData.map(item => item.rate),
                      backgroundColor: habitTypeData.map(item => typeColors[item.type as HabitType]),
                    },
                  ],
                }} 
                options={barOptions}
              />
            </div>
          </div>
          
          <div className="card md:col-span-2">
            <h2 className="text-lg font-medium mb-4">Daily Completion Trend</h2>
            <div className="w-full h-64">
              <Line 
                data={completionTrendData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      min: 0,
                      max: 100,
                      ticks: {
                        callback: function(value: any) {
                          return value + '%';
                        }
                      }
                    }
                  },
                }}
              />
            </div>
          </div>
          
          <div className="card md:col-span-2">
            <h2 className="text-lg font-medium mb-4">Individual Habit Performance</h2>
            <div className="w-full h-96">
              <Bar 
                data={habitPerformanceData} 
                options={{
                  ...barOptions,
                  indexAxis: 'y' as const,
                  maintainAspectRatio: false,
                  plugins: {
                    ...barOptions.plugins,
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;