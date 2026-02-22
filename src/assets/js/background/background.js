import {upperCaseFirst} from '../helpers';

// Inject debugAPI into main world when requested
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.injectDebugAPI) {
    const tabId = sender.tab && sender.tab.id;
    if (!tabId) {
      sendResponse({success: false, error: 'No tab ID'});
      return false;
    }

    const methods = ['addTag', 'bulkTag', 'getTags', 'removeTag', 'listAllTags', 'getReposByTag'];

    chrome.scripting.executeScript({
      target: {tabId: tabId},
      world: 'MAIN',
      func: (methodNames) => {
        console.log('[debugAPI] Injecting into main world via scripting API...');
        window.debugAPI = {};
        methodNames.forEach((method) => {
          window.debugAPI[method] = function(...args) {
            return new Promise((resolve) => {
              const requestId = method + '_' + Date.now();
              window.postMessage({
                type: 'DEBUG_API_CALL',
                method,
                args,
                requestId,
              }, '*');
              window.addEventListener('message', function handler(e) {
                if (e.data.type === 'DEBUG_API_RESPONSE' &&
                    e.data.requestId === requestId) {
                  window.removeEventListener('message', handler);
                  resolve(e.data.result);
                }
              });
            });
          };
        });
        console.log('[debugAPI] Main world injection complete');
      },
      args: [methods],
    }).then(() => {
      sendResponse({success: true});
    }).catch((error) => {
      sendResponse({success: false, error: error.message});
    });

    return true; // Keep channel open for async response
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.createJson) {
    // MV3: Use chrome.tabs.create instead of window.open
    let jsonTags = JSON.stringify(request.createJson, null, 2);
    let dataUrl = 'data:text/html;charset=utf-8,' +
      encodeURIComponent(`<html><body><pre>${jsonTags}</pre></body></html>`);
    chrome.tabs.create({url: dataUrl});
    sendResponse({jsonCreated: 'JSON created successfully!'});
    return false;
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
              'title': `${tagAndRelatedRepo.name} ${repoDesc ? `| ${repoDesc}` : ''}`,
              'url': tagAndRelatedRepo.html_url,
            });
          });
        });
      });
      sendResponse({bookmarkCreated: 'Bookmarks created successfully!'});
    });
    return true; // Keep channel open for async response
  }
  return false;
});
