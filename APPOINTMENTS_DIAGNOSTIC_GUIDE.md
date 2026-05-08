# Appointments Diagnostic Guide

## Current Status
User UID: `OOJQH7DLozT7tS1pfKBgg56GGo9i2`
Warning: ⚠️ No appointments found for this user

## Step-by-Step Troubleshooting

### Step 1: Test the Booking Flow
1. Go to **Booking** page
2. Fill in all steps:
   - **Step 1**: Select symptoms → Get specialty recommendations → Select a doctor
   - **Step 2**: Select date and time
   - **Step 3**: Confirm patient info → Click "Xác nhận đặt lịch"
3. Watch for the **success alert** with appointment details
4. Check the **console logs** for messages starting with `💾 [BOOKING]`

### Step 2: Check Console Logs
After clicking "Xác nhận đặt lịch", look for these logs:

**Expected logs (in order):**
```
💾 [BOOKING] handleConfirmBooking called
💾 [BOOKING] Saving appointment to Firebase...
📅 [BOOKING] Selected date: 20/05/2025
⏰ [BOOKING] Selected time: 09:00
💾 [BOOKING] Appointment data to save: {...}
💾 [BOOKING] About to save appointment...
💾 [BOOKING] User UID: OOJQH7DLozT7tS1pfKBgg56GGo9i2
💾 [BOOKING] Appointment data userId: OOJQH7DLozT7tS1pfKBgg56GGo9i2
📝 [FIREBASE] Creating document in collection: appointments
📝 [FIREBASE] Data to save: {...}
✅ [FIREBASE] Document created with ID: [some-id]
✅ [BOOKING] Appointment saved with ID: [some-id]
✅ [BOOKING] Verification query returned: 1 appointments
✅ [BOOKING] Latest appointment: {...}
```

**If you see errors:**
- `❌ [FIREBASE] Error creating document` → Firebase connection issue
- `Error: Missing required field` → Data validation failed
- `Error: Firestore not initialized` → Firebase not set up

### Step 3: Use Debug Tools

#### Option A: Check Last Saved Appointment
1. Go to **Home** page
2. Click **"🧪 Verify Last Appointment"** button
3. This shows:
   - The most recent appointment for your user
   - All appointment fields
   - Any data validation issues
   - Date analysis

**What to look for:**
- ✅ All checks passed → Appointment is correct
- ❌ Issues found → Shows what's wrong
- ❌ No appointments found → Nothing was saved

#### Option B: Check All Appointments in Firebase
1. Go to **Home** page
2. Click **"🔴 Debug Firebase (Tất cả)"** button
3. This shows:
   - Total appointments in Firebase
   - All user IDs with appointments
   - Details of each appointment

**What to look for:**
- If your user ID appears → Appointments were saved
- If your user ID doesn't appear → Appointments weren't saved
- If different user ID appears → Appointments saved with wrong userId

#### Option C: Check Your User's Appointments
1. Go to **Home** page
2. Click **"🐛 Kiểm tra dữ liệu Appointments"** button
3. This shows:
   - All appointments for your user
   - Date analysis for each
   - Status of each appointment

### Step 4: Verify Data Format

When an appointment is saved, it should have:

```javascript
{
  userId: "OOJQH7DLozT7tS1pfKBgg56GGo9i2",  // Must match your user ID
  doctor: "Nguyễn Văn A",                     // Doctor name
  specialty: "Tim mạch",                      // Specialty
  hospital: "Bệnh viện Đa khoa Tâm Anh",     // Hospital name
  fullDate: "20/05/2025",                     // DD/MM/YYYY format
  time: "09:00",                              // HH:MM format
  appointmentDate: "2025-05-20T09:00:00.000Z", // ISO 8601 format
  status: "confirmed",                        // Must be "confirmed"
  createdAt: "2025-05-08T10:30:00.000Z",     // ISO 8601 format
  patientName: "Your Name",
  patientPhone: "0123456789",
  patientEmail: "your@email.com",
  patientAddress: "Your Address"
}
```

### Step 5: Common Issues & Solutions

#### Issue 1: Appointment Not Appearing After Booking
**Symptoms:**
- Success alert shown
- But appointment doesn't appear in appointments page

**Solutions:**
1. Reload the appointments page (pull down to refresh)
2. Check if appointment is in "Tất cả" (All) tab instead of "Sắp tới" (Upcoming)
3. Use debug tools to verify appointment was saved
4. Check if date is in the future (past dates won't show in "Sắp tới")

#### Issue 2: No Appointments Found for User
**Symptoms:**
- Warning: "⚠️ No appointments found for user: OOJQH7DLozT7tS1pfKBgg56GGo9i2"
- Debug tools show no appointments

**Solutions:**
1. Check console logs during booking - look for errors
2. Verify Firebase is initialized (check `.env.local` has Firebase config)
3. Try booking again and watch console logs
4. Check if appointments are being saved with different userId
5. Use "🔴 Debug Firebase (Tất cả)" to see if ANY appointments exist

#### Issue 3: Appointment Saved But With Wrong userId
**Symptoms:**
- Debug Firebase shows appointments exist
- But they have different userId
- Your appointments page is empty

**Solutions:**
1. This means you logged in with different account
2. Check which user ID is in the appointments
3. Log in with that account to see the appointments
4. Or delete old appointments and book with current account

#### Issue 4: Firebase Connection Error
**Symptoms:**
- Error: "Firestore not initialized"
- Error: "Firebase: Error (auth/invalid-credential)"

**Solutions:**
1. Check `.env.local` has correct Firebase config
2. Verify Firebase project is set up correctly
3. Check internet connection
4. Try logging out and logging back in
5. Restart the app

### Step 6: If Still Not Working

**Collect this information:**
1. Your user ID: `OOJQH7DLozT7tS1pfKBgg56GGo9i2`
2. Console logs from booking (copy full logs)
3. Output from "🔴 Debug Firebase (Tất cả)" button
4. Output from "🧪 Verify Last Appointment" button
5. Output from "🐛 Kiểm tra dữ liệu Appointments" button

**Then:**
1. Check `FINAL_TROUBLESHOOT.md` for comprehensive troubleshooting
2. Review `FIX_APPOINTMENTS_NOT_SAVING.md` for the fix that was applied
3. Check Firebase console to see if appointments collection exists

## Quick Reference

| Issue | Debug Tool | Expected Result |
|-------|-----------|-----------------|
| Appointment not saving | Console logs | See `✅ [BOOKING] Appointment saved` |
| Appointment not appearing | Verify Last Appointment | Shows your latest appointment |
| No appointments at all | Debug Firebase (All) | Shows total count > 0 |
| Wrong user ID | Debug Firebase (All) | Shows your user ID in list |
| Date issues | Verify Last Appointment | Shows date analysis |

## Next Steps

1. **Try booking again** with the fixed code
2. **Check console logs** for any errors
3. **Use debug tools** to verify data was saved
4. **Reload appointments page** to see new appointment
5. **If still not working**, collect logs and check troubleshooting guide
