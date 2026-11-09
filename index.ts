export type EnquiryType = 'membership' | 'personal_training' | 'program' | 'contact';
export type EnquiryStatus = 'new' | 'contacted' | 'in_progress' | 'closed';
export type ContactMethod = 'phone' | 'whatsapp' | 'email';

export interface Enquiry {
  id: string;
  enquiry_type: EnquiryType;
  full_name: string;
  phone: string;
  email: string | null;
  interested_plan: string | null;
  preferred_contact: ContactMethod | null;
  subject: string | null;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
}

export type NewEnquiry = Pick<Enquiry, 'enquiry_type' | 'full_name' | 'phone'> &
  Partial<Pick<Enquiry, 'email' | 'interested_plan' | 'preferred_contact' | 'subject' | 'message'>>;

export interface MembershipPlan {
  id: string;
  name: string;
  duration_label: string;
  price_label: string;
  benefits: string[];
  is_featured: boolean;
  is_enabled: boolean;
  sort_order: number;
}

export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_confirmed: boolean;
  is_enabled: boolean;
  sort_order: number;
}

export interface GalleryImage {
  id: string;
  title: string;
  alt_text: string;
  category: string;
  image_url: string;
  storage_path: string | null;
  is_placeholder: boolean;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  rating: number;
  review: string;
  photo_url: string | null;
  is_sample: boolean;
  is_published: boolean;
  sort_order: number;
}

export interface OpeningHour {
  day: string;
  times: string;
}

export interface BusinessSettings {
  business_name: string;
  phone: string;
  whatsapp_number: string;
  address: string;
  maps_url: string;
  email: string;
  hours: OpeningHour[];
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
}

export interface SiteContent {
  settings: BusinessSettings;
  plans: MembershipPlan[];
  programs: TrainingProgram[];
  gallery: GalleryImage[];
  testimonials: Testimonial[];
}
