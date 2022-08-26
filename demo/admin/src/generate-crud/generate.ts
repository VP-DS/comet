import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";
import { introspectionFromSchema, IntrospectionQuery } from "graphql";

import { writeCrudForm } from "./generate-form";
import { writeCrudGrid } from "./generate-grid";
import { writeCrudPage } from "./generate-page";

generateCrud();

/*
// TODO move this to a config file
const config = {
    entities: [
        {
            name: "Product",
        },
    ],
};

TODO:
page:
  - schöner text für stack außen; quelle: api vs. config in admin

generell:
  - texte: quelle: api vs. config in admin
  - bessere lösung für schöne labels
  - mehr aus schema discovern (gridQuery?)
  - in packge.json scripts integrieren
  - in library verschieben
  

grid:
  - mehr datentypen (number, boolean, date), type in Grid ausgeben
  - visibility mutation (wenn entsprechende mutation da)
  - alle spalten laden (auch für copyData) und standard sichtbarkeit verwenden - nicht nur die ersten 3
  - grid einstellungen aus api?? (column sichtbarkeit + breite + evntl. typ)
  - copyData felder dynamisch
  - spalten nur filterable wo auch ein filter aktiviert
  - neue sort api; nur sortable wo auch möglich

form:
- form felder: textfield (wann textfield, wann nicht?): nie textfield, block stattdessen verwenden
- slug (validation etc)
- form felder: enum - select (static values)
- form felder: select (dynamic values)
- (?) form mit block preview und tabs


anderes:
  - single mode (footer)

*/

export async function generateCrud(): Promise<void> {
    const schema = await loadSchema("./schema.gql", {
        loaders: [new GraphQLFileLoader()],
    });
    const introspection = introspectionFromSchema(schema);

    await writeCrud("src/products/generated", introspection, {
        entityName: "Product",
        gridQuery: "products" /*todo auto-detect*/,
        rootBlocks: {
            image: {
                name: "ImageBlock",
                import: "@src/common/blocks/ImageBlock",
            },
        },
    });
    await writeCrud("src/news/generated", introspection, {
        entityName: "News",
        gridQuery: "newsList" /*todo auto-detect*/,
    });
}

export interface GeneratorOptions {
    entityName: string;
    gridQuery: string;
    rootBlocks?: {
        [key: string]: {
            name: string;
            import: string;
        };
    };
}

async function writeCrud(targetDirectory: string, schema: IntrospectionQuery, options: GeneratorOptions): Promise<void> {
    await writeCrudForm(targetDirectory, schema, options);
    await writeCrudGrid(targetDirectory, schema, options);
    await writeCrudPage(targetDirectory, schema, options);
}
