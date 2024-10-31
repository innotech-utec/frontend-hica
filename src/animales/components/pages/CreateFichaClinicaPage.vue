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

    <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
     
      <v-text-field
        v-model="fichaClinica.motivoConsulta"
        label="Motivo de la Consulta"
        :rules="requiredRule"
        required
      ></v-text-field>

      <v-text-field
        v-model="fichaClinica.sanitaria"
        label="Condición Sanitaria"
        :rules="requiredRule"
        required
      ></v-text-field>

      <v-text-field
        v-model="fichaClinica.ambiental"
        label="Condición Ambiental"
        :rules="requiredRule"
        required
      ></v-text-field>

      <v-text-field
        v-model="fichaClinica.remotaFisiologica"
        label="Remota Fisiológica"
        :rules="requiredRule"
        required
      ></v-text-field>

      <v-text-field
        v-model="fichaClinica.remotaPatologica"
        label="Remota Patológica"
        :rules="requiredRule"
        required
      ></v-text-field>

      <v-text-field
        v-model="fichaClinica.proximaFisiologica"
        label="Próxima Fisiológica"
        :rules="requiredRule"
        required
      ></v-text-field>

      <v-text-field
        v-model="fichaClinica.proximaPatologica"
        label="Próxima Patológica"
        :rules="requiredRule"
        required
      ></v-text-field>

      <!-- Campo para seleccionar el estado de la ficha clínica -->
      <v-select
        v-model="fichaClinica.estadoFichaClinica"
        :items="['Alta', 'Ingresado','Internado', 'Fallecimiento', 'Eutanasia']"
        label="Estado de la Ficha Clínica"
        required
      ></v-select>

      <v-card-actions class="actions-centered">
        <v-btn rounded color="primary" type="submit">Registrar</v-btn>
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
      fichaClinica: {
        motivoConsulta: '',
        sanitaria: '',
        ambiental: '',
        remotaFisiologica: '',
        remotaPatologica: '',
        proximaFisiologica: '',
        proximaPatologica: '',
        estadoFichaClinica: 'Ingresado',
        animalId: null,
      },
      requiredRule: [v => !!v || 'Este campo es requerido'],
      animal: {},
    };
  },
  methods: {
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
    async onSubmit() {
      if (!this.$refs.form.validate()) return;

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
