import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import VolumeList from './VolumeList'
import VolumeFilter from './VolumeFilter'
import CreateVolume from './CreateVolume'
import AttachHost from './AttachHost'

function Volume({ host, volume, location, loading, dispatch }) {
  const { data, createVolumeModalVisible, attachHostModalVisible } = volume
  const hosts = host.data
  const { field, keyword } = location.query

  const volumeListProps = {
    dataSource: data,
    loading,
    showAttachHost() {
      dispatch({
        type: 'volume/showAttachHostModal',
      })
    },
  }

  const volumeFilterProps = {
    hosts,
    field,
    location,
    keyword,
    onSearch(fieldsValue) {
      fieldsValue.keyword.length ? dispatch(routerRedux.push({
        pathname: '/volume',
        query: {
          ...location.query,
          field: fieldsValue.field,
          keyword: fieldsValue.keyword,
        },
      })) : dispatch(routerRedux.push({
        pathname: '/volume',
        query: {
          host: location.query.host,
        },
      }))
    },
    onSelect(selectedHost) {
      selectedHost ? dispatch(routerRedux.push({
        pathname: '/volume',
        query: {
          ...location.query,
          host: selectedHost,
        },
      })) : dispatch(routerRedux.push({
        pathname: '/volume',
        query: {
          field: location.query.field,
          keyword: location.query.keyword,
        },
      }))
    },
    onAdd() {
      dispatch({
        type: 'volume/showCreateVolumeModal',
      })
    },
  }

  const attachHostModalProps = {
    item: {
    },
    visible: attachHostModalVisible,
    hosts,
    onOk(newVolume) {
      dispatch({
        type: 'volume/attachHost',
        payload: newVolume,
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideAttachHostModal',
      })
    },
  }

  const createVolumeModalProps = {
    item: {
      replicaNum: 2,
      size: 20,
      iops: 1000,
      frontend: 'iscsi',
    },
    hosts,
    visible: createVolumeModalVisible,
    onOk(newVolume) {
      dispatch({
        type: 'volume/createVolume',
        payload: newVolume,
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideCreateVolumeModal',
      })
    },
  }

  const CreateVolumeGen = () =>
    <CreateVolume {...createVolumeModalProps} />

  const AttachHostGen = () =>
    <AttachHost {...attachHostModalProps} />

  return (
    <div className="content-inner" >
      <VolumeFilter {...volumeFilterProps} />
      <VolumeList {...volumeListProps} />
      <CreateVolumeGen />
      <AttachHostGen />
    </div>
  )
}

Volume.propTypes = {
  volume: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
  host: PropTypes.object,
}

export default connect(({ host, volume, loading }) => ({ host, volume, loading: loading.models.volume }))(Volume)
