import { SourceFormSchema, ValidationStepSchema } from '../validators/source-new.schema';
import raw from './source-new.mock.json';

export const MOCK_SOURCE_FORM = SourceFormSchema.parse(raw.form);

export const MOCK_VALIDATION_STEP = ValidationStepSchema.parse(raw.validation);
