<?php
/**
 * Template frontend della Timeline Hero.
 *
 * Variabili iniettate dal render callback (block.php):
 *   $uid            string  – ID univoco blocco
 *   $steps          array   – steps dal repeater ACF
 *   $height         string  – altezza CSS
 *   $config         string  – JSON { speed, autoplay }
 *   $block_classes  string  – classi Gutenberg (align, anchor, ecc.)
 */
?>

<section
    class="<?php echo esc_attr( $block_classes ); ?>"
    id="<?php echo esc_attr( $uid ); ?>"
    style="<?php echo $inline_style; ?>"
    data-config="<?php echo esc_attr( $config ); ?>"
    aria-label="Timeline Hero"
>

    <!-- ── Media Stack ────────────────────────────────────────────── -->
    <div class="th-media-stack" aria-hidden="true">
        <?php foreach ( $steps as $index => $step ) :
            $is_active  = $index === 0;
            $media_type = $step['step_media_type'] ?? 'image';
        ?>
        <div
            class="th-media-item<?php echo $is_active ? ' is-active' : ''; ?>"
            data-index="<?php echo esc_attr( $index ); ?>"
        >
            <?php if ( $media_type === 'video' ) :
                $src = ! empty( $step['step_video_url'] )
                    ? $step['step_video_url']
                    : ( $step['step_video_file']['url'] ?? '' );
                $poster_url   = ! empty( $step['step_video_poster'] ) ? $step['step_video_poster']['url'] : '';
            ?>
                <?php if ( $src ) : ?>
                <video
                    class="th-video"
                    src="<?php echo esc_url( $src ); ?>"
                    <?php if ( $poster_url ) : ?>poster="<?php echo esc_url( $poster_url ); ?>"<?php endif; ?>
                    playsinline muted loop
                    <?php echo $is_active ? 'autoplay' : ''; ?>
                    preload="<?php echo $is_active ? 'auto' : 'none'; ?>"
                ></video>
                <?php endif; ?>

            <?php else :
                $img = $step['step_image'] ?? null;
                if ( $img ) :
                    $srcset = wp_get_attachment_image_srcset( $img['ID'], 'full' );
            ?>
                <img
                    class="th-image"
                    src="<?php echo esc_url( $img['url'] ); ?>"
                    <?php if ( $srcset ) : ?>srcset="<?php echo esc_attr( $srcset ); ?>" sizes="100vw"<?php endif; ?>
                    alt="<?php echo esc_attr( $img['alt'] ?: ( $step['step_title'] ?? '' ) ); ?>"
                    <?php echo $is_active ? '' : 'loading="lazy"'; ?>
                    decoding="async"
                />
                <?php endif; ?>
            <?php endif; ?>

            <div class="th-overlay"></div>
        </div>
        <?php endforeach; ?>
    </div>

    <!-- ── Testi ──────────────────────────────────────────────────── -->
    <div class="th-content-wrap">
        <div class="th-labels">
            <?php foreach ( $steps as $index => $step ) : ?>
            <div
                class="th-label<?php echo $index === 0 ? ' is-active' : ''; ?>"
                data-index="<?php echo esc_attr( $index ); ?>"
                aria-hidden="<?php echo $index === 0 ? 'false' : 'true'; ?>"
            >
                <?php if ( ! empty( $step['step_title'] ) ) : ?>
                <h2 class="th-title"><?php echo wp_kses( $step['step_title'], [ 'strong' => [],'small' => [] ] ); ?></h2>
                <?php endif; ?>
                <?php if ( ! empty( $step['step_subtitle'] ) ) : ?>
                <p class="th-subtitle"><?php echo wp_kses( $step['step_subtitle'], [ 'strong' => [],'small' => [] ] ); ?></p>
                <?php endif; ?>
            </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- ── Controller ────────────────────────────────────────────── -->
    <div class="th-controller" role="group" aria-label="Navigazione timeline">

        <div class="th-steps-row" aria-hidden="true">
            <?php foreach ( $steps as $index => $step ) : ?>
            <button
                class="th-step-btn<?php echo $index === 0 ? ' is-active' : ''; ?>"
                data-index="<?php echo esc_attr( $index ); ?>"
                aria-label="Step <?php echo esc_attr( $index + 1 ); ?>: <?php echo esc_attr( $step['step_title'] ?? '' ); ?>"
                tabindex="-1"
            >
                <span class="th-step-dot"></span>
                <span class="th-step-label"><?php echo wp_kses( $step['step_title'], [  ] ); ?></span>
            </button>
            <?php endforeach; ?>
        </div>

        <div class="th-slider-wrap">
            <div class="th-track">
                <?php foreach ( $steps as $index => $step ) : ?>
                <div class="th-track-segment" data-index="<?php echo esc_attr( $index ); ?>">
                    <div class="th-track-segment__fill"></div>
                </div>
                <?php endforeach; ?>
            </div>
            <input
                type="range"
                class="th-slider"
                min="0"
                max="<?php echo count( $steps ) - 1; ?>"
                value="0"
                step="1"
                aria-label="Slider timeline"
                aria-valuemin="0"
                aria-valuemax="<?php echo count( $steps ) - 1; ?>"
                aria-valuenow="0"
            >
        </div>

    </div>

</section>
