import { concatMap, tap } from 'rxjs';
import type { Topic } from '../../domain/models';
import {
  postTopic,
  putTopic,
  removeTopic,
  type TopicInput,
} from '../../integration/repository';
import { mutate } from '../actions/mutate';
import { resolveId } from '../actions/pending';
import { snapshot } from '../actions/snapshot';
import { dropTopic, findTopic, place, rekeyTopic } from '../actions/topics';
import type { Bus } from '../bus';
import type { Store } from '../store';

/** What the server takes: placeholder ids of unsaved parents resolved. */
const inputOf = (store: Store, topic: Topic): TopicInput => ({
  catalogId: resolveId(store, topic.catalogId),
  title: topic.title,
  description: topic.description,
  tagIds: topic.tagIds.map((id) => resolveId(store, id)),
  studyDay: topic.studyDay,
});

export const createTopic = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_CREATE_TOPIC').pipe(
    tap(({ topic }) => place(store, topic)),
    concatMap(({ topic }) =>
      mutate(store, bus, {
        run: () => postTopic(inputOf(store, topic)),
        saved: (saved) => rekeyTopic(store, topic.id, saved),
        rollback: () => dropTopic(store, topic.id),
        success: 'Dodano temat.',
        failure: {
          title: 'Nie udało się dodać tematu',
          code: 'KNOWLEDGE_TOPIC_CREATE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_CREATE_TOPIC', { topic }),
      }),
    ),
  );

export const updateTopic = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_UPDATE_TOPIC').pipe(
    concatMap(({ topic }) => {
      const previous = findTopic(store, topic.id);
      place(store, topic);
      return mutate(store, bus, {
        run: () =>
          putTopic(resolveId(store, topic.id), {
            ...inputOf(store, topic),
            position: topic.position,
          }),
        saved: (saved) => place(store, saved),
        rollback: () => previous && place(store, previous),
        success: 'Zapisano temat.',
        failure: {
          title: 'Nie udało się zapisać tematu',
          code: 'KNOWLEDGE_TOPIC_UPDATE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_UPDATE_TOPIC', { topic }),
      });
    }),
  );

export const deleteTopic = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_DELETE_TOPIC').pipe(
    concatMap(({ id }) => {
      const restore = snapshot(store);
      dropTopic(store, id);
      return mutate(store, bus, {
        run: () => removeTopic(resolveId(store, id)),
        saved: () => undefined,
        rollback: restore,
        success: 'Usunięto temat.',
        failure: {
          title: 'Nie udało się usunąć tematu',
          code: 'KNOWLEDGE_TOPIC_DELETE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_DELETE_TOPIC', { id }),
      });
    }),
  );
