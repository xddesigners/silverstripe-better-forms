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

        Requirements::customScript(
            'window.__betterFormsDescTooltips = ' . $descTooltips . ';'
            . 'window.__betterFormsInfoIcon = ' . json_encode($infoIcon) . ';',
            'better-forms-config'
        );
    }
}
