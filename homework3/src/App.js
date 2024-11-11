import React, { useReducer, useContext, useRef, useCallback, useMemo, useState, useEffect } from 'react';
import './index.css';

const UserContext = React.createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ name: 'Revanth' });
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'Add_Task':
      return [...state, { id: Date.now(), title: action.payload, completed: false }];
    case 'Toggle_Task':
      return state.map(task => task.id === action.payload ? { ...task, completed: !task.completed } : task);
    case 'Delete_Task':
      return state.filter(task => task.id !== action.payload);
    default:
      return state;
  }
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = value => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

const TaskList = ({ tasks, toggleTask, deleteTask }) => (
  <ul>
    {tasks.map(task => (
      <li key={task.id}>
        <span
          style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
          onClick={() => toggleTask(task.id)}
        >
          {task.title}
        </span>
        <button onClick={() => deleteTask(task.id)}>Delete</button>
      </li>
    ))}
  </ul>
);

const TaskManager = () => {
  const { user } = useContext(UserContext);
  const inputRef = useRef();
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [state, dispatch] = useReducer(taskReducer, tasks);

  useEffect(() => {
    setTasks(state);
  }, [state, setTasks]);

  const addTask = useCallback(() => {
    const title = inputRef.current.value;
    if (title.trim()) {
      dispatch({ type: 'Add_Task', payload: title });
      inputRef.current.value = "";
    }
  }, []);

  const toggleTask = useCallback((id) => {
    dispatch({ type: 'Toggle_Task', payload: id });
  }, []);

  const deleteTask = useCallback((id) => {
    dispatch({ type: 'Delete_Task', payload: id });
  }, []);

  const totalTasks = useMemo(() => state.length, [state]);
  const completedTasks = useMemo(() => state.filter(task => task.completed).length, [state]);

  return (
    <div className="task_manager">
      <h1>{user.name}'s Task Manager</h1>
      <input ref={inputRef} type="text" placeholder="New Task" />
      <button onClick={addTask}>Add Task</button>
      <div>
        <h2>Tasks</h2>
        <TaskList tasks={state} toggleTask={toggleTask} deleteTask={deleteTask} />
      </div>
      <div>
        <p>Total tasks: {totalTasks}</p>
        <p>Completed tasks: {completedTasks}</p>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <UserProvider>
      <TaskManager />
    </UserProvider>
  );
};

export default App;
