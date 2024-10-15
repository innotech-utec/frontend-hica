<template>
    <v-card>
      <v-card-title>Examen Objetivo</v-card-title>
      <v-card-text>
        <!-- Mostrar detalles del examen si ya está creado -->
        <div v-if="examen">
          <p><strong>FC:</strong> {{ examen.FC }}</p>
          <p><strong>Respiración:</strong> {{ examen.Resp }}</p>
          <p><strong>Temperatura:</strong> {{ examen.temperatura }} °C</p>
          <!-- Agregar más detalles del examen objetivo según corresponda -->
        </div>
  
        <!-- Mostrar botón para registrar si no está creado -->
        <div v-else>
          <v-btn color="primary" @click="openCreateModal">Registrar Examen Objetivo</v-btn>
        </div>
      </v-card-text>
    </v-card>
  
    <!-- Modal para crear examen objetivo -->
    <v-dialog v-model="createModal" max-width="600px">
      <v-card>
        <v-card-title>Registrar Examen Objetivo</v-card-title>
        <v-card-text>
          <!-- Formulario para registrar los datos del examen -->
          <v-form ref="form">
            <v-text-field v-model="examenData.FC" label="FC (Frecuencia Cardíaca)" required></v-text-field>
            <v-text-field v-model="examenData.Resp" label="Respiración" required></v-text-field>
            <v-text-field v-model="examenData.temperatura" label="Temperatura (°C)" required></v-text-field>
            <!-- Agregar más campos según los datos necesarios -->
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="createExamen">Guardar</v-btn>
          <v-btn color="secondary" @click="createModal = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import backend from "@/backend";
  import Swal from "sweetalert2";
  
  export default {
    props: ['animalId', 'fichaClinicaId'],
    data() {
      return {
        examen: null,
        examenData: {
          FC: '',
          Resp: '',
          temperatura: '',
        },
        createModal: false,
      };
    },
    methods: {
      async fetchExamenObjetivo() {
        if (!this.fichaClinicaId) return;
  
        try {
          const response = await backend.get(`/examenesObjetivos/${this.fichaClinicaId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
  
          if (response.data && response.data.length > 0) {
            this.examen = response.data[0];
          }
        } catch (error) {
          console.error("Error al obtener el examen objetivo:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo obtener el examen objetivo.",
          });
        }
      },
  
      // Método para abrir el modal de crear examen objetivo
      openCreateModal() {
        this.createModal = true;
      },
  
      // Método para crear un examen objetivo
      async createExamen() {
        if (!this.fichaClinicaId) return;
  
        try {
          await backend.post('/examenesObjetivos', {
            ...this.examenData,
            fichaClinicaId: this.fichaClinicaId,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
  
          Swal.fire({
            title: "Examen Registrado",
            text: "El examen objetivo ha sido registrado con éxito.",
            icon: "success",
          });
  
          this.createModal = false;
          this.fetchExamenObjetivo();
        } catch (error) {
          console.error("Error al registrar el examen objetivo:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo registrar el examen objetivo.",
          });
        }
      },
    },
  
    created() {
      this.fetchExamenObjetivo();
    }
  };
  </script>
  