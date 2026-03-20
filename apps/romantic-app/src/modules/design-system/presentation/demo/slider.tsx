import { useMemo, useState, type FormEvent } from 'react';

import { Slider } from '../../../../libs/ui/slider';

import { Example } from './example';

export function SliderDemo() {
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
    <Example
      id="slider-examples"
      title="Slider Demo"
      description="Radix Slider - usage examples"
    >
      <Example.Case
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
          <p className="b3">Range: 1 to 5, step 1.</p>
        </div>
      </Example.Case>

      <Example.Case
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
          <p className="b2">
            Live value: <strong>{controlledValue[0]}</strong>
          </p>
          <p className="b2">
            Committed value: <strong>{committedValue[0]}</strong>
          </p>
        </div>
      </Example.Case>

      <Example.Case
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
          <p className="b2">
            Selected interval: <strong>{formattedRange}</strong>
          </p>
          <p className="b3">
            `minStepsBetweenThumbs=2` with `step=5` enforces at least 10 units
            of gap.
          </p>
        </div>
      </Example.Case>

      <Example.Case
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
          <p className="b2">
            Brightness: <strong>{verticalValue[0]}%</strong>
          </p>
        </div>
      </Example.Case>

      <Example.Case
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
          <p className="b2">
            Values: <strong>{tripleValue.join(' / ')}</strong>
          </p>
        </div>
      </Example.Case>

      <Example.Case
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
          <p className="b3">
            Use this form when you need explicit thumb-level composition.
          </p>
        </div>
      </Example.Case>

      <Example.Case
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
          <p className="b3">Disabled sliders are non-interactive.</p>
        </div>
      </Example.Case>

      <Example.Case
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
          <p className="b2">
            Value: <strong>{rtlValue[0]}%</strong>
          </p>
        </div>
      </Example.Case>

      <Example.Case
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
          <p className="b2">
            Volume: <strong>{Math.round(volumeValue[0] * 100)}%</strong>
          </p>
        </div>
      </Example.Case>

      <Example.Case
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
          <p className="b2">{formResult}</p>
        </form>
      </Example.Case>
    </Example>
  );
}
