import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { Product } from "./entities/product.entity";
import { ProductCategory } from "./entities/product-cetegory.entity";
import { ProductCrudResolver } from "./generated/product.crud.resolver";
import { ProductCategoryCrudResolver } from "./generated/product-category.crud.resolver";
import { ProductCategorysService } from "./generated/product-categorys.service";
import { ProductsService } from "./generated/products.service";

@Module({
    imports: [MikroOrmModule.forFeature([Product, ProductCategory])],
    providers: [ProductCrudResolver, ProductsService, ProductCategoryCrudResolver, ProductCategorysService],
    exports: [],
})
export class ProductsModule {}
