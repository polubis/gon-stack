import { useState, type ComponentType } from 'react';

import { CardDemo } from './demo/card';
import { SliderDemo } from './demo/slider';
import { TextDemo } from './demo/text';
import { Layout } from './layout';
import {
  Navigation,
  type NavigationGroup,
  type NavigationItem,
} from './navigation';

type ComponentKey = string;

type DemoComponentConfig = {
  key: ComponentKey;
  label: string;
  rootId: string;
  items: NavigationItem[];
  demo: ComponentType;
};

function createDemoConfig(config: DemoComponentConfig): DemoComponentConfig {
  return config;
}

const components = [
  createDemoConfig({
    key: 'card',
    label: 'Card',
    rootId: 'card-examples',
    items: [
      { id: 'card-basic', label: 'Basic usage' },
      { id: 'card-structured', label: 'Structured content' },
      { id: 'card-long-content', label: 'Long content' },
      { id: 'card-nested', label: 'Nested cards' },
    ],
    demo: CardDemo,
  }),
  createDemoConfig({
    key: 'text',
    label: 'Text',
    rootId: 'text-examples',
    items: [
      { id: 'text-headings', label: 'Headings (H1-H6)' },
      { id: 'text-body', label: 'Body (B1-B3)' },
      { id: 'text-meta', label: 'Captions / Labels / Overline' },
      { id: 'text-ornamental', label: 'Ornamental (O1-O2)' },
    ],
    demo: TextDemo,
  }),
  createDemoConfig({
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
    demo: SliderDemo,
  }),
];

const title = 'Design System Sandbox';
const subtitle = 'Choose a component from the sidebar to browse its examples.';

export function Router() {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>(
    components[0]?.key ?? '',
  );
  const [activeSection, setActiveSection] = useState<string>(
    components[0]?.rootId ?? '',
  );

  const activeConfig =
    components.find((component) => component.key === activeComponent) ??
    components[0];

  const navigationGroups: NavigationGroup[] = components.map((component) => ({
    key: component.key,
    label: component.label,
    rootId: component.rootId,
    items: component.items,
  }));

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

  const Demo = activeConfig?.demo;

  return (
    <div className="w-full max-w-6xl">
      <div className="mb-6 space-y-2">
        <p className="v1">Components / UI</p>
        <h1 className="t1">{title}</h1>
        <p className="b2">{subtitle}</p>
      </div>

      <Layout>
        <Navigation
          groups={navigationGroups}
          activeGroupKey={activeComponent}
          activeSectionId={activeSection}
          onNavigate={navigateTo}
        />
        <Demo />
      </Layout>
    </div>
  );
}
