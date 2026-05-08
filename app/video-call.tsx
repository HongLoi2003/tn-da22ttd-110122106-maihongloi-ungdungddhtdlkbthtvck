import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Helper function to get doctor image
const getDoctorImage = (imageName: string) => {
  const images: { [key: string]: any } = {
    'nguyenvanam.png': require('@/assets/images/nguyenvanam.png'),
    'tranthilan.png': require('@/assets/images/tranthilan.png'),
    'leminhtam.png': require('@/assets/images/leminhtam.png'),
    'phamthuha.png': require('@/assets/images/phamthuha.png'),
  };
  return images[imageName] || require('@/assets/images/logo.png');
};

export default function VideoCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const doctorName = params.doctorName as string || 'BS. Nguyễn Văn An';
  const doctorImage = params.doctorImage as string || 'logo.png';
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    // Simulate connecting
    const connectTimer = setTimeout(() => {
      setIsConnecting(false);
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (!isConnecting) {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isConnecting]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Doctor Video (Main) */}
      <View style={styles.mainVideo}>
        <Image
          source={getDoctorImage(doctorImage)}
          style={styles.doctorVideoPlaceholder}
        />
        {isConnecting && (
          <View style={styles.connectingOverlay}>
            <View style={styles.connectingIndicator}>
              <View style={styles.pulseRing} />
              <View style={styles.pulseRing2} />
              <Ionicons name="videocam" size={32} color="#fff" />
            </View>
            <Text style={styles.connectingText}>Đang kết nối...</Text>
          </View>
        )}
      </View>

      {/* User Video (Small) */}
      <View style={styles.userVideo}>
        {isVideoOff ? (
          <View style={styles.videoOffContainer}>
            <Ionicons name="videocam-off" size={24} color="#fff" />
          </View>
        ) : (
          <View style={styles.userVideoPlaceholder}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
        )}
      </View>

      {/* Top Info Bar */}
      <View style={styles.topBar}>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{doctorName}</Text>
          {!isConnecting && (
            <View style={styles.durationContainer}>
              <View style={styles.recordingDot} />
              <Text style={styles.duration}>{formatDuration(callDuration)}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.minimizeBtn}>
          <Ionicons name="remove-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.controlsRow}>
          <TouchableOpacity 
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons 
              name={isMuted ? 'mic-off' : 'mic'} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.controlLabel}>
              {isMuted ? 'Bật mic' : 'Tắt mic'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            <Ionicons 
              name={isVideoOff ? 'videocam-off' : 'videocam'} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.controlLabel}>
              {isVideoOff ? 'Bật camera' : 'Tắt camera'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlBtn, !isSpeakerOn && styles.controlBtnActive]}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          >
            <Ionicons 
              name={isSpeakerOn ? 'volume-high' : 'volume-mute'} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.controlLabel}>
              {isSpeakerOn ? 'Loa' : 'Tai nghe'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn}>
            <Ionicons name="chatbubble" size={24} color="#fff" />
            <Text style={styles.controlLabel}>Chat</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.endCallBtn}
          onPress={handleEndCall}
        >
          <Ionicons name="call" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Ionicons name="camera-reverse" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Ionicons name="share-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mainVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorVideoPlaceholder: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  connectingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingIndicator: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#00BCD4',
    opacity: 0.6,
  },
  pulseRing2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#00BCD4',
    opacity: 0.3,
  },
  connectingText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 24,
  },
  userVideo: {
    position: 'absolute',
    top: 80,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#00BCD4',
  },
  userVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00BCD4',
  },
  videoOffContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  duration: {
    fontSize: 14,
    color: '#fff',
  },
  minimizeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  controlBtnActive: {
    backgroundColor: 'rgba(255,68,68,0.3)',
  },
  controlLabel: {
    fontSize: 11,
    color: '#fff',
  },
  endCallBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    transform: [{ rotate: '135deg' }],
  },
  quickActions: {
    position: 'absolute',
    right: 16,
    top: 260,
    gap: 12,
  },
  quickActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
