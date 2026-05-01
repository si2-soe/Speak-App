import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Clipboard, Alert
} from 'react-native';

const cards = [
  { key: 'rights', icon: '⚖️', label: 'Your rights' },
  { key: 'action_plan', icon: '🗺️', label: 'Action plan' },
  { key: 'evidence', icon: '🔍', label: 'Evidence to gather' },
  { key: 'authorities', icon: '📞', label: 'Who to contact' },
  { key: 'draft_letter', icon: '✉️', label: 'Draft letter' },
];

function Card({ icon, label, children }) {
  const [open, setOpen] = useState(true);
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => setOpen(!open)} activeOpacity={0.7}>
        <View style={styles.cardIcon}><Text style={{ fontSize: 16 }}>{icon}</Text></View>
        <Text style={styles.cardTitle}>{label}</Text>
        <Text style={styles.cardToggle}>{open ? '∧' : '∨'}</Text>
      </TouchableOpacity>
      {open && <View style={styles.cardBody}>{children}</View>}
    </View>
  );
}

export default function ResultsScreen({ navigation, route }) {
  const { pack, category } = route.params;
  const [checkedEvidence, setCheckedEvidence] = useState([]);

  const toggleEvidence = (i) => {
    setCheckedEvidence(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const copyLetter = () => {
    Clipboard.setString(pack.draft_letter);
    Alert.alert('Copied!', 'Draft letter copied to clipboard.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Your Action Pack</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{pack.summary}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Summary banner */}
        <View style={styles.summaryBanner}>
          <Text style={styles.summaryText}>{pack.summary}</Text>
        </View>

        <View style={styles.disclaimerBanner}>
          <Text style={styles.disclaimerBannerText}>
            This information is general guidance only and does not constitute legal advice. Please seek advice from a qualified professional before taking any action.
          </Text>
        </View>

        {/* Rights */}
        {pack.rights?.length > 0 && (
          <Card icon="⚖️" label="Your rights">
            {pack.rights.map((r, i) => (
              <View key={i} style={styles.listItem}>
                <View style={styles.dot} />
                <Text style={styles.listText}>{r}</Text>
              </View>
            ))}
            {pack.legislation?.length > 0 && (
              <View style={styles.legBox}>
                <Text style={styles.legTitle}>Relevant legislation</Text>
                {pack.legislation.map((l, i) => (
                  <Text key={i} style={styles.legText}>{l}</Text>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Action plan */}
        {pack.action_plan?.length > 0 && (
          <Card icon="🗺️" label="Suggested next steps">
            {pack.action_plan.map((s, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepAction}>{s.action}</Text>
                  {s.why && <Text style={styles.stepWhy}>{s.why}</Text>}
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Evidence */}
        {pack.evidence?.length > 0 && (
          <Card icon="🔍" label="Evidence to gather">
            {pack.evidence.map((e, i) => (
              <TouchableOpacity key={i} style={styles.evidenceItem} onPress={() => toggleEvidence(i)} activeOpacity={0.7}>
                <View style={[styles.checkbox, checkedEvidence.includes(i) && styles.checkboxChecked]}>
                  {checkedEvidence.includes(i) && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.evidenceText, checkedEvidence.includes(i) && styles.evidenceTextDone]}>{e}</Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Authorities */}
        {pack.authorities?.length > 0 && (
          <Card icon="📞" label="Who to contact">
            {pack.authorities.map((a, i) => (
              <View key={i} style={styles.authorityItem}>
                <Text style={styles.authorityName}>{a.name}</Text>
                <Text style={styles.authorityRole}>{a.role}</Text>
                {a.url && <Text style={styles.authorityUrl}>{a.url}</Text>}
              </View>
            ))}
          </Card>
        )}

        {/* Draft letter */}
        {pack.draft_letter && (
          <Card icon="✉️" label="Draft template letter">
            <View style={styles.letterWarning}>
              <Text style={styles.letterWarningText}>This is a template only. Please review carefully and seek professional input before sending.</Text>
            </View>
            <Text style={styles.letterText}>{pack.draft_letter}</Text>
          </Card>
        )}

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.popToTop()} activeOpacity={0.8}>
          <Text style={styles.btnPrimaryText}>Start a new case</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.btnSecondaryText}>Back to conversation</Text>
        </TouchableOpacity>
      </View>

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
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 24 },
  summaryBanner: {
    backgroundColor: 'rgba(200,240,100,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(200,240,100,0.2)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  summaryText: { color: '#c8f064', fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2e2e2e',
  },
  cardIcon: {
    width: 34, height: 34,
    backgroundColor: '#242424',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { flex: 1, color: '#f0f0f0', fontSize: 14, fontWeight: '600' },
  cardToggle: { color: '#555', fontSize: 14 },
  cardBody: { padding: 14, gap: 10 },
  listItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 8 },
  dot: {
    width: 6, height: 6,
    backgroundColor: '#c8f064',
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  listText: { flex: 1, color: '#ccc', fontSize: 13, lineHeight: 20 },
  legBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#242424',
    borderRadius: 8,
    gap: 6,
  },
  legTitle: { color: '#888', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  legText: { color: '#c8f064', fontSize: 12, lineHeight: 18 },
  stepItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 12 },
  stepNum: {
    width: 26, height: 26,
    backgroundColor: 'rgba(200,240,100,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(200,240,100,0.3)',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: { color: '#c8f064', fontSize: 12, fontWeight: '600' },
  stepContent: { flex: 1 },
  stepAction: { color: '#f0f0f0', fontSize: 13, fontWeight: '600', lineHeight: 20 },
  stepWhy: { color: '#888', fontSize: 12, lineHeight: 18, marginTop: 2 },
  evidenceItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 },
  checkbox: {
    width: 22, height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: '#c8f064', borderColor: '#c8f064' },
  checkmark: { color: '#0f0f0f', fontSize: 13, fontWeight: '700' },
  evidenceText: { flex: 1, color: '#ccc', fontSize: 13, lineHeight: 20 },
  evidenceTextDone: { color: '#555', textDecorationLine: 'line-through' },
  authorityItem: {
    backgroundColor: '#242424',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2e2e2e',
  },
  authorityName: { color: '#f0f0f0', fontSize: 13, fontWeight: '600', marginBottom: 3 },
  authorityRole: { color: '#888', fontSize: 12, lineHeight: 18 },
  authorityUrl: { color: '#c8f064', fontSize: 12, marginTop: 4 },
  letterText: { color: '#aaa', fontSize: 12, lineHeight: 20, fontFamily: 'monospace' },
  copyBtn: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(200,240,100,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(200,240,100,0.2)',
    borderRadius: 8,
    alignItems: 'center',
  },
  copyBtnText: { color: '#c8f064', fontSize: 13, fontWeight: '500' },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#2e2e2e',
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: '#c8f064',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#0f0f0f', fontWeight: '600', fontSize: 15 },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  btnSecondaryText: { color: '#888', fontSize: 14 },
  disclaimerBanner: {
    backgroundColor: 'rgba(255,180,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,180,0,0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
  },
  disclaimerBannerText: {
    color: '#c8a800',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  letterWarning: {
    backgroundColor: 'rgba(255,180,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,180,0,0.2)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  letterWarningText: {
    color: '#c8a800',
    fontSize: 12,
    lineHeight: 18,
  },
});