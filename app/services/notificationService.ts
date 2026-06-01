import { Platform } from 'react-native';

// Mock Notifications nếu chưa cài expo-notifications
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  // Cấu hình notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (error) {
  console.log('expo-notifications not installed. Using mock implementation.');
}

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

// Listener callback type
type NotificationListener = (notification: any) => void;

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  // Đăng ký nhận push notification
  async registerForPushNotifications(): Promise<string | null> {
    if (!Notifications) {
      console.log('Notifications not available. Please install expo-notifications.');
      return null;
    }

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00BCD4',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      console.log('Push token:', token);
      
      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  // Gửi local notification
  async sendLocalNotification(notification: NotificationData): Promise<string> {
    if (!Notifications) {
      console.log('Mock notification:', notification.title, notification.body);
      return 'mock-notification-id';
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
        },
        trigger: null, // Gửi ngay lập tức
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending local notification:', error);
      throw error;
    }
  }

  // Lên lịch notification
  async scheduleNotification(
    notification: NotificationData,
    trigger: Date | number
  ): Promise<string> {
    if (!Notifications) {
      console.log('Mock scheduled notification:', notification.title, 'at', trigger);
      return 'mock-scheduled-id';
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
        },
        trigger:
          typeof trigger === 'number'
            ? { seconds: trigger }
            : { date: trigger },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Hủy notification đã lên lịch
  async cancelNotification(notificationId: string): Promise<void> {
    if (!Notifications) {
      console.log('Mock cancel notification:', notificationId);
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
      throw error;
    }
  }

  // Hủy tất cả notifications đã lên lịch
  async cancelAllNotifications(): Promise<void> {
    if (!Notifications) {
      console.log('Mock cancel all notifications');
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      throw error;
    }
  }

  // Lấy tất cả notifications đã lên lịch
  async getAllScheduledNotifications(): Promise<any[]> {
    if (!Notifications) {
      console.log('Mock get all scheduled notifications');
      return [];
    }

    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Nhắc lịch khám trước 1 ngày
  async scheduleAppointmentReminder(
    appointmentDate: Date,
    doctorName: string,
    appointmentTime: string
  ): Promise<string> {
    const reminderDate = new Date(appointmentDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(9, 0, 0, 0); // 9:00 AM ngày hôm trước

    return await this.scheduleNotification(
      {
        title: '🏥 Nhắc lịch khám',
        body: `Bạn có lịch khám với ${doctorName} vào ${appointmentTime} ngày mai. Vui lòng chuẩn bị!`,
        data: {
          type: 'appointment_reminder',
          appointmentDate: appointmentDate.toISOString(),
        },
      },
      reminderDate
    );
  }

  // Nhắc lịch khám trước 1 giờ
  async scheduleAppointmentReminderOneHour(
    appointmentDate: Date,
    doctorName: string
  ): Promise<string> {
    const reminderDate = new Date(appointmentDate);
    reminderDate.setHours(reminderDate.getHours() - 1);

    return await this.scheduleNotification(
      {
        title: '⏰ Sắp đến giờ khám',
        body: `Còn 1 giờ nữa bạn sẽ có lịch khám với ${doctorName}. Hãy chuẩn bị khởi hành!`,
        data: {
          type: 'appointment_reminder_1h',
          appointmentDate: appointmentDate.toISOString(),
        },
      },
      reminderDate
    );
  }

  // Thông báo lịch khám mới
  async notifyNewAppointment(doctorName: string, appointmentTime: string): Promise<string> {
    return await this.sendLocalNotification({
      title: '✅ Đặt lịch thành công',
      body: `Lịch khám với ${doctorName} vào ${appointmentTime} đã được xác nhận.`,
      data: {
        type: 'appointment_confirmed',
      },
    });
  }

  // Thông báo hủy lịch khám
  async notifyCancelledAppointment(doctorName: string): Promise<string> {
    return await this.sendLocalNotification({
      title: '❌ Lịch khám đã hủy',
      body: `Lịch khám với ${doctorName} đã được hủy.`,
      data: {
        type: 'appointment_cancelled',
      },
    });
  }

  // Thông báo thay đổi lịch khám
  async notifyAppointmentChanged(doctorName: string, newTime: string): Promise<string> {
    return await this.sendLocalNotification({
      title: '🔄 Thay đổi lịch khám',
      body: `Lịch khám với ${doctorName} đã được thay đổi sang ${newTime}.`,
      data: {
        type: 'appointment_changed',
      },
    });
  }

  // Thông báo tin nhắn mới từ bác sĩ
  async notifyNewMessage(doctorName: string, message: string): Promise<string> {
    return await this.sendLocalNotification({
      title: `💬 Tin nhắn từ ${doctorName}`,
      body: message,
      data: {
        type: 'new_message',
        doctorName,
      },
    });
  }

  // Thông báo kết quả xét nghiệm
  async notifyTestResults(): Promise<string> {
    return await this.sendLocalNotification({
      title: '📋 Kết quả xét nghiệm',
      body: 'Kết quả xét nghiệm của bạn đã có. Vui lòng kiểm tra!',
      data: {
        type: 'test_results',
      },
    });
  }

  // Thông báo đơn thuốc mới
  async notifyNewPrescription(doctorName: string): Promise<string> {
    return await this.sendLocalNotification({
      title: '💊 Đơn thuốc mới',
      body: `${doctorName} đã kê đơn thuốc cho bạn. Vui lòng kiểm tra!`,
      data: {
        type: 'new_prescription',
      },
    });
  }

  // Nhắc uống thuốc
  async scheduleMedicationReminder(
    medicationName: string,
    time: Date
  ): Promise<string> {
    return await this.scheduleNotification(
      {
        title: '💊 Nhắc uống thuốc',
        body: `Đã đến giờ uống ${medicationName}`,
        data: {
          type: 'medication_reminder',
          medicationName,
        },
      },
      time
    );
  }

  // Lấy push token
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  // Đăng ký listener khi nhận notification (app đang mở)
  addNotificationReceivedListener(callback: NotificationListener): void {
    if (!Notifications) {
      console.log('Mock notification received listener registered');
      return;
    }

    this.notificationListener = Notifications.addNotificationReceivedListener(callback);
  }

  // Đăng ký listener khi người dùng bấm vào notification
  addNotificationResponseReceivedListener(callback: NotificationListener): void {
    if (!Notifications) {
      console.log('Mock notification response listener registered');
      return;
    }

    this.responseListener = Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Xóa listeners
  removeNotificationListeners(): void {
    if (!Notifications) {
      console.log('Mock remove notification listeners');
      return;
    }

    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }

  // Lấy notification cuối cùng mà người dùng đã bấm (khi mở app từ notification)
  async getLastNotificationResponse(): Promise<any> {
    if (!Notifications) {
      console.log('Mock get last notification response');
      return null;
    }

    try {
      return await Notifications.getLastNotificationResponseAsync();
    } catch (error) {
      console.error('Error getting last notification response:', error);
      return null;
    }
  }

  // Xóa badge (số thông báo chưa đọc trên icon app)
  async setBadgeCount(count: number): Promise<void> {
    if (!Notifications) {
      console.log('Mock set badge count:', count);
      return;
    }

    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  // Lấy badge count
  async getBadgeCount(): Promise<number> {
    if (!Notifications) {
      console.log('Mock get badge count');
      return 0;
    }

    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }
}

const notificationServiceInstance = new NotificationService();

export default notificationServiceInstance;

// Helper function để dễ sử dụng trong booking
export const scheduleAppointmentReminder = async (params: {
  doctorName: string;
  appointmentDate: Date;
  hospital: string;
}) => {
  const { doctorName, appointmentDate, hospital } = params;
  
  // Format time
  const timeStr = appointmentDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Lên lịch nhắc 1 ngày trước
  await notificationServiceInstance.scheduleAppointmentReminder(
    appointmentDate,
    doctorName,
    timeStr
  );

  // Lên lịch nhắc 1 giờ trước
  await notificationServiceInstance.scheduleAppointmentReminderOneHour(
    appointmentDate,
    doctorName
  );

  console.log(`✅ Đã lên lịch thông báo nhắc khám với ${doctorName}`);
};
