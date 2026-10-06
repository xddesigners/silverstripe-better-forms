/**
 * Better Forms — client enhancement for the CMS admin.
 *
 * Reads the `data-bf-*` attributes stamped on fields by the PHP fluent API
 * (see XD\BetterForms\Extension\FormFieldExtension) and enhances the rendered field holder:
 *   - injects an (i) tooltip after the label (from setTooltip(), or from the field's description
 *     when convertDescriptionToTooltip() / the global descriptions_as_tooltips is on);
 *   - recolours the label and the input (text / background / outline) via CSS variables.
 *
 * Dependency-free. Re-applies after the CMS swaps content in (PJAX) via a MutationObserver.
 */
(function () {
    'use strict';

    function cfgDescTooltips() {
        return typeof window !== 'undefined' && window.__betterFormsDescTooltips === true;
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

    function buildTip(text, icon) {
        var tip = document.createElement('span');
        tip.className = 'bf-tip';
        tip.setAttribute('tabindex', '0');
        tip.setAttribute('role', 'button');
        tip.setAttribute('aria-label', 'More information');

        var glyph = document.createElement('i');
        glyph.className = 'bf-tip-icon ' + iconClass(icon);
        glyph.setAttribute('aria-hidden', 'true');

        var bubble = document.createElement('span');
        bubble.className = 'bf-tip-bubble';
        bubble.setAttribute('role', 'tooltip');
        bubble.textContent = text;

        tip.appendChild(glyph);
        tip.appendChild(bubble);
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
            var desc = holder.querySelector(':scope > .description');
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
    }

    function scan() {
        var sel = '[data-bf-tooltip],[data-bf-desc-tooltip],[data-bf-label-color],'
            + '[data-bf-field-color],[data-bf-field-bg],[data-bf-field-outline]';
        Array.prototype.forEach.call(document.querySelectorAll(sel), enhanceControl);

        // Global description -> tooltip: also cover fields that have a description but no data-bf-*.
        if (cfgDescTooltips()) {
            Array.prototype.forEach.call(
                document.querySelectorAll('.cms-edit-form .field > .description'),
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
