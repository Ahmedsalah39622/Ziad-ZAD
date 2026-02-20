/* ================================================================
   ZAD Shopify Theme — zad.js
   Cart AJAX API, drawer, mobile menu, quick-add
   ================================================================ */

(function () {
    'use strict';

    /* ── State ─────────────────────────────────────────────────── */
    let cartDrawerOpen = false;

    /* ── Init ──────────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {
        updateCartCount();
        initAddToCartForm();
    });

    /* ── Cart Count ─────────────────────────────────────────────── */
    async function updateCartCount() {
        try {
            const resp = await fetch('/cart.js');
            const cart = await resp.json();
            const count = cart.item_count;
            const el = document.getElementById('cart-count');
            if (el) {
                el.textContent = count;
                el.style.display = count > 0 ? 'flex' : 'none';
            }
        } catch (e) { /* silent */ }
    }

    /* ── Cart Drawer ────────────────────────────────────────────── */
    window.openCartDrawer = async function () {
        const drawer = document.getElementById('cart-drawer');
        const overlay = document.getElementById('cart-overlay');
        if (!drawer) return;
        cartDrawerOpen = true;
        drawer.classList.add('is-open');
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        await renderCartDrawer();
    };

    window.closeCartDrawer = function () {
        const drawer = document.getElementById('cart-drawer');
        const overlay = document.getElementById('cart-overlay');
        if (!drawer) return;
        cartDrawerOpen = false;
        drawer.classList.remove('is-open');
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
    };

    async function renderCartDrawer() {
        const body = document.getElementById('cart-drawer-body');
        if (!body) return;
        try {
            const resp = await fetch('/cart.js');
            const cart = await resp.json();
            if (cart.item_count === 0) {
                body.innerHTML = `
          <div class="cart-drawer-empty">
            <svg class="cart-drawer-empty__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <p class="cart-drawer-empty__text">Your cart is empty</p>
          </div>`;
                updateSubtotal('0');
            } else {
                body.innerHTML = cart.items.map((item, i) => `
          <div class="cart-drawer-item">
            ${item.image
                        ? `<img class="cart-drawer-item__img" src="${item.image}" alt="${item.title}" loading="lazy">`
                        : `<div class="cart-drawer-item__img" style="display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#404040">${item.title.slice(0, 2).toUpperCase()}</div>`
                    }
            <div style="flex:1">
              <p class="cart-drawer-item__name">${item.product_title}</p>
              ${item.variant_title && item.variant_title !== 'Default Title'
                        ? `<p class="cart-drawer-item__variant">${item.variant_title}</p>` : ''}
              <p class="cart-drawer-item__price">${formatMoney(item.final_line_price)}</p>
              <div class="qty-control" style="margin-top:10px">
                <button class="qty-control__btn" onclick="drawerUpdateLine(${i + 1}, ${item.quantity - 1})">−</button>
                <span class="qty-control__value">${item.quantity}</span>
                <button class="qty-control__btn" onclick="drawerUpdateLine(${i + 1}, ${item.quantity + 1})">+</button>
              </div>
            </div>
          </div>`).join('');
                updateSubtotal(formatMoney(cart.total_price));
            }
        } catch (e) {
            body.innerHTML = '<p style="color:#737373;padding:20px">Unable to load cart.</p>';
        }
    }

    function updateSubtotal(value) {
        const el = document.getElementById('cart-subtotal');
        if (el) el.textContent = value;
    }

    window.drawerUpdateLine = async function (line, quantity) {
        try {
            await fetch('/cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ line, quantity })
            });
            await updateCartCount();
            await renderCartDrawer();
        } catch (e) { /* silent */ }
    };

    /* ── Quick Add to Cart (Collection page) ────────────────────── */
    window.quickAddToCart = async function (event, variantId) {
        event.preventDefault();
        event.stopPropagation();
        const btn = event.currentTarget;
        const originalText = btn.textContent;
        btn.textContent = 'Adding...';
        btn.disabled = true;
        try {
            await fetch('/cart/add.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: variantId, quantity: 1 })
            });
            btn.textContent = '✓ Added!';
            await updateCartCount();
            setTimeout(() => openCartDrawer(), 300);
        } catch (e) {
            btn.textContent = 'Error';
        } finally {
            setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 2000);
        }
    };

    /* ── Add to Cart Form (Product page) ───────────────────────── */
    function initAddToCartForm() {
        const form = document.getElementById('product-form');
        if (!form) return;
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = document.getElementById('add-to-cart-btn');
            const variantId = document.getElementById('variant-select').value;
            const qty = parseInt(document.getElementById('qty-input').value) || 1;
            if (!variantId) return;
            if (btn) { btn.textContent = 'Adding...'; btn.disabled = true; }
            try {
                const resp = await fetch('/cart/add.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: variantId, quantity: qty })
                });
                if (!resp.ok) throw new Error('Add to cart failed');
                await updateCartCount();
                if (btn) { btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Added!'; }
                setTimeout(() => openCartDrawer(), 300);
            } catch (err) {
                if (btn) btn.textContent = 'Error — try again';
            } finally {
                setTimeout(() => {
                    if (btn) {
                        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> Add to Cart';
                        btn.disabled = false;
                    }
                }, 2500);
            }
        });
    }

    /* ── Mobile Menu ────────────────────────────────────────────── */
    window.toggleMobileMenu = function () {
        const menu = document.getElementById('mobile-menu');
        if (menu) menu.classList.toggle('is-open');
    };

    /* ── Keyboard: Escape closes drawer ────────────────────────── */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && cartDrawerOpen) closeCartDrawer();
    });

    /* ── Money formatter ────────────────────────────────────────── */
    function formatMoney(cents) {
        const amount = (cents / 100).toFixed(2);
        return window.Shopify && Shopify.currency
            ? `${Shopify.currency.active} ${amount}`
            : `EGP ${amount}`;
    }

})();
