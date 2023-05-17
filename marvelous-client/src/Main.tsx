import React, { FC, useContext, useEffect, useState } from "react";
import { magic, UserContext } from "./App";
import { Header } from "./Header";
import useSWR from "swr";

interface Todo {
  _id: string;
  time: number;
  task: string;
  author: string;
  done: boolean;
}

export const Main: FC = () => {
  const [user, setUser] = useContext(UserContext);
  const [newTodo, setNewTodo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const host = process.env.REACT_APP_SERVER_URL;
  const fetcher = !user?.email
    ? () => Promise.resolve([])
    : (url: string) =>
        fetch(url, { headers: { author: user?.email ?? "" } }).then((res) =>
          res.json()
        );
  const { data: allTodos, error, mutate } = useSWR(host + "/todos", fetcher);
  const todos = allTodos ? allTodos.filter((t: Todo) => t.task.includes(search)) : []
  const createTodo = async () => {
    if (!user?.email || !newTodo) return;
    const addedTodo = { task: newTodo };
    await fetch(host + "/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        author: user?.email,
      },
      body: JSON.stringify(addedTodo),
    });
    setNewTodo("");
    mutate();
  };
  const removeAll = async () => {
    if (!user?.email) return;
    await fetch(host + "/todos/deleteall", {
      method: "DELETE",
      headers: {
        author: user?.email,
      },
    });
    mutate();
  };
  const toggleTodo = async (id: string) => {
    if (!user?.email) return;
    await fetch(host + "/todos/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        author: user?.email,
      },
      body: JSON.stringify({ id }),
    });
    mutate();
  };

  useEffect(() => {
    mutate();
  }, [user?.email, mutate]);

  const logout = () => {
    magic.user.logout().then(() => {
      setUser!({ user: null });
    });
  };
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      createTodo();
    }
  };
  return (
    <div style={{ width: "clamp(20rem, 100%, 50rem)", margin: "1rem 2rem" }}>
      <Header user={user} logout={logout} />
      {!user?.email ? (
        <p>Please log in if you want to use the app</p>
      ) : (
        <div>
          <div className="TodoHeader">
            <h2>Marvelous v2.0</h2>
            <div>
              <span onClick={removeAll}>Delete all tasks</span>
            </div>
          </div>
          <div className="Container">
            <div>
              <input
                type="text"
                onKeyDown={handleKeyPress}
                value={newTodo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewTodo(e.target.value)
                }
              />
              <button type="button" onClick={() => createTodo()}>
                Add
              </button>
            </div>
            <div className="Search">
              <input
                placeholder="Search..."
                type="text"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </div>
          <div className="Container">
            <div>
              <h3>To Do</h3>
              <div className="line" />
              <ul>
                {todos
                  .filter((todo: Todo) => !todo.done)
                  .sort((a: Todo, b: Todo) => a.task.localeCompare(b.task))
                  .map((todo: Todo) => (
                    <li key={todo._id}>
                      <input
                        readOnly
                        type={"checkbox"}
                        onClick={() => toggleTodo(todo._id)}
                        checked={todo.done}
                      />
                      {todo.task}
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h3>Done</h3>
              <div className="line" />
              <ul>
                {todos
                  .filter((todo: Todo) => todo.done)
                  .sort((a: Todo, b: Todo) => a.task.localeCompare(b.task))
                  .slice(0, 10)
                  .map((todo: Todo) => (
                    <li key={todo._id}>
                      <input
                        readOnly
                        type={"checkbox"}
                        onClick={() => toggleTodo(todo._id)}
                        checked={todo.done}
                      />
                      {todo.task}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {error && <div>Backend error (</div>}
      <style>{`
        .TodoHeader {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .TodoHeader div {
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
        }
        .TodoHeader div span {
          text-align: right;
          text-decoration-line: underline;
          color: blue;
          cursor: pointer;
        }
        .Container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          grid-gap: 1rem;
          margin: 2rem auto;
        }
        .Container > div button{
          width: 5rem;
        }
        input[type="text"] {
          width: 100%;
          max-width: 15rem;
          margin: .5rem 1rem .5rem 0;
        }
        .Search {
          text-align: center;
        }
        .line {
          width: 100%;
          margin: .5rem 0;
          background-color: black;
          height: 1px;
        }
        ul {
          list-style-type: none;
        }
        li {
          position: relative;
        }
        input[type="checkbox"] {
          position: absolute;
          left: -25px;
          top: 2px;
        }
      `}</style>
    </div>
  );
};
