export const token = (value) => {
    if(!value){
        return localStorage.getItem('token');
    }

    //Guarda el token en el cache del navegador
    localStorage.setItem('token', value);
}