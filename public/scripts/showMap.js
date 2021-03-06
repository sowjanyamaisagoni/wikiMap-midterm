$(() => {
    const map = L.map("mapid").setView([mapLat, mapLng], 13);

    // Add tileLayer to our map
    // Get APIKEY at https://cloud.maptiler.com/account/keys/
    L.tileLayer(
      'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=lQcSFEMX5zyRGX2nNjuw ',
      {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
        crossOrigin: true
      }
    ).addTo(map);

    // Render pins on the map from db
    const addPinsFromDb = (obj) => {
      const pinOwner = obj.user_id;
      const logUser = obj.logUser;
      const mapOwner = obj.map_owner;

      if (pinOwner === logUser || mapOwner === logUser) {
        const marker = L.marker([obj.latitude, obj.longitude]).addTo(map)
        .bindPopup(`
        <form method='POST' action="/pins/${obj.id}">
        <label for="title">Place:</label><br>
        <input id="title" name="title" class="form-control form-control-sm" type="text" value="${obj.title}"><br>
        <label for="description">Description:</label><br>
        <input name="description" id="description" class="form-control form-control-sm" type="text" value="${obj.description}"><br>
        <input name="map_id" type="hidden" value='${obj.map_id}'>
        <img src="${obj.image_url}" alt="Pin image" class="img-thumbnail showImg">
        <div class="container">
          <div class="row justify-content-md-center">
            <div class="col">
              <button type="submit" class="btn btn-primary btn-sm">Update</button>
            </div>
        </form>
            <div class="col">
        <form method="POST" action='/pins/${obj.id}/delete'>
            <input name="map_id" type="hidden" value='${obj.map_id}'>
            <button type="submit" class="btn btn-danger btn-sm">Delete</button>
            </div>
        </form>
          </div>
        </div>
        `);
      } else {
        const marker = L.marker([obj.latitude, obj.longitude]).addTo(map)
        .bindPopup(`
        <p>Place: ${obj.title}</p>
        <p>Description: ${obj.description}</p>
        <img src="${obj.image_url}" alt="Pin image" class="img-thumbnail showImg">
        `);
      }

    };

    // AJAX
    const pageURL = $(location).attr("href");
    const splitPageURL = pageURL.split('/');
    const mapID = splitPageURL[splitPageURL.length - 1];

    $.get(`/pins/${mapID}`, function(result) {
      result.pins.forEach((pinObj) => addPinsFromDb(pinObj));
    });

    // Drop a new pin and submit a form > POST /pins
    function dropNewPin(e) {
      const newMarker = L.marker([e.latlng.lat, e.latlng.lng], {
        title: "appears on hover",
        draggable: true,
        riseOnHover: true,
      }).addTo(map);

      // Send POST to pins.js
      newMarker
        .bindPopup(
          `
          <form method='POST' action="/maps/${mapID}/pins">
            <label for="title">Place:</label><br>
            <input id="title" name="title" class="form-control form-control-sm" type="text" placeholder="Title"><br>
            <label for="description">Description:</label><br>
            <input name="description" id="description" class="form-control form-control-sm" type="text" placeholder="Description"><br>
            <label for="image_url">Image:</label><br>
            <input name="image_url" id="image_url" class="form-control form-control-sm" type="text" placeholder="Image URL"><br>
            <button type="submit" class="btn btn-primary btn-sm">Create new pin!</button>
            <input name="latitude" type="hidden" value='${e.latlng.lat}'>
            <input name="longitude" type="hidden" value='${e.latlng.lng}'>
          </form>
          <hr>
          <form>
            <button type="submit" class="btn btn-primary btn-sm">Cancel</button>
          </form>
          `
        )
        .openPopup();
    }

    map.on("click", dropNewPin);
  });
