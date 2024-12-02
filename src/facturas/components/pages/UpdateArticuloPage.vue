<template>
  <v-dialog 
    v-model="localShowModal" 
    max-width="600px" 
    persistent
  >
    <v-card class="pa-0">
      <v-card-title class="primary-title text-center">
        Editar Artículo
      </v-card-title>
      <v-card-text class="pt-6">
        <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
          <!-- Nombre del Artículo -->
          <v-text-field 
            v-model="articulo.nombre" 
            label="Nombre" 
            :rules="nombreRules"
            :error-messages="nombreError" 
            @blur="normalizeText('nombre')"
            required
          ></v-text-field>

          <!-- Descripción del Artículo -->
          <v-textarea 
            v-model="articulo.descripcion" 
            label="Descripción"
            @blur="normalizeText('descripcion')"
          ></v-textarea>

          <!-- Valor del Artículo -->
          <v-text-field
            v-model="articulo.valor"
            label="Valor ($)"
             inputmode="numeric"
            @keypress="onlyNumbers"
            :rules="valorRules"
            required
          ></v-text-field>

          <!-- Stock del Artículo -->
          <v-text-field
            v-model="articulo.stock"
            label="Stock"
             inputmode="numeric"
            @keypress="onlyNumbers"
            :rules="stockRules"
            required
          ></v-text-field>
          <div class="button-container">
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
        </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import backend from "@/backend.js";
import Swal from "sweetalert2";
import ValidationService from '@/validationService';

export default {
props: {
  showModal: {
    type: Boolean,
    required: true
  },
  articuloData: {
    type: Object,
    required: true
  }
},

data() {
  return {
    valid: false,
    loading: false,
    localShowModal: this.showModal,
    articulo: {},
    nombreOriginal: '',
    nombreError: '',
    nombreRules: [
      v => !!v || 'El nombre es requerido',
      v => !v || !v.includes('  ') || 'El nombre no puede contener espacios dobles',
      v => v && v.trim().length > 0 || 'El nombre no puede contener solo espacios',
      v => (v && v.length >= 2 && v.length <= 50) || 'El nombre debe tener entre 2 y 50 caracteres',
      v => this.validarNombreAsync(v)
    ],
    valorRules: [
      v => !!v || 'El valor es requerido',
      v => !v || /^\d*\.?\d*$/.test(v) || 'El valor solo puede contener números decimales',
      v => v >= 0 || 'El valor debe ser mayor o igual a 0'
      
    ],
    stockRules: [
      v => !!v || 'El stock es requerido',
      v => !v || /^\d+$/.test(v) || 'El stock solo puede contener números',
      v => v >= 0 || 'El stock debe ser mayor o igual a 0',
      
    ]
  };
},

watch: {
  showModal(val) {
    this.localShowModal = val;
  },
  localShowModal(val) {
    if (!val) this.$emit('close');
  },
  articuloData: {
    immediate: true,
    handler(newVal) {
      this.articulo = { ...newVal };
      this.nombreOriginal = newVal.nombre;
    }
  },
  'articulo.nombre': {
    async handler(newNombre) {
      if (newNombre && newNombre !== this.nombreOriginal) {
        await this.validarNombreAsync(newNombre);
      } else {
        this.nombreError = '';
      }
    }
  }
},

methods: {

  normalizeText(field) {
    if (this.articulo[field]) {  
      this.articulo[field] = this.articulo[field].toUpperCase().trim();
    }
  },
    onlyNumbers(e) {
    const char = String.fromCharCode(e.keyCode);
    if (!/^[0-9.]+$/.test(char)) {
      e.preventDefault();
    }
  },
  async validarNombreAsync(nombre) {
    try {
      if (!nombre || nombre === this.nombreOriginal) return true;
      const resultado = await ValidationService.validarArticuloUnico(nombre, this.articulo.id);
      this.nombreError = resultado.isValid ? '' : resultado.message;
      return resultado.isValid || resultado.message;
    } catch (error) {
      console.error('Error en validación de nombre:', error);
      return 'Error al validar el nombre del artículo';
    }
  },

  async onSubmit() {
    if (!this.$refs.form.validate()) return;

    try {
      this.loading = true;

      
      if (this.articulo.nombre.toUpperCase() !== this.nombreOriginal.toUpperCase()) {
        const nombreResultado = await ValidationService.validarArticuloUnico(
          this.articulo.nombre.toUpperCase(),
          this.articulo.id
        );
        
        if (!nombreResultado.isValid) {
          return Swal.fire({
            icon: "error",
            title: "Nombre en uso",
            text: "Este nombre de artículo ya está registrado en el sistema.",
          });
        }
      }

      await backend.patch(`/articulos/${this.articulo.id}`, this.articulo);
      
      Swal.fire({
        title: "Artículo Actualizado",
        text: "Los datos del artículo han sido actualizados correctamente.",
        icon: "success",
      });

      this.closeModal();
      this.$emit('updated');
    } catch (error) {
      console.error('Error al actualizar artículo:', error);
      
      let errorMessage = "Error al actualizar el artículo";
      if (error.response?.status === 409) {
        errorMessage = "Este nombre de artículo ya está registrado en el sistema.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    } finally {
      this.loading = false;
    }
  },

  async confirmCancel() {
      // Cerramos temporalmente el modal para mostrar el Swal
      this.localShowModal = false;
      
      try {
        const result = await Swal.fire({
          title: "¿Estás seguro?",
          text: "Los cambios no guardados se perderán",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, salir",
          cancelButtonText: "No, continuar editando"
        });

        if (result.isConfirmed) {
          this.$emit('close');
        } else {
          // Si el usuario cancela, volvemos a abrir el modal
          this.localShowModal = true;
        }
      } catch (error) {
        console.error('Error en confirmCancel:', error);
        // En caso de error, volvemos a abrir el modal
        this.localShowModal = true;
      }
    },

    closeModal() {
      this.localShowModal = false;
      this.$emit('close');
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
      this.nombreError = '';
      this.articulo = { ...this.articuloData };
    }
}
};
</script>

<style scoped>
.primary-title {
  background-color: #014582 !important;
  color: white !important;
  font-weight: bold;
  padding: 16px;
}


.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.action-button {
  min-width: 100px;
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

