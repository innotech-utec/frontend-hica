<template>
  <v-dialog v-model="localShowModal" max-width="600px">
    <v-card class="generic-modal">
      <v-card-title class="section-title">Editar Examen Objetivo</v-card-title>
      <v-card-text class="justified-text">
        <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
          <v-text-field
            v-model="localExamenObjetivo.FC"
            label="Frecuencia Cardíaca (FC)"
            type="number"
            @blur="validateNumber('FC')"
            :error-messages="errors.FC"
          ></v-text-field>
          <v-text-field
            v-model="localExamenObjetivo.Resp"
            label="Respiración"
            type="number"
            @blur="validateNumber('Resp')"
            :error-messages="errors.Resp"
          ></v-text-field>
          <v-text-field
            v-model="localExamenObjetivo.temperatura"
            label="Temperatura (°C)"
            type="number"
            @blur="validateNumber('temperatura')"
            :error-messages="errors.temperatura"
          ></v-text-field>
          <!-- Resto de campos de texto -->
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
            <v-btn rounded color="primary" type="submit">Guardar</v-btn>
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

export default {
  name: "EditExamenObjetivo",
  props: {
    fichaClinicaId: { type: String, required: true },
    showModal: { type: Boolean, required: true },
    examenObjetivo: { type: Object, required: true }
  },
  data() {
    return {
      valid: false,
      localShowModal: this.showModal,
      localExamenObjetivo: { ...this.examenObjetivo },
      errors: { FC: '', Resp: '', temperatura: '' }
    };
  },
  watch: {
    showModal(val) { this.localShowModal = val; },
    examenObjetivo: { immediate: true, handler(newVal) { this.localExamenObjetivo = { ...newVal }; } },
    localShowModal(val) { 
      if (!val) {
        this.$emit("closeModal");
        this.resetErrors();
      }
    }
  },
  methods: {
    validateNumber(field) {
      if (isNaN(this.localExamenObjetivo[field]) || this.localExamenObjetivo[field] === '') {
        
        
        this.errors[field] = "El valor debe ser numérico.";
      } else {
        this.errors[field] = "";
      }
    },
    async onSubmit() {
      this.validateNumber('FC');
      this.validateNumber('Resp');
      this.validateNumber('temperatura');

      if (!this.$refs.form.validate() || Object.values(this.errors).some(e => e)) {
       
        return;
      }

      if (!this.localExamenObjetivo.id) {
        Swal.fire("Error", "No se encontró el ID del examen objetivo.", "error");
        return;
      }

      try {
        await backend.patch(`/examenObjetivo/${this.localExamenObjetivo.id}`, this.localExamenObjetivo);
        this.$emit("examenActualizado");
        Swal.fire("Examen Objetivo Actualizado", "Los cambios han sido guardados.", "success");
        this.localShowModal = false;
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar el examen objetivo.",
          icon: "error",
          customClass: { popup: "swal-popup-zindex" }
        });
      }
    },
    cancelarEdicion() { this.localShowModal = false; },
    resetErrors() {
      this.errors = { FC: '', Resp: '', temperatura: '' };
    }
  }
};
</script>

<style scoped>
.page-title { font-size: 28px; color: #014582; font-weight: bold; margin: 10px 0; }
.add-user-btn { background-color: #014582 !important; color: white !important; }

.swal-popup-zindex {
  z-index: 3000 !important; 
}
</style>
