import cn from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Todo } from '../../types/Todo';
type Props = {
  todoList: Todo[];
  isSubmiting: boolean;
  isClearTitle: boolean;
  isAllTodosCompleted: boolean;
  isTogglingAllTodos: boolean;
  onSetIsClearTitle: (needClear: boolean) => void;
  onHandleAddingTodo: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onHandleToggleAllTodos: () => void;
};

export const Header: React.FC<Props> = ({
  todoList,
  isSubmiting,
  isClearTitle,
  isAllTodosCompleted,
  isTogglingAllTodos,
  onSetIsClearTitle,
  onHandleAddingTodo,
  onHandleToggleAllTodos,
}) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  useEffect(() => {
    if (isClearTitle) {
      setValue('');
      onSetIsClearTitle(false);
    }
  }, [isClearTitle]);

  const handleInputOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <header className="todoapp__header">
      {!isTogglingAllTodos && todoList.length > 0 && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', { active: isAllTodosCompleted })}
          data-cy="ToggleAllButton"
          onClick={onHandleToggleAllTodos}
        />
      )}

      <form>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={inputRef}
          disabled={isSubmiting}
          onKeyDown={onHandleAddingTodo}
          onChange={handleInputOnChange}
          value={value}
        />
      </form>
    </header>
  );
};
