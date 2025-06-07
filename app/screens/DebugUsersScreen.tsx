import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import type { User } from '../database/db';
import { getAllUsers, initDB } from '../database/db';

export default function DebugUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
        initDB();  // create table if not exists
    const usersFromDB = getAllUsers();
    setUsers(usersFromDB);
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
                        <Text>Role: {item.password}</Text>
          </View>
        )}
      />
    </View>
  );
}
