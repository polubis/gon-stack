import type { Registry } from './registry';
import type { Store } from './store';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    bootstrap: () => trigger('[TRIGGER]_BOOTSTRAP'),
    selectThread: (threadId: string) =>
      trigger('[TRIGGER]_SELECT_THREAD', { threadId }),
    updateDraft: (body: string) => trigger('[TRIGGER]_UPDATE_DRAFT', { body }),
    sendMessage: () => trigger('[TRIGGER]_SEND_MESSAGE'),
    retryConnection: () => trigger('[TRIGGER]_RETRY_CONNECTION'),
    updateSearch: (query: string) =>
      trigger('[TRIGGER]_UPDATE_SEARCH', { query }),
    useIsBootstrapping: () => store.$isBootstrapping.use(),
    useBootstrapError: () => store.$bootstrapError.use(),
    useFilteredThreads: () => store.$filteredThreads.use(),
    useActiveThread: () => store.$activeThread.use(),
    useActiveMessages: () => store.$activeMessages.use(),
    useDraft: () => store.$draft.use(),
    useIsSending: () => store.$isSending.use(),
    useAssistantTyping: () => store.$assistantTyping.use(),
    useConnection: () => store.$connection.use(),
    useErrorMessage: () => store.$errorMessage.use(),
    useSearchQuery: () => store.$searchQuery.use(),
  };
};
