document.getElementById("myForm").addEventListener('submit', function(event){
    event.preventDefault()

//Variables 
const username = document.getElementById("username").value 
const lastname = document.getElementById("lastname").value
const number = document.getElementById("numero").value 

//Crear el objeto de datos
const datosusuario = {
    Name: username,
    lastName: lastname,
    Number: number
}
//Los prepara para mandarlos al back
const datosListos = JSON.stringify(datosusuario)
//Enviar los datos 
fetch('http://127.0.0.1:5000/registrar', {
    method: "POST",
    //Dice al back que estoy enviando en este caso un JSON
    headers: {
        "Content-Type": "application/JSON"
    },
    //Lo que le envio
    body: datosListos
}).then(response => response.json())
   .then(data => { console.log("Respuesta del servidor Python:", data);
   })
   .catch(error => {console.log("Hubo un error", error);
   })
})