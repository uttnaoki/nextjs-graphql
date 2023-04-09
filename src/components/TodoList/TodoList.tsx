import type { FC, FormEventHandler } from 'react';
import { useEffect, useState } from 'react';

import type { TodosQuery } from '@/generated/request';
import {
  useAddTodoMutation,
  useDeleteTodoMutation,
  useTodosQuery,
  useUpdateTodoMutation,
} from '@/generated/request';

export const TodoList: FC = () => {
  const [todoTitle, setTodoTitle] = useState('');
  const [todos, setTodos] = useState<TodosQuery['todos']>([]);
  const { data, loading, error, refetch } = useTodosQuery();
  const [addTodoMutation] = useAddTodoMutation();
  const [updateTodoMutation] = useUpdateTodoMutation();
  const [deleteTodoMutation] = useDeleteTodoMutation();
  useEffect(() => {
    setTodos(data?.todos ?? []);
  }, [data?.todos]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.todos) return null;

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!todoTitle) return;
    const { data } = await addTodoMutation({
      variables: {
        title: todoTitle,
      },
    });
    if (data?.addTodo) {
      setTodos([...todos, data.addTodo]);
    }
    setTodoTitle('');
    await refetch();
  };

  const handleChange = async (todoId: string, completed: boolean) => {
    const { data } = await updateTodoMutation({
      variables: {
        todoId,
        completed,
      },
    });
    const todo = data?.updateTodo;
    if (todo) {
      setTodos(todos.map((t) => (t.id === todo.id ? todo : t)));
    }
  };

  const handleDelete = async (todoId: string) => {
    const isOk = confirm('削除しますか？');
    if (!isOk) return;
    const { data } = await deleteTodoMutation({
      variables: {
        todoId,
      },
    });
    const todo = data?.deleteTodo;
    if (todo) {
      setTodos(todos.filter((t) => t.id !== todo.id));
    }
  };

  return (
    <div className="p-5 border rounded">
      Todo List
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          className="p-2 border"
          type="text"
          value={todoTitle}
          onChange={(e) => setTodoTitle(e.target.value)}
        />
        <button className="bg-gray-200 p-2">追加</button>
      </form>
      <ul className="mt-5">
        {todos.map((todo) => {
          return (
            <li key={todo.id} className={`${todo.completed && 'line-through'}`}>
              <span>
                {todo.completed ? '✅' : '👀'} {todo.title}
              </span>{' '}
              <input
                className="cursor-pointer"
                type="checkbox"
                checked={todo.completed}
                onChange={async (e) => handleChange(todo.id, e.target.checked)}
              />
              <span> / </span>
              <button
                className="cursor-pointer"
                onClick={() => handleDelete(todo.id)}
              >
                🗑️
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
