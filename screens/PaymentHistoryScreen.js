import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, ChevronRight } from 'lucide-react-native';

const transactions = [
  { id: '1', name: 'Dr. James Wilson', date: 'Oct 20, 2024', amount: '$150.00', status: 'Paid' },
  { id: '2', name: 'Premium Plan Monthly', date: 'Oct 01, 2024', amount: '$29.99', status: 'Paid' },
  { id: '3', name: 'Dr. Sarah Connor', date: 'Sep 15, 2024', amount: '$120.00', status: 'Refunded' },
];

export default function PaymentHistoryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {transactions.map(t => (
          <TouchableOpacity key={t.id} style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <CreditCard color="#10B981" size={20} />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionName}>{t.name}</Text>
              <Text style={styles.transactionDate}>{t.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.transactionAmount}>{t.amount}</Text>
              <Text style={[styles.transactionStatus, { color: t.status === 'Paid' ? '#10B981' : '#EF4444' }]}>{t.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  scrollContent: { padding: 20 },
  subscriptionCard: { backgroundColor: '#1552C1', padding: 24, borderRadius: 28, marginBottom: 32 },
  subTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 8 },
  planName: { color: 'white', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subStatus: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 20 },
  manageButton: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 12, alignItems: 'center' },
  manageButtonText: { color: 'white', fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 12 },
  transactionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  transactionInfo: { flex: 1 },
  transactionName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  transactionDate: { fontSize: 12, color: '#64748B' },
  transactionAmount: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  transactionStatus: { fontSize: 11, fontWeight: '700', marginTop: 2 },
});
