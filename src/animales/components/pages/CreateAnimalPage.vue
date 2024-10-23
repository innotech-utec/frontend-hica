<template>
  <v-container>
    <BackButton />

    <!-- Título del formulario -->
    <v-row>
      <v-col cols="12" class="text-center">
        <h2 class="page-title">Registro de Animales</h2>
      </v-col>
    </v-row>

    <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
      <!-- Nombre del Animal -->
      <v-text-field v-model="animal.nombre" label="Nombre" :rules="requiredRule" required></v-text-field>

      <!-- Especie del Animal -->
      <v-text-field v-model="animal.especie" label="Especie" :rules="requiredRule" required></v-text-field>

      <!-- Raza del Animal -->
      <v-text-field v-model="animal.raza" label="Raza" :rules="requiredRule" required></v-text-field>

      <!-- Edad del Animal -->
      <v-text-field
        v-model="animal.edad"
        label="Edad"
        type="number"
        :rules="requiredRule"
        required
      ></v-text-field>

      <!-- Sexo del Animal -->
      <v-select
        v-model="animal.sexo"
        :items="['HEMBRA', 'MACHO']"
        label="Sexo"
        :rules="requiredRule"
        required
      ></v-select>

      <!-- Peso del Animal -->
      <v-text-field
        v-model="animal.peso"
        label="Peso (kg)"
        type="number"
        step="0.01"
        :rules="[...requiredRule, v => v > 0 || 'El peso debe ser mayor que 0']"
        required
      ></v-text-field>

      <!-- Responsable (Propietario) no editable -->
      <v-text-field
        v-model="responsableNombre" 
        label="Responsable"
        disabled
        required
      ></v-text-field>

      <!-- Botón para guardar -->
      <v-btn rounded color="primary" type="submit">Registrar Animal</v-btn>

      <!-- Botón de cancelar con confirmación -->
      <v-btn rounded color="secondary" @click="confirmCancel">Cancelar</v-btn>
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
      valid: false,
      animal: {
        nombre: '',
        especie: '',
        raza: '',
        edad: '',
        sexo: '',     
        peso: '',     
        responsableId: null,
      },
      responsableNombre: '', // Nombre del responsable
      requiredRule: [v => !!v || 'Este campo es requerido'],
    };
  },
  components: {
    BackButton,
  },
  methods: {
    async onSubmit() {
      if (!this.$refs.form.validate()) return;

      try {
        await backend.post('animales', {
          nombre: this.animal.nombre,
          especie: this.animal.especie,
          raza: this.animal.raza,
          edad: this.animal.edad,
          sexo: this.animal.sexo,   
          peso: this.animal.peso,   
          responsableId: this.animal.responsableId
        });

        Swal.fire({
          title: "Animal creado",
          text: `Los datos del animal han sido guardados`,
          icon: "success",
        });

        this.$router.push("/responsables");
      } catch (error) {
        console.error('Error al crear el animal:', error.response || error.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Error al crear el animal",
        });
      }
    },

    // Método para cargar el responsable seleccionado
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
</style>
