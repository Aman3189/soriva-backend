import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';

/**
 * DTO for creating a new setting
 */
export class CreateSettingDTO {
  @IsString({ message: 'Key must be a string' })
  @IsNotEmpty({ message: 'Key is required' })
  key: string;

  @IsString({ message: 'Value must be a string' })
  @IsNotEmpty({ message: 'Value is required' })
  value: string;

  @IsString({ message: 'Category must be a string' })
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isPublic must be a boolean' })
  isPublic?: boolean;
}

/**
 * DTO for updating an existing setting
 */
export class UpdateSettingDTO {
  @IsOptional()
  @IsString({ message: 'Value must be a string' })
  value?: string;

  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isPublic must be a boolean' })
  isPublic?: boolean;
}

/**
 * DTO for setting response
 */
export class SettingResponseDTO {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(setting: any) {
    this.id = setting.id;
    this.key = setting.key;
    this.value = setting.value;
    this.category = setting.category;
    this.description = setting.description;
    this.isPublic = setting.isPublic;
    this.createdAt = setting.createdAt;
    this.updatedAt = setting.updatedAt;
  }
}

/**
 * DTO for bulk settings response
 */
export class SettingsListDTO {
  settings: SettingResponseDTO[];
  total: number;

  constructor(settings: any[], total: number) {
    this.settings = settings.map(s => new SettingResponseDTO(s));
    this.total = total;
  }
}