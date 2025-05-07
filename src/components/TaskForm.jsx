import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { PlusCircle, Edit3, Pencil, Trash2, GripVertical, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, Reorder } from 'framer-motion';
import { useCategories } from '@/context/CategoriesContext';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

const defaultCategories = [
  { name: 'Work', color: '#6366f1', icon: '💼' },
  { name: 'Personal', color: '#f472b6', icon: '🏠' },
  { name: 'Fitness', color: '#34d399', icon: '🏋️' },
  { name: 'Study', color: '#fbbf24', icon: '📚' },
  { name: 'Chores', color: '#60a5fa', icon: '🧹' },
  { name: 'Learn', color: '#f59e42', icon: '🧠' },
  { name: 'Other', color: '#a3a3a3', icon: '🔖' },
];

const ICONS = ['💼','🏠','🏋️','📚','🧹','🧠','🔖','🎨','🍎','💡','🎯','📝','��','🌱','💻','📅'];

const COLOR_PRESETS = [
  '#6366f1', // indigo
  '#f472b6', // pink
  '#34d399', // emerald
  '#fbbf24', // amber
  '#60a5fa', // blue
  '#f59e42', // orange
  '#a3a3a3', // gray
  '#ef4444', // red
  '#10b981', // green
  '#8b5cf6', // violet
];

const SORT_OPTIONS = {
  name: 'Name',
  usage: 'Usage Count',
  custom: 'Custom Order'
};

const TaskForm = ({ onSubmit, taskToEdit, onFormClose, tasks = [] }) => {
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState('medium');
  const [timeSlot, setTimeSlot] = useState('');
  const { categories, setCategories } = useCategories();
  const [category, setCategory] = useState(categories[0].name);
  const [categoryColor, setCategoryColor] = useState(categories[0].color);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#a3a3a3');
  const [newCategoryIcon, setNewCategoryIcon] = useState(ICONS[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editIcon, setEditIcon] = useState(ICONS[0]);
  const { toast } = useToast();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [sortBy, setSortBy] = useState('custom');
  const [showColorPresets, setShowColorPresets] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorInput, setCollaboratorInput] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTaskName(taskToEdit.name);
      setPriority(taskToEdit.priority || 'medium');
      setTimeSlot(taskToEdit.timeSlot || '');
      setCategory(taskToEdit.category || defaultCategories[0].name);
      setCategoryColor(taskToEdit.categoryColor || defaultCategories[0].color);
      setReminderDateTime(taskToEdit.reminderDateTime || '');
      setCollaborators(taskToEdit.collaborators || []);
      setIsOpen(true); 
    } else {
      setTaskName('');
      setPriority('medium');
      setTimeSlot('');
      setCategory(defaultCategories[0].name);
      setCategoryColor(defaultCategories[0].color);
      setReminderDateTime('');
      setCollaborators([]);
    }
  }, [taskToEdit]);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (categories.some(cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase())) return;
    const newCat = { name: newCategory.trim(), color: newCategoryColor, icon: newCategoryIcon };
    setCategories([...categories, newCat]);
    setCategory(newCat.name);
    setCategoryColor(newCat.color);
    setNewCategory('');
    setNewCategoryColor('#a3a3a3');
    setNewCategoryIcon(ICONS[0]);
  };

  const handleCategoryChange = (catName) => {
    setCategory(catName);
    const found = categories.find(c => c.name === catName);
    setCategoryColor(found ? found.color : '#a3a3a3');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskName.trim()) {
      toast({
        title: "Oops!",
        description: "Task name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    onSubmit({ 
      id: taskToEdit ? taskToEdit.id : Date.now(), 
      name: taskName, 
      priority, 
      timeSlot, 
      category,
      categoryColor,
      reminderDateTime,
      collaborators,
      completed: taskToEdit ? taskToEdit.completed : false 
    });
    toast({
      title: taskToEdit ? "Task Updated!" : "Task Added!",
      description: `"${taskName}" has been successfully ${taskToEdit ? 'updated' : 'added'}.`,
      className: "bg-green-500 text-white dark:bg-green-600",
    });
    setTaskName('');
    setPriority('medium');
    setTimeSlot('');
    setCategory(defaultCategories[0].name);
    setCategoryColor(defaultCategories[0].color);
    setReminderDateTime('');
    setIsOpen(false);
    if (onFormClose) onFormClose();
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open && onFormClose) {
      onFormClose(); 
    }
  }

  const isDefaultCategory = (catName) => defaultCategories.some(c => c.name === catName);

  const handleEditCategory = (idx) => {
    setEditIdx(idx);
    setEditName(categories[idx].name);
    setEditColor(categories[idx].color);
    setEditIcon(categories[idx].icon);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    const updated = [...categories];
    updated[editIdx] = { ...updated[editIdx], name: editName, color: editColor, icon: editIcon };
    setCategories(updated);
    setEditIdx(null);
  };

  const handleDeleteClick = (idx) => {
    if (isDefaultCategory(categories[idx].name)) return;
    
    const categoryToDelete = categories[idx];
    const tasksUsingCategory = tasks.filter(t => t.category === categoryToDelete.name).length;
    
    if (tasksUsingCategory > 0) {
      toast({
        title: "Cannot Delete Category",
        description: `This category is used by ${tasksUsingCategory} task${tasksUsingCategory === 1 ? '' : 's'}. Please reassign these tasks first.`,
        variant: "destructive",
      });
      return;
    }
    
    setCategoryToDelete(idx);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete !== null) {
      setCategories(categories.filter((_, i) => i !== categoryToDelete));
      setCategoryToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.icon.includes(searchQuery)
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'usage') {
      const aCount = tasks.filter(t => t.category === a.name).length;
      const bCount = tasks.filter(t => t.category === b.name).length;
      return bCount - aCount;
    }
    return 0; // custom order
  });

  const handleResetToDefault = () => {
    setCategories(defaultCategories);
    setShowResetConfirm(false);
    toast({
      title: "Categories Reset",
      description: "Categories have been reset to default.",
      className: "bg-blue-500 text-white dark:bg-blue-600",
    });
  };

  const handleExportCategories = () => {
    const dataStr = JSON.stringify(categories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'routinezen-categories.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportCategories = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit
      toast({
        title: "Import Failed",
        description: "File is too large. Maximum size is 1MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) {
          throw new Error('Invalid format: not an array');
        }
        if (!imported.every(cat => cat.name && cat.color && cat.icon)) {
          throw new Error('Invalid format: missing required fields');
        }
        if (imported.length > 50) {
          throw new Error('Too many categories: maximum is 50');
        }
        setCategories(imported);
        toast({
          title: "Categories Imported",
          description: "Your categories have been successfully imported.",
          className: "bg-green-500 text-white dark:bg-green-600",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: error.message || "The file format is invalid. Please check the file and try again.",
          variant: "destructive",
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "Import Failed",
        description: "Failed to read the file. Please try again.",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {taskToEdit ? (
          <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300" onClick={() => setIsOpen(true)}>
            <Edit3 className="h-5 w-5" />
          </Button>
        ) : (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg"
              onClick={() => setIsOpen(true)}
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Task
            </Button>
          </motion.div>
        )}
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg mx-auto p-2 sm:p-6 space-y-4 bg-slate-800 border-slate-700 text-gray-100 max-h-[90vh] overflow-y-auto scrollbar-none">
        <DialogHeader>
          <DialogTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {taskToEdit ? 'Edit Task' : 'Add a New Task'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {taskToEdit ? 'Update the details of your task.' : 'Fill in the details for your new task.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="taskName" className="text-slate-300">Task Name</Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g., Morning Workout"
              className="bg-slate-700 border-slate-600 text-gray-100 placeholder-slate-500 focus:ring-purple-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority" className="text-slate-300">Priority</Label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full h-10 rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="timeSlot" className="text-slate-300">Time Slot (Optional)</Label>
            <Input
              id="timeSlot"
              type="time"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="bg-slate-700 border-slate-600 text-gray-100 placeholder-slate-500 focus:ring-purple-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reminderDateTime" className="text-slate-300">Reminder (Optional)</Label>
            <Input
              id="reminderDateTime"
              type="datetime-local"
              value={reminderDateTime}
              onChange={e => setReminderDateTime(e.target.value)}
              className="bg-slate-700 border-slate-600 text-gray-100 placeholder-slate-500 focus:ring-purple-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="collaborators" className="text-slate-300">Collaborators (emails, comma separated)</Label>
            <Input
              id="collaborators"
              type="text"
              value={collaboratorInput}
              onChange={e => setCollaboratorInput(e.target.value)}
              placeholder="e.g. alice@email.com, bob@email.com"
              className="bg-slate-700 border-slate-600 text-gray-100 placeholder-slate-500 focus:ring-purple-500"
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {collaborators.map((c, i) => (
                <span key={c + i} className="px-2 py-0.5 rounded-full bg-purple-700 text-white text-xs">{c}</span>
              ))}
            </div>
            <Button type="button" size="sm" className="mt-2 bg-purple-500 text-white" onClick={() => {
              if (collaboratorInput.trim()) {
                setCollaborators(collaboratorInput.split(',').map(s => s.trim()).filter(Boolean));
              }
            }}>Set Collaborators</Button>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category" className="text-slate-300 flex items-center justify-between">
              Category
              <Button type="button" size="sm" variant="outline" className="ml-2 px-2 py-1 text-xs border-slate-600" onClick={() => setManageOpen(true)}>
                Manage Categories
              </Button>
            </Label>
            <div className="flex gap-2">
              <select
                id="category"
                value={category}
                onChange={e => handleCategoryChange(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>
              <span className="w-8 h-8 rounded-full border-2 border-slate-600 flex items-center justify-center" style={{ background: categoryColor }}></span>
            </div>
            <form onSubmit={handleAddCategory} className="flex gap-2 mt-2 flex-wrap items-center">
              <Input
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="New category"
                className="bg-slate-700 border-slate-600 text-gray-100 placeholder-slate-500 focus:ring-purple-500"
              />
              <input
                type="color"
                value={newCategoryColor}
                onChange={e => setNewCategoryColor(e.target.value)}
                className="w-10 h-10 p-0 border-none bg-transparent"
                title="Pick color"
              />
              <select
                value={newCategoryIcon}
                onChange={e => setNewCategoryIcon(e.target.value)}
                className="w-10 h-10 rounded-md border border-slate-600 bg-slate-700 text-lg text-center"
                title="Pick icon"
              >
                {ICONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <Button type="submit" size="sm" className="bg-purple-500 text-white px-3 py-1 rounded-md">Add</Button>
            </form>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <DialogClose asChild>
              <Button
                type="button"
                className="w-full sm:w-auto bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold border border-slate-300 shadow-none"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
            >
              {taskToEdit ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-xl">Manage Categories</DialogTitle>
            <DialogDescription>Edit or delete your custom categories.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-700 border-slate-600 text-gray-100 placeholder-slate-500 focus:ring-purple-500 flex-1 min-w-[200px]"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={handleExportCategories}
                >
                  Export
                </Button>
                <label className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportCategories}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Import
                  </Button>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => setShowResetConfirm(true)}
                >
                  Reset
                </Button>
              </div>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              <Reorder.Group axis="y" values={categories} onReorder={setCategories}>
                {sortedCategories.map((cat, idx) => {
                  const usageCount = tasks.filter(t => t.category === cat.name).length;
                  return (
                    <Reorder.Item
                      key={cat.name + idx}
                      value={cat}
                      className="flex items-center gap-2 p-2 rounded bg-slate-700/50 mb-2"
                    >
                      {editIdx === idx ? (
                        <>
                          <Input value={editName} onChange={e => setEditName(e.target.value)} className="w-28" />
                          <div className="relative">
                            <input
                              type="color"
                              value={editColor}
                              onChange={e => setEditColor(e.target.value)}
                              className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                              onClick={() => setShowColorPresets(!showColorPresets)}
                            />
                            {showColorPresets && (
                              <div className="absolute top-full left-0 mt-1 p-2 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10">
                                <div className="grid grid-cols-5 gap-2">
                                  {COLOR_PRESETS.map(color => (
                                    <button
                                      key={color}
                                      className="w-6 h-6 rounded-full border border-slate-600"
                                      style={{ background: color }}
                                      onClick={() => {
                                        setEditColor(color);
                                        setShowColorPresets(false);
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <select value={editIcon} onChange={e => setEditIcon(e.target.value)} className="w-10 h-10 rounded-md border border-slate-600 bg-slate-700 text-lg text-center">
                            {ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                          </select>
                          <Button size="sm" className="px-2 py-1 bg-purple-500" onClick={handleSaveEdit}>Save</Button>
                          <Button size="sm" variant="outline" className="px-2 py-1 border-slate-600" onClick={() => setEditIdx(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1" style={{ background: cat.color, borderColor: cat.color, color: '#fff' }}>
                            {cat.icon} {cat.name}
                            {isDefaultCategory(cat.name) && <Lock className="w-3 h-3 ml-1" />}
                          </span>
                          <span className="text-xs text-slate-400 ml-auto">
                            {usageCount} {usageCount === 1 ? 'task' : 'tasks'}
                          </span>
                          <Button size="icon" variant="ghost" className="text-blue-400" onClick={() => handleEditCategory(idx)}><Pencil className="w-4 h-4" /></Button>
                          {!isDefaultCategory(cat.name) && (
                            <Button size="icon" variant="ghost" className="text-red-400" onClick={() => handleDeleteClick(idx)}><Trash2 className="w-4 h-4" /></Button>
                          )}
                        </>
                      )}
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
              {filteredCategories.length === 0 && (
                <div className="text-slate-400 text-sm text-center py-4">
                  {searchQuery ? 'No categories match your search.' : 'No categories yet.'}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-gray-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete this category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default TaskForm;
  