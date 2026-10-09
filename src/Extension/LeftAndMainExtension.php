<?php

namespace XD\BetterForms\Extension;

use SilverStripe\Core\Extension;
use SilverStripe\View\Requirements;
use XD\BetterForms\BetterForms;

/**
 * Loads the module's CSS/JS into the CMS and exposes its config to the client script.
 *
 * @extends Extension<\SilverStripe\Admin\LeftAndMain>
 */
class LeftAndMainExtension extends Extension
{
    protected function onAfterInit(): void
    {
        $css = BetterForms::fontAwesomeCss();
        if ($css !== '') {
            Requirements::css($css);
        }

        $descTooltips = BetterForms::config()->get('descriptions_as_tooltips') ? 'true' : 'false';
        $infoIcon = (string) BetterForms::config()->get('info_icon') ?: 'info-circled';
        $contrastWarnings = BetterForms::config()->get('contrast_warnings') ? 'true' : 'false';
        $requiredMarkers = BetterForms::config()->get('required_markers') ? 'true' : 'false';
        // Localised legend for the required-field asterisk (shown at the bottom of each tab with a
        // required field). The literal `*` is kept so the client can style it like the field markers.
        $requiredLegend = _t(BetterForms::class . '.REQUIRED_LEGEND', 'Fields marked with an * are required');

        Requirements::customScript(
            'window.__betterFormsDescTooltips = ' . $descTooltips . ';'
            . 'window.__betterFormsInfoIcon = ' . json_encode($infoIcon) . ';'
            . 'window.__betterFormsContrastWarnings = ' . $contrastWarnings . ';'
            . 'window.__betterFormsRequiredMarkers = ' . $requiredMarkers . ';'
            . 'window.__betterFormsRequiredLegend = ' . json_encode($requiredLegend) . ';',
            'better-forms-config'
        );
    }
}
