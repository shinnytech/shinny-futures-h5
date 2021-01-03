const UnifyArrayStyle = (path, splitSymbol = '/') => {
  if (!Array.isArray(path)) path = path.split(splitSymbol)
  return path.filter(x => x !== '')
}

const IsEmptyObject = (obj) => {
  return obj && obj.constructor === Object && Object.keys(obj).length === 0
}

const RandomStr = (len = 8) => {
  const charts = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  let s = ''
  for (let i = 0; i < len; i++) s += charts[(Math.random() * 0x3e) | 0]
  return s
}
function _genList (str) {
  // string 根据 | 分割为数组
  const list = []
  const items = str.split('|')
  for (let i = 0; i < items.length; i++) {
    const name = items[i].trim()
    // 去掉第一个和最后一个空白
    if (i === 0 && !name) continue
    if (i === items.length - 1 && !name) continue
    list.push(name) // NOTE: 有些竖线之间内容为空
  }
  return list
}

function _genItem (keys, values) {
  // 根据 keys - values 返回 object
  const item = {}
  for (let j = 0; j < keys.length; j++) {
    item[keys[j]] = values[j]
  }
  return item
}

const ParseSettlementContent = (txt = '') => {
  if (txt === '') return txt
  const lines = txt.split('\n')
  let currentSection = '' // AS = Account Summary; T = Transaction Record; PD = Positions Detail
  // 需要处理的表格
  const tableStates = {
    positionClosed: {
      title: '平仓明细 Position Closed',
      colNames: []
    },
    transactionRecords: {
      title: '成交记录 Transaction Record',
      colNames: []
    }
  }
  const result = {
    account: {},
    positionClosed: [],
    transactionRecords: []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.indexOf('资金状况') > -1) {
      currentSection = 'account'
      i++
      continue
    } else if (line.indexOf('平仓明细') > -1 || line.indexOf('成交记录') > -1) {
      currentSection = line.indexOf('平仓明细') > -1 ? 'positionClosed' : 'transactionRecords'
      while (i++) {
        const s = lines[i].trim()
        if (s.replace(/-/g, '') === '') {
          if (tableStates[currentSection].colNames.length === 0) continue
          else break
        } else {
          tableStates[currentSection].colNames = _genList(s)
        }
      }
      continue
    }

    if (currentSection === 'account') {
      if (line.length === 0 || line.replace('-', '') === '') {
        currentSection = '' // 当前table处理完
        continue
      } else {
        // eslint-disable-next-line no-unused-vars
        // const chMatches = line.match(/([\u4e00-\u9fa5][\u4e00-\u9fa5\s]+[\u4e00-\u9fa5])+/g) // 中文
        // eslint-disable-next-line no-useless-escape
        const enMatches = line.match(/([A-Z][a-zA-Z\.\/\(\)\s]+)[:：]+/g) // 英文
        const numMatches = line.match(/(-?[\d]+\.\d\d)/g) // 数字
        for (let j = 0; j < enMatches.length; j++) {
          result.account[enMatches[j].split(/[:：]/)[0]] = numMatches[j]
        }
      }
    } else if (currentSection === 'positionClosed' || currentSection === 'transactionRecords') {
      // 平仓明细 || 成交记录
      if (line.length === 0 || line.replace(/-/g, '') === '') {
        currentSection = '' // 当前table处理完
        continue
      }
      const colNames = tableStates[currentSection].colNames
      const contents = _genList(line)
      const data = _genItem(colNames, contents)

      if (colNames.length !== contents.length && currentSection === 'transactionRecords') {
        const indexLots = colNames.indexOf('Lots')
        const indexFee = colNames.indexOf('Fee')
        for (let i = 1; i < contents.length; i++) {
          if (/^\d+$/.test(contents[i])) {
            data.Lots = contents[i]
            data.Fee = contents[i + (indexFee - indexLots)]
            break
          }
        }
      }
      result[currentSection].push(data)
    }
  }
  return result
}

export {
  UnifyArrayStyle,
  IsEmptyObject,
  RandomStr,
  ParseSettlementContent
}
