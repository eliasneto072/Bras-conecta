import { UserRole} from '../../shared/types/enums';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
  
}

export type IUserPublic = Omit<IUser, 'password'>;

export type Actor = {
  id: string;
  role?: UserRole;
};