<?php
/**
 * Registra i campi ACF associati al blocco "Timeline Hero".
 *
 * La location rule  acf-block == timeline-hero  fa sì che i campi
 * appaiano nel pannello laterale di Gutenberg solo quando il blocco
 * è selezionato — non inquinano altri post/pagine.
 *
 * Struttura:
 *  ── Impostazioni blocco
 *      timeline_hero_height    text
 *      timeline_hero_speed     number
 *      timeline_hero_autoplay  true_false
 *      timeline_hero_transition  radio
 *  ── Repeater steps
 *      timeline_hero_steps  (repeater)
 *        ├── step_title        text
 *        ├── step_subtitle     text
 *        ├── step_media_type   radio  (image | video)
 *        ├── step_image        image
 *        ├── step_video_file   file
 *        └── step_video_url    url
 */

add_action( 'acf/init', 'timeline_hero_register_fields' );

function timeline_hero_register_fields() {

    if ( ! function_exists( 'acf_add_local_field_group' ) ) return;

    acf_add_local_field_group( [
        'key'   => 'group_timeline_hero_block',
        'title' => 'Timeline Hero – Impostazioni',

        // ── Campi ─────────────────────────────────────────────────────────
        'fields' => [

            // ┌─ Tab: Impostazioni generali ─────────────────────────────┐
            [
                'key'   => 'field_th_tab_settings',
                'label' => 'Impostazioni',
                'type'  => 'tab',
                'placement' => 'left',
            ],

            [
                'key'         => 'field_th_height',
                'label'       => 'Altezza',
                'name'        => 'timeline_hero_height',
                'type'        => 'text',
                'default_value' => '100vh',
                'placeholder' => 'es. 100vh  oppure  600px',
                'instructions' => 'Valore CSS valido: vh, px, rem, ecc.',
                'wrapper'     => [ 'width' => '50' ],
            ],

            [
                'key'          => 'field_th_speed',
                'label'        => 'Velocità transizione (ms)',
                'name'         => 'timeline_hero_speed',
                'type'         => 'number',
                'default_value' => 800,
                'min'          => 200,
                'max'          => 3000,
                'step'         => 100,
                'wrapper'      => [ 'width' => '25' ],
            ],

            [
                'key'          => 'field_th_autoplay',
                'label'        => 'Autoplay',
                'name'         => 'timeline_hero_autoplay',
                'type'         => 'true_false',
                'ui'           => 1,
                'default_value' => 0,
                'wrapper'      => [ 'width' => '25' ],
            ],

            [
                'key'           => 'field_th_transition',
                'label'         => 'Tipo di transizione',
                'name'          => 'timeline_hero_transition',
                'type'          => 'radio',
                'choices'       => [
                    'crossfade' => 'Crossfade',
                    'slide'     => 'Slide orizzontale',
                ],
                'default_value' => 'crossfade',
                'layout'        => 'horizontal',
                'wrapper'       => [ 'width' => '100' ],
            ],
            [
                'key'           => 'field_th_ken_burns',
                'label'         => 'Ken Burns effect',
                'name'          => 'timeline_hero_ken_burns',
                'type'          => 'true_false',
                'ui'            => 1,
                'default_value' => 0,
                'instructions'  => 'Zoom lento sull\'immagine/video attivo.',
                'wrapper'       => [ 'width' => '50' ],
            ],
            [
                'key'     => 'field_th_text_position',
                'label'   => 'Posizione testo',
                'name'    => 'timeline_hero_text_position',
                'type'    => 'radio',
                'choices' => [
                    'left'   => 'Sinistra',
                    'center' => 'Centro',
                    'right'  => 'Destra',
                ],
                'default_value' => 'left',
                'layout'        => 'horizontal',
                'wrapper'       => [ 'width' => '50' ],
            ],

            [
                'key'          => 'field_th_accent_color',
                'label'        => 'Colore accent',
                'name'         => 'timeline_hero_accent_color',
                'type'         => 'color_picker',
                'default_value' => '#e8c97a',
                'wrapper'      => [ 'width' => '25' ],
            ],

            [
                'key'          => 'field_th_strong_color',
                'label'        => 'Colore <strong>',
                'name'         => 'timeline_hero_strong_color',
                'type'         => 'color_picker',
                'default_value' => '#ffffff',
                'wrapper'      => [ 'width' => '25' ],
            ],

            // ┌─ Tab: Steps ─────────────────────────────────────────────┐
            [
                'key'       => 'field_th_tab_steps',
                'label'     => 'Steps',
                'type'      => 'tab',
                'placement' => 'left',
            ],

            // ── Repeater ──────────────────────────────────────────────
            [
                'key'          => 'field_timeline_steps',
                'label'        => 'Steps della Timeline',
                'name'         => 'timeline_hero_steps',
                'type'         => 'repeater',
                'layout'       => 'block',
                'button_label' => '+ Aggiungi Step',
                'min'          => 1,
                'sub_fields'   => [

                    [
                        'key'         => 'field_step_title',
                        'label'       => 'Titolo (es. data)',
                        'name'        => 'step_title',
                        'type'        => 'textarea',
                        'required'    => 1,
                        'placeholder' => 'es. 2024',
                        'wrapper'     => [ 'width' => '50' ],
                    ],

                    [
                        'key'         => 'field_step_subtitle',
                        'label'       => 'Sottotitolo',
                        'name'        => 'step_subtitle',
                        'type'        => 'textarea',
                        'placeholder' => 'es. Inaugurazione',
                        'wrapper'     => [ 'width' => '50' ],
                    ],

                    [
                        'key'     => 'field_step_media_type',
                        'label'   => 'Tipo di media',
                        'name'    => 'step_media_type',
                        'type'    => 'radio',
                        'choices' => [
                            'image' => 'Immagine',
                            'video' => 'Video',
                        ],
                        'default_value' => 'image',
                        'layout'        => 'horizontal',
                    ],

                    [
                        'key'               => 'field_step_image',
                        'label'             => 'Immagine',
                        'name'              => 'step_image',
                        'type'              => 'image',
                        'return_format'     => 'array',
                        'preview_size'      => 'medium',
                        'conditional_logic' => [[
                            [ 'field' => 'field_step_media_type', 'operator' => '==', 'value' => 'image' ],
                        ]],
                    ],

                    [
                        'key'               => 'field_step_video_file',
                        'label'             => 'Video – File (mp4/webm)',
                        'name'              => 'step_video_file',
                        'type'              => 'file',
                        'return_format'     => 'array',
                        'mime_types'        => 'mp4,webm,ogg',
                        'conditional_logic' => [[
                            [ 'field' => 'field_step_media_type', 'operator' => '==', 'value' => 'video' ],
                        ]],
                        'wrapper' => [ 'width' => '50' ],
                    ],

                    [
                        'key'               => 'field_step_video_url',
                        'label'             => 'Video – URL esterno',
                        'name'              => 'step_video_url',
                        'type'              => 'url',
                        'instructions'      => 'Se compilato ha priorità sul file caricato.',
                        'conditional_logic' => [[
                            [ 'field' => 'field_step_media_type', 'operator' => '==', 'value' => 'video' ],
                        ]],
                        'wrapper' => [ 'width' => '50' ],
                    ],

                    [
                        'key'               => 'field_step_video_poster',
                        'label'             => 'Video – Copertina (poster)',
                        'name'              => 'step_video_poster',
                        'type'              => 'image',
                        'return_format'     => 'array',
                        'preview_size'      => 'medium',
                        'instructions'      => 'Immagine mostrata prima che il video parta. Evita il flash nero durante la transizione.',
                        'conditional_logic' => [[
                            [ 'field' => 'field_step_media_type', 'operator' => '==', 'value' => 'video' ],
                        ]],
                        'wrapper' => [ 'width' => '50' ],
                    ],

                ],
            ],
            // ── / Repeater ────────────────────────────────────────────

        ],

        // ── Location: solo quando il blocco è selezionato ─────────────────
        'location' => [
            [
                [
                    'param'    => 'block',
                    'operator' => '==',
                    'value'    => 'acf/timeline-hero',
                ],
            ],
        ],

        'menu_order'            => 0,
        'position'              => 'side',      // pannello laterale Gutenberg
        'style'                 => 'seamless',  // si integra meglio con Gutenberg
        'label_placement'       => 'top',
        'instruction_placement' => 'label',
        'active'                => true,
    ] );
}
