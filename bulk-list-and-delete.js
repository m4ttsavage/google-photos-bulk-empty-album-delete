const albumsUrl = 'https://photos.google.com/albums';
const albumCards = 'css=a.MTmRkb';

// Deletes only albums whose card text contains "No items".
// Before deletion, the complete matching list is shown and requires exact APPROVE.
// Navigates to each empty album's direct URL for explicit album deletion
// A 1-second pause follows each confirmed deletion for monitoring.
uiv.goto(albumsUrl);

function scrollAlbumsToEnd() {
  for (let i = 0; i < 60; i++) {
    const before = uiv.evaluate('return document.body.innerText');
    uiv.evaluate(`const els = Array.from(document.querySelectorAll('*')).filter(e => { const s = getComputedStyle(e); return (s.overflowY === 'auto' || s.overflowY === 'scroll') && e.scrollHeight > e.clientHeight; }); els.sort((a,b) => b.scrollHeight - a.scrollHeight); if (els.length) { const e = els[0]; e.scrollTop = e.scrollHeight; } else { window.scrollTo(0, document.documentElement.scrollHeight); } return true`);
    uiv.sleep(400);
    const after = uiv.evaluate('return document.body.innerText');
    if (/Finished loading albums/i.test(after) || (after === before && i > 5)) break;
  }
}

function findEmptyAlbums() {
  const cards = uiv.findElements(albumCards, {timeout: 15, includeHidden: true});
  return cards.filter(card => /No\s+items/i.test((card.text || '').replace(/\s+/g, ' ').trim()));
}

scrollAlbumsToEnd();
const plannedCards = findEmptyAlbums();
if (!plannedCards.length) {
  throw new Error('No empty albums matching "No items" were found; nothing was changed');
}

const planned = plannedCards.map((card, index) => {
  const text = (card.text || '').replace(/\s+/g, ' ').trim();
  const name = text.replace(/\s+No\s+items[\s\S]*$/i, '').trim() || '(unnamed album)';
  return {index: index + 1, name, itemCount: 0, href: card.getAttribute('href')};
});
const planText = planned.map(album => `${album.index}. ${album.name} — ${album.itemCount} items`).join('\n');
const planFile = uiv.text.write('empty_album_deletion_plan.txt', planText);
const planShot = uiv.shot.viewport('empty_album_deletion_plan.png');
uiv.log(`Deletion approval list (${planned.length} album(s)):\n${planText}`, 'blue');
uiv.log(`Plan saved to ${planFile}; screenshot saved to ${planShot}`, 'blue');
uiv.banner(`<b>Review deletion list</b><br>${planned.length} empty album(s) found.<br>Type APPROVE in the prompt to continue.`, {seconds: 0});

uiv.run('prompt', `Approve deleting exactly these albums? Type APPROVE exactly to continue.\n\n${planText}@`, 'deletionApproval');
const approval = uiv.getVar('deletionApproval', '').trim();
uiv.banner('');
if (approval !== 'APPROVE') {
  uiv.exit('Deletion cancelled: explicit approval was not entered.');
}
uiv.log('Explicit approval received; beginning deletion phase.', 'green');

let deleted = 0;
for (let attempt = 1; attempt <= 100; attempt++) {
  scrollAlbumsToEnd();
  const emptyAlbum = findEmptyAlbums()[0];
  if (!emptyAlbum) {
    uiv.log(`Finished: deleted ${deleted} empty album(s); no matching albums remain.`, 'green');
    break;
  }

  const albumText = (emptyAlbum.text || '').replace(/\s+/g, ' ').trim();
  const albumName = albumText.replace(/\s+No\s+items[\s\S]*$/i, '').trim() || '(unnamed album)';
  const href = emptyAlbum.getAttribute('href');
  if (!href) throw new Error(`The selected empty album has no navigable link: ${albumName}`);
  const albumUrl = new URL(href, albumsUrl).href;
  uiv.log(`Deleting ${deleted + 1}: ${albumName}`, 'orange');
  uiv.goto(albumUrl);

  const landedUrl = uiv.evaluate('return location.href');
  if (!landedUrl.includes('/album/')) {
    throw new Error(`Failed to open the selected empty album: ${albumName}`);
  }

  const optionsButton = uiv.getByRole('button', {name: 'More options', timeout: 10});
  uiv.browser.click(optionsButton);
  const deleteItems = uiv.findElements('css=[role="menuitem"]', {hasText: 'Delete', timeout: 5});
  if (!deleteItems.length) throw new Error(`Delete action was unavailable for ${albumName}`);
  uiv.browser.click(deleteItems[0]);

  const confirmDelete = uiv.getByRole('button', {name: 'Delete', exact: true, timeout: 5});
  uiv.browser.click(confirmDelete);
  uiv.sleep(1000);

  const currentUrl = uiv.evaluate('return location.href');
  if (!currentUrl.includes('/albums')) {
    uiv.goto(albumsUrl);
  }
  uiv.sleep('1s');
  deleted++;
}

if (deleted === 0) {
  throw new Error('Approval was received, but no empty albums were deleted');
}
uiv.log(`Completed monitored deletion run: ${deleted} empty album(s) deleted.`, 'green');
