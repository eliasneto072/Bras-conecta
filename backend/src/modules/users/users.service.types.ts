import { UserRole} from '../../shared/types/enums';

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
};