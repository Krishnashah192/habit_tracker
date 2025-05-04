import React, { useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import HabitCard from '../components/HabitCard';
import Modal from '../components/Modal';
import HabitForm from '../components/HabitForm';
import { useHabits } from '../hooks/useHabits';
import { Habit, HabitType } from '../contexts/HabitContext';

const HabitsList: React.FC = () => {
  const { habits } = useHabits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<HabitType | 'all'>('all');
  
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      setEditingHabit(undefined);
    }
  };
  
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };
  
  // Filter habits by search term and type
  const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          habit.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || habit.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  // Options for filter dropdown
  const filterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'spiritual', label: 'Spiritual' },
    { value: 'emotional', label: 'Emotional' },
    { value: 'economical', label: 'Economical' },
    { value: 'mental', label: 'Mental' },
    { value: 'general', label: 'General' },
    { value: 'physical', label: 'Physical' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Habits</h1>
          <p className="text-gray-600">View and manage all your habits</p>
        </div>
        
        <button 
          className="btn btn-primary flex items-center gap-2 self-start" 
          onClick={toggleModal}
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New Habit</span>
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search habits..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="input max-w-xs"
          value={filterType}
          onChange={e => setFilterType(e.target.value as HabitType | 'all')}
        >
          {filterOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {habits.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500 mb-4">You don't have any habits yet.</p>
          <button className="btn btn-primary" onClick={toggleModal}>
            Add Your First Habit
          </button>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No habits match your search.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredHabits.map(habit => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              onEdit={() => handleEditHabit(habit)}
            />
          ))}
        </div>
      )}
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={toggleModal}
        title={editingHabit ? "Edit Habit" : "Create New Habit"}
      >
        <HabitForm 
          onSubmit={toggleModal} 
          editingHabit={editingHabit}
        />
      </Modal>
    </div>
  );
};

export default HabitsList;