import { useState, type ReactNode } from 'react';

import { Card } from '../../libs/ui/card';
import { Text } from '../../libs/ui/text';
import { CardSandbox } from './card-sandbox';
import { SliderSandbox } from './slider-sandbox';
import { TextSandbox } from './text-sandbox';

type ComponentKey = string;

export type RouterNavItem = {
  id: string;
  label: string;
};

export type RouterComponentConfig = {
  key: ComponentKey;
  label: string;
  rootId: string;
  items: RouterNavItem[];
  content: ReactNode;
};

type DesignSystemRouterProps = {
  title: string;
  subtitle: string;
  components: RouterComponentConfig[];
};

export function DesignSystemRouter({
  title,
  subtitle,
  components,
}: DesignSystemRouterProps) {
  const initialComponentKey = components[0]?.key ?? '';
  const [activeComponent, setActiveComponent] =
    useState<ComponentKey>(initialComponentKey);
  const [activeSection, setActiveSection] = useState<string>(
    components[0]?.rootId ?? '',
  );

  const activeConfig =
    components.find((component) => component.key === activeComponent) ??
    components[0];

  const navigateTo = (componentKey: ComponentKey, sectionId: string) => {
    setActiveComponent(componentKey);
    setActiveSection(sectionId);

    window.requestAnimationFrame(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="mb-6 space-y-2">
        <Text.V1>Components / UI</Text.V1>
        <Text.H1>{title}</Text.H1>
        <Text.B2>{subtitle}</Text.B2>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[30%_70%]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <Card className="p-5 space-y-5">
            <div>
              <Text.V2>On this page</Text.V2>
              <nav className="mt-3 space-y-4 text-sm">
                {components.map((component) => (
                  <div key={component.key} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => navigateTo(component.key, component.rootId)}
                      className={
                        activeComponent === component.key
                          ? 'text-text-primary'
                          : 'text-text-secondary'
                      }
                    >
                      {component.label}
                    </button>
                    <div className="pl-3 flex flex-col gap-1.5">
                      {component.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigateTo(component.key, item.id)}
                          className={
                            activeSection === item.id
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

        <div>{activeConfig?.content}</div>
      </div>
    </div>
  );
}

export function DesignSystemSandboxRouter() {
  const components: RouterComponentConfig[] = [
    {
      key: 'card',
      label: 'Card',
      rootId: 'card-examples',
      items: [
        { id: 'card-basic', label: 'Basic usage' },
        { id: 'card-structured', label: 'Structured content' },
        { id: 'card-long-content', label: 'Long content' },
        { id: 'card-nested', label: 'Nested cards' },
      ],
      content: <CardSandbox />,
    },
    {
      key: 'text',
      label: 'Text',
      rootId: 'text-examples',
      items: [
        { id: 'text-headings', label: 'Headings (H1-H6)' },
        { id: 'text-body', label: 'Body (B1-B3)' },
        { id: 'text-meta', label: 'Captions / Labels / Overline' },
        { id: 'text-ornamental', label: 'Ornamental (O1-O2)' },
      ],
      content: <TextSandbox />,
    },
    {
      key: 'slider',
      label: 'Slider',
      rootId: 'slider-examples',
      items: [
        { id: 'slider-basic', label: 'Basic (Uncontrolled)' },
        { id: 'slider-controlled', label: 'Controlled + Commit' },
        { id: 'slider-range', label: 'Range (Two thumbs)' },
        { id: 'slider-vertical', label: 'Vertical' },
        { id: 'slider-triple', label: 'Multi-thumb (Three thumbs)' },
        { id: 'slider-manual', label: 'Manual single-thumb' },
        { id: 'slider-disabled', label: 'Disabled' },
        { id: 'slider-rtl', label: 'RTL Direction' },
        { id: 'slider-custom-step', label: 'Custom Step + Label' },
        { id: 'slider-form', label: 'Form Integration' },
      ],
      content: <SliderSandbox />,
    },
  ];

  return (
    <DesignSystemRouter
      title="Design System Sandbox"
      subtitle="Choose a component from the sidebar to browse its examples."
      components={components}
    />
  );
}
