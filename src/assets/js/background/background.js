import {upperCaseFirst} from '../helpers';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.createJson) {
    let jsonTags = JSON.stringify(request.createJson, null, 2);
    let newTab = window.open();
    newTab.document.open();
    newTab.document.write(`<html><body><pre>${jsonTags}</pre></body></html>`);
    newTab.document.close();
    sendResponse({jsonCreated: 'JSON created successfully!'});
  } else if (request.createBookmark) {
    chrome.bookmarks.create({
      'parentId': '1',
      'title': 'Github Favorites',
    }, (newFolder) => {
      request.createBookmark.map((tagAndRelatedRepos) => {
        chrome.bookmarks.create({
          'parentId': newFolder.id,
          'title': tagAndRelatedRepos.tag ?
            upperCaseFirst(tagAndRelatedRepos.tag.tagName) :
            'Untagged',
        }, (newChildFolder) => {
          tagAndRelatedRepos.repos.map((tagAndRelatedRepo) => {
            let repoDesc = tagAndRelatedRepo.description;
            chrome.bookmarks.create({
              'parentId': newChildFolder.id,
              'title': `${tagAndRelatedRepo.name} ${repoDesc ? `| ${repoDesc }` : ''}`,
              'url': tagAndRelatedRepo.html_url,
            });
          });
        });
      });
    });
  }
  sendResponse({bookmarkCreated: 'Bookmarks created successfully!'});
});
