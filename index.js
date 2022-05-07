const express = require("express");
const app = express();
var ejs = require("ejs");
var fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

let todos = [
  { id: 0, name: "Cohen Interview Assignment", tasks: [] },
  { id: 1, name: "Cohen Interview Assignment2", tasks: [] },
];

const PORT = process.env.PORT || 3000;

app.get("/todos", (req, res) => {
  var templateString = fs.readFileSync("templates/todos.ejs", "utf-8");
  return res.status(200).end(ejs.render(templateString, { itemsTable: todos }));
});

//delete todo
app.delete("/todos/:id", (req, res) => {
  todos = todos.filter((val) => val.id != req.params.id);
  return res.status(200).end();
});

//get one todo
app.get("/tasks/:id", (req, res) => {
  const id = req.params.id;
  for (let todo of todos) {
    if (todo.id == id) {
      var templateString = fs.readFileSync("templates/tasks.ejs", "utf-8");
      return res.status(200).end(
        ejs.render(templateString, {
          itemsTable: todo,
        })
      );
    }
  }
  res.status(404).send("Todo not found");
});

//add todo
app.post("/todos", (req, res) => {
  todos.push({
    id: todos.length * Math.random(),
    name: req.body.name,
    tasks: [],
  });
  return res.status(200).end();
});

//update task
app.patch("/tasks/:id/:taskID", (req, res) => {
  const id = req.params.id;
  const taskID = req.params.taskID;
  for (let todo of todos) {
    if (todo.id == id) {
      for (let task of todo.tasks) {
        if (task.id == taskID) {
          if (req.body.edit) {
            task.name = req.body.name;
            task.priority = req.body.priority;
            task.completeBy = req.body.timestamp;
          } else {
            task.completed = !task.completed;
          }
        }
      }

      todo.tasks = sortTodo(todo.tasks);
      return res.status(200).end();
    }
  }
  res.status(404).send("Failed to update task");
});

//add task
app.post("/tasks/:id", (req, res) => {
  const id = req.params.id;
  for (let todo of todos) {
    if (todo.id == id) {
      todo.tasks.push({
        id: todo.tasks.length * Math.random(),
        name: req.body.name,
        completed: false,
        completeBy: req.body.timestamp,
        priority: req.body.priority,
      });
      todo.tasks = sortTodo(todo.tasks);
      return res.status(200).end();
    }
  }
  res.status(404).send("Failed to make task");
});

var sortTodo = function (tasks) {
  tasks.sort((a, b) => {
    if ((!a.completed && !b.completed) || (a.completed && b.completed)) {
      const date1 = new Date(a.completeBy);
      const date2 = new Date(b.completeBy);

      return date1 - date2;
    } else {
      if (!a.completed) return -1;
      else return 1;
    }
  });
  return tasks;
};

//delete task
app.delete("/tasks/:id/:taskID", (req, res) => {
  todos.forEach((val) => {
    if (val.id == req.params.id) {
      val.tasks = val.tasks.filter((task) => task.id != req.params.taskID);
    }
    return val;
  });
  return res.status(200).end();
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
