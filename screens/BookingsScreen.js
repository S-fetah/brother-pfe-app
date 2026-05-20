import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Calendar,
  Clock,
  DollarSign,
  RefreshCw,
  User,
  X,
  Stethoscope,
  FileText,
} from 'lucide-react-native';
import { getUserBookings } from '../api/bookings';

const formatDate = (value) => {
  if (!value) return 'N/A';

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const formatTime = (time) => {
  if (!time) return 'N/A';
  return time;
};

const statusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'accepted':
      return '#059669';
    case 'pending acceptence':
    case 'pending acceptance':
    case 'pending':
      return '#D97706';
    case 'cancelled':
    case 'rejected':
      return '#EF4444';
    case 'booked':
      return '#1552C1';
    case 'available':
      return '#10B981';
    default:
      return '#64748B';
  }
};

export default function BookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));
  const flatListRef = useRef(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return unsubscribe;
  }, [navigation]);

  const loadBookings = useCallback(async () => {
    try {
      setError('');
      const data = await getUserBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookings();
  }, [loadBookings]);

  const openDetail = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
    Animated.spring(modalAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const closeDetail = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowDetailModal(false);
      setSelectedBooking(null);
    });
  };

  const renderBooking = ({ item, index }) => {
    const status = item.status || 'unknown';
    const appointment = item.appointment || {};
    const doctor = item.doctor || {};
    const doctorName = doctor.fullName || 'Doctor';
    const specialty = doctor.speciality || appointment.speciality || 'General';
    const aptDate = appointment.appointmentDate || item.appointmentDate;
    const aptTime = appointment.appointmentTime || item.appointmentTime;

    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => openDetail(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.doctorInfo}>
            <View style={styles.doctorAvatar}>
              <Stethoscope color="#1552C1" size={20} />
            </View>
            <View>
              <Text style={styles.doctorName}>{doctorName}</Text>
              <Text style={styles.doctorSpecialty}>{specialty}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor(status)}18` }]}>
            <Text style={[styles.statusText, { color: statusColor(status) }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.quickDetails}>
          {aptDate && (
            <View style={styles.quickDetailItem}>
              <Calendar color="#64748B" size={14} />
              <Text style={styles.quickDetailText}>{formatDate(aptDate)}</Text>
            </View>
          )}
          {aptTime && (
            <View style={styles.quickDetailItem}>
              <Clock color="#64748B" size={14} />
              <Text style={styles.quickDetailText}>{formatTime(aptTime)}</Text>
            </View>
          )}
          {appointment.consultationFee && (
            <View style={styles.quickDetailItem}>
              <DollarSign color="#64748B" size={14} />
              <Text style={styles.quickDetailText}>${appointment.consultationFee}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>Tap for details</Text>
          <Text style={styles.bookedDate}>Booked {formatDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedBooking) return null;

    const booking = selectedBooking;
    const appointment = booking.appointment || {};
    const doctor = booking.doctor || {};
    const status = booking.status || 'unknown';

    return (
      <Modal
        visible={showDetailModal}
        transparent
        animationType="fade"
        onRequestClose={closeDetail}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    scale: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1],
                    }),
                  },
                ],
                opacity: modalAnimation,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeDetail}>
                <X color="#64748B" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <View style={styles.doctorSection}>
                <View style={styles.doctorAvatarLarge}>
                  <Stethoscope color="#1552C1" size={32} />
                </View>
                <Text style={styles.modalDoctorName}>{doctor.fullName || 'N/A'}</Text>
                {doctor.title && (
                  <Text style={styles.modalDoctorTitle}>{doctor.title}</Text>
                )}
                <Text style={styles.modalDoctorSpecialty}>{doctor.speciality || 'N/A'}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Appointment</Text>

                <View style={styles.detailGrid}>
                  <View style={styles.detailCard}>
                    <View style={styles.detailCardIcon}>
                      <Calendar color="#1552C1" size={20} />
                    </View>
                    <Text style={styles.detailCardLabel}>Date</Text>
                    <Text style={styles.detailCardValue}>
                      {formatDate(appointment.appointmentDate || booking.appointmentDate)}
                    </Text>
                  </View>

                  <View style={styles.detailCard}>
                    <View style={styles.detailCardIcon}>
                      <Clock color="#1552C1" size={20} />
                    </View>
                    <Text style={styles.detailCardLabel}>Time</Text>
                    <Text style={styles.detailCardValue}>
                      {formatTime(appointment.appointmentTime || booking.appointmentTime)}
                    </Text>
                  </View>

                  <View style={styles.detailCard}>
                    <View style={styles.detailCardIcon}>
                      <DollarSign color="#1552C1" size={20} />
                    </View>
                    <Text style={styles.detailCardLabel}>Fee</Text>
                    <Text style={styles.detailCardValue}>
                      ${appointment.consultationFee || booking.consultationFee || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.detailCard}>
                    <View style={styles.detailCardIcon}>
                      <FileText color="#1552C1" size={20} />
                    </View>
                    <Text style={styles.detailCardLabel}>Status</Text>
                    <View style={[styles.statusBadgeLarge, { backgroundColor: `${statusColor(status)}18` }]}>
                      <Text style={[styles.statusTextLarge, { color: statusColor(status) }]}>
                        {status}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Booking Info</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Booking ID</Text>
                  <Text style={styles.infoValue}>{booking.bookingId || booking.id || 'N/A'}</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Appointment ID</Text>
                  <Text style={styles.infoValue}>{booking.appointmentId || appointment.id || 'N/A'}</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Doctor ID</Text>
                  <Text style={styles.infoValueSmall}>{appointment.doctorId || 'N/A'}</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Booked On</Text>
                  <Text style={styles.infoValue}>{formatDate(booking.createdAt)}</Text>
                </View>
                {booking.updatedAt && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Last Updated</Text>
                      <Text style={styles.infoValue}>{formatDate(booking.updatedAt)}</Text>
                    </View>
                  </>
                )}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalCloseButton} onPress={closeDetail}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const content = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator color="#1552C1" size="large" />
          <Text style={styles.stateText}>Loading bookings...</Text>
        </View>
      );
    }

    if (error && bookings.length === 0) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.errorTitle}>Failed to load bookings</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBookings}>
            <RefreshCw color="white" size={18} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        ref={flatListRef}
        data={bookings}
        keyExtractor={(item, index) => item.bookingId || item.appointmentId || `booking-${index}`}
        renderItem={renderBooking}
        contentContainerStyle={bookings.length ? styles.listContent : styles.emptyListContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1552C1']} />}
        ListEmptyComponent={
          <View style={styles.centerState}>
            <Calendar color="#94A3B8" size={42} />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.stateText}>Browse doctors and book your first appointment.</Text>
            <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.browseText}>Browse Doctors</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.bellButton} onPress={() => navigation.navigate('Notifications')}>
          <Bell color="#1E293B" size={24} />
        </TouchableOpacity>
      </View>
      {content()}
      {renderDetailModal()}
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
    fontWeight: '800',
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
  listContent: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  doctorAvatar: {
    width: 42,
    height: 42,
    backgroundColor: '#EFF6FF',
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  quickDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  quickDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickDetailText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#1552C1',
    fontWeight: '600',
  },
  bookedDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  stateText: {
    marginTop: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  emptyTitle: {
    marginTop: 12,
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '800',
  },
  errorTitle: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '800',
  },
  retryButton: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1552C1',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: {
    color: 'white',
    fontWeight: '800',
  },
  browseButton: {
    marginTop: 18,
    backgroundColor: '#1552C1',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  browseText: {
    color: 'white',
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  closeButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingHorizontal: 24,
  },
  doctorSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  doctorAvatarLarge: {
    width: 72,
    height: 72,
    backgroundColor: '#EFF6FF',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalDoctorName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalDoctorTitle: {
    fontSize: 14,
    color: '#1552C1',
    fontWeight: '600',
    marginTop: 4,
  },
  modalDoctorSpecialty: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  detailSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  detailCardIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  detailCardLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailCardValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
    textAlign: 'center',
  },
  statusBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 4,
  },
  statusTextLarge: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },
  infoValueSmall: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600',
    maxWidth: 200,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  modalCloseButton: {
    backgroundColor: '#1552C1',
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
