import { Logger } from "winston";
import { Transform } from "stream";
import { Product } from "../product.model";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9200",
  headers: {
    "Content-Type": "application/x-ndjson",
  },
});

export const bulkUpdateElasticsearchTransformer = (logger: Logger) =>
  new Transform({
    readableObjectMode: true,
    writableObjectMode: true,

    async transform(chunks, encoding, callback) {
      logger.info("Pausing the stream for some transform");
      this.pause();

      const data = chunks.map((product) => {
        const searchableProduct = {
          sku: product.sku,
          name: product.name,
          type: product.type,
          category: product.category.map((cat) => ({ name: cat.name })),
          description: product.description,
          manufacturer: product.manufacturer,
        };
        return `\n{ "index":{} }\n${JSON.stringify(searchableProduct)}`;
      });


      try {
        await api.post("/playground/products/_bulk", data.concat("\n").join(""));
      } catch (error) {
        console.log(error);
      }

      setTimeout(() => {
        logger.info("Starting the flowing mode again");
        this.resume();
        callback();
      }, 1000);
    },
  });
