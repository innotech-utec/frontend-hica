<template>
  <v-dialog 
    v-model="localShowModal"
    max-width="600px" 
    persistent
  >
    <v-card class="pa-0">
      <v-card-title class="primary-title text-center">
        Editar Propietario
      </v-card-title>
      <v-card-text class="pt-6">
        <v-form 
          ref="form" 
          v-model="valid"
          lazy-validation
          validate-on="blur"
          @submit.prevent="onSubmit"
        >
          <v-text-field 
            v-model="responsable.documento" 
            :rules="documentoRules"
            label="Documento" 
            required
            maxLength="30"
            :error-messages="documentoError"
            @blur="validateDocumento ;normalizeText('documento')"
          ></v-text-field>
          
          <v-text-field 
            v-model="responsable.nombre" 
            :rules="nombreRules"
            label="Nombre" 
            required
            maxLength="50"
             @blur="normalizeText('nombre')"
          ></v-text-field>
          
          <v-text-field 
            v-model="responsable.apellido" 
            :rules="apellidoRules"
            label="Apellido" 
            required
            maxLength="50"
             @blur="normalizeText('apellido')"
          ></v-text-field>
          
          <v-text-field 
            v-model="responsable.domicilio" 
            :rules="domicilioRules"
            label="Domicilio" 
            required
            maxLength="50"
              @blur="normalizeText('domicilio')"
          ></v-text-field>

          <v-text-field
            v-model="responsable.telefono" 
            :rules="telefonoRules"
            label="Teléfono" 
            required
            maxLength="20"
            :error-messages="telefonoError"
            type="tel"
            pattern="[0-9]*"
            inputmode="numeric"
            @keypress="onlyNumbers"
            validate-on-blur
          ></v-text-field>
          
          <v-select
            v-model="selectedDepartamentoId"
            :items="departamentos"
            label="Departamento"
            :rules="requiredRule"
            item-title="nombre"
            item-value="id"
            @update:model-value="handleDepartamentoChange"
            :loading="loadingDepartamentos"
            required
          ></v-select>
          
          <v-select
            v-model="selectedLocalidadId"
            :items="localidades"
            label="Localidad"
            :rules="requiredRule"
            item-title="nombre"
            item-value="id"
            :loading="loadingLocalidades"
            :disabled="!selectedDepartamentoId || loadingLocalidades"
            required
          ></v-select>

          <div class="button-container">
            <v-card-actions>
              <v-btn 
                rounded 
                color="primary" 
                type="submit"
                :loading="loading"
                :disabled="!isFormValid || loading"
              >
                Guardar
              </v-btn>
              <v-btn 
                rounded 
                color="secondary" 
                @click="confirmCancel"
                :disabled="loading"
              >
                Cancelar
              </v-btn>
            </v-card-actions>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import Swal from 'sweetalert2';
import backend from '@/backend';
import { obtenerLocalidades } from '../../services/direccionesService';
import ValidationService from '@/validationService';

export default {
  name: 'ResponsableEdit',
  
  props: {
    showModal: {
      type: Boolean,
      required: true
    },
    responsableId: {
      type: [String, Number],
      required: true
    }
  },

  data() {
    return {
      localShowModal: this.showModal,
      valid: true,
      loading: false,
      loadingDepartamentos: false,
      loadingLocalidades: false,
      departamentos: [],
      localidades: [],
      selectedDepartamentoId: null,
      selectedLocalidadId: null,
      isValidForm: true,
      responsable: {
        documento: '',
        nombre: '',
        apellido: '',
        domicilio: '',
        telefono: '0',
      },
      documentoOriginal: '',
      documentoError: '',
      telefonoError: '',
      requiredRule: [
    v => !!v || 'Este campo es requerido',
    v => (v && String(v).trim().length > 0) || 'Este campo no puede contener solo espacios'
  ],

  nombreRules: [
    v => !!v || 'El nombre es requerido',
    v => (v && String(v).trim().length > 0) || 'El nombre no puede contener solo espacios',
    v => (v && v.length >= 2 && v.length <= 50) || 'El nombre debe tener entre 2 y 50 caracteres',
    v => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v) || 'El nombre solo puede contener letras y espacios',
    v => !v || !String(v).includes('  ') || 'El nombre no puede contener espacios dobles'
  ],

  apellidoRules: [
    v => !!v || 'El apellido es requerido',
    v => (v && String(v).trim().length > 0) || 'El apellido no puede contener solo espacios',
    v => (v && v.length >= 2 && v.length <= 50) || 'El apellido debe tener entre 2 y 50 caracteres',
    v => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v) || 'El apellido solo puede contener letras y espacios',
    v => !v || !String(v).includes('  ') || 'El apellido no puede contener espacios dobles'
  ],

  documentoRules: [
    v => !!v || 'El documento es requerido',
    v => (v && String(v).trim().length > 0) || 'El documento no puede contener solo espacios',
    v => (v && v.length >= 3 && v.length <= 30) || 'El documento debe tener entre 3 y 30 caracteres',
    v => /^[a-zA-Z0-9]+$/.test(v) || 'El documento solo puede contener letras y números'
  ],

  domicilioRules: [
    v => !!v || 'El domicilio es requerido',
    v => (v && String(v).trim().length > 0) || 'El domicilio no puede contener solo espacios',
    v => (v && v.length <= 50) || 'El domicilio no puede exceder los 50 caracteres',
    v => !v || !String(v).includes('  ') || 'El domicilio no puede contener espacios dobles'
  ],

  telefonoRules: [
    v => !!v || 'El teléfono es requerido',
    v => (v && v.length <= 15) || 'El teléfono no puede tener más de 15 caracteres',
    v => !v || /^\d+$/.test(v) || 'El teléfono solo puede contener números'
  ]
        };
  },

  watch: {
    showModal(newVal) {
      this.localShowModal = newVal;
    },
    localShowModal(newVal) {
      if (!newVal) {
        this.$emit('close');
      }
    },
    'responsable.documento': {
      async handler(newDocumento) {
        if (newDocumento) {
          await this.validateDocumento();
        } else {
          this.documentoError = '';
          this.checkFormValidity();
        }
      }
    },
    'responsable.telefono': {
      handler(newValue) {
        if (newValue) {
          this.validateTelefono(newValue);
        } else {
          this.telefonoError = '';
          this.checkFormValidity();
        }
      }
    },
    'responsable': {
      deep: true,
      handler() {
        this.checkFormValidity();
      }
    }
  },

  computed: {
    isFormValid() {
      return this.valid &&
        this.responsable.documento &&
        this.responsable.nombre &&
        this.responsable.apellido &&
        this.responsable.domicilio &&
        this.responsable.telefono &&
        this.selectedDepartamentoId &&
        this.selectedLocalidadId &&
        !this.documentoError &&
        !this.telefonoError;
    }
  },

  async created() {
    await this.loadDepartamentos();
    await this.cargarResponsable();
  },

  methods: {
    onlyNumbers(e) {
      const char = String.fromCharCode(e.keyCode);
      if (/^[0-9]+$/.test(char)) return true;
      e.preventDefault();
    },
    async validateForm() {
      if (this.$refs.form) {
        this.valid = await this.$refs.form.validate();
        this.checkFormValidity();
      }
    },

    async validateDocumento() {
  const documentoActual = this.responsable.documento.trim().toUpperCase();
  const documentoOriginal = this.documentoOriginal ? this.documentoOriginal.trim().toUpperCase() : '';

  if (documentoActual !== documentoOriginal) {
    try {
      const resultado = await ValidationService.validarResponsableUnico(documentoActual, this.responsableId);
      this.documentoError = resultado.isValid ? '' : resultado.message;
    } catch (error) {
      console.error('Error en validación de documento:', error);
      this.documentoError = 'Error al validar el documento';
    }
  } else {
    this.documentoError = '';
  }
},


    validateTelefono(value) {
      const telefono = String(value || '').trim();

      if (!telefono) {
        this.telefonoError = 'El teléfono es requerido';
        this.isValidForm = false;
        return;
      }

      this.telefonoError = '';
      this.checkFormValidity();
    },

    normalizeText(field) {
      if (this.responsable[field]) {
        this.responsable[field] = this.responsable[field].toUpperCase().trim();
      }
    },
    checkFormValidity() {
      this.isValidForm = (
        this.responsable.documento &&
        this.responsable.nombre &&
        this.responsable.apellido &&
        this.responsable.domicilio &&
        this.responsable.telefono &&
        this.selectedDepartamentoId &&
        this.selectedLocalidadId &&
        !this.documentoError &&
        !this.telefonoError
      );
    },

    async validarDocumentoAsync(documento) {
      try {
        if (!documento) return true;
        const resultado = await ValidationService.validarResponsableUnico(documento, this.responsableId);
        this.documentoError = resultado.isValid ? '' : resultado.message;
        this.checkFormValidity();
        return resultado.isValid || resultado.message;
      } catch (error) {
        console.error('Error en validación de documento:', error);
        this.documentoError = 'Error al validar el documento';
        this.checkFormValidity();
        return 'Error al validar el documento';
      }
    },

    async cargarResponsable() {
  if (!this.responsableId) {
    console.error('No hay responsableId');
    return;
  }
  
  try {
    this.loading = true;
    
    // Cargar datos del responsable
    const response = await backend.get(`/responsables/${this.responsableId}`);
    console.log('Datos cargados:', response.data);
    
    // Guardar documento original
    this.documentoOriginal = response.data.documento;
    
    // Actualizar datos del responsable
    this.responsable = {
      documento: response.data.documento,
      nombre: response.data.nombre,
      apellido: response.data.apellido,
      domicilio: response.data.domicilio,
      telefono: String(response.data.telefono),
    };

    // Guardar los IDs originales
    const originalDepartamentoId = response.data.departamentoId;
    const originalLocalidadId = response.data.localidadId;

    // Establecer departamento
    this.selectedDepartamentoId = originalDepartamentoId;

    // Cargar localidades basadas en el departamento
    if (originalDepartamentoId) {
      this.loadingLocalidades = true;
      const departamento = this.departamentos.find(d => d.id === originalDepartamentoId);
      
      if (departamento) {
        try {
          const localidades = await obtenerLocalidades(departamento.nombre);
          this.localidades = localidades;
          
          // Establecer localidad después de cargar las localidades
          await this.$nextTick();
          this.selectedLocalidadId = originalLocalidadId;
          
          console.log('Estado final después de carga:', {
            departamentoId: this.selectedDepartamentoId,
            localidadId: this.selectedLocalidadId,
            localidades: this.localidades.length
          });
        } catch (error) {
          console.error('Error al cargar localidades:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las localidades.'
          });
        } finally {
          this.loadingLocalidades = false;
        }
      }
    }

    await this.$nextTick();
    await this.validateForm();
    this.checkFormValidity();

  } catch (error) {
    console.error("Error al cargar responsable:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo cargar la información del responsable.",
    });
  } finally {
    this.loading = false;
    }
  },


    async loadDepartamentos() {
      this.loadingDepartamentos = true;
      try {
        const response = await backend.get('/departamentos');
        this.departamentos = response.data;
      } catch (error) {
        console.error("Error al cargar departamentos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los departamentos.",
        });
      } finally {
        this.loadingDepartamentos = false;
      }
    },

    async handleDepartamentoChange(departamentoId) {
  if (!departamentoId) {
    this.localidades = [];
    this.selectedLocalidadId = null;
    return;
  }

  const departamento = this.departamentos.find(d => d.id === departamentoId);
  if (!departamento) {
    console.error('Departamento no encontrado:', departamentoId);
    return;
  }

  this.loadingLocalidades = true;
  try {
    const localidades = await obtenerLocalidades(departamento.nombre);
    this.localidades = localidades;
    this.selectedLocalidadId = null; // Resetear localidad al cambiar departamento
  } catch (error) {
    console.error('Error al cargar localidades:', error);
    Swal.fire('Error', 'No se pudieron cargar las localidades.', 'error');
    this.localidades = [];
  } finally {
    this.loadingLocalidades = false;

  }
},

async onSubmit() {
  if (!this.isFormValid) {
    console.log('Formulario no válido:', {
      documento: this.responsable.documento,
      documentoError: this.documentoError,
      localidadId: this.selectedLocalidadId,
      departamentoId: this.selectedDepartamentoId,
    });
    return;
  }

  this.loading = true;

  try {
    // Normalizar y construir el objeto para enviar
    const dataToSend = {
      documento: this.responsable.documento.trim().toUpperCase(),
      nombre: this.responsable.nombre.trim().toUpperCase(),
      apellido: this.responsable.apellido.trim().toUpperCase(),
      domicilio: this.responsable.domicilio.trim().toUpperCase(),
      telefono: this.responsable.telefono.trim(),
      departamentoId: Number(this.selectedDepartamentoId),
      localidadId: Number(this.selectedLocalidadId),
    };

    console.log('Datos enviados al backend:', dataToSend);

    // Enviar solicitud al backend
    const response = await backend.patch(
      `/responsables/${this.responsableId}`,
      dataToSend,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Respuesta del backend:', response.data);

    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: response.data.message || 'Responsable actualizado correctamente',
    });

    this.$emit('updated');
    this.localShowModal = false;

  } catch (error) {
    console.error('Error al actualizar responsable:', error);

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || 'No se pudo actualizar el responsable.',
    });
  } finally {
    this.loading = false;
  }
},
   

    async confirmCancel() {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas cancelar la edición?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No'
      });

      if (result.isConfirmed) {
        this.localShowModal = false;
      }
    },
  }
};
</script>

<style scoped>
.primary-title {
  background-color: #014582 !important;
  color: white !important;
  font-weight: bold;
  padding: 16px;
  text-align: center;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.v-btn.primary {
  background-color: #014582 !important;
  color: white;
}

.v-btn.primary:hover {
  background-color: #013262 !important;
}

.v-btn.secondary {
  background-color: #008575 !important;
}

.v-btn.secondary:hover {
  background-color: #007460 !important;
}
</style>