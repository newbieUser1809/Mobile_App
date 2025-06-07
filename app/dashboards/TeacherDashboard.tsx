// app/dashboards/StudentDashboard.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
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
  };
};

export default function StudentDashboard() {
  // Get userId from route params
  const route = useRoute<RouteProp<StudentDashboardRouteParams, 'StudentDashboard'>>();
  const { userId } = route.params;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = () => {
    try {
      const userTasks = getAllTasks(userId);
      setTasks(userTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
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

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
        <Text style={styles.taskDueDate}>
          Due: {format(new Date(item.dueDate), 'MMM dd, yyyy')}
        </Text>
      </View>
      <View style={styles.taskActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => startEditing(item)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTask(item.id!)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome Teacher!</Text>

      {!showForm ? (
        <>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Text style={styles.addButtonText}>Add New Task</Text>
          </TouchableOpacity>

          <FlatList
            data={tasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id!.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyMessage}>
                No tasks found. Add a new task to get started!
              </Text>
            }
          />
        </>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Title*"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>Due Date: {dueDate.toDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDueDate(selectedDate);
                }
              }}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={editingTask ? handleUpdateTask : handleAddTask}
            >
              <Text style={styles.buttonText}>
                {editingTask ? 'Update' : 'Add'} Task
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDescription: {
    color: '#666',
    marginBottom: 5,
  },
  taskDueDate: {
    color: '#888',
    fontStyle: 'italic',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 3,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    flex: 1,
  },
});
