import backend from '@/backend';

export async function adjustStock({ articuloId, facturaId, cantidad }) {
  if (!articuloId || !facturaId || cantidad === undefined) {
    console.error("Parámetros incompletos para ajustar el stock:", { articuloId, facturaId, cantidad });
    throw new Error("Parámetros incompletos para ajustar el stock.");
  }
  
  try {
    const response = await backend.post(`/articulos/${articuloId}/ajustar-stock`, {
      cantidad,
      facturaId
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // Error específico de stock insuficiente o similar en el backend
      const errorMessage = error.response.data.message || 'Stock insuficiente';
      throw new Error(errorMessage); // Lanzar un error con mensaje personalizado
    } else {
      console.error('Error ajustando el stock:', error);
      throw new Error('Error desconocido al ajustar el stock.');
    }
  }
}
