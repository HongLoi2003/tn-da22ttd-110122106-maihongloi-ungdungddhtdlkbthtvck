# Final Troubleshooting: Appointments Not Showing

## 🎯 Diagnostic Steps

### Step 1: Test Firebase Save
1. **Mở trang chủ**
2. **Cuộn xuống bấm "🧪 Test Firebase Save"**
3. **Bấm "Run Test"**
4. **Xem kết quả:**
   - ✅ **SUCCESS** → Firebase hoạt động, vấn đề ở booking page
   - ❌ **FAILED** → Firebase không hoạt động, vấn đề ở Firebase

### Step 2: Check Console Logs When Booking
1. **Mở DevTools (F12)**
2. **Vào Console tab**
3. **Đặt lịch khám**
4. **Tìm logs:**
   - `💾 [BOOKING] About to save appointment...`
   - `📝 [FIREBASE] Creating document in collection: appointments`
   - `✅ [FIREBASE] Document created with ID:`
   - `✅ [BOOKING] Verification query returned: X appointments`

**Nếu không thấy logs:**
- Booking form không được submit
- Hoặc có error trước khi lưu

**Nếu thấy error logs:**
- Firebase connection issue
- Firestore rules issue
- Data validation issue

### Step 3: Check Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Firestore Database
4. Check "appointments" collection
5. Verify documents are being created

## 🔍 Possible Issues & Solutions

### Issue 1: Test Firebase Save Returns SUCCESS but Appointments Don't Show
**Cause:** Appointments are being saved but not queried correctly

**Solution:**
1. Check appointments page filter logic
2. Verify `appointmentDate` format (should be ISO)
3. Verify `status` is "confirmed"
4. Check date is in future

**Debug:**
- Bấm "🐛 Kiểm tra dữ liệu Appointments"
- Xem Date Analysis
- Verify "Is Valid: ✅ Yes"
- Verify "Is Future: ✅ Yes"

### Issue 2: Test Firebase Save Returns FAILED
**Cause:** Firebase connection or permission issue

**Solution:**
1. Check Firebase is initialized
2. Check Firestore rules allow writes
3. Check user is authenticated
4. Check network connection

**Debug:**
- Check console logs for error message
- Go to Firebase Console
- Check Firestore rules
- Try manual write in Firebase Console

### Issue 3: No Console Logs Appear When Booking
**Cause:** Booking form not being submitted

**Solution:**
1. Check all required fields are filled
2. Check form validation
3. Check no JavaScript errors

**Debug:**
- Check console for errors
- Verify all form fields are filled
- Check if "Tiếp tục" button is enabled

### Issue 4: Appointments Saved but Not Showing in Appointments Page
**Cause:** Query filter issue

**Solution:**
1. Check User UID matches
2. Check date format
3. Check status
4. Check appointments page filter logic

**Debug:**
- Bấm "🔴 Debug Firebase (Tất cả)"
- Verify User IDs
- Bấm "🐛 Kiểm tra dữ liệu Appointments"
- Check Date Analysis

## 📋 Complete Diagnostic Checklist

- [ ] **Test Firebase Save**
  - [ ] Run test
  - [ ] Check result (SUCCESS or FAILED)
  - [ ] If FAILED, check error message

- [ ] **Check Console Logs**
  - [ ] Mở DevTools (F12)
  - [ ] Đặt lịch khám
  - [ ] Tìm `[BOOKING]` logs
  - [ ] Tìm `[FIREBASE]` logs
  - [ ] Tìm error logs

- [ ] **Check Firebase**
  - [ ] Go to Firebase Console
  - [ ] Check appointments collection
  - [ ] Verify documents exist
  - [ ] Check Firestore rules

- [ ] **Check Appointments Data**
  - [ ] Bấm "🔴 Debug Firebase (Tất cả)"
  - [ ] Verify User IDs
  - [ ] Bấm "🐛 Kiểm tra dữ liệu Appointments"
  - [ ] Check Date Analysis

- [ ] **Check Appointments Page**
  - [ ] Go to appointments page
  - [ ] Check "Sắp tới" tab
  - [ ] Check "Tất cả" tab
  - [ ] Check "Đã hoàn thành" tab

## 🆘 If Still Not Working

### Option 1: Check Console Logs
```
Look for these patterns:
- ✅ [BOOKING] - Booking page logs
- 📝 [FIREBASE] - Firebase save logs
- 👁️ [APPOINTMENTS] - Appointments page logs
- ❌ Error logs
```

### Option 2: Check Firebase Console
```
1. Go to Firestore Database
2. Check appointments collection
3. Verify documents exist
4. Check document structure
5. Check Firestore rules
```

### Option 3: Manual Test
```javascript
// In console:
import { db } from '@/app/config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const snapshot = await getDocs(collection(db, 'appointments'));
console.log('Total appointments:', snapshot.docs.length);
snapshot.docs.forEach(doc => console.log(doc.data()));
```

## 📞 Information to Provide for Support

If you need help:
1. Screenshot of "🧪 Test Firebase Save" result
2. Console logs when booking (copy-paste)
3. Screenshot of "🔴 Debug Firebase (Tất cả)"
4. Screenshot of "🐛 Kiểm tra dữ liệu Appointments"
5. Error messages (if any)
6. Firebase project ID

## 🎯 Expected Flow

**Correct Flow:**
1. ✅ Test Firebase Save returns SUCCESS
2. ✅ Console logs show `[BOOKING]` and `[FIREBASE]` logs
3. ✅ Firebase Console shows appointments
4. ✅ Debug Firebase shows appointments
5. ✅ Appointments page shows appointments

**If any step fails:**
- Check that step's troubleshooting guide
- Provide information for support
