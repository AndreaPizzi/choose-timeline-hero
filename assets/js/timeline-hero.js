/**
 * Timeline Hero – JS  v2.4
 * Deps: jQuery, GSAP 3
 */

(function ($) {
  'use strict';

  const SEL_ROOT       = '.timeline-hero';
  const SEL_MEDIA_ITEM = '.th-media-item';
  const SEL_LABEL      = '.th-label';
  const SEL_SLIDER     = '.th-slider';
  const SEL_STEP_BTN   = '.th-step-btn';

  function init ($root) {

    const config     = JSON.parse( $root.attr('data-config') || '{}' );
    const duration   = ( parseInt(config.speed, 10) || 800 ) / 1000;
    const doAuto     = config.autoplay === true;
    const transition = config.transition || 'crossfade';
    const kenBurns   = config.kenBurns === true;

    const $slider   = $root.find(SEL_SLIDER);
    const $items    = $root.find(SEL_MEDIA_ITEM);
    const $labels   = $root.find(SEL_LABEL);
    const $stepBtns = $root.find(SEL_STEP_BTN);
    const $segments = $root.find('.th-track-segment');

    const autoDelay = 4500;
    const total     = $items.length;

    let current    = 0;
    let animating  = false;
    let autoTimer  = null;
    let progressTw = null;

    if ( total === 0 ) return;

    // ── Stato GSAP iniziale ───────────────────────────────────
    gsap.set( $items.not('.is-active'), { opacity: 0, scale: 1.06 } );
    gsap.set( $items.filter('.is-active'), { opacity: 1, scale: 1 } );

    // ── Progress bar ──────────────────────────────────────────
    // Riempie la barra di uno step (usata al load e durante la pausa)
    function fillSegment ( index, duration_ms, ease ) {
      if ( progressTw ) { progressTw.kill(); progressTw = null; }

      $segments.removeClass('is-past');
      $segments.find('.th-track-segment__fill').each(function (i) {
        gsap.set( this, {
          width: '100%',
          scaleX: i < index ? 1 : 0,
          transformOrigin: 'left center'
        });
      });

      const fill = $segments.eq(index).find('.th-track-segment__fill')[0];
      if ( !fill ) return;

      gsap.set( fill, { width: '100%', scaleX: 0, transformOrigin: 'left center' } );

      progressTw = gsap.to( fill, {
        scaleX:   1,
        duration: duration_ms / 1000,
        ease:     ease || 'none',
      });
    }

    // Durante la transizione: svuota A e riempie B in parallelo
    function transitionSegments ( fromIndex, toIndex, duration_ms ) {
      if ( progressTw ) { progressTw.kill(); progressTw = null; }

      // Resetta tutti
      $segments.removeClass('is-past');
      $segments.find('.th-track-segment__fill').each(function (i) {
        gsap.set( this, { width: i < toIndex ? '100%' : '0%' } );
      });

      

      // A si svuota
      const fillOut = $segments.eq(fromIndex).find('.th-track-segment__fill')[0];
      // B si riempie
      const fillIn  = $segments.eq(toIndex).find('.th-track-segment__fill')[0];

      if ( !fillOut || !fillIn ) return;

      const tl = gsap.timeline({
        onComplete () { progressTw = null; }
      });

      gsap.set( fillOut, { transformOrigin: 'right center' } );
      tl.to( fillOut, {
        scaleX:   0,
        duration: duration_ms / 1000,
        ease:     'sine.inOut',
      }, 0 );

      gsap.set( fillIn, { scaleX: 0, transformOrigin: 'left center', width: '100%' } );
      tl.to( fillIn, {
        scaleX:   1,
        duration: duration_ms / 1000,
        ease:     'sine.inOut',
      }, 0 );

      progressTw = tl;
    }

    // ── updateUI ──────────────────────────────────────────────
    function updateUI () {
      animateThumb( current );
      $slider.val(current).attr('aria-valuenow', current);
      $stepBtns.removeClass('is-active').attr('tabindex', '-1');
      $stepBtns.eq(current).addClass('is-active').attr('tabindex', '0');
    }

    // ── goTo ──────────────────────────────────────────────────
    function goTo (index, onDone) {
      if ( index === current ) { if (onDone) onDone(); return; }

      // Interrompi animazione in corso
      if ( animating ) {
        gsap.killTweensOf( $items.toArray() );
        gsap.killTweensOf( $labels.find('.th-title, .th-subtitle').toArray() );
        $items.each(function (i) {
          gsap.set( this, { opacity: i === current ? 1 : 0, scale: 1, x: 0 } );
        });
        $labels.removeClass('is-active').attr('aria-hidden', 'true');
        $labels.eq(current).addClass('is-active').attr('aria-hidden', 'false');
        gsap.set( $labels.find('.th-title, .th-subtitle'), { autoAlpha: 1, y: 0, skewY: 0, filter: 'blur(0px)' } );
        animating = false;
      }

      animating = true;

      const prevIndex = current;
      current = index;            // aggiorna current subito

      const $outItem  = $items.eq(prevIndex);
      const $inItem   = $items.eq(index);
      const $outLabel = $labels.eq(prevIndex);
      const $inLabel  = $labels.eq(index);
      const dir       = index > prevIndex ? 1 : -1;

      // ── Media ────────────────────────────────────────────
      const tl = gsap.timeline({
        onComplete () {
          animating = false;
          $outItem.removeClass('is-active');
          $inItem.addClass('is-active');
          handleVideo( $outItem, false );
          handleVideo( $inItem, true );
          handleKenBurns( $outItem, false );
          handleKenBurns( $inItem, true );
          updateUI();               // ← aggiorna slider/dot solo a transizione finita
          if ( onDone ) onDone();   // ← segnala completamento
        }
      });

      if ( transition === 'slide' ) {
        const slideAmt = $root.outerWidth();
        gsap.set( $inItem, { x: dir * slideAmt, opacity: 1, scale: 1 } );
        tl.to( $outItem[0], { x: -dir * slideAmt, duration, ease: 'power3.inOut' }, 0 );
        tl.to( $inItem[0],  { x: 0,               duration, ease: 'power3.inOut' }, 0 );
      } else {
        gsap.set( $inItem, { opacity: 0, scale: 1.06, x: 0 } );
        tl.to( $outItem[0], { opacity: 0, scale: 0.97, duration: duration * .55, ease: 'power2.in' }, 0 );
        tl.to( $inItem[0],  { opacity: 1, scale: 1,    duration,                 ease: 'power3.out' }, duration * .2 );
      }

      // ── Testo uscente ────────────────────────────────────
      const $outTitle    = $outLabel.find('.th-title');
      const $outSubtitle = $outLabel.find('.th-subtitle');
      const outFirst     = dir === 1 ? $outTitle[0] : $outSubtitle[0];
      const outSecond    = dir === 1 ? $outSubtitle[0] : $outTitle[0];

      gsap.timeline({
        onComplete () {
          $outLabel.removeClass('is-active').attr('aria-hidden', 'true');
          gsap.set( [$outTitle[0], $outSubtitle[0]], { y: 0, skewY: 0, filter: 'blur(0px)' } );
        }
      })
      .to( outFirst,  { autoAlpha: 0, y: dir * -8, skewY: dir * -1.5, filter: 'blur(2px)', duration: duration * .28, ease: 'sine.inOut' })
      .to( outSecond, { autoAlpha: 0, y: dir * -8, skewY: dir * -1.5, filter: 'blur(2px)', duration: duration * .30, ease: 'sine.inOut' }, `-=${duration * .12}` );

      // ── Testo entrante ───────────────────────────────────
      const $inTitle    = $inLabel.find('.th-title');
      const $inSubtitle = $inLabel.find('.th-subtitle');
      const inFirst     = dir === 1 ? $inTitle[0] : $inSubtitle[0];
      const inSecond    = dir === 1 ? $inSubtitle[0] : $inTitle[0];

      gsap.set( [inFirst, inSecond], { autoAlpha: 0, y: dir * 22, skewY: dir * 2, filter: 'blur(5px)' });

      gsap.timeline({
        delay: duration * .20,
        onStart () {
          $inLabel.addClass('is-active').attr('aria-hidden', 'false');
        }
      })
      .to( inFirst,  { autoAlpha: 1, y: 0, skewY: 0, filter: 'blur(0px)', duration: duration * .7, ease: 'sine.out' })
      .to( inSecond, { autoAlpha: 1, y: 0, skewY: 0, filter: 'blur(0px)', duration: duration * .7, ease: 'sine.out' }, `-=${duration * .35}` );
    }

    // ── Ken Burns ─────────────────────────────────────────────
    function handleKenBurns ($item, play) {
      if ( !kenBurns ) return;
      const target = $item.find('.th-image, .th-video')[0];
      if ( !target ) return;
      if ( play ) {
        const scale  = Math.random() > 0.5 ? 1.08 : 1.12;
        const xDrift = ( Math.random() - 0.5 ) * 4;
        const yDrift = ( Math.random() - 0.5 ) * 4;
        gsap.fromTo( target,
          { scale: 1, xPercent: 0, yPercent: 0 },
          { scale, xPercent: xDrift, yPercent: yDrift, duration: 8, ease: 'none' }
        );
      } else {
        gsap.killTweensOf( target );
        gsap.set( target, { scale: 1, xPercent: 0, yPercent: 0 } );
      }
    }

    // ── Video ─────────────────────────────────────────────────
    function handleVideo ($item, play) {
      const vid = $item.find('video')[0];
      if ( !vid ) return;
      if ( play ) { vid.currentTime = 0; vid.play().catch(() => {}); }
      else        { vid.pause(); }
    }

    // ── Autoplay ──────────────────────────────────────────────
    function stopAuto () {
      clearTimeout( autoTimer );
      autoTimer = null;
    }

    function scheduleNext () {
      if ( !doAuto || total <= 1 ) return;

      // Pausa — barra attiva ferma al 100%
      autoTimer = setTimeout( function () {
        const next = ( current + 1 ) % total;

        // Durante la transizione: A si svuota, B si riempie
        transitionSegments( current, next, duration * 1000 );

        goTo( next, function () {
          // Transizione finita — barra di B già piena, aspetta la pausa
          scheduleNext();
        });

      }, autoDelay );
    }

    function startAuto () {
      if ( !doAuto || total <= 1 ) return;
      stopAuto();
      // Al primo avvio riempie subito la barra dello step corrente
      fillSegment( current, 300, 'power2.out' );
      autoTimer = setTimeout( function () {
        const next = ( current + 1 ) % total;
        transitionSegments( current, next, duration * 1000 );
        goTo( next, function () {
          scheduleNext();
        });
      }, autoDelay );
    }

    // ── Navigazione manuale ───────────────────────────────────
    function manualGoTo (idx) {
      if ( idx === current ) return;
      stopAuto();
      // Durante il click: A si svuota, B si riempie velocemente
      transitionSegments( current, idx, duration * 1000 );
      goTo( idx, function () {
        if ( doAuto ) scheduleNext();
      });
    }
    // ── Animazione "cursore" ───────────────────────────────────
    function animateThumb ( toIndex ) {
      const pct = total > 1 ? ( toIndex / ( total - 1 ) ) * 100 : 100;
      gsap.to( $slider[0], {
        value: toIndex,   // non funziona direttamente su input range con GSAP
        duration: 0,
      });

      // Anima la posizione con un proxy numerico
      gsap.to( { val: parseFloat( $slider.val() ) }, {
        val:      toIndex,
        duration: duration * 0.6,
        ease:     'power2.inOut',
        onUpdate: function () {
          $slider.val( this.targets()[0].val );
        }
      });

      // Fade out → sposta → fade in del thumb via classe CSS
      $slider.addClass('th-slider--moving');
      setTimeout( () => $slider.removeClass('th-slider--moving'), duration * 600 );
    }

    // ── Events ───────────────────────────────────────────────
    $stepBtns.on('click', function () {
      manualGoTo( parseInt( $(this).data('index'), 10 ) );
    });

    $slider.on('input change', function () {
      manualGoTo( parseInt( $(this).val(), 10 ) );
    });

    $root.on('keydown', SEL_SLIDER, function (e) {
      if ( e.key === 'ArrowRight' && current < total - 1 ) { e.preventDefault(); manualGoTo( current + 1 ); }
      if ( e.key === 'ArrowLeft'  && current > 0 )         { e.preventDefault(); manualGoTo( current - 1 ); }
    });

    let tx = null;
    $root[0].addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
    $root[0].addEventListener('touchend', e => {
      if ( tx === null ) return;
      const dx = e.changedTouches[0].clientX - tx;
      if ( Math.abs(dx) > 50 ) {
        if ( dx < 0 && current < total - 1 )  manualGoTo( current + 1 );
        else if ( dx > 0 && current > 0 )      manualGoTo( current - 1 );
      }
      tx = null;
    }, { passive: true });

    // ── IntersectionObserver ──────────────────────────────────
    if ( 'IntersectionObserver' in window ) {
      const io = new IntersectionObserver( entries => {
        entries.forEach( e => {
          if ( e.isIntersecting ) startAuto();
          else stopAuto();
        });
      }, { threshold: 0.3 });
      io.observe( $root[0] );
    } else {
      startAuto();
    }

    // ── Init ──────────────────────────────────────────────────
    handleKenBurns( $items.eq(0), true );
    updateUI();
    if ( doAuto ) startAuto();
    else fillSegment( 0, 300, 'power2.out' ); 
  }

  // ── Boot ──────────────────────────────────────────────────
  $(function () {
    $( SEL_ROOT ).each(function () { init( $(this) ); });
  });

}(jQuery));