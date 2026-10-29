import { SourceNewResponseSchema } from '../validators/source-new.schema';
import { apiRequest } from '../../../lib/api-client';

// Cette fonction est un mock car l'API de création de source n'est pas encore exposée

export async function createSource(data: any, signal?: AbortSignal) {
  // Dans une implémentation réelle, on utiliserait :
  // return apiRequest('/sources', SourceNewResponseSchema, {
  //   method: 'POST',
  //   body: data,
  //   signal,
  // });
  
  // Pour l'instant, on simule une réponse réussie
  return SourceNewResponseSchema.parse({
    success: true,
    message: 'Source créée avec succès',
  });
}
