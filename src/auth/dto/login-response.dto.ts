
export class UserResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export class LoginResponse {
  accessToken: string;
  user: UserResponse;
}