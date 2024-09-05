<template>

<div v-on:click="toggleMenu" class="profile" :style="{backgroundImage: `url('${profileImage}')`}">
    <ul v-if="isActive" class="profile__menu">
        <li class="profile__menu__item">
            <v-icon>mdi-account-circle</v-icon>
            Perfil
        </li>
        <li class="profile__menu__item" v-on:click="onLogout">
            <v-icon>mdi-logout</v-icon>
            Cerrar sesión
        </li>
    </ul>
</div>

</template>
<script>

import profileImage from "@/assets/img/user.png" 
import { TokenService } from '@/auth/services/TokenService.js'

export default {
    data() {
        return {
            isActive: false,
            profileImage: profileImage
        }
    },

    methods: {
        toggleMenu(){
            this.isActive = !this.isActive;
        },

        onLogout() {
            TokenService.clear();
            this.$router.push({name: 'login'});
        }
    }

};

</script>

<style>


.profile{
    cursor:pointer; 
    border-radius: 50%; 
    width: 50px; 
    height: 50px; 
    position: relative; 
    background-size: contain;
}

.profile__menu{
    list-style: none; 
    background: white; 
    position: absolute; 
    top: 100%; 
    z-index: 1; 
    min-width: 300px; 
    left: 100%; 
    transform: translateX(-300px) translatey(8px); 
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px; 
    border-radius: 16px; 
}

.profile__menu__item{
    padding: 12px 20px;
    transition: 0.2s;
    font-weight: bold;
}

.profile__menu__item:hover{
    background: var(--primary-100);
    color: var(--primary-600);
}

</style>