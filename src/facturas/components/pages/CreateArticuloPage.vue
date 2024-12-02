<template>
  <v-dialog 
    v-model="localShowModal" 
    max-width="600px" 
    persistent
  >
    <v-card class="pa-0">
      <v-card-title class="primary-title text-center">
        Crear Artículo
      </v-card-title>
      <v-card-text class="pt-6">
        <v-form ref="form" v-model="valid" @submit.prevent="createArticulo">

          
          <v-text-field 
            v-model="nombre" 
            :rules="nombreRules"
            label="Nombre" 
            required
            :error-messages="nombreError"
            @blur="normalizeText('nombre')"
          ></v-text-field>
          <v-textarea 
            v-model="descripcion" 
            label="Descripción"
            @blur="normalizeText('descripcion')"
          ></v-textarea>
          <v-text-field 
            v-model="valor" 
            label="Valor" 
            required 
            inputmode="numeric"
            @keypress="onlyNumbers"
            :rules="valorRules"
          ></v-text-field>
          <v-text-field 
            v-model="stock" 
            label="Stock" 
            required 
             inputmode="numeric"
            @keypress="onlyNumbers"
            :rules="stockRules"
          ></v-text-field>
          <div class="button-container">
          <v-card-actions>
            <v-btn 
              rounded 
              color="primary" 
              type="submit"
              :disabled="!valid || loading"
              :loading="loading"
            >
              Guardar
            </v-btn>
            <v-btn 
              rounded 
              color="secondary" 
              @click="closeModal"
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
import backend from "@/backend";
import Swal from 'sweetalert2';
import ValidationService from '@/validationService';

export default {
props: {
  showModal: {
    type: Boolean,
    required: true
  }
},

data() {
  return {
    valid: false,
    loading: false,
    localShowModal: this.showModal,
    nombre: '',
    descripcion: '',
    valor: null,
    stock: null,
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
  'nombre': {
    async handler(newNombre) {
      if (newNombre) {
        await this.validarNombreAsync(newNombre);
      } else {
        this.nombreError = '';
      }
    }
  }
},

methods: {
  normalizeText(field) {
    if (this[field]) {
      this[field] = this[field].toUpperCase().trim();
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
      if (!nombre) return true;
      const resultado = await ValidationService.validarArticuloUnico(nombre);
      this.nombreError = resultado.isValid ? '' : resultado.message;
      return resultado.isValid || resultado.message;
    } catch (error) {
      console.error('Error en validación de nombre:', error);
      return 'Error al validar el nombre del artículo';
    }
  },

  async createArticulo() {
    if (!this.$refs.form.validate()) return;

    try {
      this.loading = true;
      
      // Validar nombre antes de crear
      const nombreResultado = await ValidationService.validarArticuloUnico(this.nombre);
      if (!nombreResultado.isValid) {
        return Swal.fire({
          icon: "error",
          title: "Nombre en uso",
          text: "Este nombre de artículo ya está registrado en el sistema.",
        });
      }

      await backend.post("/articulos", {
        nombre: this.nombre.toUpperCase(),
        descripcion: this.descripcion.toUpperCase(),
        valor: this.valor,
        stock: this.stock
      });

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Artículo creado correctamente',
      });

      this.$emit("created");
      this.closeModal();
    } catch (error) {
      console.error("Error creando artículo:", error);
      
      let errorMessage = 'No se pudo crear el artículo. Por favor, intente nuevamente.';
      if (error.response?.status === 409) {
        errorMessage = 'Este nombre de artículo ya está registrado.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      this.loading = false;
    }
  },

  closeModal() {
    this.localShowModal = false;
    // Limpiar el formulario
    this.$refs.form.reset();
    this.nombre = '';
    this.descripcion = '';
    this.valor = null;
    this.stock = null;
    this.nombreError = '';
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

<style>
.swal2-container {
  z-index: 9999 !important;
}

.swal2-popup {
  z-index: 10000 !important;
}
</style>