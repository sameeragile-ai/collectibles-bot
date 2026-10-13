import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  BotTask,
  DropItem,
  StoreProfile,
  ShippingProfile,
  DropHistoryItem,
  LogEntry,
  Conversation,
  ChatMessage,
  ToastMessage,
} from '../types';
import {
  SEED_DROPS,
  SEED_STORES,
  SEED_PROFILES,
  SEED_TASKS,
  SEED_HISTORY,
  SEED_LOGS,
  INITIAL_CONVERSATION,
} from '../data/seedData';

interface DroplineState {
  // Navigation & panels
  sidebarOpen: boolean;
  liveBoardOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleLiveBoard: () => void;
  setLiveBoardOpen: (open: boolean) => void;

  // Conversations & Chat
  conversations: Conversation[];
  activeConversationId: string;
  selectConversation: (id: string) => void;
  createNewConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: Partial<ChatMessage>
  ) => void;

  // Tasks
  tasks: BotTask[];
  createTask: (taskData: Omit<BotTask, 'id' | 'status'> & { id?: string; status?: BotTask['status'] }) => BotTask;
  updateTask: (taskId: string, updates: Partial<BotTask>) => void;
  deleteTask: (taskId: string) => void;
  pauseTask: (taskId: string) => void;
  resumeTask: (taskId: string) => void;
  stopAllTasks: () => void;
  resumeAllTasks: () => void;

  // Drops & Stores & Profiles
  drops: DropItem[];
  stores: StoreProfile[];
  profiles: ShippingProfile[];
  addProfile: (profile: Omit<ShippingProfile, 'id'>) => ShippingProfile;
  setDefaultProfile: (id: string) => void;
  addStore: (store: Omit<StoreProfile, 'id'>) => StoreProfile;
  updateStoreStatus: (id: string, status: StoreProfile['status'], latency?: number) => void;

  // History & Logs
  history: DropHistoryItem[];
  addHistoryItem: (item: DropHistoryItem) => void;
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (title: string, description: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Active run task simulation reference
  runningTaskId: string | null;
  setRunningTaskId: (taskId: string | null) => void;
}

export const useDroplineStore = create<DroplineState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      liveBoardOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleLiveBoard: () => set((state) => ({ liveBoardOpen: !state.liveBoardOpen })),
      setLiveBoardOpen: (open) => set({ liveBoardOpen: open }),

      conversations: [INITIAL_CONVERSATION],
      activeConversationId: INITIAL_CONVERSATION.id,

      selectConversation: (id) => set({ activeConversationId: id }),

      createNewConversation: (title = 'New Assistant Session') => {
        const id = 'conv-' + Date.now();
        const newConv: Conversation = {
          id,
          title,
          lastUpdated: 'Just now',
          snippet: 'Start chatting with your drop operator...',
          messages: [],
        };
        set((state) => ({
          conversations: [newConv, ...state.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      deleteConversation: (id) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id);
          const nextActive =
            filtered.length > 0
              ? state.activeConversationId === id
                ? filtered[0].id
                : state.activeConversationId
              : '';
          return {
            conversations: filtered,
            activeConversationId: nextActive,
          };
        });
      },

      addMessage: (conversationId, message) => {
        set((state) => {
          const convs = state.conversations.map((c) => {
            if (c.id === conversationId) {
              const updatedMessages = [...c.messages, message];
              return {
                ...c,
                messages: updatedMessages,
                lastUpdated: 'Just now',
                snippet: message.text.slice(0, 48) + '...',
              };
            }
            return c;
          });
          return { conversations: convs };
        });
      },

      updateMessage: (conversationId, messageId, updates) => {
        set((state) => {
          const convs = state.conversations.map((c) => {
            if (c.id === conversationId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId ? { ...m, ...updates } : m
                ),
              };
            }
            return c;
          });
          return { conversations: convs };
        });
      },

      tasks: SEED_TASKS,

      createTask: (taskData) => {
        const newTask: BotTask = {
          id: taskData.id || 'task-' + Date.now(),
          productId: taskData.productId,
          productName: taskData.productName,
          storeName: taskData.storeName,
          variant: taskData.variant,
          quantity: taskData.quantity,
          maxPrice: taskData.maxPrice,
          profileId: taskData.profileId,
          profileName: taskData.profileName,
          status: taskData.status || 'monitoring',
          dropTime: taskData.dropTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          retries: taskData.retries || 3,
          currentStep: 'monitoring',
        };

        set((state) => ({
          tasks: [newTask, ...state.tasks.filter((t) => t.id !== newTask.id)],
        }));

        get().addLog({
          level: 'INFO',
          message: `Created bot task for ${newTask.productName} (${newTask.variant}) on ${newTask.storeName}.`,
          productName: newTask.productName,
        });

        get().addToast(
          'Task Armed',
          `${newTask.productName} armed on ${newTask.storeName}.`,
          'info'
        );

        return newTask;
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
        }));
      },

      deleteTask: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        }));
        if (task) {
          get().addLog({
            level: 'WARN',
            message: `Deleted task for ${task.productName}.`,
            productName: task.productName,
          });
          get().addToast('Task Deleted', `${task.productName} task was removed.`, 'warn');
        }
      },

      pauseTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status: 'paused' } : t
          ),
        }));
        const task = get().tasks.find((t) => t.id === taskId);
        if (task) {
          get().addLog({
            level: 'WARN',
            message: `Paused task for ${task.productName}.`,
            productName: task.productName,
          });
          get().addToast('Task Paused', `${task.productName} monitoring suspended.`, 'warn');
        }
      },

      resumeTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status: 'monitoring' } : t
          ),
        }));
        const task = get().tasks.find((t) => t.id === taskId);
        if (task) {
          get().addLog({
            level: 'INFO',
            message: `Resumed task for ${task.productName}.`,
            productName: task.productName,
          });
          get().addToast('Task Resumed', `${task.productName} back online.`, 'info');
        }
      },

      stopAllTasks: () => {
        set((state) => ({
          tasks: state.tasks.map((t) => ({ ...t, status: 'paused' })),
        }));
        get().addLog({
          level: 'WARN',
          message: 'All automated tasks paused by operator command.',
        });
        get().addToast('All Tasks Paused', 'Paused monitoring across all stores.', 'warn');
      },

      resumeAllTasks: () => {
        set((state) => ({
          tasks: state.tasks.map((t) => ({ ...t, status: 'monitoring' })),
        }));
        get().addLog({
          level: 'INFO',
          message: 'All tasks resumed by operator command.',
        });
        get().addToast('All Tasks Resumed', 'Monitoring resumed for active tasks.', 'info');
      },

      drops: SEED_DROPS,
      stores: SEED_STORES,
      profiles: SEED_PROFILES,

      addProfile: (profileData) => {
        const id = 'prof-' + Date.now();
        const newProf: ShippingProfile = {
          ...profileData,
          id,
          isDefault: profileData.isDefault ?? false,
        };
        set((state) => ({
          profiles: [...state.profiles, newProf],
        }));
        get().addLog({
          level: 'INFO',
          message: `Added shipping profile "${newProf.name}" for ${newProf.fullName}.`,
        });
        get().addToast('Profile Added', `Profile "${newProf.name}" is now available.`, 'success');
        return newProf;
      },

      setDefaultProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.map((p) => ({
            ...p,
            isDefault: p.id === id,
          })),
        }));
      },

      addStore: (storeData) => {
        const id = 'store-' + Date.now();
        const newStore: StoreProfile = {
          ...storeData,
          id,
        };
        set((state) => ({
          stores: [...state.stores, newStore],
        }));
        get().addLog({
          level: 'INFO',
          message: `Connected store "${newStore.name}" (${newStore.url}).`,
        });
        get().addToast('Store Connected', `Store "${newStore.name}" ready for checkout.`, 'success');
        return newStore;
      },

      updateStoreStatus: (id, status, latency) => {
        set((state) => ({
          stores: state.stores.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status,
                  proxyLatencyMs: latency !== undefined ? latency : s.proxyLatencyMs,
                }
              : s
          ),
        }));
      },

      history: SEED_HISTORY,

      addHistoryItem: (item) => {
        set((state) => ({
          history: [item, ...state.history],
        }));
      },

      logs: SEED_LOGS,

      addLog: (log) => {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
          now.getMilliseconds()
        ).padStart(3, '0')}`;

        const newLog: LogEntry = {
          id: 'log-' + Math.random().toString(36).slice(2, 9),
          timestamp: timeStr,
          level: log.level,
          message: log.message,
          taskId: log.taskId,
          productName: log.productName,
          msDelta: log.msDelta,
        };

        set((state) => ({
          logs: [newLog, ...state.logs.slice(0, 199)], // keep last 200 logs
        }));
      },

      clearLogs: () => set({ logs: [] }),

      toasts: [],

      addToast: (title, description, type = 'info') => {
        const id = 'toast-' + Math.random().toString(36).slice(2, 9);
        const newToast: ToastMessage = {
          id,
          title,
          description,
          type,
          timestamp: Date.now(),
        };
        set((state) => ({
          toasts: [newToast, ...state.toasts],
        }));

        setTimeout(() => {
          get().removeToast(id);
        }, 4500);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      runningTaskId: null,
      setRunningTaskId: (id) => set({ runningTaskId: id }),
    }),
    {
      name: 'dropline_state_v1',
      partialize: (state) => ({
        tasks: state.tasks,
        stores: state.stores,
        profiles: state.profiles,
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        history: state.history,
      }),
    }
  )
);
