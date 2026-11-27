const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.protocol === "file:"
    ? "http://localhost:3000"
    : "https://proyecto-bd2-xn4i.onrender.com";

// Elementos del DOM
const listaProductos = document.getElementById("listaProductos");
const formulario = document.getElementById("formularioProducto");
const productoId = document.getElementById("productoId");
const imagenUrlActualInput = document.getElementById("imagenUrlActual");
const nombreInput = document.getElementById("nombre");
const precioInput = document.getElementById("precio");
const stockInput = document.getElementById("stock");
const imagenArchivoInput = document.getElementById("imagenArchivo");
const contenedorVistaPrevia = document.getElementById("contenedorVistaPrevia");
const vistaPrevia = document.getElementById("vistaPrevia");
const textoVistaPrevia = document.getElementById("textoVistaPrevia");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");
const formContacto = document.getElementById("formularioContacto");

// Guardamos los productos en memoria para cargarlos facilmente al editar

let productosMemoria = [];

// Imagen SVG por defecto cuano un producto aún no tien imagen subida a Cloudinary

const IMAGEN_POR_DEFECTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="280" viewBox="0 0 300 280">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e3a8a"/>
        </linearGradient>
      </defs>
      <rect width="300" height="280" fill="url(#bg)"/>
      <rect x="70" y="70" width="130" height="90" rx="10" fill="none" stroke="#60a5fa" stroke-width="4"/>
      <line x1="110" y1="180" x2="160" y2="180" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
      <line x1="135" y1="160" x2="135" y2="180" stroke="#60a5fa" stroke-width="4"/>
      <text x="140" y="220" font-family="Arial, sans-serif" font-size="15" fill="#93c5fd" text-anchor="middle">
        MiTienda Tech — Sin imagen
      </text>
    </svg>
  `);

// Convertir un archivo seleccionado en <input type="file" a cadena Base64
function convertirArchivoABase64(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = (error) => reject(error);
    lector.readAsDataURL(archivo);
  });
}

// Mostrar vista previa inmediata cuando el usuario escoge una imagen de su pc

if (imagenUrlActualInput) {
  imagenArchivoInput.addEventListener("change", async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const base64 = await convertirArchivoABase64(archivo);
    vistaPreviaImagen.src = base64;
    contenedorVistaPrevia.style.display = "flex";
  });
}

// 1. Función para consultar los productos y mostrarlos en el DOM (READ)
async function cargarProductos() {
  if (!listaProductos) return;

  try {
    const respuesta = await fetch(`${API_URL}/productos`);
    const productos = await respuesta.json();
    productosMemoria = Array.isArray(productos) ? productos : [];

    listaProductos.innerHTML = "";

    if (productos.length === 0) {
      listaProductos.innerHTML = "<p style='color: #64748b;'>No hay productos registrados.</p>";
      return;
    }

    productosMemoria.forEach((producto) => {
      const elemento = document.createElement("div");
      elemento.classList.add("producto");

      // FALTABA
      const urlFoto = producto.imagen_url ? producto.imagen_url : IMAGEN_POR_DEFECTO;

      elemento.innerHTML = `
        <div class="producto-imagen-box">
          <img src="${urlFoto}" alt="${producto.nombre}" class="producto-img" />
        </div>
        <div class="producto-cuerpo">
          <div>
            <h3>${producto.nombre}</h3>
            <p class="producto-precio">Precio: $${producto.precio}</p>
            <p>Stock: ${producto.stock} unidades</p>
          </div>
          <div class="acciones">
            <button class="btn-editar" onclick="cargarEnFormulario(${producto.id})">Editar</button>
            <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">Eliminar</button>
          </div>
        </div>
      `;
      // HASTA AQUI

      listaProductos.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// 2. Cargar datos del producto en el formulario para editar (UPDATE - Paso 1)
function cargarEnFormulario(id) {
  const producto = productosMemoria.find((p) => p.id === id);
  if (!producto) return;

  productoId.value = producto.id;
  nombreInput.value = producto.nombre;
  precioInput.value = producto.precio;
  stockInput.value = producto.stock;
  imagenUrlActualInput.value = producto.imagen_url || "";
  if (imagenArchivoInput) imagenArchivoInput.value = "";

  if (producto.imagen_url && contenedorVistaPrevia) {
    vistaPreviaImagen.src = producto.imagen_url;
    textoVistaPrevia.textContent = "Imagen actual en Cloudinary (elige otra si deseas cambiar)";
    contenedorVistaPrevia.style.display = "flex"; // CAMMBIAR
  } else if (contenedorVistaPrevia) {
    contenedorVistaPrevia.style.display = "none";
  }

  tituloFormulario.textContent = "Editar Producto";
  btnGuardar.textContent = "Actualizar Producto";
  btnCancelar.style.display = "block";
  nombreInput.focus();
}

// Cancelar edición y restaurar formulario
function cancelarEdicion() {
  if (!formulario) return;
  formulario.reset();
  productoId.value = "";

  if (imagenUrlActualInput) imagenUrlActualInput.value = "";
  if (contenedorVistaPrevia) contenedorVistaPrevia.style.display = "none";
  tituloFormulario.textContent = "Registrar Producto";
  btnGuardar.textContent = "Guardar Producto";
  btnCancelar.style.display = "none";
}

if (btnCancelar) {
  btnCancelar.addEventListener("click", cancelarEdicion);
}

// 3. Guardar o Actualizar producto (subiendo la imagen a Cloudinary si se seleccionó una)
if (formulario) {
  formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = productoId.value;
    const nombre = nombreInput.value.trim();
    const precio = precioInput.value;
    const stock = stockInput.value;
    const imagen_url = imagenUrlActualInput ? imagenUrlActualInput.value : null;
    const archivoSeleccionado = imagenArchivoInput?.files[0];

    const textoOriginalBoton = btnGuardar.textContent;

    try {
      btnGuardar.disabled = true;
      btnGuardar.textContent = archivoSeleccionado ? "Subiendo imagen a Cloudinary..." : "Guardando...";

      let imagenBase64 = null;
      if (archivoSeleccionado) {
        imagenBase64 = await convertirArchivoABase64(archivoSeleccionado);
      }

      const respuesta = await fetch(id ? `${API_URL}/productos/${id}` : `${API_URL}/productos`, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          precio,
          stock,
          imagen_url,
          imagenBase64,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert("Aviso: " + (datos.mensaje || "No se pudo guardar el producto."));
        return;
      }

      cancelarEdicion();
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.textContent = textoOriginalBoton;
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

    if (productoId && productoId.value == id) {
      cancelarEdicion();
    }

    cargarProductos();
  } catch (error) {
    console.error("Error al eliminar producto:", error);
  }
}

const listaMensajes = document.getElementById("listaContactos");
const btnRecargarMensajes = document.getElementById("btnRecargarMensajes");

// 5. Formulario de contacto (envío a la base de datos vía API - POST /contacto)
if (formContacto) {
  formContacto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombreContacto").value.trim();
    const correo = document.getElementById("correoContacto").value.trim();
    const asunto = document.getElementById("asuntoContacto").value.trim();
    const mensaje = document.getElementById("mensajeContacto").value.trim();
    const botonSubmit = formContacto.querySelector("button[type='submit']");

    try {
      if (botonSubmit) {
        botonSubmit.disabled = true;
        botonSubmit.textContent = "Enviando...";
      }

      const respuesta = await fetch(`${API_URL}/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, asunto, mensaje }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        alert(datos.mensaje || "¡Mensaje de contacto enviado con éxito!");
        formContacto.reset();
        cargarMensajes(); // Actualiza la lista en tiempo real sin recargar página
      } else {
        alert("Error al enviar mensaje: " + (datos.mensaje || "Ocurrió un problema"));
      }
    } catch (error) {
      console.error("Error al enviar mensaje de contacto:", error);
      alert("No se pudo conectar con el servidor. Verifica que el backend esté encendido.");
    } finally {
      if (botonSubmit) {
        botonSubmit.disabled = false;
        botonSubmit.textContent = "Enviar Mensaje";
      }
    }
  });
}

// 6. Consultar y mostrar los mensajes de contacto en pantalla (READ - GET /contacto)
async function cargarMensajes() {
  if (!listaMensajes) return;

  try {
    const respuesta = await fetch(`${API_URL}/contacto/mensajes`);
    if (!respuesta.ok) {
      throw new Error("No se pudo consultar el historial de mensajes");
    }
    const mensajes = await respuesta.json();

    listaMensajes.innerHTML = "";

    if (!Array.isArray(mensajes) || mensajes.length === 0) {
      listaMensajes.innerHTML =
        "<p style='color: #64748b; font-style: italic;'>No hay mensajes registrados aún en la base de datos.</p>";
      return;
    }

    mensajes.forEach((msg) => {
      const fecha = msg.fecha_creacion
        ? new Date(msg.fecha_creacion).toLocaleString("es-ES", {
            dateStyle: "short",
            timeStyle: "short",
          })
        : "Reciente";

      const tarjeta = document.createElement("div");
      tarjeta.classList.add("tarjeta-mensaje");

      tarjeta.innerHTML = `
        <div class="mensaje-top">
          <div class="mensaje-autor">
            <strong>${msg.nombre}</strong>
          </div>
          <span class="mensaje-fecha"> ${fecha}</span>
        </div>
        <div class="mensaje-asunto"> Asunto: ${msg.asunto}</div>
        <div class="mensaje-cuerpo">${msg.mensaje}</div>
        <button class="btn-eliminar-mensaje" onclick="eliminarMensaje(${msg.id})"> Eliminar</button>
      `;

      listaMensajes.appendChild(tarjeta);
    });
  } catch (error) {
    console.error("Error al cargar los mensajes:", error);
    listaMensajes.innerHTML =
      "<p style='color: #dc2626;'>Error al conectar con el servidor para obtener los mensajes.</p>";
  }
}

// 7. Eliminar un mensaje de contacto (DELETE /contacto/:id)
async function eliminarMensaje(id) {
  const confirmar = confirm("¿Deseas eliminar este mensaje de contacto?");
  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/contacto/mensajes/${id}`, {
      method: "DELETE",
    });

    if (respuesta.ok) {
      cargarMensajes();
    } else {
      alert("No se pudo eliminar el mensaje.");
    }
  } catch (error) {
    console.error("Error al eliminar mensaje:", error);
  }
}

// Botón para refrescar la lista de mensajes manualmente
if (btnRecargarMensajes) {
  btnRecargarMensajes.addEventListener("click", cargarMensajes);
}

// Llamados iniciales al cargar la página
cargarProductos();
cargarMensajes();