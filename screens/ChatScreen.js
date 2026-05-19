import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Video, MoreVertical, Plus, Send, Calendar } from 'lucide-react-native';
import { messageApi } from '../services/api';

const initialMessages = [];

export default function ChatScreen({ route, navigation }) {
  const { doctor, user } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (user?.id && doctor?._id) {
      fetchMessages();
    }
  }, [user, doctor]);

  const fetchMessages = async () => {
    try {
      const response = await messageApi.getHistory(user.id, doctor._id);
      // Map backend messages to UI format
      const formatted = response.data.map(m => ({
        id: m._id,
        text: m.text,
        sender: m.sender === user.id ? 'patient' : 'doctor',
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: m.type
      }));
      setMessages(formatted);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (inputText.trim()) {
      try {
        const response = await messageApi.send({
          sender: user.id,
          receiver: doctor._id,
          text: inputText
        });
        const newMessage = {
          id: response.data._id,
          text: inputText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'patient',
        };
        setMessages([...messages, newMessage]);
        setInputText('');
      } catch (err) {
        alert('Failed to send message');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <View style={styles.doctorInfo}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: doctor.image }} style={styles.avatar} />
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.onlineStatus}>Online</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Video color="#1552C1" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MoreVertical color="#94A3B8" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
        <View style={styles.dateSeparator}>
          <Text style={styles.dateText}>TODAY</Text>
        </View>

        {loading ? (
          <Text></Text>
        ) : (
          messages.map((msg) => (
            <View key={msg.id} style={[styles.messageRow, msg.sender === 'patient' ? styles.patientRow : styles.doctorRow]}>
              {msg.sender === 'doctor' && <Image source={{ uri: doctor.image || 'https://via.placeholder.com/150' }} style={styles.msgAvatar} />}
              
              <View style={styles.messageBubbleContainer}>
                {msg.type === 'booking' ? (
                  <View style={styles.bookingCard}>
                    <View style={styles.bookingIcon}>
                      <Calendar color="#1552C1" size={20} />
                    </View>
                    <View>
                      <Text style={styles.bookingTitle}>{msg.title}</Text>
                      <Text style={styles.bookingTime}>{msg.time}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.bubble, msg.sender === 'patient' ? styles.patientBubble : styles.doctorBubble]}>
                    <Text style={[styles.messageText, msg.sender === 'patient' ? styles.patientText : styles.doctorText]}>
                      {msg.text}
                    </Text>
                  </View>
                )}
                <Text style={[styles.timeText, msg.sender === 'patient' ? { textAlign: 'right' } : { textAlign: 'left' }]}>
                  {msg.time}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.plusButton}>
            <Plus color="#94A3B8" size={24} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Send color="white" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: '#22C55E',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContent: {
    padding: 20,
    paddingBottom: 40,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
  },
  doctorRow: {
    alignSelf: 'flex-start',
  },
  patientRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubbleContainer: {
    flex: 1,
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 4,
  },
  doctorBubble: {
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 4,
  },
  patientBubble: {
    backgroundColor: '#1552C1',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  doctorText: {
    color: '#1E293B',
  },
  patientText: {
    color: 'white',
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 4,
  },
  bookingIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1552C1',
  },
  bookingTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  plusButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    paddingHorizontal: 20,
    fontSize: 15,
    color: '#000',
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1552C1',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
