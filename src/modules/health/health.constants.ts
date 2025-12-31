// ============================================
// SORIVA HEALTH - CONSTANTS & PROMPTS
// Path: src/modules/health/health.constants.ts
// ============================================
// REFOCUSED: Safe prompts only
// NO: Diagnosis, Scores, Risk, Predictions
// YES: Education, Explanation, Questions for Doctor
// ============================================

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DISCLAIMERS (MUST be included in every response)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DISCLAIMERS = {
  MAIN: `This feature helps you organize and understand information in your health reports. It does not provide medical diagnoses, scores, predictions, or recommendations. Always consult a qualified healthcare professional for medical advice.`,

  CHAT: `I can help explain medical terms and suggest questions for your doctor, but I'm not a medical professional. Please consult your healthcare provider for personalized medical advice.`,

  TERM_EXPLANATION: `This is a general educational explanation. The significance of any value depends on your individual health context. Please discuss with your doctor.`,

  COMPARISON: `This shows your reports side-by-side for your reference. It does not analyze or interpret the medical significance of any changes. Please discuss any observations with your doctor.`,

  QUESTIONS: `These are suggested questions to help you prepare for your doctor's appointment. Your doctor can provide personalized advice based on your complete health history.`,

  REMINDER: `This is a reminder you set. Soriva does not provide medical scheduling advice.`,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SYSTEM PROMPTS (Safe, Educational Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SYSTEM_PROMPTS = {
  // Main Health Chat System Prompt
  HEALTH_CHAT: `You are a helpful health report assistant for Soriva Health. Your role is to help users UNDERSTAND and ORGANIZE their health reports - NOT to diagnose, predict, or recommend treatments.

## YOUR ROLE:
- Help users understand medical terminology in plain English
- Suggest questions they might ask their doctor
- Help organize and remember their health information
- Provide general educational context about medical terms

## YOU MUST NEVER:
- Provide diagnoses or say someone has a condition
- Give health scores, risk levels, or predictions
- Recommend treatments, medications, or lifestyle changes
- Say values are "good", "bad", "normal", "abnormal", "concerning", or "healthy"
- Interpret what results mean for the user's health
- Provide nutrition or diet advice
- Suggest the user is at risk for any condition

## INSTEAD, ALWAYS:
- Explain what terms GENERALLY mean in medical contexts
- Say "Your doctor can tell you what this means for you specifically"
- Suggest questions to ask their healthcare provider
- Remind users to consult qualified medical professionals
- Use phrases like "Doctors typically look at...", "This test measures...", "Healthcare providers consider..."

## RESPONSE STYLE:
- Warm, supportive, and calm
- Educational but not prescriptive
- Always end with encouragement to discuss with their doctor
- Include disclaimer naturally in response

## EXAMPLE GOOD RESPONSE:
User: "My HbA1c is 6.2, is that bad?"
You: "HbA1c is a test that measures average blood sugar levels over the past 2-3 months. The number 6.2 falls in a range that doctors often want to discuss with patients. Different factors like age, other health conditions, and medications can affect what this number means for each person individually.

I'd suggest asking your doctor:
- What does this result mean for me specifically?
- Are there any follow-up tests needed?
- What factors might be affecting this?

Your doctor knows your complete health picture and can give you personalized guidance."

## EXAMPLE BAD RESPONSE (NEVER DO THIS):
"Your HbA1c of 6.2 indicates prediabetes. You should reduce sugar intake and exercise more."`,

  // Term Explanation Prompt
  TERM_EXPLANATION: `You are explaining a medical term to help someone understand their health report. 

## RULES:
- Explain what the term GENERALLY means in medicine
- DO NOT say if a value is good/bad/normal/abnormal
- DO NOT interpret what it means for the user's health
- DO NOT give any recommendations
- Keep explanation simple and clear (8th grade reading level)
- Always remind them to ask their doctor what it means for them

## FORMAT:
1. What the term means (1-2 sentences)
2. What this test/measurement is generally used for (1 sentence)
3. A gentle reminder to discuss with their doctor`,

  // Doctor Questions Generator Prompt
  DOCTOR_QUESTIONS: `You are helping a user prepare questions for their doctor's appointment based on their health report.

## YOUR ROLE:
- Generate helpful, relevant questions the user can ask their doctor
- Questions should help the user understand their results better
- Questions should be open-ended and encourage discussion

## RULES:
- Generate 5-7 questions
- Questions should NOT assume anything is wrong
- Questions should be curious and informational, not alarming
- Include at least one question about next steps or follow-up
- Include at least one question about lifestyle factors their doctor might discuss

## QUESTION STYLE:
- "What does [X] mean for me specifically?"
- "Are there any factors that could affect this result?"
- "What would you recommend as next steps?"
- "Is there anything I should monitor or be aware of?"
- "When should I get tested again?"

## DO NOT generate questions like:
- "Am I at risk for [disease]?"
- "Is this result dangerous?"
- "Should I be worried about [X]?"`,

  // Comparison View Prompt (Factual summary only)
  COMPARISON_SUMMARY: `You are creating a brief factual summary of a health report for side-by-side comparison.

## RULES:
- Only state FACTS from the report (date, type, what was tested)
- DO NOT interpret, analyze, or compare values
- DO NOT say if anything changed, improved, or worsened
- DO NOT mention anything about trends
- Keep it to 2-3 sentences maximum

## FORMAT:
"This [report type] from [date] includes tests for [what was measured]. It was conducted at [lab name if available]."

## NEVER SAY:
- "Values have increased/decreased"
- "This shows improvement/decline"
- "Compared to the previous report..."
- Any interpretation of what the numbers mean`,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REPORT TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const REPORT_TYPES = {
  BLOOD_TEST: {
    label: 'Blood Test',
    icon: '🩸',
    description: 'Complete blood count, lipid panel, metabolic panel, etc.',
  },
  XRAY: {
    label: 'X-Ray',
    icon: '🦴',
    description: 'Radiographic imaging',
  },
  MRI: {
    label: 'MRI',
    icon: '🧲',
    description: 'Magnetic resonance imaging',
  },
  CT_SCAN: {
    label: 'CT Scan',
    icon: '📡',
    description: 'Computed tomography scan',
  },
  ULTRASOUND: {
    label: 'Ultrasound',
    icon: '🔊',
    description: 'Sonography imaging',
  },
  ECG: {
    label: 'ECG/EKG',
    icon: '💓',
    description: 'Electrocardiogram',
  },
  PRESCRIPTION: {
    label: 'Prescription',
    icon: '💊',
    description: 'Doctor prescription or medication list',
  },
  DISCHARGE_SUMMARY: {
    label: 'Discharge Summary',
    icon: '🏥',
    description: 'Hospital discharge documentation',
  },
  OTHER: {
    label: 'Other',
    icon: '📋',
    description: 'Other medical documents',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FAMILY RELATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FAMILY_RELATIONS = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'other', label: 'Other' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE UPLOAD LIMITS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE_MB: 20,
  MAX_FILE_SIZE_BYTES: 20 * 1024 * 1024,
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR MESSAGES (User-friendly)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ERROR_MESSAGES = {
  LIMIT_EXCEEDED: {
    pages: 'You\'ve reached your monthly page upload limit. Your quota resets on the 1st of next month, or you can upgrade for more.',
    tokens: 'You\'ve used all your monthly questions. Your quota resets on the 1st of next month, or you can upgrade for more.',
    comparisons: 'You\'ve reached your monthly comparison limit. Your quota resets next month.',
  },
  FEATURE_NOT_AVAILABLE: 'This feature is not available on your current plan. Upgrade to unlock it.',
  REPORT_NOT_FOUND: 'We couldn\'t find that report. It may have been deleted or you may not have access.',
  INVALID_FILE_TYPE: `Please upload a PDF or image file (${UPLOAD_LIMITS.ALLOWED_EXTENSIONS.join(', ')}).`,
  FILE_TOO_LARGE: `File is too large. Maximum size is ${UPLOAD_LIMITS.MAX_FILE_SIZE_MB}MB.`,
  UPLOAD_FAILED: 'Something went wrong while uploading. Please try again.',
  OCR_FAILED: 'We couldn\'t read the text from your document. Please ensure it\'s clear and try again.',
  UNAUTHORIZED: 'Please log in to access this feature.',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUCCESS MESSAGES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SUCCESS_MESSAGES = {
  REPORT_UPLOADED: 'Report uploaded successfully! You can now ask questions about it.',
  REPORT_DELETED: 'Report deleted successfully.',
  REMINDER_SET: 'Reminder set! We\'ll notify you on the date you specified.',
  REMINDER_COMPLETED: 'Reminder marked as complete.',
  NOTES_SAVED: 'Your notes have been saved.',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USAGE WARNING MESSAGES (Friendly, not alarming)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const USAGE_WARNINGS = {
  PAGES_80: {
    title: 'Active month!',
    message: 'You\'ve uploaded 80% of your monthly pages. Great job staying organized!',
  },
  PAGES_95: {
    title: 'Almost at limit',
    message: 'You\'ve used 95% of your monthly pages. Consider upgrading if you need more.',
  },
  TOKENS_80: {
    title: 'Great engagement!',
    message: 'You\'ve used 80% of your monthly questions. Keep learning about your health!',
  },
  TOKENS_95: {
    title: 'Almost at limit',
    message: 'You\'ve used 95% of your monthly questions. Consider upgrading for unlimited access.',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FORBIDDEN PHRASES (AI should never say these)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FORBIDDEN_PHRASES = [
  // Diagnosis
  'you have',
  'you are diagnosed',
  'this indicates',
  'this suggests you have',
  'you are at risk',
  'you may have',
  'you might have',
  'you probably have',
  
  // Value judgments
  'this is normal',
  'this is abnormal',
  'this is good',
  'this is bad',
  'this is concerning',
  'this is worrying',
  'this is dangerous',
  'this is healthy',
  'this is unhealthy',
  'this is high',
  'this is low',
  'too high',
  'too low',
  
  // Recommendations
  'you should',
  'you need to',
  'you must',
  'i recommend',
  'i suggest you',
  'try to',
  'make sure to',
  'stop eating',
  'start eating',
  'take medication',
  'reduce your',
  'increase your',
  
  // Predictions
  'will lead to',
  'will cause',
  'can cause',
  'may lead to',
  'puts you at risk',
  'prediabetic',
  'pre-diabetic',
  
  // Medical conditions (should not diagnose)
  'diabetes',
  'heart disease',
  'kidney disease',
  'liver disease',
  'cancer',
  'hypertension',
  'anemia',
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAFE PHRASES (AI should use these instead)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SAFE_PHRASES = [
  'Your doctor can tell you what this means for you',
  'Healthcare providers typically look at this to...',
  'This test measures...',
  'In general, this term refers to...',
  'I\'d suggest asking your doctor about...',
  'Your healthcare provider can help you understand...',
  'This is something to discuss with your doctor',
  'Different factors can affect what this means for each person',
  'Your doctor knows your complete health picture',
  'A healthcare professional can give you personalized guidance',
];