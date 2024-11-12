<template>
    <v-row class="fill-height ma-0" style="min-height: 100vh; overflow: hidden;">
      <v-col cols="12" md="6" style="display: flex; align-items: center; justify-content: center">
        <div style="width: 500px">

          <div class="logo-wrapper">
            <v-img
              src="@/assets/img/logo-vertical.png"
              alt="Logo HICA"
              :width="250"
              contain
            /> 
            <p class="text-center">Bienvenidos a Historia Clinica Animal</p>
          </div>
          
          <v-container style="display:flex; align-items:center; flex-direction: column">

            <div class="field">
              <v-icon class="field__icon">mdi-email</v-icon>
              <input class="field__input" v-model="email" type="text" placeholder="Correo electrónico" />
            </div>
  
            <div class="field">
              <v-icon class="field__icon">mdi-lock</v-icon>
              <v-text-field
                v-model="password"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Contraseña"
                variant="plain"
                density="compact"
                hide-details
                class="field__input"
                @click:append="showPassword = !showPassword"
              ></v-text-field>
            </div>
  
            <v-alert
              variant="tonal"
              class="mb-3"
              v-if="error"
              type="error"
              title="Credenciales incorrectas"
              text="Posiblemente colocó de forma incorrecta el correo electrónico o la contraseña. Por favor, vuelva a intentarlo"
            ></v-alert>
  
            <v-btn color="success" rounded v-on:click="onLogin" class="w-100">Iniciar sesión</v-btn>
          </v-container>
        </div>
      </v-col>
      <v-col
        cols="12"
        md="6"
        style="padding: 0px; position: relative; background-image: url('./facultad.jpg'); background-size: cover; background-position: center"
      >
        <div
          style="display: flex; align-items:center; justify-content: center; position: absolute; width: 100%; height: 100%"
        >
          <div></div>
        </div>
      </v-col>
    </v-row>
  </template>
  
  <script>
  import { AuthService } from "@/auth/services/AuthService.js";

  
  export default {
    data() {
      return {
        email: '',
        password: '',
        showPassword: false, // Para controlar la visualización de la contraseña
        error: null,
      };
    },
  
    methods: {
      async onLogin() {
        try {
          const response = await AuthService.login(this.email, this.password);
          if (response.token) {
            // Redirigir al home después de login
            this.$router.push({ name: 'home' });
          }
        } catch (error) {
          if (error.response && error.response.status === 401) {
            this.error = "Credenciales inválidas";
          } else {
            this.error = "Error en el servidor. Inténtalo más tarde.";
          }
        }
      },
    },
  };
  </script>
  
  <style scoped>
.field {
  position: relative;
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  margin-bottom: 25px;
}

.field__icon {
  color: #6B7280;
  margin-right: 12px;
}

.field__input {
  flex: 1;
}

:deep(.v-field) {
  background-color: transparent !important;
}

:deep(.v-field__append-inner) {
  padding: 0;
}

.logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
}

:deep(.v-img) {
  display: block;
  height: auto;
}
</style>

