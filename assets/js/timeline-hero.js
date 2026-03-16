/**
 * Timeline Hero – JS  v2.6
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

    const $slider      = $root.find(SEL_SLIDER);
    const $items       = $root.find(SEL_MEDIA_ITEM);
    const $labels      = $root.find(SEL_LABEL);
    const $stepBtns    = $root.find(SEL_STEP_BTN);
    const $segments    = $root.find('.th-track-segment');
    const $stepsScroll = $root.find('.th-steps-scroll');
    const $stepsRow    = $root.find('.th-steps-row');
    const $arrowPrev   = $root.find('.th-steps-arrow--prev');
    const $arrowNext   = $root.find('.th-steps-arrow--next');
    const $track       = $root.find('.th-track');

    const autoDelay = 4500;
    const total     = $items.length;

    let current    = 0;
    let animating  = false;
    let autoTimer  = null;
    let progressTw = null;
    let viewOffset = 0;

    if ( total === 0 ) return;

    // ── Stato GSAP iniziale ───────────────────────────────────
    gsap.set( $items.not('.is-active'), { opacity: 0, scale: 1.06 } );
    gsap.set( $items.filter('.is-active'), { opacity: 1, scale: 1 } );

    // ── Progress bar ──────────────────────────────────────────

    function getFill ( index ) {
      return $segments.eq(index).find('.th-track-segment__fill')[0];
    }

    // Illumina solo la barra dell'index — non tocca le altre
    function fillSegment ( index, duration_ms, ease ) {
      if ( progressTw ) { progressTw.kill(); progressTw = null; }
      const fill = getFill( index );
      if ( !fill ) return;
      gsap.set( fill, { scaleX: 0, transformOrigin: 'left center', width: '100%' } );
      progressTw = gsap.to( fill, {
        scaleX:   1,
        duration: duration_ms / 1000,
        ease:     ease || 'none',
      });
    }

    // Resetta tutte le barre: passate a 1, future a 0, anima l'index
    function fillSegmentFull ( index, duration_ms, ease ) {
      if ( progressTw ) { progressTw.kill(); progressTw = null; }
      $segments.find('.th-track-segment__fill').each(function (i) {
        gsap.set( this, {
          width:           '100%',
          scaleX:          i < index ? 1 : 0,
          transformOrigin: 'left center',
        });
      });
      const fill = getFill( index );
      if ( !fill ) return;
      gsap.set( fill, { scaleX: 0, transformOrigin: 'left center' } );
      progressTw = gsap.to( fill, {
        scaleX:   1,
        duration: duration_ms / 1000,
        ease:     ease || 'none',
      });
    }

    // Svuota fromIndex, riempie toIndex — parte dallo stato attuale di fillOut
    function transitionSegments ( fromIndex, toIndex, duration_ms ) {
      if ( progressTw ) { progressTw.kill(); progressTw = null; }
      const fillOut = getFill( fromIndex );
      const fillIn  = getFill( toIndex );
      if ( !fillOut || !fillIn ) return;

      const tl = gsap.timeline({ onComplete () { progressTw = null; } });
      gsap.set( fillOut, { transformOrigin: 'right center' } );
      tl.to( fillOut, { scaleX: 0, duration: duration_ms / 1000, ease: 'sine.inOut' }, 0 );
      gsap.set( fillIn,  { scaleX: 0, transformOrigin: 'left center', width: '100%' } );
      tl.to( fillIn,  { scaleX: 1, duration: duration_ms / 1000, ease: 'sine.inOut' }, 0 );
      progressTw = tl;
    }

    // Reset visivo completo — barre, dot, label
    function resetAll () {
      $segments.find('.th-track-segment__fill').each(function () {
        gsap.set( this, { scaleX: 0, transformOrigin: 'left center', width: '100%' } );
      });
      $stepBtns.each(function () {
        $(this).removeClass('is-active').attr('tabindex', '-1');
        gsap.set( $(this).find('.th-step-dot__fill')[0],   { scaleX: 0, transformOrigin: 'left center' } );
        gsap.set( $(this).find('.th-step-label__fill')[0], { clipPath: 'inset(0 100% 0 0)' } );
      });
    }

    // ── Steps scroll / frecce ─────────────────────────────────
    function getVisibleSlots () {
      const w = window.innerWidth;
      if ( w <= 480 ) return 2;
      if ( w <= 768 ) return 4;
      return 6;
    }

    function updateArrows () {
      const slots    = getVisibleSlots();
      const overflow = total > slots;
      $stepsScroll.toggleClass('has-overflow', overflow);
      $arrowPrev.toggleClass('is-hidden', !overflow);
      $arrowNext.toggleClass('is-hidden', !overflow);
      $stepBtns.css('width', ( 100 / Math.min( slots, total ) ) + '%');
      if ( overflow ) {
        $track.css('width', ( total / slots * 100 ) + '%');
        $segments.css({ flex: 'none', width: ( 100 / total ) + '%' });
      } else {
        $track.css('width', '100%');
        $segments.css({ flex: '1', width: '' });
      }
    }

    function scrollToOffset ( offset ) {
      const slots    = getVisibleSlots();
      const scrollW  = $stepsScroll[0].offsetWidth;
      const btnW     = $stepBtns.eq(0)[0] ? $stepBtns.eq(0)[0].offsetWidth : scrollW / slots;
      const maxShift = Math.max( 0, btnW * total - scrollW );
      viewOffset = Math.max( 0, Math.min( offset, maxShift ) );

      gsap.to( $stepsRow[0], { x: -viewOffset, duration: 0.45, ease: 'power2.inOut' });

      const maxTrack    = Math.max( 0, $track[0].offsetWidth - scrollW );
      const trackTarget = maxShift > 0 ? ( viewOffset / maxShift ) * maxTrack : 0;
      gsap.to( $track[0], { x: -trackTarget, duration: 0.45, ease: 'power2.inOut' });
    }

    function scrollToActive () {
      if ( !$stepsScroll[0] ) return;
      const slots = getVisibleSlots();
      if ( total <= slots ) {
        viewOffset = 0;
        gsap.set( [$stepsRow[0], $track[0]], { x: 0 } );
        return;
      }
      const scrollW = $stepsScroll[0].offsetWidth;
      const btnW    = $stepBtns.eq(0)[0] ? $stepBtns.eq(0)[0].offsetWidth : scrollW / slots;
      const btnLeft = $stepBtns.eq(current)[0].offsetLeft;
      if ( btnLeft < viewOffset || btnLeft + btnW > viewOffset + scrollW ) {
        const maxShift = Math.max( 0, btnW * total - scrollW );
        scrollToOffset( Math.max( 0, Math.min( btnLeft - scrollW / 2 + btnW / 2, maxShift ) ) );
      }
    }

    $arrowPrev.on('click', function () {
      const btnW = $stepBtns.eq(0)[0] ? $stepBtns.eq(0)[0].offsetWidth : $stepsScroll[0].offsetWidth / getVisibleSlots();
      scrollToOffset( viewOffset - btnW * getVisibleSlots() );
    });

    $arrowNext.on('click', function () {
      const btnW = $stepBtns.eq(0)[0] ? $stepBtns.eq(0)[0].offsetWidth : $stepsScroll[0].offsetWidth / getVisibleSlots();
      scrollToOffset( viewOffset + btnW * getVisibleSlots() );
    });

    $( window ).on( 'resize.th-' + $root.attr('id'), function () {
      updateArrows();
      scrollToActive();
    });

    // ── updateUI ──────────────────────────────────────────────
    function updateUI ( prevIndex ) {
      $slider.val(current).attr('aria-valuenow', current);

      // Reset tutti i btn non coinvolti nella transizione
      $stepBtns.each(function (i) {
        if ( i !== current && i !== prevIndex ) {
          $(this).removeClass('is-active').attr('tabindex', '-1');
          gsap.set( $(this).find('.th-step-dot__fill')[0],   { scaleX: 0, transformOrigin: 'left center' } );
          gsap.set( $(this).find('.th-step-label__fill')[0], { clipPath: 'inset(0 100% 0 0)' } );
        }
      });

      // Prev — si svuota
      if ( prevIndex !== undefined ) {
        const $out = $stepBtns.eq(prevIndex);
        $out.removeClass('is-active').attr('tabindex', '-1');
        gsap.set( $out.find('.th-step-dot__fill')[0], { transformOrigin: 'right center' } );
        gsap.to(  $out.find('.th-step-dot__fill')[0], { scaleX: 0, duration: duration * 0.5, ease: 'sine.inOut' });
        gsap.to(  $out.find('.th-step-label__fill')[0], { clipPath: 'inset(0 0% 0 100%)', duration: duration * 0.5, ease: 'sine.inOut' });
      }

      // Next — si riempie
      const $in = $stepBtns.eq(current);
      $in.addClass('is-active').attr('tabindex', '0');
      gsap.set( $in.find('.th-step-dot__fill')[0], { scaleX: 0, transformOrigin: 'left center' } );
      gsap.to(  $in.find('.th-step-dot__fill')[0], { scaleX: 1, duration: duration * 0.6, ease: 'sine.inOut' });
      gsap.set( $in.find('.th-step-label__fill')[0], { clipPath: 'inset(0 100% 0 0)' } );
      gsap.to(  $in.find('.th-step-label__fill')[0], { clipPath: 'inset(0 0% 0 0)', duration: duration * 0.6, ease: 'sine.inOut' });

      scrollToActive();
    }

    // ── goTo ──────────────────────────────────────────────────
    function goTo (index, onDone) {
      if ( index === current ) { if (onDone) onDone(); return; }

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
      current = index;
      updateUI( prevIndex );

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
          handleVideo( $inItem,  true );
          handleKenBurns( $outItem, false );
          handleKenBurns( $inItem,  true );
          if ( onDone ) onDone();
        }
      });

      if ( transition === 'slide' ) {
        const slideAmt = $root.outerWidth();
        gsap.set( $inItem, { x: dir * slideAmt, opacity: 1, scale: 1 } );
        tl.to( $outItem[0], { x: -dir * slideAmt, duration, ease: 'power3.inOut' }, 0 );
        tl.to( $inItem[0],  { x: 0,               duration, ease: 'power3.inOut' }, 0 );
      } else {
        gsap.set( $inItem, { opacity: 0, scale: 1.06, x: 0 } );
        tl.to( $outItem[0], { opacity: 0, scale: 0.97, duration: duration * .55, ease: 'power2.in'  }, 0 );
        tl.to( $inItem[0],  { opacity: 1, scale: 1,    duration,                 ease: 'power3.out' }, duration * .2 );
      }

      // ── Testo uscente ─────────────────────────────────────
      const $outTitle    = $outLabel.find('.th-title');
      const $outSubtitle = $outLabel.find('.th-subtitle');
      const outFirst  = dir === 1 ? $outTitle[0]    : $outSubtitle[0];
      const outSecond = dir === 1 ? $outSubtitle[0] : $outTitle[0];

      gsap.timeline({
        onComplete () {
          $outLabel.removeClass('is-active').attr('aria-hidden', 'true');
          gsap.set( [$outTitle[0], $outSubtitle[0]], { y: 0, skewY: 0, filter: 'blur(0px)' } );
        }
      })
      .to( outFirst,  { autoAlpha: 0, y: dir * -8, skewY: dir * -1.5, filter: 'blur(2px)', duration: duration * .28, ease: 'sine.inOut' })
      .to( outSecond, { autoAlpha: 0, y: dir * -8, skewY: dir * -1.5, filter: 'blur(2px)', duration: duration * .30, ease: 'sine.inOut' }, `-=${duration * .12}` );

      // ── Testo entrante ────────────────────────────────────
      const $inTitle    = $inLabel.find('.th-title');
      const $inSubtitle = $inLabel.find('.th-subtitle');
      const inFirst  = dir === 1 ? $inTitle[0]    : $inSubtitle[0];
      const inSecond = dir === 1 ? $inSubtitle[0] : $inTitle[0];

      gsap.set( [inFirst, inSecond], { autoAlpha: 0, y: dir * 22, skewY: dir * 2, filter: 'blur(5px)' });
      gsap.timeline({
        delay: duration * .20,
        onStart () { $inLabel.addClass('is-active').attr('aria-hidden', 'false'); }
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
      if ( progressTw ) { progressTw.kill(); progressTw = null; }
    }

    // Avvia il ciclo: attende autoDelay, poi transita verso next e ricomincia
    function startCycle () {
      if ( !doAuto || total <= 1 ) return;
      autoTimer = setTimeout( function () {
        const next = ( current + 1 ) % total;
        transitionSegments( current, next, duration * 1000 );
        goTo( next, startCycle );
      }, autoDelay );
    }

    function startAuto () {
      if ( !doAuto || total <= 1 ) return;
      stopAuto();
      fillSegmentFull( current, 300, 'power2.out' );
      startCycle();
    }

    // ── Navigazione manuale ───────────────────────────────────
    function manualGoTo (idx) {
      if ( idx === current ) return;
      stopAuto();
      resetAll();
      fillSegment( idx, 300, 'power2.out' );  // accende subito la barra target
      goTo( idx, function () {
        if ( doAuto ) startCycle();           // riprende il ciclo normale
      });
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
    $root[0].addEventListener('touchend',   e => {
      if ( tx === null ) return;
      const dx = e.changedTouches[0].clientX - tx;
      if ( Math.abs(dx) > 50 ) {
        if      ( dx < 0 && current < total - 1 ) manualGoTo( current + 1 );
        else if ( dx > 0 && current > 0 )          manualGoTo( current - 1 );
      }
      tx = null;
    }, { passive: true });

    // ── IntersectionObserver ──────────────────────────────────
    if ( 'IntersectionObserver' in window ) {
      const io = new IntersectionObserver( entries => {
        entries.forEach( e => { e.isIntersecting ? startAuto() : stopAuto(); });
      }, { threshold: 0.3 });
      io.observe( $root[0] );
    } else {
      startAuto();
    }

    // ── Init ──────────────────────────────────────────────────
    handleKenBurns( $items.eq(0), true );
    $slider.val(0).attr('aria-valuenow', 0);
    resetAll();

    // Primo btn attivo
    $stepBtns.eq(0).addClass('is-active').attr('tabindex', '0');
    gsap.set( $stepBtns.eq(0).find('.th-step-dot__fill')[0],   { scaleX: 1, transformOrigin: 'left center' } );
    gsap.set( $stepBtns.eq(0).find('.th-step-label__fill')[0], { clipPath: 'inset(0 0% 0 0)' } );

    updateArrows();
    scrollToActive();

    if ( doAuto ) startAuto();
    else fillSegment( 0, 300, 'power2.out' );
  }

  // ── Boot ──────────────────────────────────────────────────
  $(function () {
    $( SEL_ROOT ).each(function () { init( $(this) ); });
  });

}(jQuery));