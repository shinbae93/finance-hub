import type { IsoDateString } from '@finance-hub/shared-api-types';

const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

export function toIsoDateString(date: Date): IsoDateString {
  return date.toISOString() as IsoDateString;
}

export function isIsoDateString(value: string): value is IsoDateString {
  return ISO_REGEX.test(value) && !Number.isNaN(Date.parse(value));
}
