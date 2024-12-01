<template>
  <v-container>
    <BackButton />

    <v-row>
      <v-col cols="12" class="text-center">
        <h2 class="page-title">Registro de Animales</h2>
      </v-col>
    </v-row>

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

      <!-- Edad del Animal - Valor -->
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
            @blur="validateEdadUnidad"
            required
          ></v-select>
        </v-col>
      </v-row>

      <v-select
  v-model="animal.sexo"
  :items="['HEMBRA', 'MACHO']"
  label="Sexo"
  :error-messages="sexoErrors"
  @change="validateSexo"
  @blur="validateSexo"
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

      <v-text-field
        v-model="responsableNombre" 
        label="Responsable"
        disabled
        required
      ></v-text-field>

      <v-card-actions class="actions-centered">
        <v-btn 
          rounded 
          color="primary" 
          type="submit"
          :disabled="!isFormValid"
        >
          Registrar
        </v-btn>

        <v-btn 
          rounded 
          color="secondary" 
          @click="confirmCancel"
        >
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-container>
</template>

<script>
import backend from "@/backend.js";
import Swal from "sweetalert2";
import BackButton from "@/shared/components/BackButton.vue";

export default {
  data() {
    return {
      animal: {
        nombre: '',
        especie: '',
        raza: '',
        edadValor: '',
        edadUnidad: '',
        sexo: '',     
        peso: '',     
        responsableId: null,
      },
      responsableNombre: '',
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

  components: {
    BackButton,
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
      // Validar todos los campos antes de enviar
      this.validateNombre();
      this.validateEspecie();
      this.validateRaza();
      this.validateEdadValor();
      this.validateEdadUnidad();
      this.validateSexo();
      this.validatePeso();

      if (!this.isFormValid) return;

      // Normalizar campos de texto
      ['nombre', 'especie', 'raza'].forEach(field => this.normalizeText(field));

      try {
        const response = await backend.post('animales', {
          nombre: this.animal.nombre,
          especie: this.animal.especie,
          raza: this.animal.raza,
          edadValor: Number(this.animal.edadValor),
          edadUnidad: this.animal.edadUnidad,
          sexo: this.animal.sexo,   
          peso: Number(this.animal.peso),   
          responsableId: this.animal.responsableId
        });

        Swal.fire({
          title: "Animal creado",
          text: "Los datos del animal han sido guardados",
          icon: "success",
        });

        const animalId = response.data.animal.id;
        
        const animalResponse = await backend.get(`/animales/${animalId}`);
        const animal = animalResponse.data;

        this.$router.push({ 
          name: 'fichaClinica.create',
          query: { animalId: animal.id }
        });

      } catch (error) {
        console.error('Error al crear el animal:', error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Error al crear el animal",
        });
      }
    },


      async fetchResponsable() {
      const responsableId = this.$route.query.responsableId;
      if (!responsableId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se proporcionó un responsable válido.",
        });
        return;
      }

      try {
        const response = await backend.get(`/responsables/${responsableId}`);
        this.animal.responsableId = responsableId;
        this.responsableNombre = `${response.data.nombre} ${response.data.apellido}`;
      } catch (error) {
        console.error('Error al cargar el responsable:', error.response || error.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo cargar el responsable.",
        });
      }
    },

    async confirmCancel() {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas cancelar el registro del animal?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No",
      });

      if (result.isConfirmed) {
        this.$router.push("/responsables");
      }
    }
  },

  watch: {
    // Validar campos individuales cuando cambien
    'animal.nombre'(value) {
      if (value) this.validateNombre();
    },
    'animal.especie'(value) {
      if (value) this.validateEspecie();
    },
    'animal.raza'(value) {
      if (value) this.validateRaza();
    },
    'animal.edadValor'(value) {
      if (value) this.validateEdadValor();
    },
    'animal.edadUnidad'(value) {
      if (value) this.validateEdadUnidad();
    },
    'animal.sexo'(value) {
      if (value) this.validateSexo();
    },
    'animal.peso'(value) {
      if (value) this.validatePeso();
    }
  },

  created() {
    this.fetchResponsable();
  }
};

</script>

<style scoped>
.page-title {
  font-size: 28px;
  color: #014582;
  font-weight: bold;
  margin-bottom: 20px;
}

.v-btn {
  margin-top: 20px;
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
.actions-centered {
  justify-content: center;
}
</style>