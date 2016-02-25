(function($) {
	'use strict';

	var $form 		= $('.mapdragon-form'),
		$address	= $('#location'),
		$mapHolder	= $('.mapdragon-map'),
		$postHolder = $('.mapdragon-view'),
		$loading	= null,
		ajaxRunning = 0;

	var customMarkerURL  = false,
		markerImage      = {},
		markerImageLarge = {},
		markerImageMe	 = {
			url: mapdragon_ajax_vars.assets + 'map-me-icon-large.svg',
			scaledSize: new google.maps.Size(48, 48),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(24, 48)
		};


	var map, geocoder, markers, center, user, me;

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

		$mapHolder.prepend('<svg class="loading" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" xml:space="preserve"><circle fill="#231F20" cx="621.5" cy="173" r="3"></circle><circle fill="#231F20" cx="732" cy="278" r="3"></circle><circle fill="#231F20" cx="489.5" cy="311" r="3"></circle><circle fill="#231F20" cx="239.5" cy="242" r="3"></circle><circle fill="#231F20" cx="523.5" cy="176" r="3"></circle><circle fill="#231F20" cx="410.5" cy="222" r="3"></circle><circle fill="#231F20" cx="226.5" cy="96" r="3"></circle><circle fill="#231F20" cx="574.5" cy="142" r="3"></circle><circle fill="#231F20" cx="842.5" cy="123" r="3"></circle><g><g><path d="M834.438,118.85c-94.788-45.319-187.596,31.003-208.551,50.021"></path><path d="M630.333,171.211c88.1-14.847,99.856,76.227,101.426,100.798"></path><path d="M723.959,274.279c-34.232-15.046-168.93-66.05-231.363,31.651"></path><path d="M483.104,304.512c-21.925-20.671-100.371-82.522-237.598-63.396"></path><path d="M246.084,235.869c29.332-26.276,151.944-125.262,272.127-62.727"></path><path d="M514.668,174.599c-20.803-2.442-73.234-3.454-101.2,42.201"></path><path d="M406.138,214.116C388.312,183.134,317.87,72.48,232.288,94.326"></path><path d="M235.295,93.929c41.796-9.253,222.945-42.672,334.501,44.297"></path><path d="M582.315,137.287c127.795-74.905,230.9-29.823,254.9-17.244"></path></g></g><g><g><path d="M418.368,226.67c18.333,11.418,62.901,42.445,70.261,78.311"></path><path d="M493.579,303.089c10.742-21.555,38.502-82.305,31.304-121.294"></path><path d="M532.384,176.708c27.62,3.003,114.966,18.495,195.376,97.083"></path><path d="M728.73,269.589c-9.283-21.592-39.622-78.541-107.23-96.589c0,0-184.4-105.932-389.031-77.856"></path><path d="M232.125,102.971c12.516,17.284,39.329,65.678,9.849,133.57"></path><path d="M247.057,237.232C284.717,213.968,455.052,114.571,574.5,142c0,0,184.115-54.376,262.572-21.502"></path><path d="M833.594,122.449c-57.008-3.192-369.973-15.558-420.8,94.041"></path></g></g></svg>');

		$loading = $mapHolder.find('.loading');

		$mapHolder.trigger('mapdragon-initialized', [ map ]);

        google.maps.event.addDomListener(window, 'resize', function() {
		    centerMap();
		});

		customMarkerURL = $mapHolder.triggerHandler('set-image');
		if (customMarkerURL){
			markerImage = {
				url: mapdragon_ajax_vars.theme + customMarkerURL,
				scaledSize: new google.maps.Size(36, 36),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(18, 36)
			};
			markerImageLarge = {
				url: mapdragon_ajax_vars.theme + customMarkerURL,
				scaledSize: new google.maps.Size(46, 46),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(23, 46)
			};
		}
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

		$mapHolder.trigger('open', [$featured]);
	}

	function closeFeatured(){
		var $featured = $mapHolder.find('.featured');

		$featured.remove();

		if (customMarkerURL){
			$.each(markers, function(){
				this.setIcon(markerImage);
			});
		}

		centerMap(user);

		$mapHolder.trigger('close');

	}

	function clearMap(){

		closeFeatured();

		if( me ){
			me.setMap(null);
		}

		$.each(markers, function(){
			this.setMap(null);
		});
		markers = [];

		$postHolder.empty();

		map.setZoom(4);
		centerMap(new google.maps.LatLng(40, -95));

	}

	function addMarker($post){
		var marker = new google.maps.Marker({
			map: map,
			position: $post.data(),
		});

		if (customMarkerURL){
			marker.setIcon(markerImage);

			marker.addListener('click', function(){
				$.each(markers, function(){
					this.setIcon(markerImage);
				});
				marker.setIcon(markerImageLarge);
			});

			$post.click(function(){
				$.each(markers, function(){
					this.setIcon(markerImage);
				});
				marker.setIcon(markerImageLarge);
			});
		}

		marker.addListener('click', function(){
			selectFeatured($post);
		});

		$post.click(function(){
			selectFeatured($post);
		});

		markers.push(marker);
	}

	function getPosts(){
		var formValues = $form.serialize(),
			formValuesJSON = [];

		ajaxRunning++;

		$form.serializeArray().map(function(x){formValuesJSON[x.name] = x.value;});

		geocoder.geocode( { 'address': formValuesJSON.location}, function(results, status) {
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
					beforeSend: function( xhr ) {
						clearMap();
						me = new google.maps.Marker({
							map: map,
							position: user,
							icon: markerImageMe,
							zIndex: -1
						});
						me.addListener('click', function(){
							closeFeatured();
						});
						$loading.fadeIn();
					},
					success: function( result ) {

						var posts = [];

						$postHolder.append(result.data.html);

						$.each(result.data.posts, function(index, value){
							var $post = $('[data-id="'+value+'"]');

							posts.push($post);

							addMarker($post);
						});

						if( posts[0] ){
							$postHolder.trigger('mapdragon-posts-appended', [ posts ]);
						}

						$loading.fadeOut(function(){
							centerMap(user);
							map.setZoom(10);
							ajaxRunning--;
						});
					}
				});
			} else {
				ajaxRunning--;
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
			if( !ajaxRunning ){
				getPosts();
			}
		});
	}

})(jQuery);
