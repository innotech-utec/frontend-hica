<template>
  <v-container>
    <BackButton />
    <v-row>
      <v-col cols="12" class="text-center">
        <h2 class="modal-title">Crear Ficha Clínica</h2>
      </v-col>
    </v-row>

    <!-- Mostrar información del animal -->
    <v-row>
      <v-col cols="12" class="animal-info">
        <v-card>
          <v-card-title class="title-centered">Información del Animal</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-if="animal.nombre" class="animal-details">
                <span><strong>Nombre:</strong> {{ animal.nombre }}</span>
                <span><strong>Especie:</strong> {{ animal.especie }}</span>
                <span><strong>Sexo:</strong> {{ animal.sexo }}</span>
                <span><strong>Peso:</strong> {{ animal.peso }} kg</span>
                <span><strong>Edad:</strong> {{ animal.edad }} años</span>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-form ref="form" v-model="valid" @submit.prevent="onSubmit" lazy-validation>
      <v-text-field
        v-model="fichaClinica.motivoConsulta"
        label="Motivo de la Consulta"
        :rules="DatosRules"
        :error-messages="getErrorMessages('motivoConsulta')"
        @blur="normalizeText('motivoConsulta')"
        required
      ></v-text-field>

      <v-select
        v-model="fichaClinica.sanitaria"
        :items="opcionesSanitarias"
        label="Condición Sanitaria"
        :rules="requiredRule"
        :error-messages="getErrorMessages('sanitaria')"
        required
        background-color="white"
      ></v-select>

      <v-select
        v-model="fichaClinica.ambiental"
        :items="opcionesAmbientales"
        label="Condición Ambiental"
        :rules="requiredRule"
        :error-messages="getErrorMessages('ambiental')"
        required
        background-color="white"
      ></v-select>

      <v-text-field
        v-model="fichaClinica.remotaFisiologica"
        label="Remota Fisiológica"
        :rules="DatosRules"
        :error-messages="getErrorMessages('remotaFisiologica')"
        @blur="normalizeText('remotaFisiologica')"
         required
      ></v-text-field>

      <v-text-field
        v-model="fichaClinica.remotaPatologica"
        label="Remota Patológica"
        :rules="DatosRules"
        :error-messages="getErrorMessages('remotaPatologica')"
        @blur="normalizeText('remotaPatologica')"
        required
      ></v-text-field>

      <v-text-field
        v-model="fichaClinica.proximaFisiologica"
        label="Próxima Fisiológica"
        :rules="DatosRules"
        :error-messages="getErrorMessages('proximaFisiologica')"
        @blur="normalizeText('proximaFisiologica')"
        required
      ></v-text-field>

      <v-text-field
        v-model="fichaClinica.proximaPatologica"
        label="Próxima Patológica"
        :rules="DatosRules"
        :error-messages="getErrorMessages('proximaPatologica')"
        @blur="normalizeText('proximaPatologica')"
        required
      ></v-text-field>

      <v-select
        v-model="fichaClinica.estadoFichaClinica"
        :items="['ALTA', 'INGRESADO','INTERNADO', 'FALLECIMIENTO', 'EUTANASIA']"
        label="Estado de la Ficha Clínica"
        :rules="requiredRule"
        :error-messages="getErrorMessages('estadoFichaClinica')"
        required
        background-color="white"
      ></v-select>

      <v-card-actions class="actions-centered">
        <v-btn rounded color="primary" type="submit" :disabled="!valid">Registrar</v-btn>
        <v-btn rounded color="secondary" @click="cancel">Cancelar</v-btn>
      </v-card-actions>
    </v-form>
  </v-container>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";
import BackButton from "@/shared/components/BackButton.vue";

export default {
  components: {
    BackButton,
  },
  data() {
    return {
      valid: false,
      formErrors: {},
      fichaClinica: {
        motivoConsulta: '',
        sanitaria: '',
        ambiental: '',
        remotaFisiologica: '',
        remotaPatologica: '',
        proximaFisiologica: '',
        proximaPatologica: '',
        estadoFichaClinica: 'INGRESADO',
        animalId: null,
      },
      opcionesSanitarias: [
        'VACUNADO/DESPARASITADO',
        'VACUNADO/NO DESPARASITADO',
        'NO VACUNADO/NO DESPARASITADO',
        'NO VACUNADO/DESPARASITADO'
      ],
      opcionesAmbientales: [
        'BOX/A CAMPO',
        'BOX',
        'A CAMPO',
        'A CORRAL'
      ],
      requiredRule: [v => !!v || 'Este campo es requerido'],
      ValoresRules: [
      v => !!v || 'El stock es requerido',
      v => !v || /^\d+$/.test(v) || 'El stock solo puede contener números',
      v => v >= 0 || 'El stock debe ser mayor o igual a 0',
      
    ],
    DatosRules: [
      v => !!v || 'Este campo es requerido',
      v => !v || !v.includes('  ') || 'El campo no puede contener espacios dobles',
      v => v && v.trim().length > 0 || 'El campo no puede contener solo espacios',
      v => (v && v.length >= 1 && v.length <= 60) || 'El campo debe tener entre 1 y 60 caracteres',
    ],
      animal: {},
    };
  },
  methods: {
    getErrorMessages(field) {
      return this.formErrors[field] || [];
    },
    validateForm() {
      this.formErrors = {};
      let isValid = true;

      // Validar cada campo requerido
      const requiredFields = [
        'motivoConsulta',
        'sanitaria',
        'ambiental',
        'remotaFisiologica',
        'remotaPatologica',
        'proximaFisiologica',
        'proximaPatologica',
        'estadoFichaClinica'
      ];

      requiredFields.forEach(field => {
        if (!this.fichaClinica[field]) {
          this.formErrors[field] = ['Este campo es requerido'];
          isValid = false;
        }
      });

      return isValid;
    },
    async fetchAnimalDetails() {
      const animalId = this.$route.query.animalId;
      if (!animalId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se proporcionó un animal válido.",
        });
        return;
      }

      try {
        const response = await backend.get(`/animales/${animalId}`);
        this.animal = response.data;
        this.fichaClinica.animalId = this.animal.id;
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo cargar el animal.",
        });
      }
    },
    normalizeText(field) {
  if (this.fichaClinica[field]) {
    this.fichaClinica[field] = this.fichaClinica[field].toUpperCase().trim();
    }
  },
    onlyNumbers(e) {
    const char = String.fromCharCode(e.keyCode);
    if (!/^[0-9.]+$/.test(char)) {
      e.preventDefault();
    }
  },
    async onSubmit() {
      // Forzar la validación del formulario
      this.$refs.form.validate();
      
      const fieldsToNormalize = [
      'motivoConsulta',
      'remotaFisiologica',
      'remotaPatologica', 
      'proximaFisiologica',
      'proximaPatologica'
    ];
    fieldsToNormalize.forEach(field => this.normalizeText(field));

      if (!this.valid) {
      
        Swal.fire({
          icon: "error",
          title: "Error de validación",
          text: "Por favor, complete todos los campos requeridos.",
        });
        return;
      }

      try {
        const response = await backend.post('fichasClinicas', {
          ...this.fichaClinica
        });

        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Ficha clínica creada exitosamente.",
        });

        this.$router.push({
          name: 'fichaClinica.view',
          query: {
            fichaClinicaId: response.data.id,
            animalId: this.fichaClinica.animalId
          }
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo crear la ficha clínica.",
        });
      }
    },
    cancel() {
      this.$router.back();
    }
  },
  created() {
    this.fetchAnimalDetails();
  },
};
</script>

<style scoped>
.page-title,
.modal-title {
  font-size: 28px;
  color: #014582;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.animal-info {
  margin-bottom: 20px;
}

.animal-details {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.actions-centered {
  justify-content: center;
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
</style>