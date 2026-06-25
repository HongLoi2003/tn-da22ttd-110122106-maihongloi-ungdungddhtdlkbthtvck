#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix ai-chat.tsx structure by removing misplaced JSX code
"""

# Read the file
with open('app/ai-chat.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the problematic section
# The issue is after getSpecialtyIcon function, there's misplaced JSX
# We need to remove from line ~1073 to ~1224 (the misplaced JSX block)
# And add the handleAction function properly

lines = content.split('\n')

# Find where getSpecialtyIcon ends
icon_func_end = -1
for i, line in enumerate(lines):
    if "return iconMap[specialtyName] || '⚕️';" in line:
        icon_func_end = i + 2  # +2 to skip the closing brace
        break

# Find where the return statement for the component starts
return_start = -1
for i in range(icon_func_end if icon_func_end > 0 else 0, len(lines)):
    if i > icon_func_end + 500:  # Safety limit
        break
    if lines[i].strip().startswith('if (loading)'):
        return_start = i
        break

print(f"Icon function ends at line: {icon_func_end}")
print(f"Return/loading check starts at line: {return_start}")

if icon_func_end > 0 and return_start > icon_func_end:
    # We found the problematic section
    # Insert the handleAction function between them
    handleAction_code = '''
  const handleAction = async (action: string) => {
    if (action === 'suggest_doctor') {
      // Tìm tin nhắn MỚI NHẤT có chuyên khoa (tìm từ cuối lên đầu)
      const messageWithSpecialty = [...messages].reverse().find(m => m.specialties && m.specialties.length > 0);
      
      if (messageWithSpecialty && messageWithSpecialty.specialties) {
        const topSpecialty = messageWithSpecialty.specialties[0].name;
        console.log('🔍 Top specialty from AI:', topSpecialty);
        // Chuyển đến trang bác sĩ với filter chuyên khoa
        router.push({
          pathname: '/all-doctors',
          params: { specialty: topSpecialty }
        });
      } else {
        router.push('/all-doctors');
      }
    } else if (action === 'more_info') {
      // Bắt đầu follow-up mode
      const messageWithSpecialty = [...messages].reverse().find(m => m.specialties && m.specialties.length > 0);
      
      if (messageWithSpecialty && messageWithSpecialty.specialties) {
        const topSpecialty = messageWithSpecialty.specialties[0];
        const specialtyKey = specialtyNameToKey[topSpecialty.name];
        
        if (specialtyKey) {
          // Khởi tạo follow-up state
          setCurrentSpecialty(specialtyKey);
          setFollowUpMode(true);
          setQuestionCount(0);
          setAskedQuestions([]);
          
          // Khởi tạo điểm ban đầu
          const initialScore: { [key: string]: number } = {};
          initialScore[specialtyKey] = topSpecialty.match * 0.1; // Convert % to score
          setSymptomScore(initialScore);
          
          // Lưu tin nhắn user
          const userMessage: Message = {
            id: Date.now().toString(),
            text: 'Tôi muốn tư vấn thêm về triệu chứng',
            isUser: true,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prev => [...prev, userMessage]);
          
          await createDocument('ai-messages', {
            conversationId,
            text: userMessage.text,
            isUser: true,
            createdAt: new Date()
          });
          
          // Lấy câu hỏi đầu tiên
          const questions = getFollowUpQuestions(specialtyKey, [], 1);
          
          if (questions.length > 0) {
            const firstQuestion = questions[0];
            
            setTimeout(() => {
              const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: firstQuestion.question,
                isUser: false,
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                followUpQuestion: firstQuestion,
                quickReplies: ['Có', 'Không', 'Không chắc'], // Thêm quick replies
                isFollowUp: true,
              };
              
              setMessages(prev => [...prev, aiMessage]);
              setAskedQuestions([firstQuestion.id]);
              setQuestionCount(1); // Đã hỏi câu đầu tiên
              
              // Lưu vào Firebase
              createDocument('ai-messages', {
                conversationId,
                text: aiMessage.text,
                isUser: false,
                isFollowUp: true,
                questionId: firstQuestion.id,
                createdAt: new Date()
              });
            }, 500);
          }
        }
      }
    }
  };
'''
    
    # Rebuild the file
    new_lines = lines[:icon_func_end] + [handleAction_code] + lines[return_start:]
    new_content = '\n'.join(new_lines)
    
    # Write the fixed file
    with open('app/ai-chat-fixed.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Fixed file written to app/ai-chat-fixed.tsx")
    print(f"Removed {return_start - icon_func_end} lines of misplaced code")
else:
    print("Could not find the problematic section")
