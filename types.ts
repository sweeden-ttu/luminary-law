export enum UserRole {
  ATTORNEY = 'Attorney',
  PARALEGAL = 'Paralegal',
  ADMIN = 'Admin/Intake',
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachments?: Attachment[];
  isThinking?: boolean;
}

export interface Attachment {
  type: 'image' | 'audio' | 'pdf';
  url: string; // Base64 or Blob URL for preview
  base64Data: string;
  mimeType: string;
}

export interface Case {
  id: string;
  clientName: string;
  practiceArea: string;
  status: 'New' | 'Discovery' | 'Trial Prep' | 'Closed';
  lastActivity: string;
}

export interface IntakeData {
  clientName: string;
  contactDate: string;
  narrative: string;
  potentialPracticeArea: string;
}