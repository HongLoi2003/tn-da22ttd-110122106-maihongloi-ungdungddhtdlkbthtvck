# Doctor Images Not Showing in Appointments Page

## Problem

Khi người dùng xem lịch khám, ảnh bác sĩ không hiển thị (hiển thị ảnh mặc định thay vì ảnh bác sĩ).

## Root Cause

**Appointments page chỉ có 4 ảnh bác sĩ:**
```typescript
const doctorImages = {
  'nguyenvanam.png': require('@/assets/images/nguyenvanam.png'),
  'tranthilan.png': require('@/assets/images/tranthilan.png'),
  'leminhtam.png': require('@/assets/images/leminhtam.png'),
  'phamthuha.png': require('@/assets/images/phamthuha.png'),
};
```

**Nhưng booking page có 16 ảnh bác sĩ:**
```typescript
const doctorImages = {
  'nguyenvanam.png': require('@/assets/images/nguyenvanam.png'),
  'tranthilan.png': require('@/assets/images/tranthilan.png'),
  'leminhtam.png': require('@/assets/images/leminhtam.png'),
  'tranthimai.png': require('@/assets/images/tranthimai.png'),
  'lehoangnam.png': require('@/assets/images/lehoangnam.png'),
  'phamthuha.png': require('@/assets/images/phamthuha.png'),
  'dominhtuan.png': require('@/assets/images/dominhtuan.png'),
  'vuthilan.png': require('@/assets/images/vuthilan.png'),
  'hoangvanduc.png': require('@/assets/images/hoangvanduc.png'),
  'ngothihuong.png': require('@/assets/images/ngothihuong.png'),
  'nguyenthihoa.png': require('@/assets/images/nguyenthihoa.png'),
  'tranvankhoa.png': require('@/assets/images/tranvankhoa.png'),
  'phamminhquan.png': require('@/assets/images/phamminhquan.png'),
  'lethihang.png': require('@/assets/images/lethihang.png'),
  'nguyenvanhai.png': require('@/assets/images/nguyenvanhai.png'),
  'dangthithao.jpg': require('@/assets/images/dangthithao.jpg'),
};
```

**Khi người dùng đặt lịch với bác sĩ không có trong danh sách 4 ảnh:**
1. Appointment lưu `image: 'dominhtuan.png'` (ví dụ)
2. Appointments page tìm `'dominhtuan.png'` trong `doctorImages`
3. Không tìm thấy → fallback to `logo.png`
4. Ảnh bác sĩ không hiển thị ❌

## Solution

**Cập nhật appointments page với đầy đủ 16 ảnh bác sĩ:**

```typescript
const doctorImages = {
  'nguyenvanam.png': require('@/assets/images/nguyenvanam.png'),
  'tranthilan.png': require('@/assets/images/tranthilan.png'),
  'leminhtam.png': require('@/assets/images/leminhtam.png'),
  'tranthimai.png': require('@/assets/images/tranthimai.png'),
  'lehoangnam.png': require('@/assets/images/lehoangnam.png'),
  'phamthuha.png': require('@/assets/images/phamthuha.png'),
  'dominhtuan.png': require('@/assets/images/dominhtuan.png'),
  'vuthilan.png': require('@/assets/images/vuthilan.png'),
  'hoangvanduc.png': require('@/assets/images/hoangvanduc.png'),
  'ngothihuong.png': require('@/assets/images/ngothihuong.png'),
  'nguyenthihoa.png': require('@/assets/images/nguyenthihoa.png'),
  'tranvankhoa.png': require('@/assets/images/tranvankhoa.png'),
  'phamminhquan.png': require('@/assets/images/phamminhquan.png'),
  'lethihang.png': require('@/assets/images/lethihang.png'),
  'nguyenvanhai.png': require('@/assets/images/nguyenvanhai.png'),
  'dangthithao.jpg': require('@/assets/images/dangthithao.jpg'),
};
```

## File Modified

- `app/(tabs)/appointments.tsx`
  - Updated `doctorImages` object with all 16 doctor images

## How It Works Now

```
1. User books appointment with doctor
   ↓
2. Appointment saved with image: 'dominhtuan.png'
   ↓
3. User views appointments page
   ↓
4. Appointments page loads appointment
   ↓
5. Looks up 'dominhtuan.png' in doctorImages
   ↓
6. Finds it! ✅
   ↓
7. Doctor image displays correctly ✅
```

## Verification

To verify the fix:

1. **Book appointment with any doctor**
   - Go to Booking page
   - Select any doctor (not just the first 4)
   - Complete booking

2. **View appointments page**
   - Navigate to Appointments tab
   - **Doctor image should display** ✅

3. **Check different doctors**
   - Book with Đỗ Minh Tuấn
   - Book with Hoàng Văn Đức
   - Book with Ngô Thị Hương
   - All should show correct images ✅

## Status

✅ **FIXED** - All doctor images now display correctly in appointments page

## Related Files

- `app/(tabs)/booking.tsx` - Has complete doctor images list
- `app/(tabs)/appointments.tsx` - Now has complete doctor images list (UPDATED)
- `doctors.json` - Contains doctor data with image filenames
