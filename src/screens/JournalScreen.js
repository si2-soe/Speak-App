import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function JournalScreen({ navigation }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCases(data || []);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
    setLoading(false);
  };

  const deleteCase = async (id) => {
    Alert.alert('Delete case', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await supabase.from('cases').delete().eq('id', id);
          fetchCases();
        }
      }
    ]);
  };

  const categoryIcons = {
    renter: '🏠', workplace: '💼', fraud: '🚨',
    data: '🔒', whistle: '📢', general: '⚖️', anon: '🔒'
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>My Cases</Text>
          <Text style={styles.headerSub}>{cases.length} case{cases.length !== 1 ? 's' : ''} saved</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#c8f064" />
        </View>
      ) : cases.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📁</Text>
          <Text style={styles.emptyTitle}>No cases yet</Text>
          <Text style={styles.emptyText}>Start a conversation and your cases will be saved here.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.btnPrimaryText}>Start a new case</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {cases.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.caseCard}
              activeOpacity={0.7}
              onLongPress={() => deleteCase(c.id)}
            >
              <View style={styles.caseIcon}>
                <Text style={{ fontSize: 20 }}>{categoryIcons[c.category] || '⚖️'}</Text>
              </View>
              <View style={styles.caseInfo}>
                <Text style={styles.caseSummary} numberOfLines={2}>{c.summary || 'No summary available'}</Text>
                <Text style={styles.caseDate}>{formatDate(c.created_at)}</Text>
              </View>
              <Text style={styles.caseArrow}>›</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.hint}>Long press a case to delete it</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#2e2e2e',
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: '#888', fontSize: 22, lineHeight: 26 },
  headerInfo: { flex: 1 },
  headerTitle: { color: '#f0f0f0', fontSize: 16, fontWeight: '600' },
  headerSub: { color: '#555', fontSize: 12, marginTop: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { color: '#f0f0f0', fontSize: 18, fontWeight: '600' },
  emptyText: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  btnPrimary: {
    backgroundColor: '#c8f064',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  btnPrimaryText: { color: '#0f0f0f', fontWeight: '600', fontSize: 15 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 10 },
  caseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  caseIcon: {
    width: 44, height: 44,
    backgroundColor: '#242424',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  caseInfo: { flex: 1 },
  caseSummary: { color: '#ccc', fontSize: 13, lineHeight: 19, marginBottom: 4 },
  caseDate: { color: '#555', fontSize: 12 },
  caseArrow: { color: '#555', fontSize: 20 },
  hint: { color: '#333', fontSize: 11, textAlign: 'center', marginTop: 8 },
});