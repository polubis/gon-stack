import { Card } from '../../../libs/ui/card';

export type NavigationItem = {
  id: string;
  label: string;
};

export type NavigationGroup = {
  key: string;
  label: string;
  rootId: string;
  items: NavigationItem[];
};

type NavigationProps = {
  groups: NavigationGroup[];
  activeGroupKey: string;
  activeSectionId: string;
  onNavigate: (groupKey: string, sectionId: string) => void;
};

export function Navigation({
  groups,
  activeGroupKey,
  activeSectionId,
  onNavigate,
}: NavigationProps) {
  return (
    <aside className="xl:sticky xl:top-6 xl:self-start">
      <Card className="p-5 space-y-5">
        <div>
          <p className="v2">On this page</p>
          <nav className="mt-3 space-y-4 text-sm">
            {groups.map((group) => (
              <div key={group.key} className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate(group.key, group.rootId)}
                  className={
                    activeGroupKey === group.key
                      ? 'text-text-primary'
                      : 'text-text-secondary'
                  }
                >
                  {group.label}
                </button>
                <div className="pl-3 flex flex-col gap-1.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(group.key, item.id)}
                      className={
                        activeSectionId === item.id
                          ? 'text-text-primary text-left'
                          : 'text-text-secondary hover:text-text-primary text-left'
                      }
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </Card>
    </aside>
  );
}
