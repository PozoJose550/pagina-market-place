document.addEventListener('DOMContentLoaded', () => {
  const inputImagenes = document.getElementById('imagenes');
  const botonSelectImg = document.getElementById('boton-select-img');
  const previewCont = document.getElementById('preview-imagenes');
  const formulario = document.getElementById('formulario');
  const lista = document.getElementById('lista');
  const resultado = document.getElementById('resultado');

  botonSelectImg.addEventListener('click', () => {
    inputImagenes.click();
  });

  let imagenesBase64 = [];

  function mostrarPrevisualizacion() {
    previewCont.innerHTML = '';
    imagenesBase64.forEach(base64 => {
      const img = document.createElement('img');
      img.src = base64;
      previewCont.appendChild(img);
    });
  }

  inputImagenes.addEventListener('change', () => {
    const files = inputImagenes.files;
    imagenesBase64 = [];
    if (files.length === 0) {
      previewCont.innerHTML = '';
      return;
    }
    let procesados = 0;
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = e => {
        imagenesBase64.push(e.target.result);
        procesados++;
        if (procesados === files.length) mostrarPrevisualizacion();
      };
      reader.readAsDataURL(files[i]);
    }
  });

  function construirTexto(pub) {
    let texto = `Título: ${pub.titulo}\nPrecio: ${pub.precio}\nDescripción:\n${pub.descripcion}`;
    if (pub.urls && pub.urls.length > 0) {
      texto += '\nFotos: (imágenes seleccionadas)';
    }
    return texto;
  }

  function guardarPublicaciones(data) {
    localStorage.setItem('publicacionesLavadoras', JSON.stringify(data));
  }

  function cargarPublicaciones() {
    const pubs = localStorage.getItem('publicacionesLavadoras');
    return pubs ? JSON.parse(pubs) : [];
  }

  function mostrarLista() {
    lista.innerHTML = '';
    const pubs = cargarPublicaciones();
    if (pubs.length === 0) {
      lista.innerHTML = '<li>No hay publicaciones guardadas.</li>';
      return;
    }

    pubs.forEach((pub, idx) => {
      const li = document.createElement('li');

      const textoNombre = document.createElement('span');
      textoNombre.textContent = pub.nombre;

      // Botones para copiar por partes
      const btnCopiarTitulo = document.createElement('button');
      btnCopiarTitulo.textContent = 'Copiar Título';
      btnCopiarTitulo.className = 'btn-lista';
      btnCopiarTitulo.title = 'Copiar título al portapapeles';
      btnCopiarTitulo.addEventListener('click', () => {
        navigator.clipboard.writeText(pub.titulo)
          .then(() => alert(`Título de "${pub.nombre}" copiado.`))
          .catch(() => alert('Error al copiar el título.'));
      });

      const btnCopiarPrecio = document.createElement('button');
      btnCopiarPrecio.textContent = 'Copiar Precio';
      btnCopiarPrecio.className = 'btn-lista';
      btnCopiarPrecio.title = 'Copiar precio al portapapeles';
      btnCopiarPrecio.addEventListener('click', () => {
        navigator.clipboard.writeText(pub.precio)
          .then(() => alert(`Precio de "${pub.nombre}" copiado.`))
          .catch(() => alert('Error al copiar el precio.'));
      });

      const btnCopiarDesc = document.createElement('button');
      btnCopiarDesc.textContent = 'Copiar Descripción';
      btnCopiarDesc.className = 'btn-lista';
      btnCopiarDesc.title = 'Copiar descripción al portapapeles';
      btnCopiarDesc.addEventListener('click', () => {
        navigator.clipboard.writeText(pub.descripcion)
          .then(() => alert(`Descripción de "${pub.nombre}" copiada.`))
          .catch(() => alert('Error al copiar la descripción.'));
      });

      // Botón copiar todo el texto
      const btnCopiarTodo = document.createElement('button');
      btnCopiarTodo.textContent = 'Copiar Todo';
      btnCopiarTodo.className = 'btn-lista';
      btnCopiarTodo.title = 'Copiar todo el texto al portapapeles';
      btnCopiarTodo.addEventListener('click', () => {
        navigator.clipboard.writeText(construirTexto(pub))
          .then(() => alert(`Texto completo de "${pub.nombre}" copiado.`))
          .catch(() => alert('Error al copiar el texto.'));
      });

      // Botón cargar para editar
      const btnCargar = document.createElement('button');
      btnCargar.textContent = 'Cargar';
      btnCargar.className = 'btn-lista';
      btnCargar.title = 'Cargar publicación para editar';
      btnCargar.addEventListener('click', () => {
        cargarEnFormulario(pub);
      });

      // Botón borrar publicación
      const btnBorrar = document.createElement('button');
      btnBorrar.textContent = 'Borrar';
      btnBorrar.className = 'btn-lista';
      btnBorrar.title = 'Eliminar publicación';
      btnBorrar.addEventListener('click', () => {
        if (confirm(`¿Seguro quieres borrar "${pub.nombre}"?`)) {
          borrarPublicacion(idx);
        }
      });

      li.appendChild(textoNombre);
      li.appendChild(btnCopiarTitulo);
      li.appendChild(btnCopiarPrecio);
      li.appendChild(btnCopiarDesc);
      li.appendChild(btnCopiarTodo);
      li.appendChild(btnCargar);
      li.appendChild(btnBorrar);

      lista.appendChild(li);
    });
  }

  function cargarEnFormulario(pub) {
    formulario.nombrePub.value = pub.nombre;
    formulario.titulo.value = pub.titulo;
    formulario.precio.value = pub.precio;
    formulario.descripcion.value = pub.descripcion;
    imagenesBase64 = pub.urls || [];
    mostrarPrevisualizacion();
    resultado.textContent = construirTexto(pub);
    resultado.scrollIntoView({ behavior: 'smooth' });
  }

  function borrarPublicacion(idx) {
    const pubs = cargarPublicaciones();
    pubs.splice(idx, 1);
    guardarPublicaciones(pubs);
    mostrarLista();
  }

  formulario.addEventListener('submit', e => {
    e.preventDefault();

    const nombre = formulario.nombrePub.value.trim();
    const titulo = formulario.titulo.value.trim();
    const precio = formulario.precio.value.trim();
    const descripcion = formulario.descripcion.value.trim();

    if (!nombre || !titulo || !precio || !descripcion) {
      alert('Por favor llena todos los campos obligatorios.');
      return;
    }

    const nuevaPub = { nombre, titulo, precio, descripcion, urls: imagenesBase64 };

    const pubs = cargarPublicaciones();
    const idxExistente = pubs.findIndex(p => p.nombre.toLowerCase() === nombre.toLowerCase());
    if (idxExistente >= 0) {
      pubs[idxExistente] = nuevaPub;
    } else {
      pubs.push(nuevaPub);
    }

    guardarPublicaciones(pubs);
    mostrarLista();

    resultado.textContent = construirTexto(nuevaPub);
    resultado.scrollIntoView({ behavior: 'smooth' });

    alert(`Publicación "${nombre}" guardada exitosamente.`);
  });

  mostrarLista();
});
