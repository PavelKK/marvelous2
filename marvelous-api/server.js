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
  }
});

const Todo = mongoose.model('Todo', todoSchema);


const start = async () => {
  try {
    await mongoose.connect(process.env.MD_CONNECTION || "")
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

app.use(cors({ origin: process.env.CLIENT_URL }));

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
  const { author, task } = req.body;
  const newTodo = new Todo({
    author,
    task
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
  Todo.find()
    .then((todos) => {
      res.json(todos);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error retrieving todos' });
    });
});

app.delete('/todos/:id', (req, res) => {
  const todoId = req.params.id;

  Todo.findByIdAndDelete(todoId)
    .then((deletedTodo) => {
      if (!deletedTodo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json(deletedTodo);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error deleting todo' });
    });
});

app.delete('/todos/deleteall/:author', (req, res) => {
  const author = req.params.author;

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

if (process.env.NODE_ENV === 'deployed') {
  app.use(express.static('build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
}

const listener = app.listen(process.env.PORT || 8080, () =>
  console.log('Listening on port ' + listener.address().port)
);