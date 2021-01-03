/* eslint-disable prefer-const */
import EventEmitter from 'eventemitter3'
import { Quote } from './datastructure'
import { IsEmptyObject } from './utils'

class DataManager extends EventEmitter {
  constructor (data = {}) {
    super()
    this._epoch = 0 // 数据版本控制
    this._data = data
    this._diffs = []
  }

  mergeData (source, epochIncrease = true, deleteNullObj = true) {
    const sourceArr = Array.isArray(source) ? source : [source]
    if (epochIncrease) {
      // 如果 _epoch 需要增加，就是需要记下来 diffs
      this._epoch += 1
      this._diffs = sourceArr
    }
    for (const item of sourceArr) {
      // 过滤掉空对象
      if (item === null || IsEmptyObject(item)) continue
      this._mergeObject(this._data, item, this._epoch, deleteNullObj)
    }
    if (epochIncrease && this._data._epoch === this._epoch) {
      this.emit('data', null)
    }
  }

  _mergeObject (target, source, _epoch = 0, deleteNullObj = true) {
    for (const property in source) {
      const value = source[property]
      const type = typeof value
      /**
       * 1 'string', 'boolean', 'number'
       * 2 'object' 包括了 null , Array, {} 服务器不会发送 Array
       * 3 'undefined' 不处理
       */
      if (['string', 'boolean', 'number'].includes(type)) {
        target[property] = value === 'NaN' ? NaN : value
      } else if (value === null && deleteNullObj) {
        delete target[property] // 服务器 要求 删除对象
      } else if (Array.isArray(value)) {
        target[property] = value // 如果是数组类型就直接替换，并且记录 _epoch
        if (!value._epoch) {
          Object.defineProperty(value, '_epoch', {
            configurable: false,
            enumerable: false,
            writable: true
          })
        }
        value._epoch = _epoch
      } else if (type === 'object') {
        // @note: 这里做了一个特例, 使得 K 线序列数据被保存为一个 array, 而非 object
        target[property] = target[property] || (property === 'data' ? [] : {})
        // quotes 对象单独处理
        if (property === 'quotes') {
          for (const symbol in value) {
            const quote = value[symbol] // source[property]
            if (quote === null) {
              // 服务器 要求 删除对象
              if (deleteNullObj && symbol) delete target[property][symbol]
              continue
            } else if (!target[property][symbol]) {
              target[property][symbol] = new Quote()
            }
            this._mergeObject(target[property][symbol], quote, _epoch, deleteNullObj)
          }
        } else {
          this._mergeObject(target[property], value, _epoch, deleteNullObj)
        }
      }
    }
    if (!target._root) {
      Object.defineProperty(target, '_root', {
        value: this._data,
        configurable: false,
        enumerable: false,
        writable: false
      })
    }
    // _epoch 不应该被循环到的 key
    if (!target._epoch) {
      Object.defineProperty(target, '_epoch', {
        configurable: false,
        enumerable: false,
        writable: true
      })
    }
    target._epoch = _epoch
  }

  /**
   * 判断 某个路径下 或者 某个数据对象 最近有没有更新
   * @param {Array | Object} pathArray | object
   */
  isChanging (pathArray) {
    // _data 中，只能找到对象类型中记录的 _epoch
    if (Array.isArray(pathArray)) {
      let d = this._data
      for (let i = 0; i < pathArray.length; i++) {
        d = d[pathArray[i]]
        if (d === undefined) return false
        if (d._epoch && d._epoch === this._epoch) return true
      }
      return false
    } else if (pathArray && pathArray._epoch) {
      return pathArray._epoch === this._epoch
    }
    return false
  }

  setDefault (pathArray, defaultValue = {}, root = this._data) {
    let node = root
    for (let i = 0; i < pathArray.length; i++) {
      if (typeof pathArray[i] !== 'string' && typeof pathArray[i] !== 'number') {
        console.error('SetDefault, pathArray 中的元素必須是 string or number, but pathArray = ', pathArray)
        break
      }
      let _key = pathArray[i]
      if (!(_key in node)) {
        node[_key] = (i === pathArray.length - 1) ? defaultValue : {}
      }
      if (i === pathArray.length - 1) {
        return node[_key]
      } else {
        node = node[_key]
      }
    }
    return node
  }

  getByPath (pathArray, root = this._data) {
    let d = root
    for (let i = 0; i < pathArray.length; i++) {
      d = d[pathArray[i]]
      if (d === undefined || d === null) return null
    }
    return d
  }
}

export default DataManager
