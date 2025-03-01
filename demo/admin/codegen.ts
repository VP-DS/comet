import { CodegenConfig } from "@graphql-codegen/cli";
import { readFileSync } from "fs";
import { buildSchema } from "graphql";

const schema = buildSchema(readFileSync("./schema.gql").toString());

const rootBlocks = Object.keys(schema.getTypeMap()).filter((type) => type.endsWith("BlockData") || type.endsWith("BlockInput"));

const config: CodegenConfig = {
    schema: "schema.gql",
    documents: ["src/**/*.{ts,tsx}"],
    generates: {
        "./schema.json": {
            plugins: ["introspection"],
            config: {
                minify: true,
            },
        },
        "./src/fragmentTypes.json": {
            plugins: ["fragment-matcher"],
        },
        "./src/graphql.generated.ts": {
            plugins: [
                { add: { content: `import { ${rootBlocks.sort().join(", ")} } from "./blocks.generated";` } },
                "named-operations-object",
                "typescript",
                "typescript-operations",
            ],
            config: {
                avoidOptionals: {
                    field: true,
                },
                enumsAsTypes: true,
                namingConvention: "keep",
                scalars: rootBlocks.reduce((scalars, rootBlock) => ({ ...scalars, [rootBlock]: rootBlock }), {}),
                typesPrefix: "GQL",
            },
        },
    },
};

export default config;
