require('dotenv').config(); // enables loading .env vars
const express = require('express');
const app = express();
const { Magic } = require('@magic-sdk/admin');
const path = require('path');
const cors = require('cors');
const mongoose = require("mongoose");


const todoSchema = new mongoose.Schema({
  time: {
    type: Date,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  task: {
    type: String,
    required: true
  },
  done: {
    type: Boolean,
    required: false
  }
});

const Todo = mongoose.model('Todo', todoSchema);


const magic = new Magic(process.env.MAGIC_SECRET_KEY);

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.post('/api/login', async (req, res) => {
  try {
    const didToken = req.headers.authorization.substr(7);
    await magic.token.validate(didToken);
    res.status(200).json({ authenticated: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/todos', (req, res) => {
  const author = req.headers?.author
  const { task } = req.body;
  const newTodo = new Todo({
    author,
    task,
    done: false,
    time: new Date()
  });
  newTodo.save()
    .then((savedTodo) => {
      res.json(savedTodo);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error saving todo' });
    });
});

app.get('/todos', (req, res) => {
  const author = req.headers?.author
  console.log("🚀 ~ file: server.js:67 ~ app.get ~ author:", author)
  Todo.find({author})
    .then((todos) => {
      res.json(todos);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error retrieving todos' });
    });
});

app.post('/todos/toggle', (req, res) => {
  // SWITCH DONE
  const todoId = req.body.id;
  console.log("🚀 ~ file: server.js:92 ~ app.post ~ todoId:", todoId)
  Todo.findOneAndUpdate(
    { _id: todoId },
    // { $set: { done: { $not: "$done" } } },
    [{$set:{done:{$eq:[false,"$done"]}}}],
    { new: false }
  ).then((updatedTodo) => {
    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    } else {
      res.json(updatedTodo)
    }
    }).catch((error) => {
      res.status(500).json({ error: 'Error swithing todo' });
    });
});

app.delete('/todos/deleteall', (req, res) => {
  const author = req.headers?.author
  console.log("TRYING TO DELETE ALL TASKS")
  Todo.deleteMany({ author })
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'No todos found for the author' });
      }
      res.json({ message: 'Todos deleted successfully' });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error deleting todos' });
    });
});


app.use(express.static('build'));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

const start = async () => {
  try {
    if (!process.env.MD_CONNECTION) return
    await mongoose.connect(process.env.MD_CONNECTION || "", {useNewUrlParser: true, useUnifiedTopology: true})
    app.listen(process.env.PORT || 8080, () =>
    console.log('Listening ..'))
  } catch (error) {
    console.error(error);
  }
};

start();