import {GH} from '../constants';
import * as axios from 'axios';
import {StarredReposCacheMngr} from './storageSync/StarredReposCacheMngr';
import {SettingsMngr} from './storageSync/SettingsMngr';

// repoIDByName = 'https://api.github.com/repos/[USER]/[REPO]';
// repoAPIByID = 'https://api.github.com/repositories/[ID]';

/**
 * Get code url parameter
 * @param {String} url current URL
 * @return {String|Boolean}
 */
export function getCodeFromURL(url) {
  let error = url.match(/[&?]error=([^&]+)/);
  if (error) {
    throw new Error(`Error getting authorization code: ${error[1]}`);
  }
  if (url.match(/[&?]code=([\w\/\-]+)/)) {
    return url.match(/[&?]code=([\w\/\-]+)/)[1];
  }
  return false;
}

/**
 * Get User details
 * @param {String} accessToken
 * @return {Promise} userDetails
 */
export async function getUserDetails(accessToken) {
  let userDetails;
  const apiUser = `${GH.API}user`;

  try {
    userDetails = await axios.get(apiUser, {
      headers: {'Authorization': `Bearer ${accessToken}`},
    });
  } catch (error) {
    throw error;
  }
  return userDetails;
}

/**
 * Get user starred repositories
 * @param {String} accessToken
 * @return {Array} userDetails
 */
export async function getUserStarredRepos(accessToken) {
  const settings = await SettingsMngr.getSettings();
  const cache = await StarredReposCacheMngr.getCache();

  if (cache && cache.repos && cache.timestamp &&
      (cache.timestamp + settings.cacheDurationMs) > Date.now()) {
    return cache.repos;
  }

  const apiStarredRepos = `${GH.API}user/starred?per_page=100`;

  let page = 1;
  let allStars = [];
  let data;

  do {
    try {
      data = (await axios.get(`${apiStarredRepos}&page=${page}`, {
        headers: {'Authorization': `Bearer ${accessToken}`},
      })).data;
      allStars = allStars.concat(data);
    } catch (error) {
      throw error;
    }
    page++;
  } while (data.length);

  await StarredReposCacheMngr.setCache(allStars);
  return allStars;
}
