import React, { useEffect, useState } from 'react';
import { Todo } from './types/Todo';
import { Filter } from './types/Filter';
import { errorMessages, ErrorMessages } from './types/ErrorMessages';
import { TodoServiceAPI } from './service/todoServiceAPI';
import { USER_ID } from './api/todos';
import { getFilteredList } from './utils/getFilteredList';
import { Header } from './components/Header';
import { TodoItem } from './components/TodoItem';
import { Footer } from './components/Footer';
import { ErrorNotification } from './components/ErrorNotification';

export const App: React.FC = () => {
  const [todosList, setTodosList] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>(Filter.all);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [isClearTitle, setIsClearTitle] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const [error, setError] = useState<ErrorMessages | null>(null);

  useEffect(() => {
    TodoServiceAPI.getTodos()
      .then(data => setTodosList(data))
      .catch(() => {
        setError(errorMessages.load);
      });
  }, []);

  useEffect(() => {
    let timerId = 0;

    if (error) {
      timerId = window.setTimeout(() => setError(null), 3000);
    }

    return () => clearTimeout(timerId);
  }, [error]);

  function handleHideError() {
    setError(null);
  }

  const filteredList = getFilteredList(filter, todosList);
  const activeListLength = getFilteredList(Filter.active, todosList)?.length;
  const completedTodos = getFilteredList(Filter.completed, todosList);

  function handleAddingTodo(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const title = event.currentTarget.value.trim();

      if (!title) {
        setError(errorMessages.title);

        return;
      }

      setIsSubmiting(true);
      setTempTodo({
        title,
        userId: USER_ID,
        completed: false,
        id: 0,
      });

      TodoServiceAPI.addTodo(title)
        .then(newTodo => {
          setTodosList(prevList => [...prevList, newTodo]);
          setIsClearTitle(true);
        })
        .catch(() => setError(errorMessages.add))
        .finally(() => {
          setIsSubmiting(false);
          setTempTodo(null);
        });
    }
  }

  function handleDeleteTodo(deleteTodoIds: number[]) {
    setTodosList(prevTodoList =>
      prevTodoList.filter(({ id }) => !deleteTodoIds.includes(id)),
    );
  }

  function handleUpdateTodoList(updatedTodo: Todo) {
    const copyTodoList = [...todosList];
    const indexUpdatedTodo = copyTodoList.findIndex(
      ({ id }) => updatedTodo.id === id,
    );

    copyTodoList.splice(indexUpdatedTodo, 1, updatedTodo);
    setTodosList(copyTodoList);
  }

  function handleToggleAllTodos() {
    const activeTodos = todosList.filter(({ completed }) => !completed);
    const todoToReverseComplete =
      activeTodos.length > 0 ? activeTodos : todosList;
    const promiseMap = todoToReverseComplete.map(({ id, completed }) =>
      TodoServiceAPI.toggleCompleteTodo(id, !completed),
    );

    Promise.all(promiseMap)
      .then(results => {
        let updatedTodoList: Todo[] = [];

        if (todoToReverseComplete.length === todosList.length) {
          results.forEach(result => updatedTodoList.push(result));
        } else {
          updatedTodoList = todosList.map(todo => ({
            ...todo,
            completed: true,
          }));
        }

        setTodosList(updatedTodoList);
      })
      .catch(() => setError(errorMessages.update));
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todoList={todosList}
          isSubmiting={isSubmiting}
          isClearTitle={isClearTitle}
          onSetIsClearTitle={setIsClearTitle}
          onHandleAddingTodo={handleAddingTodo}
          onHandleToggleAllTodos={handleToggleAllTodos}
        />

        <section className="todoapp__main" data-cy="TodoList">
          {filteredList?.map(todo => (
            <TodoItem
              todo={todo}
              key={todo.id}
              onSetError={setError}
              onHandleDeleteTodo={handleDeleteTodo}
              onUpdateTodoList={handleUpdateTodoList}
            />
          ))}
          {tempTodo && (
            <TodoItem
              todo={tempTodo}
              isSubmiting={isSubmiting}
              onSetError={setError}
            />
          )}
        </section>

        {todosList.length > 0 && (
          <Footer
            currentFilter={filter}
            activeListLength={activeListLength}
            completedTodos={completedTodos}
            onSetFilter={setFilter}
            onSetError={setError}
            onHandleDeleteTodo={handleDeleteTodo}
          />
        )}
      </div>
      <ErrorNotification error={error} onHandleHideError={handleHideError} />
    </div>
  );
};
