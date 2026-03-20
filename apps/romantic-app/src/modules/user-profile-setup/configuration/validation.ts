export const VALIDATION_ERROR_MAP = {
  required: 'Required field',
  min: 'Value is too low',
  max: 'Value is too high',
} as const;

export const createFieldConfig = (
  config?: Partial<{
    required: boolean;
    min: number;
    max: number;
    valueAsNumber: boolean;
  }>,
) => {
  const { required, min, max, valueAsNumber = false } = config ?? {};

  return {
    valueAsNumber,
    required: required ? VALIDATION_ERROR_MAP.required : false,
    min: min
      ? {
          value: min,
          message: VALIDATION_ERROR_MAP.min,
        }
      : undefined,
    max: max
      ? {
          value: max,
          message: VALIDATION_ERROR_MAP.max,
        }
      : undefined,
  };
};
