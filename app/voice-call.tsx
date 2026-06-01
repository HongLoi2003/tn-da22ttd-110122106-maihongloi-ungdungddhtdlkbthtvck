import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function VoiceCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const callerName = params.callerName as string || 'Người dùng';
  const callerAvatar = params.callerAvatar as string;
  const callType = params.callType as string || 'outgoing'; // incoming or outgoing
  
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(callType === 'outgoing');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    router.back();
  };

  const handleAcceptCall = () => {
    setIsCallActive(true);
  };

  const handleDeclineCall = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Caller Info */}
      <View style={styles.callerInfo}>
        <View style={styles.avatarContainer}>
          {callerAvatar ? (
            <Image source={{ uri: callerAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={64} color="#fff" />
            </View>
          )}
        </View>
        
        <Text style={styles.callerName}>{callerName}</Text>
        
        {isCallActive ? (
          <Text style={styles.callStatus}>{formatDuration(callDuration)}</Text>
        ) : callType === 'incoming' ? (
          <Text style={styles.callStatus}>Cuộc gọi đến...</Text>
        ) : (
          <Text style={styles.callStatus}>Đang gọi...</Text>
        )}
      </View>

      {/* Call Controls */}
      <View style={styles.controls}>
        {isCallActive && (
          <>
            <TouchableOpacity 
              style={[styles.controlButton, isMuted && styles.controlButtonActive]}
              onPress={() => setIsMuted(!isMuted)}
            >
              <Ionicons 
                name={isMuted ? "mic-off" : "mic"} 
                size={28} 
                color="#fff" 
              />
              <Text style={styles.controlLabel}>
                {isMuted ? 'Bật mic' : 'Tắt mic'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
              onPress={() => setIsSpeaker(!isSpeaker)}
            >
              <Ionicons 
                name={isSpeaker ? "volume-high" : "volume-medium"} 
                size={28} 
                color="#fff" 
              />
              <Text style={styles.controlLabel}>
                {isSpeaker ? 'Loa ngoài' : 'Loa trong'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {callType === 'incoming' && !isCallActive ? (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAcceptCall}
            >
              <Ionicons name="call" size={32} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.declineButton]}
              onPress={handleDeclineCall}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, styles.endCallButton]}
            onPress={handleEndCall}
          >
            <Ionicons name="call" size={32} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: 60,
  },
  avatarContainer: {
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarPlaceholder: {
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  callStatus: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingHorizontal: 40,
  },
  controlButton: {
    alignItems: 'center',
    gap: 8,
  },
  controlButtonActive: {
    opacity: 0.6,
  },
  controlLabel: {
    fontSize: 12,
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#06D6A0',
  },
  declineButton: {
    backgroundColor: '#EF4444',
  },
  endCallButton: {
    backgroundColor: '#EF4444',
  },
});
