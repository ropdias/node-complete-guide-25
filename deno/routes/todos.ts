import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

const router = new Router();

interface Todo {
  id: string;
  text: string;
}

let todos: Todo[] = [];

router.get("/todos", (ctx) => {
  // Oak will always send back a response so we just need to set the body in the response.
  ctx.response.body = { todos: todos }; // If we pass an object, Oak assumes it should be a JSON
});

router.post("/todos", async (ctx) => {
  const data = await ctx.request.body({ type: "json" }).value;
  const newTodo: Todo = { id: new Date().toISOString(), text: data.text };
  todos.push(newTodo);
  ctx.response.body = { message: "Todo created", todo: newTodo };
});

router.put("/todos/:todoId", async (ctx) => {
  const tid = ctx.params.todoId;
  const data = await ctx.request.body({ type: "json" }).value;
  const todoIndex = todos.findIndex((todo) => todo.id === tid);
  if (todoIndex >= 0) {
    todos[todoIndex] = { id: todos[todoIndex].id, text: data.text };
    return ctx.response.body = { message: "Updated todo!" };
  }
  ctx.response.body = { message: "Could not find todo for this id." };
  ctx.response.status = 404;
});

router.delete("/todos/:todoId", (ctx) => {
  const tid = ctx.params.todoId;
  todos = todos.filter((todo) => todo.id !== tid);
  ctx.response.body = { message: "Todo deleted!" };
});

export default router;
