(function($) {
	'use strict';

	var $form 		= $('.mapdragon-form'),
		$address	= $('#location'),
		$mapHolder	= $('.mapdragon-map'),
		$postHolder = $('.mapdragon-view');

	var map, geocoder, markers, center, user;

	function initializeMap(){
        geocoder = new google.maps.Geocoder();
		markers = [];

		center = new google.maps.LatLng(40, -95);

        var mapOptions = {
			scrollwheel: false,
			center: center,
			zoom: 4,
			disableDefaultUI: true,
			zoomControl: true,
		};

		$mapHolder.append('<div id="mapdragon" class="map"></div>');

        map = new google.maps.Map($mapHolder.find('#mapdragon')[0], mapOptions);

		$mapHolder.trigger('mapdragon-initialized', [ map ]);

        google.maps.event.addDomListener(window, 'resize', function() {
		    centerMap();
		});
    }

	function centerMap(location){
		if( location ){
			center = location;
		}

		if( $mapHolder.find('.featured')[0] ){

			var diff = (map.getCenter().lng() - map.getBounds().getSouthWest().lng())/2;

			map.panTo({
				lat: center.lat,
				lng: center.lng + diff
			});

		} else {
			map.panTo(center);
		}
	}

	function selectFeatured($post){
		if( !$mapHolder.find('.selected')[0] ){
			$mapHolder.append('<div class="featured"><div class="close">X</div><div class="selected"></div></div>');
		}

		var $featured = $mapHolder.find('.featured'),
			$selected = $featured.find('.selected');

		$selected.empty();
		$selected.append($post.html());

		centerMap($post.data());

		var $close = $featured.find('.close');

		$close.click(function(){
			closeFeatured();
		});
	}

	function closeFeatured(){
		var $featured = $mapHolder.find('.featured');

		$featured.remove();

		centerMap(user);

	}

	function getPosts(){
		var formValues = $form.serialize(),
			formValuesJSON = [];

		$form.serializeArray().map(function(x){formValuesJSON[x.name] = x.value;});

		geocoder.geocode( { 'address': formValuesJSON.location}, function(results, status) {
			console.log( status );
			if (status == google.maps.GeocoderStatus.OK) {

				user = {
					lat: results[0].geometry.location.lat(),
					lng: results[0].geometry.location.lng(),
				};

				$.ajax({
					type: 'POST',
					url: mapdragon_ajax_vars.url,
					data: {
						action: 'mapdragon',
						nonce: mapdragon_ajax_vars.nonce,
						values: formValues,
						lat: user.lat,
						lng: user.lng,
						distance: formValuesJSON.distance
					},
					dataType: 'json',
					success: function( result ) {
						$.each(markers, function(){
							this.setMap(null);
						});

						var marker = new google.maps.Marker({
							map: map,
							position: user,
							animation: google.maps.Animation.DROP,
							icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
						});

						marker.addListener('click', function(){
							closeFeatured();
						});

						markers.push(marker);

						centerMap(user);
						map.setZoom(10);
						$postHolder.empty();

						$postHolder.append(result.data.html);
						$postHolder.children().each(function(index){
							var $post = $(this);

							var marker = new google.maps.Marker({
								map: map,
								position: $post.data(),
								animation: google.maps.Animation.DROP
							});

							marker.addListener('click', function(){
								selectFeatured($post);
							});

							$post.click(function(){
								selectFeatured($post);
							});

							markers.push(marker);
						});
					}
				});
			}
		});

	}

	if( $form[0] && $mapHolder[0] && $postHolder[0] ){
		$(window).on('load', function(){
			initializeMap();
			getPosts();
		});

		$form.submit(function(event){
			event.preventDefault();
			getPosts();
		});

		$form.find('select').change(function(event){
			getPosts();
		});
	}

})(jQuery);
