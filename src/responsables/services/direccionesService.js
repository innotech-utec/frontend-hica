const API_URL = 'https://direcciones.ide.uy/api/v0/geocode';

export const obtenerLocalidades = async (departamento) => {
  if (!departamento) {
    throw new Error('El departamento es requerido');
  }

  try {
    console.log("Llamada a obtenerLocalidades con departamento:", departamento);
    
    // Asegurarse de que el departamento esté correctamente codificado para la URL
    const departamentoEncoded = encodeURIComponent(departamento.trim());
    
    const response = await fetch(
      `${API_URL}/localidades?departamento=${departamentoEncoded}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          // Agregar header de Content-Type si la API lo requiere
          'Content-Type': 'application/json',
        },
      }
    );

    // Loguear el status de la respuesta
    console.log("Status de la respuesta:", response.status);

    if (!response.ok) {
      // Intentar obtener más detalles del error
      let errorDetail;
      try {
        errorDetail = await response.text();
        console.error("Detalle del error:", errorDetail);
      } catch (e) {
        errorDetail = 'No se pudo obtener el detalle del error';
      }
      
      throw new Error(`Error en la petición: ${response.status} - ${errorDetail}`);
    }

    const data = await response.json();
    console.log("Datos recibidos de la API:", data);

    // Validar la estructura de los datos
    if (!Array.isArray(data)) {
      console.error("La respuesta no es un array:", data);
      throw new Error('Formato de respuesta inválido');
    }

    // Mapear los datos asegurándose de que cada localidad tenga las propiedades necesarias
    const localidades = data.map(localidad => {
      if (!localidad || !localidad.nombre) {
        console.warn("Localidad inválida en la respuesta:", localidad);
        return null;
      }
      return {
        id: localidad.id || localidad.nombre, // Fallback al nombre si no hay ID
        nombre: localidad.nombre
      };
    }).filter(Boolean); // Eliminar elementos nulos

    console.log("Localidades procesadas:", localidades);
    return localidades;

  } catch (error) {
    console.error("Error detallado en obtenerLocalidades:", {
      mensaje: error.message,
      departamento,
      url: `${API_URL}/localidades?departamento=${encodeURIComponent(departamento)}`
    });
    throw error;
  }
};