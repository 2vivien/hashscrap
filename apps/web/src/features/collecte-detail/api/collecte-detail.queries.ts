import { apiRequest } from "../../../lib/api-client";
import { CollecteDetailSchema, type CollecteDetail } from "../validators/collecte-detail.schema";

/** GET /api/v1/collectes/{job_id}; no synthetic details are generated. */
export async function fetchCollecteDetail(id: string, signal?: AbortSignal): Promise<CollecteDetail> {
  return apiRequest(`/collectes/${encodeURIComponent(id)}`, CollecteDetailSchema, { signal });
}
