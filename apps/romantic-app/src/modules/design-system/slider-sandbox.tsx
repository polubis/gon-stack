import { useMemo, useState, type ReactNode, type FormEvent } from 'react';

import { Slider } from '../../libs/ui/slider';

function ExampleCard({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="variant-card rounded-xl p-5 md:p-6">
      <header className="mb-4 space-y-1">
        <h2 className="text-lg text-text-primary">{title}</h2>
        <p className="text-sm text-text-secondary">{description}</p>
      </header>
      {children}
    </section>
  );
}

export function SliderSandbox() {
  const [controlledValue, setControlledValue] = useState([4]);
  const [committedValue, setCommittedValue] = useState([4]);
  const [rangeValue, setRangeValue] = useState([20, 80]);
  const [tripleValue, setTripleValue] = useState([15, 50, 85]);
  const [verticalValue, setVerticalValue] = useState([60]);
  const [rtlValue, setRtlValue] = useState([25]);
  const [volumeValue, setVolumeValue] = useState([0.72]);
  const [formResult, setFormResult] = useState<string>('No submission yet');

  const formattedRange = useMemo(
    () => `${rangeValue[0]} - ${rangeValue[1]}`,
    [rangeValue],
  );

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const moodRaw = formData.getAll('mood');
    const moodValues = moodRaw.map((item) => Number(item));
    setFormResult(`Submitted mood value(s): ${moodValues.join(', ')}`);
  };

  return (
    <div id="slider-examples" className="w-full max-w-6xl space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">
          Radix Slider - usage examples
        </p>
        <h1 className="text-3xl text-text-primary">Slider Sandbox</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ExampleCard
          id="slider-basic"
          title="1) Basic (Uncontrolled)"
          description="Default Radix usage with defaultValue and optional value label."
        >
          <div className="space-y-4">
            <Slider.Root
              min={1}
              max={5}
              step={1}
              defaultValue={[3]}
              className="pt-7"
              aria-label="Basic slider"
            >
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumbs showValueLabel />
            </Slider.Root>
            <p className="text-xs text-text-tertiary">Range: 1 to 5, step 1.</p>
          </div>
        </ExampleCard>

        <ExampleCard
          id="slider-controlled"
          title="2) Controlled + Commit"
          description="Controlled state with onValueChange and onValueCommit."
        >
          <div className="space-y-4">
            <Slider.Root
              min={1}
              max={10}
              step={1}
              value={controlledValue}
              onValueChange={setControlledValue}
              onValueCommit={setCommittedValue}
              className="pt-7"
              aria-label="Controlled slider"
            >
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumbs
                showValueLabel
                formatValueLabel={(value) => `Q${value}`}
              />
            </Slider.Root>
            <div className="text-sm text-text-secondary">
              Live value:{' '}
              <strong className="text-text-primary">
                {controlledValue[0]}
              </strong>
            </div>
            <div className="text-sm text-text-secondary">
              Committed value:{' '}
              <strong className="text-text-primary">{committedValue[0]}</strong>
            </div>
          </div>
        </ExampleCard>

        <ExampleCard
          id="slider-range"
          title="3) Range (Two thumbs)"
          description="Multi-thumb slider for selecting a min/max interval."
        >
          <div className="space-y-4">
            <Slider.Root
              min={0}
              max={100}
              step={5}
              value={rangeValue}
              onValueChange={setRangeValue}
              minStepsBetweenThumbs={2}
              className="pt-7"
              aria-label="Range slider"
            >
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumbs />
            </Slider.Root>
            <p className="text-sm text-text-secondary">
              Selected interval:{' '}
              <strong className="text-text-primary">{formattedRange}</strong>
            </p>
            <p className="text-xs text-text-tertiary">
              `minStepsBetweenThumbs=2` with `step=5` enforces at least 10 units
              of gap.
            </p>
          </div>
        </ExampleCard>

        <ExampleCard
          id="slider-vertical"
          title="4) Vertical"
          description="Vertical orientation for compact side controls."
        >
          <div className="flex items-end gap-6">
            <Slider.Root
              orientation="vertical"
              min={0}
              max={100}
              step={5}
              value={verticalValue}
              onValueChange={setVerticalValue}
              className="h-48 pt-7"
              aria-label="Vertical slider"
            >
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumbs />
            </Slider.Root>
            <div className="text-sm text-text-secondary">
              Brightness:{' '}
              <strong className="text-text-primary">{verticalValue[0]}%</strong>
            </div>
          </div>
        </ExampleCard>

        <ExampleCard
          id="slider-triple"
          title="9) Multi-thumb (Three thumbs)"
          description="Automatic thumb generation for 3-value controls."
        >
          <div className="space-y-4">
            <Slider.Root
              min={0}
              max={100}
              step={1}
              value={tripleValue}
              onValueChange={setTripleValue}
              minStepsBetweenThumbs={5}
              className="pt-7"
              aria-label="Three thumbs slider"
            >
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumbs />
            </Slider.Root>
            <p className="text-sm text-text-secondary">
              Values:{' '}
              <strong className="text-text-primary">
                {tripleValue.join(' / ')}
              </strong>
            </p>
          </div>
        </ExampleCard>

        <ExampleCard
          id="slider-manual"
          title="10) Manual single-thumb"
          description="Direct Thumb usage for explicit one-thumb composition."
        >
          <div className="space-y-4">
            <Slider.Root
              min={0}
              max={100}
              defaultValue={[35]}
              className="pt-7"
              aria-label="Manual single thumb slider"
            >
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb
                index={0}
                showValueLabel
                formatValueLabel={(value) => `${value}%`}
              />
            </Slider.Root>
            <p className="text-xs text-text-tertiary">
              Use this form when you need explicit thumb-level composition.
            </p>
          </div>
        </ExampleCard>

        <ExampleCard
          id="slider-disabled"
          title="5) Disabled"
          description="Read-only visual state for unavailable controls."
        >
          <div className="space-y-4">
            <Slider.Root
              min={0}
              max={100}
              defaultValue={[40]}
              disabled
              className="pt-7"
              aria-label="Disabled slider"
            >
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumbs showValueLabel />
            </Slider.Root>
            <p className="text-xs text-text-tertiary">
              Disabled sliders are non-interactive.
            </p>
          </div>
        </ExampleCard>

        <ExampleCard
          id="slider-rtl"
          title="6) RTL Direction"
          description="Works with right-to-left direction by setting dir='rtl'."
        >
          <div className="space-y-4">
            <Slider.Root
              min={0}
              max={100}
              value={rtlValue}
              onValueChange={setRtlValue}
              dir="rtl"
              className="pt-7"
              aria-label="RTL slider"
            >
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumbs
                showValueLabel
                formatValueLabel={(value) => `${value}%`}
              />
            </Slider.Root>
            <p className="text-sm text-text-secondary">
              Value:{' '}
              <strong className="text-text-primary">{rtlValue[0]}%</strong>
            </p>
          </div>
        </ExampleCard>

        <ExampleCard
          id="slider-custom-step"
          title="7) Custom Step + Label Format"
          description="Decimal step with custom label formatting."
        >
          <div className="space-y-4">
            <Slider.Root
              min={0}
              max={1}
              step={0.01}
              value={volumeValue}
              onValueChange={setVolumeValue}
              className="pt-7"
              aria-label="Volume slider"
            >
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumbs
                showValueLabel
                formatValueLabel={(value) => `${Math.round(value * 100)}%`}
              />
            </Slider.Root>
            <p className="text-sm text-text-secondary">
              Volume:{' '}
              <strong className="text-text-primary">
                {Math.round(volumeValue[0] * 100)}%
              </strong>
            </p>
          </div>
        </ExampleCard>

        <ExampleCard
          id="slider-form"
          title="8) Form Integration (name prop)"
          description="Radix inserts hidden inputs so slider values submit in native forms."
        >
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <Slider.Root
              name="mood"
              min={1}
              max={5}
              step={1}
              defaultValue={[3]}
              className="pt-7"
              aria-label="Mood slider"
            >
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumbs showValueLabel />
            </Slider.Root>
            <button
              type="submit"
              className="variant-button-primary rounded-md px-4 py-2 text-sm font-semibold"
            >
              Submit form
            </button>
            <p className="text-sm text-text-secondary">{formResult}</p>
          </form>
        </ExampleCard>
      </div>
    </div>
  );
}
