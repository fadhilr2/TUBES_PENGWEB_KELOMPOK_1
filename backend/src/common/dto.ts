import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
export class LoginDto {
  @ApiProperty() @IsEmail() @MaxLength(120) @trim() email!: string;
  @ApiProperty() @IsString() @Length(6, 128) @Matches(/\S/) password!: string;
}
export class RegisterDto extends LoginDto {
  @ApiProperty() @IsString() @Length(2, 80) @trim() name!: string;
  @ApiProperty() @IsString() @Length(2, 80) @trim() location!: string;
}
export class ProfileDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(2000) avatar?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(-90) @Max(90) latitude?:
    number | null;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(-180) @Max(180) longitude?:
    number | null;
  @ApiProperty() @IsString() @Length(2, 80) @trim() name!: string;
  @ApiProperty() @IsString() @Length(2, 80) @trim() location!: string;
}
export class ProviderDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @trim()
  skills?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  @trim()
  experience?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  @trim()
  location?: string;
}
export class DeleteAccountDto {
  @ApiProperty() @IsIn(['HAPUS']) confirmation!: string;
}
export class PackageDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @Length(1, 100) id?: string;
  @ApiProperty() @IsString() @Length(1, 100) @trim() name!: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @trim()
  description?: string;
  @ApiProperty() @IsInt() @Min(1) @Max(1000000000) price!: number;
}
export class ServiceDto {
  @ApiProperty() @IsString() @Length(3, 160) @trim() title!: string;
  @ApiProperty() @IsIn(['desain', 'koding', 'video', 'konten', 'foto']) category!: string;
  @ApiProperty() @IsString() @Length(10, 10000) @trim() description!: string;
  @ApiProperty() @IsInt() @Min(1) @Max(365) days!: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @trim()
  portfolioUrl?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @trim()
  image?: string;
  @ApiProperty({ type: [PackageDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => PackageDto)
  packages!: PackageDto[];
}
export class ModerationDto {
  @ApiProperty() @IsBoolean() hidden!: boolean;
}
export class ReviewDto {
  @ApiProperty() @IsInt() @Min(1) @Max(5) rating!: number;
  @ApiProperty() @IsString() @Length(1, 2000) @trim() comment!: string;
}
export class AttachmentDto {
  @ApiProperty() @IsString() @Length(1, 255) name!: string;
  @ApiProperty() @IsInt() @Min(0) @Max(524288000) size!: number;
}
export class OrderDto {
  @ApiProperty() @IsString() @Length(1, 100) serviceId!: string;
  @ApiProperty() @IsString() @Length(1, 100) packageId!: string;
  @ApiProperty() @IsString() @Length(5, 10000) @trim() brief!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(10) deadline?: string;
  @ApiProperty() @IsIn(['bca', 'mandiri', 'gopay', 'ovo', 'dana']) paymentMethod!: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  @trim()
  buyerName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() @MaxLength(120) email?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^[+\d\s()-]*$/)
  whatsapp?: string;
  @ApiProperty({ type: [AttachmentDto], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
export class PaymentDto {
  @ApiProperty() @IsBoolean() success!: boolean;
}
export class DeliveryDto {
  @ApiProperty() @IsString() @Length(3, 4000) @trim() resultUrl!: string;
}
export class DecisionDto {
  @ApiProperty() @IsBoolean() accepted!: boolean;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  @trim()
  complaint?: string;
}
export class AdminDecisionDto {
  @ApiProperty() @IsBoolean() approve!: boolean;
}
export class AdminUserDto extends RegisterDto {
  @ApiProperty() @IsIn(['pencari', 'penyedia']) role!: 'pencari' | 'penyedia';
  @ApiProperty() @IsIn(['aktif', 'diblokir']) status!: 'aktif' | 'diblokir';
  @ApiProperty() @IsInt() @Min(0) @Max(1000000000) balance!: number;
}
export class AdminUserPatchDto extends PartialType(AdminUserDto, { skipNullProperties: false }) {
  @Transform(({ value }) => (value === '' ? undefined : value))
  password?: string;
}
export class PageQuery {
  @ApiProperty({ required: false, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  page = 1;
  @ApiProperty({ required: false, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(160) @trim() q?: string;
}
export class CatalogQuery extends PageQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsIn(['desain', 'koding', 'video', 'konten', 'foto'])
  category?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(80) location?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000000000)
  minPrice?: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000000000)
  maxPrice?: number;
  @ApiProperty({ required: false }) @IsIn(['rating', 'harga-asc', 'harga-desc']) sort = 'rating';
}
export class OrderQuery extends PageQuery {
  @ApiProperty({ required: false }) @IsIn(['purchases', 'incoming']) view = 'purchases';
  @ApiProperty({ required: false })
  @IsOptional()
  @IsIn([
    'menunggu_pembayaran',
    'dibayar',
    'dikirim',
    'menunggu_admin',
    'selesai',
    'direfund',
    'dibatalkan',
  ])
  status?:
    | 'menunggu_pembayaran'
    | 'dibayar'
    | 'dikirim'
    | 'menunggu_admin'
    | 'selesai'
    | 'direfund'
    | 'dibatalkan';
}
export class LogQuery extends PageQuery {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(100) actorId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(100) action?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to?: string;
}
