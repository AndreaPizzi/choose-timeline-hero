<?php
/**
 * Registra il blocco Gutenberg "Timeline Hero" via ACF Pro.
 *
 * Il blocco appare nella categoria "Media" della libreria blocchi Gutenberg.
 * Nell'editor mostra un placeholder; il render avviene tramite il template PHP.
 *
 * Docs: https://www.advancedcustomfields.com/resources/acf_register_block_type/
 */

add_action( 'acf/init', 'timeline_hero_register_block' );

function timeline_hero_register_block() {

    if ( ! function_exists( 'acf_register_block_type' ) ) return;

    acf_register_block_type( [

        // ── Identità ──────────────────────────────────────────────────────
        'name'        => 'timeline-hero',
        'title'       => __( 'Timeline Hero', 'timeline-hero' ),
        'description' => __( 'Hero fullscreen con timeline di immagini/video e slider controller.', 'timeline-hero' ),
        'category'    => 'media',
        'icon'        => 'slides',          // dashicon WP
        'keywords'    => [ 'timeline', 'hero', 'slider', 'immagini', 'video' ],

        // ── Render ────────────────────────────────────────────────────────
        // 'render_callback' usato al posto di 'render_template'
        // così possiamo gestire la modalità editor vs frontend.
        'render_callback' => 'timeline_hero_render_block',

        // ── Comportamento editor ──────────────────────────────────────────
        // 'preview' → mostriamo solo il placeholder (scelta dell'utente)
        'mode'            => 'preview',     // il blocco parte in modalità preview
        'supports'        => [
            'align'           => [ 'full', 'wide' ],
            'anchor'          => true,
            'customClassName' => true,
            'jsx'             => false,
        ],

        // ── Asset frontend (caricati solo dove il blocco è presente) ──────
        // 'enqueue_style'  => TIMELINE_HERO_URL . 'assets/css/timeline-hero.css',
        // 'enqueue_script' => TIMELINE_HERO_URL . 'assets/js/timeline-hero.js',

        'enqueue_assets' => 'timeline_hero_enqueue_block_assets',

        // ── Asset editor (placeholder style) ─────────────────────────────
       // 'enqueue_assets' => 'timeline_hero_enqueue_editor_assets',

        // ── Esempio dati per l'anteprima nella libreria blocchi ───────────
        'example'         => [
            'attributes' => [
                'mode' => 'preview',
                'data' => [],
            ],
        ],

    ] );
    
    
}




/**
 * Render callback: chiamato sia dal frontend che dall'editor.
 *
 * @param array  $block      Dati del blocco (id, classes, align, ecc.)
 * @param string $content    Contenuto innerBlocks (non usato)
 * @param bool   $is_preview True quando siamo nell'editor Gutenberg
 */
function timeline_hero_render_block( $block, $content = '', $is_preview = false ) {

    // ── In editor → placeholder ────────────────────────────────────────
    if ( $is_preview ) {
        include TIMELINE_HERO_PATH . 'templates/block-placeholder.php';
        return;
    }

    // ── Frontend → leggi campi ACF e renderizza ───────────────────────
    $steps = get_field( 'timeline_hero_steps' );

    if ( empty( $steps ) ) {
        if ( current_user_can( 'edit_posts' ) ) {
            echo '<div class="timeline-hero-notice">⚠️ <em>Timeline Hero:</em> nessuno step configurato. Seleziona il blocco e aggiungi gli steps dal pannello laterale.</div>';
        }
        return;
    }

    // Opzioni aggiuntive del blocco
    $height   = get_field( 'timeline_hero_height' )   ?: '100vh';
    $speed    = get_field( 'timeline_hero_speed' )    ?: 800;
    $autoplay = get_field( 'timeline_hero_autoplay' ) ?: false;
    $transition = get_field( 'timeline_hero_transition' ) ?: 'crossfade';
    $text_position = get_field( 'timeline_hero_text_position' ) ?: 'left';
    $accent_color  = get_field( 'timeline_hero_accent_color' )  ?: '#e8c97a';
    $strong_color  = get_field( 'timeline_hero_strong_color' )  ?: '#ffffff';
    $ken_burns = get_field( 'timeline_hero_ken_burns' ) ?: false;

    $inline_style = implode( '; ', [
        '--th-height: '        . esc_attr( $height ),
        '--th-accent: '        . esc_attr( $accent_color ),
        '--th-strong-color: '  . esc_attr( $strong_color ),
        '--th-text-align: '    . esc_attr( $text_position ),
    ] );

    // Classi e ID Gutenberg (align, anchor, custom class)
    $block_id      = ! empty( $block['anchor'] ) ? $block['anchor'] : 'th-' . $block['id'];
    $block_classes = 'timeline-hero';
    if ( ! empty( $block['className'] ) )  $block_classes .= ' ' . $block['className'];
    if ( ! empty( $block['align'] ) )      $block_classes .= ' align' . $block['align'];

    $config = wp_json_encode( [
        'speed'    => (int) $speed,
        'autoplay' => (bool) $autoplay,
        'transition' => $transition,
        'kenBurns'   => (bool) $ken_burns,
    ] );

    // Variabili disponibili nel template
    $uid = $block_id;
    include TIMELINE_HERO_PATH . 'templates/timeline-hero.php';
}

/**
 * Carica stili aggiuntivi solo nell'editor (per il placeholder).
 */
// function timeline_hero_enqueue_editor_assets() {
//     wp_enqueue_style(
//         'timeline-hero-editor',
//         TIMELINE_HERO_URL . 'assets/css/timeline-hero-editor.css',
//         [],
//         TIMELINE_HERO_VERSION
//     );
// }

function timeline_hero_enqueue_block_assets() {
    // Assicura che GSAP sia caricato prima del nostro JS
    wp_enqueue_script(
        'gsap',
        'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
        [],
        '3.12.5',
        true
    );

    wp_enqueue_style(
        'timeline-hero',
        TIMELINE_HERO_URL . 'assets/css/timeline-hero.css',
        [],
        TIMELINE_HERO_VERSION
    );

    wp_enqueue_style(
        'timeline-hero-editor',
        TIMELINE_HERO_URL . 'assets/css/timeline-hero-editor.css',
        [],
        TIMELINE_HERO_VERSION
    );

    wp_enqueue_script(
        'timeline-hero',
        TIMELINE_HERO_URL . 'assets/js/timeline-hero.js',
        [ 'jquery', 'gsap' ],   // ← dipendenza esplicita
        TIMELINE_HERO_VERSION,
        true
    );
}