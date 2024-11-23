<template>
  <v-dialog v-model="editModal" max-width="600px">
    <v-card>
      <v-card-title>Editar Parámetros</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="onSubmit">
          <v-text-field
            v-model="localParametro.fecha"
            label="Fecha"
            type="date"
            :rules="[rules.required]"
            required
          ></v-text-field>
          <v-text-field
            v-model="formattedHora"
            label="Hora"
            type="time"
            :rules="[rules.required]"
            required
            @input="updateHora"
          ></v-text-field>
          <v-text-field
            v-model="localParametro.FC"
            label="Frecuencia Cardíaca (FC)"
            :rules="[rules.required, rules.numeric]"
            required
          ></v-text-field>
          <v-text-field
            v-model="localParametro.FR"
            label="Frecuencia Respiratoria (FR)"
            :rules="[rules.required, rules.numeric]"
            required
          ></v-text-field>
          <v-text-field
            v-model="localParametro.temperatura"
            label="Temperatura (°C)"
            :rules="[rules.required, rules.numeric]"
            required
          ></v-text-field>
          <v-select
            v-model="localParametro.mucosas"
            label="Tipo de Mucosas"
            :items="['ROSADAS', 'PALIDAS', 'HIPEREMICAS', 'CONGESTIVAS', 'TOXEMICAS', 'HIPOXICAS']"
            :rules="[rules.required]"
          ></v-select>
          <v-text-field
            v-model="localParametro.TllC"
            label="TllC"
            suffix="seg"
            :rules="[rules.required, rules.numeric]"
            required
          ></v-text-field>
          <v-textarea
            v-model="localParametro.observaciones"
            label="Observaciones"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="onSubmit" :loading="loading" :disabled="!valid">Guardar</v-btn>
        <v-btn color="secondary" @click="closeModal">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, reactive, watch, onMounted } from 'vue';
import backend from "@/backend";
import Swal from 'sweetalert2';

export default {
  props: {
    parametro: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean,
      default: false
    },
  },
  emits: ['update:show', 'parametroActualizado', 'cerrarModal'],
  setup(props, { emit }) {
    const form = ref(null);
    const valid = ref(false);
    const editModal = ref(props.show);
    const loading = ref(false);
    const formattedHora = ref("");
    
    const rules = {
      required: (v) => !!v || "Este campo es requerido",
      numeric: (v) => !isNaN(v) || "El valor debe ser numérico"
    };

    const localParametro = reactive({ ...props.parametro });

    const formatHora = (hora) => {
      if (!hora) return "";
     
      if (hora.includes(':')) {
        const parts = hora.split(':');
        return `${parts[0]}:${parts[1]}`;
      }
      return hora;
    };

    const updateHora = (newValue) => {
      localParametro.hora = newValue;
    };

    watch(
      () => props.show,
      (newShow) => {
        editModal.value = newShow;
      }
    );

    watch(
      () => props.parametro,
      (newParametro) => {
        Object.assign(localParametro, { ...newParametro });
        formattedHora.value = formatHora(newParametro.hora);
      },
      { immediate: true }
    );

    const closeModal = () => {
      emit('update:show', false);
      emit('cerrarModal');
    };

    const onSubmit = async () => {
      if (!form.value) return;

      const isValid = await form.value.validate();
      if (isValid) {
        try {
          loading.value = true;
          
         
          localParametro.hora = formattedHora.value;
          
          await backend.patch(`/registroParametros/${localParametro.id}`, localParametro, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });

          Swal.fire({
            title: "Parámetro Actualizado",
            text: "El parámetro ha sido actualizado con éxito.",
            icon: "success"
          });

          emit('parametroActualizado', localParametro);
          closeModal();
        } catch (error) {
          console.error('Error al actualizar el parámetro:', error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo actualizar el parámetro."
          });
        } finally {
          loading.value = false;
        }
      }
    };

    onMounted(() => {
      Object.assign(localParametro, props.parametro);
      formattedHora.value = formatHora(props.parametro.hora);
    });

    return {
      form,
      valid,
      editModal,
      loading,
      localParametro,
      formattedHora,
      closeModal,
      onSubmit,
      updateHora,
      rules
    };
  }
};
</script>

<style scoped>
.v-btn {
  margin-top: 20px;
}
</style>