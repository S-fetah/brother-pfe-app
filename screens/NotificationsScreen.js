import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Calendar, MessageSquare, AlertCircle, Clock } from 'lucide-react-native';

const notifications = [
  {
    id: 1,
    type: 'appointment',
    title: 'Appointment Reminder',
    message: 'Dr. James Wilson accepte your appointment tomorrow at 10:30 AM.',
    time: '2 hours ago',
    icon: Calendar,
    color: '#1552C1',
    unread: true,
  },
  {
    id: 2,
    type: 'message',
    title: 'New Message',
    message: 'Dr. Sarah Chen refused your appointment.',
    time: '5 hours ago',
    icon: MessageSquare,
    color: '#10B981',
    unread: true,
  },
  {
    id: 3,
    type: 'system',
    title: 'System Update',
    message: 'MediCare has been updated with new features and performance improvements.',
    time: 'Yesterday',
    icon: AlertCircle,
    color: '#64748B',
    unread: false,
  }
];

export default function NotificationsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markRead}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {notifications.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.notificationCard, item.unread && styles.unreadCard]}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <item.icon color={item.color} size={24} />
            </View>
            <View style={styles.content}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                {item.unread && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <View style={styles.timeRow}>
                <Clock color="#94A3B8" size={12} />
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  markRead: {
    fontSize: 14,
    color: '#1552C1',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#1552C1',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#1552C1',
    borderRadius: 4,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
