const API_URL = "http://localhost:3000";

// Elementos del DOM
const listaProductos = document.getElementById("listaProductos");
const formulario = document.getElementById("formularioProducto");
const productoId = document.getElementById("productoId");
const nombreInput = document.getElementById("nombre");
const precioInput = document.getElementById("precio");
const stockInput = document.getElementById("stock");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");

const formContacto = document.getElementById("formularioContacto");
const listaContactos = document.getElementById("listaContactos");
const nombreContactoInput = document.getElementById("nombreContacto");
const correoContactoInput = document.getElementById("correoContacto");
const asuntoContactoInput = document.getElementById("asuntoContacto");
const mensajeContactoInput = document.getElementById("mensajeContacto");

// 1. Función para consultar los productos y mostrarlos en el DOM (READ)
async function cargarProductos() {
  if (!listaProductos) return;

  try {
    const respuesta = await fetch(`${API_URL}/productos`);
    const productos = await respuesta.json();

    listaProductos.innerHTML = "";

    if (productos.length === 0) {
      listaProductos.innerHTML = "<p style='color: #64748b;'>No hay productos registrados.</p>";
      return;
    }

    productos.forEach((producto) => {
      const elemento = document.createElement("div");
      elemento.classList.add("producto");

      elemento.innerHTML = `
        <div>
          <h3>${producto.nombre}</h3>
          <p class="producto-precio">Precio: $${producto.precio}</p>
          <p>Stock: ${producto.stock} unidades</p>
        </div>
        <div class="acciones">
          <button class="btn-editar" onclick="cargarEnFormulario(${producto.id}, '${producto.nombre}', ${producto.precio}, ${producto.stock})">Editar</button>
          <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">Eliminar</button>
        </div>
      `;

      listaProductos.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// 2. Cargar datos del producto en el formulario para editar (UPDATE - Paso 1)
function cargarEnFormulario(id, nombre, precio, stock) {
  productoId.value = id;
  nombreInput.value = nombre;
  precioInput.value = precio;
  stockInput.value = stock;

  tituloFormulario.textContent = "Editar Producto";
  btnGuardar.textContent = "Actualizar Producto";
  btnCancelar.style.display = "block";
  nombreInput.focus();
}

// Cancelar edición y restaurar formulario
function cancelarEdicion() {
  formulario.reset();
  productoId.value = "";
  tituloFormulario.textContent = "Registrar Producto";
  btnGuardar.textContent = "Guardar Producto";
  btnCancelar.style.display = "none";
}

if (btnCancelar) {
  btnCancelar.addEventListener("click", cancelarEdicion);
}

// 3. Guardar o Actualizar según si hay un ID seleccionado (CREATE o UPDATE)
if (formulario) {
  formulario.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evitar que la página se recargue

    const id = productoId.value;
    const nombre = nombreInput.value;
    const precio = precioInput.value;
    const stock = stockInput.value;

    try {
      if (id) {
        // MODO ACTUALIZAR (PUT)
        await fetch(`${API_URL}/productos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, precio, stock }),
        });
      } else {
        // MODO CREAR (POST)
        await fetch(`${API_URL}/productos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, precio, stock }),
        });
      }

      cancelarEdicion(); // Limpiar formulario y restaurar botones
      cargarProductos(); // Refrescar la lista en pantalla
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    }
  });
}
// 4. Eliminar un producto (DELETE)
async function eliminarProducto(id) {
  const confirmar = confirm("¿Deseas eliminar este producto de la base de datos?");
  if (!confirmar) return;

  try {
    await fetch(`${API_URL}/productos/${id}`, {
      method: "DELETE",
    });
    if (productoId.value == id) {
      cancelarEdicion();
    }
    cargarProductos(); 
  } catch (error) {
    console.error("Error al eliminar producto:", error);
  }
}
// Cargar y mostrar el historial de mensajes de contacto
async function cargarContactos() {
  if (!listaContactos) return;

  try {
    const respuesta = await fetch(`${API_URL}/contactos`);
    if (!respuesta.ok) {
      throw new Error("No se pudo consultar el historial de mensajes");
    }

    const contactos = await respuesta.json();
    listaContactos.innerHTML = "";

    if (contactos.length === 0) {
      listaContactos.textContent = "Aún no hay mensajes enviados.";
      return;
    }

    contactos.forEach((contacto) => {
      const elemento = document.createElement("article");
      elemento.classList.add("mensaje-contacto");

      const titulo = document.createElement("h3");
      titulo.textContent = contacto.asunto;

      const datos = document.createElement("p");
      datos.textContent = `${contacto.nombre} · ${contacto.correo}`;

      const fecha = document.createElement("p");
      fecha.classList.add("fecha-contacto");
      fecha.textContent = `Enviado: ${new Date(contacto.fecha_creacion).toLocaleString("es-CO")}`;

      const mensaje = document.createElement("p");
      mensaje.textContent = contacto.mensaje;

      const acciones = document.createElement("div");
      acciones.classList.add("acciones");

      const botonEliminar = document.createElement("button");
      botonEliminar.classList.add("btn-eliminar");
      botonEliminar.textContent = "Eliminar";
      botonEliminar.addEventListener("click", () => eliminarContacto(contacto.id));

      acciones.appendChild(botonEliminar);
      elemento.append(titulo, datos, fecha, mensaje, acciones);
      listaContactos.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar los mensajes:", error);
    listaContactos.textContent = "No se pudo cargar el historial de mensajes.";
  }
}

// Eliminar un mensaje de contacto (DELETE)
async function eliminarContacto(id) {
  try {
    await fetch(`${API_URL}/contactos/${id}`, {
      method: "DELETE",
    });
    cargarContactos();
  } catch (error) {
    console.error("Error al eliminar el mensaje:", error);
  }
}

// 5. Enviar un mensaje de contacto y actualizar el historial
if (formContacto) {
  formContacto.addEventListener("submit", async (event) => {
    event.preventDefault();

    const datosContacto = {
      nombre: nombreContactoInput.value,
      correo: correoContactoInput.value,
      asunto: asuntoContactoInput.value,
      mensaje: mensajeContactoInput.value,
    };

    try {
      const respuesta = await fetch(`${API_URL}/contactos`, {
        method: "POST",
        headers: { "Content-Type": "application/json"
         },
        body: JSON.stringify(datosContacto),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || "No se pudo enviar el mensaje");
      }
      alert("¡Mensaje enviado con éxito!");
      formContacto.reset();
      await cargarContactos();
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      alert(error.message || "No se pudo enviar el mensaje. Intenta de nuevo.");
    }
  });
}
cargarProductos();
cargarContactos();
