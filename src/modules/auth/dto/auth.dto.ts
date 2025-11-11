import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

/**
 * DTO for user registration
 */
export class RegisterDTO {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password cannot exceed 50 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character'
  })
  password: string;

  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
  name?: string;
}

/**
 * DTO for user login
 */
export class LoginDTO {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password is required' })
  @MinLength(1, { message: 'Password cannot be empty' })
  password: string;
}

/**
 * DTO for auth response (token + user data)
 */
export class AuthResponseDTO {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    planType: string;
    avatar: string | null;
  };

  constructor(token: string, user: any, refreshToken?: string) {
    this.token = token;
    this.refreshToken = refreshToken;
    this.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      planType: user.planType,
      avatar: user.avatar
    };
  }
}

/**
 * DTO for JWT payload
 */
export interface JWTPayload {
  userId: string;
  email: string;
  planType: string;
}

/**
 * DTO for refresh token request
 */
export class RefreshTokenDTO {
  @IsString({ message: 'Refresh token is required' })
  refreshToken: string;
}