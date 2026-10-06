# Silverstripe Better Forms

Nicer CMS forms, three ways:

1. **Grid layout** — lay fields out in responsive columns with a `GridLayoutField`, driving the
   Bootstrap 5 grid that `silverstripe/admin` already ships.
2. **Help tooltips** — a small **(i)** icon after a field label that reveals an explanation on
   hover/focus, from `setTooltip()` or by converting a field's description.
3. **Field styling** — set a field's **label colour** and the **text / background / outline**
   colour of its input, with a chainable PHP API.

Dependency-free (a little CSS + JS injected into the CMS). No `dev/build` needed for the styling/
tooltip features; the grid field is a normal form field.

## Requirements

- `silverstripe/framework` ^6.0
- `silverstripe/admin` ^3.0

## Installation

```sh
composer require xddesigners/silverstripe-better-forms
```

## 1. Grid layout

`GridLayoutField` is a `CompositeField` whose children are placed in Bootstrap columns. Give it
fields and a column map, or add fields with their span inline.

```php
use XD\BetterForms\Forms\GridLayoutField;
use SilverStripe\Forms\TextField;

$fields->addFieldToTab('Root.Main', GridLayoutField::create('NameRow', [
    TextField::create('FirstName', 'First name'),
    TextField::create('LastName', 'Last name'),
])->setColumns([
    'FirstName' => 6,   // col-md-6
    'LastName'  => 6,
]));
```

Spans may be a bare int (applied at the default breakpoint, `md`) or a per-breakpoint map:

```php
GridLayoutField::create('Address')
    ->addColumn(TextField::create('Street'), ['md' => 8, 'lg' => 9])
    ->addColumn(TextField::create('Number'), ['md' => 4, 'lg' => 3]);
```

Helpers:

| Method | Does |
| --- | --- |
| `setColumns(['Field' => 6, ...])` | Assign spans to existing children by name. |
| `addColumn($field, 6 \| ['md'=>8])` | Push a field with its span. |
| `setGutter('g-3')` | Bootstrap gutter class for the row (default `g-3`; e.g. `g-0`, `gx-4 gy-2`). |
| `setBreakpoint('md')` | Breakpoint used for bare-int spans (use `xs` for always-on columns). |

Nest `GridLayoutField`s for more complex layouts. Columns stack on narrow screens, per Bootstrap.

### Bonus: `setColumnCount()` works again

Silverstripe's native `CompositeField::setColumnCount(n)` lost its layout CSS in `silverstripe/admin`
3.x. This module re-ships it, so the zero-config equal-columns option works too:

```php
CompositeField::create($fieldA, $fieldB, $fieldC)->setColumnCount(3);
```

## 2. Help tooltips

Add an **(i)** icon after any field's label:

```php
TextField::create('VAT', 'VAT number')
    ->setTooltip('Include the country prefix, e.g. NL123456789B01');
```

Prefer to reuse the field's existing description as the tooltip (keeps the form uncluttered):

```php
TextField::create('Slug')
    ->setDescription('Lowercase, no spaces — used in the URL.')
    ->convertDescriptionToTooltip();
```

…or do that for **every** field in the CMS, from YAML:

```yaml
XD\BetterForms\BetterForms:
  descriptions_as_tooltips: true
```

The icon is a CMS font-icon (`info-circled` by default). Change it globally or per field:

```yaml
XD\BetterForms\BetterForms:
  info_icon: 'help-circled'
```

```php
$field->setInfoIcon('help-circled');          // another CMS font-icon
$field->setInfoIcon('fa-solid fa-circle-info'); // or Font Awesome (see below)
```

## 3. Field styling

Chainable colour setters on any field:

```php
TextField::create('Price', 'Price')
    ->setLabelColor('#c0392b')     // the label
    ->setFieldColor('#111')        // input text colour
    ->setFieldBackground('#fffbea')// input background
    ->setFieldOutline('#c0392b');  // input border colour
```

Works on text inputs, textareas and selects (including Chosen-enhanced dropdowns).

## Font Awesome (optional)

Only needed if you pass `fa-*` classes to `setInfoIcon()`.

```yaml
XD\BetterForms\BetterForms:
  include_fontawesome_free: true                 # Font Awesome Free from cdnjs
  # fontawesome_css: 'https://kit.fontawesome.com/XXXX.css'  # …or your own Pro kit
```

## Theming (CSS variables)

Override the tooltip look in your admin CSS:

```css
:root {
    --bf-tip-bg: #43536d;
    --bf-tip-color: #fff;
    --bf-tip-max-width: 260px;
}
```

## License

BSD-3-Clause.
