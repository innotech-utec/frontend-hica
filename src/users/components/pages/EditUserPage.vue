<template>
  <v-dialog v-model="localShowModal" max-width="600px" @click:outside="closeModal">
    <v-card>
      <v-card-title class="primary-title text-center">
        Editar Usuario
      </v-card-title>
      <v-card-text>
        <v-form 
          ref="form" 
          @submit.prevent="onSubmit"
          v-model="valid"
          lazy-validation
        >
          <!-- Correo Electrónico -->
          <v-text-field
            v-model="user.email"
            label="Correo Electrónico"
            prepend-icon="mdi-email"
            disabled
          ></v-text-field>

          <v-text-field
  v-model="user.nombre"
  :rules="nombreRules"
  label="Nombre"
  prepend-icon="mdi-account-circle"
  required
  maxLength="50"
  @blur="normalizeText('nombre')"
></v-text-field>

<!-- Apellido -->
<v-text-field
  v-model="user.apellido"
  :rules="apellidoRules"
  label="Apellido"
  prepend-icon="mdi-account-circle"
  required
  maxLength="50"
  @blur="normalizeText('apellido')"
></v-text-field>

<!-- Documento -->
<v-text-field
  v-model="user.documento"
  :rules="documentoRules"
  label="Documento de Identidad"
  prepend-icon="mdi-file-document"
  required
  maxLength="30"
  :error-messages="documentoError"
  @blur="validateDocumento; normalizeText('documento')"
></v-text-field>

          <v-checkbox v-model="user.isAdmin" label="Administrador" class="mt-4" />

          <v-checkbox
            v-model="esVeterinario"
            label="Es Veterinario"
            class="mt-4"
            :disabled="esVeterinario"
          />

          <v-row v-if="esVeterinario">
            <v-col cols="12">
              <v-text-field
                v-model="veterinario.N_de_registro"
                :rules="numeroRegistroRules"
                label="Número de Registro"
                required
                pattern="[0-9]*"
                inputmode="numeric"
                @keypress="onlyNumbers"
                :error-messages="registroError"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="veterinario.Dependencia"
                :items="dependencias"
                label="Dependencia"
                :rules="requiredRule"
                required
              ></v-select>
            </v-col>
          </v-row>

          <div class="button-container">
            <v-card-actions>
              <v-btn 
                rounded 
                color="primary" 
                type="submit" 
                :disabled="!isFormValid"
                :loading="loading"
              >
                Guardar
              </v-btn>
              <v-btn 
                rounded 
                color="secondary" 
                @click="confirmCancel"
                :disabled="loading"
              >
                Cancelar
              </v-btn>
            </v-card-actions>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import Swal from "sweetalert2";
import backend from "@/backend.js";
import ValidationService from "@/validationService.js";

export default {
  props: {
    showModal: {
      type: Boolean,
      required: true,
    },
    UserData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      localShowModal: this.showModal,
      valid: true,
      loading: false,
      user: {
        id: null,
        email: "",
        nombre: "",
        apellido: "",
        documento: "",
        isAdmin: false,
      },
      veterinario: {
        N_de_registro: "",
        Dependencia: "",
      },
      esVeterinario: false,
      documentoError: "",
      registroError: "",
      documentoOriginal: "",
      originalUser: null,
      dependencias: [
        "CLÍNICA PEQUEÑOS ANIMALES",
        "EQUINOS",
        "ENDOCRINOLOGÍA y METABOLISMO ANIMAL",
        "GESTIÓN HOSPITALARIA",
        "SEMIOLOGÍA",
      ],
      nombreRules: [
        v => !!v || 'El nombre es requerido',
        v => !!v && v.trim().length > 0 || 'El nombre no puede contener solo espacios',
        v => !!v && v.length >= 2 && v.length <= 50 || 'El nombre debe tener entre 2 y 50 caracteres',
        v => !!v && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v) || 'El nombre solo puede contener letras y espacios',
        v => !v || !v.includes('  ') || 'El nombre no puede contener espacios dobles'
      ],
      apellidoRules: [
        v => !!v || 'El apellido es requerido',
        v => !!v && v.trim().length > 0 || 'El apellido no puede contener solo espacios',
        v => !!v && v.length >= 2 && v.length <= 50 || 'El apellido debe tener entre 2 y 50 caracteres',
        v => !!v && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v) || 'El apellido solo puede contener letras y espacios',
        v => !v || !v.includes('  ') || 'El apellido no puede contener espacios dobles'
      ],
      documentoRules: [
        v => !!v || 'El documento es requerido',
        v => !!v && v.trim().length > 0 || 'El documento no puede contener solo espacios',
        v => !!v && v.length >= 3 && v.length <= 30 || 'El documento debe tener entre 3 y 30 caracteres',
        v => !!v && /^[a-zA-Z0-9]+$/.test(v) || 'El documento solo puede contener letras y números'
      ],
      numeroRegistroRules: [
        v => !this.esVeterinario || !!v || 'El número de registro es requerido',
        v => !this.esVeterinario || (!!v && /^\d+$/.test(v)) || 'Solo se permiten números'
      ],
      requiredRule: [
        v => !!v || 'Este campo es requerido'
      ]
    };
  },

  computed: {
    isFormValid() {
      const baseValidation = (
        this.valid &&
        this.user.nombre &&
        this.user.apellido &&
        this.user.documento &&
        !this.documentoError
      );

      if (!this.esVeterinario) {
        return baseValidation;
      }

      return baseValidation && (
        this.veterinario.N_de_registro &&
        this.veterinario.Dependencia &&
        !this.registroError
      );
    }
  },
  

  watch: {
    showModal(val) {
      this.localShowModal = val;
    },
    localShowModal(val) {
      if (!val) this.$emit("close");
    },
    'user.documento': {
      handler(newDocumento) {
        if (newDocumento && newDocumento !== this.documentoOriginal) {
          this.validateDocumento();
        } else {
          this.documentoError = '';
        }
        this.checkFormValidity();
      }
    },
    'veterinario.N_de_registro': {
      handler(newValue) {
        if (this.esVeterinario) {
          if (!newValue) {
            this.registroError = 'El número de registro es requerido';
          } else if (!/^\d+$/.test(newValue)) {
            this.registroError = 'Solo se permiten números';
          } else {
            this.registroError = '';
          }
          this.checkFormValidity();
        }
      }
    },
    esVeterinario(newValue) {
      if (!newValue) {
        this.veterinario = {
          N_de_registro: '',
          Dependencia: ''
        };
        this.registroError = '';
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.validate();
        }
        this.checkFormValidity();
      });
    }
  },

  async mounted() {
    try {
      this.loading = true;
      const userId = this.UserData.id;
      
      const userResponse = await backend.get(`usuarios/${userId}`);
      this.user = {
        id: userId,
        email: userResponse.data.email || '',
        nombre: userResponse.data.nombre || '',
        apellido: userResponse.data.apellido || '',
        documento: userResponse.data.documento || '',
        isAdmin: userResponse.data.isAdmin || false
      };
      
      this.originalUser = { ...this.user };
      this.documentoOriginal = this.user.documento;

      try {
        const veterinarioResponse = await backend.get(`veterinarios/${userId}`);
        if (veterinarioResponse.data) {
          this.esVeterinario = true;
          this.veterinario = {
            N_de_registro: veterinarioResponse.data.N_de_registro || '',
            Dependencia: veterinarioResponse.data.Dependencia || ''
          };
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          console.error("Error al cargar datos del veterinario:", error);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los datos del usuario",
        icon: "error"
      });
    } finally {
      this.loading = false;
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.resetValidation();
        }
      });
    }
  },

  methods: {

    normalizeText(field) {
    if (this.user[field]) {
      this.user[field] = this.user[field].toUpperCase().trim();
    }
    if (this.veterinario[field]) {
      this.veterinario[field] = this.veterinario[field].toUpperCase().trim();
    }
  },
    onlyNumbers(e) {
      const char = String.fromCharCode(e.keyCode);
      if (/^[0-9]+$/.test(char)) return true;
      e.preventDefault();
    },


async validateEmail() {
  if (!this.user.email) {
    this.emailError = '';
    return;
  }
  
  try {
    const resultado = await ValidationService.validarEmailUnico(
      this.user.email,
      this.user.id
    );
    this.emailError = resultado.isValid ? '' : resultado.message;
    this.checkFormValidity();
  } catch (error) {
    console.error('Error al validar el correo:', error);
    this.emailError = 'Error al validar el correo';
    this.checkFormValidity();
  }
},
   async validateDocumento() {
      try {
        if (!this.user.documento) return { isValid: true, message: "" };
        const resultado = await ValidationService.validarDocumentoUnico(
          this.user.documento,
          this.user.id
        );
        this.documentoError = resultado.isValid ? "" : resultado.message;
        return resultado;
      } catch (error) {
        console.error("Error en validación de documento:", error);
        this.documentoError = "Error al validar el documento";
        return { isValid: false, message: "Error al validar el documento" };
      }
    },

    checkFormValidity() {
      if (!this.$refs.form) return;

      const baseFieldsValid = 
        this.user.nombre &&
        this.user.apellido &&
        this.user.documento &&
        !this.documentoError;

      if (!this.esVeterinario) {
        this.valid = baseFieldsValid;
        return;
      }

      const veterinarioFieldsValid = 
        this.veterinario.N_de_registro &&
        this.veterinario.Dependencia &&
        !this.registroError;

      this.valid = baseFieldsValid && veterinarioFieldsValid;
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
    // Validar documento único
    const documentoResultado = await this.validateDocumento();
    if (!documentoResultado.isValid) {
      return Swal.fire({
        icon: "error",
        title: "Documento en uso",
        text: "El documento ya está registrado en el sistema. Por favor, verifique.",
      });
    }

    // Actualizar usuario
    await backend.patch(`usuarios/${this.user.id}`, {
      email: this.user.email,
      nombre: this.user.nombre.toUpperCase(),
      apellido: this.user.apellido.toUpperCase(),
      documento: this.user.documento.toUpperCase(),
      isAdmin: this.user.isAdmin,
    });

    if (this.esVeterinario) {
      try {
        await backend.patch(`veterinarios/${this.user.id}`, {
          N_de_registro: this.veterinario.N_de_registro,
          Dependencia: this.veterinario.Dependencia,
        });
      } catch (error) {
        if (error.response && error.response.status === 404) {
          await backend.post('veterinarios', {
            N_de_registro: this.veterinario.N_de_registro,
            Dependencia: this.veterinario.Dependencia,
            userId: this.user.id,
          });
        } else {
          throw error;
        }
      }
    }

    Swal.fire({
      title: "Usuario actualizado",
      text: "Los datos se han guardado correctamente.",
      icon: "success",
    });

    this.$emit("close");
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
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

    async confirmCancel() {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas cancelar la edición?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No",
      });
      if (result.isConfirmed) this.$emit("close");
    },
  },
};
</script>

<style scoped>
.primary-title {
  background-color: #014582 !important;
  color: white !important;
  font-weight: bold;
  padding: 16px;
}
.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.v-btn.primary {
  background-color: #014582 !important;
  color: white;
}
.v-btn.primary:hover {
  background-color: #013262 !important;
}
.v-btn.secondary {
  background-color: #008575 !important;
}
.v-btn.secondary:hover {
  background-color: #007460 !important;
}
</style>