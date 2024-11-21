<template>
  <v-dialog v-model="localShowModal" max-width="600px" @click:outside="closeModal">
    <v-card>
      <v-card-title>Editar Animal</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
          <!-- Nombre del Animal -->
          <v-text-field v-model="animal.nombre" label="Nombre" :rules="requiredRule" required></v-text-field>

          <!-- Especie del Animal -->
          <v-text-field v-model="animal.especie" label="Especie" :rules="requiredRule" required></v-text-field>

          <!-- Raza del Animal -->
          <v-text-field v-model="animal.raza" label="Raza" :rules="requiredRule" required></v-text-field>

          <!-- Edad del Animal -->
          <v-text-field v-model="animal.edad" label="Edad" type="number" :rules="requiredRule" required></v-text-field>

          <!-- Sexo del Animal -->
          <v-select v-model="animal.sexo" :items="['HEMBRA', 'MACHO']" label="Sexo" :rules="requiredRule" required></v-select>

          <!-- Peso del Animal -->
          <v-text-field
            v-model="animal.peso"
            label="Peso (kg)"
            type="number"
            step="0.01"
            :rules="[...requiredRule, v => v > 0 || 'El peso debe ser mayor que 0']"
            required
          ></v-text-field>

          <v-card-actions>
            <v-btn rounded color="primary" type="submit">Guardar Cambios</v-btn>
            <v-btn rounded color="secondary" @click="confirmCancel">Cancelar</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import backend from "@/backend.js";
import Swal from "sweetalert2";

export default {
  props: {
    showModal: {
      type: Boolean,
      required: true
    },
    animalData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      valid: false,
      localShowModal: this.showModal, // Copia local de showModal
      animal: {}, // Inicializar objeto animal vacío
      requiredRule: [v => !!v || 'Este campo es requerido']
    };
  },
  watch: {
    showModal(val) {
      this.localShowModal = val; // Actualizar la copia local si cambia showModal
    },
    localShowModal(val) {
      if (!val) this.$emit('close'); // Emitir cierre del modal si cambia la copia local
    },
    animalData: {
      immediate: true,
      handler(newVal) {
        this.animal = { ...newVal }; // Actualizar los datos del animal cuando cambien
      }
    }
  },
  methods: {
    async onSubmit() {
      if (!this.$refs.form.validate()) return;

      try {
        await backend.patch(`/animales/${this.animal.id}`, this.animal);
        Swal.fire({
          title: "Animal Actualizado",
          text: "Los datos del animal han sido actualizados correctamente.",
          icon: "success",
        });
        this.closeModal();
        this.$emit('updated');
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Error al actualizar el animal",
        });
      }
    },
    closeModal() {
      this.localShowModal = false; // Cerrar el modal localmente
    },
    confirmCancel() {
      this.closeModal();
    }
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
