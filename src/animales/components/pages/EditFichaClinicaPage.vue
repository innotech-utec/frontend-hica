<template>
    <v-container>
      <!-- Botón de regreso -->
      <BackButton />
  
      <!-- Título de la página -->
      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="page-title">Editar Ficha Clínica</h2>
        </v-col>
      </v-row>
  
      <!-- Formulario de edición -->
      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
        <v-text-field v-model="fichaClinica.motivoConsulta" label="Motivo de la Consulta" required></v-text-field>
        <v-text-field v-model="fichaClinica.sanitaria" label="Condición Sanitaria" required></v-text-field>
        <v-text-field v-model="fichaClinica.ambiental" label="Condición Ambiental" required></v-text-field>
        <v-text-field v-model="fichaClinica.remotaFisiologica" label="Remota Fisiológica" required></v-text-field>
        <v-text-field v-model="fichaClinica.remotaPatologica" label="Remota Patológica" required></v-text-field>
        <v-text-field v-model="fichaClinica.proximaFisiologica" label="Próxima Fisiológica" required></v-text-field>
        <v-text-field v-model="fichaClinica.proximaPatologica" label="Próxima Patológica" required></v-text-field>
        <v-select v-model="fichaClinica.estadoFichaClinica" :items="['ALTA', 'INGRESADO','INTERNADO', 'FALLECIMIENTO', 'EUTANASIA']" label="Estado de la Ficha" required></v-select>
  
        <v-btn rounded color="primary" type="submit">Guardar Cambios</v-btn>
        <v-btn rounded color="secondary" @click="confirmCancel">Cancelar</v-btn>
      </v-form>
    </v-container>
  </template>
  
  <script>
  import backend from "@/backend.js";
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
          estadoFichaClinica: 'INGRESADO',
        },
      };
    },
    methods: {
      async fetchFichaClinica() {
        const fichaClinicaId = this.$route.params.fichaClinicaId;
        try {
          const response = await backend.get(`/fichasClinicas/${fichaClinicaId}`);
          this.fichaClinica = response.data;
        } catch (error) {
          console.error('Error al cargar la ficha clínica:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la ficha clínica.',
          });
        }
      },
      async onSubmit() {
        if (!this.$refs.form.validate()) return;
  
        try {
          // Realiza la solicitud de actualización de la ficha clínica
          await backend.patch(`/fichasClinicas/${this.$route.params.fichaClinicaId}`, this.fichaClinica);
  
          // Redirige a la vista de la ficha clínica actualizada
          this.$router.push({
            name: 'fichaClinica.view',  // Ruta de vista de la ficha clínica
            query: {
              fichaClinicaId: this.$route.params.fichaClinicaId,  // Mantén el ID de la ficha clínica
              animalId: this.fichaClinica.animalId  // Asegúrate de pasar también el ID del animal
            }
          });
  
          // Muestra un mensaje de éxito
          Swal.fire('Ficha Clínica Actualizada', 'Los cambios han sido guardados.', 'success');
        } catch (error) {
          console.error('Error al actualizar la ficha clínica:', error);
          // Muestra un mensaje de error si falla la actualización
          Swal.fire('Error', 'No se pudo actualizar la ficha clínica.', 'error');
        }
      },
  
      confirmCancel() {
        this.$router.push({
          name: 'fichaClinica.view',
          query: {
            fichaClinicaId: this.$route.params.fichaClinicaId,
            animalId: this.fichaClinica.animalId
          }
        });
      }
    },
    created() {
      this.fetchFichaClinica();
    }
  };
  </script>
  
  <style scoped>
  .page-title {
    font-size: 28px;
    color: #014582; /* Color azul habitual */
    font-weight: bold;
    margin-bottom: 20px;
    text-transform: uppercase;
  }
  
  .v-btn {
    margin-top: 20px;
  }
  
  .v-btn.rounded {
    background-color: #014582; /* Color azul habitual */
    color: white;
  }
  
  .v-btn.rounded:hover {
    background-color: #013262; /* Color azul más oscuro para el hover */
  }
  
  .v-btn.secondary {
    background-color: #008575; /* Color verde habitual */
  }
  
  .v-btn.secondary:hover {
    background-color: #007460; /* Color verde más oscuro para el hover */
  }
  
  .v-card {
    background-color: transparent; /* Fondo transparente */
    border: 1px solid #ddd; /* Bordes suaves */
    box-shadow: none;
  }
  
  .v-card-title {
    font-size: 22px;
    color: #014582;
    font-weight: bold;
  }
  
  .v-card-text p {
    font-size: 16px;
    color: #333;
    line-height: 1.6;
  }
  
  .v-text-field,
  .v-select {
    margin-bottom: 20px;
  }
  
  .animal-info {
    margin-bottom: 20px;
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .animal-details {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Espacio entre elementos */
    color: #014582; /* Color de texto */
  }
  
  .v-form {
    max-width: 600px;
    margin: auto;
  }
  
  .v-form input,
  .v-form select {
    border-radius: 8px;
  }
  
  .v-form .v-input__control {
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .v-input--is-focused .v-input__control {
    border-color: #014582; /* Color azul para enfoque */
  }
  
  .v-input__label {
    color: #014582; /* Color de las etiquetas */
  }
  
  .v-select .v-select__selections {
    color: #333; /* Texto dentro de los select */
  }
  
  .mb-5 {
    margin-bottom: 20px;
  }
  </style>
  