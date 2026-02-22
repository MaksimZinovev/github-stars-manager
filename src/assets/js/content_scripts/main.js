import { $ } from '../helpers';
import { HASH } from '../constants';
import '../../style/main.styl';
import { initStorage, getAccessTokenFromStorage } from './storageSync/initStorageSync';
import { StoredGenericMngr } from './storageSync/StoredGenericMngr';
import { StoredTagsMngr } from './storageSync/StoredTagsMngr';
import { addHeaderTagMenu, updateSidebarInTagPage } from './dom/uiTagPage';

const DEBUG = localStorage.getItem('DEBUG') === '1';
DEBUG && console.log('[main.js] Content script starting...');

import './debugAPI'; // Side effect: registers window.debugAPI
import {
  insertBtCreateTag,
  insertFooterTags,
  insertLoader,
  removeLoader,
  displayLoaderWithMessage,
} from './dom/uiFooterTagsInRepo';
import { initDOM } from './dom/initDom';
import {
  getUserDetails,
  getUserStarredRepos,
} from './githubAPI';

init();

/**
 * Function responsible for all initialization
 */
function init() {
  StoredTagsMngr.checkForTagsNotBeingUsed();
  initStorage();
  createTagsInStarsPage();
  initDOM();
}

let setIntervalToCheckURL;

/**
 * Checks if URL is User Home and if it is Star tab, or stars section
 * of the User
 * @return {Boolean}
 */
export async function createTagsInStarsPage() {
  if (setIntervalToCheckURL) {
    clearInterval(setIntervalToCheckURL);
  }
  let token = await getAccessTokenFromStorage();
  let userDetails;
  try {
    userDetails = await getUserDetails(token);
  } catch (error) {
    checkCodeParamAndSaveToken();
    return false;
  }
  addHeaderTagMenu();
  let headerTagLink = document.querySelector('.ghstarmngr-tag-header-link');
  if (headerTagLink) {
    headerTagLink.setAttribute('href', `${userDetails.data.html_url}?tab=stars${HASH.HOME}`);
  }

  if (isUserHome(userDetails) || isUserInStars()) {
    insertLoader('Loading tags...');
    if ($('.ghstarsmngr-sidebar-tag-list')) {
      $('.ghstarsmngr-sidebar-tag-list').innerHTML = displayLoaderWithMessage('Loading tags...');
    }
    let starredRepos = await getUserStarredRepos(token);
    let reposInStorage = await StoredGenericMngr.read('r');
    let tagsInStorage = await StoredGenericMngr.read('t');
    removeLoader();
    if ($('.ghstarsmngr-sidebar-tag-list')) {
      updateSidebarInTagPage(starredRepos, reposInStorage, tagsInStorage);
    }
    insertBtCreateTag(starredRepos);
    insertFooterTags(starredRepos, reposInStorage, tagsInStorage);
    intervalToCheckURL(starredRepos, reposInStorage, tagsInStorage);
  }
}

/**
 * @param {Object} starredRepos
 * @param {Object} reposInStorage
 * @param {Object} tagsInStorage
 * @return {Object}
 */
function intervalToCheckURL(starredRepos, reposInStorage, tagsInStorage) {
  let cachedLocationSearch;
  let intervalToCheckIfURLChanges = 500;
  setIntervalToCheckURL = setInterval(function() {
    let headerLink = $('.ghstarmngr-tag-header-link');
    if (window.location.hash.indexOf(HASH.HOME) > -1) {
      if (headerLink) headerLink.classList.add('active-menu-header');
      document.querySelectorAll('.underline-nav-item').forEach((navItem) => {
        navItem.classList.remove('selected');
      });
    } else {
      if (headerLink) headerLink.classList.remove('active-menu-header');
    }
    if (location.search.indexOf('tab=stars') > -1) {
      let changedTabsInStar = location.search !== cachedLocationSearch;
      let hashNoLongerExist = window.location.hash.indexOf(HASH.HOME) < 0;
      if (changedTabsInStar || hashNoLongerExist) {
        insertBtCreateTag(starredRepos);
        insertFooterTags(starredRepos, reposInStorage, tagsInStorage);
      }
    }
    cachedLocationSearch = location.search;
  }, intervalToCheckIfURLChanges);
  return setIntervalToCheckURL;
}

/**
 * Checks if user is in the stars page /stars
 * @return {Boolean}
 */
function isUserInStars() {
  return location.href.indexOf('https://github.com/stars') > -1;
}

/**
 * Check if user is in any section of its Github home page
 * @param {Object} userDetails
 * @return {boolean}
 */
function isUserHome(userDetails) {
  const userDetailsData = userDetails.data;
  const cleanPathName = location.pathname.replace(/\//g, '');
  return userDetailsData.login === cleanPathName;
}

/**
 * Show modal to input Personal Access Token
 */
function showPATModal() {
  const existingModal = document.getElementById('ghstarmngr-pat-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'ghstarmngr-pat-modal';
  const overlayStyle = 'position:fixed;top:0;left:0;right:0;bottom:0;' +
    'background:rgba(0,0,0,0.7);z-index:999999;display:flex;' +
    'align-items:center;justify-content:center;';
  const boxStyle = 'background:#0d1117;border:1px solid #30363d;' +
    'border-radius:8px;padding:24px;max-width:480px;width:90%;color:#c9d1d9;';
  const inputStyle = 'width:100%;padding:10px 12px;border:1px solid #30363d;' +
    'border-radius:6px;background:#161b22;color:#c9d1d9;font-size:14px;' +
    'box-sizing:border-box;margin-bottom:16px;';
  const btnStyle = 'background:#238636;color:#fff;border:none;' +
    'padding:8px 16px;border-radius:6px;font-size:14px;cursor:pointer;';
  const linkStyle = 'color:#58a6ff;font-size:14px;text-decoration:none;';
  const flexStyle = 'display:flex;gap:12px;justify-content:flex-end;' +
    'align-items:center;';

  modal.innerHTML = `
    <div style="${overlayStyle}">
      <div style="${boxStyle}">
        <h2 style="margin:0 0 12px 0;color:#f0f6fc;font-size:20px;">
          GitHub Stars Manager
        </h2>
        <p style="margin:0 0 16px 0;color:#8b949e;font-size:14px;">
          Enter your GitHub Personal Access Token.
        </p>
        <input type="text" id="ghstarmngr-pat-input"
          placeholder="github_pat_xxxx..." style="${inputStyle}">
        <div style="${flexStyle}">
          <a href="https://github.com/settings/tokens?type=beta" target="_blank"
            style="${linkStyle}">Create Token</a>
          <button id="ghstarmngr-pat-save" style="${btnStyle}">Save</button>
        </div>
        <p id="ghstarmngr-pat-error"
          style="color:#f85149;font-size:12px;margin:12px 0 0 0;display:none;">
        </p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const input = document.getElementById('ghstarmngr-pat-input');
  const saveBtn = document.getElementById('ghstarmngr-pat-save');
  const errorEl = document.getElementById('ghstarmngr-pat-error');

  saveBtn.addEventListener('click', async () => {
    const pat = input.value.trim();
    if (!pat) {
      errorEl.textContent = 'Please enter a token';
      errorEl.style.display = 'block';
      return;
    }

    try {
      const testResponse = await fetch('https://api.github.com/user', {
        headers: {'Authorization': `Bearer ${pat}`},
      });
      if (!testResponse.ok) {
        throw new Error('Invalid token');
      }
      await StoredGenericMngr.createOrUpdate('token', pat);
      modal.remove();
      window.location.reload();
    } catch (error) {
      errorEl.textContent = 'Invalid token. Please check and try again.';
      errorEl.style.display = 'block';
    }
  });
}

/**
 * Show PAT input modal if no token is stored
 */
export async function checkCodeParamAndSaveToken() {
  showPATModal();
}
