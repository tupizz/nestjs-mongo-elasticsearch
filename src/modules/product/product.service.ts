import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product, ProductDocument } from "./product.model";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  insert(product: Product) {
    return this.productModel.create(product);
  }

  bulkInsert(products: Product[]) {
    return this.productModel.insertMany(products);
  }
}
