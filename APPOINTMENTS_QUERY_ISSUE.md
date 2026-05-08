# Issue: Appointments Saved but Not Showing

## Status
✅ **Appointments ARE being saved to Firebase** (8 appointments found)
❌ **But they don't show in the Appointments page**

## Root Cause Analysis

The issue is likely one of these:

### 1. **User ID Mismatch**
- Appointments are saved with one userId
- But the logged-in user has a different userId
- So the query returns 0 results

**How to check:**
1. Go to "🔴 Debug Firebase" page
2. Look at "👤 User IDs dalam Appointments" section
3. Note the userId(s) of the 8 appointments
4. Go to "🐛 Kiểm tra dữ liệu Appointments" page
5. Check "User UID" at the top
6. **Compare the two UIDs**

### 2. **Date Format Issue**
- Appointments have wrong `appointmentDate` format
- So they get filtered out by the date check

**How to check:**
1. Go to "🔴 Debug Firebase" page
2. Look at `appointmentDate` field
3. Should be ISO format: `2025-05-20T09:00:00.000Z`
4. If it's different → date format issue

### 3. **Status Issue**
- Appointments have status other than "confirmed"
- So they don't show in "Sắp tới" tab

**How to check:**
1. Go to "🔴 Debug Firebase" page
2. Look at `status` field
3. Should be "confirmed"
4. If it's "pending" or "cancelled" → won't show in "Sắp tới" tab

## Next Steps

### Step 1: Check User ID Match
1. Open "🔴 Debug Firebase" page
2. Note the userId from appointments
3. Open "🐛 Kiểm tra dữ liệu Appointments" page
4. Compare User UID with the userId from step 2

**If they don't match:**
- This is the problem!
- Appointments belong to a different user
- Need to check why userId is different

### Step 2: Check Appointment Data
1. Go to "🔴 Debug Firebase" page
2. Check each appointment:
   - `appointmentDate`: Should be ISO format (2025-05-20T...)
   - `status`: Should be "confirmed"
   - `fullDate`: Should be DD/MM/YYYY format

### Step 3: Manual Query Test
1. Open DevTools (F12)
2. Go to Console
3. Run:
```javascript
import { db } from '@/app/config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const q = query(collection(db, 'appointments'), where('userId', '==', 'YOUR_USER_UID'));
const snapshot = await getDocs(q);
console.log('Appointments for this user:', snapshot.docs.length);
snapshot.docs.forEach(doc => console.log(doc.data()));
```

Replace `YOUR_USER_UID` with the actual user UID.

## Possible Solutions

### If User ID Mismatch:
1. Check why appointments have different userId
2. Verify user authentication is working
3. May need to delete old appointments and create new ones

### If Date Format Issue:
1. Check booking.tsx date parsing
2. Verify `appointmentDate` is ISO format
3. May need to re-save appointments

### If Status Issue:
1. Check booking.tsx status setting
2. Verify status is "confirmed"
3. Or check appointments page filter logic

## Quick Diagnosis

**Run this in Console:**
```javascript
// Get current user UID
import { auth } from '@/app/config/firebase';
console.log('Current user UID:', auth.currentUser?.uid);

// Get all appointments
import { db } from '@/app/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
const snapshot = await getDocs(collection(db, 'appointments'));
console.log('Total appointments:', snapshot.docs.length);

// Group by userId
const byUser = {};
snapshot.docs.forEach(doc => {
  const userId = doc.data().userId;
  if (!byUser[userId]) byUser[userId] = 0;
  byUser[userId]++;
});
console.log('Appointments by user:', byUser);
```

This will show:
- Current logged-in user UID
- Total appointments in Firebase
- How many appointments each user has

## Expected Output

**If everything is correct:**
```
Current user UID: abc123xyz...
Total appointments: 8
Appointments by user: { abc123xyz...: 8 }
```

**If there's a mismatch:**
```
Current user UID: abc123xyz...
Total appointments: 8
Appointments by user: { def456uvw...: 8 }  ← Different user!
```

## Summary

The 8 appointments ARE in Firebase, but they're not showing because:
1. ❓ They might belong to a different user
2. ❓ They might have wrong date format
3. ❓ They might have wrong status

Use the debug pages to identify which one is the issue!
