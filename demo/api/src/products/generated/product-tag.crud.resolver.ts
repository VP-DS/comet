// This file has been generated by comet api-generator.
// You may choose to use this file as scaffold by moving this file out of generated folder and removing this comment.
import { extractGraphqlFields, SubjectEntity, validateNotModified } from "@comet/cms-api";
import { FindOptions, Reference } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { GraphQLResolveInfo } from "graphql";

import { Product } from "../entities/product.entity";
import { ProductTag } from "../entities/product-tag.entity";
import { PaginatedProductTags } from "./dto/paginated-product-tags";
import { ProductTagInput, ProductTagUpdateInput } from "./dto/product-tag.input";
import { ProductTagsArgs } from "./dto/product-tags.args";
import { ProductTagsService } from "./product-tags.service";

@Resolver(() => ProductTag)
export class ProductTagCrudResolver {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly productTagsService: ProductTagsService,
        @InjectRepository(ProductTag) private readonly repository: EntityRepository<ProductTag>,
        @InjectRepository(Product) private readonly productRepository: EntityRepository<Product>,
    ) {}

    @Query(() => ProductTag)
    @SubjectEntity(ProductTag)
    async productTag(@Args("id", { type: () => ID }) id: string): Promise<ProductTag> {
        const productTag = await this.repository.findOneOrFail(id);
        return productTag;
    }

    @Query(() => PaginatedProductTags)
    async productTags(
        @Args() { search, filter, sort, offset, limit }: ProductTagsArgs,
        @Info() info: GraphQLResolveInfo,
    ): Promise<PaginatedProductTags> {
        const where = this.productTagsService.getFindCondition({ search, filter });

        const fields = extractGraphqlFields(info, { root: "nodes" });
        const populate: string[] = [];
        if (fields.includes("products")) {
            populate.push("products");
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const options: FindOptions<ProductTag, any> = { offset, limit, populate };

        if (sort) {
            options.orderBy = sort.map((sortItem) => {
                return {
                    [sortItem.field]: sortItem.direction,
                };
            });
        }

        const [entities, totalCount] = await this.repository.findAndCount(where, options);
        return new PaginatedProductTags(entities, totalCount);
    }

    @Mutation(() => ProductTag)
    async createProductTag(@Args("input", { type: () => ProductTagInput }) input: ProductTagInput): Promise<ProductTag> {
        const { products: productsInput, ...assignInput } = input;
        const productTag = this.repository.create({
            ...assignInput,
        });
        {
            const products = await this.productRepository.find({ id: productsInput });
            if (products.length != productsInput.length) throw new Error("Couldn't find all products that where passed as input");
            await productTag.products.loadItems();
            productTag.products.set(products.map((product) => Reference.create(product)));
        }

        await this.entityManager.flush();
        return productTag;
    }

    @Mutation(() => ProductTag)
    @SubjectEntity(ProductTag)
    async updateProductTag(
        @Args("id", { type: () => ID }) id: string,
        @Args("input", { type: () => ProductTagUpdateInput }) input: ProductTagUpdateInput,
        @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
    ): Promise<ProductTag> {
        const productTag = await this.repository.findOneOrFail(id);
        if (lastUpdatedAt) {
            validateNotModified(productTag, lastUpdatedAt);
        }

        const { products: productsInput, ...assignInput } = input;
        productTag.assign({
            ...assignInput,
        });
        if (productsInput) {
            const products = await this.productRepository.find({ id: productsInput });
            if (products.length != productsInput.length) throw new Error("Couldn't find all products that where passes as input");
            await productTag.products.loadItems();
            productTag.products.set(products.map((product) => Reference.create(product)));
        }

        await this.entityManager.flush();

        return productTag;
    }

    @Mutation(() => Boolean)
    @SubjectEntity(ProductTag)
    async deleteProductTag(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        const productTag = await this.repository.findOneOrFail(id);
        await this.entityManager.remove(productTag);
        await this.entityManager.flush();
        return true;
    }

    @ResolveField(() => [Product])
    async products(@Parent() productTag: ProductTag): Promise<Product[]> {
        return productTag.products.loadItems();
    }
}
