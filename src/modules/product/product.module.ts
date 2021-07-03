import { Module } from "@nestjs/common";

import { MongooseModule } from "@nestjs/mongoose";
import { ProductController } from "./product.controller";
import { Product, ProductSchema } from "./product.model";
import { ProductService } from "./product.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
  providers: [ProductService],
  exports: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
