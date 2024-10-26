<template>
  <v-dialog v-model="localShowModal" max-width="600px">
    <v-card class="generic-modal">
      <v-card-title class="section-title">Editar Examen Objetivo</v-card-title>
      <v-card-text class="justified-text">
        <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
          <v-text-field v-model="localExamenObjetivo.FC" label="Frecuencia Cardíaca (FC)"></v-text-field>
          <v-text-field v-model="localExamenObjetivo.Resp" label="Respiración"></v-text-field>
          <v-text-field v-model="localExamenObjetivo.temperatura" label="Temperatura (°C)" type="number"></v-text-field>
          <v-textarea v-model="localExamenObjetivo.condicionCorporal" label="Condición Corporal"></v-textarea>
          <v-textarea v-model="localExamenObjetivo.sensorio" label="Sensorio"></v-textarea>
          <v-textarea v-model="localExamenObjetivo.fascies" label="Fascies"></v-textarea>
          <v-textarea v-model="localExamenObjetivo.gangliosLinfaticos" label="Ganglios Linfáticos"></v-textarea>
          <v-textarea v-model="localExamenObjetivo.pielSubcutaneo" label="Piel y Subcutáneo"></v-textarea>
          <v-textarea v-model="localExamenObjetivo.mucosasAparentes" label="Mucosas Aparentes"></v-textarea>
          <v-textarea v-model="localExamenObjetivo.grandesFuncionales" label="Grandes Funcionales"></v-textarea>
          <v-textarea v-model="localExamenObjetivo.actitudesAnomalas" label="Actitudes Anómalas"></v-textarea>
          <v-textarea v-model="localExamenObjetivo.EOP" label="EOP"></v-textarea>
          <v-textarea v-model="localExamenObjetivo.paraclinicos" label="Paraclínicos"></v-textarea>
          <v-textarea v-model="localExamenObjetivo.diagnostico" label="Diagnóstico"></v-textarea>
          <v-textarea v-model="localExamenObjetivo.observaciones" label="Observaciones"></v-textarea>
          <v-card-actions>
        <v-btn rounded color="primary" type="submit">Guardar Cambios</v-btn>
        <v-btn rounded color="secondary" @click="cancelarEdicion">Cancelar</v-btn>
      </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";
import "@/shared/components/style.css"; // Importa los estilos compartidos

export default {
  name: "EditExamenObjetivo",
  props: {
    fichaClinicaId: {
      type: String,
      required: true
    },
    showModal: {
      type: Boolean,
      required: true
    },
    examenObjetivo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      valid: false,
      localShowModal: this.showModal,
      localExamenObjetivo: { ...this.examenObjetivo }
    };
  },
  watch: {
    showModal(val) {
      this.localShowModal = val;
    },
    examenObjetivo: {
      immediate: true,
      handler(newVal) {
        this.localExamenObjetivo = { ...newVal };
      }
    },
    localShowModal(val) {
      if (!val) this.$emit('closeModal');
    }
  },
  methods: {
    async onSubmit() {
      if (!this.$refs.form.validate()) return;

      if (!this.localExamenObjetivo.id) {
        Swal.fire('Error', 'No se encontró el ID del examen objetivo.', 'error');
        return;
      }

      try {
        await backend.patch(`/examenObjetivo/${this.localExamenObjetivo.id}`, this.localExamenObjetivo);
        this.$emit('examenActualizado');
        Swal.fire('Examen Objetivo Actualizado', 'Los cambios han sido guardados.', 'success');
        this.localShowModal = false;
      } catch (error) {
        Swal.fire('Error', 'No se pudo actualizar el examen objetivo.', 'error');
      }
    },
    cancelarEdicion() {
      this.localShowModal = false;
    }
  }
};
</script>
