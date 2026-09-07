import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  User,
  UserCog,
  Users,
} from 'lucide-react';
import { copy } from './copy';
import { RoleOption } from './role-option';

const roleIcon = {
  candidate: User,
  recruiter: Users,
  interviewer: UserCog,
  admin: ShieldCheck,
} as const;

export const AssignMain = () => (
  <main
    data-e2e="roles:assign-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6 md:max-w-2xl">
      <div className="flex items-center gap-3">
        <a
          href="/roles/"
          aria-label={copy.assign.back}
          data-e2e="roles:assign-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <div>
          <h1 className="text-lg font-bold text-white">{copy.assign.title}</h1>
          <p className="text-sm text-slate-400">{copy.assign.subtitle}</p>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label={copy.assign.title}
        className="flex flex-col gap-3"
      >
        {copy.assign.roles.map((role) => (
          <RoleOption
            key={role.name}
            icon={roleIcon[role.name as keyof typeof roleIcon]}
            name={role.name}
            title={role.title}
            description={role.description}
            current={role.current}
            selected={role.name === copy.assign.selected}
            warning={role.name === 'admin' ? copy.assign.warning : undefined}
          />
        ))}
      </div>

      <button
        type="submit"
        data-e2e="roles:assign-submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
      >
        <Lock className="h-4 w-4" aria-hidden="true" />
        {copy.assign.submit}
      </button>
    </div>
  </main>
);
