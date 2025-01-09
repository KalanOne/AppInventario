export type { UserResponse, UserUpdate };

interface UserResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate: any;
  roles: string[];
}

interface UserUpdate {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
}
