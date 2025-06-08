import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/LoginScreen" options={{ headerShown: false }} />
      <Stack.Screen name="dashboards/StudentDashboard" options={{ headerShown: false }} />
      <Stack.Screen name="auth/RegisterScreen" options={{ headerShown: false }} />
      <Stack.Screen name="dashboards/TeacherDashboard" options={{ headerShown: false }} />
      <Stack.Screen name="dashboards/AdminDashboard" options={{ headerShown: false }} />
    </Stack>
  );
}
