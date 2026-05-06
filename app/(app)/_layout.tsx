import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="songs" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="songs/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="songs/add" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      <Stack.Screen name="setlists/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="setlists/create" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      <Stack.Screen name="members/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="rehearsals/create" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      <Stack.Screen name="rehearsals/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="announcements/create" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      <Stack.Screen name="announcements" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="invite" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="choir-settings" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
