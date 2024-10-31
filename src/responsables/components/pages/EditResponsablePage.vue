<template>
  <v-card class="card">
    <v-container>
      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="form-title">Editar Responsable</h2>
        </v-col>
      </v-row>
      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
        <v-text-field 
          v-model="responsable.documento" 
          :rules="documentoRules"
          label="Documento" 
          required
          maxLength="30"
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
          type="number"
          required
          maxLength="20"
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
            :disabled="!valid || loading"
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
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import Swal from 'sweetalert2';
import backend from '@/backend';
import { obtenerLocalidades } from '../../services/direccionesService';

export default {
  name: 'ResponsableEdit',
  
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
      documentoRules: [
        v => !!v || 'El documento es requerido',
        v => (v && v.length <= 30) || 'El documento no puede tener más de 30 caracteres'
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
        v => (v && v.length <= 20) || 'El teléfono no puede tener más de 20 caracteres'
      ],
      requiredRule: [
        v => !!v || 'Este campo es requerido',
      ],
    };
  },
  
  async created() {
    await Promise.all([
      this.loadDepartamentos(),
      this.cargarResponsable()
    ]);
  },

  methods: {
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
      
      if (!newDepartamentoId) return;

      const departamento = this.departamentos.find(d => d.id === newDepartamentoId);
      if (!departamento) {
        console.error("No se encontró el departamento seleccionado");
        return;
      }

      this.loadingLocalidades = true;
      try {
        const localidadesResponse = await obtenerLocalidades(departamento.nombre);
        
        if (Array.isArray(localidadesResponse)) {
          this.localidades = localidadesResponse.map(loc => ({
            id: loc.id || loc.nombre,
            nombre: loc.nombre
          }));
        } else {
          throw new Error('La respuesta de localidades no es válida');
        }
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
      }
    },

    async cargarResponsable() {
      try {
        const responsableId = this.$route.params.id;
        const response = await backend.get(`/responsables/${responsableId}`);
        this.responsable = {
          ...response.data,
          departamentoId: response.data.departamento?.id,
          localidadId: response.data.localidad?.id
        };
        
        // Cargar las localidades del departamento actual
        if (this.responsable.departamentoId) {
          await this.handleDepartamentoChange(this.responsable.departamentoId);
        }
      } catch (error) {
        console.error("Error al cargar responsable:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la información del responsable.",
        });
      }
    },

    async onSubmit() {
      if (!this.$refs.form.validate()) return;
      
      this.loading = true;
      try {
        const responsableId = this.$route.params.id;
        const response = await backend.patch(`/responsables/${responsableId}`, this.responsable, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: response.data.message || 'Responsable actualizado correctamente',
        });
        
        this.$router.push({ name: 'responsables.index' });
      } catch (error) {
        console.error('Error al actualizar responsable:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo actualizar el responsable. Por favor, intente nuevamente.',
        });
      } finally {
        this.loading = false;
      }
    },

    async confirmCancel() {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas cancelar la edición del responsable?",
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
    'responsable.departamentoId': {
      immediate: true,
      handler(newVal) {
        if (!newVal) {
          this.localidades = [];
          this.responsable.localidadId = null;
        }
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