import { IUser } from "./user";


export interface IAuthResult {
  accessToken: {
    value: string;
    expiresIn: number;
  };
  refreshToken: {
    value: string;
  };
  user: IUser;
}
