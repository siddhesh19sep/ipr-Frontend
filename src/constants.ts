import { User, IPRegistration, Dispute, Notification } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Aarav Mehta', email: 'aarav@example.com', mobile: '+91 9876543210', role: 'User', status: 'Verified', accountStatus: 'Active' },
  { id: '2', name: 'Riya Deshpande', email: 'riya@example.com', mobile: '+91 9876543211', role: 'User', status: 'Verified', accountStatus: 'Active' },
  { id: '3', name: 'Kunal Patil', email: 'kunal@example.com', mobile: '+91 9876543212', role: 'User', status: 'Pending', accountStatus: 'Active' },
  { id: '4', name: 'Shruti Sharma', email: 'shruti@example.com', mobile: '+91 9876543213', role: 'User', status: 'Verified', accountStatus: 'Active' },
  { id: '5', name: 'Vikram Singh', email: 'vikram@example.com', mobile: '+91 9876543214', role: 'User', status: 'Suspended', accountStatus: 'Inactive' },
];

export const MOCK_IPS: IPRegistration[] = [
  {
    id: 'IP-1001',
    title: 'Neural Network Optimization Algorithm',
    category: 'Patent',
    ownerId: '1',
    ownerName: 'Aarav Mehta',
    timestamp: '2024-02-15 10:30 AM',
    blockchainHash: '0x_PENDING_ON_AMOY',
    status: 'Approved',
    royaltyEarned: 45000,
    description: 'A novel approach to optimizing deep learning models for edge devices.'
  },
  {
    id: 'IP-1002',
    title: 'Eco-Friendly Packaging Design',
    category: 'Design',
    ownerId: '2',
    ownerName: 'Riya Deshpande',
    timestamp: '2024-02-18 02:15 PM',
    blockchainHash: '0x3c9d...e5f6',
    status: 'Pending',
    royaltyEarned: 0,
    description: 'Biodegradable packaging solution using mushroom mycelium.'
  },
  {
    id: 'IP-1003',
    title: 'Smart Contract Security Protocol',
    category: 'Copyright',
    ownerId: '4',
    ownerName: 'Shruti Sharma',
    timestamp: '2024-02-20 09:00 AM',
    blockchainHash: '0x1a2b...c3d4',
    status: 'Approved',
    royaltyEarned: 125000,
    description: 'A comprehensive framework for auditing and securing Ethereum smart contracts.'
  },
];


export const CHART_DATA = {
  registrations: [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 52 },
    { month: 'Mar', count: 48 },
    { month: 'Apr', count: 61 },
    { month: 'May', count: 55 },
    { month: 'Jun', count: 67 },
    { month: 'Jul', count: 72 },
    { month: 'Aug', count: 65 },
    { month: 'Sep', count: 58 },
    { month: 'Oct', count: 63 },
    { month: 'Nov', count: 70 },
    { month: 'Dec', count: 75 },
  ],
  categories: [
    { name: 'Copyright', value: 35 },
    { name: 'Trademark', value: 25 },
    { name: 'Patent', value: 20 },
    { name: 'Design', value: 20 },
  ],
  royalty: [
    { month: 'Jan', amount: 150000 },
    { month: 'Feb', amount: 180000 },
    { month: 'Mar', amount: 165000 },
    { month: 'Apr', amount: 210000 },
    { month: 'May', amount: 195000 },
    { month: 'Jun', amount: 245000 },
  ]
};
