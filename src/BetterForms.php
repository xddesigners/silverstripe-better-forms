<?php

namespace XD\BetterForms;

use SilverStripe\Core\Config\Configurable;
use SilverStripe\Core\Extensible;
use SilverStripe\Core\Injector\Injectable;

/**
 * Central config + small helpers for the Better Forms module.
 *
 * Features (all opt-in, dependency-free CSS+JS injected into the CMS):
 *  - {@link \XD\BetterForms\Forms\GridLayoutField}: a CompositeField that lays its children out on
 *    the admin's Bootstrap 5 grid (`.row` + `.col-*`).
 *  - A fluent API on every FormField (see {@link \XD\BetterForms\Extension\FormFieldExtension}):
 *    setTooltip(), convertDescriptionToTooltip(), setLabelColor(), setFieldColor(),
 *    setFieldBackground(), setFieldBorderColor().
 */
class BetterForms
{
    use Configurable;
    use Injectable;
    use Extensible;

    /**
     * Turn every field's description into an (i) tooltip after its label.
     */
    private static bool $descriptions_as_tooltips = false;

    /**
     * CMS font-icon for the tooltip trigger, without the `font-icon-` prefix
     * (e.g. `info-circled`, `help-circled`). A `fa-*` value is rendered as a Font Awesome icon.
     */
    private static string $info_icon = 'info-circled';

    /**
     * Load Font Awesome Free (from cdnjs) into the CMS — only needed when using fa-* info icons.
     */
    private static bool $include_fontawesome_free = false;

    /**
     * A custom Font Awesome CSS/kit URL (Pro). Overrides include_fontawesome_free when set.
     */
    private static string $fontawesome_css = '';

    private const FA_FREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';

    /**
     * The Font Awesome stylesheet URL to load, or '' when none is needed.
     */
    public static function fontAwesomeCss(): string
    {
        $custom = (string) static::config()->get('fontawesome_css');
        if ($custom !== '') {
            return $custom;
        }
        return static::config()->get('include_fontawesome_free') ? self::FA_FREE_CDN : '';
    }
}
