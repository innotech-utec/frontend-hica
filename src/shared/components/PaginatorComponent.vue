<template>

    <div class="paginator">
        <div class="paginator__item" v-for="current in length" :key="current" v-on:click="$emit('onChange', current)">
            {{ current }}
        </div>
    </div>

</template>
<script>

    export default {

        props: {
            length
        }

    };

</script>

<style>

    .paginator{
        display: flex;
        gap: 4px;
    }

    .paginator__item{
        background: var(--primary-200);
        color: var(--primary-800);
        width: 36px; 
        height: 36px; 
        border-radius: 12px;  
        display: flex; 
        align-items:center; 
        justify-content:center;
        font-weight: bold;
        cursor: pointer;
        transition: 0.2s;
        border-radius: 12px; 
    }

    .paginator__item:hover{
        background: var(--primary-300);
    }    

</style>