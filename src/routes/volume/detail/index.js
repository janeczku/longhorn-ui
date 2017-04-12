import React, { PropTypes } from 'react'
import { connect } from 'dva'
import VolumeInfo from './VolumeInfo'
import VolumeReplicas from './VolumeReplicas'
import { Row, Col } from 'antd'
import { routerRedux } from 'dva/router'
import VolumeActions from '../VolumeActions'
import styles from './index.less'
import AttachHost from '../AttachHost'
import Recurring from '../Recurring'

function VolumeDetail({ dispatch, host, volume, volumeId, loading }) {
  const { data, attachHostModalVisible, recurringModalVisible } = volume
  const hosts = host.data
  const selectedVolume = data.find(item => item.id === volumeId)
  if (!selectedVolume) {
    return (<div></div>)
  }
  const found = hosts.find(h => selectedVolume.controller && h.id === selectedVolume.controller.hostId)
  if (found) {
    selectedVolume.host = found.name
  }
  selectedVolume.replicas.forEach(replica => {
    replica.host = hosts.find(h => h.id === replica.hostId).name
  })
  const replicasListProps = {
    dataSource: selectedVolume.replicas || [],
    loading,
  }


  const volumeActionsProps = {
    takeSnapshot(record) {
      dispatch({
        type: 'volume/actions',
        payload: {
          url: record.actions.snapshotCreate,
          params: {
            name: '',
          },
        },
      })
    },
    showAttachHost(record) {
      dispatch({
        type: 'volume/showAttachHostModal',
        payload: {
          selected: record,
        },
      })
    },
    showSnapshots(record) {
      dispatch(routerRedux.push({
        pathname: `/volume/${record.name}/snapshots`,
      }))
    },
    showRecurring(record) {
      dispatch({
        type: 'volume/showRecurringModal',
        payload: {
          selected: record,
        },
      })
    },
    deleteVolume(record) {
      dispatch({
        type: 'volume/delete',
        payload: record,
      })
    },
    detach(url) {
      dispatch({
        type: 'volume/detach',
        payload: {
          url,
        },
      })
    },
    showBackups(record) {
      dispatch(routerRedux.push({
        pathname: '/backup',
        query: {
          field: 'volumeName',
          keyword: record.name,
        },
      }))
    },
  }

  const recurringModalProps = {
    item: selectedVolume,
    visible: recurringModalVisible,
    onOk(recurring, url) {
      dispatch({
        type: 'volume/recurringUpdate',
        payload: {
          recurring,
          url,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideRecurringModal',
      })
    },
  }

  const attachHostModalProps = {
    item: selectedVolume,
    visible: attachHostModalVisible,
    hosts,
    onOk(selectedHost, url) {
      dispatch({
        type: 'volume/attach',
        payload: {
          host: selectedHost,
          url,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideAttachHostModal',
      })
    },
  }

  return (
    <div>
      <Row gutter={24}>
        <Col md={{ offset: 16, span: 8 }} style={{ marginBottom: 16, textAlign: 'right' }}>
          <VolumeActions {...volumeActionsProps} selected={selectedVolume} />
        </Col>
        <Col lg={8} md={24} className={styles.col}>
          <VolumeInfo selectedVolume={selectedVolume} />
        </Col>
        <Col lg={16} md={24}>
          <VolumeReplicas {...replicasListProps} />
        </Col>
      </Row>
      {attachHostModalVisible && <AttachHost {...attachHostModalProps} />}
      {recurringModalVisible && <Recurring {...recurringModalProps} />}
    </div>
  )
}

VolumeDetail.propTypes = {
  volume: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  host: PropTypes.object,
  volumeId: PropTypes.string,
  loading: PropTypes.bool,
}

export default connect(({ host, volume, loading }, { params }) => ({ host, volume, loading: loading.models.volume, volumeId: params.id }))(VolumeDetail)