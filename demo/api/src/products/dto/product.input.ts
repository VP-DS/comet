import { BlockInputInterface, isBlockInputInterface } from "@comet/blocks-api";
import { Field, InputType } from "@nestjs/graphql";
import { ImageBlock } from "@src/pages/blocks/ImageBlock";
import { Transform } from "class-transformer";
import { IsNumber, IsString, ValidateNested } from "class-validator";
import { GraphQLJSONObject } from "graphql-type-json";

@InputType()
export class ProductInput {
    @Field()
    @IsString()
    name: string;

    @Field()
    @IsString()
    description: string;

    @Field()
    @IsNumber()
    price: number;

    @Field(() => GraphQLJSONObject)
    @Transform((value) => (isBlockInputInterface(value) ? value : ImageBlock.blockInputFactory(value)), { toClassOnly: true })
    @ValidateNested()
    image: BlockInputInterface;
}
