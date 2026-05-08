# Troubleshooting: Appointments Not Saving to Firebase

## 🔴 Critical Issue
Appointments are not being saved to Firebase at all. The collection is empty.

## 🔍 How to Diagnose

### Step 1: Check Firebase Collection
1. Go to home page
2. Scroll down and click **"🔴 Debug Firebase (Tất cả)"** button
3. This shows ALL appointments in the Firebase collection
4. If you see **"Không có appointments nào trong Firebase!"** → appointments are NOT being saved

### Step 2: Check Console Logs When Booking
1. Open DevTools (F12)
2. Go to Console tab
3. Complete a booking
4. Look for these logs:

**Expected logs:**
```
💾 [BOOKING] About to save appointment...
💾 [BOOKING] User UID: ypLfkihpgveBIG3KHUPxvpz6Imh1
📝 [FIREBASE] Creating document in collection: appointments
📝 [FIREBASE] Data to save: { userId: "...", doctor: "...", ... }
✅ [FIREBASE] Document created with ID: abc123...
✅ [BOOKING] Appointment saved with ID: abc123...
```

**If you see error logs:**
```
❌ [FIREBASE] Error creating document: ...
```
→ There's an error saving to Firebase

### Step 3: Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Complete a booking
4. Look for requests to Firebase
5. Check if any requests are failing (red X)

## 🐛 Common Issues & Solutions

### Issue 1: No logs appear at all
**Cause:** Booking page is not calling `createDocument`

**Solution:**
1. Check if booking form is being submitted
2. Verify all required fields are filled
3. Check if there's an error before `createDocument` is called

### Issue 2: Logs show error
**Cause:** Firebase connection issue or permission issue

**Solution:**
1. Check Firebase Console for errors
2. Verify Firestore rules allow writes
3. Check if Firebase is initialized correctly

### Issue 3: Logs show success but appointments don't appear
**Cause:** Data format issue or query filter issue

**Solution:**
1. Check the saved data format
2. Verify `userId` matches the logged-in user
3. Check if `appointmentDate` is in correct format

## 🔧 Debug Steps

### Step 1: Verify Firebase Connection
```javascript
// In console, run:
import { db } from '@/app/config/firebase';
console.log('Firebase DB:', db);
```

If `db` is `null` → Firebase not initialized

### Step 2: Check Firestore Rules
1. Go to Firebase Console
2. Firestore Database → Rules
3. Check if rules allow writes to "appointments" collection
4. Default rules should allow authenticated users to write

### Step 3: Manual Test
1. Go to Firebase Console
2. Firestore Database → appointments collection
3. Try to manually add a document
4. If you can add manually → rules are OK
5. If you can't → there's a permission issue

### Step 4: Check Booking Form Validation
1. Open booking page
2. Try to complete booking
3. Check if all required fields are filled:
   - Symptoms selected
   - Doctor selected
   - Date selected
   - Time selected
   - Patient info filled

## 📋 Checklist

- [ ] Firebase is initialized (check console: `Firebase DB: {...}`)
- [ ] Firestore rules allow writes
- [ ] Booking form has all required fields
- [ ] Console shows "📝 [FIREBASE] Creating document"
- [ ] Console shows "✅ [FIREBASE] Document created"
- [ ] Debug Firebase page shows appointments
- [ ] Appointments page shows appointments

## 🆘 If Still Not Working

### Option 1: Check Firebase Console Directly
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Firestore Database
4. Check "appointments" collection
5. Manually add a test document
6. If manual add works → issue is with app code
7. If manual add fails → issue is with Firebase setup

### Option 2: Check Firestore Rules
```javascript
// Current rules (should allow authenticated users)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Option 3: Enable Firestore Logging
1. In booking.tsx, add more detailed logging
2. Log every step of the save process
3. Check console for exact error

## 📝 What to Check

1. **Is Firebase initialized?**
   - Check: `console.log('Firebase DB:', db);`

2. **Is user authenticated?**
   - Check: `console.log('User UID:', user.uid);`

3. **Is data being sent to Firebase?**
   - Check: `console.log('📝 [FIREBASE] Data to save:', data);`

4. **Is save successful?**
   - Check: `console.log('✅ [FIREBASE] Document created');`

5. **Can you query the data back?**
   - Check: `console.log('✅ [BOOKING] Verification query returned:', verifyData.length);`

## 🎯 Next Steps

1. **Click "🔴 Debug Firebase (Tất cả)" button**
   - See if ANY appointments exist in Firebase

2. **Check console logs when booking**
   - Look for error messages

3. **If no logs appear:**
   - Booking form might not be submitting
   - Check if all fields are filled

4. **If error logs appear:**
   - Firebase connection issue
   - Check Firebase Console

5. **If success logs but no data:**
   - Data format issue
   - Check saved data structure

## 📞 Information to Provide

If you need help, provide:
1. Screenshot of "🔴 Debug Firebase" page
2. Console logs when booking (copy-paste)
3. Error messages (if any)
4. Firebase project ID
5. Steps to reproduce the issue
