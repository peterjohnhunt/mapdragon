<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       http://www.peterjohnhunt.com
 * @since      1.0.0
 *
 * @package    mapdragon
 * @subpackage mapdragon/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * @package    mapdragon
 * @subpackage mapdragon/public
 * @author     PeterJohn Hunt <info@peterjohnhunt.com>
 */
class mapdragon_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/mapdragon-public.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		wp_enqueue_script( 'google-maps', 'https://maps.googleapis.com/maps/api/js?', '', '', true );
		// wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/min/mapdragon-public-min.js', array( 'jquery' ), $this->version, true );
		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/mapdragon-public.js', array( 'jquery' ), $this->version, true );
		wp_localize_script( $this->plugin_name, 'mapdragon_ajax_vars', array('url' => admin_url( 'admin-ajax.php' ),'nonce' => wp_create_nonce( 'ajax-nonce' ),'assets' => plugin_dir_url( __FILE__ ).'/assets/','theme' => get_template_directory_uri().'/'));

	}

	public function get_nearby_posts($lat, $lng, $radius) {
		global $wpdb;

		$r = $wpdb->get_results($wpdb->prepare("
			SELECT p.ID, pm1.lat, pm2.lng, ( 3959 * acos( cos( radians('%s') ) * cos( radians( pm1.lat ) ) * cos( radians( pm2.lng ) - radians('%s') ) + sin( radians('%s') ) * sin( radians( pm1.lat ) ) ) ) AS distance FROM {$wpdb->posts} p
			LEFT JOIN (SELECT tpm1.post_id AS ID, tpm1.meta_value AS lat FROM {$wpdb->postmeta} tpm1 WHERE tpm1.meta_key = 'lat') pm1 ON p.ID = pm1.ID
			LEFT JOIN (SELECT tpm2.post_id AS ID, tpm2.meta_value AS lng FROM {$wpdb->postmeta} tpm2 WHERE tpm2.meta_key = 'lng') pm2 ON p.ID = pm2.ID
		    WHERE p.post_type = 'retailer'
			AND p.post_status = 'publish'
			HAVING distance < '%s' ORDER BY distance
		", $lat, $lng, $lat, $radius ));

	    return $r;
	}

	public function mapdragon() {
		$nonce = $_POST['nonce'];
	    if ( ! wp_verify_nonce( $nonce, 'ajax-nonce' ) ){
	        die ( 'Nope!' );
	    }

		$html = '';
		$postIDs = array();

		$name = ((isset($_REQUEST['name']) && $_REQUEST['name']) ? '_'.$_REQUEST['name'] : '');

		$formValues = array();
		parse_str($_POST['values'], $formValues);

		$posts = $this->get_nearby_posts($_REQUEST['lat'], $_REQUEST['lng'], $_REQUEST['distance']);

		if ($posts) {
			$postIDs = array_map(function($post){ return $post->ID; }, $posts);

			global $post;
			ob_start();
			foreach ($postIDs as $ID) {
				$post = get_post($ID);
				setup_postdata( $post );
				get_template_part('layouts/retailer/loop');
			}
			$html = ob_get_clean();
			wp_reset_postdata();
		}


	    wp_send_json_success( array('html' => $html, 'posts' => $postIDs) );

	    exit;
	}

}
