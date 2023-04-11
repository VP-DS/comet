import { BaseEntity, Collection, Entity, ManyToOne, MikroORM, OneToMany, PrimaryKey, Ref } from "@mikro-orm/core";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage";
import { v4 as uuid } from "uuid";

import { generateCrudInput } from "./generate-crud-input";
import { lintSource, parseSource } from "./utils/test-helper";

@Entity()
export class ProductCategory extends BaseEntity<ProductCategory, "id"> {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @OneToMany(() => Product, (products) => products.category)
    products = new Collection<Product>(this);
}

@Entity()
export class Product extends BaseEntity<Product, "id"> {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @ManyToOne(() => ProductCategory, { nullable: true, ref: true })
    category?: Ref<ProductCategory>;
}

describe("GenerateCrudInputRelations", () => {
    it("input dto should contain relation id", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init({
            type: "sqlite",
            dbName: "test-db",
            entities: [Product, ProductCategory],
        });

        const out = await generateCrudInput({ targetDirectory: __dirname }, orm.em.getMetadata().get("Product"));
        const lintedOutput = await lintSource(out);
        const source = parseSource(lintedOutput);

        const classes = source.getClasses();
        expect(classes.length).toBe(1);

        const cls = classes[0];
        const structure = cls.getStructure();

        expect(structure.properties?.length).toBe(1);
        {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const prop = structure.properties![0];
            expect(prop.name).toBe("categoryId");
            expect(prop.type).toBe("string");
            const decorators = prop.decorators?.map((i) => i.name);
            expect(decorators).toContain("Field");
            expect(decorators).toContain("IsUUID");
            expect(decorators).toContain("IsOptional");
        }
        orm.close();
    });
});
