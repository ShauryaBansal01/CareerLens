import { createContext, useState, useCallback, useRef, useEffect } from 'react';

const TaskContext = createContext();

/**
 * Merges partial state into a page's persisted state.
 * Key = page identifier (e.g. 'resume-ai', 'cover-letter').
 * Value = arbitrary object that survives route changes.
 */

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState({});
  const [pageStates, setPageStates] = useState({});
  const abortControllers = useRef({});

  useEffect(() => {
    const handleLogout = () => {
      setPageStates({});
      setTasks({});
    };
    window.addEventListener('cl:logout', handleLogout);
    return () => window.removeEventListener('cl:logout', handleLogout);
  }, []);

  const updateTask = useCallback((id, patch) => {
    setTasks(prev => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  }, []);

  /**
   * Start a background task that survives page navigation.
   *
   * @param {string}   id       — unique task key (e.g. 'resume-upload')
   * @param {string}   label    — human-readable label shown in sidebar
   * @param {Function} asyncFn  — async function to execute. Receives no args.
   * @param {string}   href     — route to navigate to when clicking the task
   * @param {string[]} [steps]  — progress step labels for the simulated progress bar
   */
  const startTask = useCallback((id, label, asyncFn, href, steps = []) => {
    // Abort any existing task with same id
    if (abortControllers.current[id]) {
      abortControllers.current[id].abort();
    }

    const controller = new AbortController();
    abortControllers.current[id] = controller;

    // Initialize the task
    setTasks(prev => ({
      ...prev,
      [id]: {
        id,
        label,
        status: 'running',
        href,
        steps,
        currentStep: 0,
        result: null,
        error: null,
        startedAt: Date.now(),
      },
    }));

    // Start step progression timer
    let stepInterval = null;
    if (steps.length > 1) {
      stepInterval = setInterval(() => {
        setTasks(prev => {
          const task = prev[id];
          if (!task || task.status !== 'running') {
            clearInterval(stepInterval);
            return prev;
          }
          const next = Math.min(task.currentStep + 1, steps.length - 1);
          return { ...prev, [id]: { ...task, currentStep: next } };
        });
      }, 3000);
    }

    // Run the actual async work
    asyncFn()
      .then(result => {
        if (!controller.signal.aborted) {
          setTasks(prev => ({
            ...prev,
            [id]: {
              ...prev[id],
              status: 'completed',
              result,
              currentStep: steps.length > 0 ? steps.length - 1 : 0,
            },
          }));
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setTasks(prev => ({
            ...prev,
            [id]: {
              ...prev[id],
              status: 'failed',
              error: err?.response?.data?.message || err?.message || 'Something went wrong.',
            },
          }));
        }
      })
      .finally(() => {
        if (stepInterval) clearInterval(stepInterval);
        delete abortControllers.current[id];
      });
  }, []);

  const clearTask = useCallback((id) => {
    setTasks(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    if (abortControllers.current[id]) {
      abortControllers.current[id].abort();
      delete abortControllers.current[id];
    }
  }, []);

  const getTask = useCallback((id) => {
    return tasks[id] || null;
  }, [tasks]);

  /** Merge partial state into a page's persisted store. */
  const setPageState = useCallback((pageId, patch) => {
    setPageStates(prev => ({
      ...prev,
      [pageId]: { ...prev[pageId], ...patch },
    }));
  }, []);

  /** Read the persisted state for a page. */
  const getPageState = useCallback((pageId) => {
    return pageStates[pageId] || null;
  }, [pageStates]);

  /** Clear persisted state for a page (e.g. when user resets). */
  const clearPageState = useCallback((pageId) => {
    setPageStates(prev => {
      const copy = { ...prev };
      delete copy[pageId];
      return copy;
    });
  }, []);

  return (
    <TaskContext.Provider value={{
      tasks, startTask, clearTask, getTask,
      setPageState, getPageState, clearPageState,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;
