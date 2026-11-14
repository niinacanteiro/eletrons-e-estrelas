/* Elétrons e Estrelas · © 2026 Nicoly Canteiro Araújo
   Cartões com fotos: deslizar entre fotos, remover fotos que não carregam e abrir o cartão completo. */
;(function () {
  'use strict'

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function wire(photos) {
    var shots = [].slice.call(photos.querySelectorAll('img'))
    if (shots.length < 2 || photos.hasAttribute('data-turn')) return
    var card = photos.closest('.photo-card')
    var h3 = card && card.querySelector('h3')
    var title = h3 ? h3.textContent.trim() : 'this item'
    var dots = document.createElement('div')
    dots.className = 'photo-card__dots'
    dots.setAttribute('aria-hidden', 'true')
    shots.forEach(function () {
      dots.appendChild(document.createElement('i'))
    })
    photos.parentNode.insertBefore(dots, photos.nextSibling)
    var shown = -1
    function mark() {
      var at = Math.round(photos.scrollLeft / (photos.clientWidth || 1))
      at = Math.max(0, Math.min(shots.length - 1, at))
      if (at === shown) return
      shown = at
      ;[].forEach.call(dots.children, function (dot, i) {
        dot.classList.toggle('is-on', i === at)
      })
      photos.setAttribute(
        'aria-label',
        'Next photo of ' + title + ', showing ' + (at + 1) + ' of ' + shots.length,
      )
    }
    function next() {
      var to = (shown + 1) % shots.length
      photos.scrollTo({
        left: to * photos.clientWidth,
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
      })
    }
    photos.setAttribute('data-turn', '')
    photos.setAttribute('role', 'button')
    photos.tabIndex = 0
    photos.addEventListener('scroll', mark, { passive: true })
    photos.addEventListener('click', next)
    photos.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return
      ev.preventDefault()
      next()
    })
    mark()
  }

  function setUp(photos) {
    ;[].slice.call(photos.querySelectorAll('img')).forEach(function (img) {
      if (img.complete && !img.naturalWidth) img.remove()
      else
        img.addEventListener('error', function () {
          drop(photos, img)
        })
    })
    if (!photos.querySelector('img')) photos.remove()
    else wire(photos)
  }

  function drop(photos, img) {
    img.remove()
    var dots = photos.nextElementSibling
    if (dots && dots.classList.contains('photo-card__dots')) dots.remove()
    var fresh = bare(photos)
    photos.replaceWith(fresh)
    setUp(fresh)
  }

  function bare(photos) {
    var copy = photos.cloneNode(true)
    ;['data-turn', 'role', 'tabindex', 'aria-label'].forEach(function (name) {
      copy.removeAttribute(name)
    })
    copy.scrollLeft = 0
    return copy
  }

  function isTile(card) {
    return getComputedStyle(card).getPropertyValue('--photo-card-tile').trim() === '1'
  }

  var FOCUSABLE = 'a[href], button, [tabindex="0"]'

  var OPENER = ['tabindex', 'role', 'aria-label']

  function markTiles() {
    ;[].slice.call(document.querySelectorAll('.photo-card')).forEach(function (card) {
      var head = card.querySelector('.photo-card__head')
      if (!head) return
      if (!isTile(card)) {
        OPENER.forEach(function (name) {
          head.removeAttribute(name)
        })
        return
      }
      var h3 = card.querySelector('h3')
      head.setAttribute('tabindex', '0')
      head.setAttribute('role', 'button')
      head.setAttribute(
        'aria-label',
        'Show details for ' + (h3 ? h3.textContent.trim() : 'this item'),
      )
    })
  }

  function tileHead(el) {
    return el.closest ? el.closest('.photo-card__head[role="button"]') : null
  }

  function onKeyOpen(ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return
    var head = tileHead(ev.target)
    if (!head || head.closest('.photo-card-sheet')) return
    ev.preventDefault()
    openSheet(head.closest('.photo-card'), true)
  }

  function openSheet(card, byKeyboard) {
    var sheet = document.createElement('div')
    sheet.className = 'photo-card-sheet'
    sheet.setAttribute('role', 'dialog')
    sheet.setAttribute('aria-modal', 'true')
    var h3 = card.querySelector('h3')
    sheet.setAttribute('aria-label', h3 ? h3.textContent.trim() : 'Item')
    var panel = document.createElement('div')
    panel.className = 'photo-card-sheet__panel'
    panel.tabIndex = -1
    var close = document.createElement('button')
    close.className = 'photo-card-sheet__close'
    close.type = 'button'
    close.setAttribute('aria-label', 'Close')
    close.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path stroke="currentColor" stroke-width="2" d="M13.66 13.658 2.347 2.345m0 11.32L13.66 2.352"/></svg>'
    var copy = card.cloneNode(true)
    copy.removeAttribute('id')
    ;[].slice.call(copy.querySelectorAll('.photo-card__dots')).forEach(function (d) {
      d.remove()
    })
    var copyHead = copy.querySelector('.photo-card__head')
    if (copyHead)
      OPENER.forEach(function (name) {
        copyHead.removeAttribute(name)
      })
    var photos = copy.querySelector('.photo-card__photos')
    if (photos) photos.replaceWith(bare(photos))
    var bar = document.createElement('div')
    bar.className = 'photo-card-sheet__bar'
    bar.appendChild(close)
    panel.append(bar, copy)
    sheet.appendChild(panel)
    ;(card.parentNode.closest('section') || document.body).appendChild(sheet)
    var fresh = copy.querySelector('.photo-card__photos')
    if (fresh) wire(fresh)
    document.documentElement.style.overflow = 'hidden'
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        sheet.classList.add('is-open')
      })
    })
    function shut(byKey) {
      sheet.classList.remove('is-open')
      document.documentElement.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      setTimeout(
        function () {
          sheet.remove()
        },
        reduceMotion.matches ? 0 : 300,
      )
      var opener = card.querySelector('.photo-card__head[role="button"]')
      if (byKey && opener) opener.focus({ preventScroll: true })
      else if (panel.contains(document.activeElement)) document.activeElement.blur()
    }
    function onKey(ev) {
      if (ev.key === 'Escape') return shut(true)
      if (ev.key !== 'Tab') return
      var stops = [].slice.call(panel.querySelectorAll(FOCUSABLE))
      var first = stops[0]
      var last = stops[stops.length - 1]
      if (ev.shiftKey ? document.activeElement === first : document.activeElement === last) {
        ev.preventDefault()
        ;(ev.shiftKey ? last : first).focus()
      }
    }
    document.addEventListener('keydown', onKey)
    sheet.addEventListener('click', function (ev) {
      if (ev.target === sheet || ev.target.closest('.photo-card-sheet__close')) shut(isKeyPress(ev))
    })
    ;(byKeyboard ? close : panel).focus({ preventScroll: true })
  }

  function onTap(ev) {
    if (ev.target.closest('.photo-card-sheet')) return
    var named = ev.target.closest('a[href^="#"]')
    if (named) {
      var target = document.getElementById(named.getAttribute('href').slice(1))
      if (!target || !target.matches('.photo-card') || !isTile(target)) return
      ev.preventDefault()
      openSheet(target, isKeyPress(ev))
      return
    }
    var card = ev.target.closest('.photo-card')
    if (!card || !isTile(card) || ev.target.closest('.btn')) return
    ev.preventDefault()
    ev.stopPropagation()
    openSheet(card, isKeyPress(ev))
  }

  function isKeyPress(ev) {
    return ev.detail === 0
  }

  function init() {
    ;[].slice.call(document.querySelectorAll('.photo-card__photos')).forEach(setUp)
    markTiles()
    var pending = false
    window.addEventListener('resize', function () {
      if (pending) return
      pending = true
      requestAnimationFrame(function () {
        pending = false
        markTiles()
      })
    })
    document.addEventListener('click', onTap, true)
    document.addEventListener('keydown', onKeyOpen)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
