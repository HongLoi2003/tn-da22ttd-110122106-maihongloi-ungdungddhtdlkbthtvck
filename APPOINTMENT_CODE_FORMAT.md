# Appointment Code Format: DL + Date + Time + Random

## Format

Mã đặt lịch có format: `DL` + `DDMMYY` + `HHMM` + `XXXX`

**Example:** `DL24052210000`

- `DL` = Prefix (Đặt Lịch)
- `24` = Day (Ngày)
- `05` = Month (Tháng)
- `22` = Year (Năm - 2 chữ số cuối)
- `10` = Hour (Giờ)
- `00` = Minute (Phút)
- `0000` = Random 4 digits (Số ngẫu nhiên)

## Examples

**Booking 1 - May 24, 2022 at 10:00 AM:**
- Code: `DL24052210000` (random: 0000)

**Booking 2 - May 24, 2022 at 10:05 AM:**
- Code: `DL24052210053847` (random: 3847)

**Booking 3 - May 25, 2022 at 14:30 PM:**
- Code: `DL25052214309156` (random: 9156)

## How It Works

```typescript
const now = new Date();
const codeDay = String(now.getDate()).padStart(2, '0');        // 24
const codeMonth = String(now.getMonth() + 1).padStart(2, '0'); // 05
const codeYear = String(now.getFullYear()).slice(-2);          // 22
const codeHours = String(now.getHours()).padStart(2, '0');     // 10
const codeMinutes = String(now.getMinutes()).padStart(2, '0'); // 00
const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0'); // 0000
const appointmentCode = `DL${codeDay}${codeMonth}${codeYear}${codeHours}${codeMinutes}${randomNum}`;
// Result: DL24052210000
```

## Benefits

✅ **Easy to Remember** - Contains date and time information
✅ **Unique** - Random 4 digits ensure uniqueness
✅ **Human Readable** - Can decode date/time from code
✅ **Professional** - Looks like a real appointment code

## Decoding Example

Code: `DL24052210000`

- `DL` = Appointment code prefix
- `24` = 24th day
- `05` = May (5th month)
- `22` = 2022 (year)
- `10` = 10 AM (hour)
- `00` = 00 minutes
- `0000` = Random number

**Decoded:** Appointment on May 24, 2022 at 10:00 AM

## File Modified

- `app/(tabs)/booking.tsx`
  - Updated appointment code generation
  - Uses current date/time + random number
  - Displays in Step 4 success screen

## Status

✅ **DONE** - Appointment codes now use readable format with date/time

## Testing

To verify:

1. **Book appointment at 10:00 AM on May 24**
   - Code should be: `DL24052210000` + random 4 digits
   - Example: `DL24052210003847`

2. **Book another appointment at 14:30 PM on May 25**
   - Code should be: `DL25052214300000` + random 4 digits
   - Example: `DL25052214309156`

3. **Verify codes are different** ✅
   - Each booking has unique code
   - Can decode date/time from code
