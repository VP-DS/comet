// This file has been generated by comet api-generator.
// You may choose to use this file as scaffold by moving this file out of generated folder and removing this comment.
import { PaginatedResponseFactory } from "@comet/cms-api";
import { ObjectType } from "@nestjs/graphql";

import { ProductCategory } from "../../entities/product-category.entity";

@ObjectType()
export class PaginatedProductCategories extends PaginatedResponseFactory.create(ProductCategory) {}
