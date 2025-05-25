export class BRPContextMenu extends foundry.applications.ux.ContextMenu.implementation {
  constructor(element, selector, menuItems, options = {}) {
    super(element, selector, menuItems, options);

  }

  /** @inheritdoc */
  static create(app, element, selector, items, { hookName = "EntryContext", ...options } = {}) {
    options.fixed ??= true;
    app._callHooks?.(className => `get${className}${hookName}`, items);
    return new this(element, selector, items, options);
  }
}
