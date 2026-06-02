import { useRef, useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isValid } from 'date-fns';
import { pl } from 'date-fns/locale';
import 'react-day-picker/style.css';
import './date-time-picker.css';
import { cn } from '@/libs/ui/cn';
import { inputCls } from './field';

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = {
  value?: string;
  onChange: (iso: string) => void;
  onBlur?: () => void;
  hasError?: boolean;
  id?: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const toDisplay = (iso: string) => {
  const d = new Date(iso);
  return isValid(d) ? format(d, 'dd/MM/yyyy HH:mm') : '';
};

const buildIso = (day: Date, time: string): string => {
  const [hh = '00', mm = '00'] = time.split(':');
  const d = new Date(day);
  d.setHours(Number(hh), Number(mm), 0, 0);
  return d.toISOString();
};

// ── Component ──────────────────────────────────────────────────────────────────

export const DateTimePicker = ({
  value,
  onChange,
  onBlur,
  hasError,
  id,
}: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedDate =
    value && isValid(new Date(value)) ? new Date(value) : undefined;
  const timeValue = selectedDate ? format(selectedDate, 'HH:mm') : '00:00';

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    onChange(buildIso(day, timeValue));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const base = selectedDate ?? new Date();
    onChange(buildIso(base, e.target.value));
  };

  return (
    <div ref={ref} className="relative">
      <input
        id={id}
        readOnly
        value={value ? toDisplay(value) : ''}
        placeholder="dd/mm/rrrr gg:mm"
        onClick={() => setOpen((v) => !v)}
        onBlur={onBlur}
        className={cn(inputCls(hasError), 'cursor-pointer')}
      />

      {open && (
        <div className="dp-wrapper absolute z-50 mt-1 w-fit rounded-xs border border-hairline bg-canvas p-4 shadow-lg">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            locale={pl}
            weekStartsOn={1}
          />

          <div className="mt-1 border-t border-hairline pt-3 flex items-center gap-2">
            <span className="text-xs text-muted">Godzina:</span>
            <input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="rounded-xs border border-hairline bg-canvas px-2 py-1 text-sm text-ink outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
};
