!function($){"use strict";function n(){r=new google.maps.Geocoder,g=[],p=new google.maps.LatLng(40,-95);var n={scrollwheel:!1,center:p,zoom:4};c.append('<div id="mapdragon" class="map"></div>'),s=new google.maps.Map(c.find("#mapdragon")[0],n),c.trigger("mapdragon-initialized",[s]),google.maps.event.addDomListener(window,"resize",function(){a()})}function a(n){if(n&&(p=n),c.find(".featured")[0]){var a=(s.getCenter().lng()-s.getBounds().getSouthWest().lng())/2;s.panTo({lat:p.lat,lng:p.lng+a})}else s.panTo(p)}function e(n){c.find(".selected")[0]||c.append('<div class="featured"><div class="close">X</div><div class="selected"></div></div>');var e=c.find(".featured"),t=e.find(".selected");t.empty(),t.append(n.html()),a(n.data());var i=e.find(".close");i.click(function(){o()})}function o(){var n=c.find(".featured");n.remove(),a(m)}function t(){var n=i.serialize(),t=[];i.serializeArray().map(function(n){t[n.name]=n.value}),r.geocode({address:t.location},function(i,l){console.log(l),l==google.maps.GeocoderStatus.OK&&(m={lat:i[0].geometry.location.lat(),lng:i[0].geometry.location.lng()},$.ajax({type:"POST",url:mapdragon_ajax_vars.url,data:{action:"mapdragon",nonce:mapdragon_ajax_vars.nonce,values:n,lat:m.lat,lng:m.lng,distance:t.distance},dataType:"json",success:function(n){$.each(g,function(){this.setMap(null)});var t=new google.maps.Marker({map:s,position:m,animation:google.maps.Animation.DROP,icon:"http://maps.google.com/mapfiles/ms/icons/blue-dot.png"});t.addListener("click",function(){o()}),g.push(t),a(m),s.setZoom(10),d.empty(),d.append(n.data.html),d.children().each(function(n){var a=$(this),o=new google.maps.Marker({map:s,position:a.data(),animation:google.maps.Animation.DROP});o.addListener("click",function(){e(a)}),a.click(function(){e(a)}),g.push(o)})}}))})}var i=$(".mapdragon-form"),l=$("#location"),c=$(".mapdragon-map"),d=$(".mapdragon-view"),s,r,g,p,m;i[0]&&c[0]&&d[0]&&($(window).on("load",function(){n(),t()}),i.submit(function(n){n.preventDefault(),t()}),i.find("select").change(function(n){t()}))}(jQuery);