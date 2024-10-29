<template>
  <v-card>
    <v-card-title>Editar Ficha Clínica</v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
        <v-text-field v-model="fichaClinica.motivoConsulta" label="Motivo de la Consulta" required></v-text-field>
        <v-text-field v-model="fichaClinica.sanitaria" label="Condición Sanitaria" required></v-text-field>
        <v-text-field v-model="fichaClinica.ambiental" label="Condición Ambiental" required></v-text-field>
        <v-text-field v-model="fichaClinica.remotaFisiologica" label="Remota Fisiológica" required></v-text-field>
        <v-text-field v-model="fichaClinica.remotaPatologica" label="Remota Patológica" required></v-text-field>
        <v-text-field v-model="fichaClinica.proximaFisiologica" label="Próxima Fisiológica" required></v-text-field>
        <v-text-field v-model="fichaClinica.proximaPatologica" label="Próxima Patológica" required></v-text-field>
        <v-select v-model="fichaClinica.estadoFichaClinica" :items="['ALTA', 'INGRESADO', 'INTERNADO', 'FALLECIMIENTO', 'EUTANASIA']" label="Estado de la Ficha" required></v-select>
        <v-card-actions>
        <v-btn rounded color="primary" type="submit">Guardar Cambios</v-btn>
        <v-btn rounded color="secondary" @click="cancelarEdicion">Cancelar</v-btn>
      </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";

export default {
  name: "EditFichaClinicaPage",
  props: {
    fichaClinicaId: {
      type: String,
      required: true,
    },
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
      try {
        const response = await backend.get(`/fichasClinicas/${this.fichaClinicaId}`);
        this.fichaClinica = response.data;
      } catch (error) {
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
        await backend.patch(`/fichasClinicas/${this.fichaClinicaId}`, this.fichaClinica);
        this.$emit('fichaActualizada');  // Notificamos que se actualizó la ficha
        Swal.fire('Ficha Clínica Actualizada', 'Los cambios han sido guardados.', 'success');
        this.$emit('closeModal');  // Cerrar modal después de la actualización
      } catch (error) {
        Swal.fire('Error', 'No se pudo actualizar la ficha clínica.', 'error');
      }
    },
    cancelarEdicion() {
      this.$emit('closeModal');  // Cierra el modal sin guardar cambios
    }
  },
  created() {
    this.fetchFichaClinica();
  },
};
</script>

<style scoped>
.v-btn {
  margin-top: 20px;
}
.v-btn.rounded {
  background-color: #014582;
  color: white;
}
.v-btn.secondary {
  background-color: #008575;
}
</style>
