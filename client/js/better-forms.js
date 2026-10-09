/**
 * Better Forms — client enhancement for the CMS admin.
 *
 * Reads the `data-bf-*` attributes stamped on fields by the PHP fluent API
 * (see XD\BetterForms\Extension\FormFieldExtension) and enhances the rendered field holder:
 *   - injects an (i) tooltip after the label (from setTooltip(), or from the field's description
 *     when convertDescriptionToTooltip() / the global descriptions_as_tooltips is on);
 *   - recolours the label and the input (text / background / outline) via CSS variables;
 *   - links each field's description to its control via aria-describedby (base a11y, every field);
 *   - optionally warns in the console about low-contrast colour-setter values (dev aid).
 *
 * The tooltip trigger is a real <button type="button"> with an accessible name and an
 * aria-describedby pointing at a visually-hidden copy of the text (so screen readers announce it);
 * the visual bubble is hoverable and Esc-dismissible per WCAG 1.4.13.
 *
 * Dependency-free. Re-applies after the CMS swaps content in (PJAX) via a MutationObserver.
 */
(function () {
    'use strict';

    var tipSeq = 0;
    var descSeq = 0;

    function cfgDescTooltips() {
        return typeof window !== 'undefined' && window.__betterFormsDescTooltips === true;
    }

    function cfgContrastWarnings() {
        return typeof window !== 'undefined' && window.__betterFormsContrastWarnings === true;
    }

    function defaultInfoIcon() {
        return (typeof window !== 'undefined' && window.__betterFormsInfoIcon) || 'info-circled';
    }

    // The holder (.field wrapper) for a given input/control element.
    function holderOf(el) {
        return el.closest ? el.closest('.field') : null;
    }

    // The holder's own label (the one FormField_holder.ss renders above the input).
    function labelOf(holder) {
        return holder.querySelector(':scope > label.form-label')
            || holder.querySelector('label.form-label');
    }

    function iconClass(icon) {
        // A fa-* token is a Font Awesome class as-is; anything else is a CMS font-icon.
        return /(^|\s)fa[a-z-]*\s|^fa-/.test(icon + ' ') ? icon : 'font-icon-' + icon;
    }

    // Apply a font style ('bold', 'italic', 'bold italic', 'normal') to an element inline.
    function applyFontStyle(el, style) {
        if (!el || !style) {
            return;
        }
        var s = style.toLowerCase();
        if (s === 'normal') {
            el.style.fontWeight = '400';
            el.style.fontStyle = 'normal';
            return;
        }
        if (s.indexOf('bold') !== -1) {
            el.style.fontWeight = '700';
        }
        if (s.indexOf('italic') !== -1) {
            el.style.fontStyle = 'italic';
        }
    }

    function buildTip(text, icon) {
        // A real <button type="button"> trigger: natively focusable + keyboard-operable, and (unlike a
        // <span> inside a <label>) it does NOT forward clicks to the field's input. type="button" so it
        // never submits the CMS form.
        var id = 'bf-tip-' + (++tipSeq);
        var tip = document.createElement('button');
        tip.type = 'button';
        tip.className = 'bf-tip';
        tip.setAttribute('aria-label', 'More information');
        tip.setAttribute('aria-describedby', id);

        var glyph = document.createElement('i');
        glyph.className = 'bf-tip-icon ' + iconClass(icon);
        glyph.setAttribute('aria-hidden', 'true');

        // The visual bubble is for sighted users only (shown on hover/focus); hide it from AT so the
        // text isn't announced twice.
        var bubble = document.createElement('span');
        bubble.className = 'bf-tip-bubble';
        bubble.setAttribute('aria-hidden', 'true');
        bubble.textContent = text;

        // The accessible description is a visually-hidden copy that stays in the a11y tree at all times,
        // so aria-describedby reliably reads it (a describedby target that is display:none/visibility:hidden
        // — as the visual bubble is while closed — is often not announced).
        var srText = document.createElement('span');
        srText.className = 'bf-tip-sr';
        srText.id = id;
        srText.textContent = text;

        tip.appendChild(glyph);
        tip.appendChild(bubble);
        tip.appendChild(srText);
        return tip;
    }

    function addTooltip(holder, text, icon) {
        if (!text) {
            return;
        }
        var label = labelOf(holder);
        if (!label || label.querySelector('.bf-tip')) {
            return; // no label to hang it on, or already added
        }
        label.appendChild(buildTip(text, icon));
        label.classList.add('bf-has-tip');
    }

    // Enhance one control element carrying data-bf-* attributes.
    function enhanceControl(el) {
        var holder = holderOf(el);
        if (!holder) {
            return;
        }
        var icon = el.getAttribute('data-bf-info-icon') || defaultInfoIcon();

        // Tooltip from setTooltip()
        var tip = el.getAttribute('data-bf-tooltip');
        if (tip) {
            addTooltip(holder, tip, icon);
        }

        // Description -> tooltip (per-field flag or global)
        var descFlag = el.getAttribute('data-bf-desc-tooltip') === '1';
        if ((descFlag || cfgDescTooltips()) && !holder.classList.contains('bf-desc-moved')) {
            // The CMS form schema renders the description as .form__field-description nested inside
            // .form__field-holder; the plain template renders .description. Match either (not just a
            // direct child). On a simple field the holder has only its own description.
            var desc = holder.querySelector('.form__field-description, .description');
            if (desc) {
                var txt = (desc.textContent || '').trim();
                if (txt) {
                    addTooltip(holder, txt, icon);
                    holder.classList.add('bf-desc-moved');
                    desc.style.display = 'none';
                }
            }
        }

        // Colours -> CSS variables on the holder (CSS applies them to label + controls).
        var labelColor = el.getAttribute('data-bf-label-color');
        var fieldColor = el.getAttribute('data-bf-field-color');
        var fieldBg = el.getAttribute('data-bf-field-bg');
        var fieldOutline = el.getAttribute('data-bf-field-outline');
        var labelFont = el.getAttribute('data-bf-label-font');
        var descColor = el.getAttribute('data-bf-desc-color');
        var descBg = el.getAttribute('data-bf-desc-bg');
        var descBorder = el.getAttribute('data-bf-desc-border');
        var descFont = el.getAttribute('data-bf-desc-font');

        if (labelColor) {
            holder.style.setProperty('--bf-label-color', labelColor);
            holder.classList.add('bf-has-label-color');
        }
        if (fieldColor) {
            holder.style.setProperty('--bf-field-color', fieldColor);
            holder.classList.add('bf-field-color');
        }
        if (fieldBg) {
            holder.style.setProperty('--bf-field-bg', fieldBg);
            holder.classList.add('bf-field-bg');
        }
        if (fieldOutline) {
            holder.style.setProperty('--bf-field-outline', fieldOutline);
            holder.classList.add('bf-field-outline');
        }
        if (labelFont) {
            applyFontStyle(labelOf(holder), labelFont);
        }
        if (descColor) {
            holder.style.setProperty('--bf-desc-color', descColor);
            holder.classList.add('bf-desc-color');
        }
        if (descBg) {
            holder.style.setProperty('--bf-desc-bg', descBg);
            holder.classList.add('bf-desc-bg');
        }
        if (descBorder) {
            holder.style.setProperty('--bf-desc-border', descBorder);
            holder.classList.add('bf-desc-border');
        }
        // A background or border turns the description into a padded callout box.
        if (descBg || descBorder) {
            holder.classList.add('bf-desc-box');
        }
        if (descFont) {
            applyFontStyle(holder.querySelector('.form__field-description, .description'), descFont);
        }
    }

    // Associate every field's visible description with its control via aria-describedby, so a screen
    // reader announces the help when the field gets focus. The CMS renders the description (often with a
    // `describes-…` id) but does NOT wire the input to it; this closes that gap for every field — not
    // just ones using the module's own API. Additive and idempotent.
    function associateDescriptions() {
        Array.prototype.forEach.call(document.querySelectorAll('.cms-edit-form .field'), function (holder) {
            if (holder.classList.contains('bf-desc-moved')) {
                return; // description was moved into a tooltip — announced via the tooltip instead
            }
            var desc = holder.querySelector('.form__field-description, .description');
            if (!desc || !(desc.textContent || '').trim()) {
                return;
            }
            // A fieldset groups an option set's inputs; otherwise associate the single control.
            var target = holder.querySelector('fieldset');
            if (!target) {
                var controls = holder.querySelectorAll('input, textarea, select');
                if (controls.length === 1) {
                    target = controls[0];
                }
            }
            if (!target || target.getAttribute('data-bf-desc-linked') === '1') {
                return;
            }
            if (!desc.id) {
                desc.id = 'bf-desc-' + (++descSeq);
            }
            var ids = (target.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
            if (ids.indexOf(desc.id) === -1) {
                ids.push(desc.id);
                target.setAttribute('aria-describedby', ids.join(' '));
            }
            target.setAttribute('data-bf-desc-linked', '1');
        });
    }

    // --- Contrast guardrail (dev aid; gated by window.__betterFormsContrastWarnings) ---
    function parseRGB(str) {
        var m = (str || '').match(/rgba?\(([^)]+)\)/);
        if (!m) {
            return null;
        }
        var p = m[1].split(',').map(function (s) { return parseFloat(s); });
        if (p.length >= 4 && p[3] === 0) {
            return null; // fully transparent — not a real background
        }
        return [p[0], p[1], p[2]];
    }
    function relLum(rgb) {
        var a = rgb.map(function (v) {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    }
    function contrastRatio(a, b) {
        var hi = Math.max(relLum(a), relLum(b));
        var lo = Math.min(relLum(a), relLum(b));
        return (hi + 0.05) / (lo + 0.05);
    }
    function effectiveBg(el) {
        var n = el;
        while (n && n.nodeType === 1) {
            var bg = parseRGB(getComputedStyle(n).backgroundColor);
            if (bg) {
                return bg;
            }
            n = n.parentElement;
        }
        return [255, 255, 255];
    }
    function warnContrast(label, fg, bg, min, el) {
        if (!fg || !bg) {
            return;
        }
        var r = contrastRatio(fg, bg);
        if (r < min - 0.05) {
            console.warn('[better-forms] low contrast ' + r.toFixed(2) + ':1 (WCAG AA needs ' + min + ':1) — ' + label, el);
        }
    }
    function checkContrast() {
        var holders = document.querySelectorAll(
            '.field.bf-has-label-color,.field.bf-field-color,.field.bf-field-bg,.field.bf-field-outline,.field.bf-desc-color'
        );
        Array.prototype.forEach.call(holders, function (f) {
            if (f.getAttribute('data-bf-cc') === '1') {
                return; // checked once
            }
            f.setAttribute('data-bf-cc', '1');
            var label = f.querySelector('label.form-label, label.form-check-label');
            var input = f.querySelector('input.text, textarea, select');
            var desc = f.querySelector('.form__field-description, .description');
            var name = ((label ? label.textContent : (input ? input.name : '')) || 'field').trim().slice(0, 30);
            if (f.classList.contains('bf-has-label-color') && label) {
                warnContrast('label "' + name + '"', parseRGB(getComputedStyle(label).color), effectiveBg(label), 4.5, label);
            }
            if (input && (f.classList.contains('bf-field-color') || f.classList.contains('bf-field-bg'))) {
                warnContrast('input text "' + name + '"', parseRGB(getComputedStyle(input).color), effectiveBg(input), 4.5, input);
            }
            if (input && f.classList.contains('bf-field-outline')) {
                warnContrast('input border "' + name + '"', parseRGB(getComputedStyle(input).borderTopColor), effectiveBg(input), 3, input);
            }
            if (desc && f.classList.contains('bf-desc-color')) {
                warnContrast('description "' + name + '"', parseRGB(getComputedStyle(desc).color), effectiveBg(desc), 4.5, desc);
            }
        });
    }

    function scan() {
        var sel = '[data-bf-tooltip],[data-bf-desc-tooltip],[data-bf-label-color],'
            + '[data-bf-field-color],[data-bf-field-bg],[data-bf-field-outline],[data-bf-label-font],'
            + '[data-bf-desc-color],[data-bf-desc-bg],[data-bf-desc-border],[data-bf-desc-font]';
        Array.prototype.forEach.call(document.querySelectorAll(sel), enhanceControl);

        // Global description -> tooltip: also cover fields that have a description but no data-bf-*.
        if (cfgDescTooltips()) {
            Array.prototype.forEach.call(
                document.querySelectorAll('.cms-edit-form .field .form__field-description, .cms-edit-form .field .description'),
                function (desc) {
                    var holder = desc.closest('.field');
                    if (holder && !holder.classList.contains('bf-desc-moved')) {
                        var txt = (desc.textContent || '').trim();
                        if (txt) {
                            addTooltip(holder, txt, defaultInfoIcon());
                            holder.classList.add('bf-desc-moved');
                            desc.style.display = 'none';
                        }
                    }
                }
            );
        }

        // Base a11y improvement for every field (not just module-enhanced ones): link each field's
        // description to its control for screen readers. Runs after the description->tooltip move above.
        associateDescriptions();

        // Opt-in dev aid: warn about low-contrast colour-setter values.
        if (cfgContrastWarnings()) {
            checkContrast();
        }
    }

    var scheduled = false;
    function scheduleScan() {
        if (scheduled) {
            return;
        }
        scheduled = true;
        setTimeout(function () {
            scheduled = false;
            scan();
        }, 50);
    }

    // WCAG 1.4.13 (dismissible): Esc hides the open tooltip while keeping focus on its trigger. The
    // bubble shows via CSS :hover/:focus; the bf-tip-dismissed class overrides that until the trigger is
    // blurred (so re-focusing shows it again). Delegated, so it also covers tips injected later.
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' && e.key !== 'Esc') {
            return;
        }
        var el = document.activeElement;
        if (el && el.classList && el.classList.contains('bf-tip') && !el.classList.contains('bf-tip-dismissed')) {
            el.classList.add('bf-tip-dismissed');
            e.stopPropagation(); // dismiss the tooltip first; don't also close a parent panel/modal
        }
    });
    document.addEventListener('focusout', function (e) {
        var el = e.target;
        if (el && el.classList && el.classList.contains('bf-tip')) {
            el.classList.remove('bf-tip-dismissed');
        }
    });

    if (document.readyState !== 'loading') {
        scheduleScan();
    } else {
        document.addEventListener('DOMContentLoaded', scheduleScan);
    }

    if (window.MutationObserver) {
        new MutationObserver(scheduleScan).observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
})();
