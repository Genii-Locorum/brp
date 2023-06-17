export class BRPContextMenu extends ContextMenu
{
   /**
    * @inheritDoc
    * @override
    */
   constructor(element, selector, menuItems, options = {})
   {
      super(element, selector, menuItems, options);
   }

   /**
    * Stores the pageX / pageY position from the the JQuery event to be applied in `_setPosition`.
    *
    * @inheritDoc
    * @override
    */
   bind()
   {
      this.element.on(this.eventName, this.selector, (event) =>
      {
         event.preventDefault();

         /**
          * @type {{top: number, left: number}}
          * @private
          */
         this._position = { left: event.pageX, top: event.pageY };
      });
      super.bind();
   }

   /**
    * Delegate to the parent `_setPosition` then apply the stored position from the callback in `bind`.
    *
    * @inheritDoc
    * @override
    */
   _setPosition(html, target)
   {
      super._setPosition(html, target);
      html.css(foundry.utils.mergeObject(this._position, s_DEFAULT_STYLE));
   }
}

/**
 * Defines the default CSS styles for the context menu.
 *
 * @type {{"box-shadow": string, width: string, "font-size": string, "font-family": string, position: string}}
 */
const s_DEFAULT_STYLE = {
   position: 'fixed',
   width: 'fit-content',
   'font-family': '"Signika", sans-serif',
   'font-size': '14px',
   'box-shadow': '0 0 10px #000'
};