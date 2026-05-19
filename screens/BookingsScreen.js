import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, ChevronRight, Bell } from 'lucide-react-native';
import { appointmentApi } from '../services/api';

export default function BookingsScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = React.useState('Upcoming');
  const user = route.params?.user;

  const mockAppointments = [
    {
      _id: '1',
      doctor: {
        _id: 'd1',
        name: 'Dr. James Wilson',
        fullName: 'Dr. James Wilson',
        specialty: 'Cardiologist',
        image: 'https://images.unsplash.com/photo-1612349317150-e539c7599306?w=150',
        rating: 4.9,
        reviews: 128
      },
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      time: '10:30 AM',
      status: 'confirmed'
    },
    {
      _id: '2',
      doctor: {
        _id: 'd2',
        name: 'Dr. Sarah Mitchell',
        fullName: 'Dr. Sarah Mitchell',
        specialty: 'Dermatologist',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        rating: 4.8,
        reviews: 95
      },
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '2:00 PM',
      status: 'pending'
    },
    {
      _id: '3',
      doctor: {
        _id: 'd3',
        name: 'Dr. Michael Chen',
        fullName: 'Dr. Michael Chen',
        specialty: 'Neurologist',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        rating: 4.7,
        reviews: 112
      },
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      time: '9:00 AM',
      status: 'completed'
    },
    {
      _id: '4',
      doctor: {
        _id: 'd4',
        name: 'Dr. Emma Johnson',
        fullName: 'Dr. Emma Johnson',
        specialty: 'General Practitioner',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        rating: 4.6,
        reviews: 87
      },
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      time: '11:00 AM',
      status: 'cancelled'
    },
    {
      _id: '5',
      doctor: {
        _id: 'd5',
        name: 'Dr. Robert Williams',
        fullName: 'Dr. Robert Williams',
        specialty: 'Orthopedist',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        rating: 4.9,
        reviews: 156
      },
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      time: '3:30 PM',
      status: 'completed'
    },
  ];

  const filteredAppointments = mockAppointments.filter(app => {
    if (activeTab === 'Upcoming') return app.status === 'confirmed' || app.status === 'pending';
    if (activeTab === 'Past') return app.status === 'completed';
    if (activeTab === 'Cancelled') return app.status === 'cancelled';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity 
          style={styles.bellButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Bell color="#1E293B" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {['Upcoming', 'Past', 'Cancelled'].map(tab => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredAppointments.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#64748B' }}>No {activeTab.toLowerCase()} bookings found.</Text>
        ) : (
          filteredAppointments.map((item) => (
            <TouchableOpacity key={item._id} style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <View style={styles.doctorInfo}>
                  <Image source={{ uri: item.doctor?.image || 'https://via.placeholder.com/150' }} style={styles.doctorImage} />
                  <View>
                    <Text style={styles.doctorName}>{item.doctor?.fullName}</Text>
                    <Text style={styles.doctorSub}>{item.doctor?.specialty}</Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge, 
                  item.status === 'confirmed' ? styles.upcomingBadge : 
                  item.status === 'completed' ? styles.completedBadge : 
                  styles.cancelledBadge
                ]}>
                  <Text style={[
                    styles.statusText, 
                    item.status === 'confirmed' ? styles.upcomingText : 
                    item.status === 'completed' ? styles.completedText : 
                    styles.cancelledText
                  ]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.infoRow}>
                  <Calendar color="#64748B" size={16} />
                  <Text style={styles.infoText}>{new Date(item.date).toDateString()}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Clock color="#64748B" size={16} />
                  <Text style={styles.infoText}>{item.time}</Text>
                </View>
              </View>

              {activeTab === 'Upcoming' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('DoctorDetails', { doctor: item.doctor, user })}
                  >
                    <Text style={styles.primaryButtonText}>Reschedule</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  bellButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    backgroundColor: 'white',
    paddingBottom: 16,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#1552C1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: 'white',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doctorImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  doctorSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upcomingBadge: {
    backgroundColor: '#EFF6FF',
  },
  completedBadge: {
    backgroundColor: '#ECFDF5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  upcomingText: {
    color: '#1552C1',
  },
  completedText: {
    color: '#059669',
  },
  cancelledBadge: {
    backgroundColor: '#FEF2F2',
  },
  cancelledText: {
    color: '#EF4444',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#1552C1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
