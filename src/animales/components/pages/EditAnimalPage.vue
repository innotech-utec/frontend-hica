<template>
    <v-container>
      <BackButton />
  
      <!-- Título del formulario -->
      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="page-title">Editar Animal</h2>
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
  
        <!-- Botón para guardar -->
        <v-btn rounded color="primary" type="submit">Guardar Cambios</v-btn>
  
        <!-- Botón de cancelar con confirmación -->
        <v-btn rounded color="secondary" @click="confirmCancel">Cancelar</v-btn>
      </v-form>
    </v-container>
  </template>
  
  <script>
  import backend from "@/backend.js";
  import Swal from "sweetalert2";
  
  
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
      },
      requiredRule: [v => !!v || 'Este campo es requerido'],
    };
  },
  methods: {
    // Cargar los datos del animal a editar
    async fetchAnimal() {
      const animalId = this.$route.params.id;
      try {
        const response = await backend.get(`/animales/${animalId}`);
        this.animal = response.data;
      } catch (error) {
        console.error('Error al cargar los datos del animal:', error.response || error.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Error al cargar los datos del animal",
        });
      }
    },

    async onSubmit() {
      if (!this.$refs.form.validate()) return;

      try {
        const animalId = this.$route.params.id;
        await backend.patch(`/animales/${animalId}`, {
          nombre: this.animal.nombre,
          especie: this.animal.especie,
          raza: this.animal.raza,
          edad: this.animal.edad,
          sexo: this.animal.sexo,
          peso: this.animal.peso,
        });

        Swal.fire({
          title: "Animal actualizado",
          text: `Los datos del animal han sido actualizados`,
          icon: "success",
        });

        this.$router.push("/animales");
      } catch (error) {
        console.error('Error al actualizar el animal:', error.response || error.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Error al actualizar el animal",
        });
      }
    },
  },

  created() {
    this.fetchAnimal();
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
  