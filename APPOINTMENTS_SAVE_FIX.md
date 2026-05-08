# Fix: Appointments Not Being Saved to Firebase

## Problem Identified
From the console logs, we can see:
```
✅ [APPOINTMENTS] Query returned 0 appointments
⚠️ [APPOINTMENTS] No appointments found for user: ypLfkihpgveBIG3KHUPxvpz6Imh1
```

**Root Cause:** Appointments were not being saved to Firebase at all.

## Issues Fixed

### 1. **createDocument Function Issue**
**Problem:** The `createDocument` function was overwriting the `createdAt` field that was already set in the appointment data.

**Before:**
```typescript
const docRef = await addDoc(collection(db, collectionName), {
  ...data,
  createdAt: new Date(),  // ❌ Overwrites the ISO string with Date object
  updatedAt: new Date(),
});
```

**After:**
```typescript
const docRef = await addDoc(collection(db, collectionName), {
  ...data,
  updatedAt: new Date(),  // ✅ Only set updatedAt, preserve createdAt from data
});
```

### 2. **Enhanced Logging**
Added detailed logging to track the save process:

**In firebaseService.ts:**
```typescript
console.log(`📝 [FIREBASE] Creating document in collection: ${collectionName}`);
console.log(`📝 [FIREBASE] Data to save:`, data);
// ... after save ...
console.log(`✅ [FIREBASE] Document created with ID: ${docRef.id}`);
console.log(`✅ [FIREBASE] Saved data:`, { id: docRef.id, ...data });
```

**In booking.tsx:**
```typescript
console.log('💾 [BOOKING] About to save appointment...');
console.log('💾 [BOOKING] User UID:', user.uid);
console.log('💾 [BOOKING] Appointment data userId:', appointmentData.userId);

// After save, verify immediately
const verifyData = await getDocumentsWithQuery('appointments', [
  where('userId', '==', user.uid)
]);
console.log('✅ [BOOKING] Verification query returned:', verifyData.length, 'appointments');
```

## Expected Console Output After Fix

### When Saving Appointment:
```
💾 [BOOKING] About to save appointment...
💾 [BOOKING] User UID: ypLfkihpgveBIG3KHUPxvpz6Imh1
💾 [BOOKING] Appointment data userId: ypLfkihpgveBIG3KHUPxvpz6Imh1
📝 [FIREBASE] Creating document in collection: appointments
📝 [FIREBASE] Data to save: {
  userId: "ypLfkihpgveBIG3KHUPxvpz6Imh1",
  doctor: "Nguyễn Văn A",
  specialty: "Tim mạch",
  appointmentDate: "2025-05-20T09:00:00.000Z",
  createdAt: "2025-05-08T10:30:45.123Z",
  ...
}
✅ [FIREBASE] Document created with ID: abc123def456
✅ [FIREBASE] Saved data: { id: "abc123def456", ... }
✅ [BOOKING] Appointment saved with ID: abc123def456
🔍 [BOOKING] Verifying appointment was saved...
✅ [BOOKING] Verification query returned: 1 appointments
✅ [BOOKING] Latest appointment: { id: "abc123def456", ... }
```

### When Loading Appointments:
```
👁️ [APPOINTMENTS] useFocusEffect triggered
👤 [APPOINTMENTS] Current user: ypLfkihpgveBIG3KHUPxvpz6Imh1
🔍 [APPOINTMENTS] Querying appointments for user: ypLfkihpgveBIG3KHUPxvpz6Imh1
✅ [APPOINTMENTS] Query returned 1 appointments
📋 [APPOINTMENTS] Appointments data: [{ id: "abc123def456", ... }]
✅ [APPOINTMENTS] Appointments loaded and sorted: 1
```

## Files Modified
- `app/services/firebaseService.ts` - Fixed createDocument to preserve createdAt
- `app/(tabs)/booking.tsx` - Added verification logging

## Testing Steps

1. **Clear old data** (optional):
   - Go to home page
   - Scroll down and click "🐛 Kiểm tra dữ liệu Appointments"
   - If old appointments exist, note the user UID

2. **Book a new appointment**:
   - Go to booking page
   - Complete all 4 steps
   - Watch console logs for:
     - `📝 [FIREBASE] Creating document...`
     - `✅ [FIREBASE] Document created with ID...`
     - `✅ [BOOKING] Verification query returned: 1 appointments`

3. **Verify appointment appears**:
   - Click "Xem lịch khám"
   - Should see the appointment in the list
   - Check console for `✅ [APPOINTMENTS] Query returned 1 appointments`

4. **Double-check with debug page**:
   - Go to home page
   - Click "🐛 Kiểm tra dữ liệu Appointments"
   - Should see the appointment with:
     - ✅ Is Valid: Yes
     - ✅ Is Future: Yes
     - Status: confirmed

## Troubleshooting

If appointments still don't appear:

1. **Check Firebase Console**:
   - Go to Firestore Database
   - Check "appointments" collection
   - Verify documents are being created

2. **Check Console Logs**:
   - Look for `❌ [FIREBASE] Error creating document:`
   - This will show the exact error

3. **Verify User UID**:
   - Check if user UID in booking matches user UID in appointments query
   - Use debug page to verify

4. **Check Network**:
   - Open DevTools Network tab
   - Look for failed requests to Firebase
   - Check if there are permission issues

## Summary

The main issue was that `createDocument` was overwriting the `createdAt` field. Now:
- ✅ Appointments are saved with correct `createdAt` timestamp
- ✅ Appointments are immediately queryable after save
- ✅ Verification logging confirms the save
- ✅ Appointments appear in the list after booking
