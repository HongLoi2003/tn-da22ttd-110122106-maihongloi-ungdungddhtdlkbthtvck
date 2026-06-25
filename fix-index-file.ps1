# Script để fix index.tsx bị corrupt

Write-Host "🔧 Fixing corrupted index.tsx..." -ForegroundColor Cyan

# Read file content
$content = Get-Content "app/(tabs)/index.tsx" -Raw

# Remove the corrupted duplicate section (lines 439-479)
# This section was accidentally injected between ArticleCard and return statement

$pattern = @'
  \);

          <View style=\{styles\.bannerImageContainer\}>
            <View style=\{styles\.bannerImageBackground\} />
            <Image
              source=\{require\('@/assets/images/bacsi\.png'\)\}
              style=\{styles\.bannerImage\}
            />
          </View>tyle=\{styles\.headerLeft\}>
'@

$replacement = @'
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
'@

$content = $content -replace [regex]::Escape($pattern), $replacement

# Save fixed content
$content | Out-File -FilePath "app/(tabs)/index.tsx" -Encoding utf8 -NoNewline

Write-Host "✅ File fixed! Please check for any remaining errors." -ForegroundColor Green
