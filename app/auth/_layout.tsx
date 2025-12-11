import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen 
        name="welcome" 
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="login" 
        options={{
          animation: 'slide_from_right',
          gestureEnabled: false, // Prevent accidental back swipe
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          animation: 'slide_from_right',
          gestureEnabled: false, // Prevent accidental back swipe
        }}
      />
    </Stack>
  );
}
