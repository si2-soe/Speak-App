import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert('Account created!', 'You can now log in with your details.');
        setMode('login');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>⚖️</Text>
          </View>
        </View>

        <Text style={styles.title}>Speak</Text>
        <Text style={styles.subtitle}>
          {mode === 'login' ? 'Sign in to access your cases' : 'Create an account to save your cases'}
        </Text>

        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#555"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#0f0f0f" />
              : <Text style={styles.btnPrimaryText}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchMode}
            onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            <Text style={styles.switchModeText}>
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerWrap}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={styles.btnAnon}
          onPress={() => supabase.auth.signInAnonymously()}
          activeOpacity={0.8}
        >
          <Text style={styles.btnAnonText}>🔒 Continue anonymously</Text>
          <Text style={styles.btnAnonSub}>Nothing will be saved or stored</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Speak provides guidance only, not legal advice.{'\n'}Consult a qualified solicitor for serious matters.
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  scroll: { padding: 24, paddingTop: 80 },
  logoWrap: { alignItems: 'center', marginBottom: 20 },
  logo: {
    width: 72, height: 72,
    backgroundColor: '#c8f064',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 32 },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#f0f0f0',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 20,
  },
  form: { gap: 14 },
  inputWrap: { gap: 6 },
  inputLabel: { color: '#888', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderRadius: 12,
    padding: 14,
    color: '#f0f0f0',
    fontSize: 15,
  },
  btnPrimary: {
    backgroundColor: '#c8f064',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: '#0f0f0f', fontWeight: '600', fontSize: 15 },
  switchMode: { alignItems: 'center', padding: 8 },
  switchModeText: { color: '#888', fontSize: 13 },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  divider: { flex: 1, height: 1, backgroundColor: '#2e2e2e' },
  dividerText: { color: '#555', fontSize: 13 },
  btnAnon: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    marginBottom: 32,
  },
  btnAnonText: { color: '#f0f0f0', fontSize: 14, fontWeight: '500' },
  btnAnonSub: { color: '#555', fontSize: 12 },
  disclaimer: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
});