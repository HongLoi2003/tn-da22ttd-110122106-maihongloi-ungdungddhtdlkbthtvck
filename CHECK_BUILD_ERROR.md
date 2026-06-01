# Build Failed - Cần Kiểm Tra

## Lỗi
```
Android build failed:
Unknown error. See logs of the Bundle JavaScript build phase for more information.
```

## Link Build
https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds/f8dcf539-a09f-4c70-a99d-50aa093bd8faa

## Cách Kiểm Tra

1. Mở link build ở trên
2. Tìm phase "Bundle JavaScript" (màu đỏ)
3. Click để xem log chi tiết
4. Tìm error message cụ thể

## Nguyên Nhân Có Thể

### 1. JavaScript Bundle Error
- Syntax error trong code
- Import/export không đúng
- Missing dependencies

### 2. Metro Bundler Error
- Cache issues
- File không tìm thấy
- Circular dependencies

### 3. TypeScript Error
- Type errors
- Missing types

## Cách Sửa

### Bước 1: Test Local
```bash
# Test bundle local
npx expo export --platform android

# Nếu có lỗi, sẽ thấy ngay
```

### Bước 2: Check Diagnostics
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check linting
npm run lint
```

### Bước 3: Clear Cache và Build Lại
```bash
# Clear cache
npx expo start --clear

# Build lại
npx eas-cli build --platform android --profile production --clear-cache
```

## Hành Động Tiếp Theo

1. Xem log chi tiết trên link build
2. Copy error message cụ thể
3. Sửa lỗi trong code
4. Build lại
