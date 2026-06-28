import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export interface CustomAlertDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info' | 'success';
}

const CustomAlertDialog: React.FC<CustomAlertDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'alert-circle' as const,
          iconColor: '#ef4444',
          iconBg: '#fee2e2',
          confirmBg: '#ef4444',
          confirmTextColor: '#fff'
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          iconColor: '#f59e0b',
          iconBg: '#fef3c7',
          confirmBg: '#f59e0b',
          confirmTextColor: '#fff'
        };
      case 'info':
        return {
          icon: 'information-circle' as const,
          iconColor: '#3b82f6',
          iconBg: '#dbeafe',
          confirmBg: '#3b82f6',
          confirmTextColor: '#fff'
        };
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          iconColor: '#10b981',
          iconBg: '#d1fae5',
          confirmBg: '#10b981',
          confirmTextColor: '#fff'
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.dialogContainer,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: typeConfig.iconBg }]}>
            <Ionicons name={typeConfig.icon} size={48} color={typeConfig.iconColor} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.confirmButton,
                { backgroundColor: typeConfig.confirmBg }
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={[styles.confirmButtonText, { color: typeConfig.confirmTextColor }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomAlertDialog;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: Math.min(width - 40, 400),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmButton: {
    backgroundColor: '#ef4444',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
