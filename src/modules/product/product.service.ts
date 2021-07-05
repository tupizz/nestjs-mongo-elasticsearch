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

  findCursor() {
    return this.productModel.find({}).cursor();
  }

  bulkInsert(products: Product[]) {
    return this.productModel.insertMany(products);
  }
}
