import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle, ChevronRight } from 'lucide-react-native';

const paymentMethods = [
  { id: 'card', name: 'Credit / Debit Card', icon: '💳', colors: ['#1552C1', '#0A2E6E'] },
  { id: 'paypal', name: 'PayPal', icon: '🅿️', colors: ['#003087', '#0070E0'] },
  { id: 'apple', name: 'Apple Pay', icon: '🍏', colors: ['#000000', '#333333'] },
];

export default function PaymentScreen({ navigation, route }) {
  const { doctor, appointment } = route.params || {};
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = () => {
    // Simulate payment processing
    setTimeout(() => {
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successContent}>
          <View style={styles.successIconBg}>
            <CheckCircle color="#10B981" size={80} />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successDesc}>
            Your appointment with {doctor?.name || 'the doctor'} has been confirmed and paid.
          </Text>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.doneButtonText}>Go to My Bookings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={styles.summaryAmount}>$150.00</Text>
          <View style={styles.divider} />
          <View style={styles.apptInfo}>
            <Image source={{ uri: doctor?.image || 'https://via.placeholder.com/150' }} style={styles.doctorThumb} />
            <View>
              <Text style={styles.doctorName}>{doctor?.name || 'Dr. James Wilson'}</Text>
              <Text style={styles.apptDetails}>Mon, Oct 24 • 10:30 AM</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.methodList}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodItem,
                selectedMethod === method.id && styles.selectedMethodItem
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodLeft}>
                <View style={styles.methodIconBg}>
                  <Text style={{ fontSize: 20 }}>{method.icon}</Text>
                </View>
                <Text style={styles.methodName}>{method.name}</Text>
              </View>
              <View style={[
                styles.radio,
                selectedMethod === method.id && styles.radioSelected
              ]}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {selectedMethod === 'card' && (
          <View style={styles.cardForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Holder Name</Text>
              <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor="#94A3B8" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput style={styles.input} placeholder="**** **** **** 4421" placeholderTextColor="#94A3B8" keyboardType="numeric" />
            </View>
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput style={styles.input} placeholder="MM/YY" placeholderTextColor="#94A3B8" />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput style={styles.input} placeholder="***" placeholderTextColor="#94A3B8" keyboardType="numeric" />
              </View>
            </View>
          </View>
        )}

        <View style={styles.securityInfo}>
          <ShieldCheck color="#64748B" size={16} />
          <Text style={styles.securityText}>Your payment is secured with 256-bit SSL encryption</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>Confirm & Pay $150.00</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#1552C1',
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#1552C1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  apptInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  doctorName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  apptDetails: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  methodList: {
    gap: 12,
    marginBottom: 24,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMethodItem: {
    borderColor: '#1552C1',
    backgroundColor: '#F0F7FF',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#1552C1',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1552C1',
  },
  cardForm: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#000',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  securityText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  payButton: {
    backgroundColor: '#1552C1',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#1552C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  successContent: {
    alignItems: 'center',
    padding: 40,
  },
  successIconBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  successDesc: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  doneButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});
