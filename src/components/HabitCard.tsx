import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Circle, Pencil, Trash2, Info } from 'lucide-react';
import { Habit, HabitType } from '../contexts/HabitContext';
import { useHabits } from '../hooks/useHabits';

interface HabitCardProps {
  habit: Habit;
  showActions?: boolean;
  onEdit?: () => void;
  date?: string;
}

const typeIcons: Record<HabitType, JSX.Element> = {
  spiritual: <span className="text-spiritual">✨</span>,
  emotional: <span className="text-emotional">❤️</span>,
  economical: <span className="text-economical">💰</span>,
  mental: <span className="text-mental">🧠</span>,
  general: <span className="text-general">📝</span>,
  physical: <span className="text-physical">💪</span>,
};

const typeLabels: Record<HabitType, string> = {
  spiritual: 'Spiritual',
  emotional: 'Emotional',
  economical: 'Economical',
  mental: 'Mental',
  general: 'General',
  physical: 'Physical',
};

const HabitCard: React.FC<HabitCardProps> = ({ 
  habit, 
  showActions = true,
  onEdit,
  date = format(new Date(), 'yyyy-MM-dd')
}) => {
  const { toggleHabitCompletion, deleteHabit, habitLogs, getCurrentStreak } = useHabits();
  
  const isCompleted = habitLogs.some(log => 
    log.habitId === habit.id && 
    log.date === date && 
    log.completed
  );
  
  const streak = getCurrentStreak(habit.id);
  
  const handleToggle = () => {
    toggleHabitCompletion(habit.id, date);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(habit.id);
    }
  };

  return (
    <div className={`card habit-${habit.type} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleToggle}
            className="focus:outline-none transition-transform duration-200 hover:scale-110"
          >
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-gray-400" />
            )}
          </button>
          
          <div>
            <h3 className="font-medium text-lg">{habit.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              {typeIcons[habit.type]}
              <span>{typeLabels[habit.type]}</span>
              
              {streak > 0 && (
                <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {streak} day streak 🔥
                </span>
              )}
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-2">
            <button 
              onClick={onEdit}
              className="p-1 text-gray-500 hover:text-primary-600 transition-colors"
              title="Edit habit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
              title="Delete habit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {habit.description && (
        <p className="mt-2 text-sm text-gray-600">{habit.description}</p>
      )}
    </div>
  );
};

export default HabitCard;