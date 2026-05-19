import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Moon, Sun, Bell, Globe, Shield } from 'lucide-react-native';

export default function SettingsScreen({ navigation }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Appearance</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                {isDarkMode ? <Moon color="#1E293B" size={20} /> : <Sun color="#F59E0B" size={20} />}
              </View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch 
              value={isDarkMode} 
              onValueChange={setIsDarkMode} 
              trackColor={{ false: '#E2E8F0', true: '#1552C1' }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>General</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Bell color="#1552C1" size={20} />
              </View>
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch 
              value={pushEnabled} 
              onValueChange={setPushEnabled} 
              trackColor={{ false: '#E2E8F0', true: '#1552C1' }}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                <Globe color="#10B981" size={20} />
              </View>
              <Text style={styles.settingLabel}>Language</Text>
            </View>
            <Text style={styles.settingValue}>English</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('PrivacySecurity')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                <Shield color="#EF4444" size={20} />
              </View>
              <Text style={styles.settingLabel}>Privacy & Security</Text>
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
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 12 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  settingValue: { fontSize: 14, color: '#64748B' },
});
