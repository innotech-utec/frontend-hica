<template>
  <v-dialog v-model="isModalOpen" max-width="600" content-class="custom-dialog">
    <v-card>
      <v-card-title>Registrar Parámetros</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="parametros.fecha"
            label="Fecha"
            type="date"
            :rules="[rules.required]"
            required
          ></v-text-field>
          <v-text-field
            v-model="parametros.hora"
            label="Hora"
            type="time"
            :rules="[rules.required]"
            required
          ></v-text-field>
          <v-text-field
            v-model="parametros.FC"
            label="Frecuencia Cardíaca (FC)"
            :rules="[rules.required, rules.numeric]"
            required
          ></v-text-field>
          <v-text-field
            v-model="parametros.FR"
            label="Frecuencia Respiratoria (FR)"
            :rules="[rules.required, rules.numeric]"
            required
          ></v-text-field>
          <v-text-field
            v-model="parametros.temperatura"
            label="Temperatura (°C)"
            :rules="[rules.required, rules.numeric]"
            required
          ></v-text-field>
  
          <v-select
            v-model="parametros.mucosas"
            label="Tipo de Mucosas"
            :items="['ROSADAS', 'PALIDAS', 'HIPEREMICAS', 'CONGESTIVAS', 'TOXEMICAS', 'HIPOXICAS']"
            :rules="[rules.required]"
          ></v-select>

          <v-text-field
            v-model="parametros.TllC"
            label="TllC"
            suffix="seg"
            :rules="[rules.required, rules.numeric]"
            required
          ></v-text-field>
          <v-text-field
            v-model="parametros.pliegueCutaneo"
            label="Pliegue Cutáneo"
            :rules="[rules.required]"
            required
          ></v-text-field>
          <v-textarea
            v-model="parametros.observaciones"
            label="Observaciones"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <!-- Botón "Guardar" se habilita solo si el formulario es válido -->
        <v-btn
          color="primary"
          :disabled="!valid"
          @click="createParametros"
        >
          Registrar
        </v-btn>
        <v-btn color="secondary" @click="closeModal">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Swal from "sweetalert2";
import backend from "@/backend";

export default {
  props: ["fichaClinicaId"],
  data() {
    return {
      isModalOpen: true,
      valid: false, // Estado del formulario
      parametros: {
        fecha: "",
        hora: "",
        FC: "",
        FR: "",
        temperatura: "",
        mucosas: "",
        TllC: "",
        pliegueCutaneo: "",
        observaciones: "",
      },
      rules: {
        required: (v) => !!v || "Este campo es requerido",
        numeric: (v) => !isNaN(v) || "El valor debe ser numérico",
      },
    };
  },
  methods: {
    async createParametros() {
      // Validar antes de enviar
      if (!this.valid) {
        Swal.fire({
          icon: "warning",
          title: "Formulario incompleto",
          text: "Por favor completa todos los campos requeridos antes de guardar.",
        });
        return;
      }

      try {
        await backend.post(
          "/registroParametros",
          {
            ...this.parametros,
            fichaClinicaId: this.fichaClinicaId,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        Swal.fire({
          icon: "success",
          title: "Parámetros Registrados",
          text: "La toma de parámetros ha sido registrada con éxito.",
        });

        this.$emit("parametroRegistrado");
        this.closeModal();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al registrar parámetros",
          text: error.response?.data?.message || "Ocurrió un error al guardar los parámetros.",
        });
      }
    },
    closeModal() {
      this.isModalOpen = false;
      this.$emit("closeModal");
    },
  },
};
</script>

<style scoped>
.custom-dialog {
  z-index: 1000 !important;
}

.v-btn {
  margin-top: 20px;
}
</style>
