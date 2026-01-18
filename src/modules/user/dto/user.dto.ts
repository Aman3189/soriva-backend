import { IsString, IsOptional, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * DTO for updating user profile information
 * Used when user wants to update their name, username, or bio
 */
export class UpdateUserDTO {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(30, { message: 'Username cannot exceed 30 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores'
  })
  username?: string;

  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  @MaxLength(500, { message: 'Bio cannot exceed 500 characters' })
  bio?: string;
}

/**
 * DTO for user profile response
 * This is what gets returned to the client
 */
export class UserProfileDTO {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  profilePicture: string | null;
  planType: string;
  creditsRemaining: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.username = user.username;
    this.bio = user.bio;
    this.profilePicture = user.profilePicture;
    this.planType = user.planType;
    this.creditsRemaining = user.creditsRemaining;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}