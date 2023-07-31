// This file has been generated by comet api-generator.
// You may choose to use this file as scaffold by moving this file out of generated folder and removing this comment.
import { BlockInputInterface, isBlockInputInterface } from "@comet/blocks-api";
import { DamImageBlock, IsNullable, IsSlug, PartialType, RootBlockInputScalar } from "@comet/cms-api";
import { Field, ID, InputType } from "@nestjs/graphql";
import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, ValidateNested } from "class-validator";

import { ProductDimensions, ProductDiscounts, ProductPackageDimensions } from "../../entities/product.entity";
import { ProductType } from "../../entities/product-type.enum";
import { ProductStatisticsInput } from "./product-statistics.nested.input";
import { ProductVariantInput } from "./product-variant.nested.input";

@InputType()
export class ProductInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    title: string;

    @IsNotEmpty()
    @IsString()
    @IsSlug()
    @Field()
    slug: string;

    @IsNotEmpty()
    @IsString()
    @Field()
    description: string;

    @IsNotEmpty()
    @IsEnum(ProductType)
    @Field(() => ProductType)
    type: ProductType;

    @IsNullable()
    @IsNumber()
    @Field({ nullable: true })
    price?: number;

    @IsNotEmpty()
    @IsBoolean()
    @Field()
    inStock: boolean;

    @IsNotEmpty()
    @Field(() => RootBlockInputScalar(DamImageBlock))
    @Transform(({ value }) => (isBlockInputInterface(value) ? value : DamImageBlock.blockInputFactory(value)), { toClassOnly: true })
    @ValidateNested()
    image: BlockInputInterface;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested()
    @Type(() => ProductDiscounts)
    @Field(() => [ProductDiscounts])
    discounts: ProductDiscounts[];

    @IsNotEmpty()
    @IsArray()
    @Field(() => [String])
    @IsString({ each: true })
    articleNumbers: string[];

    @IsNullable()
    @ValidateNested()
    @Type(() => ProductDimensions)
    @Field(() => ProductDimensions, { nullable: true })
    dimensions?: ProductDimensions;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => ProductPackageDimensions)
    @Field(() => ProductPackageDimensions)
    packageDimensions: ProductPackageDimensions;

    @IsNotEmpty()
    @Field(() => ProductStatisticsInput)
    @Type(() => ProductStatisticsInput)
    @ValidateNested()
    statistics: ProductStatisticsInput;

    @Field(() => [ProductVariantInput])
    @IsArray()
    @Type(() => ProductVariantInput)
    variants: ProductVariantInput[];

    @IsNullable()
    @Field(() => ID, { nullable: true })
    @IsUUID()
    category?: string;

    @Field(() => [ID])
    @IsArray()
    @IsUUID(undefined, { each: true })
    tags: string[];
}

@InputType()
export class ProductUpdateInput extends PartialType(ProductInput) {}
