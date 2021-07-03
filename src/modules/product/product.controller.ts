import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProductService } from "./product.service";
import { readFileSync } from "fs";
import { resolve } from "path";
import { Logger } from "winston";
import { Product } from "./product.model";

@ApiTags("profile")
@Controller("api/products")
export class ProductController {
  /**
   * Constructor
   * @param ProductService
   */
  constructor(
    private readonly productService: ProductService,
    @Inject("winston") private readonly logger: Logger,
  ) {}

  // http://localhost:9000/api/products/test
  @Get("test")
  async createProduct() {
    return this.productService.insert({
      sku: 9747138,
      name: "Verbatim - Life Series 16x DVD-R Discs (100-Pack)",
      type: "HardGood",
      price: 29.99,
      category: [
        { id: "abcat0500000", name: "Computers & Tablets" },
        { id: "abcat0515000", name: "Computer Accessories & Peripherals" },
        { id: "abcat0515001", name: "Blank Discs & Labels" },
        { id: "abcat0515005", name: "DVD-R/RW" },
      ],
      shipping: 6.99,
      description:
        "Up to 16x recording speed; 4.7GB storage capacity; records up to 120 minutes of video; ideal for home videos, digital photos and large files; 100-Pack.",
      manufacturer: "Verbatim",
      url: "http://www.bestbuy.com/site/verbatim-life-series-16x-dvd-r-discs-100-pack/9747138.p?id=1218166527779&skuId=9747138&cmp=RMXCC",
      image:
        "http://img.bbystatic.com/BestBuy_US/images/products/9747/9747138_sa.jpg",
    });
  }

  // http://localhost:9000/api/products/upload-products
  @Get("upload-products")
  async uploadProducts() {
    const productsBuffer = readFileSync(resolve(__dirname, "products.json"));
    const products: Product[] = JSON.parse(
      productsBuffer.toString("utf-8"),
    ) as Product[];
    this.logger.info(JSON.stringify(products[0], null, 2));
    await this.productService.bulkInsert(products);
    return {
      status: "success",
    };
  }
}
