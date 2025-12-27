  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * SORIVA - ASSIGNMENT TEMPLATES CONFIGURATION
   * Document Type: Academic Assignments (Homework, Lab Reports, Case Studies, etc.)
   * Templates: 6 variants (Homework, Lab Report, Case Study, Research, Worksheet, Group)
   * ═══════════════════════════════════════════════════════════════════════════════
   */

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 1: TYPE DEFINITIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Field Types for Form Fields
   */
  export type FieldType =
    | 'text'
    | 'textarea'
    | 'textarea-list'
    | 'number'
    | 'date'
    | 'email'
    | 'url'
    | 'tel'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'radio'
    | 'color'
    | 'file'
    | 'image'
    | 'complex'
    | 'array'
    | 'object'
    | 'rich-text'
    | 'markdown';

  /**
   * Assignment Template Variants
   */
  export type AssignmentTemplateType =
    | 'homework'      // Standard homework assignment
    | 'lab-report'    // Science/Engineering lab reports
    | 'case-study'    // Business/Medical case studies
    | 'research'      // Research-based assignments
    | 'worksheet'     // Fill-in worksheet style
    | 'group';        // Group/Team assignments

  /**
   * Question Types for Assignments
   */
  export type QuestionType =
    | 'short-answer'
    | 'long-answer'
    | 'multiple-choice'
    | 'true-false'
    | 'fill-blank'
    | 'matching'
    | 'numerical'
    | 'diagram'
    | 'code'
    | 'essay';

  /**
   * Lab Report Sections
   */
  export type LabSection =
    | 'objective'
    | 'hypothesis'
    | 'materials'
    | 'procedure'
    | 'observations'
    | 'data'
    | 'calculations'
    | 'results'
    | 'analysis'
    | 'conclusion'
    | 'sources-of-error'
    | 'references';

  /**
   * Case Study Components
   */
  export type CaseStudySection =
    | 'executive-summary'
    | 'background'
    | 'problem-statement'
    | 'analysis'
    | 'alternatives'
    | 'recommendation'
    | 'implementation'
    | 'conclusion';

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 2: INTERFACES
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Question/Problem Structure
   */
  export interface AssignmentQuestion {
    questionNumber: number | string;
    questionText: string;
    questionType?: QuestionType;
    marks?: number;
    answer?: string;
    workings?: string[];           // Step-by-step solution
    diagram?: string;              // Diagram URL or base64
    code?: {
      language?: string;
      snippet: string;
      output?: string;
    };
    subQuestions?: {
      label: string;               // a, b, c or i, ii, iii
      text: string;
      answer?: string;
      marks?: number;
    }[];
  }

  /**
   * Lab Report Data Table
   */
  export interface LabDataTable {
    title?: string;
    headers: string[];
    rows: (string | number)[][];
    units?: string[];
    caption?: string;
  }

  /**
   * Lab Report Observation
   */
  export interface LabObservation {
    step: number;
    observation: string;
    inference?: string;
  }

  /**
   * Case Study Alternative
   */
  export interface CaseAlternative {
    option: string;
    description: string;
    pros: string[];
    cons: string[];
    feasibility?: 'high' | 'medium' | 'low';
  }

  /**
   * Group Member Information
   */
  export interface GroupMember {
    name: string;
    rollNumber?: string;
    role?: string;
    contribution?: string;
    contributionPercentage?: number;
  }

  /**
   * Assignment Rubric Criteria
   */
  export interface RubricCriteria {
    criterion: string;
    maxMarks: number;
    description?: string;
    achievedMarks?: number;
  }

  /**
   * Main Assignment Data Interface
   */
  export interface AssignmentData {
    // ─────────────────────────────────────────────────────────────
    // METADATA
    // ─────────────────────────────────────────────────────────────
    templateType: AssignmentTemplateType;
    title: string;
    titleHindi?: string;
    subtitle?: string;
    
    // ─────────────────────────────────────────────────────────────
    // STUDENT INFO
    // ─────────────────────────────────────────────────────────────
    studentName: string;
    rollNumber?: string;
    registrationNumber?: string;
    class?: string;
    section?: string;
    semester?: string;
    batch?: string;
    
    // ─────────────────────────────────────────────────────────────
    // COURSE INFO
    // ─────────────────────────────────────────────────────────────
    subject: string;
    subjectCode?: string;
    course?: string;
    courseCode?: string;
    topic?: string;
    chapter?: string;
    unit?: string;
    
    // ─────────────────────────────────────────────────────────────
    // INSTITUTION INFO
    // ─────────────────────────────────────────────────────────────
    institution: string;
    institutionLogo?: string;
    department?: string;
    faculty?: string;
    
    // ─────────────────────────────────────────────────────────────
    // INSTRUCTOR INFO
    // ─────────────────────────────────────────────────────────────
    instructor?: string;
    instructorDesignation?: string;
    submittedTo?: string;
    
    // ─────────────────────────────────────────────────────────────
    // DATES & DEADLINES
    // ─────────────────────────────────────────────────────────────
    assignedDate?: string;
    dueDate?: string;
    submissionDate?: string;
    
    // ─────────────────────────────────────────────────────────────
    // ASSIGNMENT DETAILS
    // ─────────────────────────────────────────────────────────────
    assignmentNumber?: number | string;
    totalMarks?: number;
    obtainedMarks?: number;
    weightage?: string;              // e.g., "10% of final grade"
    duration?: string;               // For timed assignments
    
    // ─────────────────────────────────────────────────────────────
    // QUESTIONS & ANSWERS (Homework/Worksheet)
    // ─────────────────────────────────────────────────────────────
    instructions?: string[];
    questions?: AssignmentQuestion[];
    
    // ─────────────────────────────────────────────────────────────
    // LAB REPORT SPECIFIC
    // ─────────────────────────────────────────────────────────────
    labReport?: {
      experimentNumber?: number | string;
      experimentTitle: string;
      experimentDate?: string;
      aim?: string;
      objective?: string;
      hypothesis?: string;
      apparatus?: string[];
      materials?: string[];
      chemicals?: string[];
      theory?: string;
      principle?: string;
      procedure?: string[];
      precautions?: string[];
      observations?: LabObservation[];
      dataTable?: LabDataTable;
      dataTables?: LabDataTable[];
      calculations?: string[];
      formulaUsed?: string[];
      result?: string;
      analysis?: string;
      conclusion?: string;
      sourcesOfError?: string[];
      improvements?: string[];
      applications?: string[];
      vivaQuestions?: {
        question: string;
        answer?: string;
      }[];
    };
    
    // ─────────────────────────────────────────────────────────────
    // CASE STUDY SPECIFIC
    // ─────────────────────────────────────────────────────────────
    caseStudy?: {
      companyName?: string;
      industry?: string;
      location?: string;
      timePeriod?: string;
      executiveSummary?: string;
      background?: string;
      context?: string;
      problemStatement?: string;
      objectives?: string[];
      stakeholders?: {
        name: string;
        role: string;
        interest?: string;
      }[];
      swotAnalysis?: {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
      };
      analysis?: string;
      keyIssues?: string[];
      alternatives?: CaseAlternative[];
      recommendation?: {
        chosen: string;
        justification: string;
        implementation?: string[];
      };
      conclusion?: string;
      learnings?: string[];
      discussionQuestions?: string[];
    };
    
    // ─────────────────────────────────────────────────────────────
    // RESEARCH ASSIGNMENT SPECIFIC
    // ─────────────────────────────────────────────────────────────
    research?: {
      researchQuestion?: string;
      hypothesis?: string;
      methodology?: string;
      literatureReview?: {
        source: string;
        summary: string;
        relevance?: string;
      }[];
      findings?: string[];
      dataAnalysis?: string;
      limitations?: string[];
      conclusion?: string;
      futureScope?: string;
    };
    
    // ─────────────────────────────────────────────────────────────
    // GROUP ASSIGNMENT SPECIFIC
    // ─────────────────────────────────────────────────────────────
    groupAssignment?: {
      groupName?: string;
      groupNumber?: number | string;
      teamLeader?: string;
      members: GroupMember[];
      taskDistribution?: {
        task: string;
        assignedTo: string;
        status?: 'completed' | 'in-progress' | 'pending';
      }[];
      meetingLog?: {
        date: string;
        attendees: string[];
        discussion: string;
        decisions?: string[];
      }[];
      peerEvaluation?: boolean;
    };
    
    // ─────────────────────────────────────────────────────────────
    // CONTENT SECTIONS (Generic)
    // ─────────────────────────────────────────────────────────────
    introduction?: string;
    body?: string | string[];
    methodology?: string;
    findings?: string[];
    discussion?: string;
    conclusion?: string;
    
    // ─────────────────────────────────────────────────────────────
    // REFERENCES & CITATIONS
    // ─────────────────────────────────────────────────────────────
    references?: string[];
    bibliography?: string[];
    citations?: {
      authors?: string[];
      title: string;
      year?: string | number;
      source?: string;
      url?: string;
      accessDate?: string;
    }[];
    citationStyle?: 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE';
    
    // ─────────────────────────────────────────────────────────────
    // RUBRIC & GRADING
    // ─────────────────────────────────────────────────────────────
    rubric?: RubricCriteria[];
    feedback?: string;
    grade?: string;
    
    // ─────────────────────────────────────────────────────────────
    // APPENDIX & ATTACHMENTS
    // ─────────────────────────────────────────────────────────────
    appendix?: {
      label: string;
      title: string;
      content?: string;
      imageUrl?: string;
    }[];
    
    // ─────────────────────────────────────────────────────────────
    // STYLING OPTIONS
    // ─────────────────────────────────────────────────────────────
    accentColor?: string;
    showMarks?: boolean;
    showAnswers?: boolean;
    showWorkings?: boolean;
    showRubric?: boolean;
    showPageNumbers?: boolean;
    
    // ─────────────────────────────────────────────────────────────
    // DECLARATION
    // ─────────────────────────────────────────────────────────────
    declaration?: string;
    signature?: string;
    signatureDate?: string;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 3: FIELD DEFINITIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  export const ASSIGNMENT_FIELD_DEFINITIONS: Record<string, {
    type: FieldType;
    label: string;
    labelHindi?: string;
    placeholder?: string;
    required?: boolean;
    category: string;
    templateTypes?: AssignmentTemplateType[];
    validation?: {
      minLength?: number;
      maxLength?: number;
      pattern?: string;
    };
  }> = {
    // ─────────────────────────────────────────────────────────────
    // METADATA FIELDS
    // ─────────────────────────────────────────────────────────────
    templateType: {
      type: 'select',
      label: 'Template Type',
      labelHindi: 'टेम्पलेट प्रकार',
      required: true,
      category: 'metadata'
    },
    title: {
      type: 'text',
      label: 'Assignment Title',
      labelHindi: 'असाइनमेंट शीर्षक',
      placeholder: 'e.g., Physics Assignment - Wave Motion',
      required: true,
      category: 'metadata'
    },
    subtitle: {
      type: 'text',
      label: 'Subtitle',
      labelHindi: 'उपशीर्षक',
      placeholder: 'e.g., Chapter 5: Oscillations',
      category: 'metadata'
    },

    // ─────────────────────────────────────────────────────────────
    // STUDENT INFO FIELDS
    // ─────────────────────────────────────────────────────────────
    studentName: {
      type: 'text',
      label: 'Student Name',
      labelHindi: 'छात्र का नाम',
      placeholder: 'Your full name',
      required: true,
      category: 'student'
    },
    rollNumber: {
      type: 'text',
      label: 'Roll Number',
      labelHindi: 'रोल नंबर',
      placeholder: 'e.g., 2024CSE001',
      category: 'student'
    },
    registrationNumber: {
      type: 'text',
      label: 'Registration Number',
      labelHindi: 'पंजीकरण संख्या',
      placeholder: 'University registration number',
      category: 'student'
    },
    class: {
      type: 'text',
      label: 'Class',
      labelHindi: 'कक्षा',
      placeholder: 'e.g., 12th, B.Tech 3rd Year',
      category: 'student'
    },
    section: {
      type: 'text',
      label: 'Section',
      labelHindi: 'अनुभाग',
      placeholder: 'e.g., A, B, C',
      category: 'student'
    },
    semester: {
      type: 'text',
      label: 'Semester',
      labelHindi: 'सेमेस्टर',
      placeholder: 'e.g., 5th Semester',
      category: 'student'
    },

    // ─────────────────────────────────────────────────────────────
    // COURSE INFO FIELDS
    // ─────────────────────────────────────────────────────────────
    subject: {
      type: 'text',
      label: 'Subject',
      labelHindi: 'विषय',
      placeholder: 'e.g., Physics, Computer Science',
      required: true,
      category: 'course'
    },
    subjectCode: {
      type: 'text',
      label: 'Subject Code',
      labelHindi: 'विषय कोड',
      placeholder: 'e.g., PHY101, CS301',
      category: 'course'
    },
    topic: {
      type: 'text',
      label: 'Topic',
      labelHindi: 'विषय',
      placeholder: 'Specific topic covered',
      category: 'course'
    },
    chapter: {
      type: 'text',
      label: 'Chapter',
      labelHindi: 'अध्याय',
      placeholder: 'e.g., Chapter 5',
      category: 'course'
    },

    // ─────────────────────────────────────────────────────────────
    // INSTITUTION FIELDS
    // ─────────────────────────────────────────────────────────────
    institution: {
      type: 'text',
      label: 'Institution Name',
      labelHindi: 'संस्थान का नाम',
      placeholder: 'Your school/college/university',
      required: true,
      category: 'institution'
    },
    department: {
      type: 'text',
      label: 'Department',
      labelHindi: 'विभाग',
      placeholder: 'e.g., Department of Computer Science',
      category: 'institution'
    },

    // ─────────────────────────────────────────────────────────────
    // INSTRUCTOR FIELDS
    // ─────────────────────────────────────────────────────────────
    instructor: {
      type: 'text',
      label: 'Instructor Name',
      labelHindi: 'प्रशिक्षक का नाम',
      placeholder: 'e.g., Dr. Sharma',
      category: 'instructor'
    },
    submittedTo: {
      type: 'text',
      label: 'Submitted To',
      labelHindi: 'जमा करने वाले',
      placeholder: 'Faculty name for submission',
      category: 'instructor'
    },

    // ─────────────────────────────────────────────────────────────
    // DATE FIELDS
    // ─────────────────────────────────────────────────────────────
    assignedDate: {
      type: 'date',
      label: 'Assigned Date',
      labelHindi: 'निर्धारित तिथि',
      category: 'dates'
    },
    dueDate: {
      type: 'date',
      label: 'Due Date',
      labelHindi: 'जमा करने की तिथि',
      category: 'dates'
    },
    submissionDate: {
      type: 'date',
      label: 'Submission Date',
      labelHindi: 'जमा तिथि',
      category: 'dates'
    },

    // ─────────────────────────────────────────────────────────────
    // ASSIGNMENT DETAILS
    // ─────────────────────────────────────────────────────────────
    assignmentNumber: {
      type: 'text',
      label: 'Assignment Number',
      labelHindi: 'असाइनमेंट संख्या',
      placeholder: 'e.g., 1, 2, 3',
      category: 'details'
    },
    totalMarks: {
      type: 'number',
      label: 'Total Marks',
      labelHindi: 'कुल अंक',
      placeholder: 'e.g., 100',
      category: 'details'
    },
    instructions: {
      type: 'textarea-list',
      label: 'Instructions',
      labelHindi: 'निर्देश',
      placeholder: 'Assignment instructions...',
      category: 'details'
    },

    // ─────────────────────────────────────────────────────────────
    // LAB REPORT FIELDS
    // ─────────────────────────────────────────────────────────────
    experimentNumber: {
      type: 'text',
      label: 'Experiment Number',
      labelHindi: 'प्रयोग संख्या',
      placeholder: 'e.g., Exp. 1',
      category: 'lab',
      templateTypes: ['lab-report']
    },
    experimentTitle: {
      type: 'text',
      label: 'Experiment Title',
      labelHindi: 'प्रयोग शीर्षक',
      placeholder: 'Title of the experiment',
      category: 'lab',
      templateTypes: ['lab-report']
    },
    aim: {
      type: 'textarea',
      label: 'Aim',
      labelHindi: 'उद्देश्य',
      placeholder: 'To determine/study/verify...',
      category: 'lab',
      templateTypes: ['lab-report']
    },
    hypothesis: {
      type: 'textarea',
      label: 'Hypothesis',
      labelHindi: 'परिकल्पना',
      placeholder: 'If... then... because...',
      category: 'lab',
      templateTypes: ['lab-report', 'research']
    },
    apparatus: {
      type: 'textarea-list',
      label: 'Apparatus Required',
      labelHindi: 'आवश्यक उपकरण',
      placeholder: 'List apparatus/equipment',
      category: 'lab',
      templateTypes: ['lab-report']
    },
    procedure: {
      type: 'textarea-list',
      label: 'Procedure',
      labelHindi: 'प्रक्रिया',
      placeholder: 'Step-by-step procedure',
      category: 'lab',
      templateTypes: ['lab-report']
    },
    observations: {
      type: 'complex',
      label: 'Observations',
      labelHindi: 'अवलोकन',
      category: 'lab',
      templateTypes: ['lab-report']
    },
    result: {
      type: 'textarea',
      label: 'Result',
      labelHindi: 'परिणाम',
      placeholder: 'Final result/outcome',
      category: 'lab',
      templateTypes: ['lab-report']
    },
    precautions: {
      type: 'textarea-list',
      label: 'Precautions',
      labelHindi: 'सावधानियाँ',
      placeholder: 'Safety precautions taken',
      category: 'lab',
      templateTypes: ['lab-report']
    },

    // ─────────────────────────────────────────────────────────────
    // CASE STUDY FIELDS
    // ─────────────────────────────────────────────────────────────
    companyName: {
      type: 'text',
      label: 'Company/Organization Name',
      labelHindi: 'कंपनी/संगठन का नाम',
      placeholder: 'e.g., Tata Motors',
      category: 'case-study',
      templateTypes: ['case-study']
    },
    industry: {
      type: 'text',
      label: 'Industry',
      labelHindi: 'उद्योग',
      placeholder: 'e.g., Automobile, Healthcare',
      category: 'case-study',
      templateTypes: ['case-study']
    },
    executiveSummary: {
      type: 'textarea',
      label: 'Executive Summary',
      labelHindi: 'कार्यकारी सारांश',
      placeholder: 'Brief overview of the case',
      category: 'case-study',
      templateTypes: ['case-study']
    },
    problemStatement: {
      type: 'textarea',
      label: 'Problem Statement',
      labelHindi: 'समस्या विवरण',
      placeholder: 'Core problem to be addressed',
      category: 'case-study',
      templateTypes: ['case-study']
    },
    swotAnalysis: {
      type: 'complex',
      label: 'SWOT Analysis',
      labelHindi: 'SWOT विश्लेषण',
      category: 'case-study',
      templateTypes: ['case-study']
    },
    recommendation: {
      type: 'textarea',
      label: 'Recommendation',
      labelHindi: 'सिफारिश',
      placeholder: 'Recommended solution',
      category: 'case-study',
      templateTypes: ['case-study']
    },

    // ─────────────────────────────────────────────────────────────
    // GROUP ASSIGNMENT FIELDS
    // ─────────────────────────────────────────────────────────────
    groupName: {
      type: 'text',
      label: 'Group/Team Name',
      labelHindi: 'समूह/टीम का नाम',
      placeholder: 'e.g., Team Alpha',
      category: 'group',
      templateTypes: ['group']
    },
    groupNumber: {
      type: 'text',
      label: 'Group Number',
      labelHindi: 'समूह संख्या',
      placeholder: 'e.g., Group 5',
      category: 'group',
      templateTypes: ['group']
    },
    teamLeader: {
      type: 'text',
      label: 'Team Leader',
      labelHindi: 'टीम लीडर',
      placeholder: 'Name of team leader',
      category: 'group',
      templateTypes: ['group']
    },
    members: {
      type: 'complex',
      label: 'Group Members',
      labelHindi: 'समूह के सदस्य',
      category: 'group',
      templateTypes: ['group']
    },

    // ─────────────────────────────────────────────────────────────
    // CONTENT FIELDS
    // ─────────────────────────────────────────────────────────────
    introduction: {
      type: 'textarea',
      label: 'Introduction',
      labelHindi: 'परिचय',
      placeholder: 'Introduction to the assignment',
      category: 'content'
    },
    conclusion: {
      type: 'textarea',
      label: 'Conclusion',
      labelHindi: 'निष्कर्ष',
      placeholder: 'Concluding remarks',
      category: 'content'
    },
    references: {
      type: 'textarea-list',
      label: 'References',
      labelHindi: 'संदर्भ',
      placeholder: 'List of references',
      category: 'content'
    },

    // ─────────────────────────────────────────────────────────────
    // STYLING FIELDS
    // ─────────────────────────────────────────────────────────────
    accentColor: {
      type: 'color',
      label: 'Accent Color',
      labelHindi: 'एक्सेंट रंग',
      category: 'styling'
    },
    showMarks: {
      type: 'checkbox',
      label: 'Show Marks',
      labelHindi: 'अंक दिखाएं',
      category: 'styling'
    },
    showAnswers: {
      type: 'checkbox',
      label: 'Show Answers',
      labelHindi: 'उत्तर दिखाएं',
      category: 'styling'
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 4: TEMPLATE CONFIGURATIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  export const ASSIGNMENT_TEMPLATE_CONFIGS: Record<AssignmentTemplateType, {
    name: string;
    nameHindi: string;
    description: string;
    icon: string;
    sections: string[];
    recommendedFor: string[];
  }> = {
    homework: {
      name: 'Homework Assignment',
      nameHindi: 'होमवर्क असाइनमेंट',
      description: 'Standard homework with questions and answers',
      icon: '📝',
      sections: ['header', 'instructions', 'questions', 'answers'],
      recommendedFor: ['School', 'Coaching', 'Self-study']
    },
    'lab-report': {
      name: 'Lab Report',
      nameHindi: 'प्रयोगशाला रिपोर्ट',
      description: 'Science/Engineering laboratory experiment report',
      icon: '🔬',
      sections: ['header', 'aim', 'apparatus', 'theory', 'procedure', 'observations', 'calculations', 'result', 'conclusion', 'precautions'],
      recommendedFor: ['Physics', 'Chemistry', 'Biology', 'Engineering']
    },
    'case-study': {
      name: 'Case Study',
      nameHindi: 'केस स्टडी',
      description: 'Business/Medical case analysis report',
      icon: '📊',
      sections: ['header', 'executive-summary', 'background', 'problem', 'analysis', 'swot', 'alternatives', 'recommendation', 'conclusion'],
      recommendedFor: ['MBA', 'Business', 'Medical', 'Law']
    },
    research: {
      name: 'Research Assignment',
      nameHindi: 'शोध असाइनमेंट',
      description: 'Research-based academic assignment',
      icon: '🔍',
      sections: ['header', 'introduction', 'literature-review', 'methodology', 'findings', 'analysis', 'conclusion', 'references'],
      recommendedFor: ['University', 'Post-graduate', 'Research scholars']
    },
    worksheet: {
      name: 'Worksheet',
      nameHindi: 'वर्कशीट',
      description: 'Fill-in worksheet style assignment',
      icon: '📋',
      sections: ['header', 'instructions', 'questions', 'answer-spaces'],
      recommendedFor: ['School', 'Competitive exams', 'Practice']
    },
    group: {
      name: 'Group Assignment',
      nameHindi: 'समूह असाइनमेंट',
      description: 'Team-based collaborative assignment',
      icon: '👥',
      sections: ['header', 'team-info', 'task-distribution', 'content', 'individual-contributions', 'conclusion'],
      recommendedFor: ['College projects', 'Team assignments', 'Collaborative work']
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 5: SAMPLE DATA
  // ═══════════════════════════════════════════════════════════════════════════════

  export const ASSIGNMENT_SAMPLE_DATA: Record<AssignmentTemplateType, Partial<AssignmentData>> = {
    homework: {
      templateType: 'homework',
      title: 'Physics Assignment - Wave Motion',
      studentName: 'Rahul Sharma',
      rollNumber: '2024PHY042',
      class: '12th Science',
      section: 'A',
      subject: 'Physics',
      subjectCode: 'PHY301',
      chapter: 'Chapter 14: Waves',
      institution: 'Delhi Public School, R.K. Puram',
      instructor: 'Dr. Anil Kumar',
      assignedDate: '2025-12-10',
      dueDate: '2025-12-17',
      assignmentNumber: '5',
      totalMarks: 25,
      instructions: [
        'Answer all questions in the given space.',
        'Show complete working for numerical problems.',
        'Draw neat labeled diagrams wherever required.',
        'Use only blue or black ink pen.'
      ],
      questions: [
        {
          questionNumber: 1,
          questionText: 'Define wave motion. Explain the difference between transverse and longitudinal waves with examples.',
          questionType: 'long-answer',
          marks: 5,
          answer: 'Wave motion is the transfer of energy through a medium without the permanent displacement of particles. Transverse waves have particle displacement perpendicular to wave direction (e.g., light waves), while longitudinal waves have parallel displacement (e.g., sound waves).'
        },
        {
          questionNumber: 2,
          questionText: 'A wave has frequency 50 Hz and wavelength 2m. Calculate the wave velocity.',
          questionType: 'numerical',
          marks: 3,
          answer: 'v = f × λ = 50 × 2 = 100 m/s',
          workings: [
            'Given: f = 50 Hz, λ = 2m',
            'Formula: v = f × λ',
            'v = 50 × 2 = 100 m/s'
          ]
        }
      ],
      accentColor: '#2563eb',
      showMarks: true,
      showAnswers: true
    },

    'lab-report': {
      templateType: 'lab-report',
      title: 'Physics Lab Report',
      studentName: 'Priya Patel',
      rollNumber: '2024PHY018',
      class: 'B.Sc. Physics (Hons.)',
      semester: '3rd Semester',
      subject: 'Physics Practical',
      subjectCode: 'PHY-P301',
      institution: 'St. Stephen\'s College, Delhi',
      department: 'Department of Physics',
      instructor: 'Prof. R.K. Sharma',
      submissionDate: '2025-12-15',
      labReport: {
        experimentNumber: 5,
        experimentTitle: 'To determine the refractive index of glass using a travelling microscope',
        experimentDate: '2025-12-12',
        aim: 'To determine the refractive index of a glass slab using the method of real and apparent depth.',
        apparatus: [
          'Travelling microscope',
          'Glass slab',
          'Lycopodium powder',
          'Reading lamp',
          'Spirit level'
        ],
        theory: 'When light travels from a denser medium to a rarer medium, it bends away from the normal. The refractive index is the ratio of real depth to apparent depth.',
        procedure: [
          'Level the base of the travelling microscope using spirit level.',
          'Sprinkle lycopodium powder on the base and focus the microscope on it. Note reading R1.',
          'Place the glass slab over the powder and focus on the powder through the slab. Note reading R2.',
          'Sprinkle powder on top of the slab and focus. Note reading R3.',
          'Calculate: Real depth = R3 - R1, Apparent depth = R3 - R2'
        ],
        dataTable: {
          title: 'Observations',
          headers: ['S.No.', 'R1 (cm)', 'R2 (cm)', 'R3 (cm)', 'Real Depth', 'Apparent Depth', 'μ'],
          rows: [
            [1, '2.150', '3.425', '4.650', '2.500', '1.225', '2.04'],
            [2, '2.155', '3.420', '4.655', '2.500', '1.235', '2.02'],
            [3, '2.148', '3.430', '4.648', '2.500', '1.218', '2.05']
          ],
          units: ['', 'cm', 'cm', 'cm', 'cm', 'cm', '']
        },
        calculations: [
          'Real Depth (t) = R3 - R1',
          'Apparent Depth (t\') = R3 - R2',
          'Refractive Index (μ) = t / t\'',
          'Mean μ = (2.04 + 2.02 + 2.05) / 3 = 2.04'
        ],
        result: 'The refractive index of the given glass slab is 2.04.',
        precautions: [
          'The microscope should be properly leveled.',
          'Parallax should be removed completely.',
          'The glass slab should be clean and transparent.',
          'Take readings carefully to avoid errors.'
        ],
        sourcesOfError: [
          'Parallax error in taking microscope readings',
          'Glass slab may not be perfectly uniform',
          'Lycopodium powder may not form a uniform layer'
        ]
      },
      accentColor: '#059669'
    },

    'case-study': {
      templateType: 'case-study',
      title: 'Strategic Analysis: Tata Motors\' Electric Vehicle Strategy',
      studentName: 'Vikram Singh',
      rollNumber: '2024MBA056',
      class: 'MBA',
      semester: '2nd Year',
      subject: 'Strategic Management',
      subjectCode: 'SM502',
      institution: 'Indian Institute of Management, Ahmedabad',
      department: 'Department of Business Policy',
      instructor: 'Prof. Anita Desai',
      submissionDate: '2025-12-15',
      caseStudy: {
        companyName: 'Tata Motors Limited',
        industry: 'Automobile - Electric Vehicles',
        location: 'Mumbai, India',
        timePeriod: '2020-2025',
        executiveSummary: 'This case study analyzes Tata Motors\' strategic pivot to electric vehicles, examining market positioning, competitive advantages, and challenges in India\'s emerging EV market.',
        background: 'Tata Motors, established in 1945, is India\'s largest automobile manufacturer. With the global shift towards sustainable mobility, Tata Motors launched its EV journey with the Nexon EV in 2020.',
        problemStatement: 'How can Tata Motors maintain its first-mover advantage in India\'s EV market while managing profitability challenges and increasing competition from global and domestic players?',
        objectives: [
          'Analyze Tata Motors\' current EV market position',
          'Evaluate competitive landscape and threats',
          'Identify strategic options for sustained growth',
          'Recommend actionable strategies'
        ],
        swotAnalysis: {
          strengths: [
            'First-mover advantage in Indian EV market',
            'Strong brand recognition and trust',
            'Extensive dealer and service network',
            'Integration with Tata Group ecosystem'
          ],
          weaknesses: [
            'High production costs affecting margins',
            'Limited charging infrastructure',
            'Dependency on imported battery cells',
            'Premium pricing limiting mass adoption'
          ],
          opportunities: [
            'Government subsidies and FAME II scheme',
            'Rising environmental consciousness',
            'Expanding urban middle class',
            'Fleet electrification opportunities'
          ],
          threats: [
            'Entry of global EV giants (Tesla, BYD)',
            'Competition from Mahindra, MG, Hyundai',
            'Range anxiety among consumers',
            'Fluctuating raw material prices'
          ]
        },
        alternatives: [
          {
            option: 'Aggressive Market Expansion',
            description: 'Rapidly expand product lineup and geographic presence',
            pros: ['Consolidate market leadership', 'Economies of scale', 'Brand strengthening'],
            cons: ['High capital requirement', 'Risk of overexpansion', 'Quality concerns'],
            feasibility: 'medium'
          },
          {
            option: 'Vertical Integration',
            description: 'Develop in-house battery manufacturing capabilities',
            pros: ['Cost reduction', 'Supply chain control', 'Technology ownership'],
            cons: ['Heavy investment', 'Technical challenges', 'Time to market'],
            feasibility: 'high'
          }
        ],
        recommendation: {
          chosen: 'Phased Vertical Integration with Strategic Partnerships',
          justification: 'This approach balances risk and reward by combining in-house development with strategic partnerships for technology and manufacturing.',
          implementation: [
            'Phase 1: Partner with established battery manufacturers',
            'Phase 2: Establish R&D center for battery technology',
            'Phase 3: Set up domestic cell manufacturing',
            'Phase 4: Achieve 70% localization by 2028'
          ]
        },
        conclusion: 'Tata Motors is well-positioned to lead India\'s EV revolution. By pursuing vertical integration strategically, they can reduce costs, improve margins, and maintain competitive advantage.',
        learnings: [
          'First-mover advantage requires continuous innovation',
          'Vertical integration crucial for long-term competitiveness',
          'Government policy alignment essential for EV success'
        ]
      },
      accentColor: '#7c3aed'
    },

    research: {
      templateType: 'research',
      title: 'Impact of Social Media on Academic Performance: A Study of Indian College Students',
      studentName: 'Anjali Gupta',
      rollNumber: '2024SOC033',
      class: 'M.A. Sociology',
      semester: '3rd Semester',
      subject: 'Research Methodology',
      subjectCode: 'SOC601',
      institution: 'Jawaharlal Nehru University, New Delhi',
      department: 'Centre for the Study of Social Systems',
      instructor: 'Dr. Meera Krishnan',
      submissionDate: '2025-12-15',
      research: {
        researchQuestion: 'How does social media usage affect the academic performance of undergraduate students in Indian universities?',
        hypothesis: 'Excessive social media usage (>4 hours daily) has a negative correlation with academic performance measured by GPA.',
        methodology: 'Mixed-methods approach combining quantitative survey (n=500) with qualitative interviews (n=30) across 5 Delhi universities.',
        literatureReview: [
          {
            source: 'Junco, R. (2012). Journal of Computer Assisted Learning',
            summary: 'Found negative relationship between Facebook use and GPA in US college students.',
            relevance: 'Establishes baseline for social media impact studies'
          },
          {
            source: 'Agarwal, S. (2020). Indian Journal of Education',
            summary: 'Identified Instagram and WhatsApp as most used platforms among Indian youth.',
            relevance: 'Provides Indian context for platform preferences'
          }
        ],
        findings: [
          '78% of students spend >3 hours daily on social media',
          'Negative correlation (r=-0.42) between usage time and GPA',
          'Students using social media for academic purposes showed better outcomes',
          '65% reported social media as a distraction during study time'
        ],
        dataAnalysis: 'Statistical analysis using SPSS showed significant negative correlation between excessive social media use and academic performance (p<0.05).',
        limitations: [
          'Self-reported data may have response bias',
          'Limited to Delhi universities',
          'Cross-sectional design limits causal inference',
          'Did not account for socioeconomic factors'
        ],
        conclusion: 'The study confirms a negative relationship between excessive social media use and academic performance. However, purposeful educational use of social media can enhance learning outcomes.',
        futureScope: 'Longitudinal studies tracking students over multiple semesters would provide stronger evidence for causal relationships.'
      },
      references: [
        'Junco, R. (2012). Too much face and not enough books. Computers in Human Behavior, 28(1), 187-198.',
        'Agarwal, S. (2020). Social media habits of Indian college students. Indian Journal of Education, 15(2), 45-62.'
      ],
      citationStyle: 'APA',
      accentColor: '#0891b2'
    },

    worksheet: {
      templateType: 'worksheet',
      title: 'Mathematics Practice Worksheet - Quadratic Equations',
      subtitle: 'Chapter 4: Quadratic Equations',
      studentName: 'Student Name: ________________',
      rollNumber: 'Roll No: ________',
      class: 'Class 10',
      subject: 'Mathematics',
      institution: 'Kendriya Vidyalaya',
      instructor: 'Mrs. Sunita Verma',
      totalMarks: 30,
      instructions: [
        'Answer all questions in the space provided.',
        'Show all working for full marks.',
        'Time allowed: 45 minutes.',
        'Use of calculator is not permitted.'
      ],
      questions: [
        {
          questionNumber: 1,
          questionText: 'Solve: x² - 5x + 6 = 0',
          questionType: 'short-answer',
          marks: 2
        },
        {
          questionNumber: 2,
          questionText: 'Find the discriminant of 2x² + 3x - 5 = 0 and determine the nature of roots.',
          questionType: 'short-answer',
          marks: 3
        },
        {
          questionNumber: 3,
          questionText: 'The sum of two numbers is 15 and sum of their squares is 113. Find the numbers.',
          questionType: 'long-answer',
          marks: 5
        },
        {
          questionNumber: 4,
          questionText: 'Fill in the blanks:',
          questionType: 'fill-blank',
          marks: 4,
          subQuestions: [
            { label: 'a', text: 'A quadratic equation has at most ______ roots.' },
            { label: 'b', text: 'If discriminant D > 0, roots are ______ and ______.' },
            { label: 'c', text: 'Sum of roots of ax² + bx + c = 0 is ______.' },
            { label: 'd', text: 'Product of roots of ax² + bx + c = 0 is ______.' }
          ]
        }
      ],
      accentColor: '#dc2626',
      showMarks: true,
      showAnswers: false
    },

    group: {
      templateType: 'group',
      title: 'Group Project: Design of a Sustainable Smart Campus',
      studentName: 'Team Innovators',
      class: 'B.Tech CSE',
      semester: '6th Semester',
      subject: 'Software Engineering',
      subjectCode: 'CSE601',
      institution: 'Indian Institute of Technology, Delhi',
      department: 'Department of Computer Science',
      instructor: 'Prof. Rajesh Kumar',
      submissionDate: '2025-12-15',
      groupAssignment: {
        groupName: 'Team Innovators',
        groupNumber: 5,
        teamLeader: 'Arjun Mehta',
        members: [
          {
            name: 'Arjun Mehta',
            rollNumber: '2022CSE101',
            role: 'Team Leader / Backend Developer',
            contribution: 'System architecture, API development, team coordination',
            contributionPercentage: 25
          },
          {
            name: 'Sneha Reddy',
            rollNumber: '2022CSE102',
            role: 'Frontend Developer',
            contribution: 'UI/UX design, React components, responsive design',
            contributionPercentage: 25
          },
          {
            name: 'Mohammed Farhan',
            rollNumber: '2022CSE103',
            role: 'Database Administrator',
            contribution: 'Database design, optimization, data security',
            contributionPercentage: 25
          },
          {
            name: 'Kavya Sharma',
            rollNumber: '2022CSE104',
            role: 'IoT & Hardware Integration',
            contribution: 'Sensor integration, Arduino programming, testing',
            contributionPercentage: 25
          }
        ],
        taskDistribution: [
          { task: 'Requirements gathering', assignedTo: 'All members', status: 'completed' },
          { task: 'System design', assignedTo: 'Arjun Mehta', status: 'completed' },
          { task: 'UI/UX design', assignedTo: 'Sneha Reddy', status: 'completed' },
          { task: 'Database setup', assignedTo: 'Mohammed Farhan', status: 'completed' },
          { task: 'Hardware integration', assignedTo: 'Kavya Sharma', status: 'in-progress' },
          { task: 'Testing & deployment', assignedTo: 'All members', status: 'pending' }
        ],
        meetingLog: [
          {
            date: '2025-11-15',
            attendees: ['Arjun', 'Sneha', 'Mohammed', 'Kavya'],
            discussion: 'Project kickoff, role assignment, timeline planning',
            decisions: ['Weekly meetings on Fridays', 'Use GitHub for collaboration']
          },
          {
            date: '2025-11-29',
            attendees: ['Arjun', 'Sneha', 'Mohammed', 'Kavya'],
            discussion: 'Progress review, technical challenges, design approval',
            decisions: ['Finalize tech stack', 'Begin implementation phase']
          }
        ],
        peerEvaluation: true
      },
      introduction: 'This project aims to design a sustainable smart campus solution integrating IoT sensors, mobile applications, and cloud computing to optimize energy usage and enhance campus experience.',
      conclusion: 'The Smart Campus project demonstrates the effective application of software engineering principles in creating sustainable, technology-driven solutions for educational institutions.',
      references: [
        'Agarwal, P. (2023). IoT Applications in Smart Campus. Springer.',
        'React Documentation. https://react.dev/',
        'MongoDB Best Practices Guide. https://mongodb.com/docs/'
      ],
      accentColor: '#0d9488'
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 6: HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Get fields applicable to a specific template type
   */
  export function getFieldsForTemplateType(templateType: AssignmentTemplateType): string[] {
    const commonFields = [
      'title', 'studentName', 'rollNumber', 'class', 'section', 'semester',
      'subject', 'subjectCode', 'institution', 'department', 'instructor',
      'assignedDate', 'dueDate', 'submissionDate', 'totalMarks', 'instructions',
      'introduction', 'conclusion', 'references', 'accentColor'
    ];

    const templateSpecificFields: Record<AssignmentTemplateType, string[]> = {
      homework: ['questions', 'chapter', 'topic', 'showAnswers', 'showMarks', 'showWorkings'],
      'lab-report': ['experimentNumber', 'experimentTitle', 'aim', 'hypothesis', 'apparatus', 'procedure', 'observations', 'result', 'precautions'],
      'case-study': ['companyName', 'industry', 'executiveSummary', 'problemStatement', 'swotAnalysis', 'recommendation'],
      research: ['researchQuestion', 'hypothesis', 'methodology', 'findings', 'limitations'],
      worksheet: ['questions', 'chapter', 'showMarks'],
      group: ['groupName', 'groupNumber', 'teamLeader', 'members', 'taskDistribution']
    };

    return [...commonFields, ...templateSpecificFields[templateType]];
  }

  /**
   * Get sample data for preview
   */
  export function getSampleData(templateType: AssignmentTemplateType): Partial<AssignmentData> {
    return ASSIGNMENT_SAMPLE_DATA[templateType];
  }

  /**
   * Get template info
   */
  export function getTemplateInfo(templateType: AssignmentTemplateType) {
    return ASSIGNMENT_TEMPLATE_CONFIGS[templateType];
  }

  /**
   * Validate assignment data
   */
  export function validateAssignmentData(data: Partial<AssignmentData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title) errors.push('Title is required');
    if (!data.studentName) errors.push('Student name is required');
    if (!data.subject) errors.push('Subject is required');
    if (!data.institution) errors.push('Institution is required');

    // Template-specific validation
    if (data.templateType === 'lab-report' && !data.labReport?.experimentTitle) {
      errors.push('Experiment title is required for lab reports');
    }

    if (data.templateType === 'group' && (!data.groupAssignment?.members || data.groupAssignment.members.length === 0)) {
      errors.push('Group members are required for group assignments');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // EXPORTS
  // ═══════════════════════════════════════════════════════════════════════════════

  export default {
    fields: ASSIGNMENT_FIELD_DEFINITIONS,
    templates: ASSIGNMENT_TEMPLATE_CONFIGS,
    sampleData: ASSIGNMENT_SAMPLE_DATA,
    getFieldsForTemplateType,
    getSampleData,
    getTemplateInfo,
    validateAssignmentData
  };