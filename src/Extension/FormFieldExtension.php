<?php

namespace XD\BetterForms\Extension;

use SilverStripe\Core\Extension;
use SilverStripe\Forms\FormField;

/**
 * Adds a small fluent API to every FormField. Each setter stamps a `data-bf-*` attribute on the
 * field; the module's client script reads those and enhances the rendered holder (injects the
 * tooltip icon, recolours the label/input). Every setter returns the field, so they chain.
 *
 *   TextField::create('Price')
 *       ->setTooltip('Excl. VAT, in euros')
 *       ->setLabelColor('#c0392b')
 *       ->setFieldOutline('#c0392b');
 *
 * @extends Extension<FormField>
 */
class FormFieldExtension extends Extension
{
    /**
     * Show an (i) icon after the label; hovering/focusing it reveals this text in a tooltip.
     */
    public function setTooltip(string $text): FormField
    {
        $this->owner->setAttribute('data-bf-tooltip', $text);
        return $this->owner;
    }

    /**
     * Render this field's existing description() as an (i) tooltip after the label instead of as
     * inline help text. (The global BetterForms.descriptions_as_tooltips does this for every field.)
     */
    public function convertDescriptionToTooltip(bool $enabled = true): FormField
    {
        if ($enabled) {
            $this->owner->setAttribute('data-bf-desc-tooltip', '1');
        } else {
            $this->owner->setAttribute('data-bf-desc-tooltip', null);
        }
        return $this->owner;
    }

    /**
     * Override the tooltip trigger icon for this field (a CMS font-icon name without the
     * `font-icon-` prefix, or a `fa-*` Font Awesome class).
     */
    public function setInfoIcon(string $icon): FormField
    {
        $this->owner->setAttribute('data-bf-info-icon', $icon);
        return $this->owner;
    }

    /**
     * Colour the field's label.
     */
    public function setLabelColor(string $color): FormField
    {
        $this->owner->setAttribute('data-bf-label-color', $color);
        return $this->owner;
    }

    /**
     * Colour the text inside the input/textarea/select.
     */
    public function setFieldColor(string $color): FormField
    {
        $this->owner->setAttribute('data-bf-field-color', $color);
        return $this->owner;
    }

    /**
     * Set the input/textarea/select background colour.
     */
    public function setFieldBackground(string $color): FormField
    {
        $this->owner->setAttribute('data-bf-field-bg', $color);
        return $this->owner;
    }

    /**
     * Set the input/textarea/select border (outline) colour.
     */
    public function setFieldOutline(string $color): FormField
    {
        $this->owner->setAttribute('data-bf-field-outline', $color);
        return $this->owner;
    }
}
