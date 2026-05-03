// src/app/models/nutriomedics.models.ts

export interface Product {
  id: number;
  userId: number | null;
  name: string;
  description: string;
  category: string;
  slug: string;
  tagline: string;
  status: string;
  featured: boolean;
  clinicalBenefits: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface Service {
  id: number;
  userId?: number | null;
  title: string;
  description: string;
  slug: string;
  iconKey: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface ResearchArea {
  id: number;
  userId?: number | null;
  title: string;
  description: string;
  focusTag: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface Partnership {
  id: number;
  userId?: number | null;
  partnerType: string;
  organizationName: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: number;
  userId?: number | null;
  title: string;
  content: string;
  documentUrl: string | null;
  documentName: string | null;
  status: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  additionalInfo: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  messageType: string;
  status: string;
  createdAt: string;
  repliedAt: string | null;
  replyMessage: string | null;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}export interface HeroImage {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}