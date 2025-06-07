import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import type { Task, User } from '../database/db';
import { getAllTasks, getAllUsers, initDB } from '../database/db';

export default function DebugUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Initialize DB (creates tables if they don't exist)
    initDB();

    // Fetch users and tasks from the DB
    const usersFromDB = getAllUsers();
    const tasksFromDB = getAllTasks();

    // Set state
    setUsers(usersFromDB);
    setTasks(tasksFromDB);
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>All Users in DB:</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text>ID: {item.id}</Text>
            <Text>Name: {item.name}</Text>
            <Text>Email: {item.email}</Text>
            <Text>Role: {item.role}</Text>
            <Text>Password: {item.password}</Text>
          </View>
        )}
      />

      <Text style={{ fontWeight: 'bold', fontSize: 18, marginVertical: 10 }}>All Tasks in DB:</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text>ID: {item.id}</Text>
            <Text>Title: {item.title}</Text>
            <Text>Description: {item.description}</Text>
            <Text>Due Date: {item.dueDate}</Text>
            <Text>User ID: {item.userId}</Text>
            <Text>Created At: {item.createdAt}</Text>
          </View>
        )}
      />
    </View>
  );
}
