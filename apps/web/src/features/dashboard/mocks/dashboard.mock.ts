import { DashboardSchema, type DashboardPayload } from "../validators/dashboard.schema";
import raw from "./dashboard.mock.json";

/** Typed view over the JSON fixture, validated against the contract. */
export const MOCK_DASHBOARD: DashboardPayload = DashboardSchema.parse(raw);
