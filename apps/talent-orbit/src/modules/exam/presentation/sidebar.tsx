import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileBarChart2,
  FileCheck2,
  HelpCircle,
  LayoutDashboard,
  Moon,
  Settings,
  Users,
} from 'lucide-react';
import { copy } from './copy';

const navItems = [
  { icon: LayoutDashboard, label: copy.nav.home },
  { icon: BarChart3, label: copy.nav.assessments },
  { icon: Users, label: copy.nav.users },
  { icon: BookOpen, label: copy.nav.knowledgeBank },
  { icon: ClipboardCheck, label: copy.nav.tests },
  { icon: FileCheck2, label: copy.nav.exams },
  { icon: FileBarChart2, label: copy.nav.reports },
];

export const Sidebar = () => (
  <aside
    data-e2e="exam:sidebar"
    className="hidden w-60 shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-900 px-4 py-6 pb-20 md:flex"
  >
    <div>
      <div className="flex items-center gap-2 px-2">
        <Moon
          className="h-6 w-6 rotate-[-100deg] fill-orange-500 text-orange-500"
          aria-hidden="true"
        />
        <span className="text-sm font-bold leading-tight tracking-wide text-white">
          TALENT
          <br />
          ORBIT
        </span>
      </div>

      <nav aria-label={copy.brand.name} className="mt-8 flex flex-col gap-1">
        {navItems.map(({ icon: Icon, label }) => {
          const active = label === copy.nav.exams;

          return (
            <a
              key={label}
              href="#"
              aria-current={active ? 'page' : undefined}
              data-e2e={`exam:nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                active
                  ? 'border-l-2 border-orange-500 bg-orange-500/10 text-orange-400'
                  : 'border-l-2 border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              {label}
            </a>
          );
        })}
      </nav>
    </div>

    <div className="flex flex-col gap-1">
      <a
        href="#"
        data-e2e="exam:nav-support-center"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        <HelpCircle className="h-4.5 w-4.5" aria-hidden="true" />
        {copy.nav.supportCenter}
      </a>
      <a
        href="#"
        data-e2e="exam:nav-settings"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        <Settings className="h-4.5 w-4.5" aria-hidden="true" />
        {copy.nav.settings}
      </a>
    </div>
  </aside>
);
