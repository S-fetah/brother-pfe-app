import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Award, Calendar, CheckCircle, RefreshCw, Star, Stethoscope } from 'lucide-react-native';
import { bookAppointment } from '../api/bookings';
import { DEFAULT_DOCTOR_IMAGE, getDoctorAppointments, normalizeDoctor } from '../api/doctors';

const formatDate = (value) => {
  if (!value) return 'N/A';

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const statusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'available':
      return '#059669';
    case 'booked':
      return '#1552C1';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#64748B';
  }
};

export default function DoctorDetailsScreen({ route, navigation }) {
  const doctor = normalizeDoctor(route.params?.doctor || {});
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [error, setError] = useState('');

  const loadAppointments = useCallback(async () => {
    if (!doctor.uid) {
      setError('Doctor id is missing.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError('');
      const data = await getDoctorAppointments(doctor.uid);
      setAppointments(data);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [doctor.uid]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAppointments();
  }, [loadAppointments]);

  const handleBook = async (appointment) => {
    if (appointment.status?.toLowerCase() !== 'available') return;

    setBookingId(appointment.id);
    try {
      await bookAppointment(appointment.id);
      Alert.alert('Success', 'Appointment booked successfully.');
      loadAppointments();
    } catch (err) {
      Alert.alert('Booking failed', err.message || 'Could not book this appointment.');
    } finally {
      setBookingId('');
    }
  };

  const certifications = Array.isArray(doctor.details?.certification) ? doctor.details.certification : [];
  const specialities = Array.isArray(doctor.details?.specialities)
    ? doctor.details.specialities
    : [doctor.speciality].filter(Boolean);
  const reviews = Array.isArray(doctor.details?.reviews) ? doctor.details.reviews : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <TouchableOpacity style={styles.iconButton} onPress={onRefresh}>
          <RefreshCw color="#1E293B" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1552C1']} />}
      >
        <View style={styles.mainCard}>
          <Image source={{ uri: doctor.image || DEFAULT_DOCTOR_IMAGE }} style={styles.doctorImage} />
          <Text style={styles.doctorName}>{doctor.fullName}</Text>
          <Text style={styles.doctorSub}>{doctor.details?.title || doctor.speciality}</Text>

          <View style={styles.verifiedBadge}>
            <CheckCircle color="#1552C1" size={14} />
            <Text style={styles.verifiedText}>{doctor.status || 'registered'} physician</Text>
          </View>

          <Text style={styles.sectionTitle}>ABOUT</Text>
          <Text style={styles.bioText}>{doctor.details?.bio || 'No bio available yet.'}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Stethoscope color="#1552C1" size={20} />
            <Text style={styles.cardTitle}>Specialties</Text>
          </View>
          <View style={styles.tagContainer}>
            {specialities.map((item) => (
              <View key={item} style={styles.tag}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {certifications.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Award color="#1552C1" size={20} />
              <Text style={styles.cardTitle}>Certification</Text>
            </View>
            {certifications.map((item, index) => (
              <Text key={`${item}-${index}`} style={styles.listText}>{item}</Text>
            ))}
          </View>
        )}

        {reviews.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Star color="#F59E0B" fill="#F59E0B" size={20} />
              <Text style={styles.cardTitle}>Reviews</Text>
            </View>
            {reviews.map((review, index) => (
              <Text key={`${review}-${index}`} style={styles.reviewText}>{review}</Text>
            ))}
          </View>
        )}

        <View style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingTitle}>Available Appointments</Text>
            <Text style={styles.bookingSub}>Only real slots from this doctor are shown here.</Text>
          </View>

          {loading ? (
            <View style={styles.appointmentState}>
              <ActivityIndicator color="#1552C1" />
              <Text style={styles.stateText}>Loading appointments...</Text>
            </View>
          ) : error && appointments.length === 0 ? (
            <View style={styles.appointmentState}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadAppointments}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : appointments.length === 0 ? (
            <View style={styles.appointmentState}>
              <Calendar color="#94A3B8" size={32} />
              <Text style={styles.emptyTitle}>No appointments available</Text>
              <Text style={styles.stateText}>Check back later for new slots.</Text>
            </View>
          ) : (
            appointments.map((appointment) => {
              const available = appointment.status?.toLowerCase() === 'available';
              const activeBooking = bookingId === appointment.id;

              return (
                <View key={appointment.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentRow}>
                    <Text style={styles.appointmentLabel}>Date</Text>
                    <Text style={styles.appointmentValue}>{formatDate(appointment.appointmentDate)}</Text>
                  </View>
                  <View style={styles.appointmentRow}>
                    <Text style={styles.appointmentLabel}>Time</Text>
                    <Text style={styles.appointmentValue}>{appointment.appointmentTime || 'N/A'}</Text>
                  </View>
                  <View style={styles.appointmentRow}>
                    <Text style={styles.appointmentLabel}>Fee</Text>
                    <Text style={styles.appointmentValue}>
                      {appointment.consultationFee ? `$${appointment.consultationFee}` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.appointmentRow}>
                    <Text style={styles.appointmentLabel}>Status</Text>
                    <Text style={[styles.appointmentValue, { color: statusColor(appointment.status) }]}>
                      {appointment.status || 'unknown'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.bookButton, !available && styles.disabledBookButton]}
                    onPress={() => handleBook(appointment)}
                    disabled={!available || activeBooking}
                  >
                    {activeBooking ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.bookButtonText}>{available ? 'Book Now' : 'Unavailable'}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          )}
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
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doctorImage: {
    width: 112,
    height: 112,
    borderRadius: 24,
    marginBottom: 18,
  },
  doctorName: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
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
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    width: '100%',
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
  },
  bioText: {
    width: '100%',
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
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
    borderRadius: 14,
  },
  tagText: {
    fontSize: 13,
    color: '#1552C1',
    fontWeight: '700',
  },
  listText: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 8,
  },
  reviewText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingHeader: {
    backgroundColor: '#1552C1',
    padding: 20,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  bookingSub: {
    fontSize: 13,
    color: '#DBEAFE',
    marginTop: 4,
  },
  appointmentState: {
    alignItems: 'center',
    padding: 24,
  },
  stateText: {
    marginTop: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#1E293B',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 10,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '700',
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: '#1552C1',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: 'white',
    fontWeight: '800',
  },
  appointmentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    margin: 14,
    marginBottom: 0,
  },
  appointmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  appointmentLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  appointmentValue: {
    flex: 1,
    color: '#1E293B',
    fontWeight: '700',
    textAlign: 'right',
  },
  bookButton: {
    backgroundColor: '#1552C1',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  disabledBookButton: {
    backgroundColor: '#94A3B8',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
});
