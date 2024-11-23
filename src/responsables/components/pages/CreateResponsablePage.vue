<template>
  <v-card class="card">
    <v-container>
      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="form-title">Crear Responsable</h2>
        </v-col>
      </v-row>
      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
        <v-text-field 
          v-model="responsable.documento" 
          :rules="documentoRules"
          label="Documento" 
          required
          maxLength="30"
          :error-messages="documentoError"
          @input="validateDocumento"
        ></v-text-field>
        
        <v-text-field 
          v-model="responsable.nombre" 
          :rules="nombreRules"
          label="Nombre" 
          required
          maxLength="50"
        ></v-text-field>
        
        <v-text-field 
          v-model="responsable.apellido" 
          :rules="apellidoRules"
          label="Apellido" 
          required
          maxLength="50"
        ></v-text-field>
        
        <v-text-field 
          v-model="responsable.domicilio" 
          :rules="domicilioRules"
          label="Domicilio" 
          required
          maxLength="50"
        ></v-text-field>

        <v-text-field
          v-model="responsable.telefono" 
          :rules="telefonoRules"
          label="Teléfono" 
          required
          maxLength="20"
          @input="validateTelefono"
          :error-messages="telefonoError"
          type="tel"
          pattern="[0-9]*"
          inputmode="numeric"
          @keypress="onlyNumbers"
        ></v-text-field>
        
        <v-select
          v-model="responsable.departamentoId"
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
          v-model="responsable.localidadId"
          :items="localidades"
          label="Localidad"
          :rules="requiredRule"
          item-title="nombre"
          item-value="id"
          :loading="loadingLocalidades"
          :disabled="!responsable.departamentoId || loadingLocalidades"
          required
        ></v-select>

        <v-card-actions>
          <v-btn 
            rounded 
            color="primary" 
            type="submit"
            :loading="loading"
            :disabled="!valid || loading || !isValidForm"
          >
            Registrar
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
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import Swal from 'sweetalert2';
import backend from '@/backend';
import { obtenerLocalidades } from '../../services/direccionesService';
import ValidationService from '@/validationService';

export default {
  name: 'ResponsableCreate',
  
  data() {
    return {
      valid: false,
      loading: false,
      loadingDepartamentos: false,
      loadingLocalidades: false,
      departamentos: [],
      localidades: [],
      responsable: {
        documento: '',
        nombre: '',
        apellido: '',
        domicilio: '',
        telefono: '',
        departamentoId: null,
        localidadId: null
      },
      documentoError: '',
      telefonoError: '',
      isValidForm: false,
      documentoRules: [
        v => !!v || 'El documento es requerido',
        v => (v && v.length <= 30) || 'El documento no puede tener más de 30 caracteres',
        v => /^[a-zA-Z0-9]+$/.test(v) || 'El documento solo puede contener letras y números, sin espacios ni caracteres especiales',
        v => this.validarDocumentoAsync(v) || 'Validando documento...'
      ],
      nombreRules: [
        v => !!v || 'El nombre es requerido',
        v => (v && v.length <= 50) || 'El nombre no puede tener más de 50 caracteres'
      ],
      apellidoRules: [
        v => !!v || 'El apellido es requerido',
        v => (v && v.length <= 50) || 'El apellido no puede tener más de 50 caracteres'
      ],
      domicilioRules: [
        v => !!v || 'El domicilio es requerido',
        v => (v && v.length <= 50) || 'El domicilio no puede tener más de 50 caracteres'
      ],
      telefonoRules: [
        v => !!v || 'El teléfono es requerido',
        v => (v && v.length <= 20) || 'El teléfono no puede tener más de 20 caracteres',
        v => !v || /^\d+$/.test(v) || 'El teléfono solo puede contener números'
      ],
      requiredRule: [
        v => !!v || 'Este campo es requerido',
      ],
    };
  },
  
  async created() {
    await this.loadDepartamentos();
  },

  methods: {

    onlyNumbers(e) {
      const char = String.fromCharCode(e.keyCode);
      if (/^[0-9]+$/.test(char)) return true;
      e.preventDefault();
    },
    
    validateDocumento(value) {
      if (!value) {
        this.documentoError = 'El documento es requerido';
        this.isValidForm = false;
        return;
      }
      
      if (!/^[a-zA-Z0-9]+$/.test(value)) {
        this.documentoError = 'El documento solo puede contener letras y números, sin espacios ni caracteres especiales';
        this.isValidForm = false;
        return;
      }
      
      this.documentoError = '';
      this.checkFormValidity();
    },

    validateTelefono(value) {

      const telefono = String(value || '');

      if (!telefono) {
        this.telefonoError = 'El teléfono es requerido';
        this.isValidForm = false;
        return;
      }
      
    
      
      // Si llegamos aquí, el valor es válido
      this.telefonoError = '';
      this.checkFormValidity();
    },

    checkFormValidity() {
      this.isValidForm = (
        this.responsable.documento &&
        this.responsable.nombre &&
        this.responsable.apellido &&
        this.responsable.domicilio &&
        this.responsable.telefono &&
        this.responsable.departamentoId &&
        this.responsable.localidadId &&
        !this.documentoError &&
        !this.telefonoError
      );
    },

    async validarDocumentoAsync(documento) {
      try {
        if (!documento) return true;
        const resultado = await ValidationService.validarResponsableUnico(documento);
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

    async handleDepartamentoChange(newDepartamentoId) {
      this.localidades = [];
      this.responsable.localidadId = null;
      
      if (!newDepartamentoId) {
        this.checkFormValidity();
        return;
      }

      const departamento = this.departamentos.find(d => d.id === newDepartamentoId);
      if (!departamento) {
        console.error("No se encontró el departamento seleccionado");
        return;
      }

      this.loadingLocalidades = true;
      try {
        console.log("Buscando localidades para departamento:", departamento.nombre);
        const localidadesResponse = await obtenerLocalidades(departamento.nombre);
        
        if (Array.isArray(localidadesResponse)) {
          this.localidades = localidadesResponse.map(loc => ({
            id: loc.id || loc.nombre,
            nombre: loc.nombre
          }));
        } else {
          throw new Error('La respuesta de localidades no es válida');
        }
        
        console.log("Localidades cargadas:", this.localidades);
      } catch (error) {
        console.error("Error al cargar localidades:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar las localidades para el departamento seleccionado.",
        });
        this.localidades = [];
      } finally {
        this.loadingLocalidades = false;
        this.checkFormValidity();
      }
    },

    async onSubmit() {
      if (!this.$refs.form.validate()) return;

      // Validación final del documento
      const documentoResultado = await ValidationService.validarResponsableUnico(this.responsable.documento);
    
      if (!documentoResultado.isValid) {
        return Swal.fire({
          icon: "error",
          title: "Documento en uso",
          text: "El documento ya está registrado en el sistema. Por favor, verifique.",
        });
      }
      
      this.loading = true;
      try {
        const response = await backend.post('/responsables', this.responsable, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: response.data.message || 'Responsable creado correctamente',
        });
        
        this.$router.push({ name: 'responsables.index' });
      } catch (error) {
        console.error('Error al crear responsable:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo crear el responsable. Por favor, intente nuevamente.',
        });
      } finally {
        this.loading = false;
      }
    },

    async confirmCancel() {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas cancelar la creación del responsable?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No",
      });
      
      if (result.isConfirmed) {
        this.$router.push({ name: 'responsables.index' });
      }
    },
  },

  watch: {
    'responsable.documento': {
      immediate: true,
      async handler(newDocumento) {
        if (newDocumento) {
          await this.validarDocumentoAsync(newDocumento);
        } else {
          this.documentoError = '';
          this.checkFormValidity();
        }
      }
    },
    'responsable.telefono': {
      immediate: true,
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
  }
};
</script>

<style scoped>
.card {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #014582;
}

.v-btn {
  margin: 8px;
}

.v-btn.rounded {
  background-color: #014582;
  color: white;
}

.v-btn.rounded:hover {
  background-color: #013262;
}

.v-btn.secondary {
  background-color: #008575;
}

.v-btn.secondary:hover {
  background-color: #007460;
}
</style>