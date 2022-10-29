import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import "https://deno.land/x/dotenv/load.ts";

import todosRoutes from "./routes/todos.ts"; // Do not omit the extension .ts
import { connect } from "./helpers/db_client.ts";

connect();

const app = new Application();

app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE"
  );
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  await next();
});

// Whenever you have any middlewares that do async stuff,
// you should make all your middlewares async and ALWAYS await next();
// Here we tell Oak that we don't just want to start the next middleware in line,
// but that we also want to wait for them to finish before we send back
// that automatically generated response
app.use(async (_ctx, next) => {
  // console.log('Middleware!');
  await next();
});

// Oak needs these two middlewares to use our routes:
app.use(todosRoutes.routes());
app.use(todosRoutes.allowedMethods());

await app.listen({ port: 8000 });
