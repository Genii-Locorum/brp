/* global $ */
export default function (application, html, data) {
  if ((application.document.getFlag('brp', 'css-adventure-entry') ?? false)) {
    if (!html.hasClass('css-adventure-entry')) {
      html.addClass('css-adventure-entry')
    }
    if ((application.document.getFlag('brp', 'fixed-adventure-heading') ?? false) && !html.hasClass('fixed-adventure-heading')) {
      const obj = $(html)
      obj.addClass('fixed-adventure-heading')
      const subheading = data.pages?.[0]?.flags?.brp?.['fixed-adventure-subheading'] ?? ''
    }
  }
}
