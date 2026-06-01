# Sửa Lỗi Hermes Private Properties

## Vấn Đề
```
error: private properties are not supported
#x; #y; #width; #height;
```

## Nguyên Nhân
Một dependency đang dùng private class properties (`#property`) mà Hermes chưa hỗ trợ đầy đủ.

## Giải Pháp

### Option 1: Build Không Dùng Hermes Bytecode (Khuyến nghị)
Thêm vào `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease",
        "env": {
          "EXPO_NO_BYTECODE": "1"
        }
      }
    }
  }
}
```

### Option 2: Tắt Hermes (Không khuyến nghị)
Trong `android/gradle.properties`:
```properties
hermesEnabled=false
```

### Option 3: Update Dependencies
```bash
# Update tất cả dependencies
npm update

# Hoặc update Expo SDK
npx expo install --fix
```

## Hành Động

Đang thử Option 1 - Build với EXPO_NO_BYTECODE=1
