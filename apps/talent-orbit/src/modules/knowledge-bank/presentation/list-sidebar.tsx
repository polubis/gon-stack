import {
  HelpCircle,
  LayoutDashboard,
  Moon,
  Settings,
  Users,
  BarChart3,
} from 'lucide-react';
import { copy } from './copy';

const navItems = [
  { icon: LayoutDashboard, label: copy.nav.home },
  { icon: BarChart3, label: copy.nav.assessments },
  { icon: Users, label: copy.nav.invites },
  { icon: HelpCircle, label: copy.nav.supportCenter },
];

export const ListSidebar = () => (
  <aside
    data-e2e="knowledge-bank:sidebar"
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
        {navItems.map(({ icon: Icon, label }) => (
          <a
            key={label}
            href="#"
            data-e2e={`knowledge-bank:nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            {label}
          </a>
        ))}
      </nav>
    </div>

    <a
      href="#"
      data-e2e="knowledge-bank:nav-settings"
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
    >
      <Settings className="h-4.5 w-4.5" aria-hidden="true" />
      {copy.nav.settings}
    </a>
  </aside>
);
