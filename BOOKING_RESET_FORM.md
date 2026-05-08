# Feature: Reset Form to Book New Appointment

## Problem

Khi người dùng đặt lịch xong (Step 4), bấm "Xem lịch khám" để xem lịch, sau đó quay lại booking page, form vẫn giữ dữ liệu cũ. Người dùng không thể đặt lịch mới dễ dàng.

## Solution

Thêm button "Đặt lịch mới" ở Step 4 success screen để reset form và quay về Step 1.

## How It Works

**Step 4 Success Screen bây giờ có 2 buttons:**

1. **"Xem lịch khám"** (Primary button)
   - Navigate đến appointments page
   - Xem lịch khám vừa đặt

2. **"Đặt lịch mới"** (Secondary button - NEW)
   - Reset toàn bộ form
   - Quay về Step 1
   - Người dùng có thể đặt lịch mới ngay

## Reset Logic

Khi bấm "Đặt lịch mới", reset các state:

```typescript
setCurrentStep(1);                    // Quay về Step 1
setSelectedSpecialty('');             // Reset chuyên khoa
setSelectedDoctor('');                // Reset bác sĩ
setSelectedDoctorId('');              // Reset doctor ID
setSelectedDoctorImage('');           // Reset ảnh bác sĩ
setSelectedHospital('');              // Reset bệnh viện
setSelectedDate('');                  // Reset ngày
setSelectedTime('');                  // Reset giờ
setSelectedSymptoms([]);              // Reset triệu chứng
setRecommendations([]);               // Reset gợi ý chuyên khoa
setRecommendedDoctors([]);            // Reset gợi ý bác sĩ
setAppointmentId('');                 // Reset mã đặt lịch
```

## User Experience

**Before:**
1. User books appointment
2. Sees Step 4 success screen
3. Clicks "Xem lịch khám"
4. Views appointments
5. Wants to book another appointment
6. Goes back to booking page
7. Form still has old data ❌
8. Has to manually clear everything

**After:**
1. User books appointment
2. Sees Step 4 success screen with 2 buttons
3. Option A: Click "Xem lịch khám" → View appointments
4. Option B: Click "Đặt lịch mới" → Fresh form at Step 1 ✅
5. Can immediately book another appointment

## UI Changes

**Step 4 Success Screen:**

```
┌─────────────────────────────────┐
│  ✅ Đặt lịch thành công!        │
│                                 │
│  Mã đặt lịch: DL24052210003847  │
│                                 │
│  Bác sĩ: Nguyễn Văn A           │
│  Chuyên khoa: Tim mạch          │
│  Thời gian: 10:00 - Thứ 4      │
│  Địa điểm: Bệnh viện Tâm Anh   │
│                                 │
│  ┌─────────────────────────────┐│
│  │  Xem lịch khám              ││ (Primary - Blue)
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │  Đặt lịch mới               ││ (Secondary - White border)
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

## Files Modified

- `app/(tabs)/booking.tsx`
  - Added "Đặt lịch mới" button to Step 4
  - Added reset logic to clear all form data
  - Returns to Step 1 for new booking

## Status

✅ **DONE** - Users can now easily book multiple appointments

## Testing

To verify the feature:

1. **Book first appointment**
   - Fill all steps
   - Click "Xác nhận đặt lịch"
   - See Step 4 success screen

2. **Click "Đặt lịch mới"**
   - Should return to Step 1 ✅
   - Form should be empty ✅
   - Can select new symptoms ✅

3. **Book second appointment**
   - Fill all steps again
   - Click "Xác nhận đặt lịch"
   - See Step 4 with new appointment code ✅

4. **Verify both appointments exist**
   - Click "Xem lịch khám"
   - Should see both appointments ✅

## Benefits

✅ **Better UX** - Easy to book multiple appointments
✅ **No Manual Reset** - Form automatically clears
✅ **Clear Options** - Two distinct buttons for two actions
✅ **Efficient** - Users don't need to navigate away and back
