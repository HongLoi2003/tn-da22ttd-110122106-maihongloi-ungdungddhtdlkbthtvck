# Tại Sao Test Được Mà Người Dùng Đặt Lịch Xem Lịch Không Được

## Vấn Đề

- **Test tools** (như `verify-last-appointment.tsx`) có thể lấy được dữ liệu appointments từ Firebase
- **Nhưng** khi người dùng đặt lịch thực tế, quay lại trang appointments, lịch không hiển thị

## Nguyên Nhân

### 1. Appointments Page Không Reload Dữ Liệu

**Vấn đề cũ:**
```typescript
useFocusEffect(
  useCallback(() => {
    loadAppointments();
  }, [user])  // ❌ Dependency là [user]
);
```

**Tại sao có vấn đề:**
- `useFocusEffect` chỉ trigger khi dependencies thay đổi
- Khi quay lại từ booking page, `user` không thay đổi
- Vì vậy `useFocusEffect` không trigger
- Appointments page hiển thị dữ liệu cũ (trước khi đặt lịch)

### 2. Dữ Liệu Được Cache

- Appointments page load dữ liệu lần đầu
- Khi quay lại, nó không reload
- Hiển thị dữ liệu cũ từ state

## Giải Pháp

### Fix 1: Wrap `loadAppointments` trong `useCallback`

```typescript
const loadAppointments = useCallback(async () => {
  // ... load logic
}, [user, selectedTab]);
```

**Lợi ích:**
- `loadAppointments` được memoize
- Chỉ thay đổi khi `user` hoặc `selectedTab` thay đổi

### Fix 2: Thêm `loadAppointments` vào Dependency

```typescript
useFocusEffect(
  useCallback(() => {
    if (user) {
      loadAppointments();
    }
  }, [loadAppointments, user])
);
```

**Lợi ích:**
- `useFocusEffect` trigger mỗi khi `loadAppointments` thay đổi
- Mỗi khi screen focus, `loadAppointments` được gọi
- Dữ liệu luôn được refresh

## Cách Hoạt Động Bây Giờ

```
User đặt lịch
    ↓
Booking page gọi saveAppointmentToFirebase()
    ↓
Appointment được lưu vào Firebase
    ↓
Success alert hiển thị
    ↓
User bấm "Xem lịch khám" hoặc quay lại
    ↓
Appointments page focus
    ↓
useFocusEffect trigger
    ↓
loadAppointments() được gọi
    ↓
Query Firebase cho appointments của user
    ↓
Appointment mới được hiển thị ✅
```

## Test vs Real Booking

### Tại Sao Test Tools Hoạt Động

Test tools (như `verify-last-appointment.tsx`) hoạt động vì:
1. Chúng gọi `loadAppointments()` trực tiếp khi component mount
2. Không phụ thuộc vào `useFocusEffect`
3. Luôn query Firebase mới nhất

### Tại Sao Real Booking Không Hoạt Động (Trước Fix)

Real booking không hoạt động vì:
1. Appointments page load dữ liệu lần đầu
2. Khi quay lại từ booking, `user` không thay đổi
3. `useFocusEffect` không trigger (vì dependency `[user]` không thay đổi)
4. Dữ liệu cũ được hiển thị

## Files Modified

- `app/(tabs)/appointments.tsx`
  - Wrapped `loadAppointments` trong `useCallback`
  - Thêm `loadAppointments` vào dependency array của `useFocusEffect`

## Status

✅ **FIXED** - Appointments page bây giờ reload dữ liệu mỗi khi screen focus

## Verification

Để verify fix hoạt động:

1. **Đặt lịch khám mới**
   - Go to Booking page
   - Fill all steps
   - Click "Xác nhận đặt lịch"
   - See success alert

2. **Quay lại Appointments page**
   - Click "Xem lịch khám" button
   - Or navigate to Appointments tab
   - **Should see new appointment immediately** ✅

3. **Check Console Logs**
   - Look for: `👁️ [APPOINTMENTS] useFocusEffect triggered`
   - Look for: `🔍 [APPOINTMENTS] Starting loadAppointments...`
   - Look for: `✅ [APPOINTMENTS] Query returned X appointments`

## Troubleshooting

If appointments still don't appear:

1. **Check if appointment was saved**
   - Use "🧪 Verify Last Appointment" button
   - Should show your latest appointment

2. **Check if query returns data**
   - Look at console logs
   - Should see: `✅ [APPOINTMENTS] Query returned 1 appointments`

3. **Check if data format is correct**
   - Use "🔴 Debug Firebase (Tất cả)" button
   - Verify appointment has correct userId

4. **Check if date is in future**
   - Appointments with past dates won't show in "Sắp tới" tab
   - Switch to "Tất cả" tab to see all appointments
