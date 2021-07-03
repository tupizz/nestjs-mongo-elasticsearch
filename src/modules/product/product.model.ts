import { Document } from "mongoose";
import { Schema, Prop, SchemaFactory, raw } from "@nestjs/mongoose";

@Schema()
class Category {
  @Prop()
  id: string;

  @Prop()
  name: string;
}

const CategorySchema = SchemaFactory.createForClass(Category);

@Schema()
export class Product {
  @Prop()
  sku: number;

  @Prop()
  price: number;

  @Prop()
  shipping: number;

  @Prop()
  type: string;

  @Prop()
  name: string;

  @Prop()
  url: string;

  @Prop()
  image: string;

  @Prop()
  description: string;

  @Prop()
  manufacturer: string;

  @Prop({ type: [CategorySchema] })
  category: Category[];
}


export type ProductDocument = Product & Document;

export const ProductSchema = SchemaFactory.createForClass(Product);
