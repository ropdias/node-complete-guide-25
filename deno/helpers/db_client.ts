import { Database, MongoClient } from "https://deno.land/x/mongo/mod.ts";
import "https://deno.land/x/dotenv/load.ts";

let db: Database;

export const connect = async () => {
  const client = new MongoClient();

  // Connecting to a Local Database
  await client.connect(Deno.env.get("MONGODB_URI")!);

  db = client.database("deno-todos");
};

export const getDb = () => {
  return db;
};
