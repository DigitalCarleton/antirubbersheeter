/* global L */
$( document ).ready(() => {

  $("#uploadform").submit((e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("file", $("#file").get(0).files[0]);
    $.ajax({
      url: "/upload",
      type: "POST",
      data: data,
      processData: false,
      contentType: false,
      success: function(d){
        d = JSON.parse(d);
        if(d.error){
          $("#result").removeClass("invisible").addClass("visible").addClass("alert-danger");
          $("#result > p").html(d.error + " Reload and try again.");
        } else {
          $("#result").removeClass("invisible").addClass("visible").addClass("alert-success");
          $("#result > p").html("Upload succeeded. Now geocode →");
          $("#uploadbtn").attr("disabled", true);
          $("#geocodebtn").attr("disabled", false);
          // This is a goofy way to do this… but it works?
          $("#filename").attr("value", d.filename);
          $("#imgururl").attr("value", d.imgururl);
          $("#width").attr("value", d.width);
          $("#height").attr("value", d.height);
          return d;
        }
      }
    });
  });

  if($("#data").length > 0){
    let data = {};
    let counter = -1;
    Object.keys($("#data").data()).forEach((k) => {
      data[k] = $("#data").data(k);
    });
    var map = L.map("map", {
      crs: L.CRS.Simple,
      minZoom: -5
    });
    // const bounds = [[0,0], [data.height, data.height]];
    const bounds = [[0,0], [2598,2126]];
    L.imageOverlay(data.imgururl, bounds).addTo(map);
    map.fitBounds(bounds);
    const marker = L.marker([0,0]).setOpacity(0).addTo(map);
    data.places = data.placesstring.split(",").map((i) => {
      return { name: i.trim() };
    });
    $(".card-text").text("Click below to start placing the list of " + data.places.length + " places on the map.");
    $("#geocodingbtn").click(function(){
      marker.setOpacity(0);
      if(counter === data.places.length - 1){
        $("#carddiv").html("<p class='card-text'><strong>All done!</strong></p>");
        $(".card-title").text("Geocoder");
        $("#geocodingbtn").text("Show data");
        // Fill the modal and show it.
      } else {
        if(counter >= 0){
          data.places[counter].y = $("#y").text();
          data.places[counter].x = $("#x").text();
        }
        $("#carddiv").html("<div class='row'><div class='col-6'><em>y</em>: <span id='y'></span></div><div class='col-6'><em>x</em>: <span id='x'></span></div></div>");
        $(".card-title").text("Geocoding " + (counter + 2) + " of " + data.places.length + " places");
        $("#geocodingbtn").text("Save " + data.places[counter + 1].name);
        $("#map").css("cursor", "crosshair");
        map.on("click", (e) => {
          marker.setLatLng(e.latlng).setOpacity(0.9);
          $("#y").text(e.latlng.lat);
          $("#x").text(e.latlng.lng);
        });
        counter = counter + 1;
      }
    });
  }

});

