import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Star, Award, Stethoscope, MapPin, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react-native';
import { appointmentApi } from '../services/api';
import { ActivityIndicator } from 'react-native';

const reviews = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    rating: 5,
    comment: 'Dr. Wilson was incredibly thorough and patient. He explained everything in detail and made me feel at ease throughout the whole check-up.',
    date: '2 weeks ago',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
  }
];

const dates = [
  { day: 'Mon', date: '18', full: 'November 18' },
  { day: 'Tue', date: '19', full: 'November 19' },
  { day: 'Wed', date: '20', full: 'November 20' },
  { day: 'Thu', date: '21', full: 'November 21' },
  { day: 'Fri', date: '22', full: 'November 22' },
];

const slots = ['09:00 AM', '10:30 AM', '01:15 PM', '03:45 PM'];

export default function DoctorDetailsScreen({ route, navigation }) {
  const { doctor, user } = route.params || {};
  const [selectedDate, setSelectedDate] = useState('18');
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!user) return alert('Please login to book an appointment');
    
    setLoading(true);
    try {
      await appointmentApi.create({
        patient: user.id,
        doctor: doctor._id,
        date: `2024-11-${selectedDate}`,
        time: selectedSlot,
        notes: 'Consultation'
      });
      alert('Appointment booked successfully!');
      navigation.navigate('Payment', { doctor, user });
    } catch (err) {
      alert('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MediCare</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Bell color="#1E293B" size={24} />
          </TouchableOpacity>
          <View style={styles.profileSmall} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainCard}>
          <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSub}>Senior {doctor.specialty} • Heart & Vascular Institute</Text>
          
          <View style={styles.verifiedBadge}>
            <CheckCircle color="#1552C1" size={14} />
            <Text style={styles.verifiedText}>Verified Physician</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>15+</Text>
              <Text style={styles.statLabel}>Years Exp.</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>2k+</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{doctor.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{doctor.reviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>BIOGRAPHY</Text>
          <Text style={styles.bioText}>
            {doctor.name} is a world-renowned cardiologist with over 15 years of experience in non-invasive cardiac procedures and preventative medicine. He specializes in heart failure management and advanced diagnostic imaging.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Stethoscope color="#1552C1" size={20} />
            <Text style={styles.cardTitle}>Specialties</Text>
          </View>
          <View style={styles.tagContainer}>
            {['Interventional Cardiology', 'Heart Valve Disease', 'Hypertension', 'Electrophysiology'].map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Award color="#1552C1" size={20} />
            <Text style={styles.cardTitle}>Certification</Text>
          </View>
          <View style={styles.certRow}>
            <View style={styles.certIcon}>
              <Award color="#1552C1" size={24} />
            </View>
            <View>
              <Text style={styles.certName}>Board Certified Cardiologist</Text>
              <Text style={styles.certSub}>American Board of Internal Medicine</Text>
            </View>
          </View>
        </View>

        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Patient Reviews</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {reviews.map(review => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Image source={{ uri: review.image }} style={styles.reviewerImage} />
              <View style={{ flex: 1 }}>
                <View style={styles.reviewerRow}>
                  <Text style={styles.reviewerName}>{review.name}</Text>
                  <View style={styles.stars}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} color="#F59E0B" fill="#F59E0B" />)}
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingTitle}>Book Appointment</Text>
            <Text style={styles.bookingSub}>Select your preferred date & time</Text>
          </View>
          
          <View style={styles.monthRow}>
            <Text style={styles.monthText}>November 2024</Text>
            <View style={styles.chevronRow}>
              <ChevronLeft size={20} color="#94A3B8" />
              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {dates.map(d => (
              <TouchableOpacity 
                key={d.date} 
                style={[styles.dateCard, selectedDate === d.date && styles.dateCardActive]}
                onPress={() => setSelectedDate(d.date)}
              >
                <Text style={[styles.dayText, selectedDate === d.date && styles.textActive]}>{d.day}</Text>
                <Text style={[styles.dateText, selectedDate === d.date && styles.textActive]}>{d.date}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.availTitle}>Available Slots</Text>
          <View style={styles.slotsGrid}>
            {slots.map(slot => (
              <TouchableOpacity 
                key={slot} 
                style={[styles.slotCard, selectedSlot === slot && styles.slotCardActive]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Consultation Fee</Text>
            <Text style={styles.feeValue}>$150.00</Text>
          </View>

          <TouchableOpacity style={styles.bookButton} onPress={handleBook} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.bookButtonText}>Book Now</Text>}
          </TouchableOpacity>
        </View>

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
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1552C1',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  doctorImage: {
    width: 140,
    height: 160,
    borderRadius: 20,
    marginBottom: 20,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  doctorSub: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  verifiedText: {
    fontSize: 12,
    color: '#1552C1',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    alignSelf: 'flex-start',
    marginTop: 24,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    textAlign: 'left',
    width: '100%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: '#1552C1',
    fontWeight: '500',
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  certIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  certSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAll: {
    color: '#1552C1',
    fontWeight: '700',
    fontSize: 13,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  reviewDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bookingHeader: {
    backgroundColor: '#1552C1',
    padding: 20,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  bookingSub: {
    fontSize: 13,
    color: '#DBEAFE',
    marginTop: 4,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  chevronRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateScroll: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  dateCard: {
    width: 60,
    height: 70,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dateCardActive: {
    backgroundColor: '#1552C1',
    borderColor: '#1552C1',
  },
  dayText: {
    fontSize: 12,
    color: '#64748B',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  textActive: {
    color: 'white',
  },
  availTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  slotCard: {
    width: '48%',
    height: 48,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1552C1',
  },
  slotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  slotTextActive: {
    color: '#1552C1',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  feeLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  feeValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1552C1',
  },
  bookButton: {
    backgroundColor: '#1552C1',
    margin: 20,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  mapPlaceholder: {
    height: 160,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
    overflow: 'hidden',
  },
  mapImg: {
    width: '100%',
    height: '100%',
  },
  hospitalName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  hospitalAddr: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
});
