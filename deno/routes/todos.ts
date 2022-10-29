import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { ObjectId } from "https://deno.land/x/mongo/mod.ts";

import { getDb } from "../helpers/db_client.ts";

const router = new Router();

interface dbTodo {
  _id: ObjectId;
  text: string;
}

interface Todo {
  id?: string; // id here is optional with the ?
  text: string;
}

router.get("/todos", async (ctx) => {
  const todosCollection = getDb().collection<dbTodo>("todos");
  const todos: dbTodo[] = await todosCollection.find().toArray(); // { _id: ObjectId(), text: '...' }[]
  const transformedTodos: Todo[] = todos.map((todo) => {
    return { id: todo._id.toString(), text: todo.text };
  });
  // Oak will always send back a response so we just need to set the body in the response.
  ctx.response.body = { todos: transformedTodos }; // If we pass an object, Oak assumes it should be a JSON
});

router.post("/todos", async (ctx) => {
  const data = await ctx.request.body({ type: "json" }).value;
  const newTodo: Todo = { text: data.text };

  const todosCollection = getDb().collection<dbTodo>("todos");
  const insertedId = await todosCollection.insertOne(newTodo); // This returns the id of the item inserted
  newTodo.id = insertedId.toString();

  ctx.response.body = { message: "Todo created", todo: newTodo };
});

router.put("/todos/:todoId", async (ctx) => {
  // const tid = ctx.params.todoId;
  // const data = await ctx.request.body({ type: "json" }).value;
  // const todoIndex = todos.findIndex((todo) => todo.id === tid);
  // if (todoIndex >= 0) {
  //   todos[todoIndex] = { id: todos[todoIndex].id, text: data.text };
  //   return (ctx.response.body = { message: "Updated todo!" });
  // }
  // ctx.response.body = { message: "Could not find todo for this id." };
  // ctx.response.status = 404;
});

router.delete("/todos/:todoId", (ctx) => {
  // const tid = ctx.params.todoId;
  // todos = todos.filter((todo) => todo.id !== tid);
  // ctx.response.body = { message: "Todo deleted!" };
});

export default router;
