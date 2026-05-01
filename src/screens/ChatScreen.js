import { supabase } from '../lib/supabase';
import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { sendToAI } from '../lib/api';

const openingMessages = {
  renter: "I'm sorry you're dealing with this. Housing disputes can be really stressful and I want to help you understand what general information and support might be available to you.\n\nBefore we start, please avoid including the full names or personal details of anyone else involved. You can refer to them as 'my landlord' or 'my letting agent' instead.\n\nCan you tell me a bit about what has been happening with your rental situation?",
  workplace: "Thank you for reaching out. Workplace issues can feel very isolating and I am here to help you understand what general information and support may be available.\n\nBefore we start, please avoid including the full names or personal details of anyone else involved. You can refer to them as 'my employer' or 'my manager' instead.\n\nCan you tell me what has been happening at work?",
  fraud: "I am sorry to hear you have been affected by this. Fraud and scams can be deeply upsetting and I want to help you understand what steps you might consider and where you can get support.\n\nBefore we start, please avoid including the full names or personal details of anyone else involved.\n\nCan you tell me what happened?",
  data: "Data and privacy concerns are taken seriously under UK law and there is general information and support available.\n\nBefore we start, please avoid including the full names or personal details of anyone else involved. You can refer to them as 'the company' or 'the organisation' instead.\n\nCan you tell me what happened with your data or privacy?",
  whistle: "Thank you for reaching out. Speaking up about wrongdoing takes courage and there are legal protections you should be aware of. I am here to help you understand what general information and support may be available.\n\nBefore we start, please avoid including the full names or personal details of anyone else involved. You can refer to them as 'my employer' or 'a colleague' instead.\n\nCan you tell me what you have witnessed or experienced?",
  general: "Hello, I am Speak, a general information and signposting tool. I can help you understand what support and information may be available across a range of situations.\n\nPlease avoid including the full names or personal details of anyone else involved in your situation.\n\nWhat would you like to find out more about?",
};

const quickReplies = {
  renter: ['Threatened with eviction', 'Deposit withheld', 'Unsafe conditions', 'Landlord entering without notice'],
  workplace: ['Potential discrimination', 'Harassment at work', 'Unfair dismissal', 'Unpaid wages'],
  fraud: ['Lost money to a scam', 'Received a fake product', 'Phishing or fraud call', 'Online shopping fraud'],
  data: ['Data shared without consent', 'Refused deletion request', 'Data breach', 'Spam after opting out'],
  whistle: ['Financial wrongdoing', 'Safety violations', 'Misuse of public funds', 'Not sure where to start'],
};

export default function ChatScreen({ navigation, route }) {
  const { category, anon } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef(null);
  const conversationRef = useRef([]);

  useEffect(() => {
    const opening = openingMessages[category] || openingMessages.general;
    const firstMsg = { role: 'ai', content: opening };
    setMessages([firstMsg]);
    conversationRef.current = [{ role: 'assistant', content: opening }];
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setShowQuickReplies(false);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    conversationRef.current.push({ role: 'user', content: msg });
    scrollToBottom();

    setLoading(true);
    try {
      const reply = await sendToAI(conversationRef.current);
      console.log('Reply received:', reply.substring(0, 200));

      if (reply.includes('<ACTION_PACK>')) {
        const match = reply.match(/<ACTION_PACK>([\s\S]*?)<\/ACTION_PACK>/);
        if (match) {
          try {
            const pack = JSON.parse(match[1].trim());
            const preText = reply.replace(/<ACTION_PACK>[\s\S]*?<\/ACTION_PACK>/, '').trim();
            const aiMsg = preText || "I've got everything I need. Here's your full action pack!";
            setMessages(prev => [...prev, { role: 'ai', content: aiMsg }]);
            conversationRef.current.push({ role: 'assistant', content: reply });
            scrollToBottom();

            // Save case to Supabase if logged in
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && !user.is_anonymous) {
            const { data: caseData } = await supabase
            .from('cases')
            .insert({ user_id: user.id, category, summary: pack.summary })
            .select()
            .single();
            if (caseData) {
            await supabase.from('action_packs').insert({
                    case_id: caseData.id,
                    rights: pack.rights,
                    legislation: pack.legislation,
                    action_plan: pack.action_plan,
                    evidence: pack.evidence,
                    authorities: pack.authorities,
                    draft_letter: pack.draft_letter,
                });
                }
            }
            } catch (e) {
            console.log('Could not save case:', e.message);
            }

            setTimeout(() => navigation.navigate('Results', { pack, category }), 1000);
          } catch (e) {
            const aiMsg = reply.replace(/<ACTION_PACK>[\s\S]*?<\/ACTION_PACK>/, '').trim();
            setMessages(prev => [...prev, { role: 'ai', content: aiMsg }]);
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: reply }]);
        conversationRef.current.push({ role: 'assistant', content: reply });

        if (reply.toLowerCase().includes('action pack') || reply.toLowerCase().includes('ready')) {
          setShowQuickReplies(true);
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "Sorry, something went wrong connecting to the AI. Please check your connection and try again."
      }]);
    }

    setLoading(false);
    scrollToBottom();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Speak</Text>
          <Text style={styles.headerSub}>
            {category === 'anon' ? 'Anonymous session' : `${category.charAt(0).toUpperCase() + category.slice(1)} issue`}
          </Text>
        </View>
        {anon && <View style={styles.anonBadge}><Text style={styles.anonText}>Anonymous</Text></View>}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((msg, i) => (
          <View key={i} style={[styles.msgRow, msg.role === 'user' ? styles.msgRowUser : styles.msgRowAi]}>
            {msg.role === 'ai' && (
              <View style={styles.aiAvatar}><Text style={{ fontSize: 14 }}>⚖️</Text></View>
            )}
            <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
              <Text style={[styles.bubbleText, msg.role === 'user' && styles.bubbleTextUser]}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={styles.msgRowAi}>
            <View style={styles.aiAvatar}><Text style={{ fontSize: 14 }}>⚖️</Text></View>
            <View style={styles.bubbleAi}>
              <ActivityIndicator size="small" color="#888" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick replies */}
      {showQuickReplies && quickReplies[category] && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickScroll}
          contentContainerStyle={styles.quickContent}
        >
          {quickReplies[category].map((qr, i) => (
            <TouchableOpacity key={i} style={styles.qrBtn} onPress={() => sendMessage(qr)}>
              <Text style={styles.qrText}>{qr}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={styles.inputArea}>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Describe your situation..."
            placeholderTextColor="#555"
            multiline
            maxLength={1000}
            onSubmitEditing={() => sendMessage()}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>Guidance only, not legal advice.</Text>
    </KeyboardAvoidingView>
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
  anonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(200,240,100,0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(200,240,100,0.2)',
  },
  anonText: { color: '#c8f064', fontSize: 11, fontWeight: '500' },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAi: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 28, height: 28,
    backgroundColor: '#c8f064',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: '#c8f064',
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: '#f0f0f0', fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: '#0f0f0f', fontWeight: '500' },
  quickScroll: { maxHeight: 44, flexShrink: 0 },
  quickContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  qrBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderRadius: 20,
  },
  qrText: { color: '#888', fontSize: 13 },
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 8,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#2e2e2e',
    alignItems: 'flex-end',
  },
  inputWrap: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: { color: '#f0f0f0', fontSize: 14, maxHeight: 100 },
  sendBtn: {
    width: 42, height: 42,
    backgroundColor: '#c8f064',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#242424' },
  sendIcon: { color: '#0f0f0f', fontSize: 18, fontWeight: '700' },
  disclaimer: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    paddingBottom: 12,
  },
});