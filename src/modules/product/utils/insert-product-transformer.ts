import { Logger } from "winston";
import { Transform } from "stream";
import { Product } from "../product.model";
import { ProductService } from "../product.service";

type ChunkType = {
  key: number;
  value: Product;
};

export const insertProductTransformer = (
  productService: ProductService,
  logger: Logger,
) =>
  new Transform({
    readableObjectMode: true,
    writableObjectMode: true,

    async transform(chunks, encoding, callback) {
      logger.info("Pausing the stream for some transform");
      this.pause();

      const products = (chunks as ChunkType[]).map((item) => item.value);
      const insertedItems = await productService.bulkInsert(products);
      logger.info(insertedItems);

      setTimeout(() => {
        logger.info("Starting the flowing mode again");
        this.resume();
        callback();
      }, 1000);
    },
  });
