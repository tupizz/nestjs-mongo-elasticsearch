// tslint:disable: no-console
import { Controller, Get, Inject, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProductService } from "./product.service";
import { createReadStream } from "fs";
import { resolve } from "path";
import { Logger } from "winston";

import StreamArray from "stream-json/streamers/StreamArray";
import Batch from "stream-json/utils/Batch";
import { insertProductTransformer } from "./utils/insert-product-transformer";
import { FastifyReply } from "fastify";
import { bulkUpdateElasticsearchTransformer } from "./utils/bulk-update-elasticsearch-transformer";
import { elasticSearchApi } from "./api/elasticsearch-api";
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
  ) {
    this.logger.defaultMeta = {
      service: "ProductController",
    };
  }

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

  // http://localhost:9000/api/products/sync-products-es
  @Get("sync-products-es")
  async syncProductsES(@Res() response: FastifyReply) {
    console.time("sync-products");

    this.logger.info("starting the sync products, using stream");

    // Delete all index data
    await elasticSearchApi
      .delete("/playground")
      .then(this.logger.info)
      .catch(this.logger.error);

    const pipe = this.productService
      .findCursor()
      .pipe(new Batch({ batchSize: 2000 }))
      .pipe(bulkUpdateElasticsearchTransformer(this.logger));

    pipe.on("end", () => {
      console.timeEnd("sync-products");
      response.status(200).send({ status: "UPLOADED" });
    });
  }

  // http://localhost:9000/api/products/search?t=
  @Get("search")
  async searchProductsByTerm(@Query("t") searchTerm: string) {
    const results = await elasticSearchApi
      .get("/playground/products/_search", {
        data: {
          query: {
            multi_match: {
              query: searchTerm,
              fields: ["name", "description"],
            },
          },
        },
      })
      .catch(this.logger.error);

    return results.data?.hits?.hits.map((hit) => ({
      _id: hit._id,
      name: hit._source.name,
      description: hit._source.description,
    }));
  }

  // http://localhost:9000/api/products/upload-products
  @Get("upload-products")
  uploadProducts(@Res() response: FastifyReply) {
    console.time("bulk-upload");

    this.logger.info("starting the bulk upload, using stream");

    const pipe = createReadStream(
      resolve(__dirname, "..", "..", "..", "products.json"),
      { encoding: "utf-8" },
    )
      .pipe(StreamArray.withParser())
      .pipe(new Batch({ batchSize: 2000 }))
      .pipe(insertProductTransformer(this.productService, this.logger));

    pipe.on("end", () => {
      console.timeEnd("bulk-upload");
      response.status(200).send({ status: "UPLOADED" });
    });
  }
}
