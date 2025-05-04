import React, { useState } from 'react';
import { Habit, HabitType } from '../contexts/HabitContext';
import { useHabits } from '../hooks/useHabits';

interface HabitFormProps {
  onSubmit: () => void;
  editingHabit?: Habit;
}

const habitTypes: { value: HabitType; label: string; emoji: string }[] = [
  { value: 'spiritual', label: 'Spiritual', emoji: '✨' },
  { value: 'emotional', label: 'Emotional', emoji: '❤️' },
  { value: 'economical', label: 'Economical', emoji: '💰' },
  { value: 'mental', label: 'Mental', emoji: '🧠' },
  { value: 'general', label: 'General', emoji: '📝' },
  { value: 'physical', label: 'Physical', emoji: '💪' },
];

const HabitForm: React.FC<HabitFormProps> = ({ onSubmit, editingHabit }) => {
  const { addHabit, updateHabit } = useHabits();
  
  const [name, setName] = useState(editingHabit?.name || '');
  const [description, setDescription] = useState(editingHabit?.description || '');
  const [type, setType] = useState<HabitType>(editingHabit?.type || 'general');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Habit name is required');
      return;
    }
    
    if (editingHabit) {
      updateHabit(editingHabit.id, { name, description, type });
    } else {
      addHabit({ name, description, type });
    }
    
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="habit-name" className="label">
          Habit Name*
        </label>
        <input
          id="habit-name"
          type="text"
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Meditation, Reading, Exercise"
          autoFocus
        />
      </div>
      
      <div>
        <label htmlFor="habit-description" className="label">
          Description (Optional)
        </label>
        <textarea
          id="habit-description"
          className="input min-h-[80px]"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Why do you want to build this habit?"
        />
      </div>
      
      <div>
        <label className="label">Habit Type*</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {habitTypes.map(habitType => (
            <button
              key={habitType.value}
              type="button"
              className={`p-3 rounded-lg border transition-all ${
                type === habitType.value 
                  ? `bg-${habitType.value}/10 border-${habitType.value} text-${habitType.value}` 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setType(habitType.value)}
            >
              <span className="text-xl mb-1">{habitType.emoji}</span>
              <p className="text-sm font-medium">{habitType.label}</p>
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex gap-3 pt-2">
        <button type="button" className="btn btn-outline" onClick={onSubmit}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary flex-1">
          {editingHabit ? 'Update Habit' : 'Create Habit'}
        </button>
      </div>
    </form>
  );
};

export default HabitForm;