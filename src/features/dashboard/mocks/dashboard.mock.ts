import { DashboardResponseSchema } from '../validators/dashboard.schema';
import raw from './dashboard.mock.json';

export const MOCK_DASHBOARD = DashboardResponseSchema.parse(raw);
