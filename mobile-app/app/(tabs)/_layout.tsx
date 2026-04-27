import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useState } from 'react';
import UserIcon from '../components/UserIcon';

export default function TabLayout() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'blue',
        headerTitle: "Contact Managment",
        headerLeft: () => null,
        headerRight: () => <UserIcon imageUri={imageUri} setImage={setImageUri} />,
        headerStyle : {
         height: 110,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
        tabBarLabel: "About",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="info-circle" color={color} />,
        }}
      />
        <Tabs.Screen
        name="Home"
        options={{
        tabBarLabel: "Home",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
        <Tabs.Screen
        name="People"
        options={{
          tabBarLabel: "People",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="users" color={color} />,
        }}
      />
    </Tabs>
  );
}