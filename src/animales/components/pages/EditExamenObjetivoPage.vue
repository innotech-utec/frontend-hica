<template>
  <v-card>
    <v-card-title>Editar Examen Objetivo</v-card-title>
    <v-card-text>
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
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";

export default {
  name: "EditExamenObjetivo",
  props: {
    fichaClinicaId: {
      type: String,
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
      // Crear una copia local del examenObjetivo
      localExamenObjetivo: { ...this.examenObjetivo },  // Asegurarse de que examenObjetivo tenga un ID
    };
  },
  methods: {
    async onSubmit() {
      if (!this.$refs.form.validate()) return;

      // Verificamos si el ID existe
      if (!this.localExamenObjetivo.id) {
        Swal.fire('Error', 'No se encontró el ID del examen objetivo.', 'error');
        return;
      }

      try {
        // Realizar la solicitud PATCH al backend con el ID correcto
        await backend.patch(`/examenObjetivo/${this.localExamenObjetivo.id}`, this.localExamenObjetivo);
        
        // Emitir evento de éxito
        this.$emit('examenActualizado');
        
        // Notificar éxito
        Swal.fire('Examen Objetivo Actualizado', 'Los cambios han sido guardados.', 'success');
        
        // Cerrar modal
        this.$emit('closeModal');
      } catch (error) {
        Swal.fire('Error', 'No se pudo actualizar el examen objetivo.', 'error');
      }
    },
    cancelarEdicion() {
      this.$emit('closeModal');  // Cierra el modal sin guardar cambios
    }
  }
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
