import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, Lock, Eye, EyeOff, Smartphone, Trash2 } from 'lucide-react-native';

export default function PrivacySecurityScreen({ navigation }) {
  const [faceId, setFaceId] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Shield color="white" size={32} />
          </View>
          <Text style={styles.bannerTitle}>Your Data is Secure</Text>
          <Text style={styles.bannerDesc}>We use end-to-end encryption to protect your medical records and personal information.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Security Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Lock color="#1552C1" size={20} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Face ID / Biometrics</Text>
                <Text style={styles.settingSub}>Use biometrics to unlock app</Text>
              </View>
            </View>
            <Switch 
              value={faceId} 
              onValueChange={setFaceId} 
              trackColor={{ false: '#E2E8F0', true: '#1552C1' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                <Smartphone color="#10B981" size={20} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Two-Factor Auth</Text>
                <Text style={styles.settingSub}>Add extra layer of security</Text>
              </View>
            </View>
            <Switch 
              value={twoFactor} 
              onValueChange={setTwoFactor} 
              trackColor={{ false: '#E2E8F0', true: '#1552C1' }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Privacy Control</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
                <Eye color="#F59E0B" size={20} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Data Sharing</Text>
                <Text style={styles.settingSub}>Share data for research</Text>
              </View>
            </View>
            <Switch 
              value={dataSharing} 
              onValueChange={setDataSharing} 
              trackColor={{ false: '#E2E8F0', true: '#1552C1' }}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F8FAFC' }]}>
                <EyeOff color="#64748B" size={20} />
              </View>
              <Text style={styles.settingLabel}>Manage Permissions</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: '#EF4444' }]}>Danger Zone</Text>
          <TouchableOpacity style={[styles.settingItem, { borderColor: '#FEE2E2', borderWidth: 1 }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                <Trash2 color="#EF4444" size={20} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Delete Account</Text>
                <Text style={styles.settingSub}>Permanently erase all data</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  scrollContent: { padding: 24 },
  banner: { backgroundColor: '#1552C1', borderRadius: 28, padding: 24, alignItems: 'center', marginBottom: 32 },
  bannerIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  bannerTitle: { color: 'white', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  bannerDesc: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 13, lineHeight: 20 },
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 12 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  settingSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
