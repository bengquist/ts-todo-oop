interface Validate {
  value: string | number;
  required?: boolean;
  min?: number;
  max?: number;
}

export default function validate({ value, ...options }: Validate) {
  let isValid = true;

  if (options.required) {
    isValid = isValid && value.toString().trim().length !== 0;
  }
  if (options.min && typeof value === "number") {
    isValid = isValid && value >= options.min;
  }
  if (options.min && typeof value === "string") {
    isValid = isValid && value.length >= options.min;
  }
  if (options.max && typeof value === "number") {
    isValid = isValid && value <= options.max;
  }
  if (options.max && typeof value === "string") {
    isValid = isValid && value.length <= options.max;
  }

  return isValid;
}
