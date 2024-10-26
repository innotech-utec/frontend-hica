<template>
  <v-card>
    <v-card-title>Registro de Parámetros</v-card-title>
    <v-card-text>
      <!-- Mostrar tabla de parámetros si ya están registrados -->
      <v-data-table v-if="parametros.length > 0" :items="parametros" :headers="headers">
        <template #item="{ item }">
          <tr>
            <td>{{ new Date(item.fecha).toLocaleDateString() }}</td>
            <td>{{ item.hora }}</td>
            <td>{{ item.FC }}</td>
            <td>{{ item.FR }}</td>
            <td>{{ item.temperatura }}</td>
            <td>{{ item.mucosas }}</td>
            <td>{{ item.TllC }}</td>
            <td>{{ item.pliegueCutaneo }}</td>
            <td>{{ item.observaciones }}</td>
          </tr>
        </template>
      </v-data-table>

      <!-- Mostrar mensaje si no hay parámetros registrados -->
      <p v-else>No hay registros de parámetros disponibles.</p>
      <v-card-actions>
              <!-- Botón para abrir el modal de edición -->
              <v-btn color="primary" @click="openCreateModal" outlined>
                <v-icon left>mdi-pencil</v-icon> Registrar Parametros
              </v-btn>
            </v-card-actions>
    </v-card-text>

    <!-- Modal para registrar nuevos parámetros -->
    <v-dialog v-model="createModal" max-width="600px">
      <v-card>
        <v-card-title>Registrar Parámetros</v-card-title>
        <v-card-text>
          <!-- Formulario para ingresar los parámetros -->
          <v-form ref="form">
            <v-text-field v-model="parametrosData.FC" label="Frecuencia Cardíaca (FC)" required></v-text-field>
            <v-text-field v-model="parametrosData.FR" label="Frecuencia Respiratoria (FR)" required></v-text-field>
            <v-text-field v-model="parametrosData.temperatura" label="Temperatura (°C)" required></v-text-field>
            <v-text-field v-model="parametrosData.mucosas" label="Mucosas" required></v-text-field>
            <v-text-field v-model="parametrosData.TllC" label="Tiempo de Llenado Capilar (TllC)" required></v-text-field>
            <v-text-field v-model="parametrosData.pliegueCutaneo" label="Pliegue Cutáneo" required></v-text-field>
            <v-textarea v-model="parametrosData.observaciones" label="Observaciones"></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="createParametros">Guardar</v-btn>
          <v-btn color="secondary" @click="createModal = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";

export default {
  props: ['animalId', 'fichaClinicaId'],
  data() {
    return {
      parametros: [],
      parametrosData: {
        FC: '',
        FR: '',
        temperatura: '',
        mucosas: '',
        TllC: '',
        pliegueCutaneo: '',
        observaciones: '',
        fichaClinicaId: this.fichaClinicaId,
      },
      createModal: false,
      headers: [
        { text: 'Fecha', value: 'fecha' },
        { text: 'Hora', value: 'hora' },
        { text: 'Frecuencia Cardíaca (FC)', value: 'FC' },
        { text: 'Frecuencia Respiratoria (FR)', value: 'FR' },
        { text: 'Temperatura (°C)', value: 'temperatura' },
        { text: 'Mucosas', value: 'mucosas' },
        { text: 'TllC', value: 'TllC' },
        { text: 'Pliegue Cutáneo', value: 'pliegueCutaneo' },
        { text: 'Observaciones', value: 'observaciones' },
      ],
    };
  },
  methods: {
    async fetchParametros() {
      if (!this.fichaClinicaId) return;

      try {
        const response = await backend.get(`/parametros/${this.fichaClinicaId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        this.parametros = response.data;
      } catch (error) {
        console.error("Error al obtener los parámetros:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo obtener los parámetros registrados.",
        });
      }
    },

    openCreateModal() {
      this.createModal = true;
    },

    async createParametros() {
      if (!this.fichaClinicaId) return;

      try {
        await backend.post('/parametros', {
          ...this.parametrosData,
          fichaClinicaId: this.fichaClinicaId,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        Swal.fire({
          title: "Parámetros Registrados",
          text: "Los parámetros han sido registrados con éxito.",
          icon: "success",
        });

        this.createModal = false;
        this.fetchParametros();
      } catch (error) {
        console.error("Error al registrar los parámetros:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo registrar los parámetros.",
        });
      }
    },
  },
  created() {
    this.fetchParametros();
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
