<?php

namespace XD\BetterForms\Forms;

use SilverStripe\Forms\CompositeField;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\FormField;

/**
 * A CompositeField that lays its children out on the CMS admin's Bootstrap 5 grid.
 *
 * The holder renders as a Bootstrap `.row`; each child field holder is given a `.col-*` class so
 * the fields sit in responsive columns. No template overrides and no extra markup — it drives the
 * grid that silverstripe/admin already ships.
 *
 *   GridLayoutField::create('Details', [
 *       TextField::create('FirstName', 'First name'),
 *       TextField::create('LastName', 'Last name'),
 *   ])->setColumns(['FirstName' => 6, 'LastName' => 6]);
 *
 *   // or add fields with their span inline (int = span at the default breakpoint,
 *   // array = per-breakpoint, e.g. ['md' => 8, 'lg' => 4]):
 *   GridLayoutField::create('Row')
 *       ->addColumn(TextField::create('Street'), ['md' => 8])
 *       ->addColumn(TextField::create('Nr'), ['md' => 4]);
 */
class GridLayoutField extends CompositeField
{
    /**
     * Bootstrap gutter class applied to the row (horizontal + vertical spacing between columns).
     */
    protected string $gutter = 'g-3';

    /**
     * Breakpoint used when a column span is given as a bare int (e.g. 6 -> col-md-6).
     */
    protected string $defaultBreakpoint = 'md';

    /**
     * @param string|array|FieldList|FormField|null $nameOrChildren A name, or the children.
     * @param array|FieldList|FormField|null        $children        The children (when a name is given).
     */
    public function __construct($nameOrChildren = null, $children = null)
    {
        if (is_string($nameOrChildren)) {
            $name = $nameOrChildren;
            $kids = $children;
        } else {
            $name = null;
            $kids = $nameOrChildren;
        }

        if (!$kids instanceof FieldList) {
            $kids = new FieldList($kids === null ? [] : (is_array($kids) ? $kids : [$kids]));
        }

        parent::__construct($kids);

        if ($name !== null) {
            $this->setName($name);
        }

        $this->applyRowClasses();
    }

    protected function applyRowClasses(): void
    {
        $this->addExtraClass(trim('row bf-grid ' . $this->gutter));
    }

    /**
     * Assign column spans to existing children by field name.
     *
     * @param array<string,int|array<string,int>> $map FieldName => span (int) or [breakpoint => span].
     */
    public function setColumns(array $map): static
    {
        foreach ($map as $fieldName => $span) {
            $child = $this->fieldByName($fieldName);
            if ($child instanceof FormField) {
                $this->applyColumnClasses($child, $span);
            }
        }
        return $this;
    }

    /**
     * Push a field into the grid with its column span.
     *
     * @param int|array<string,int> $span
     */
    public function addColumn(FormField $field, int|array $span): static
    {
        $this->applyColumnClasses($field, $span);
        $this->push($field);
        return $this;
    }

    /**
     * Set the Bootstrap gutter class (e.g. 'g-0', 'g-2', 'gx-4 gy-2').
     */
    public function setGutter(string $gutter): static
    {
        // Swap the gutter class out on the holder.
        $this->removeExtraClass($this->gutter);
        $this->gutter = $gutter;
        $this->addExtraClass($gutter);
        return $this;
    }

    /**
     * The breakpoint used for bare-int spans (default 'md'). Use 'xs' for always-on columns.
     */
    public function setBreakpoint(string $breakpoint): static
    {
        $this->defaultBreakpoint = $breakpoint;
        return $this;
    }

    /**
     * @param int|array<string,int> $span
     */
    protected function applyColumnClasses(FormField $field, int|array $span): void
    {
        $classes = [];
        if (is_array($span)) {
            foreach ($span as $breakpoint => $cols) {
                $classes[] = $this->columnClass((string) $breakpoint, (int) $cols);
            }
        } else {
            $classes[] = $this->columnClass($this->defaultBreakpoint, $span);
        }
        $field->addExtraClass(implode(' ', array_filter($classes)));
    }

    protected function columnClass(string $breakpoint, int $cols): string
    {
        $breakpoint = strtolower($breakpoint);
        // 'xs' is Bootstrap's base (no infix): col-6, not col-xs-6.
        return ($breakpoint === '' || $breakpoint === 'xs')
            ? "col-{$cols}"
            : "col-{$breakpoint}-{$cols}";
    }
}
