/**
 * main.js — Passport Photo Toronto
 * Handles interactive behaviours for index.html:
 *  - Mobile menu toggle
 *  - Mobile dropdown (Services) toggle
 *  - Active nav link highlight
 *  - Sticky header shadow on scroll
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ── 1. Mobile menu toggle ─────────────────────────────── */
    var menuBtn  = document.querySelector('.mobile-menu-btn');
    var navMenu  = document.querySelector('.nav-menu');

    if (menuBtn && navMenu) {
      menuBtn.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        // Toggle icon between bars and times
        var icon = menuBtn.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-bars');
          icon.classList.toggle('fa-times');
        }
      });

      // Close menu when a nav link is clicked (mobile UX)
      navMenu.querySelectorAll('.nav-link:not(.dropdown-toggle)').forEach(function (link) {
        link.addEventListener('click', function () {
          navMenu.classList.remove('active');
          var icon = menuBtn.querySelector('i');
          if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
          }
        });
      });
    }

    /* ── 2. Mobile dropdown toggle (Services) ─────────────── */
    var dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(function (toggle) {
      toggle.addEventListener('click', function (e) {
        // Only intercept on mobile (menu is open / stacked)
        if (window.innerWidth <= 768) {
          e.preventDefault();
          var parentItem = toggle.closest('.nav-item.dropdown');
          if (parentItem) {
            parentItem.classList.toggle('active');
          }
        }
      });
    });

    /* ── 3. Active nav link highlight ─────────────────────── */
    var currentPath = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(function (link) {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      }
    });

    /* ── 4. Sticky header shadow on scroll ────────────────── */
    var header = document.querySelector('.header');
    if (header) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 10) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }, { passive: true });
    }

  });

})();
