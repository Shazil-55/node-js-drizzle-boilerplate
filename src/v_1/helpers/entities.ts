export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  type: UserStatus;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Blocked = 'Blocked',
}

export enum UserTypes {
  User = 'User',
  Admin = 'Admin',
}
