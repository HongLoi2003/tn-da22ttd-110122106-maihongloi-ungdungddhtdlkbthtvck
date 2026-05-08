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
    'hoangvanduc.png': require('@/assets/images/hoangvanduc.png'),
    'vuthilan.png': require('@/assets/images/vuthilan.png'),
    'lehoangnam.png': require('@/assets/images/lehoangnam.png'),
    'tranthimai.png': require('@/assets/images/tranthimai.png'),
    'dominhtuan.png': require('@/assets/images/dominhtuan.png'),
    'ngothihuong.png': require('@/assets/images/ngothihuong.png'),
  };
  return images[imageName] || require('@/assets/images/logo.png');
};

export default function VoiceCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const doctorName = params.doctorName as string || 'BS. Nguyễn Văn An';
  const doctorImage = params.doctorImage as string || 'logo.png';
  
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  useEffect(() => {
    // Simulate connecting -> ringing -> connected
    const connectTimer = setTimeout(() => {
      setCallStatus('ringing');
    }, 1500);

    const ringTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 4000);

    return () => {
      clearTimeout(connectTimer);
      clearTimeout(ringTimer);
    };
  }, []);

  useEffect(() => {
    if (callStatus === 'connected') {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    router.back();
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return 'Đang kết nối...';
      case 'ringing':
        return 'Đang gọi...';
      case 'connected':
        return formatDuration(callDuration);
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />

      {/* Doctor Info */}
      <View style={styles.doctorSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={getDoctorImage(doctorImage)}
            style={styles.doctorAvatar}
          />
          {callStatus === 'ringing' && (
            <>
              <View style={[styles.pulseRing, styles.pulseRing1]} />
              <View style={[styles.pulseRing, styles.pulseRing2]} />
              <View style={[styles.pulseRing, styles.pulseRing3]} />
            </>
          )}
        </View>
        
        <Text style={styles.doctorName}>{doctorName}</Text>
        <Text style={styles.callStatus}>{getStatusText()}</Text>

        {callStatus === 'connected' && (
          <View style={styles.qualityIndicator}>
            <View style={styles.signalBar} />
            <View style={[styles.signalBar, styles.signalBar2]} />
            <View style={[styles.signalBar, styles.signalBar3]} />
            <View style={[styles.signalBar, styles.signalBar4]} />
            <Text style={styles.qualityText}>Chất lượng tốt</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <TouchableOpacity 
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <View style={styles.controlIconContainer}>
              <Ionicons 
                name={isMuted ? 'mic-off' : 'mic'} 
                size={28} 
                color={isMuted ? '#fff' : '#0f172a'} 
              />
            </View>
            <Text style={styles.controlLabel}>
              {isMuted ? 'Bật mic' : 'Tắt mic'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlBtn, isSpeakerOn && styles.controlBtnActive]}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          >
            <View style={styles.controlIconContainer}>
              <Ionicons 
                name={isSpeakerOn ? 'volume-high' : 'volume-medium'} 
                size={28} 
                color={isSpeakerOn ? '#fff' : '#0f172a'} 
              />
            </View>
            <Text style={styles.controlLabel}>
              {isSpeakerOn ? 'Loa ngoài' : 'Tai nghe'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn}>
            <View style={styles.controlIconContainer}>
              <Ionicons name="keypad" size={28} color="#0f172a" />
            </View>
            <Text style={styles.controlLabel}>Bàn phím</Text>
          </TouchableOpacity>
        </View>

        {/* End Call Button */}
        <TouchableOpacity 
          style={styles.endCallBtn}
          onPress={handleEndCall}
        >
          <View style={styles.endCallIcon}>
            <Ionicons name="call" size={32} color="#fff" />
          </View>
          <Text style={styles.endCallText}>Kết thúc</Text>
        </TouchableOpacity>

        {/* Additional Actions */}
        <View style={styles.additionalActions}>
          <TouchableOpacity 
            style={styles.additionalBtn}
            onPress={() => {
              router.replace({
                pathname: '/video-call',
                params: {
                  doctorName: doctorName,
                  doctorImage: doctorImage,
                }
              });
            }}
          >
            <Ionicons name="videocam-outline" size={20} color="#64748b" />
            <Text style={styles.additionalBtnText}>Bật video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.additionalBtn}>
            <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
            <Text style={styles.additionalBtnText}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: '#1e293b',
    opacity: 0.5,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: '#000',
    opacity: 0.3,
  },
  doctorSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  doctorAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#00BCD4',
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#00BCD4',
    opacity: 0.6,
  },
  pulseRing1: {
    width: 160,
    height: 160,
    top: -10,
    left: -10,
  },
  pulseRing2: {
    width: 180,
    height: 180,
    top: -20,
    left: -20,
    opacity: 0.4,
  },
  pulseRing3: {
    width: 200,
    height: 200,
    top: -30,
    left: -30,
    opacity: 0.2,
  },
  doctorName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 18,
    color: '#94a3b8',
  },
  qualityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  signalBar: {
    width: 4,
    height: 12,
    backgroundColor: '#00BCD4',
    borderRadius: 2,
  },
  signalBar2: {
    height: 16,
  },
  signalBar3: {
    height: 20,
  },
  signalBar4: {
    height: 24,
  },
  qualityText: {
    fontSize: 13,
    color: '#00BCD4',
    marginLeft: 8,
  },
  controlsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 12,
  },
  controlBtnActive: {
    opacity: 1,
  },
  controlIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  endCallBtn: {
    alignItems: 'center',
    marginBottom: 32,
  },
  endCallIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
    marginBottom: 12,
  },
  endCallText: {
    fontSize: 14,
    color: '#FF4444',
    fontWeight: '600',
  },
  additionalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  additionalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  additionalBtnText: {
    fontSize: 13,
    color: '#64748b',
  },
});
