import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { Plus, Clock, FileText, Trash2, Edit2, Timer, ChevronDown, ChevronRight, Search, Dumbbell, Layers, X } from 'lucide-react';
import { Workout, WorkoutType, TimerConfig, Exercise, ExerciseCategory, WorkoutExercise, DEFAULT_INTERVAL_PRESETS } from '../types';
import { cn } from '../utils';

type TabType = 'workouts' | 'exercises';

export const WorkoutLibrary: React.FC = () => {
  const { workouts, exercises, addWorkout, updateWorkout, deleteWorkout, addExercise, updateExercise, deleteExercise } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('workouts');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Workout form state
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [workoutForm, setWorkoutForm] = useState<Partial<Workout>>({
      name: '',
      type: WorkoutType.BOULDER,
      durationMinutes: 60,
      description: '',
      steps: []
  });
  const [stepsText, setStepsText] = useState('');
  const [hasTimer, setHasTimer] = useState(false);
  const [timerConfig, setTimerConfig] = useState<TimerConfig>({
    workSeconds: 7,
    restSeconds: 3,
    reps: 6,
    sets: 1,
    restBetweenSetsSeconds: 120
  });
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);

  // Exercise form state
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [exerciseForm, setExerciseForm] = useState<Partial<Exercise>>({
    name: '',
    description: '',
    category: ExerciseCategory.ANTAGONIST,
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: 10
  });

  // Category expansion state
  const [expandedCategories, setExpandedCategories] = useState<Set<ExerciseCategory>>(
    new Set(Object.values(ExerciseCategory))
  );

  // Group exercises by category
  const exercisesByCategory = useMemo(() => {
    const filtered = searchQuery 
      ? exercises.filter(e => 
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : exercises;
    
    const grouped: Record<ExerciseCategory, Exercise[]> = {} as any;
    Object.values(ExerciseCategory).forEach(cat => {
      grouped[cat] = filtered.filter(e => e.category === cat);
    });
    return grouped;
  }, [exercises, searchQuery]);

  // Filter workouts by search
  const filteredWorkouts = useMemo(() => {
    if (!searchQuery) return workouts;
    return workouts.filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workouts, searchQuery]);

  const toggleCategory = (cat: ExerciseCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(cat)) {
      newExpanded.delete(cat);
    } else {
      newExpanded.add(cat);
    }
    setExpandedCategories(newExpanded);
  };

  // Workout handlers
  const handleEditWorkout = (workout: Workout) => {
      setWorkoutForm({
          name: workout.name,
          type: workout.type,
          durationMinutes: workout.durationMinutes,
          description: workout.description,
          steps: workout.steps
      });
      setStepsText(workout.steps.join('\n'));
      setSelectedExercises(workout.exercises || []);
      
      if (workout.timerConfig) {
          setHasTimer(true);
          setTimerConfig(workout.timerConfig);
      } else {
          setHasTimer(false);
          setTimerConfig({ workSeconds: 7, restSeconds: 3, reps: 6, sets: 1, restBetweenSetsSeconds: 120 });
      }
      setEditingWorkoutId(workout.id);
      setIsCreatingWorkout(true);
  };

  const resetWorkoutForm = () => {
      setIsCreatingWorkout(false);
      setEditingWorkoutId(null);
      setWorkoutForm({ name: '', type: WorkoutType.BOULDER, durationMinutes: 60, description: '', steps: [] });
      setStepsText('');
      setHasTimer(false);
      setSelectedExercises([]);
  };

  const handleWorkoutSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(workoutForm.name && workoutForm.type) {
          const finalSteps = stepsText.split('\n').filter(s => s.trim().length > 0);
          const workoutData = {
            ...workoutForm,
            steps: finalSteps,
            timerConfig: hasTimer ? timerConfig : undefined,
            exercises: selectedExercises.length > 0 ? selectedExercises : undefined
          };

          if (editingWorkoutId) {
             updateWorkout({ ...workoutData, id: editingWorkoutId } as Workout);
          } else {
             addWorkout(workoutData as Omit<Workout, 'id'>);
          }
          resetWorkoutForm();
      }
  };

  // Exercise handlers
  const handleEditExercise = (exercise: Exercise) => {
    setExerciseForm({
      name: exercise.name,
      description: exercise.description,
      category: exercise.category,
      difficulty: exercise.difficulty,
      defaultSets: exercise.defaultSets,
      defaultReps: exercise.defaultReps,
      defaultDurationSeconds: exercise.defaultDurationSeconds
    });
    setEditingExerciseId(exercise.id);
    setIsCreatingExercise(true);
  };

  const resetExerciseForm = () => {
    setIsCreatingExercise(false);
    setEditingExerciseId(null);
    setExerciseForm({
      name: '',
      description: '',
      category: ExerciseCategory.ANTAGONIST,
      difficulty: 'Beginner',
      defaultSets: 3,
      defaultReps: 10
    });
  };

  const handleExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exerciseForm.name && exerciseForm.category) {
      if (editingExerciseId) {
        updateExercise({ ...exerciseForm, id: editingExerciseId } as Exercise);
      } else {
        addExercise(exerciseForm as Omit<Exercise, 'id'>);
      }
      resetExerciseForm();
    }
  };

  return (
    <div className="pb-20 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-stone-100">Library</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-stone-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('workouts')}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === 'workouts' 
              ? "bg-amber-500 text-stone-900" 
              : "text-stone-400 hover:text-stone-200"
          )}
        >
          <Layers className="w-4 h-4" /> Workouts
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === 'exercises' 
              ? "bg-amber-500 text-stone-900" 
              : "text-stone-400 hover:text-stone-200"
          )}
        >
          <Dumbbell className="w-4 h-4" /> Exercises
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* WORKOUTS TAB */}
      {activeTab === 'workouts' && (
        <>
          {!isCreatingWorkout ? (
            <>
              <Button onClick={() => setIsCreatingWorkout(true)} size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-1" /> New Workout
              </Button>
              <div className="grid gap-4">
                {filteredWorkouts.map(workout => (
                  <div key={workout.id} className="bg-stone-800 p-4 rounded-xl border border-stone-700">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-stone-100">{workout.name}</h3>
                      <div className="px-2 py-0.5 rounded text-xs bg-stone-700 text-stone-300 uppercase tracking-wide">
                        {workout.type}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-stone-500 mb-3">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {workout.durationMinutes} min</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {workout.steps.length} steps</span>
                      {workout.timerConfig && (
                        <span className="flex items-center gap-1 text-amber-500"><Timer className="w-3 h-3" /> Interval</span>
                      )}
                    </div>
                    <p className="text-stone-400 text-sm mb-4 line-clamp-2">{workout.description}</p>
                    <div className="flex gap-2">
                      <Button variant="danger" size="sm" onClick={() => deleteWorkout(workout.id)} className="px-2">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleEditWorkout(workout)} className="px-2">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredWorkouts.length === 0 && (
                  <p className="text-stone-500 text-center py-8">No workouts found</p>
                )}
              </div>
            </>
          ) : (
            <WorkoutForm
              formData={workoutForm}
              setFormData={setWorkoutForm}
              stepsText={stepsText}
              setStepsText={setStepsText}
              hasTimer={hasTimer}
              setHasTimer={setHasTimer}
              timerConfig={timerConfig}
              setTimerConfig={setTimerConfig}
              selectedExercises={selectedExercises}
              setSelectedExercises={setSelectedExercises}
              availableExercises={exercises}
              onSubmit={handleWorkoutSubmit}
              onCancel={resetWorkoutForm}
              isEditing={!!editingWorkoutId}
            />
          )}
        </>
      )}

      {/* EXERCISES TAB */}
      {activeTab === 'exercises' && (
        <>
          {!isCreatingExercise ? (
            <>
              <Button onClick={() => setIsCreatingExercise(true)} size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-1" /> New Exercise
              </Button>
              <div className="space-y-2">
                {Object.values(ExerciseCategory).map(category => {
                  const categoryExercises = exercisesByCategory[category];
                  const isExpanded = expandedCategories.has(category);
                  
                  return (
                    <div key={category} className="bg-stone-800 rounded-xl border border-stone-700 overflow-hidden">
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between p-3 hover:bg-stone-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-stone-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-stone-400" />
                          )}
                          <span className="font-medium text-stone-200">{category}</span>
                        </div>
                        <span className="text-xs text-stone-500 bg-stone-700 px-2 py-0.5 rounded">
                          {categoryExercises.length}
                        </span>
                      </button>
                      
                      {isExpanded && categoryExercises.length > 0 && (
                        <div className="border-t border-stone-700">
                          {categoryExercises.map(exercise => (
                            <div
                              key={exercise.id}
                              className="p-3 border-b border-stone-700/50 last:border-b-0 hover:bg-stone-700/30"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-stone-100">{exercise.name}</span>
                                    {exercise.difficulty && (
                                      <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded uppercase",
                                        exercise.difficulty === 'Beginner' && "bg-green-500/20 text-green-400",
                                        exercise.difficulty === 'Intermediate' && "bg-amber-500/20 text-amber-400",
                                        exercise.difficulty === 'Advanced' && "bg-red-500/20 text-red-400"
                                      )}>
                                        {exercise.difficulty}
                                      </span>
                                    )}
                                  </div>
                                  {exercise.description && (
                                    <p className="text-xs text-stone-400 mt-1 line-clamp-1">{exercise.description}</p>
                                  )}
                                  <div className="flex gap-3 mt-1 text-[10px] text-stone-500">
                                    {exercise.defaultSets && <span>{exercise.defaultSets} sets</span>}
                                    {exercise.defaultReps && <span>{exercise.defaultReps} reps</span>}
                                    {exercise.defaultDurationSeconds && <span>{exercise.defaultDurationSeconds}s</span>}
                                    {exercise.timerConfig && <span className="text-amber-500">Has timer</span>}
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <button
                                    onClick={() => deleteExercise(exercise.id)}
                                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleEditExercise(exercise)}
                                    className="p-1.5 text-stone-400 hover:bg-stone-600 rounded"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {isExpanded && categoryExercises.length === 0 && (
                        <div className="p-3 text-xs text-stone-500 text-center border-t border-stone-700">
                          No exercises in this category
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <ExerciseForm
              formData={exerciseForm}
              setFormData={setExerciseForm}
              onSubmit={handleExerciseSubmit}
              onCancel={resetExerciseForm}
              isEditing={!!editingExerciseId}
            />
          )}
        </>
      )}
    </div>
  );
};

// Workout Form Component
interface WorkoutFormProps {
  formData: Partial<Workout>;
  setFormData: (data: Partial<Workout>) => void;
  stepsText: string;
  setStepsText: (text: string) => void;
  hasTimer: boolean;
  setHasTimer: (has: boolean) => void;
  timerConfig: TimerConfig;
  setTimerConfig: (config: TimerConfig) => void;
  selectedExercises: WorkoutExercise[];
  setSelectedExercises: (exercises: WorkoutExercise[]) => void;
  availableExercises: Exercise[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({
  formData, setFormData, stepsText, setStepsText, hasTimer, setHasTimer,
  timerConfig, setTimerConfig, selectedExercises, setSelectedExercises, 
  availableExercises, onSubmit, onCancel, isEditing
}) => {
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  
  const addExerciseToWorkout = (exercise: Exercise) => {
    if (!selectedExercises.find(e => e.exerciseId === exercise.id)) {
      setSelectedExercises([...selectedExercises, {
        exerciseId: exercise.id,
        sets: exercise.defaultSets,
        reps: exercise.defaultReps,
        durationSeconds: exercise.defaultDurationSeconds
      }]);
    }
    setShowExercisePicker(false);
  };

  const removeExerciseFromWorkout = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter(e => e.exerciseId !== exerciseId));
  };

  const updateExerciseInWorkout = (exerciseId: string, updates: Partial<WorkoutExercise>) => {
    setSelectedExercises(selectedExercises.map(e => 
      e.exerciseId === exerciseId ? { ...e, ...updates } : e
    ));
  };

  return (
  <div className="bg-stone-800 p-6 rounded-xl border border-stone-700 animate-in fade-in slide-in-from-bottom-4">
    <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Workout' : 'Create Workout'}</h2>
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-stone-400 mb-1">Name</label>
        <input 
          type="text" 
          required
          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white focus:border-amber-500 outline-none"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Type</label>
          <select 
            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white outline-none"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as WorkoutType})}
          >
            {Object.values(WorkoutType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Duration (min)</label>
          <input 
            type="number" 
            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white outline-none"
            value={formData.durationMinutes}
            onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-stone-400 mb-1">Description</label>
        <textarea 
          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white outline-none h-20"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-stone-400 mb-1">Steps (one per line)</label>
        <textarea 
          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white outline-none h-24 font-mono text-sm"
          value={stepsText}
          onChange={e => setStepsText(e.target.value)}
          placeholder="1. Warm up&#10;2. Main set&#10;3. Cool down"
        />
      </div>

      {/* Interval Timer Settings */}
      <div className="border-t border-stone-700 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <input 
            type="checkbox" 
            id="hasTimer"
            checked={hasTimer}
            onChange={(e) => setHasTimer(e.target.checked)}
            className="w-4 h-4 rounded border-stone-600 bg-stone-800 text-amber-500"
          />
          <label htmlFor="hasTimer" className="text-sm font-medium text-stone-300">Enable Interval Timer</label>
        </div>
        
        {hasTimer && (
          <div className="space-y-3 bg-stone-900/50 p-3 rounded-lg">
            {/* Timer Preset Cards */}
            <div>
              <label className="block text-[10px] uppercase text-stone-500 mb-2">Load from Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {DEFAULT_INTERVAL_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setTimerConfig(preset.timerConfig)}
                    className={cn(
                      "p-2 rounded-lg border text-left transition-colors",
                      timerConfig.workSeconds === preset.timerConfig.workSeconds &&
                      timerConfig.restSeconds === preset.timerConfig.restSeconds &&
                      timerConfig.reps === preset.timerConfig.reps &&
                      timerConfig.sets === preset.timerConfig.sets
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-stone-700 bg-stone-800 hover:border-stone-600"
                    )}
                  >
                    <div className="text-xs font-medium text-white truncate">{preset.name}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {preset.timerConfig.workSeconds}/{preset.timerConfig.restSeconds}s • {preset.timerConfig.sets}×{preset.timerConfig.reps}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase text-stone-500 mb-1">Work (s)</label>
                <input 
                  type="number" 
                  className="w-full bg-stone-800 border border-stone-600 rounded p-1 text-center text-white"
                  value={timerConfig.workSeconds}
                  onChange={e => setTimerConfig({...timerConfig, workSeconds: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-stone-500 mb-1">Rest (s)</label>
                <input 
                  type="number" 
                  className="w-full bg-stone-800 border border-stone-600 rounded p-1 text-center text-white"
                  value={timerConfig.restSeconds}
                  onChange={e => setTimerConfig({...timerConfig, restSeconds: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-stone-500 mb-1">Reps</label>
                <input 
                  type="number" 
                  className="w-full bg-stone-800 border border-stone-600 rounded p-1 text-center text-white"
                  value={timerConfig.reps}
                  onChange={e => setTimerConfig({...timerConfig, reps: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-800">
              <div>
                <label className="block text-[10px] uppercase text-stone-500 mb-1">Total Sets</label>
                <input 
                  type="number" 
                  className="w-full bg-stone-800 border border-stone-600 rounded p-1 text-center text-white"
                  value={timerConfig.sets}
                  onChange={e => setTimerConfig({...timerConfig, sets: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-stone-500 mb-1">Set Rest (s)</label>
                <input 
                  type="number" 
                  className="w-full bg-stone-800 border border-stone-600 rounded p-1 text-center text-white"
                  value={timerConfig.restBetweenSetsSeconds}
                  onChange={e => setTimerConfig({...timerConfig, restBetweenSetsSeconds: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Selection */}
      <div className="border-t border-stone-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-stone-300">Exercises</span>
            {selectedExercises.length > 0 && (
              <span className="text-xs text-stone-500">({selectedExercises.length})</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowExercisePicker(!showExercisePicker)}
            className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Exercise
          </button>
        </div>

        {/* Selected Exercises List */}
        {selectedExercises.length > 0 && (
          <div className="space-y-2 mb-3">
            {selectedExercises.map(we => {
              const exercise = availableExercises.find(e => e.id === we.exerciseId);
              if (!exercise) return null;
              return (
                <div key={we.exerciseId} className="bg-stone-900 rounded-lg p-3 border border-stone-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{exercise.name}</span>
                    <button
                      type="button"
                      onClick={() => removeExerciseFromWorkout(we.exerciseId)}
                      className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase text-stone-500 mb-1">Sets</label>
                      <input
                        type="number"
                        className="w-full bg-stone-800 border border-stone-600 rounded p-1 text-center text-white text-sm"
                        value={we.sets || ''}
                        onChange={e => updateExerciseInWorkout(we.exerciseId, { 
                          sets: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        placeholder={exercise.defaultSets?.toString() || '-'}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-stone-500 mb-1">Reps</label>
                      <input
                        type="number"
                        className="w-full bg-stone-800 border border-stone-600 rounded p-1 text-center text-white text-sm"
                        value={we.reps || ''}
                        onChange={e => updateExerciseInWorkout(we.exerciseId, { 
                          reps: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        placeholder={exercise.defaultReps?.toString() || '-'}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-stone-500 mb-1">Dur (s)</label>
                      <input
                        type="number"
                        className="w-full bg-stone-800 border border-stone-600 rounded p-1 text-center text-white text-sm"
                        value={we.durationSeconds || ''}
                        onChange={e => updateExerciseInWorkout(we.exerciseId, { 
                          durationSeconds: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        placeholder={exercise.defaultDurationSeconds?.toString() || '-'}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Exercise Picker Dropdown */}
        {showExercisePicker && (
          <div className="bg-stone-900 rounded-lg border border-stone-700 max-h-48 overflow-y-auto">
            {availableExercises.length === 0 ? (
              <p className="text-stone-500 text-sm p-3 text-center">No exercises available. Create some in the Exercises tab.</p>
            ) : (
              availableExercises
                .filter(e => !selectedExercises.find(se => se.exerciseId === e.id))
                .map(exercise => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => addExerciseToWorkout(exercise)}
                    className="w-full p-2 text-left hover:bg-stone-800 flex items-center justify-between border-b border-stone-800 last:border-0"
                  >
                    <div>
                      <div className="text-sm text-white">{exercise.name}</div>
                      <div className="text-[10px] text-stone-500">{exercise.category}</div>
                    </div>
                    <Plus className="w-4 h-4 text-stone-500" />
                  </button>
                ))
            )}
          </div>
        )}

        {selectedExercises.length === 0 && !showExercisePicker && (
          <p className="text-stone-500 text-xs italic">No exercises added. Click "Add Exercise" to include exercises from your library.</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">
          {isEditing ? 'Update Workout' : 'Create Workout'}
        </Button>
      </div>
    </form>
  </div>
  );
};

// Exercise Form Component
interface ExerciseFormProps {
  formData: Partial<Exercise>;
  setFormData: (data: Partial<Exercise>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({
  formData, setFormData, onSubmit, onCancel, isEditing
}) => (
  <div className="bg-stone-800 p-6 rounded-xl border border-stone-700 animate-in fade-in slide-in-from-bottom-4">
    <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Exercise' : 'Create Exercise'}</h2>
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-stone-400 mb-1">Name</label>
        <input 
          type="text" 
          required
          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white focus:border-amber-500 outline-none"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Category</label>
          <select 
            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white outline-none text-sm"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value as ExerciseCategory})}
          >
            {Object.values(ExerciseCategory).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Difficulty</label>
          <select 
            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white outline-none"
            value={formData.difficulty || 'Beginner'}
            onChange={e => setFormData({...formData, difficulty: e.target.value as Exercise['difficulty']})}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-400 mb-1">Description</label>
        <textarea 
          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white outline-none h-20"
          value={formData.description || ''}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Default Sets</label>
          <input 
            type="number" 
            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white outline-none"
            value={formData.defaultSets || ''}
            onChange={e => setFormData({...formData, defaultSets: parseInt(e.target.value) || undefined})}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Default Reps</label>
          <input 
            type="number" 
            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white outline-none"
            value={formData.defaultReps || ''}
            onChange={e => setFormData({...formData, defaultReps: parseInt(e.target.value) || undefined})}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Duration (s)</label>
          <input 
            type="number" 
            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-white outline-none"
            value={formData.defaultDurationSeconds || ''}
            onChange={e => setFormData({...formData, defaultDurationSeconds: parseInt(e.target.value) || undefined})}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">
          {isEditing ? 'Update Exercise' : 'Create Exercise'}
        </Button>
      </div>
    </form>
  </div>
);
