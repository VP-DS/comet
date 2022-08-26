import { BlockDataInterface, RootBlockEntity } from "@comet/blocks-api";
import { CrudFilter, CrudGenerator, CrudQuery, DocumentInterface, RootBlockType } from "@comet/cms-api";
import { BaseEntity, Entity, OptionalProps, PrimaryKey, Property, types } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { ImageBlock } from "@src/pages/blocks/ImageBlock";
import { GraphQLJSONObject } from "graphql-type-json";
import { v4 } from "uuid";

@ObjectType({
    implements: () => [DocumentInterface],
})
@Entity()
@CrudGenerator({ targetDirectory: `${__dirname}/../generated/` })
@RootBlockEntity()
export class Product extends BaseEntity<Product, "id"> implements DocumentInterface {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = v4();

    @Property({
        columnType: "text",
    })
    @Field()
    @CrudQuery()
    @CrudFilter()
    title: string;

    @Field()
    @Property({
        columnType: "text",
    })
    @CrudQuery()
    @CrudFilter()
    description: string;

    @Property({
        columnType: "text",
    })
    @Field()
    @CrudFilter()
    slug: string;

    @Property({ type: types.decimal, nullable: true })
    @Field({ nullable: true })
    @CrudFilter()
    price?: number;

    @Property({ customType: new RootBlockType(ImageBlock) })
    @Field(() => GraphQLJSONObject, { nullable: true }) //TODO should not be nullable
    image: BlockDataInterface;

    @Property({ columnType: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();

    @Property({ columnType: "timestamp with time zone", onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
