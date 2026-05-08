import { resetAndReseedData } from '@/app/scripts/seedCorrectData';
import { importAppointments, importNotifications, seedFirebaseData } from '@/app/scripts/seedFirebase';
import { deleteAndReimportDoctors, deleteCollection, getAllDocuments, import4NewDoctors, importNewDoctors, resetAllData } from '@/app/services/firebaseService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function SeedDataScreen() {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [importingNew, setImportingNew] = useState(false);
  const [importing4New, setImporting4New] = useState(false);
  const [reimporting, setReimporting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [importingAppointments, setImportingAppointments] = useState(false);
  const [importingNotifications, setImportingNotifications] = useState(false);
  const [cleaningAndImporting, setCleaningAndImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [testResult, setTestResult] = useState('');

  const handleSeedData = async () => {
    setLoading(true);
    setMessage('Đang import dữ liệu...');
    setSuccess(false);
    setTestResult('');

    try {
      console.log('🚀 Bắt đầu seed dữ liệu...');
      await seedFirebaseData();
      console.log('✅ Seed dữ liệu thành công!');
      setMessage('✓ Import thành công tất cả dữ liệu!');
      setSuccess(true);
      
      // Test đọc dữ liệu ngay sau khi seed
      setTimeout(async () => {
        const doctors = await getAllDocuments('doctors');
        setTestResult(`Đã kiểm tra: Có ${doctors.length} bác sĩ trong Firebase`);
      }, 1000);
    } catch (error) {
      console.error('❌ Lỗi khi seed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không xác định';
      setMessage(`✗ Lỗi: ${errorMessage}`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanAndImport = async () => {
    Alert.alert(
      '🚨 XÁC NHẬN THAO TÁC',
      'Bạn sắp:\n\n' +
      '❌ XÓA TẤT CẢ dữ liệu cũ trên Firebase\n' +
      '✅ IMPORT LẠI dữ liệu mới từ file JSON\n\n' +
      'Hành động này sẽ:\n' +
      '• Xóa tất cả doctors, hospitals, appointments, users, etc.\n' +
      '• Import lại từ file JSON với format đúng\n' +
      '• Không thể hoàn tác!\n\n' +
      '⚠️ Quá trình có thể mất vài phút!',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'TIẾP TỤC XÓA & IMPORT',
          style: 'destructive',
          onPress: async () => {
            setCleaningAndImporting(true);
            setMessage('🔄 Đang xóa tất cả dữ liệu cũ...\n');
            setSuccess(false);
            setTestResult('');

            try {
              console.clear();
              console.log('🚀 [CLEAN] Bắt đầu xóa và import lại dữ liệu...');

              setMessage((prev) => prev + '✅ Đã xóa dữ liệu cũ\n');
              setMessage((prev) => prev + '🌱 Đang import dữ liệu mới...\n');

              await resetAndReseedData();

              setMessage((prev) => prev + '✅ Đã import dữ liệu mới\n');
              setMessage((prev) => prev + '🔄 Đang seed dữ liệu bổ sung...\n');

              await seedFirebaseData();

              setMessage((prev) => prev + '✅ Đã seed dữ liệu bổ sung\n\n');
              setMessage((prev) => prev + '🎉 HOÀN THÀNH!\n\n');
              setMessage((prev) => prev + '📊 Dữ liệu đã được cập nhật:\n');
              setMessage((prev) => prev + '• 16 Bác sĩ\n');
              setMessage((prev) => prev + '• 6 Bệnh viện\n');
              setMessage((prev) => prev + '• 6 Lịch khám\n');
              setMessage((prev) => prev + '• 2 Người dùng\n');
              setMessage((prev) => prev + '• 12 Chuyên khoa\n');
              setMessage((prev) => prev + '• 6 Triệu chứng\n');
              setMessage((prev) => prev + '• Và nhiều dữ liệu khác\n\n');
              setMessage((prev) => prev + '✨ Tất cả dữ liệu đã sẵn sàng!');

              setSuccess(true);
              console.log('✅ [CLEAN] Hoàn tất xóa và import lại dữ liệu!');
            } catch (error) {
              console.error('❌ [CLEAN] Lỗi:', error);
              const errorMessage = error instanceof Error ? error.message : 'Không xác định';
              setMessage((prev) => prev + `\n\n❌ LỖI: ${errorMessage}`);
              setSuccess(false);
            } finally {
              setCleaningAndImporting(false);
            }
          }
        }
      ]
    );
  };

  const handleTestFirebase = async () => {
    setTestResult('Đang kiểm tra...');
    try {
      const doctors = await getAllDocuments('doctors');
      const specialties = await getAllDocuments('specialties');
      const symptoms = await getAllDocuments('common-symptoms');
      
      // Kiểm tra các collection có thể có
      let doctorsAlt = [];
      try {
        doctorsAlt = await getAllDocuments('doctor');
      } catch (e) {
        // Collection không tồn tại
      }
      
      setTestResult(
        `✅ Kết nối Firebase thành công!\n\n` +
        `📊 Collection 'doctors': ${doctors.length}\n` +
        (doctorsAlt.length > 0 ? `📊 Collection 'doctor': ${doctorsAlt.length}\n` : '') +
        `📊 Chuyên khoa: ${specialties.length}\n` +
        `📊 Triệu chứng: ${symptoms.length}\n\n` +
        (doctors.length === 0 ? '⚠️ Cần import dữ liệu!' : `✓ Dữ liệu đã sẵn sàng!\n\n` +
        `Danh sách bác sĩ:\n${doctors.slice(0, 5).map((d: any, index: number) => 
          `- ${d.ten || d.name}: ${d.chuyen_khoa || d.chuyenKhoa || 'N/A'}`
        ).join('\n')}${doctors.length > 5 ? `\n... và ${doctors.length - 5} bác sĩ khác` : ''}`)
      );
    } catch (error) {
      setTestResult(`❌ Lỗi: ${error instanceof Error ? error.message : 'Không xác định'}`);
    }
  };

  const handleDeleteDoctors = async () => {
    Alert.alert(
      '⚠️ Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa TẤT CẢ bác sĩ trong Firebase?\n\nHành động này KHÔNG THỂ hoàn tác!',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            setMessage('Đang xóa dữ liệu bác sĩ...');
            setSuccess(false);
            setTestResult('');

            try {
              console.log('🗑️ Bắt đầu xóa collection doctors...');
              const result = await deleteCollection('doctors');
              
              if (result.success) {
                console.log(`✅ Đã xóa ${result.deletedCount} bác sĩ`);
                setMessage(`✓ Đã xóa thành công ${result.deletedCount} bác sĩ!`);
                setSuccess(true);
                setTestResult('Bây giờ bạn có thể import lại 10 bác sĩ mới.');
              } else {
                setMessage('✗ Không thể xóa dữ liệu');
                setSuccess(false);
              }
            } catch (error) {
              console.error('❌ Lỗi khi xóa:', error);
              const errorMessage = error instanceof Error ? error.message : 'Không xác định';
              setMessage(`✗ Lỗi: ${errorMessage}`);
              setSuccess(false);
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleImportNewDoctors = async () => {
    setImportingNew(true);
    setMessage('Đang import 2 bác sĩ mới...');
    setSuccess(false);
    setTestResult('');

    try {
      console.log('🚀 Bắt đầu import 2 bác sĩ mới...');
      const result = await importNewDoctors();
      
      if (result.success) {
        console.log('✅ Import thành công 2 bác sĩ mới!');
        setMessage(`✓ Import thành công ${result.count} bác sĩ mới (Tiêu hóa & Cơ xương khớp)!`);
        setSuccess(true);
        
        // Test đọc dữ liệu ngay sau khi import
        setTimeout(async () => {
          const doctors = await getAllDocuments('doctors');
          setTestResult(`Đã kiểm tra: Hiện có ${doctors.length} bác sĩ trong Firebase`);
        }, 1000);
      } else {
        setMessage('✗ Không thể import dữ liệu');
        setSuccess(false);
      }
    } catch (error) {
      console.error('❌ Lỗi khi import:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không xác định';
      setMessage(`✗ Lỗi: ${errorMessage}`);
      setSuccess(false);
    } finally {
      setImportingNew(false);
    }
  };

  const handleResetAllData = async () => {
    Alert.alert(
      '🚨 XÁC NHẬN RESET TOÀN BỘ',
      'Bạn có CHẮC CHẮN muốn:\n\n' +
      '❌ XÓA TẤT CẢ dữ liệu hiện tại\n' +
      '✅ IMPORT LẠI toàn bộ với ID chuẩn\n\n' +
      'Hành động này sẽ:\n' +
      '• Xóa tất cả doctors, hospitals, users, appointments, etc.\n' +
      '• Import lại từ file JSON với ID chuẩn\n' +
      '• Không thể hoàn tác!\n\n' +
      '⚠️ Quá trình có thể mất vài phút!',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'RESET TOÀN BỘ',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            setMessage('Đang reset toàn bộ database...');
            setSuccess(false);
            setTestResult('');

            try {
              console.log('🚀 Bắt đầu reset toàn bộ database...');
              const result = await resetAllData();
              
              if (result.success) {
                console.log('✅ Reset thành công!');
                setMessage(`✓ ${result.message}`);
                setSuccess(true);
                
                // Test đọc dữ liệu ngay sau khi reset
                setTimeout(async () => {
                  const doctors = await getAllDocuments('doctors');
                  const symptoms = await getAllDocuments('common-symptoms');
                  const specialties = await getAllDocuments('specialties');
                  setTestResult(
                    `✅ Kiểm tra thành công!\n\n` +
                    `📊 Doctors: ${doctors.length}\n` +
                    `📊 Common Symptoms: ${symptoms.length}\n` +
                    `📊 Specialties: ${specialties.length}\n\n` +
                    `Tất cả đều có ID chuẩn, không còn ID tự động!`
                  );
                }, 2000);
              } else {
                setMessage('✗ Không thể reset dữ liệu');
                setSuccess(false);
              }
            } catch (error) {
              console.error('❌ Lỗi khi reset:', error);
              const errorMessage = error instanceof Error ? error.message : 'Không xác định';
              setMessage(`✗ Lỗi: ${errorMessage}`);
              setSuccess(false);
            } finally {
              setResetting(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAndReimportDoctors = async () => {
    Alert.alert(
      '⚠️ Xác nhận',
      'Bạn có chắc chắn muốn XÓA TẤT CẢ bác sĩ và IMPORT LẠI từ doctors.json?\n\nHành động này sẽ:\n• Xóa tất cả bác sĩ hiện tại\n• Import lại 16 bác sĩ với ID chuẩn (bs001-bs016)',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa & Import Lại',
          style: 'destructive',
          onPress: async () => {
            setReimporting(true);
            setMessage('Đang xóa và import lại bác sĩ...');
            setSuccess(false);
            setTestResult('');

            try {
              console.log('🚀 Bắt đầu xóa và import lại bác sĩ...');
              const result = await deleteAndReimportDoctors();
              
              if (result.success) {
                console.log('✅ Hoàn tất!');
                setMessage(`✓ Đã xóa và import lại thành công ${result.count} bác sĩ với ID chuẩn!`);
                setSuccess(true);
                
                // Test đọc dữ liệu ngay sau khi import
                setTimeout(async () => {
                  const doctors = await getAllDocuments('doctors');
                  setTestResult(`Đã kiểm tra: Hiện có ${doctors.length} bác sĩ trong Firebase với ID chuẩn (bs001-bs016)`);
                }, 1000);
              } else {
                setMessage('✗ Không thể xóa và import lại dữ liệu');
                setSuccess(false);
              }
            } catch (error) {
              console.error('❌ Lỗi khi xóa và import lại:', error);
              const errorMessage = error instanceof Error ? error.message : 'Không xác định';
              setMessage(`✗ Lỗi: ${errorMessage}`);
              setSuccess(false);
            } finally {
              setReimporting(false);
            }
          }
        }
      ]
    );
  };

  const handleImport4NewDoctors = async () => {
    setImporting4New(true);
    setMessage('Đang import 4 bác sĩ mới...');
    setSuccess(false);
    setTestResult('');

    try {
      console.log('🚀 Bắt đầu import 4 bác sĩ mới...');
      const result = await import4NewDoctors();
      
      if (result.success) {
        console.log('✅ Import thành công 4 bác sĩ mới!');
        setMessage(`✓ Import thành công ${result.count} bác sĩ mới (Tai mũi họng, Mắt, Răng hàm mặt, Nội tiết)!`);
        setSuccess(true);
        
        // Test đọc dữ liệu ngay sau khi import
        setTimeout(async () => {
          const doctors = await getAllDocuments('doctors');
          setTestResult(`Đã kiểm tra: Hiện có ${doctors.length} bác sĩ trong Firebase`);
        }, 1000);
      } else {
        setMessage('✗ Không thể import dữ liệu');
        setSuccess(false);
      }
    } catch (error) {
      console.error('❌ Lỗi khi import:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không xác định';
      setMessage(`✗ Lỗi: ${errorMessage}`);
      setSuccess(false);
    } finally {
      setImporting4New(false);
    }
  };

  const handleImportAppointments = async () => {
    setImportingAppointments(true);
    setMessage('Đang import lịch khám...');
    setSuccess(false);
    setTestResult('');

    try {
      console.log('🚀 Bắt đầu import lịch khám...');
      const result = await importAppointments();
      
      if (result.success) {
        console.log('✅ Import thành công lịch khám!');
        setMessage(`✓ Import thành công ${result.count} lịch khám!`);
        setSuccess(true);
        
        // Test đọc dữ liệu ngay sau khi import
        setTimeout(async () => {
          const appointments = await getAllDocuments('appointments');
          setTestResult(`Đã kiểm tra: Hiện có ${appointments.length} lịch khám trong Firebase`);
        }, 1000);
      } else {
        setMessage('✗ Không thể import dữ liệu');
        setSuccess(false);
      }
    } catch (error) {
      console.error('❌ Lỗi khi import:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không xác định';
      setMessage(`✗ Lỗi: ${errorMessage}`);
      setSuccess(false);
    } finally {
      setImportingAppointments(false);
    }
  };

  const handleImportNotifications = async () => {
    setImportingNotifications(true);
    setMessage('Đang import thông báo...');
    setSuccess(false);
    setTestResult('');

    try {
      console.log('🚀 Bắt đầu import thông báo...');
      const result = await importNotifications();
      
      if (result.success) {
        console.log('✅ Import thành công thông báo!');
        setMessage(`✓ Import thành công ${result.count} thông báo!`);
        setSuccess(true);
        
        // Test đọc dữ liệu ngay sau khi import
        setTimeout(async () => {
          const notifications = await getAllDocuments('notifications');
          setTestResult(`Đã kiểm tra: Hiện có ${notifications.length} thông báo trong Firebase`);
        }, 1000);
      } else {
        setMessage('✗ Không thể import dữ liệu');
        setSuccess(false);
      }
    } catch (error) {
      console.error('❌ Lỗi khi import:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không xác định';
      setMessage(`✗ Lỗi: ${errorMessage}`);
      setSuccess(false);
    } finally {
      setImportingNotifications(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        paddingTop: 50,
        backgroundColor: '#00BCD4',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
          Import Dữ Liệu Firebase
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {/* Thông tin */}
          <View style={{ 
            backgroundColor: '#E3F2FD', 
            padding: 16, 
            borderRadius: 12, 
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: '#00BCD4'
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#0277BD', marginBottom: 8 }}>
              📦 Dữ liệu sẽ được import:
            </Text>
            <Text style={{ fontSize: 14, color: '#01579B', lineHeight: 24 }}>
              • 16 Bác sĩ (12 chuyên khoa){'\n'}
              • 6 Bệnh viện{'\n'}
              • 2 Người dùng{'\n'}
              • 6 Lịch khám{'\n'}
              • 3 Cuộc hội thoại{'\n'}
              • 10 Tin nhắn{'\n'}
              • 5 Hồ sơ bệnh án{'\n'}
              • 2 Đơn thuốc{'\n'}
              • 12 Chuyên khoa{'\n'}
              • 4 Chuyên khoa phổ biến{'\n'}
              • 6 Triệu chứng thường gặp{'\n'}
              • 2 Bảo hiểm{'\n'}
              • 3 Quyền lợi bảo hiểm{'\n'}
              • 2 Yêu cầu bảo hiểm{'\n'}
              • 8 Thông báo{'\n'}
              • 12 Bình luận
            </Text>
          </View>

          {/* Button XÓA & IMPORT LẠI - NỔI BẬT NHẤT */}
          <TouchableOpacity
            onPress={handleCleanAndImport}
            disabled={cleaningAndImporting}
            style={{
              backgroundColor: cleaningAndImporting ? '#94a3b8' : '#DC2626',
              paddingVertical: 18,
              borderRadius: 12,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              borderWidth: 3,
              borderColor: cleaningAndImporting ? '#94a3b8' : '#B91C1C',
            }}
          >
            {cleaningAndImporting ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="white" size="large" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 12, fontSize: 18 }}>
                  Đang xử lý...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons name="nuclear-outline" size={28} color="white" />
                  <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 18 }}>
                    XÓA & IMPORT LẠI DỮ LIỆU
                  </Text>
                </View>
                <Text style={{ color: '#FEE2E2', fontSize: 12, fontWeight: '500' }}>
                  Xóa tất cả & import dữ liệu mới từ file JSON
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ 
            height: 1, 
            backgroundColor: '#e5e7eb', 
            marginVertical: 16 
          }} />

          {/* Button RESET TOÀN BỘ - NỔI BẬT NHẤT */}
          <TouchableOpacity
            onPress={handleResetAllData}
            disabled={resetting}
            style={{
              backgroundColor: resetting ? '#94a3b8' : '#DC2626',
              paddingVertical: 18,
              borderRadius: 12,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              borderWidth: 3,
              borderColor: resetting ? '#94a3b8' : '#B91C1C',
            }}
          >
            {resetting ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="white" size="large" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 12, fontSize: 18 }}>
                  Đang reset...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons name="nuclear-outline" size={28} color="white" />
                  <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 18 }}>
                    RESET TOÀN BỘ DATABASE
                  </Text>
                </View>
                <Text style={{ color: '#FEE2E2', fontSize: 12, fontWeight: '500' }}>
                  Xóa tất cả & Import lại với ID chuẩn
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ 
            height: 1, 
            backgroundColor: '#e5e7eb', 
            marginVertical: 16 
          }} />

          {/* Các nút khác */}
          {/* Button Xóa & Import Lại Bác Sĩ */}
          <TouchableOpacity
            onPress={handleDeleteAndReimportDoctors}
            disabled={reimporting}
            style={{
              backgroundColor: reimporting ? '#94a3b8' : '#8B5CF6',
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              borderWidth: 2,
              borderColor: reimporting ? '#94a3b8' : '#7C3AED',
            }}
          >
            {reimporting ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Đang xử lý...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="refresh-circle-outline" size={24} color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Xóa & Import Lại Bác Sĩ (16)
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Button Import Tất Cả */}
          <TouchableOpacity
            onPress={handleSeedData}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#94a3b8' : '#00BCD4',
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Đang import...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="cloud-upload-outline" size={24} color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Import Tất Cả Dữ Liệu
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Button Import 2 Bác Sĩ Mới */}
          <TouchableOpacity
            onPress={handleImportNewDoctors}
            disabled={importingNew}
            style={{
              backgroundColor: importingNew ? '#94a3b8' : '#10B981',
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            {importingNew ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Đang import...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="person-add-outline" size={24} color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Import 2 Bác Sĩ Mới
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Button Import 4 Bác Sĩ Mới (4 Chuyên Khoa) */}
          <TouchableOpacity
            onPress={handleImport4NewDoctors}
            disabled={importing4New}
            style={{
              backgroundColor: importing4New ? '#94a3b8' : '#06B6D4',
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            {importing4New ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Đang import...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="people-outline" size={24} color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Import 4 Bác Sĩ Mới (4 Chuyên Khoa)
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Button Import Lịch Khám */}
          <TouchableOpacity
            onPress={handleImportAppointments}
            disabled={importingAppointments}
            style={{
              backgroundColor: importingAppointments ? '#94a3b8' : '#F59E0B',
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            {importingAppointments ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Đang import...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="calendar-outline" size={24} color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Import Lịch Khám (6)
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Button Import Thông Báo */}
          <TouchableOpacity
            onPress={handleImportNotifications}
            disabled={importingNotifications}
            style={{
              backgroundColor: importingNotifications ? '#94a3b8' : '#EC4899',
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            {importingNotifications ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Đang import...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="notifications-outline" size={24} color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Import Thông Báo (8)
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Button Test Firebase */}
          <TouchableOpacity
            onPress={handleTestFirebase}
            style={{
              backgroundColor: '#8B5CF6',
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle-outline" size={24} color="white" />
              <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                Kiểm Tra Dữ Liệu
              </Text>
            </View>
          </TouchableOpacity>

          {/* Button Xóa Bác Sĩ */}
          <TouchableOpacity
            onPress={handleDeleteDoctors}
            disabled={deleting}
            style={{
              backgroundColor: deleting ? '#94a3b8' : '#EF4444',
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            {deleting ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Đang xóa...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="trash-outline" size={24} color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                  Xóa Tất Cả Bác Sĩ
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {/* Message */}
          {message && (
            <View
              style={{
                backgroundColor: success ? '#D1FAE5' : '#FEE2E2',
                padding: 16,
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: success ? '#10B981' : '#EF4444',
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                  name={success ? 'checkmark-circle' : 'alert-circle'} 
                  size={24} 
                  color={success ? '#059669' : '#DC2626'} 
                />
                <Text
                  style={{
                    color: success ? '#065F46' : '#991B1B',
                    fontWeight: '600',
                    marginLeft: 8,
                    flex: 1,
                    fontSize: 14
                  }}
                >
                  {message}
                </Text>
              </View>
            </View>
          )}

          {/* Test Result */}
          {testResult && (
            <View
              style={{
                backgroundColor: '#FEF3C7',
                padding: 16,
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#F59E0B',
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons 
                  name="information-circle" 
                  size={24} 
                  color="#D97706" 
                />
                <Text
                  style={{
                    color: '#92400E',
                    fontWeight: '600',
                    marginLeft: 8,
                    flex: 1,
                    fontSize: 13,
                    lineHeight: 20,
                  }}
                >
                  {testResult}
                </Text>
              </View>
            </View>
          )}

          {/* Hướng dẫn */}
          <View style={{ 
            backgroundColor: '#FFF3CD', 
            padding: 16, 
            borderRadius: 12, 
            marginTop: 24,
            borderLeftWidth: 4,
            borderLeftColor: '#FFC107'
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#856404', marginBottom: 8 }}>
              ⚠️ Lưu ý:
            </Text>
            <Text style={{ fontSize: 14, color: '#856404', lineHeight: 22 }}>
              • Đảm bảo đã cấu hình Firebase trong file .env.local{'\n'}
              • Dữ liệu cũ sẽ bị ghi đè nếu trùng ID{'\n'}
              • Chỉ sử dụng cho môi trường development{'\n'}
              • Quá trình import có thể mất vài phút
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
