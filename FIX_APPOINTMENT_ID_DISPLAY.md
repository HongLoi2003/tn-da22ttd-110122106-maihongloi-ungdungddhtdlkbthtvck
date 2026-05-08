# Fix: Appointment ID (Mã Đặt Lịch) Now Shows Unique ID

## Problem

Mã đặt lịch (appointment code) luôn hiển thị số mặc định `DL24052210000` thay vì ID duy nhất từ Firebase.

## Root Cause

Step 4 success screen hardcoded mã đặt lịch:

```typescript
<Text style={styles.successInfoCode}>DL24052210000</Text>  // ❌ Hardcoded
```

Không lưu appointment ID từ Firebase vào state.

## Solution

### 1. Thêm State cho Appointment ID

```typescript
const [appointmentId, setAppointmentId] = useState('');
```

### 2. Lưu Appointment ID Khi Save

```typescript
const appointmentRef = await createDocument('appointments', appointmentData);

// Save appointment ID to state for display in Step 4
if (appointmentRef?.id) {
  setAppointmentId(appointmentRef.id);
  console.log('💾 [BOOKING] Appointment ID saved to state:', appointmentRef.id);
}
```

### 3. Hiển Thị Appointment ID Thực Tế

```typescript
<Text style={styles.successInfoCode}>{appointmentId || 'DL...'}</Text>
```

## How It Works Now

```
User confirms booking
    ↓
saveAppointmentToFirebase() called
    ↓
Appointment saved to Firebase
    ↓
Firebase returns unique ID (e.g., "abc123def456")
    ↓
setAppointmentId(appointmentRef.id)
    ↓
Step 4 displays: "abc123def456" ✅
    ↓
Each booking has unique ID
```

## Example

**Before:**
- Booking 1: Mã đặt lịch = `DL24052210000`
- Booking 2: Mã đặt lịch = `DL24052210000` ❌ (Same!)
- Booking 3: Mã đặt lịch = `DL24052210000` ❌ (Same!)

**After:**
- Booking 1: Mã đặt lịch = `abc123def456` ✅
- Booking 2: Mã đặt lịch = `xyz789uvw012` ✅ (Different!)
- Booking 3: Mã đặt lịch = `pqr345stu678` ✅ (Different!)

## Files Modified

- `app/(tabs)/booking.tsx`
  - Added `appointmentId` state
  - Updated `saveAppointmentToFirebase()` to save appointment ID
  - Updated Step 4 to display `appointmentId`

## Status

✅ **FIXED** - Each appointment now has unique ID displayed in success screen

## Testing

To verify the fix:

1. **Book first appointment**
   - Fill all steps
   - Click "Xác nhận đặt lịch"
   - Note the appointment ID (e.g., `abc123def456`)

2. **Book second appointment**
   - Fill all steps again
   - Click "Xác nhận đặt lịch"
   - Note the appointment ID (should be different, e.g., `xyz789uvw012`)

3. **Verify IDs are different** ✅
   - First ID ≠ Second ID
   - Each booking has unique ID

## Console Logs

When booking, you'll see:
```
💾 [BOOKING] Appointment ID saved to state: abc123def456
```

This confirms the ID is being saved correctly.
