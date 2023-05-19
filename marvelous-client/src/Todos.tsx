import { FC} from "react";
import { Todo } from "./Main";

export const Todos: FC<{
    todos: Todo[];
    toggleTodo: (id: string) => void;
    isDone?: boolean;
  }> = ({
    todos,
    toggleTodo,
    isDone,
  }) => <ul>{todos
    .filter((todo: Todo) => isDone ? todo.done : !todo.done)
    .sort((a: Todo, b: Todo) => a.task.localeCompare(b.task))
    .slice(0, isDone ? 10 : undefined)
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