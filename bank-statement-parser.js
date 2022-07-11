const fs = require('node:fs/promises')

const getFromType = (entities, type) => {
  const value = entities.filter(e => e.type === type)
    .sort((a, b) => b.confidence - a.confidence)
    .shift()
  return value ?
    { value: value.mentionText, confidence: value.confidence }
    : null
}

const getStatements = (entities) => {
  const statements = entities.filter(e => e.type === 'table_item')
  return statements.map(s => {
    const withdrawal = {
      date: getFromType(s.properties, 'table_item/transaction_withdrawal_date'),
      description: getFromType(s.properties, 'table_item/transaction_withdrawal_description'),
      value: getFromType(s.properties, 'table_item/transaction_withdrawal')
    }
    const deposit = {
      date: getFromType(s.properties, 'table_item/transaction_deposit_date'),
      description: getFromType(s.properties, 'table_item/transaction_deposit_description'),
      value: getFromType(s.properties, 'table_item/transaction_deposit')
    }
    if (withdrawal.value === null && deposit.value !== null)
      return { ...deposit, type: 'deposit' }
    if (withdrawal.value !== null && deposit.value === null)
      return { ...withdrawal, type: 'withdrawal' }
    return null
  })
}

const parse = (content) => {
  return {
    client: {
      name: getFromType(content.entities, 'client_name'),
      address: getFromType(content.entities, 'client_address')
    },
    bank: {
      name: getFromType(content.entities, 'bank_name'),
      address: getFromType(content.entities, 'bank_address')
    },
    account: {
      number: getFromType(content.entities, 'account_number'),
      type: getFromType(content.entities, 'account_type'),
      ending_balance: getFromType(content.entities, 'ending_balance'),
      starting_balance: getFromType(content.entities, 'starting_balance')
    },
    statements: getStatements(content.entities)
  }
}

module.exports = { parse }