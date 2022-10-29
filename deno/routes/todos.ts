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
  // insertOne() also modifies the object in place adding a _id in it
  const insertedId = await todosCollection.insertOne(newTodo); // This returns the id of the item inserted
  // We will add a new id field here for the frontend and leave the _id in it as well for this case
  newTodo.id = insertedId.toString();

  ctx.response.body = { message: "Todo created", todo: newTodo };
});

router.put("/todos/:todoId", async (ctx) => {
  const tid = ctx.params.todoId;
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(tid);
  } catch (_err) {
    ctx.response.status = 400;
    return (ctx.response.body = { message: "Malformed id." });
  }
  const data = await ctx.request.body({ type: "json" }).value;

  const todosCollection = getDb().collection<dbTodo>("todos");
  const { modifiedCount } = await todosCollection.updateOne(
    { _id: objectId },
    { $set: { text: data.text } }
  );
  if (modifiedCount > 0) {
    return (ctx.response.body = { message: "Updated todo!" });
  }
  ctx.response.body = { message: "Could not find todo for this id." };
  ctx.response.status = 404;
});

router.delete("/todos/:todoId", async (ctx) => {
  const tid = ctx.params.todoId;
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(tid);
  } catch (_err) {
    ctx.response.status = 400;
    return (ctx.response.body = { message: "Malformed id." });
  }
  const todosCollection = getDb().collection<dbTodo>("todos");
  const deleteCount = await todosCollection.deleteOne({ _id: objectId });
  if (deleteCount > 0) {
    return (ctx.response.body = { message: "Todo deleted!" });
  }
  ctx.response.body = { message: "Could not find todo for this id." };
  ctx.response.status = 404;
});

export default router;
