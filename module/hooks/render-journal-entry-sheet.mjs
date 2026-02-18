export default function (application, html, data) {
  if ((application.document.getFlag('brp', 'css-adventure-entry') ?? false)) {
    if (!html.classList.contains('css-adventure-entry')) {
      html.classList.add('css-adventure-entry')
    }
    if ((application.document.getFlag('brp', 'fixed-adventure-heading') ?? false) && !html.classList.contains('fixed-adventure-heading')) {
      html.classList.add('fixed-adventure-heading')
      if (typeof data.pages?.[0]?.id === 'string') {
        const subheading = application.document.pages.get(data.pages[0].id)?.flags?.brp?.['fixed-adventure-subheading'] ?? ''
        if (subheading === '') {
          const div = document.createElement('div')
          div.style.padding = '0.5em'
          document.querySelector('article.journal-entry-page.text.level1')?.before(div)
        } else {
          const short = subheading.trim().length === 0
          const div = document.createElement('div')
          div.classList.add('adventure-heading-section', 'flexrow-css')
          div.innerHTML = '<div class="bookmark' + (short ? ' short' : '') + '"><img src="systems/brp/assets/' + (short ? 'bookmarks.webp' : 'bookmark.webp') + '"></div><div class="adventure-heading"><div class="heading">' + application.title + '</div>' + (short ? '' : '<div class="subheading">' + subheading + '</div>') + '</div>'
          document.querySelector('article.journal-entry-page.text.level1')?.before(div)
        }
      }
    }
  }
}
