export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'Admin' | 'Creator' | 'User';
  status: 'Verified' | 'Pending' | 'Suspended';
  accountStatus: 'Active' | 'Inactive';
}

export interface IPRegistration {
  id: string;
  title: string;
  category: 'Copyright' | 'Trademark' | 'Patent' | 'Design';
  ownerId: string;
  ownerName: string;
  timestamp: string;
  blockchainHash: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  royaltyEarned: number;
  description: string;
}

export interface Dispute {
  id: string;
  ipId: string;
  ipTitle: string;
  filedBy: string;
  opponent: string;
  status: 'Open' | 'In Review' | 'Resolved' | 'Dismissed';
  date: string;
  evidence: string;
  notes: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}
