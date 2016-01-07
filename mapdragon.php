<?php

/**
 * @link              http://www.peterjohnhunt.com
 * @since             1.0.0
 * @package           mapdragon
 *
 * @wordpress-plugin
 * Plugin Name:       MapDragon
 * Plugin URI:        https://github.com/peterjohnhunt/mapdragon
 * Description:       Developer input suggestions plugin for easy customizable autofilling
 * Version:           1.0.0
 * Author:            PeterJohn Hunt
 * Author URI:        http://www.peterjohnhunt.com
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       mapdragon
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-mapdragon-activator.php
 */
function activate_mapdragon() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-mapdragon-activator.php';
	mapdragon_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-mapdragon-deactivator.php
 */
function deactivate_mapdragon() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-mapdragon-deactivator.php';
	mapdragon_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_mapdragon' );
register_deactivation_hook( __FILE__, 'deactivate_mapdragon' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-mapdragon.php';

/**
 * Begins execution of the plugin.
 *
 * @since    1.0.0
 */
function run_mapdragon() {

	$plugin = new mapdragon();
	$plugin->run();

}
run_mapdragon();
