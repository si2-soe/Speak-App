import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from './src/lib/supabase';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import JournalScreen from './src/screens/JournalScreen';
import LoadingScreen from './src/components/LoadingScreen';

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.signOut().then(() => {
      setSession(null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <LoadingScreen />;

  console.log('Session:', session ? 'logged in' : 'null');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Home">
              {props => <HomeScreen {...props} isAnon={session?.user?.is_anonymous} />}
            </Stack.Screen>
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Results" component={ResultsScreen} />
            <Stack.Screen name="Journal" component={JournalScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}