import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SourceFormSchema, ValidationStepSchema } from '../validators/source-new.schema';
import { SourceFormData, ValidationStep } from '../types/source-new.types';
import { createSource } from '../api/source-new.queries';

const DEFAULT_FORM_DATA: SourceFormData = {
  nom: '',
  url: '',
  type: 'web',
  domaines: [],
};

const DEFAULT_VALIDATION_STEP: ValidationStep = {
  protocoleHttps: false,
  resolutionDns: false,
  accessibilite: false,
  maxPages: 10,
};

export function useSourceNew() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formMethods = useForm<SourceFormData>({
    resolver: zodResolver(SourceFormSchema),
    defaultValues: DEFAULT_FORM_DATA,
  });

  const validationMethods = useForm<ValidationStep>({
    resolver: zodResolver(ValidationStepSchema),
    defaultValues: DEFAULT_VALIDATION_STEP,
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const formData = formMethods.getValues();
      const validationData = validationMethods.getValues();
      const response = await createSource({ ...formData, ...validationData });
      return response;
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Une erreur est survenue');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 2));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const goToStep = (step: number) => setCurrentStep(step);

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    formMethods,
    validationMethods,
    handleSubmit,
    isSubmitting,
    submitError,
  };
}
