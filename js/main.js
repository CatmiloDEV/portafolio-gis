// ==========================================
// 1. INICIALIZAR EL MAPA
// ==========================================
const mapa = L.map('map').setView([1.2136, -77.2811], 12);


// ==========================================
// 2. CAPAS BASE Y SELECTOR
// ==========================================
const mapaCallejero = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
});

const mapaSatelital = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
});

mapaCallejero.addTo(mapa);

const capasBase = {
    "🗺️ Callejero": mapaCallejero,
    "🛰️ Satelital": mapaSatelital
};

L.control.layers(capasBase).addTo(mapa);


// ==========================================
// 3. CARGAR Y RENDERIZAR EL GEOJSON
// ==========================================
fetch('data/proyectos.geojson')
    .then(respuesta => respuesta.json())
    .then(datosGeoJSON => {

        // Crear la capa GeoJSON en Leaflet
        const capaProyectos = L.geoJSON(datosGeoJSON, {

            // onEachFeature se ejecuta por CADA entidad (punto, línea o polígono)
            onEachFeature: function (feature, layer) {

                // 1. Extraer los atributos de la entidad
                const props = feature.properties;

                // 2. Armar la plantilla HTML para el Popup
                const contenidoPopup = `
          <div style="font-family: sans-serif; min-width: 180px;">
            <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 1.05rem;">
              ${props.nombre_proyecto || props.nombre || 'Proyecto SIG'}
            </h3>
            <p style="margin: 0 0 10px 0; font-size: 0.85rem; color: #475569; line-height: 1.3;">
              ${props.descripcion || 'Este proyecto es una muestra no refleja la realidad del mismo.'}
            </p>
            
            
            ${props.imagen_des ? `
              <!-- 🖼️ VISTA PREVIA DE LA IMAGEN -->
              <div style="margin-bottom: 8px;">
                <img src="downloads/${props.imagen_des}" 
                     alt="Vista previa de ${props.nombre_proyecto || 'proyecto'}" 
                     style="width: 100%; height: auto; max-height: 150px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1; display: block;" 
                     onerror="this.style.display='none';"> 
              </div>

              <!-- 📥 BOTÓN DE DESCARGA -->
              <a href="downloads/${props.imagen_des}" 
                 download="${props.imagen_des}" 
                 style="display: block; text-align: center; padding: 7px 12px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
                 📥 Descargar Imagen
              </a>
            ` : ''}
          </div>
        `;

                // 3. Vincular el Popup a la capa
                layer.bindPopup(contenidoPopup);
            }
        }).addTo(mapa);

        // 4. TRUCO GIS: Encuadrar el mapa automáticamente al tamaño de tus datos
        if (capaProyectos.getBounds().isValid()) {
            mapa.fitBounds(capaProyectos.getBounds());
        }

    })
    .catch(error => {
        console.error('Error al cargar el archivo GeoJSON:', error);
    });