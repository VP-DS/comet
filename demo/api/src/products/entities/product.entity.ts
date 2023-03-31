import { CrudField, CrudGenerator, DocumentInterface } from "@comet/cms-api";
import { BaseEntity, Entity, Enum, ManyToOne, OptionalProps, PrimaryKey, Property, Ref, types } from "@mikro-orm/core";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

export enum ProductType {
    Cap = "Cap",
    Shirt = "Shirt",
    Tie = "Tie",
}
registerEnumType(ProductType, {
    name: "ProductType",
});

import { ProductCategory } from "./product-cetegory.entity";

@ObjectType({
    implements: () => [DocumentInterface],
})
@Entity()
@CrudGenerator({ targetDirectory: `${__dirname}/../generated/` })
export class Product extends BaseEntity<Product, "id"> implements DocumentInterface {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @Property()
    @Field()
    @CrudField({
        search: true,
        filter: true,
        sort: true,
        input: true,
    })
    title: string;

    @Property()
    @Field()
    slug: string;

    @Property()
    @Field()
    description: string;

    @Enum({ items: () => ProductType })
    @Field(() => ProductType)
    type: ProductType;

    @Property({ type: types.decimal, nullable: true })
    @Field({ nullable: true })
    price?: number;

    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Property({ type: types.boolean })
    @Field()
    inStock: boolean = true;

    @ManyToOne(() => ProductCategory, { nullable: true, ref: true })
    @CrudField({
        search: true,
        filter: true,
        sort: true,
        input: true,
    })
    category?: Ref<ProductCategory>;

    @Property()
    @Field()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
