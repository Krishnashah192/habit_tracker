import React, { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import HabitCard from '../components/HabitCard';
import Modal from '../components/Modal';
import HabitForm from '../components/HabitForm';
import { useHabits } from '../hooks/useHabits';

const Dashboard: React.FC = () => {
  const { habits, getHabitLogsForDate } = useHabits();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const displayDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  
  const navigateDay = (direction: 'prev' | 'next') => {
    setSelectedDate(current => 
      direction === 'prev' ? subDays(current, 1) : addDays(current, 1)
    );
  };
  
  const resetToToday = () => {
    setSelectedDate(new Date());
  };
  
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  
  // Calculate completion for current date
  const habitLogs = getHabitLogsForDate(formattedDate);
  const completedHabits = habitLogs.filter(log => log.completed).length;
  const totalHabits = habits.length;
  const completionPercentage = totalHabits > 0 
    ? Math.round((completedHabits / totalHabits) * 100) 
    : 0;
  
  // Group habits by type
  const habitsByType = habits.reduce((groups, habit) => {
    const group = groups[habit.type] || [];
    return { ...groups, [habit.type]: [...group, habit] };
  }, {} as Record<string, typeof habits>);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Track and manage your daily habits</p>
        </div>
        
        <button 
          className="btn btn-primary flex items-center gap-2 self-start sm:self-auto" 
          onClick={toggleModal}
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add New Habit</span>
        </button>
      </div>
      
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Today's Progress</h2>
            <p className="opacity-90">Keep up the good work!</p>
          </div>
          
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm w-full md:w-auto">
            <div className="text-center">
              <p className="text-lg font-medium">{completedHabits} of {totalHabits} completed</p>
              <div className="w-full bg-white/20 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-white h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">{completionPercentage}% complete</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateDay('prev')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h2 className="text-base sm:text-lg font-medium">{displayDate}</h2>
          {!isToday && (
            <button 
              onClick={resetToToday}
              className="text-sm text-primary-600 hover:underline"
            >
              Return to Today
            </button>
          )}
        </div>
        
        <button
          onClick={() => navigateDay('next')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {habits.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500 mb-4">You don't have any habits yet.</p>
          <button className="btn btn-primary" onClick={toggleModal}>
            Add Your First Habit
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(habitsByType).map(([type, habitsOfType]) => (
            <div key={type}>
              <h3 className="text-lg font-medium mb-3 capitalize">{type} Habits</h3>
              <div className="grid gap-3">
                {habitsOfType.map(habit => (
                  <HabitCard 
                    key={habit.id} 
                    habit={habit} 
                    showActions={false}
                    date={formattedDate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={toggleModal}
        title="Create New Habit"
      >
        <HabitForm onSubmit={toggleModal} />
      </Modal>
    </div>
  );
};

export default Dashboard;