/* eslint-disable camelcase */
import { db_version } from '../package.json'
const DB_NAME = 'his_settlements'
const stores = {}
let localforage = {}

if (location.protocol === 'data:') {
  const _datas = {}
  localforage.createInstance = function ({
    name,
    storeName
  } = {}) {
    _datas[storeName] = _datas[storeName] || {}
    stores[storeName] = {
      getItem: (k) => _datas[storeName][k] || '',
      setItem: (k, v) => {
        _datas[storeName][k] = v
      }
    }
  }
} else {
  import('localforage').then(function (module) {
    localforage = module
    const old_version = localStorage.getItem('cc_db_ver')
    if (old_version !== db_version) {
      // 数据库版本升级，整个数据库重置
      const DBDeleteRequest = indexedDB.deleteDatabase(DB_NAME)
      DBDeleteRequest.onerror = function (event) {
        console.log('Error deleting database.')
      }
      DBDeleteRequest.onsuccess = function (event) {
        localStorage.setItem('cc_db_ver', db_version)
      }
    }
  })
}

export default {
  getContent (userId, tradingDay) {
    if (stores[userId] === undefined) {
      stores[userId] = localforage.createInstance({
        name: DB_NAME,
        storeName: userId
      })
    }
    return stores[userId].getItem(String(tradingDay))
  },
  setContent (userId, tradingDay, content) {
    if (stores[userId] === undefined) {
      stores[userId] = localforage.createInstance({
        name: DB_NAME,
        storeName: userId
      })
    }
    return stores[userId].setItem(String(tradingDay), content)
  }
}
