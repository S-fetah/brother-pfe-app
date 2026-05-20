import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, RefreshCw, Search, Star, Stethoscope, UserRound } from 'lucide-react-native';
import { DEFAULT_DOCTOR_IMAGE, getDoctors } from '../api/doctors';

const specialtyColors = ['#EFF6FF', '#ECFDF5', '#F5F3FF', '#FEF2F2', '#F0F9FF'];

export default function HomeScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return unsubscribe;
  }, [navigation]);

  const loadDoctors = useCallback(async () => {
    try {
      setError('');
      const data = await getDoctors();
      setDoctors(data);
    } catch (err) {
      setError(err.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDoctors();
  }, [loadDoctors]);

  const filteredDoctors = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return doctors;

    return doctors.filter((doctor) => {
      const text = `${doctor.fullName} ${doctor.speciality} ${doctor.details?.title || ''}`.toLowerCase();
      return text.includes(term);
    });
  }, [doctors, query]);

  const specialties = useMemo(() => {
    const names = [...new Set(doctors.map((doctor) => doctor.speciality).filter(Boolean))];
    return names.map((name, index) => ({
      name,
      color: specialtyColors[index % specialtyColors.length],
    }));
  }, [doctors]);

const INITIAL_COLORS = [
  '#1552C1', '#059669', '#7C3AED', '#DC2626', '#D97706',
  '#0891B2', '#BE185D', '#4F46E5', '#65A30D', '#EA580C',
];

const getInitialColor = (name) => {
  const index = (name?.charCodeAt(0) || 0) % INITIAL_COLORS.length;
  return INITIAL_COLORS[index];
};

const getInitial = (name) => {
  const first = name?.trim().split(' ')[0] || '?';
  return first.charAt(0).toUpperCase();
};

const renderDoctor = ({ item }) => {
    const title = item.details?.title || item.speciality;
    const reviews = Array.isArray(item.details?.reviews) ? item.details.reviews.length : item.reviews || 0;
    const initial = getInitial(item.fullName);
    const bgColor = getInitialColor(item.fullName);

    return (
      <TouchableOpacity
        style={styles.doctorCard}
        onPress={() => navigation.navigate('DoctorDetails', { doctor: item })}
        activeOpacity={0.78}
      >
        <View style={styles.doctorInfo}>
          <View style={[styles.initialCircle, { backgroundColor: bgColor }]}>
            <Text style={styles.initialText}>{initial}</Text>
          </View>
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName} numberOfLines={1}>{item.fullName}</Text>
            <Text style={styles.doctorSub} numberOfLines={1}>{title}</Text>
            <View style={styles.ratingRow}>
              <Star color="#F59E0B" fill="#F59E0B" size={14} />
              <Text style={styles.ratingText}>{reviews} reviews</Text>
            </View>
          </View>
        </View>

        <View style={styles.availabilityRow}>
          <View style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.pendingBadge]}>
            <Text style={[styles.statusText, item.status === 'active' ? styles.activeText : styles.pendingText]}>
              {item.status || 'unknown'}
            </Text>
          </View>
          <Text style={styles.bookHint}>View appointments</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>PATIENT CARE</Text>
          <Text style={styles.nameText}>Find your specialist today</Text>
        </View>
        <TouchableOpacity style={styles.bellButton} onPress={() => navigation.navigate('Notifications')}>
          <Bell color="#1E293B" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search color="#94A3B8" size={20} style={styles.searchIcon} />
          <TextInput
            placeholder="Search doctors or specialties"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {specialties.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medical Specialties</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={specialties}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.specialtiesList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.specialtyCard} onPress={() => setQuery(item.name)}>
                <View style={[styles.specialtyIcon, { backgroundColor: item.color }]}>
                  <Stethoscope color="#1552C1" size={22} />
                </View>
                <Text style={styles.specialtyName} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Doctors</Text>
      </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator color="#1552C1" size="large" />
          <Text style={styles.stateText}>Loading doctors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && doctors.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.errorTitle}>Failed to load doctors</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDoctors}>
            <RefreshCw color="white" size={18} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={filteredDoctors}
        keyExtractor={(item, index) => item.uid || `doctor-${index}`}
        renderItem={renderDoctor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <UserRound color="#94A3B8" size={36} />
            <Text style={styles.emptyTitle}>No doctors available</Text>
            <Text style={styles.stateText}>
              {query ? 'Try another search term.' : 'Check back later for available doctors.'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1552C1']} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingBottom: 100,
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
    fontWeight: '700',
    color: '#1552C1',
    letterSpacing: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
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
  searchContainer: {
    paddingHorizontal: 24,
    marginVertical: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  specialtiesList: {
    paddingLeft: 24,
    paddingRight: 12,
    paddingBottom: 30,
  },
  specialtyCard: {
    width: 104,
    marginRight: 14,
    alignItems: 'center',
  },
  specialtyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  specialtyName: {
    maxWidth: 104,
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  doctorCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doctorInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  initialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  doctorDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '800',
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
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  activeBadge: {
    backgroundColor: '#ECFDF5',
  },
  pendingBadge: {
    backgroundColor: '#FFFBEB',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  activeText: {
    color: '#059669',
  },
  pendingText: {
    color: '#D97706',
  },
  bookHint: {
    color: '#1552C1',
    fontWeight: '800',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '800',
  },
  stateText: {
    marginTop: 10,
    color: '#64748B',
    textAlign: 'center',
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
});
