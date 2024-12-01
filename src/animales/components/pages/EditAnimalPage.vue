<template>
  <v-dialog v-model="localShowModal" max-width="600px" @click:outside="closeModal">
    <v-card>
      <v-card-title class="primary-title text-center">
        Editar Animal
      </v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="onSubmit">
          <!-- Nombre del Animal -->
          <v-text-field 
            v-model="animal.nombre" 
            label="Nombre" 
            :error-messages="nombreErrors"
            @input="validateNombre"
            @blur="normalizeText('nombre')"
            required
          ></v-text-field>

          <!-- Especie del Animal -->
          <v-text-field 
            v-model="animal.especie" 
            label="Especie" 
            :error-messages="especieErrors"
            @input="validateEspecie"
            @blur="normalizeText('especie')"
            required
          ></v-text-field>

          <!-- Raza del Animal -->
          <v-text-field 
            v-model="animal.raza" 
            label="Raza" 
            :error-messages="razaErrors"
            @input="validateRaza"
            @blur="normalizeText('raza')"
            required
          ></v-text-field>

          <!-- Edad del Animal - Valor y Unidad -->
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="animal.edadValor"
                label="Edad"
                type="number"
                step="0.1"
                min="0"
                :error-messages="edadValorErrors"
                @input="validateEdadValor"
                @keypress="onlyNumbers"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="animal.edadUnidad"
                :items="unidadesEdad"
                label="Unidad"
                :error-messages="edadUnidadErrors"
                @change="validateEdadUnidad"
                required
              ></v-select>
            </v-col>
          </v-row>

          <!-- Sexo del Animal -->
          <v-select
            v-model="animal.sexo"
            :items="['HEMBRA', 'MACHO']"
            label="Sexo"
            :error-messages="sexoErrors"
            @change="validateSexo"
            required
          ></v-select>

          <!-- Peso del Animal -->
          <v-text-field
            v-model="animal.peso"
            label="Peso (kg)"
            type="number"
            step="0.01"
            min="0"
            :error-messages="pesoErrors"
            @input="validatePeso"
            @keypress="onlyNumbers"
            required
          ></v-text-field>

       
          <div class="button-container">
          <v-card-actions>
            <v-btn 
              color="primary" 
              @click="onSubmit" 
              :loading="loading" 
              :disabled="!isFormValid"
              class="action-button"
            >
              Guardar
            </v-btn>
            <v-btn 
              color="secondary" 
              @click="confirmCancel" 
              class="action-button"
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

export default {
  props: {
    showModal: {
      type: Boolean,
      required: true
    },
    animalData: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      localShowModal: this.showModal,
      animal: {},
      unidadesEdad: ['AÑOS', 'MESES', 'SEMANAS', 'DIAS'],
      
      // Errores de validación
      nombreErrors: [],
      especieErrors: [],
      razaErrors: [],
      edadValorErrors: [],
      edadUnidadErrors: [],
      sexoErrors: [],
      pesoErrors: [],
      
      // Estado de validación de cada campo
      validations: {
        nombre: false,
        especie: false,
        raza: false,
        edadValor: false,
        edadUnidad: false,
        sexo: false,
        peso: false
      }
    };
  },

  computed: {
    isFormValid() {
      const allFieldsFilled = 
        this.animal.nombre &&
        this.animal.especie &&
        this.animal.raza &&
        this.animal.edadValor &&
        this.animal.edadUnidad &&
        this.animal.sexo &&
        this.animal.peso;

      const allValidationsPass = Object.values(this.validations).every(valid => valid);

      return allFieldsFilled && allValidationsPass;
    }
  },

  watch: {
    showModal(val) {
      this.localShowModal = val;
    },
    localShowModal(val) {
      if (!val) this.$emit('close');
    },
    animalData: {
      immediate: true,
      handler(newVal) {
        this.animal = { ...newVal };
        // Validar todos los campos cuando se cargan los datos
        this.$nextTick(() => {
          this.validateForm();
        });
      }
    }
  },

  methods: {
    validateNombre() {
      this.nombreErrors = [];
      const value = this.animal.nombre;
      
      if (!value) {
        this.nombreErrors.push('El nombre es requerido');
      } else if (value.length < 2 || value.length > 50) {
        this.nombreErrors.push('El nombre debe tener entre 2 y 50 caracteres');
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        this.nombreErrors.push('El nombre solo puede contener letras y espacios');
      } else if (value.includes('  ')) {
        this.nombreErrors.push('El nombre no puede contener espacios dobles');
      }
      
      this.validations.nombre = this.nombreErrors.length === 0;
    },
    normalizeText(field) {
      if (this.animal[field]) {
        this.animal[field] = this.animal[field].toUpperCase().trim();
      }
    },
    onlyNumbers(event) {
      const charCode = (event.which) ? event.which : event.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        event.preventDefault();
      }
    },

    validateEspecie() {
      this.especieErrors = [];
      const value = this.animal.especie;
      
      if (!value) {
        this.especieErrors.push('La especie es requerida');
      } else if (value.length < 2 || value.length > 50) {
        this.especieErrors.push('La especie debe tener entre 2 y 50 caracteres');
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        this.especieErrors.push('La especie solo puede contener letras y espacios');
      } else if (value.includes('  ')) {
        this.especieErrors.push('La especie no puede contener espacios dobles');
      }
      
      this.validations.especie = this.especieErrors.length === 0;
    },

    validateRaza() {
      this.razaErrors = [];
      const value = this.animal.raza;
      
      if (!value) {
        this.razaErrors.push('La raza es requerida');
      } else if (value.length < 2 || value.length > 50) {
        this.razaErrors.push('La raza debe tener entre 2 y 50 caracteres');
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        this.razaErrors.push('La raza solo puede contener letras y espacios');
      } else if (value.includes('  ')) {
        this.razaErrors.push('La raza no puede contener espacios dobles');
      }
      
      this.validations.raza = this.razaErrors.length === 0;
    },

    validateEdadValor() {
      this.edadValorErrors = [];
      const value = this.animal.edadValor;
      
      if (!value) {
        this.edadValorErrors.push('La edad es requerida');
      } else if (value <= 0) {
        this.edadValorErrors.push('La edad debe ser mayor que 0');
      }
      
      this.validations.edadValor = this.edadValorErrors.length === 0;
    },


    validatePeso() {
      this.pesoErrors = [];
      const value = this.animal.peso;
      
      if (!value) {
        this.pesoErrors.push('El peso es requerido');
      } else if (value <= 0) {
        this.pesoErrors.push('El peso debe ser mayor que 0');
      }
      
      this.validations.peso = this.pesoErrors.length === 0;
    },

    validateForm() {
      this.validateNombre();
      this.validateEspecie();
      this.validateRaza();
      this.validateEdadValor();
      this.validateEdadUnidad();
      this.validateSexo();
      this.validatePeso();
      
      const allFieldsFilled = 
    this.animal.nombre &&
    this.animal.especie &&
    this.animal.raza &&
    this.animal.edadValor &&
    this.animal.edadUnidad &&
    this.animal.sexo &&
    this.animal.peso;

  if (allFieldsFilled) {
    this.validations = {
      nombre: this.nombreErrors.length === 0,
      especie: this.especieErrors.length === 0,
      raza: this.razaErrors.length === 0,
      edadValor: this.edadValorErrors.length === 0,
      edadUnidad: this.edadUnidadErrors.length === 0,
      sexo: this.sexoErrors.length === 0,
      peso: this.pesoErrors.length === 0
    };
  }

  return this.isFormValid;
},
validateEdadUnidad() {
  this.edadUnidadErrors = [];
  const value = this.animal.edadUnidad;
  
  if (!value) {
    this.edadUnidadErrors.push('La unidad de edad es requerida');
  } else if (!this.unidadesEdad.includes(value)) {
    this.edadUnidadErrors.push('Unidad de edad no válida');
  }
  
  this.validations.edadUnidad = this.edadUnidadErrors.length === 0;
},

validateSexo() {
  this.sexoErrors = [];
  const value = this.animal.sexo;
  
  if (!value) {
    this.sexoErrors.push('El sexo es requerido');
  } else if (!['HEMBRA', 'MACHO'].includes(value)) {
    this.sexoErrors.push('Valor de sexo no válido');
  }
  
  this.validations.sexo = this.sexoErrors.length === 0;
},


    async onSubmit() {
      if (!this.isFormValid) return;

      // Normalizar campos de texto
      ['nombre', 'especie', 'raza'].forEach(field => this.normalizeText(field));

      try {
        await backend.patch(`/animales/${this.animal.id}`, {
          nombre: this.animal.nombre,
          especie: this.animal.especie,
          raza: this.animal.raza,
          edadValor: Number(this.animal.edadValor),
          edadUnidad: this.animal.edadUnidad,
          sexo: this.animal.sexo,   
          peso: Number(this.animal.peso)
        });

        Swal.fire({
          title: "Animal Actualizado",
          text: "Los datos del animal han sido actualizados correctamente.",
          icon: "success",
        });

        this.closeModal();
        this.$emit('updated');
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Error al actualizar el animal",
        });
      }
    },

    closeModal() {
      this.localShowModal = false;
    },

    async confirmCancel() {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas cancelar la edición del animal?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, cancelar",
    cancelButtonText: "No",
    // Asegurar que el popup aparezca por encima
    customClass: {
      container: 'my-swal'
    }
  });

  if (result.isConfirmed) {
    this.closeModal();
      }
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
