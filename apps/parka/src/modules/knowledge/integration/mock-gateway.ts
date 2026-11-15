import type {
  CategoryDto,
  FolderDto,
  KnowledgeDto,
  KnowledgeGateway,
  NodeDto,
  PriorityDto,
} from './contracts';

const CATEGORIES: CategoryDto[] = [
  { id: 'kcat-code', name: 'Programowanie', icon: 'laptop', color: '#2563eb' },
  { id: 'kcat-lang', name: 'Języki', icon: 'globe', color: '#7c3aed' },
  { id: 'kcat-health', name: 'Zdrowie', icon: 'heart', color: '#0d9488' },
  { id: 'kcat-design', name: 'Design', icon: 'palette', color: '#be123c' },
  { id: 'kcat-money', name: 'Finanse', icon: 'wallet', color: '#a16207' },
];

const PRIORITIES: PriorityDto[] = [
  { id: 'low', name: 'Niski', value: 2 },
  { id: 'medium', name: 'Średni', value: 5 },
  { id: 'high', name: 'Wysoki', value: 9 },
];

const FOLDERS: FolderDto[] = [
  { id: 'kf-front', name: 'Architektura frontendu', areaId: 'frontal' },
  { id: 'kf-logic', name: 'Algorytmy i logika', areaId: 'parietal' },
  { id: 'kf-english', name: 'Angielski', areaId: 'temporal' },
  { id: 'kf-design', name: 'Design i kolor', areaId: 'occipital' },
  { id: 'kf-tools', name: 'Nawyki i narzędzia', areaId: 'cerebellum' },
  { id: 'kf-sleep', name: 'Sen i energia', areaId: 'brainstem' },
];

const node = (
  id: string,
  folderId: string,
  title: string,
  categoryId: string,
  priorityId: string,
  status: string,
  tags: string[],
  notes: string | null = null,
): NodeDto => ({
  id,
  folderId,
  title,
  notes,
  categoryId,
  priorityId,
  tags,
  status,
});

const NODES: NodeDto[] = [
  node(
    'kn-1',
    'kf-front',
    'Architektura modułów i warstw',
    'kcat-code',
    'high',
    'learned',
    ['architektura', 'react'],
    'Niskie sprzężenie, wysoka spójność.',
  ),
  node(
    'kn-2',
    'kf-front',
    'Event driven w interfejsie',
    'kcat-code',
    'high',
    'learning',
    ['eda', 'rxjs'],
  ),
  node(
    'kn-3',
    'kf-front',
    'Optimistic UI i rollback',
    'kcat-code',
    'medium',
    'to-learn',
    ['ux'],
  ),
  node(
    'kn-4',
    'kf-logic',
    'Złożoność obliczeniowa',
    'kcat-code',
    'medium',
    'learned',
    ['algorytmy'],
  ),
  node(
    'kn-5',
    'kf-logic',
    'Grafy i przeszukiwanie',
    'kcat-code',
    'low',
    'learning',
    ['algorytmy', 'grafy'],
  ),
  node(
    'kn-6',
    'kf-logic',
    'Rachunek prawdopodobieństwa',
    'kcat-money',
    'low',
    'to-learn',
    ['matematyka'],
  ),
  node(
    'kn-7',
    'kf-english',
    'Czasy przeszłe i ich użycie',
    'kcat-lang',
    'medium',
    'learned',
    ['gramatyka'],
  ),
  node(
    'kn-8',
    'kf-english',
    'Słownictwo biznesowe B2',
    'kcat-lang',
    'high',
    'learning',
    ['słówka', 'praca'],
  ),
  node(
    'kn-9',
    'kf-english',
    'Phrasal verbs, 50 najczęstszych',
    'kcat-lang',
    'medium',
    'to-learn',
    ['słówka'],
  ),
  node(
    'kn-10',
    'kf-design',
    'Kontrast i dostępność kolorów',
    'kcat-design',
    'high',
    'learned',
    ['a11y', 'kolor'],
  ),
  node(
    'kn-11',
    'kf-design',
    'Typografia i rytm pionowy',
    'kcat-design',
    'medium',
    'learning',
    ['typografia'],
  ),
  node(
    'kn-12',
    'kf-tools',
    'Skróty w edytorze i terminalu',
    'kcat-code',
    'low',
    'learning',
    ['narzędzia'],
  ),
  node(
    'kn-13',
    'kf-tools',
    'Cotygodniowy przegląd zadań',
    'kcat-health',
    'medium',
    'to-learn',
    ['nawyki'],
  ),
  node('kn-14', 'kf-sleep', 'Higiena snu', 'kcat-health', 'high', 'learned', [
    'sen',
    'nawyki',
  ]),
];

/** Mock backend: keeps everything in memory and answers after a short delay. */
export const createMockGateway = (latency = 0): KnowledgeGateway => {
  const db: KnowledgeDto = {
    categories: structuredClone(CATEGORIES),
    priorities: structuredClone(PRIORITIES),
    folders: structuredClone(FOLDERS),
    nodes: structuredClone(NODES),
  };
  const wait = () =>
    latency > 0
      ? new Promise<void>((resolve) => setTimeout(resolve, latency))
      : Promise.resolve();

  return {
    read: async () => {
      await wait();
      return structuredClone(db);
    },
    createNode: async (dto) => {
      await wait();
      db.nodes.push(dto);
      return dto;
    },
    updateNode: async (dto) => {
      await wait();
      db.nodes = db.nodes.map((n) => (n.id === dto.id ? dto : n));
      return dto;
    },
    deleteNode: async (id) => {
      await wait();
      db.nodes = db.nodes.filter((n) => n.id !== id);
    },
    createFolder: async (dto) => {
      await wait();
      db.folders.push(dto);
      return dto;
    },
  };
};
