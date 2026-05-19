import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell, Heart, Star, Clock } from 'lucide-react-native';
import { doctorApi } from '../services/api';
import { ActivityIndicator } from 'react-native';

const specialties = [
  { id: 1, name: 'Cardiology', icon: '❤️', color: '#FEF2F2' },
  { id: 2, name: 'Pediatrics', icon: '👶', color: '#EFF6FF' },
  { id: 3, name: 'Neurology', icon: '🧠', color: '#F5F3FF' },
  { id: 4, name: 'Dermatology', icon: '🧴', color: '#ECFDF5' },
  { id: 5, name: 'Psychiatry', icon: '🧠', color: '#FEE2E2' },
  { id: 6, name: 'Orthopedics', icon: '🦴', color: '#E0F2FE' },
  { id: 7, name: 'Ophthalmology', icon: '👁️', color: '#EDE9FE' },
  { id: 8, name: 'Otolaryngology', icon: '👂', color: '#ECFDF5' },
  { id: 9, name: 'Gastroenterology', icon: '🫀', color: '#FEFCE8' },
  { id: 10, name: 'Pulmonology', icon: '🌬️', color: '#EFF6FF' },
  { id: 11, name: 'Nephrology', icon: '🫁', color: '#F0F9FF' },
  { id: 12, name: 'Rheumatology', icon: '🦵', color: '#F5F3FF' },
  { id: 13, name: 'Oncology', icon: '🎗️', color: '#FCE7F3' },
  { id: 14, name: 'Radiology', icon: '🩻', color: '#E0F2FE' },
  { id: 15, name: 'Pathology', icon: '🧬', color: '#EEF2FF' },
  { id: 16, name: 'Anesthesiology', icon: '💉', color: '#F8FAFC' },
  { id: 17, name: 'General Surgery', icon: '🔪', color: '#FEE2E2' },
  { id: 18, name: 'Urology', icon: '🚽', color: '#ECFDF5' },
  { id: 19, name: 'Gynecology', icon: '👩‍⚕️', color: '#FCE7F3' },
  { id: 20, name: 'Family Medicine', icon: '🏥', color: '#E7F5FF' },
];

export default function HomeScreen({ navigation }) {
  const [doctors, setDoctors] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorApi.getDoctors();
        setDoctors(response.data);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>WELCOME BACK</Text>
          <Text style={styles.nameText}>Find your specialist today</Text>
        </View>
        <TouchableOpacity style={styles.bellButton} onPress={() => navigation.navigate('Notifications')}>
          <Bell color="#1E293B" size={24} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Search color="#94A3B8" size={20} style={styles.searchIcon} />
            <TextInput
              placeholder="Search for doctors ..."
              placeholderTextColor={'gray'}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medical Specialties</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtiesScroll}>
          {specialties.map((item) => (
            <TouchableOpacity key={item.id} style={styles.specialtyCard}>
              <View style={[styles.specialtyIcon, { backgroundColor: item.color }]}>
                <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              </View>
              <Text style={styles.specialtyName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Doctors</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1552C1" style={{ marginTop: 40 }} />
        ) : (
          doctors.map((doctor) => (
            <TouchableOpacity 
              key={doctor._id} 
              style={styles.doctorCard}
              onPress={() => navigation.navigate('DoctorDetails', { doctor })}
            >
              <View style={styles.doctorInfo}>
                <Image source={{ uri: doctor.image || 'https://via.placeholder.com/150' }} style={styles.doctorImage} />
                <View style={styles.doctorDetails}>
                  <Text style={styles.doctorName}>{doctor.fullName}</Text>
                  <Text style={styles.doctorSub}>{doctor.specialty} • {doctor.hospital || 'MediCare Center'}</Text>
                  <View style={styles.ratingRow}>
                    <Star color="#F59E0B" size={14} />
                    <Text style={styles.ratingText}>{doctor.rating || 5.0} ({doctor.reviews || 0} Reviews)</Text>
                  </View>
                </View>
              </View>
              <View style={styles.availabilityRow}>
                <View>
                  <Text style={styles.availTitle}>NEXT AVAILABLE</Text>
                  <Text style={styles.availValue}>Today, 09:00 AM</Text>
                </View>
                <View style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Book</Text>
                </View>
              </View>
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1552C1',
    letterSpacing: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  bellButton: {
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bellDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginVertical: 20,
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  searchButton: {
    backgroundColor: '#1552C1',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  viewAllText: {
    color: '#1552C1',
    fontWeight: '600',
  },
  specialtiesScroll: {
    paddingLeft: 24,
    marginBottom: 32,
  },
  specialtyCard: {
    alignItems: 'center',
    marginRight: 24,
  },
  specialtyIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  specialtyName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  doctorCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  doctorInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
  },
  doctorDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  doctorSub: {
    fontSize: 14,
    color: '#64748B',
    marginVertical: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  availTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  availValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  bookButton: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#1552C1',
    fontWeight: '600',
  },
});
