import type { BusinessSettings, SiteContent } from '@/types';

export const DEFAULT_SETTINGS: BusinessSettings = {
  business_name: 'MR. THANOS FITNESS',
  phone: '+91 82489 07533',
  whatsapp_number: '918248907533',
  address: '33A, 40, Promenade Road,\nMelapudur, Cantonment,\nTiruchirappalli, Tamil Nadu – 620001',
  maps_url: 'https://maps.app.goo.gl/pqPcLKy5FYNvTsTA8',
  email: '',
  hours: [
    { day: 'Monday – Saturday', times: '5:30 AM – 11:00 AM, 4:30 PM – 10:00 PM' },
    { day: 'Sunday', times: '6:00 AM – 9:00 AM' },
  ],
  instagram_url: '',
  facebook_url: '',
  youtube_url: '',
};

const placeholderBenefits = ['[Benefit 1 – owner to confirm]', '[Benefit 2 – owner to confirm]', '[Benefit 3 – owner to confirm]'];

export const DEFAULT_CONTENT: SiteContent = {
  settings: DEFAULT_SETTINGS,
  plans: [
    { id: 'demo-1', name: 'Monthly Membership', duration_label: '1 Month', price_label: '₹[OWNER TO CONFIRM]', benefits: placeholderBenefits, is_featured: false, is_enabled: true, sort_order: 1 },
    { id: 'demo-2', name: 'Quarterly Membership', duration_label: '3 Months', price_label: '₹[OWNER TO CONFIRM]', benefits: placeholderBenefits, is_featured: true, is_enabled: true, sort_order: 2 },
    { id: 'demo-3', name: 'Yearly Membership', duration_label: '12 Months', price_label: '₹[OWNER TO CONFIRM]', benefits: placeholderBenefits, is_featured: false, is_enabled: true, sort_order: 3 },
  ],
  programs: [],
  gallery: [],
  testimonials: [],
};

export const PEXELS = {
  hero: 'https://images.pexels.com/photos/6388373/pexels-photo-6388373.jpeg',
  aboutMain: 'https://images.pexels.com/photos/4720782/pexels-photo-4720782.jpeg',
  aboutSecondary: 'https://images.pexels.com/photos/13965872/pexels-photo-13965872.jpeg',
  personal: 'https://images.pexels.com/photos/30428668/pexels-photo-30428668.jpeg',
  contact: 'https://images.pexels.com/photos/29825227/pexels-photo-29825227.jpeg',
};

export const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'training', label: 'Training' },
  { id: 'memberships', label: 'Memberships' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact' },
];
