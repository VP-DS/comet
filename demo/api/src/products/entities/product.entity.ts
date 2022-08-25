import { BlockDataInterface, RootBlockEntity } from "@comet/blocks-api";
import { RootBlockType } from "@comet/cms-api";
import { BaseEntity, Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { ImageBlock } from "@src/pages/blocks/ImageBlock";
import { GraphQLJSONObject } from "graphql-type-json";
import { v4 } from "uuid";

@ObjectType()
@Entity()
@RootBlockEntity()
export class Product extends BaseEntity<Product, "id"> {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @Field(() => ID)
    @PrimaryKey({ type: "uuid" })
    id: string = v4();

    @Field()
    @Property({
        columnType: "text",
    })
    name: string;

    @Field()
    @Property({
        columnType: "text",
    })
    description: string;

    @Field()
    @Property({
        columnType: "number",
    })
    price: number;

    @Property({ customType: new RootBlockType(ImageBlock) })
    @Field(() => GraphQLJSONObject, { nullable: true }) //TODO should not be nullable
    image: BlockDataInterface;

    @Field()
    @Property({
        columnType: "timestamp with time zone",
    })
    createdAt: Date = new Date();

    @Field({ nullable: true })
    @Property({
        columnType: "timestamp with time zone",
        onUpdate: () => new Date(),
    })
    updatedAt: Date = new Date();
}
