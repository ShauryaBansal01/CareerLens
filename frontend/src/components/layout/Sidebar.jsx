import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import TaskContext from '../../context/TaskContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import {
  LayoutDashboard,
  UploadCloud,
  Gauge,
  Code2,
  PenTool,
  KeyRound,
  User,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';


const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Upload Resume', href: '/upload', icon: UploadCloud },
  { name: 'Resume Analyzer', href: '/resume-ai', icon: Gauge },
  { name: 'LaTeX Builder', href: '/resume-latex', icon: Code2 },
  { name: 'Cover Letter', href: '/cover-letter', icon: PenTool },
];

const secondaryNavigation = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'API Keys', href: '/settings/keys', icon: KeyRound },
];

// NavItem and SidebarContent live at module scope, not inside Sidebar().
// A component declared during render is a new component *type* on every parent
// render, so React unmounts and remounts the entire subtree each time —
// discarding its state, scroll position, and focus.
const NavItem = ({ item, isMobile = false, currentPath, onNavigate }) => {
  const isActive = currentPath === item.href;
  return (
    <Link
      to={item.href}
      onClick={() => isMobile && onNavigate()}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 min-h-[44px] text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
        isActive
          ? "bg-slate-100 dark:bg-slate-800 text-accent-700 dark:text-white"
          : "text-text-muted hover:bg-slate-50 hover:text-text-main dark:hover:bg-slate-900"
      )}
    >
      <item.icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-accent-700 dark:text-white" : "text-slate-400 group-hover:text-text-main"
        )}
        aria-hidden="true"
      />
      {item.name}
    </Link>
  );
};

const TaskCard = ({ task, clearTask, navigate }) => (
  <button
    onClick={() => {
      if (task.href) navigate(task.href);
    }}
    className="w-full text-left rounded-lg border border-border-color bg-slate-50 dark:bg-slate-900 p-3 transition-all hover:border-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 cursor-pointer"
  >
    <div className="flex items-center gap-2.5 mb-1.5">
      {task.status === 'running' && (
        <Loader2 className="h-3.5 w-3.5 text-accent-600 animate-spin shrink-0" aria-hidden="true" />
      )}
      {task.status === 'completed' && (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
      )}
      {task.status === 'failed' && (
        <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" aria-hidden="true" />
      )}
      <span className="text-xs font-semibold text-text-main truncate flex-1">
        {task.label}
      </span>
      {task.status !== 'running' && (
        <button
          onClick={(e) => { e.stopPropagation(); clearTask(task.id); }}
          className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Dismiss task"
        >
          <XCircle className="h-3.5 w-3.5" />
        </button>
      )}
    </div>

    {/* Step label */}
    {task.status === 'running' && task.steps?.length > 0 && (
      <p className="text-[10px] text-text-muted mb-1.5 truncate">
        {task.steps[task.currentStep]}
      </p>
    )}
    {task.status === 'completed' && (
      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-1">Completed</p>
    )}
    {task.status === 'failed' && (
      <p className="text-[10px] text-red-500 mb-1 truncate">{task.error || 'Failed'}</p>
    )}

    {/* Progress bar */}
    {task.status === 'running' && (
      <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent-600 transition-all duration-700 ease-out"
          style={{
            width: task.steps?.length > 1
              ? `${Math.max(8, ((task.currentStep + 1) / task.steps.length) * 100)}%`
              : undefined,
            animation: task.steps?.length <= 1 ? 'indeterminate 1.5s ease-in-out infinite' : undefined,
          }}
        />
      </div>
    )}
  </button>
);

const SidebarContent = ({
  isMobile = false,
  user,
  logout,
  taskList,
  clearTask,
  navigate,
  currentPath,
  onNavigate,
}) => (
  <>
    <div className="flex h-16 shrink-0 items-center px-6">
      <Link to="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm">
        <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-primary-900 dark:bg-primary-800 text-white shadow-sm">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </div>
        <span className="text-[16px] font-bold tracking-tight text-text-main">CareerLens</span>
      </Link>
    </div>

    <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4">
      <nav className="flex-1 space-y-1 py-4">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Main</p>
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} isMobile={isMobile} currentPath={currentPath} onNavigate={onNavigate} />
        ))}
      </nav>

      <nav className="mt-8 space-y-1">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Settings</p>
        {secondaryNavigation.map((item) => (
          <NavItem key={item.name} item={item} isMobile={isMobile} currentPath={currentPath} onNavigate={onNavigate} />
        ))}
        {user?.role === 'admin' && (
          <NavItem
            item={{ name: 'Admin', href: '/admin', icon: Settings }}
            isMobile={isMobile}
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        )}
      </nav>

      {/* ── Active Tasks ─────────────────────────────── */}
      {taskList.length > 0 && (
        <div className="mt-6 px-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Activity</p>
          <div className="space-y-2">
            {taskList.map(task => (
              <TaskCard key={task.id} task={task} clearTask={clearTask} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-8">
        <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-100 text-xs font-bold text-accent-700 dark:bg-accent-900/30 dark:text-accent-400">
              {(user?.name || 'S').charAt(0).toUpperCase()}
            </span>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-semibold text-text-main">{user?.name || 'User'}</p>
              <p className="truncate text-xs text-text-muted">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="w-full justify-center mt-4" icon={LogOut}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  </>
);

export function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const { tasks, clearTask } = useContext(TaskContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const taskList = Object.values(tasks);

  const contentProps = {
    user,
    logout,
    taskList,
    clearTask,
    navigate,
    currentPath: location.pathname,
    onNavigate: () => setMobileMenuOpen(false),
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border-color lg:bg-bg-card">
        <SidebarContent {...contentProps} />
      </div>

      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 border-b border-border-color bg-bg-card px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-text-muted hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-md"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex-1 text-sm font-bold leading-6 text-text-main tracking-tight">CareerLens</div>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1 flex-col bg-bg-card pb-4 pt-5">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X className="h-6 w-6 text-text-main" aria-hidden="true" />
                </button>
              </div>
              <SidebarContent isMobile {...contentProps} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
