import backend from '@/backend';

export default class ValidationService {
  /**
   * Valida si un documento ya está registrado
   * @param {string} documento - Documento a validar
   * @param {string} userId - ID del usuario actual (opcional, para edición)
   * @returns {Promise<{ isValid: boolean, message: string }>}
   */
  static async validarDocumentoUnico(documento, userId = null) {
    try {
      const response = await backend.get('/usuarios');
      const usuarios = response.data.data;
       
      const documentoUpperCase = documento.toUpperCase();
      const usuarioExistente = usuarios.find(usuario => {
        if (userId && usuario.id === userId) return false;
        return usuario.documento.toUpperCase() === documentoUpperCase; // Agregados los paréntesis
      });
      
      return {
        isValid: !usuarioExistente,
        message: usuarioExistente
          ? 'Este documento ya está registrado en el sistema'
          : 'Documento disponible'
      };
    } catch (error) {
      console.error('Error al validar documento:', error);
      return {
        isValid: false,
        message: 'Error al validar el documento'
      };
    }
  }
  

  static async validarResponsableUnico(documento, userId = null) {
    try {
      const response = await backend.get('/responsables');
      
      const responsables = response.data;
      
      const responsableExistente = responsables.find(responsable => {
        if (userId && String(responsable.id) === String(userId)) return false;
        return responsable.documento === documento;
      });

      return {
        isValid: !responsableExistente,
        message: responsableExistente 
          ? 'Este documento ya está registrado en el sistema'
          : 'Documento disponible'
      };
    } catch (error) {
      console.error('Error al validar documento:', error);
      return {
        isValid: false,
        message: 'Error al validar el documento'
      };
    }
  }

  /**
   * Valida si un email ya está registrado
   * @param {string} email - Email a validar
   * @param {string} userId - ID del usuario actual (opcional, para edición)
   * @returns {Promise<{ isValid: boolean, message: string }>}
   */
  static async validarEmailUnico(email, userId = null) {
    try {
      const response = await backend.get('/usuarios');
      const usuarios = response.data.data; // Accedemos al array de usuarios dentro de data
      
      const usuarioExistente = usuarios.find(usuario => {
        if (userId && usuario.id === userId) return false;
        return usuario.email.toLowerCase() === email.toLowerCase(); // Comparación case-insensitive
      });

      return {
        isValid: !usuarioExistente,
        message: usuarioExistente 
          ? 'Este correo electrónico ya está registrado en el sistema'
          : 'Correo electrónico disponible'
      };
    } catch (error) {
      console.error('Error al validar email:', error);
      return {
        isValid: false,
        message: 'Error al validar el correo electrónico'
      };
    }
  }

  /**
   * Valida si un artículo con el mismo nombre ya está registrado
   * @param {string} nombre - Nombre del artículo a validar
   * @param {string} articuloId - ID del artículo actual (opcional, para edición)
   * @returns {Promise<{ isValid: boolean, message: string }>}
   */
  static async validarArticuloUnico(nombre, articuloId = null) {
    try {
      const response = await backend.get('/articulos');
      const articulos = response.data;
      
      const articuloExistente = articulos.find(articulo => {
        if (articuloId && articulo.id === articuloId) return false;
        return articulo.nombre.toLowerCase() === nombre.toLowerCase(); // Comparación case-insensitive
      });

      return {
        isValid: !articuloExistente,
        message: articuloExistente 
          ? 'Este nombre de artículo ya está registrado en el sistema'
          : 'Nombre de artículo disponible'
      };
    } catch (error) {
      console.error('Error al validar nombre de artículo:', error);
      return {
        isValid: false,
        message: 'Error al validar el nombre del artículo'
      };
    }
  }
}