# Read the backup file
$content = Get-Content "app/ai-chat.tsx.backup" -Raw

# Find and remove the misplaced JSX code
# The pattern is: after "return iconMap[specialtyName] || '⚕️';" and before "const handleAction"
# We need to remove the JSX that starts with "<TouchableOpacity" 

$pattern = '(?s)(return iconMap\[specialtyName\] \|\| ''⚕️'';[\s\r\n]+  };)(.*?)(const handleAction = async)'

$replacement = '$1' + "`r`n`r`n  " + '$3'

$fixed = $content -replace $pattern, $replacement

# Write the fixed content
Set-Content "app/ai-chat.tsx" -Value $fixed -Encoding UTF8

Write-Host "File fixed and written to app/ai-chat.tsx"
