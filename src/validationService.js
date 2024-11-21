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
      const usuarios = response.data.data; // Accedemos al array de usuarios dentro de data
      
      const usuarioExistente = usuarios.find(usuario => {
        if (userId && usuario.id === userId) return false;
        return usuario.documento === documento;
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
      // Asumimos que la respuesta viene directamente como un array de responsables
      const responsables = response.data;
      
      const responsableExistente = responsables.find(responsable => {
        if (userId && responsable.id === userId) return false;
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
}