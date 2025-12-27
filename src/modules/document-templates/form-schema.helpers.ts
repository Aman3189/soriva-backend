/**
 * SORIVA - Common Form Schema Helpers
 * Single source - all schema files import from here
 */

export interface FormStep {
  id: string;
  promptKey: string;
  fields: string[];
  optional?: boolean;
  isArray?: boolean;
  condition?: string;
}

export interface BaseFormSchema {
  type: string;
  templateId: string;
  promptKeyPrefix: string;
  steps: FormStep[];
  template: string;
}

// Generic helpers - work with any schema type
export const getForm = <T extends BaseFormSchema>(forms: Record<string, T>, type: string): T | null => forms[type] || null;
export const getStep = <T extends BaseFormSchema>(forms: Record<string, T>, type: string, stepId: string): FormStep | null => {
  const form = forms[type];
  return form?.steps.find(s => s.id === stepId) || null;
};
export const getFields = <T extends BaseFormSchema>(forms: Record<string, T>, type: string): string[] => {
  const form = forms[type];
  return form?.steps.flatMap(s => s.fields) || [];
};
export const getRequiredSteps = <T extends BaseFormSchema>(forms: Record<string, T>, type: string): FormStep[] => {
  const form = forms[type];
  return form?.steps.filter(s => !s.optional) || [];
};
export const getOptionalSteps = <T extends BaseFormSchema>(forms: Record<string, T>, type: string): FormStep[] => {
  const form = forms[type];
  return form?.steps.filter(s => s.optional) || [];
};
export const getArraySteps = <T extends BaseFormSchema>(forms: Record<string, T>, type: string): FormStep[] => {
  const form = forms[type];
  return form?.steps.filter(s => s.isArray) || [];
};
export const getTypes = <T extends BaseFormSchema>(forms: Record<string, T>): string[] => Object.keys(forms);