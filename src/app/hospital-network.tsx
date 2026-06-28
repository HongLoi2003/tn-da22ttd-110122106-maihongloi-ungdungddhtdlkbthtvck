import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function HospitalNetworkScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchText, setSearchText] = useState('');

  const hospitals = [
    {
      id: '1',
      name: 'Bệnh viện Trường Đại học Trà Vinh',
      level: 'central',
      levelText: 'Tuyến Trung ương',
      address: '78 Giải Phóng, Đống Đa, Hà Nội',
      specialties: ['Tim mạch', 'Thần kinh', 'Ung bướu'],
      doctors: 450,
      beds: 1200,
      rating: 4.8,
      distance: '5.2 km',
      status: 'online',
      canRefer: true,
      canConsult: true,
    },
    {
      id: '2',
      name: 'Bệnh viện Việt Đức',
      level: 'central',
      levelText: 'Tuyến Trung ương',
      address: '40 Tràng Thi, Hoàn Kiếm, Hà Nội',
      specialties: ['Ngoại khoa', 'Chấn thương', 'Cơ xương khớp'],
      doctors: 380,
      beds: 950,
      rating: 4.7,
      distance: '6.8 km',
      status: 'online',
      canRefer: true,
      canConsult: true,
    },
    {
      id: '3',
      name: 'Bệnh viện Đa khoa Quận 1',
      level: 'district',
      levelText: 'Tuyến Quận',
      address: '123 Lý Tự Trọng, Q1, TP.HCM',
      specialties: ['Nội tổng quát', 'Nhi khoa', 'Sản phụ khoa'],
      doctors: 85,
      beds: 250,
      rating: 4.5,
      distance: '1.2 km',
      status: 'online',
      canRefer: true,
      canConsult: true,
    },
    {
      id: '4',
      name: 'Trạm Y tế Phường 5',
      level: 'ward',
      levelText: 'Tuyến Phường',
      address: '45 Nguyễn Thị Minh Khai, Q1, TP.HCM',
      specialties: ['Khám bệnh', 'Tiêm chủng', 'Tư vấn'],
      doctors: 12,
      beds: 20,
      rating: 4.3,
      distance: '0.5 km',
      status: 'online',
      canRefer: true,
      canConsult: false,
    },
  ];

  const referralRequests = [
    {
      id: '1',
      patientName: 'Nguyễn Văn A',
      fromHospital: 'Trạm Y tế Phường 5',
      toHospital: 'Bệnh viện Đa khoa Quận 1',
      reason: 'Cần chụp CT, siêu âm chuyên sâu',
      status: 'pending',
      date: '2024-01-20',
      specialty: 'Tim mạch',
    },
    {
      id: '2',
      patientName: 'Trần Thị B',
      fromHospital: 'Bệnh viện Đa khoa Quận 1',
      toHospital: 'Bệnh viện Trường Đại học Trà Vinh',
      reason: 'Cần phẫu thuật tim mạch',
      status: 'approved',
      date: '2024-01-19',
      specialty: 'Tim mạch',
    },
  ];

  const consultations = [
    {
      id: '1',
      title: 'Hội chẩn bệnh nhân tim mạch',
      fromHospital: 'Trạm Y tế Phường 5',
      withHospital: 'Bệnh viện Trường Đại học Trà Vinh',
      doctor: 'BS. Nguyễn Văn An',
      specialty: 'Tim mạch',
      date: '2024-01-21',
      time: '14:00',
      status: 'scheduled',
    },
    {
      id: '2',
      title: 'Tư vấn ca bệnh phức tạp',
      fromHospital: 'Bệnh viện Đa khoa Quận 1',
      withHospital: 'Bệnh viện Việt Đức',
      doctor: 'BS. Trần Minh Đức',
      specialty: 'Ngoại khoa',
      date: '2024-01-20',
      time: '10:00',
      status: 'completed',
    },
  ];

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesTab = selectedTab === 'all' || h.level === selectedTab;
    return matchesSearch && matchesTab;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'central': return '#8B5CF6';
      case 'district': return '#00BCD4';
      case 'ward': return '#06D6A0';
      default: return '#94a3b8';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFB800';
      case 'approved': return '#06D6A0';
      case 'rejected': return '#FF4444';
    }
  }
}