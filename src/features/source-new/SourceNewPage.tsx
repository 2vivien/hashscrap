import { useSourceNew } from './hooks/useSourceNew';
import { SourceForm } from './components/SourceForm';
import { ValidationStep } from './components/ValidationStep';
import { Recapitulatif } from './components/Recapitulatif';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { FormProvider } from 'react-hook-form';

const SourceNewPage = () => {
  const {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    formMethods,
    validationMethods,
    handleSubmit,
    isSubmitting,
    submitError,
  } = useSourceNew();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvelle source"
        description="Créez une nouvelle source de collecte"
      />

      <Tabs value={`step-${currentStep}`} onValueChange={(value) => goToStep(parseInt(value.replace('step-', '')))}>
        <TabsList>
          <TabsTrigger value="step-0">Informations</TabsTrigger>
          <TabsTrigger value="step-1">Validation</TabsTrigger>
          <TabsTrigger value="step-2">Récapitulatif</TabsTrigger>
        </TabsList>

        <TabsContent value="step-0">
          <FormProvider {...formMethods}>
            <SourceForm onNext={nextStep} />
          </FormProvider>
        </TabsContent>

        <TabsContent value="step-1">
          <FormProvider {...validationMethods}>
            <ValidationStep onNext={nextStep} onPrev={prevStep} />
          </FormProvider>
        </TabsContent>

        <TabsContent value="step-2">
          <FormProvider {...formMethods}>
            <FormProvider {...validationMethods}>
              <Recapitulatif
                onPrev={prevStep}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            </FormProvider>
          </FormProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SourceNewPage;
