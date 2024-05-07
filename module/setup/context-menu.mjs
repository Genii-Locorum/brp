export class BRPContextMenu extends ContextMenu
{
  constructor(element, selector, menuItems, options = {})
  {
    super(element, selector, menuItems, options);
  }

  //Stores the pageX / pageY position from the the JQuery event to be applied in `_setPosition`.
  bind()
  {
    this.element.on(this.eventName, this.selector, (event) =>
    {
      event.preventDefault();
      this._position = { left: event.pageX, top: event.pageY };
    });


    super.bind();
  }

  _setPosition(html, target)
  {
    super._setPosition(html, target);

    //If the projected context menu is going to go off the bottom of the screen then adjust the starting top position
    if (this._position.top  > Math.floor(window.screen.height/2)) {
      this._position.top = this._position.top - html[0].clientHeight
    } 

    html.css(foundry.utils.mergeObject(this._position, s_DEFAULT_STYLE));

  }
}

//Defines the default CSS styles for the context menu.
const s_DEFAULT_STYLE = {
   position: 'fixed',
   width: 'fit-content',
   bottom: '0px',
   'font-family': '"Signika", sans-serif',
   'font-weight': 'normal',
   'font-style': 'normal',
   'text-shadow': 'none',
   'font-size': '14px',
   'box-shadow': '0 0 10px #000',
   'text-transform': 'capitalize',
   'text-align': 'left'
};