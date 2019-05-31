import Vue from 'vue';

/**
 * 买卖大集订单状态显示格式化
 * @param {int} 订单状态
 * return 订单状态说明
 */
export const formatOrderStatus = (orderStatus) => {
  var statusText = '';
  if (orderStatus == 0) {
    statusText = '未支付';
  } else if (orderStatus == 1) {
    statusText = '已取消';
  } else if (orderStatus == 2) {
    statusText = '过期未支付';
  } else if (orderStatus == 3) {
    statusText = '已支付';
  } else if (orderStatus == 4) {
    statusText = '发货前退单';
  } else if (orderStatus == 5) {
    statusText = '商家确认发货';
  } else if (orderStatus == 6) {
    statusText = '买家已确认';
  } else if (orderStatus == 7) {
    statusText = '收货后退单';
  } else if (orderStatus == 8) {
    statusText = '已完成';
  }
  return statusText;
};

/**
 * 买卖大集支付方式显示格式化
 * @param {int} 支付方式
 * return 支付方式说明
 */
export const formatPayType = (payType) => {
  var payTypeText = '';
  if (payType == 1) {
    payTypeText = '微信';
  } else if (payType == 2) {
    payTypeText = '支付宝';
  } else if (payType == 3) {
    payTypeText = '提货卡';
  }
  return payTypeText;
};

/**
 *买卖大集支付方式下拉框格式化集合
 */
export const payTypes = [{
  value: '1',
  label: '微信'
}, {
  value: '2',
  label: '支付宝'
}, {
  value: '3',
  label: '提货卡'
}];

/**
 * 买卖大集订单状态下拉框格式化集合
 */
export const orderStatus = [{
  value: '0',
  label: '未支付'
}, {
  value: '1',
  label: '未支付已取消'
}, {
  value: '2',
  label: '支付过期'
}, {
  value: '3',
  label: '已支付'
}, {
  value: '4',
  label: '发货前退单'
}, {
  value: '5',
  label: '商家确认发货'
}, {
  value: '6',
  label: '买家已确认'
}, {
  value: '7',
  label: '收货后退单'
}, {
  value: '8',
  label: '已完成'
}];

/**
 *快递公司下拉框格式集合
 */
export const expressSuppliersList = [{
  label: '顺丰速运',
  value: '1'
}, {
  label: '中通快递',
  value: '2'
}, {
  label: '申通快递',
  value: '3'
}, {
  label: '圆通快递',
  value: '4'
}, {
  label: '韵达快递',
  value: '5'
}, {
  label: '百世汇通',
  value: '6'
}, {
  label: '邮政EMS',
  value: '7'
}, {
  label: '德邦物流',
  value: '8'
}, {
  label: '天天快递',
  value: '9'
}, {
  label: '宅急送',
  value: '10'
}];