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
 *       ->setFieldBorderColor('#c0392b');
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
     * Set the input's native placeholder (the hint shown while the field is empty). A thin fluent
     * wrapper over the HTML `placeholder` attribute — Silverstripe has no setPlaceholder() on plain
     * text fields (only the searchable-dropdown fields do), so this gives every field one.
     *
     * A placeholder is an example value, not a label: it vanishes once the user types and often renders
     * below the contrast minimum, so keep the field's real label and never use it as the only hint.
     */
    public function setPlaceholder(string $text): FormField
    {
        $this->owner->setAttribute('placeholder', $text);
        return $this->owner;
    }

    /**
     * Set the field's HTML `autocomplete` token (e.g. 'email', 'name', 'tel', 'postal-code',
     * 'street-address') so browsers and password managers can identify and autofill it — which also
     * satisfies WCAG 1.3.5 (Identify Input Purpose). Pass 'off' to opt a field out.
     */
    public function setAutocomplete(string $token): FormField
    {
        $this->owner->setAttribute('autocomplete', $token);
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
     * Set the font style of the field's label: 'bold', 'italic', 'bold italic', or 'normal'.
     */
    public function setLabelFontStyle(string $style): FormField
    {
        $this->owner->setAttribute('data-bf-label-font', $style);
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
     * Set the input/textarea/select border colour.
     */
    public function setFieldBorderColor(string $color): FormField
    {
        $this->owner->setAttribute('data-bf-field-outline', $color);
        return $this->owner;
    }

    /**
     * Colour the field's description text.
     */
    public function setDescriptionColor(string $color): FormField
    {
        $this->owner->setAttribute('data-bf-desc-color', $color);
        return $this->owner;
    }

    /**
     * Give the field's description a background colour (turns it into a padded callout box).
     */
    public function setDescriptionBackground(string $color): FormField
    {
        $this->owner->setAttribute('data-bf-desc-bg', $color);
        return $this->owner;
    }

    /**
     * Give the field's description a border colour (turns it into a padded callout box).
     */
    public function setDescriptionBorderColor(string $color): FormField
    {
        $this->owner->setAttribute('data-bf-desc-border', $color);
        return $this->owner;
    }

    /**
     * Set the font style of the field's description: 'bold', 'italic', 'bold italic', or 'normal'.
     */
    public function setDescriptionFontStyle(string $style): FormField
    {
        $this->owner->setAttribute('data-bf-desc-font', $style);
        return $this->owner;
    }

    /**
     * Style the field's description in one call. Any non-null value is applied; setting a background
     * or border turns the description into a padded callout box.
     */
    public function setDescriptionStyle(
        ?string $color = null,
        ?string $background = null,
        ?string $borderColor = null,
        ?string $fontStyle = null
    ): FormField {
        if ($color !== null) {
            $this->owner->setAttribute('data-bf-desc-color', $color);
        }
        if ($background !== null) {
            $this->owner->setAttribute('data-bf-desc-bg', $background);
        }
        if ($borderColor !== null) {
            $this->owner->setAttribute('data-bf-desc-border', $borderColor);
        }
        if ($fontStyle !== null) {
            $this->owner->setAttribute('data-bf-desc-font', $fontStyle);
        }
        return $this->owner;
    }

    /**
     * Lay an OptionsetField's or CheckboxSetField's options out in a horizontal, wrapping row
     * instead of stacked vertically.
     */
    public function enableInline(bool $enabled = true): FormField
    {
        if ($enabled) {
            $this->owner->addExtraClass('bf-inline');
        } else {
            $this->owner->removeExtraClass('bf-inline');
        }
        return $this->owner;
    }

    /**
     * Break this field out of the admin's ~58% readable-width cap so its control spans the whole form
     * row (the label sits on its own full-width line above). Handy for wide fields like an
     * HTMLEditorField or a GridField. Mirrors GridLayoutField->enableFullWidth().
     */
    public function enableFullWidth(bool $enabled = true): FormField
    {
        if ($enabled) {
            $this->owner->addExtraClass('bf-full');
        } else {
            $this->owner->removeExtraClass('bf-full');
        }
        return $this->owner;
    }
}
