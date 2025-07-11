import { ROLE } from "../enums/role.enum";

export interface IUser {
  _id:string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  role: ROLE;
}
