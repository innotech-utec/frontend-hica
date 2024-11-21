<template>
  <v-card class="card">
    <v-container>
      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="form-title">Editar Usuario</h2>
        </v-col>
      </v-row>

      <v-form ref="form" @submit.prevent="onSubmit" v-model="valid">
        <!-- Correo electrónico -->
        <v-text-field
          v-model="user.email"
          label="Correo Electrónico"
          prepend-icon="mdi-email"
          disabled
        ></v-text-field>

        <!-- Nombre -->
        <v-text-field
          v-model="user.nombre"
          :rules="nombreRules"
          label="Nombre"
          prepend-icon="mdi-account-circle"
          required
        ></v-text-field>

        <!-- Apellido -->
        <v-text-field
          v-model="user.apellido"
          :rules="apellidoRules"
          label="Apellido"
          prepend-icon="mdi-account-circle"
          required
        ></v-text-field>

        <!-- Documento -->
        <v-text-field
          v-model="user.documento"
          :rules="documentoRules"
          label="Documento de Identidad"
          prepend-icon="mdi-file-document"
          required
          :error-messages="documentoError"
        ></v-text-field>

        <v-checkbox v-model="user.isAdmin" label="Administrador" class="mt-4" />

        <v-checkbox
          v-model="esVeterinario"
          label="Es Veterinario"
          class="mt-4"
          :disabled="esVeterinario"
        />

        <!-- Si es veterinario, muestra los campos adicionales -->
        <v-row v-if="esVeterinario">
          <v-col cols="12">
            <v-text-field
              v-model="veterinario.N_de_registro"
              :rules="requiredRule"
              label="Número de Registro"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="veterinario.Dependencia"
              :items="[
                'Clinica Pequeños Animales',
                'Equinos',
                'Endocrinologia y Metabolismo Animal',
                'Gestión Hospitalaria',
                'Semiología',
              ]"
              label="Dependencia"
              required
            ></v-select>
          </v-col>
          <v-col cols="12">
            <v-file-input
              v-model="veterinario.Foto"
              accept="image/png, image/jpeg"
              label="Subir Foto (JPG, PNG)"
            ></v-file-input>
          </v-col>
        </v-row>

        <v-card-actions>
          <v-btn rounded color="primary" type="submit" :disabled="!valid">
            Guardar
          </v-btn>
          <v-btn rounded color="secondary" @click="confirmCancel('edición')">
            Cancelar
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import backend from "@/backend.js";
import Swal from "sweetalert2";
import ValidationService from '@/validationService.js';

export default {
  data() {
    return {
      valid: true,
      user: {
        email: "",
        nombre: "",
        apellido: "",
        documento: "",
        isAdmin: false,
      },
      veterinario: {
        N_de_registro: '',
        Dependencia: '',
        Foto: null,
      },
      esVeterinario: false,
      requiredRule: [v => !!v || 'Este campo es requerido'],
      nombreRules: [
        v => !!v || 'El nombre es requerido',
        v => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres'
      ],
      apellidoRules: [
        v => !!v || 'El apellido es requerido',
        v => v.length >= 2 || 'El apellido debe tener al menos 2 caracteres'
      ],
      documentoRules: [
        v => !!v || 'El documento es requerido',
        v => this.validarDocumento(v) || 'Validando documento...'
      ],
      documentoError: '',
      documentoOriginal: '',
      originalUser: null,
    };
  },

  async mounted() {
    try {
      const userId = this.$route.params.id;
      const response = await backend.get(`usuarios/${userId}`);
      this.user = response.data;
      this.originalUser = { ...response.data };
      this.documentoOriginal = response.data.documento;

      // Cargar datos del veterinario por userId
      try {
        const veterinarioResponse = await backend.get(`veterinarios/${userId}`);
        if (veterinarioResponse.data) {
          this.esVeterinario = true;
          this.veterinario = veterinarioResponse.data;
        }
      } catch (error) {
        console.log('Este usuario no es veterinario, omitiendo carga de datos del veterinario.');
        this.esVeterinario = false;
      }
    } catch (error) {
      Swal.fire({
        title: "Error al cargar usuario",
        text: "No se pudieron cargar los datos del usuario",
        icon: "error",
      });
    }
  },

  methods: {
    async validarDocumento(documento) {
      if (!documento || documento === this.documentoOriginal) return true;
      
      const resultado = await ValidationService.validarDocumentoUnico(documento, this.$route.params.id);
      return resultado.isValid || resultado.message;
    },

    resetForm() {
      this.$refs.form.reset();
      this.user = { ...this.originalUser };
      this.documentoError = '';
    },

    async onSubmit() {
      if (!this.$refs.form.validate()) {
        return Swal.fire({
          icon: "error",
          title: "Validación",
          text: "Por favor, complete todos los campos requeridos correctamente.",
        });
      }

      try {
        // Validar documento si ha cambiado
        if (this.user.documento !== this.documentoOriginal) {
          const documentoResultado = await ValidationService.validarDocumentoUnico(
            this.user.documento,
            this.$route.params.id
          );

          if (!documentoResultado.isValid) {
            return Swal.fire({
              icon: "error",
              title: "Documento en uso",
              text: "El documento ya está registrado en el sistema. Por favor, verifique.",
            });
          }
        }

        // Verificar campos requeridos
        if (!this.user.nombre || !this.user.apellido || !this.user.documento) {
          return Swal.fire({
            icon: "error",
            title: "Campos requeridos",
            text: "Por favor, complete todos los campos requeridos.",
          });
        }

        // Actualizar los datos del usuario
        await backend.patch(`usuarios/${this.$route.params.id}`, {
          email: this.user.email,
          nombre: this.user.nombre,
          apellido: this.user.apellido,
          documento: this.user.documento,
          isAdmin: this.user.isAdmin,
        });

        // Si es veterinario, actualizar o crear los datos adicionales
        if (this.esVeterinario) {
          const formData = new FormData();
          formData.append('N_de_registro', this.veterinario.N_de_registro);
          formData.append('Dependencia', this.veterinario.Dependencia);

          if (this.veterinario.Foto) {
            formData.append('Foto', this.veterinario.Foto);
          }

          try {
            await backend.patch(`veterinarios/${this.$route.params.id}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
          } catch (error) {
            // Si el veterinario no existe, crear una nueva entrada
            if (error.response && error.response.status === 404) {
              if (this.veterinario.Foto) {
                const file = this.veterinario.Foto;
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async () => {
                  const base64String = reader.result.split(',')[1];
                  await backend.post('veterinarios', {
                    N_de_registro: this.veterinario.N_de_registro,
                    Dependencia: this.veterinario.Dependencia,
                    Foto: base64String,
                    userId: this.$route.params.id
                  }, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'application/json'
                    },
                  });
                };
              } else {
                await backend.post('veterinarios', {
                  N_de_registro: this.veterinario.N_de_registro,
                  Dependencia: this.veterinario.Dependencia,
                  userId: this.$route.params.id
                }, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                  },
                });
              }
            } else {
              throw error;
            }
          }
        }

        Swal.fire({
          title: "Usuario actualizado",
          text: "Los datos del usuario han sido actualizados",
          icon: "success",
        });

        this.$router.replace("/usuarios");
      } catch (error) {
        let errorMessage = "No se pudieron actualizar los datos del usuario";
        
        if (error.response) {
          if (error.response.status === 409) {
            errorMessage = "El documento ya está registrado por otro usuario";
          } else if (error.response.status === 400) {
            errorMessage = "Por favor, verifique los datos ingresados";
          } else {
            errorMessage = error.response.data.message || errorMessage;
          }
        }

        Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: errorMessage,
        });
      }
    },

    async confirmCancel(action) {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: `¿Deseas cancelar la ${action} del usuario?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Continuar",
      });

      if (result.isConfirmed) {
        this.$router.push("/usuarios");
      }
    },
  },

  watch: {
    'user.documento': {
      handler: async function(newDocumento) {
        if (newDocumento && newDocumento !== this.documentoOriginal) {
          const resultado = await ValidationService.validarDocumentoUnico(newDocumento, this.$route.params.id);
          this.documentoError = resultado.isValid ? '' : resultado.message;
        } else {
          this.documentoError = '';
        }
      }
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