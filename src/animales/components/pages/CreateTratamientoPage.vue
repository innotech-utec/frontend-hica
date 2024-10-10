<template>
  <v-dialog v-model="createModal" max-width="600px">
    <v-card>
      <v-card-title>Registrar Nuevo Tratamiento</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <!-- Campos del formulario -->
          <v-text-field v-model="tratamiento.fecha" label="Fecha" type="date" :rules="[v => !!v || 'La fecha es requerida']" required></v-text-field>
          <v-text-field v-model="tratamiento.hora" label="Hora" type="time" :rules="[v => !!v || 'La hora es requerida']" required></v-text-field>
          <v-text-field v-model="tratamiento.medicacion" label="Medicación" :rules="[v => !!v || 'La medicación es requerida']" required></v-text-field>
          <v-textarea v-model="tratamiento.observaciones" label="Observaciones" :rules="[v => !!v || 'Las observaciones son requeridas']" required></v-textarea>

          
          <v-select
  v-if="veterinariosNombres.length > 0"
  v-model="tratamiento.veterinarioId" 
  :items="veterinariosNombres" 
  item-text="nombreCompleto"  
  item-value="id"             
  label="Veterinario"
  :rules="[v => !!v || 'El veterinario es requerido']"
  required
></v-select>
<span v-else>No se encontraron veterinarios disponibles.</span>
         
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="onSubmit">Guardar</v-btn>
        <v-btn color="secondary" @click="closeModal">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      valid: false,
      tratamiento: {
        fecha: '',
        hora: '',
        medicacion: '',
        observaciones: '',
        estadoAutorizacion: 'PENDIENTE',
        veterinarioId: null,
      },
      veterinariosNombres: [],  
      veterinarioIds: [],  
      selectedVeterinario: '', 
      createModal: true,
    };
  },
  methods: {
    async fetchVeterinarios() {
  try {
    const response = await backend.get('/veterinarios', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (response.data) {
      // Mapear los nombres completos y IDs para utilizar en el selector
      const veterinariosList = response.data.map(vet => ({
        id: vet.id,
        nombreCompleto: `${vet.user.nombre} ${vet.user.apellido}` // Combinar nombre y apellido
      }));

      // Asignar a veterinariosNombres para que contenga tanto el nombre como el ID del veterinario
      this.veterinariosNombres = veterinariosList;
      console.log('Veterinarios obtenidos:', this.veterinariosNombres);
    }
  } catch (error) {
    console.error('Error al obtener veterinarios:', error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "No se pudo obtener la lista de veterinarios.",
    });
  }
},

   
onSubmit() {
  if (this.$refs.form.validate()) {
    if (!this.tratamiento.veterinarioId) {
      Swal.fire({
        icon: "warning",
        title: "Error de selección",
        text: "Debe seleccionar un veterinario.",
      });
      return;
    }
    console.log('Tratamiento a enviar:', this.tratamiento);
    this.crearTratamiento();
  } else {
    Swal.fire({
      icon: "warning",
      title: "Formulario Incompleto",
      text: "Por favor completa todos los campos requeridos.",
    });
  }
},


 
    async crearTratamiento() {
      if (!this.tratamiento.veterinarioId) {
        Swal.fire({
          icon: "warning",
          title: "Sin Veterinario Seleccionado",
          text: "Por favor, seleccione un veterinario antes de guardar el tratamiento.",
        });
        return;
      }

      try {
        await backend.post('/tratamientos', this.tratamiento, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        Swal.fire({
          title: "Tratamiento Registrado",
          text: "El tratamiento ha sido registrado con éxito.",
          icon: "success",
        });

        this.closeModal();
        this.$emit('tratamientoRegistrado');
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo registrar el tratamiento.",
        });
      }
    },

    closeModal() {
      this.createModal = false;
      this.$emit('cerrarModal');
    },
  },

  mounted() {
    this.fetchVeterinarios();
  },
};
</script>

<style scoped>
.v-btn {
  margin-top: 20px;
}

.v-btn.secondary {
  background-color: #008575;
}

.v-btn.secondary:hover {
  background-color: #007460;
}
</style>
