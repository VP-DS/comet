import { Field, ID, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsHash, IsInt, IsMimeType, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

import { ImageCropAreaInput } from "../../images/dto/image-crop-area.input";
import { LicenseType } from "../entities/license.embeddable";

export class ImageFileInput {
    @IsOptional()
    @IsInt()
    width?: number;

    @IsOptional()
    @IsInt()
    height?: number;

    @IsOptional()
    @IsObject()
    exif?: Record<string, number | string | Array<number> | Uint8Array | Uint16Array>;

    @Type(() => ImageCropAreaInput)
    @IsOptional()
    @ValidateNested()
    cropArea?: ImageCropAreaInput;
}

@InputType()
export class LicenseInput {
    @Field(() => LicenseType, { nullable: true })
    @IsOptional()
    @IsEnum(LicenseType)
    type?: LicenseType;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    details?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    author?: string;

    @Field(() => Date, { nullable: true })
    @IsOptional()
    @IsDate()
    durationFrom?: Date;

    @Field(() => Date, { nullable: true })
    @IsOptional()
    @IsDate()
    durationTo?: Date;
}

export class CreateFileInput {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @IsNotEmpty()
    size: number;

    @IsNotEmpty()
    @IsMimeType()
    mimetype: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => ImageFileInput)
    image?: ImageFileInput;

    @IsNotEmpty()
    @IsHash("md5")
    contentHash: string;

    @IsOptional()
    @IsUUID()
    folderId?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => LicenseInput)
    license?: LicenseInput;
}

@InputType({ isAbstract: true })
export class UpdateImageFileInput {
    @Field(() => ImageCropAreaInput, {
        nullable: true,
    })
    @Type(() => ImageCropAreaInput)
    @IsOptional()
    @ValidateNested()
    cropArea?: ImageCropAreaInput;
}

@InputType("UpdateDamFileInput")
export class UpdateFileInput {
    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    name?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    title?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    altText?: string;

    @Field(() => UpdateImageFileInput, { nullable: true })
    @Type(() => UpdateImageFileInput)
    @IsOptional()
    @ValidateNested()
    image?: UpdateImageFileInput;

    @Field(() => ID, { nullable: true })
    @IsUUID()
    @IsOptional()
    folderId?: string;

    @Field({ nullable: true })
    @Type(() => LicenseInput)
    @IsOptional()
    @ValidateNested()
    license?: LicenseInput;
}
