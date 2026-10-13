import { cn } from '@repo/react-kit/cn';
import { LocateFixed } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  DEVICE_AVATARS,
  DEVICE_AVATAR_IDS,
} from '@/shared/device/domain/avatars';
import {
  deviceAutoName,
  deviceDetailsLine,
  deviceLabel,
  deviceShortId,
} from '@/shared/device/domain/label';
import type { Device } from '@/shared/device/domain/models';
import { currentDeviceId } from '@/shared/device/integration/current-device';
import { DeviceAvatar } from '@/shared/device/presentation/device-avatar';
import { DeviceBubble } from '@/shared/device/presentation/device-bubble';
import { DeviceIcon } from '@/shared/device/presentation/device-icon';
import { ClearableInput } from '@/shared/ui/clearable';
import { Button } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';

type Patch = Partial<Pick<Device, 'avatar' | 'customName'>>;

type Props = {
  devices: Device[];
  onChange: (id: Device['id'], patch: Patch) => void;
};

const HIGHLIGHT_MS = 3000;
const ZWSP = '​';

const OPTION =
  'grid h-9 w-9 place-items-center rounded-full border transition-colors';

const subscribeNever = () => () => {};

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';

/** Optional own name; saved on Enter or when the field loses focus. */
const NameField = ({
  device,
  onCommit,
}: {
  device: Device;
  onCommit: (name: string | null) => void;
}) => {
  const [draft, setDraft] = useState(device.customName ?? '');
  const [seen, setSeen] = useState(device.customName);
  // Follow the saved name (reload, rollback) without an effect.
  if (seen !== device.customName) {
    setSeen(device.customName);
    setDraft(device.customName ?? '');
  }

  const commit = () => {
    const next = draft.trim() || null;
    if (next !== (device.customName || null)) onCommit(next);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        commit();
      }}
    >
      <ClearableInput
        value={draft}
        maxLength={40}
        aria-label={`Nazwa urządzenia ${deviceAutoName(device)}`}
        placeholder={deviceAutoName(device)}
        data-e2e={`settings:device-name:${device.id}`}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
      />
    </form>
  );
};

const DeviceRow = ({
  device,
  isCurrent,
  highlighted,
  rowRef,
  onChange,
}: {
  device: Device;
  isCurrent: boolean;
  highlighted: boolean;
  rowRef: (el: HTMLLIElement | null) => void;
  onChange: (patch: Patch) => void;
}) => {
  const secondary = deviceDetailsLine(device);
  return (
    <li
      ref={rowRef}
      tabIndex={-1}
      data-e2e={`settings:device:${device.id}`}
      data-highlighted={highlighted || undefined}
      className={cn(
        'space-y-2 rounded-xl px-2 py-3',
        highlighted &&
          'animate-device-pulse bg-brand-soft ring-2 ring-brand motion-reduce:animate-none',
      )}
    >
      <div className="flex items-center gap-3">
        <DeviceBubble
          device={device}
          className="h-10 w-10"
          iconClassName="h-5 w-5"
        />
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <span className="truncate">{deviceLabel(device)}</span>
            {isCurrent ? (
              <span
                data-e2e={`settings:device-this:${device.id}`}
                className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-caption font-semibold text-brand-dark"
              >
                To urządzenie
              </span>
            ) : null}
          </p>
          <p className="truncate text-xs text-ink-soft">
            {deviceShortId(device.id)}
            {secondary ? ` · ${secondary}` : ''}
          </p>
        </div>
      </div>
      <NameField
        device={device}
        onCommit={(customName) => onChange({ customName })}
      />
      <div
        role="radiogroup"
        aria-label={`Awatar urządzenia ${deviceLabel(device)}`}
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          role="radio"
          aria-checked={device.avatar === null}
          data-e2e={`settings:device-avatar:${device.id}:default`}
          aria-label="Domyślna ikona"
          title="Domyślna ikona"
          className={cn(
            OPTION,
            device.avatar === null
              ? 'border-brand bg-brand text-on-brand'
              : 'border-line text-ink-soft hover:bg-hover-soft',
          )}
          onClick={() => onChange({ avatar: null })}
        >
          <DeviceIcon type={device.type} className="h-4 w-4" />
        </button>
        {DEVICE_AVATAR_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={device.avatar === id}
            data-e2e={`settings:device-avatar:${device.id}:${id}`}
            aria-label={DEVICE_AVATARS[id]}
            title={DEVICE_AVATARS[id]}
            className={cn(
              OPTION,
              device.avatar === id
                ? 'border-brand bg-brand text-on-brand'
                : 'border-line text-ink-soft hover:bg-hover-soft',
            )}
            onClick={() => onChange({ avatar: id })}
          >
            <DeviceAvatar avatar={id} type={device.type} className="h-4 w-4" />
          </button>
        ))}
      </div>
    </li>
  );
};

/** Recognise each device (color, model, id), name it, pick its picture. */
export const DevicesCard = ({ devices, onChange }: Props) => {
  // Browser-only value: unknown while rendering on the server.
  const currentId = useSyncExternalStore(
    subscribeNever,
    currentDeviceId,
    () => null,
  );
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const rows = useRef(new Map<string, HTMLLIElement>());

  useEffect(() => {
    if (!highlighted) return;
    const timer = setTimeout(() => setHighlighted(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlighted]);

  const current = devices.find((d) => d.id === currentId);

  const identify = () => {
    if (!current) return;
    const row = rows.current.get(current.id);
    row?.scrollIntoView?.({ block: 'center', behavior: scrollBehavior() });
    row?.focus({ preventScroll: true });
    setHighlighted(current.id);
    // Alternating invisible suffix makes a repeat press announce again.
    setAnnouncement(
      (previous) =>
        `To urządzenie: ${deviceLabel(current)}, ${deviceShortId(current.id)}` +
        (previous.endsWith(ZWSP) ? '' : ZWSP),
    );
  };

  return (
    <Card
      as="section"
      className="space-y-3 lg:col-span-2"
      data-e2e="settings:devices"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink-soft">Urządzenia</h2>
        {devices.length > 0 ? (
          <Button
            variant="ghost"
            className="w-auto px-3 py-1.5"
            data-e2e="settings:identify-device"
            disabled={!current}
            onClick={identify}
          >
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
            Rozpoznaj to urządzenie
          </Button>
        ) : null}
      </div>
      <p
        role="status"
        className="sr-only"
        data-e2e="settings:device-announcement"
      >
        {announcement}
      </p>
      {devices.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Urządzenia pojawią się tu po dodaniu pierwszego wydatku.
        </p>
      ) : (
        <>
          {!current ? (
            <p className="text-xs text-ink-soft">
              Dodaj wydatek na tym urządzeniu, aby je tu rozpoznać.
            </p>
          ) : null}
          <ul className="divide-y divide-line">
            {devices.map((device) => (
              <DeviceRow
                key={device.id}
                device={device}
                isCurrent={device.id === currentId}
                highlighted={device.id === highlighted}
                rowRef={(el) => {
                  if (el) rows.current.set(device.id, el);
                  else rows.current.delete(device.id);
                }}
                onChange={(patch) => onChange(device.id, patch)}
              />
            ))}
          </ul>
        </>
      )}
    </Card>
  );
};
