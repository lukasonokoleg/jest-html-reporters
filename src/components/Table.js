import React from 'react'
import { Table, Icon, Tag, message } from 'antd'
import copy from 'copy-to-clipboard'
import { getRecordClass, getFormatTime, getExistKeys } from '@/untils'
import DetailTable from './DetailTable'
import ErrorButton from './ErrorButton'

// export const file = '/Users/harry.hou/Desktop/harry/salesforce/salesforce-cti-widget/'
import { Consumer } from '../contexts/expand'

const renderStatus = ({
  numPassingTests,
  numFailingTests,
  numPendingTests,
  numTodoTests,
  testExecError,
}) => {
  let tagsInfo
  if (
    testExecError
  ) {
    tagsInfo = <span style={{ color: '#52c41a' }}>
      <Tag color='#cf1322' className='one_tag'>
        Exec Error
        <span />
        <Icon type='close' theme='outlined' />
      </Tag>
    </span>
  } else if (numFailingTests === 0 && numPendingTests === 0) {
    tagsInfo = <span style={{ color: '#52c41a' }}>
      <Tag color='#52c41a' className='one_tag'>
        All Passed
        <span>{numPassingTests}</span>
        <Icon type='check' theme='outlined' />
      </Tag>
    </span>
  } else {
    tagsInfo = <span>
      <Tag color='#52c41a'>{numPassingTests}</Tag>
      {!!numFailingTests && <Tag color='#cf1322'>{numFailingTests}</Tag>}
      {!!numPendingTests && <Tag color='#faad14'>{numPendingTests}</Tag>}
      {!!numTodoTests && <Tag color='#d466d6'>{numTodoTests}</Tag>}
    </span>
  }

  return (
    <div className='mian_table_tags'>
      {tagsInfo}
    </div>
  )
}

const renderTime = ({
  perfStats: { start, end }
}) => getFormatTime(start, end)

const getColumns = (rootDir) => [
  {
    title: 'File',
    dataIndex: 'testFilePath',
    key: 'name',
    render: text => {
      const relativePath = text.replace(new RegExp('^' + rootDir), '')
      return <span>
        <span className='copy_icon' title='click to copy path to clipborad'>
          <Icon type='file' theme='twoTone'
            onClick={() => {
              const execCommand = 'npx jest .' + relativePath
              copy(execCommand)
              message.success('Copy succeed! The command has been copied to the clipboard.')
            }} />
        </span>
        <span className='path_text' id={text} > {relativePath}</span>
        <span className='path_text' id={text} > {rootDir}</span>
      </span>
    }
  },
  {
    title: 'UseTime',
    key: 'UseTime',
    render: renderTime,
    width: '150px',
    sorter: (a, b) => (a.perfStats.end - a.perfStats.start) - (b.perfStats.end - b.perfStats.start),
  },
  { title: 'Status',
    key: 'status',
    render: renderStatus,
    width: '150px',
    filters: [
      { text: 'Passed', value: 'passed' },
      { text: 'Failed', value: 'failed' },
      { text: 'Pending', value: 'pending' },
      { text: 'Todo', value: 'todo' },
      { text: 'Not Passed', value: 'noPass' },
    ],
    filterMultiple: false,
    onFilter: (value, { numFailingTests,
      numPendingTests, testExecError, numTodoTests }) => {
      switch (value) {
        case 'passed':
          return !(testExecError || numFailingTests > 0 || numPendingTests > 0)
        case 'failed':
          return testExecError || numFailingTests > 0
        case 'pending':
          return numPendingTests > 0
        case 'todo':
          return numTodoTests > 0
        case 'noPass':
          return (testExecError || numFailingTests > 0 || numPendingTests > 0)
      }
    },
  },
  {
    width: '100px',
    title: 'Action',
    key: 'operation',
    render: ({ failureMessage }) => <ErrorButton failureMessage={failureMessage} />
  },
]

const TableItem = ({ testResults, config: { rootDir }, globalExpandState }) =>
  <Consumer>
    {
      ({ expand, toggleExpand }) =>
        <Table
          size='small'
          pagination={false}
          rowKey='testFilePath'
          rowClassName={({ numFailingTests, numPendingTests, numTodoTests, testExecError }, index) => {
            let status = ''
            if (testExecError) status = 'failed'
            else if (numFailingTests) status = 'failed'
            else if (numPendingTests) status = 'pending'
            else if (numTodoTests) status = 'todo'
            return getRecordClass(status, index)
          }}
          expandedRowRender={
            ({ testResults }) => <DetailTable data={testResults} />
          }
          expandedRowKeys={getExistKeys(expand, globalExpandState)}
          onExpand={(state, { testFilePath }) => toggleExpand({ key: testFilePath, state })}
          columns={getColumns(rootDir)}
          dataSource={testResults} />
    }
  </Consumer>

export default TableItem
