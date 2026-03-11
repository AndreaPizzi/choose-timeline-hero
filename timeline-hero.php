<?php
/**
 * Plugin Name:       Timeline Hero
 * Plugin URI:        https://yoursite.com/timeline-hero
 * Description:       Timeline hero con immagini/video sequenziali. Blocco Gutenberg nativo via ACF Pro.
 * Version:           2.0.0
 * Author:            Your Name
 * License:           GPL-2.0+
 * Text Domain:       timeline-hero
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'TIMELINE_HERO_VERSION', '2.0.0' );
define( 'TIMELINE_HERO_PATH',    plugin_dir_path( __FILE__ ) );
define( 'TIMELINE_HERO_URL',     plugin_dir_url( __FILE__ ) );

// ── Check ACF Pro ─────────────────────────────────────────────────────────────
add_action( 'admin_notices', function () {
    if ( ! class_exists( 'ACF' ) ) {
        echo '<div class="notice notice-error"><p><strong>Timeline Hero</strong> richiede <strong>Advanced Custom Fields PRO</strong> attivo.</p></div>';
    }
} );

// ── Load ──────────────────────────────────────────────────────────────────────
require_once TIMELINE_HERO_PATH . 'includes/acf-fields.php';
require_once TIMELINE_HERO_PATH . 'includes/block.php';
//require_once TIMELINE_HERO_PATH . 'includes/enqueue.php';
