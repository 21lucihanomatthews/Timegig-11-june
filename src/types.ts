export interface Gig {
  id: string;
  images: string[];
  description: string;
  location: string;
  price: number;
  startDate: string;
  ownerId: string;
}

export interface GigApplication {
  id: string;
  gigId: string;
  seekerId: string;
  seekerName: string;
  seekerPic?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  shareCv: boolean;
  shareId: boolean;
  cvUrl?: string;
  idDocumentUrl?: string;
}

export interface UserProfile {
  fullName: string;
  experience: string;
  profilePic: string | null;
  hasCv: boolean;
  cvName?: string;
  hasIdDoc: boolean;
  idDocName?: string;
  isOwner: boolean;
}

export interface Seeker {
  id: string;
  profilePic: string | null;
  fullName: string;
  experience: string;
  hasCv: boolean;
  portfolioImages: string[];
  workDescription: string;
  availability: string;
}
