export type PackageStatus = 
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed';

export type UserRole = 'customer' | 'delivery_staff' | 'admin';

export interface Package {
  id: string;
  trackingNumber: string;
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  status: PackageStatus;
  currentLocation?: string;
  estimatedDelivery: string;
  weight: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  deliveryStaffId?: string;
  customerId: string;
}

export interface PackageHistory {
  id: string;
  packageId: string;
  status: PackageStatus;
  location: string;
  notes?: string;
  timestamp: string;
  updatedBy: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface DeliveryStats {
  totalPackages: number;
  delivered: number;
  inTransit: number;
  pending: number;
  failed: number;
}

export interface DatabaseUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export interface DatabasePackage {
  id: string;
  tracking_number: string;
  sender_name: string;
  sender_address: string;
  receiver_name: string;
  receiver_address: string;
  receiver_phone: string;
  status: PackageStatus;
  current_location?: string;
  estimated_delivery: string;
  weight: number;
  description: string;
  created_at: string;
  updated_at: string;
  delivery_staff_id?: string;
  customer_id: string;
}

export interface DatabasePackageHistory {
  id: string;
  package_id: string;
  status: PackageStatus;
  location: string;
  notes?: string;
  timestamp: string;
  updated_by: string;
}
