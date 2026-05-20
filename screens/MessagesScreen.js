import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MoreVertical, CheckCheck } from 'lucide-react-native';

const chats = [
  {
    id: 1,
    name: 'Dr. James Wilson',
    message: "I'd recommend starting with a diet rich in leafy greens and lean proteins...",
    time: '09:47 AM',
    unread: 1,
    online: true,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200',
  },
  {
    id: 2,
    name: 'Dr. Sarah Chen',
    message: "The test results look good. We can discuss more in our next session.",
    time: 'Yesterday',
    unread: 0,
    online: false,
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200',
  },
];

export default function MessagesScreen({ navigation }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity>
          <MoreVertical color="#1E293B" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <View style={styles.searchWrapper}>
          <Search color="#94A3B8" size={20} />
          <TextInput 
            placeholder="Search messages..."
            placeholderTextColor={'#94A3B8'}
            color={'black'}
            style={styles.searchInput} />
        </View>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {chats.map((chat) => (
          <TouchableOpacity 
            key={chat.id} 
            style={styles.chatItem}
            onPress={() => navigation.navigate('Chat', { doctor: { name: chat.name, image: chat.image } })}
          >
            <View style={styles.avatarContainer}>
              <Image source={{ uri: chat.image }} style={styles.avatar} />
              {chat.online && <View style={styles.onlineDot} />}
            </View>
            
            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>
              
              <View style={styles.chatFooter}>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {chat.message}
                </Text>
                {chat.unread > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unread}</Text>
                  </View>
                ) : (
                  <CheckCheck color="#94A3B8" size={16} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  searchBox: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    backgroundColor: '#22C55E',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'white',
  },
  chatContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  chatTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    marginRight: 12,
  },
  unreadBadge: {
    backgroundColor: '#1552C1',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
});
