// app/dashboards/StudentDashboard.tsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp, useRoute } from '@react-navigation/native';
import { format, isFuture, isPast, isToday, parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Task,
  addTask,
  deleteTask,
  getAllTasks,
  updateTask,
} from '../database/db';

// Define route parameter type
type StudentDashboardRouteParams = {
  StudentDashboard: {
    userId: number;
    name: string;
  };
};

type FilterType = 'all' | 'today' | 'upcoming' | 'overdue';

export default function StudentDashboard() {
  const route = useRoute<RouteProp<StudentDashboardRouteParams, 'StudentDashboard'>>();
  const { userId, name } = route.params;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Counts for each filter
  const [counts, setCounts] = useState({
    all: 0,
    today: 0,
    upcoming: 0,
    overdue: 0,
  });

  useEffect(() => {
    loadTasks();
  }, [userId]);

  useEffect(() => {
    filterTasks();
    updateCounts();
  }, [tasks, activeFilter]);

  const loadTasks = () => {
    try {
      const userTasks = getAllTasks(userId);
      setTasks(userTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    }
  };

  const updateCounts = () => {
    const now = new Date();
    
    const todayCount = tasks.filter(task => {
      const taskDate = parseISO(task.dueDate);
      return isToday(taskDate);
    }).length;

    const upcomingCount = tasks.filter(task => {
      const taskDate = parseISO(task.dueDate);
      return isFuture(taskDate) && !isToday(taskDate);
    }).length;

    const overdueCount = tasks.filter(task => {
      const taskDate = parseISO(task.dueDate);
      return isPast(taskDate) && !isToday(taskDate);
    }).length;

    setCounts({
      all: tasks.length,
      today: todayCount,
      upcoming: upcomingCount,
      overdue: overdueCount,
    });
  };

  const filterTasks = () => {
    const now = new Date();
    
    switch (activeFilter) {
      case 'today':
        setFilteredTasks(tasks.filter(task => isToday(parseISO(task.dueDate))));
        break;
      case 'upcoming':
        setFilteredTasks(tasks.filter(task => 
          isFuture(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate))));
        break;
      case 'overdue':
        setFilteredTasks(tasks.filter(task => 
          isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate))));
        break;
      default:
        setFilteredTasks(tasks);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setEditingTask(null);
  };

  const handleAddTask = () => {
    try {
      if (!title.trim()) {
        Alert.alert('Error', 'Title is required');
        return;
      }

      if (!userId) {
        Alert.alert('Error', 'User ID is missing');
        return;
      }

      // Validate due date is not in the past
      if (isPast(dueDate) && !isToday(dueDate)) {
        Alert.alert('Error', 'Due date cannot be in the past');
        return;
      }

      addTask({
        title,
        description,
        dueDate: dueDate.toISOString(),
        userId: userId,
      });

      loadTasks();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add task:', error);
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const handleUpdateTask = () => {
    try {
      if (!editingTask?.id) return;
      if (!title.trim()) {
        Alert.alert('Error', 'Title is required');
        return;
      }
      if (!userId) {
        Alert.alert('Error', 'User ID is missing');
        return;
      }

      // Validate due date is not in the past
      if (isPast(dueDate) && !isToday(dueDate)) {
        Alert.alert('Error', 'Due date cannot be in the past');
        return;
      }

      updateTask({
        id: editingTask.id,
        title,
        description,
        dueDate: dueDate.toISOString(),
        userId: userId,
      });

      loadTasks();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDeleteTask = (taskId: number) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          try {
            deleteTask(taskId);
            loadTasks();
          } catch (error) {
            console.error('Failed to delete task:', error);
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  const startEditing = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(new Date(task.dueDate));
    setEditingTask(task);
    setShowForm(true);
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const taskDate = parseISO(item.dueDate);
    const isOverdue = isPast(taskDate) && !isToday(taskDate);
    const isTaskToday = isToday(taskDate);
    const isUpcoming = isFuture(taskDate) && !isToday(taskDate);
    
    return (
      <View style={[
        styles.taskItem,
        isOverdue && styles.overdueTask,
        isTaskToday && styles.todayTask,
        isUpcoming && styles.upcomingTask
      ]}>
        <View style={styles.taskInfo}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <View style={styles.taskStatus}>
              {isTaskToday && (
                <View style={[styles.statusBadge, styles.todayBadge]}>
                  <Text style={styles.statusBadgeText}>Today</Text>
                </View>
              )}
              {isUpcoming && (
                <View style={[styles.statusBadge, styles.upcomingBadge]}>
                  <Text style={styles.statusBadgeText}>Upcoming</Text>
                </View>
              )}
              {isOverdue && (
                <View style={[styles.statusBadge, styles.overdueBadge]}>
                  <Text style={styles.statusBadgeText}>Overdue</Text>
                </View>
              )}
            </View>
          </View>
          
          {item.description ? (
            <Text style={styles.taskDescription}>{item.description}</Text>
          ) : (
            <Text style={styles.taskDescriptionPlaceholder}>No description</Text>
          )}
          
          <View style={styles.taskMeta}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.taskDueDate}>
              {format(taskDate, 'MMM dd, yyyy • hh:mm a')}
            </Text>
          </View>
        </View>
        <View style={styles.taskActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => startEditing(item)}
          >
            <Ionicons name="create-outline" size={20} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteTask(item.id!)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFilterButton = (filter: FilterType, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.activeFilter
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        activeFilter === filter && styles.activeFilterText
      ]}>
        {label}
      </Text>
      <View style={[
        styles.filterCountBadge,
        activeFilter === filter && styles.activeFilterCountBadge
      ]}>
        <Text style={[
          styles.filterCount,
          activeFilter === filter && styles.activeFilterCount
        ]}>
          {counts[filter]}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.profileIcon}>
            <Ionicons name="person-circle" size={32} color="#fff" />
          </View>
          <View>
            <Text style={styles.greeting}>Welcome back, {name}</Text>
            <Text style={styles.subtitle}>Manage your tasks efficiently</Text>
          </View>
        </View>
        
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{counts.all}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.todayStat]}>{counts.today}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.upcomingStat]}>{counts.upcoming}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.overdueStat]}>{counts.overdue}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {renderFilterButton('all', 'All Tasks')}
        {renderFilterButton('today', 'Today')}
        {renderFilterButton('upcoming', 'Upcoming')}
        {renderFilterButton('overdue', 'Overdue')}
      </ScrollView>

      {!showForm ? (
        <>
          {/* Task List */}
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id!.toString()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-done-circle" size={60} color="#e5e7eb" />
                <Text style={styles.emptyMessage}>
                  No tasks found for this filter
                </Text>
                <Text style={styles.emptySubtext}>
                  {activeFilter === 'all' 
                    ? "Tap the + button to add a new task" 
                    : "All clear for now!"}
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>
                  {activeFilter === 'all' ? 'All Tasks' : 
                   activeFilter === 'today' ? "Today's Tasks" : 
                   activeFilter === 'upcoming' ? 'Upcoming Tasks' : 'Overdue Tasks'}
                </Text>
                <Text style={styles.listHeaderCount}>{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}</Text>
              </View>
            }
          />

          {/* Add Task Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>
        </>
      ) : (
        <ScrollView 
          style={styles.formContainer}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowForm(false);
                resetForm();
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <Text style={styles.formTitle}>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Title*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Enter task description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Due Date & Time</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                <Text style={styles.dateTimeButtonText}>
                  {format(dueDate, 'MMM dd, yyyy')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#6b7280" />
                <Text style={styles.dateTimeButtonText}>
                  {format(dueDate, 'hh:mm a')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDueDate(selectedDate);
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dueDate}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (selectedDate) {
                  setDueDate(selectedDate);
                }
              }}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.formButton, styles.submitButton, !title.trim() && styles.disabledButton]}
              onPress={editingTask ? handleUpdateTask : handleAddTask}
              disabled={!title.trim()}
            >
              <Text style={styles.submitButtonText}>
                {editingTask ? 'Save Changes' : 'Create Task'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#4f46e5',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4338ca',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  todayStat: {
    color: '#f59e0b',
  },
  upcomingStat: {
    color: '#10b981',
  },
  overdueStat: {
    color: '#ef4444',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  filterButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeFilter: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterText: {
    color: 'white',
  },
  filterCountBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  activeFilterCountBadge: {
    backgroundColor: '#312e81',
  },
  filterCount: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterCount: {
    color: 'white',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4f46e5',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  listHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  listHeaderCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  taskItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
  },
  overdueTask: {
    borderLeftColor: '#ef4444',
  },
  todayTask: {
    borderLeftColor: '#f59e0b',
  },
  upcomingTask: {
    borderLeftColor: '#10b981',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  taskStatus: {
    flexDirection: 'row',
    marginLeft: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
    marginBottom: 4,
  },
  todayBadge: {
    backgroundColor: '#fef3c7',
  },
  upcomingBadge: {
    backgroundColor: '#d1fae5',
  },
  overdueBadge: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskDescription: {
    color: '#475569',
    marginBottom: 14,
    fontSize: 14,
    lineHeight: 20,
  },
  taskDescriptionPlaceholder: {
    color: '#94a3b8',
    marginBottom: 14,
    fontSize: 14,
    fontStyle: 'italic',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDueDate: {
    color: '#64748b',
    fontSize: 13,
    marginLeft: 8,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionButton: {
    padding: 10,
    borderRadius: 10,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#e0e7ff',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    margin: 20,
    marginTop: 10,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formContent: {
    padding: 24,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  dateTimeButtonText: {
    color: '#1e293b',
    marginLeft: 12,
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  formButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    marginLeft: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});