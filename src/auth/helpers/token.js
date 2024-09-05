export const token = (value) => {
    if(!value){
        return localStorage.getItem('token');
    }

    localStorage.setItem('token', value);
}