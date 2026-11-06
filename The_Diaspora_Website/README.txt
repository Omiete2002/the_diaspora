THE DIASPORA · RESTO LOUNGE — WEBSITE
=====================================

A static, multi-page website. No build step or server software is needed:
upload the whole folder to any web host (cPanel, Netlify, Vercel, GitHub Pages, etc.)
and index.html becomes the home page. You can also double-click index.html to preview locally.

PAGES
  index.html            Home
  our-story.html        Our Story / about
  food.html             Food menu (grill, burgers, boards, sides & sauces)
  drinks.html           Drinks menu (signatures, classics, wine, beer, spirits, zero proof)
  whats-on.html         Weekly entertainment calendar + daily offers
  detty-december.html   December 2026 programme, countdown and group packages
  visit.html            Hours, reservation form, map and contact

BEFORE GOING LIVE — edit assets/js/config.js
  whatsapp      reservations WhatsApp number (digits only, e.g. 2348012345678)
  phoneDisplay  phone number as shown on the site
  email         reservations email address
  instagram / tiktok / x   full profile URLs (empty = link hidden)
  openingDate   date/time the countdown runs to (currently 1 Dec 2026, 6 PM)

The reservation form opens WhatsApp (or the guest's email app) with the booking
details pre-filled, so it works without any backend.

EDITING CONTENT
  Text and prices live directly in the .html files.
  Colours and fonts are set at the top of assets/css/style.css (:root variables).
  Photos are in assets/img/ — replace any file with a new photo of the same name
  (e.g. professional venue photography once available).
