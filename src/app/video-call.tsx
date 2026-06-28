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

export default function VideoCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const callerName = params.callerName as string || 'Người dùng';
  const callerAvatar = params.callerAvatar as string;
  const callType = params.callType as string || 'outgoing';
  
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(callType === 'outgoing');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
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
      {/* Remote Video (Full Screen) */}
      <View style={styles.remoteVideo}>
        {isCallActive ? (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoPlaceholderText}>Video của {callerName}</Text>
          </View>
        ) : (
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
            
            {callType === 'incoming' ? (
              <Text style={styles.callStatus}>Cuộc gọi video đến...</Text>
            ) : (
              <Text style={styles.callStatus}>Đang gọi...</Text>
            )}
          </View>
        )}
      </View>

      {/* Local Video (Small Preview) */}
      {isCallActive && !isVideoOff && (
        <View style={styles.localVideo}>
          <View style={styles.localVideoPlaceholder}>
            <Text style={styles.localVideoText}>Bạn</Text>
          </View>
        </View>
      )}

      {/* Call Duration */}
      {isCallActive && (
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
        </View>
      )}

      {/* Call Controls */}
      {isCallActive && (
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons 
              name={isMuted ? "mic-off" : "mic"} 
              size={28} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            <Ionicons 
              name={isVideoOff ? "videocam-off" : "videocam"} 
              size={28} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setIsFrontCamera(!isFrontCamera)}
          >
            <Ionicons 
              name="camera-reverse" 
              size={28} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlButton, styles.endCallButton]}
            onPress={handleEndCall}
          >
            <Ionicons name="call" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons (for incoming call) */}
      {callType === 'incoming' && !isCallActive && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAcceptCall}
          >
            <Ionicons name="videocam" size={32} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.declineButton]}
            onPress={handleDeclineCall}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
  },
  videoPlaceholderText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  callerInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  localVideoPlaceholder: {
    flex: 1,
    backgroundColor: '#3a3a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoText: {
    fontSize: 14,
    color: '#fff',
  },
  durationContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  endCallButton: {
    backgroundColor: '#EF4444',
  },
  actions: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
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
});
