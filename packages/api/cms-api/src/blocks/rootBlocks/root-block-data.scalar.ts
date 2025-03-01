import { Block } from "@comet/blocks-api";
import { GraphQLScalarType } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

const rootBlockDataScalars = new Map<string, GraphQLScalarType>();

export function RootBlockDataScalar(block: Block): GraphQLScalarType {
    let scalar = rootBlockDataScalars.get(block.name);

    if (scalar !== undefined) {
        return scalar;
    }

    scalar = new GraphQLScalarType({
        ...GraphQLJSONObject,
        specifiedByUrl: undefined,
        name: `${block.name}BlockData`,
        description: `${block.name} root block data`,
    });

    rootBlockDataScalars.set(block.name, scalar);

    return scalar;
}
